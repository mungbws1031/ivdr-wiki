// =====================================================================
// src/lib/nextActions.ts
// 결과 한눈에 맨 위 "지금 할 일 3개" — 가장 많이 막고 있는 결정·빈 칸부터. 순수 함수.
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import type { FieldDef } from "../data/spec/fields";
import { unresolvedFields } from "../data/spec/validate";
import type { ClassResult } from "./rules/classify";

export interface NextAction {
  title: string;
  why: string;
  /** 스펙 칸이면 경로, 아니면 화면 경로 */
  field?: string;
  to?: string;
}

const CLASS_STATUS: Record<string, string> = { blocked: "등급 판정이 멈춰 있어요", "needs-review": "등급 판정이 보류됐어요", provisional: "등급이 아직 잠정이에요" };

export function nextActions(
  spec: ProductSpec,
  cls: ClassResult,
  opts: { confirmed: boolean; classAssumed: boolean; resultsEntered: number; resultsTotal: number },
  limit = 3,
): NextAction[] {
  const out: NextAction[] = [];
  const missing = unresolvedFields(spec);
  const byPath = new Map(missing.map((f) => [f.path, f]));

  // 1) 등급을 막는 빈 칸
  for (const p of cls.openQuestions) {
    const f = byPath.get(p);
    if (!f) continue;
    out.push({ title: `${f.label} 적기`, why: `${CLASS_STATUS[cls.status] ?? "등급에 영향을 줘요"} — 문서 ${f.usedBy.length}개에도 쓰여요`, field: p });
    byPath.delete(p);
  }
  // 2) 많이 막는 빈 칸
  const rest: FieldDef[] = [...byPath.values()].sort((a, b) => b.usedBy.length - a.usedBy.length);
  const blockers = rest.filter((f) => f.usedBy.length > 0).slice(0, 2);

  // 3) 클래스 확정 — 가정으로 나온 등급은 확정할 수 없다
  const canConfirm = !!cls.value && !opts.confirmed && !opts.classAssumed && cls.status === "recommended";
  const confirmItem: NextAction | null = canConfirm
    ? { title: `Class ${cls.value} 확인하고 확정`, why: "확정해야 등급이 문서에 '확정'으로 들어가요", to: "/auto/docs" }
    : null;

  if (confirmItem && out.length === 0 && blockers.length === 0) out.push(confirmItem);
  for (const f of blockers) out.push({ title: `${f.label} 적기`, why: `문서 ${f.usedBy.length}개가 이 칸을 기다려요`, field: f.path });
  if (confirmItem && !out.includes(confirmItem)) out.push(confirmItem);

  // 4) 실험 결과
  if (opts.resultsTotal > 0 && opts.resultsEntered === 0)
    out.push({ title: "실험 결과 적기", why: `실험 ${opts.resultsTotal}개의 결과를 적어야 성능 문서가 채워져요`, to: "/auto/results" });

  return out.slice(0, limit);
}
