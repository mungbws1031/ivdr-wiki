// =====================================================================
// src/lib/trace.ts
// 추적성 매트릭스 — 요구사항(REQ) ↔ 위험(RSK) ↔ 검증(VFY) ↔ 증거(EVD). 순수 함수.
// 스펙·위해요인 표·실험계획·결과 입력을 ID로 잇는다. 자동 연결은 '후보'이고 사람이 행마다 검토해 확정한다.
// 확정 뒤 요구사항 문구가 바뀌면 '의심(재검토)'으로 표시한다. 수치는 스펙 값만 쓴다.
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import { composeIntendedPurpose } from "../data/spec/validate";
import { hazards } from "./drafts";
import { planStudies, type StudyPlan } from "./planner";
import type { ResultsMap } from "./results";
import { hasTransportInput } from "./transport";

export type ReqCategory = "사용자 요구" | "성능" | "안정성" | "검체" | "사용적합성" | "안전" | "기타";
export interface TraceReq { id: string; category: ReqCategory; text: string; source: string | null; missingValue: boolean; vfy: string[]; custom: boolean }
export interface TraceRisk { id: string; hazard: string; controls: string; vfy: string[]; docs: string[] }
export interface TraceVfy { id: string; studyId: string; title: string; status: StudyPlan["status"]; verdict: "pass" | "fail" | "in-progress" | null; date: string | null; rawRef: string | null }
export interface TraceRow { req: TraceReq; risks: string[]; vfy: TraceVfy[]; reviewed: boolean; suspect: boolean; removed: string[] }
export type GapLevel = "high" | "mid" | "info";
export interface TraceGap { level: GapLevel; ref: string; text: string; fix: { kind: "field" | "results" | "trace"; path?: string } }
export interface TraceStore {
  /** 검토한 요구사항 → 그때 문구 해시 */
  reviewed: Record<string, string>;
  /** 끈 자동 연결 "REQ|VFY" / 수동 추가 연결 "REQ|VFY" */
  removed: string[];
  added: string[];
  custom: { id: string; category: ReqCategory; text: string }[];
}
export const emptyTraceStore = (): TraceStore => ({ reviewed: {}, removed: [], added: [], custom: [] });

export interface Trace {
  rows: TraceRow[];
  risks: (TraceRisk & { reqs: string[] })[];
  vfys: TraceVfy[];
  gaps: TraceGap[];
  coverage: { reqWithVfy: number; reqVerified: number; riskWithVfy: number; reviewed: number; reqTotal: number; riskTotal: number };
}

/** 짧은 문구 해시 (FNV-1a) — 검토 뒤 문구가 바뀌었는지 비교 */
export function textHash(t: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16);
}

const v = (x: number | string | null | undefined, unit = "") => (x === null || x === undefined || x === "" ? null : `${x}${unit}`);
const MISSING = (label: string) => `[${label} 미입력]`;

