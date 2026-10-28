// =====================================================================
// src/lib/rules/classify.ts
// IVDR Annex VIII 클래스 추천. 순수 함수 (DOM 의존 금지 — 서버 함수도 import 예정).
// 추천일 뿐이다. 사람이 확정한다. 모르는 값은 추측하지 않고 openQuestions 로 돌려준다.
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";

export type IvdClass = "A" | "B" | "C" | "D";
export type ClassStatus = "recommended" | "provisional" | "needs-review" | "blocked";

export interface ClassResult {
  value: IvdClass | null;
  status: ClassStatus;
  rule: string; // 결정한 규칙 (예: "Rule 4(a) 예외")
  rationale: string[];
  citations: string[];
  openQuestions: string[]; // 스펙 필드 경로
  route: string[]; // 적합성 평가 경로
}

/** 분류 규칙 코드가 RA 담당자 검토를 받았는지. 검토 후 이름·날짜를 채운다. */
export const RULES_REVIEWED: { by: string | null; date: string | null } = { by: null, date: null };

const RANK: Record<IvdClass, number> = { A: 1, B: 2, C: 3, D: 4 };

const RULE3_FLAGS: { key: keyof ProductSpec["rule1to3Flags"]; label: string }[] = [
  { key: "geneticTesting", label: "유전자 검사" },
  { key: "cancerScreening", label: "암 선별·진단·병기 판정" },
  { key: "companionDiagnostic", label: "동반진단" },
  { key: "congenitalScreening", label: "선천성 질환 선별" },
  { key: "lifeThreatening", label: "결과 오류가 생명을 위협할 수 있는 상태" },
];
const ALL_FLAG_KEYS = Object.keys({
  transmissibleAgent: 1, bloodGrouping: 1, tissueTyping: 1, geneticTesting: 1,
  cancerScreening: 1, companionDiagnostic: 1, congenitalScreening: 1, lifeThreatening: 1,
}) as (keyof ProductSpec["rule1to3Flags"])[];

export function conformityRoute(cls: IvdClass, selfTest: boolean, sterile: boolean | null): string[] {
  switch (cls) {
    case "A":
      return sterile
        ? ["기술문서 작성 후 적합성 선언(자기선언)", "멸균 관련 측면만 NB 심사 (Annex IX 또는 XI)"]
        : ["기술문서 작성 후 적합성 선언(자기선언) — NB 심사 없음"];
    case "B":
      return [
        "NB의 QMS 심사 (Annex IX Chapter I·III)",
        "제품군 대표 기기의 기술문서 평가 (Annex IX Chapter II)",
        ...(selfTest ? ["자가검사 기기 — 기술문서 추가 평가 (Annex IX 5.1)"] : []),
      ];
    case "C":
      return [
        "Annex IX (QMS + 기술문서 평가) 또는 Annex X 형식 시험 + Annex XI 생산 품질보증",
        ...(selfTest ? ["자가검사 기기 — 기술문서 추가 평가 (Annex IX 5.1)"] : []),
      ];
    case "D":
      return [
        "Annex IX 전체 (QMS + 기술문서 평가) 또는 Annex X + XI",
        "EU 기준검사실(EURL) 성능 검증·배치 시험",
        "공통기술규격(CS)이 있으면 적합성 입증",
      ];
  }
}

