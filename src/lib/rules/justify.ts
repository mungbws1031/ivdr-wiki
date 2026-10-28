// =====================================================================
// src/lib/rules/justify.ts
// 등급 정당화 표 — Rule 1~7을 모두 평가해 규칙마다 해당·비해당·모름과 이유를 남긴다.
// Rule 6(나머지 규칙)은 Rule 1~5가 왜 비해당인지 기록된 뒤에만 해당으로 본다.
// 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import type { ClassResult, IvdClass } from "./classify";

export type RuleVerdict = "applies" | "not" | "unknown";

export interface RuleRow {
  rule: string;
  verdict: RuleVerdict;
  cls: IvdClass | null;
  reason: string;
  /** 답이 필요한 스펙 칸 (verdict 가 unknown 일 때) */
  fields: string[];
}

export const RULE_VERDICT_LABEL: Record<RuleVerdict, string> = { applies: "해당", not: "비해당", unknown: "답변 필요" };

export function ruleJustification(s: ProductSpec): RuleRow[] {
  const f = s.rule1to3Flags;
  const rows: RuleRow[] = [];
  const row = (rule: string, verdict: RuleVerdict, cls: IvdClass | null, reason: string, fields: string[] = []) =>
    rows.push({ rule, verdict, cls, reason, fields });

  // Rule 1
  if (f.transmissibleAgent === null) row("Rule 1", "unknown", null, "감염병(전파성 병원체) 검출 여부가 답해지지 않았습니다.", ["rule1to3Flags.transmissibleAgent"]);
  else if (f.transmissibleAgent) row("Rule 1", "applies", null, "감염병 검출 제품 — 전파 위험도에 따라 D(Rule 1) 또는 C(Rule 3). RA 판단 필요");
  else row("Rule 1", "not", null, "전파성 병원체·수혈·이식 안전성 표지자를 검출하지 않음");

  // Rule 2
  const r2Missing = [f.bloodGrouping === null && "rule1to3Flags.bloodGrouping", f.tissueTyping === null && "rule1to3Flags.tissueTyping"].filter(Boolean) as string[];
  if (f.bloodGrouping || f.tissueTyping) row("Rule 2", "applies", "C", "혈액형·조직 적합성 판정 (ABO·Rh 등 일부 표지자는 D — 표지자 확인 필요)");
  else if (r2Missing.length) row("Rule 2", "unknown", null, "혈액형·조직형 판정 여부가 답해지지 않았습니다.", r2Missing);
  else row("Rule 2", "not", null, "혈액형·조직 적합성을 판정하지 않음");

  // Rule 3
  const R3: [keyof ProductSpec["rule1to3Flags"], string][] = [
    ["geneticTesting", "유전자 검사"], ["cancerScreening", "암 선별·진단"], ["companionDiagnostic", "동반진단"],
    ["congenitalScreening", "선천성 질환 선별"], ["lifeThreatening", "생명위협 상태"],
  ];
  const r3 = R3.filter(([k]) => f[k]).map(([, l]) => l);
  const r3Missing = R3.filter(([k]) => f[k] === null).map(([k]) => `rule1to3Flags.${k}`);
  if (r3.length) row("Rule 3", "applies", "C", `${r3.join(", ")}에 해당`);
  else if (r3Missing.length) row("Rule 3", "unknown", null, "유전자·암·동반진단·선천성 선별·생명위협 질문 중 답하지 않은 항목이 있습니다.", r3Missing);
  else row("Rule 3", "not", null, "유전자·암·동반진단·선천성 선별·생명위협 상태에 해당하지 않음");

  // Rule 4
  const lay = s.user === "lay" || s.user === "both";
  const preset = s.analyte.preset;
  if (s.user === null) row("Rule 4", "unknown", null, "사용자(일반인 자가검사 / 전문가)가 입력되지 않았습니다.", ["user"]);
  else if (lay) {
    if (preset === "LH" || preset === "hCG") row("Rule 4", "applies", "B", `일반인 자가검사(4(a))는 원칙적으로 C이나 ${preset === "LH" ? "가임력(배란)" : "임신"} 검사 예외로 B`);
    else if (preset === null) row("Rule 4", "applies", "C", "일반인 자가검사(4(a)) — 측정 목적이 입력되지 않아 예외(B) 여부 미확인", ["analyte.preset"]);
    else row("Rule 4", "applies", "C", "일반인 자가검사(4(a)) — 임신·가임력·콜레스테롤·혈당·소변 적혈구/백혈구/세균 예외가 아니면 C");
  } else if (s.environment === "near-patient") row("Rule 4", "not", null, "전문가용 — 자가검사 아님. 근접검사 기기는 그 자체로 다른 규칙에 따라 분류(4(b))");
  else row("Rule 4", "not", null, "전문가용 — 자가검사·근접검사가 아님");

  // Rule 5
  if (s.productType === "instrument") row("Rule 5", "applies", "A", "IVD 전용 기기 (5(b)) — 특별한 위험 특성이 없다고 보고 A");
  else if (s.productType === null) row("Rule 5", "unknown", null, "제품 유형이 입력되지 않았습니다.", ["productType"]);
  else row("Rule 5", "not", null, "특정 분석물 검출 시약 — 범용 실험실 시약·IVD 전용 기기·검체 용기가 아님");

  // Rule 6 — 앞 규칙이 모두 비해당으로 기록된 뒤에만
  const before = rows.slice(0, 5);
  if (before.some((r) => r.verdict === "unknown")) {
    row("Rule 6", "unknown", null, "Rule 1~5 중 답하지 않은 규칙이 있어 Rule 6 적용 여부를 정할 수 없습니다.", before.flatMap((r) => r.fields));
  } else if (before.some((r) => r.verdict === "applies")) {
    row("Rule 6", "not", null, `앞선 규칙(${before.filter((r) => r.verdict === "applies").map((r) => r.rule).join(", ")})이 적용됨`);
  } else {
    row("Rule 6", "applies", "B", "Rule 1~5에 모두 해당하지 않음 (위 이유 참조) — 나머지 규칙으로 B");
  }

  // Rule 7
  row("Rule 7", "not", null, "지정값이 없는(정량·정성 값 미부여) 관리물질이 아님");

  return rows;
}

/** 분류 근거서용 마크다운 표 */
export function ruleTableMarkdown(rows: RuleRow[], c: ClassResult): string {
  const esc = (t: string) => t.replace(/\|/g, "/");
  const lines = [
    "| 규칙 | 해당 여부 | 클래스 | 이유 |",
    "|---|---|---|---|",
    ...rows.map((r) => `| ${r.rule} | ${r.verdict === "unknown" ? "[답변 필요 — 제품 스펙의 분류 판단 질문]" : RULE_VERDICT_LABEL[r.verdict]} | ${r.cls ?? "—"} | ${esc(r.reason)} |`),
  ];
  lines.push("", `둘 이상 해당하면 가장 높은 클래스를 적용한다 (IVDR Annex VIII 적용 규칙 — 조항 번호 원문 확인 필요). 결정 규칙: ${c.rule}`);
  return lines.join("\n");
}