/** 스펙에서 요구사항을 만든다 — 연결할 실험 id 목록과 출처 칸 */
function specReqs(s: ProductSpec): Omit<TraceReq, "vfy" | "custom">[] {
  const lay = s.user === "lay" || s.user === "both";
  const quant = s.result.kind === "quantitative" || s.result.kind === "semi-quantitative";
  const t = s.targets, st = s.storage;
  const out: (Omit<TraceReq, "vfy" | "custom"> & { studies?: string[] })[] = [];
  const add = (id: string, category: ReqCategory, text: string, source: string | null, missingValue: boolean) => out.push({ id, category, text, source, missingValue });
  add("REQ-UN-001", "사용자 요구", composeIntendedPurpose(s), "intendedPurpose.clinicalDecision", !s.intendedPurpose.clinicalDecision);
  add("REQ-PERF-001", "성능", `임상 민감도(양성 일치율) ≥ ${v(t.sensitivity, "%") ?? MISSING("목표 민감도")}${t.confidence ? ` (신뢰수준 ${t.confidence}%)` : ""}`, "targets.sensitivity", t.sensitivity === null);
  add("REQ-PERF-002", "성능", `임상 특이도(음성 일치율) ≥ ${v(t.specificity, "%") ?? MISSING("목표 특이도")}${t.confidence ? ` (신뢰수준 ${t.confidence}%)` : ""}`, "targets.specificity", t.specificity === null);
  if (quant) add("REQ-PERF-003", "성능", "측정 성능 — 검출 한계·정밀도·직선성·진실성이 사양을 만족 [허용 오차 — 사양 입력]", "result.kind", false);
  else add("REQ-PERF-003", "성능", `cut-off ${v(s.analyte.cutoffValue) ?? MISSING("cut-off")} ${s.analyte.cutoffUnit ?? ""}에서 양성/음성을 가른다 (C5–C95 범위 확인)`.replace(/\s+/g, " ").trim(), "analyte.cutoffValue", s.analyte.cutoffValue === null);
  add("REQ-PERF-004", "성능", `교차반응·간섭 물질이 결과를 바꾸지 않는다${quant ? "" : " (고농도 hook 효과 포함)"}`, null, false);
  add("REQ-STAB-001", "안정성", `${v(st.tempMinC) !== null && v(st.tempMaxC) !== null ? `${st.tempMinC}–${st.tempMaxC}℃ 보관 시 ` : `${MISSING("보관 온도")} 보관 시 `}${v(st.shelfLifeMonths, "개월") ?? MISSING("유효기간")} 동안 성능 유지`, "storage.shelfLifeMonths", st.shelfLifeMonths === null || st.tempMinC === null || st.tempMaxC === null);
  add("REQ-STAB-002", "안정성", `개봉 후 ${v(st.openedStabilityMin, "분") ?? MISSING("개봉 후 안정성")} 이내 사용 시 성능 유지`, "storage.openedStabilityMin", st.openedStabilityMin === null);
  if (hasTransportInput(s)) add("REQ-STAB-003", "안정성", "운송 조건(온도·진동·낙하) 노출 뒤에도 성능 유지", "transport.modes", false);
  if (s.specimen) add("REQ-SPC-001", "검체", "채취 후 정한 보관 조건·시간 안에서 검체 결과가 바뀌지 않는다 [보관 시간 — 사양 입력]", "specimen", false);
  if (lay) add("REQ-USE-001", "사용적합성", "일반인이 사용설명서만으로 검체 적용·판독·해석을 바르게 한다", "user", false);
  if (s.specimen === "capillary-blood" || s.specimen === "swab") add("REQ-BIO-001", "안전", "피부·점막에 닿는 구성품이 생물학적으로 안전하다", "specimen", false);
  return out;
}

/** 요구사항 → 연결 후보 실험 id */
const REQ_STUDIES: Record<string, string[]> = {
  "REQ-UN-001": ["clinical-performance"],
  "REQ-PERF-001": ["clinical-performance"],
  "REQ-PERF-002": ["clinical-performance"],
  "REQ-PERF-003": ["cutoff-precision", "lod", "precision", "linearity", "method-comparison"],
  "REQ-PERF-004": ["cross-reactivity", "interference", "hook"],
  "REQ-STAB-001": ["stability-realtime", "stability-accelerated"],
  "REQ-STAB-002": ["stability-in-use"],
  "REQ-STAB-003": ["stability-transport"],
  "REQ-SPC-001": ["specimen-stability"],
  "REQ-USE-001": ["usability", "usability-formative", "usability-summative"],
  "REQ-BIO-001": ["biocompatibility"],
};

const GENERIC_DOCS = new Set(["ifu", "labelling-spec"]);

