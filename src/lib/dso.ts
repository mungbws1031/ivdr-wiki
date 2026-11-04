// =====================================================================
// src/lib/dso.ts
// 설계 출력 개체(DSO: BOM·부품·PCB·펌웨어/앱·도면) 추적성. 순수 함수.
// DSO → REQ(수동 연결) → RSK·VFY(trace.ts가 이미 계산) → RSK.docs(문서 id) → 문서 섹션
// 을 영향 후보로 만든다. 리비전이 바뀌면 판정 키가 더 이상 맞지 않아 "판정 필요"로 돌아간다.
// =====================================================================

import { resolveDoc } from "../data/documents";
import type { Trace } from "./trace";

export type DsoKind = "bom" | "part" | "pcb" | "firmware" | "app" | "drawing";
export const DSO_KIND_LABEL: Record<DsoKind, string> = {
  bom: "BOM", part: "부품", pcb: "PCB 리비전", firmware: "펌웨어", app: "앱 버전", drawing: "도면",
};

export interface Dso {
  id: string;
  kind: DsoKind;
  name: string;
  revision: string;
  reqs: string[]; // 연결된 REQ id
  /** 이 DSO에 몇 번째 변경(0 = 최초 등록)까지 일어났는지 — 판정 키의 기준. 리비전 "이름"이 아니라 "변경 사건 수"로 재검토를 유도한다 */
  revSeq: number;
}

export interface DsoChange {
  id: string;
  dsoId: string;
  revision: string; // 바뀐 뒤 리비전
  reason: string;
  author: string;
  date: string; // YYYY-MM-DD
  /** 해당 DSO 내에서 이 변경의 순번(0 = 최초 등록) — verdictKey/CSV 매칭 기준 */
  seq: number;
}

export type DsoVerdict = "impact" | "no-impact" | "retest" | "review";
export const DSO_VERDICT_LABEL: Record<DsoVerdict, string> = {
  impact: "영향 있음", "no-impact": "영향 없음", retest: "재시험 필요", review: "재검토 필요",
};

export interface DsoStore {
  dsos: Dso[];
  changes: DsoChange[];
  /** 판정 키 "<dso.id>@<dso.revSeq>|<kind>:<ref>" → 판정 */
  verdicts: Record<string, DsoVerdict>;
  /** 지금까지 등록된 DSO 번호의 다음 값 — 삭제돼도 절대 줄거나 재사용되지 않는다 */
  nextDsoNum: number;
}
export const emptyDsoStore = (): DsoStore => ({ dsos: [], changes: [], verdicts: {}, nextDsoNum: 1 });

export type ImpactKind = "req" | "risk" | "vfy" | "doc";
export interface DsoImpact { kind: ImpactKind; ref: string; label: string; verdict: DsoVerdict | null }

/** 판정 키 — revSeq(변경 횟수)가 기준이라, 리비전 이름을 이전 값으로 되돌려도(A→B→A) 새 변경 사건으로 취급돼 재검토 상태가 된다 */
export function verdictKey(dso: Dso, kind: ImpactKind, ref: string): string {
  return `${dso.id}@${dso.revSeq}|${kind}:${ref}`;
}

/** DSO에 연결된 REQ들에서 RSK·VFY·문서섹션까지 영향 후보를 만든다 */
export function buildDsoImpact(dso: Dso, trace: Trace, store: DsoStore): DsoImpact[] {
  const out: DsoImpact[] = [];
  const seen = new Set<string>();
  const push = (kind: ImpactKind, ref: string, label: string) => {
    const dedupeKey = `${kind}:${ref}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    out.push({ kind, ref, label, verdict: store.verdicts[verdictKey(dso, kind, ref)] ?? null });
  };

  const rows = trace.rows.filter((r) => dso.reqs.includes(r.req.id));
  for (const row of rows) {
    push("req", row.req.id, row.req.text);
    for (const riskId of row.risks) {
      const rk = trace.risks.find((x) => x.id === riskId);
      push("risk", riskId, rk?.hazard ?? riskId);
      if (rk) for (const docId of rk.docs) {
        const doc = resolveDoc(docId);
        push("doc", docId, doc?.docTitle ?? docId);
      }
    }
    for (const vfy of row.vfy) push("vfy", vfy.id, vfy.title);
  }
  return out;
}

/** CSV (엑셀용 UTF-8 BOM) — traceCsv와 같은 포맷 */
export function dsoChangeCsv(dsos: Dso[], changes: DsoChange[], verdicts: Record<string, DsoVerdict>): string {
  // 셀 값이 =,+,-,@로 시작하면 수식으로 해석될 수 있어 작은따옴표를 붙여 무력화(CSV 수식 인젝션 방어)
  const sanitize = (x: string) => (/^[=+\-@]/.test(x) ? `'${x}` : x);
  const q = (x: string) => `"${sanitize(x).replace(/"/g, '""')}"`;
  const dsoById = new Map(dsos.map((d) => [d.id, d]));
  const head = ["DSO", "종류", "이름", "리비전", "변경 사유", "작성자", "날짜", "판정 요약"];
  const lines = changes.map((c) => {
    const d = dsoById.get(c.dsoId);
    const prefix = `${c.dsoId}@${c.seq}|`;
    const vs = Object.entries(verdicts).filter(([k]) => k.startsWith(prefix)).map(([, v]) => v);
    const summary = vs.length ? vs.map((v) => DSO_VERDICT_LABEL[v]).join(" / ") : "판정 없음";
    return [c.dsoId, d ? DSO_KIND_LABEL[d.kind] : "", d?.name ?? "", c.revision, c.reason, c.author, c.date, summary].map(q).join(",");
  });
  return "﻿" + [head.map(q).join(","), ...lines].join("\r\n");
}