export function classify(s: ProductSpec): ClassResult {
  const rationale: string[] = [];
  const citations = ["IVDR Annex VIII", "IVDR Art.47"];
  const openQuestions: string[] = [];

  if (!s.productType) {
    return { value: null, status: "blocked", rule: "—", rationale: ["제품 유형(시약·키트 / 기기 등)이 입력되지 않았습니다."], citations, openQuestions: ["productType"], route: [] };
  }

  // 기기·부속품 (1차 범위 밖이지만 판정은 한다)
  if (s.productType === "instrument") {
    rationale.push("IVD 전용 기기로 별도 위험 특성이 부여되지 않았다고 보고 Rule 5(b)를 적용했습니다.");
    return { value: "A", status: "provisional", rule: "Rule 5(b)", rationale, citations, openQuestions, route: conformityRoute("A", false, s.sterile) };
  }

  const f = s.rule1to3Flags;
  ALL_FLAG_KEYS.forEach((k) => { if (f[k] === null) openQuestions.push(`rule1to3Flags.${k}`); });

  // Rule 1 — 감염병: 전파 위험도·혈액 안전성에 따라 D(Rule 1) 또는 C(Rule 3)로 갈린다.
  if (f.transmissibleAgent) {
    rationale.push("감염병(전파성 병원체) 검출 제품입니다. 수혈·이식 안전성이나 전파 위험이 높은 생명위협 질환이면 Rule 1(D), 그 외는 Rule 3(C)입니다.");
    rationale.push("이 구분은 질환별 판단이 필요해 앱이 정하지 않습니다. RA 담당자가 확인해 주세요.");
    return { value: null, status: "needs-review", rule: "Rule 1 또는 Rule 3", rationale, citations, openQuestions, route: [] };
  }

  let cls: IvdClass | null = null;
  let rule = "";
  const add = (c: IvdClass, r: string, why: string) => {
    rationale.push(why);
    if (!cls || RANK[c] > RANK[cls]) { cls = c; rule = r; }
    else if (RANK[c] === RANK[cls]) rule = `${rule} · ${r}`;
  };

  // Rule 2 — 혈액형·조직형
  if (f.bloodGrouping || f.tissueTyping) {
    add("C", "Rule 2", "혈액형·조직 적합성 판정 제품은 Rule 2에 따라 C입니다 (ABO·Rh 등 일부 표지자는 D — 표지자 확인 필요).");
  }
  // Rule 3
  const r3 = RULE3_FLAGS.filter((x) => f[x.key]);
  if (r3.length) add("C", "Rule 3", `${r3.map((x) => x.label).join(", ")}에 해당해 Rule 3에 따라 C입니다.`);

  // Rule 4 / Rule 6
  if (s.user === null) {
    rationale.push("사용자(일반인 자가검사 / 전문가)가 입력되지 않아 Rule 4 적용 여부를 정할 수 없습니다.");
    openQuestions.unshift("user");
    return { value: cls, status: "blocked", rule: rule || "—", rationale, citations, openQuestions, route: [] };
  }
  const selfTest = s.user === "lay" || s.user === "both";
  if (selfTest) {
    const preset = s.analyte.preset;
    if (preset === "LH" || preset === "hCG") {
      add("B", "Rule 4(a) 예외", `일반인 자가검사는 Rule 4(a)에 따라 원칙적으로 C이지만, ${preset === "LH" ? "가임력(배란) 검사" : "임신 검사"}는 예외로 B입니다.`);
    } else {
      add("C", "Rule 4(a)", "일반인 자가검사는 Rule 4(a)에 따라 C입니다. 콜레스테롤·혈당·소변 적혈구/백혈구/세균 검사라면 예외로 B입니다.");
      if (preset === null) openQuestions.push("analyte.preset");
    }
    citations.push("IVDR Annex VIII Rule 4");
  } else if (!cls) {
    add("B", "Rule 6", "Rule 1~5에 해당하지 않는 전문가용 시약은 Rule 6에 따라 B입니다.");
  }

  const value = cls as IvdClass | null;
  const status: ClassStatus = openQuestions.length ? "provisional" : "recommended";
  if (status === "provisional") rationale.push("분류 판단 질문 중 답하지 않은 항목이 있어 잠정 추천입니다. 답에 따라 등급이 올라갈 수 있습니다.");
  if (s.sterile === true && value === "A") rationale.push("멸균 제품이라 A라도 멸균 측면은 NB 심사를 받습니다.");

  return { value, status, rule, rationale, citations, openQuestions, route: value ? conformityRoute(value, selfTest, s.sterile) : [] };
}