export function buildTrace(s: ProductSpec, results: ResultsMap, store: TraceStore): Trace {
  const plans = planStudies(s).filter((p) => p.status !== "excluded");
  const vfys: TraceVfy[] = plans.map((p) => {
    const r = results[p.id];
    return { id: `VFY-${p.id}`, studyId: p.id, title: p.title, status: p.status, verdict: r?.verdict ?? null, date: r?.date ?? null, rawRef: r?.rawRef ?? null };
  });
  const vById = new Map(vfys.map((x) => [x.id, x]));
  const removed = new Set(store.removed);

  const reqs: TraceReq[] = [
    ...specReqs(s).map((r) => ({ ...r, custom: false, vfy: (REQ_STUDIES[r.id] ?? []).map((id) => `VFY-${id}`).filter((id) => vById.has(id)) })),
    ...store.custom.map((c) => ({ id: c.id, category: c.category, text: c.text, source: null, missingValue: !c.text.trim(), custom: true, vfy: [] as string[] })),
  ].map((r) => {
    const auto = r.vfy.filter((id) => !removed.has(`${r.id}|${id}`));
    const manual = store.added.filter((k) => k.startsWith(`${r.id}|`)).map((k) => k.split("|")[1]).filter((id) => vById.has(id) && !auto.includes(id));
    return { ...r, vfy: [...auto, ...manual] };
  });

  const risks: (TraceRisk & { reqs: string[] })[] = hazards(s).map((h) => {
    // 사용설명서·라벨은 거의 모든 시험이 결과를 넣는 문서라 연결 근거로 쓰지 않는다 (잘못된 연결 방지)
    const specific = h.verify.filter((d) => !GENERIC_DOCS.has(d));
    const vfy = plans.filter((p) => p.docs.some((d) => specific.includes(d))).map((p) => `VFY-${p.id}`);
    return { id: h.id.replace(/^R-/, "RSK-"), hazard: h.hazard, controls: h.controls, vfy, docs: h.verify, reqs: [] };
  });
  for (const rk of risks) rk.reqs = reqs.filter((r) => r.vfy.some((x) => rk.vfy.includes(x))).map((r) => r.id);

  const rows: TraceRow[] = reqs.map((r) => {
    const h = store.reviewed[r.id];
    return {
      req: r, risks: risks.filter((rk) => rk.reqs.includes(r.id)).map((rk) => rk.id), vfy: r.vfy.map((id) => vById.get(id)!),
      reviewed: !!h && h === textHash(r.text), suspect: !!h && h !== textHash(r.text),
      removed: store.removed.filter((k) => k.startsWith(`${r.id}|`)).map((k) => k.split("|")[1]),
    };
  });

  const gaps: TraceGap[] = [];
  for (const row of rows) {
    const r = row.req;
    if (r.missingValue) gaps.push({ level: "high", ref: r.id, text: `${r.id}: 요구사항 값이 비어 있습니다`, fix: r.source ? { kind: "field", path: r.source } : { kind: "trace" } });
    if (!row.vfy.length) gaps.push({ level: "high", ref: r.id, text: `${r.id}: 검증(시험)이 연결되지 않았습니다`, fix: { kind: "trace" } });
    if (row.vfy.some((x) => x.verdict === "fail")) gaps.push({ level: "high", ref: r.id, text: `${r.id}: 검증 결과 FAIL이 있습니다`, fix: { kind: "results" } });
    if (row.suspect) gaps.push({ level: "mid", ref: r.id, text: `${r.id}: 검토 후 요구사항이 바뀌었습니다 — 연결 재검토`, fix: { kind: "trace" } });
    if (!row.risks.length && !r.custom) gaps.push({ level: "info", ref: r.id, text: `${r.id}: 연결된 위험이 없습니다 (위험과 무관한지 확인)`, fix: { kind: "trace" } });
  }
  for (const rk of risks) if (!rk.vfy.length) gaps.push({ level: "mid", ref: rk.id, text: `${rk.id} ${rk.hazard}: 검증 실험이 없습니다 — 문서(${rk.docs.join(", ")})로만 검증`, fix: { kind: "trace" } });
  for (const x of vfys) if (!x.verdict && rows.some((r) => r.vfy.includes(x))) gaps.push({ level: "info", ref: x.id, text: `${x.id}: 증거(결과)가 아직 없습니다`, fix: { kind: "results" } });

  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
  return {
    rows, risks, vfys, gaps: gaps.sort((a, b) => ["high", "mid", "info"].indexOf(a.level) - ["high", "mid", "info"].indexOf(b.level)),
    coverage: {
      reqTotal: rows.length, riskTotal: risks.length,
      reqWithVfy: pct(rows.filter((r) => r.vfy.length).length, rows.length),
      reqVerified: pct(rows.filter((r) => r.vfy.length && r.vfy.every((x) => x.verdict === "pass")).length, rows.length),
      riskWithVfy: pct(risks.filter((r) => r.vfy.length).length, risks.length),
      reviewed: pct(rows.filter((r) => r.reviewed).length, rows.length),
    },
  };
}

/** CSV (엑셀용 UTF-8 BOM) */
export function traceCsv(t: Trace): string {
  const q = (x: string) => `"${x.replace(/"/g, '""')}"`;
  const head = ["REQ", "분류", "요구사항", "RSK", "VFY", "증거", "검토"];
  const lines = t.rows.map((r) => [r.req.id, r.req.category, r.req.text, r.risks.join(" "), r.vfy.map((x) => x.id).join(" "),
    r.vfy.map((x) => `${x.id}:${x.verdict ?? "미입력"}`).join(" "), r.suspect ? "재검토" : r.reviewed ? "검토함" : "미검토"].map(q).join(","));
  return "﻿" + [head.map(q).join(","), ...lines].join("\r\n");
}
