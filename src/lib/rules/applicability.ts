// =====================================================================
// src/lib/rules/applicability.ts
// 제품 스펙 + 클래스 → IVDR 문서(docTree 잎)마다 필요 여부와 이유.
// 순수 함수. 값을 모르면 추측하지 않고 "unknown"(확인 필요)으로 돌려준다.
// docTree 에 조건부·해당시 문서를 추가하면 여기에도 판정을 추가해야 한다 (테스트가 확인).
// =====================================================================

import { allLeaves, type DocLeaf } from "../../data/docTree";
import type { ProductSpec } from "../../data/spec/types";
import type { ClassResult } from "./classify";

export type ApplStatus = "required" | "recommended" | "optional" | "excluded" | "unknown";

export interface Applicability {
  leafId: string;
  status: ApplStatus;
  reason: string;
  dependsOn: string[]; // 판단에 쓴 스펙 필드 경로
}

type Verdict = Omit<Applicability, "leafId">;
type Rule = (s: ProductSpec, cls: ClassResult) => Verdict;

const v = (status: ApplStatus, reason: string, ...dependsOn: string[]): Verdict => ({ status, reason, dependsOn });
const unknown = (reason: string, ...dependsOn: string[]) => v("unknown", reason, ...dependsOn);

/** 클래스가 정해지지 않았으면 클래스 의존 문서는 확인 필요. */
const byClass = (pass: (c: NonNullable<ClassResult["value"]>) => boolean, yes: string, no: string): Rule => (_s, cls) =>
  cls.value === null ? unknown("클래스가 정해지면 판정됩니다.") : pass(cls.value) ? v("required", yes) : v("excluded", no);

const triRule = (path: string, get: (s: ProductSpec) => boolean | null, yes: string, no: string, ask: string): Rule => (s) => {
  const x = get(s);
  return x === null ? unknown(ask, path) : x ? v("required", yes, path) : v("excluded", no, path);
};

export const APPLICABILITY_RULES: Record<string, Rule> = {
  "usability-file": (s) => {
    if (s.user === null && s.environment === null) return unknown("사용자·사용 환경이 정해지면 판정됩니다.", "user", "environment");
    const lay = s.user === "lay" || s.user === "both";
    const nearPatient = s.environment === "near-patient" || s.environment === "home";
    return lay || nearPatient
      ? v("required", lay ? "일반인 자가검사라 사용 오류가 곧 임상 위험입니다 — IEC 62366-1 사용적합성 평가 필수." : "근접검사 환경이라 사용적합성 평가가 필요합니다.", "user", "environment")
      : v("recommended", "검사실 전문가용이지만 IEC 62366-1 사용적합성 문서는 GSPR 충족 근거로 권장됩니다.", "user", "environment");
  },
  "sw-validation": triRule("software.hasApp", (s) => s.software.hasApp, "앱·소프트웨어가 함께 제공됩니다 — IEC 62304 수명주기·검증 필요.", "소프트웨어가 없는 제품입니다.", "앱·소프트웨어 제공 여부가 정해지면 판정됩니다."),
  cybersecurity: triRule("software.hasApp", (s) => s.software.hasApp, "앱·연결 기능이 있어 사이버보안 문서(MDCG 2019-16)가 사실상 필수입니다.", "연결 기능이 없는 제품입니다.", "앱·소프트웨어 제공 여부가 정해지면 판정됩니다."),
  "sterilization-validation": triRule("sterile", (s) => s.sterile, "멸균 제품입니다.", "비멸균 제품입니다.", "멸균 여부가 정해지면 판정됩니다."),
  "packaging-validation": triRule("sterile", (s) => s.sterile, "멸균 배리어 포장 검증(ISO 11607)이 필요합니다.", "비멸균 제품이라 멸균 배리어 포장 검증은 대상이 아닙니다. 일반 포장 보호는 운송 밸리데이션에서 다룹니다.", "멸균 여부가 정해지면 판정됩니다."),
  biocompatibility: (s) => {
    if (s.specimen === null) return unknown("검체 채취 방식이 정해지면 판정됩니다.", "specimen");
    if (s.specimen === "capillary-blood" || s.specimen === "swab")
      return v("required", s.specimen === "capillary-blood" ? "채혈기·피부 접촉 부품이 있어 ISO 10993 평가가 필요합니다." : "면봉이 점막에 접촉해 ISO 10993 평가가 필요합니다.", "specimen");
    return v("excluded", "기기가 신체에 닿지 않고 채취한 검체만 접촉합니다. 제외 사유를 기술문서에 남겨 두세요.", "specimen");
  },
  "metrological-traceability": (s) =>
    s.result.kind === null ? unknown("결과 형태(정성/정량)가 정해지면 판정됩니다.", "result.kind")
    : s.result.kind === "quantitative" ? v("required", "정량 검사라 교정물질·관리물질 지정값의 추적성이 필요합니다.", "result.kind")
    : v("optional", "정성 검사라 필수는 아니지만, cut-off를 국제표준물질(WHO IS 등)에 연결하면 근거가 강해집니다.", "result.kind"),
  "transport-validation": () => v("recommended", "소형 IVD는 대개 택배로 발송되어 운송 중 온도·진동·낙하 영향을 검증해 두는 것이 실무 표준입니다(ISTA 3A)."),
  "clinical-performance-study-plan": (s) =>
    s.rule1to3Flags.companionDiagnostic === true
      ? v("required", "동반진단 성능 연구는 Art.58 신고 대상입니다.", "rule1to3Flags.companionDiagnostic")
      : s.specimen === null ? unknown("검체 채취 방식이 정해지면 판정됩니다.", "specimen")
      : v("excluded", "비침습 검체로 진행하는 연구는 Art.58 신청 대상이 아닙니다. 윤리위원회(IRB) 승인은 별도로 필요합니다.", "specimen", "rule1to3Flags.companionDiagnostic"),
  fmea: () => v("recommended", "법적 의무는 아니지만 ISO 14971 위험분석의 실무 표준 기법입니다."),
  fta: () => v("optional", "FMEA를 보완하는 하향식 분석입니다. 중대 위해 시나리오가 있을 때 작성합니다."),
  "qms-software-validation": () => unknown("회사가 eQMS·ERP 등 QMS용 소프트웨어를 쓰면 필요합니다. 제품 스펙이 아니라 회사 상황으로 판단해 주세요."),
  "nb-application": (s, cls) =>
    cls.value === null ? unknown("클래스가 정해지면 판정됩니다.")
    : cls.value === "A" && s.sterile !== true ? v("excluded", "Class A 비멸균은 NB 심사 없이 자기선언합니다.", "sterile")
    : v("required", `Class ${cls.value}${cls.value === "A" ? " 멸균" : ""}은 NB 심사가 필요합니다.`, "sterile"),
  "authorised-rep-mandate": triRule("identity.manufacturerIsEU", (s) => (s.identity.manufacturerIsEU === null ? null : !s.identity.manufacturerIsEU), "EU 역외 제조자라 EU 대리인(Authorised Representative) 지정이 필요합니다.", "EU 역내 제조자입니다.", "EU 역내 제조자인지 정해지면 판정됩니다."),
  "importer-distributor": (s) =>
    s.identity.manufacturerIsEU === null ? unknown("EU 역내 제조자인지 정해지면 판정됩니다.", "identity.manufacturerIsEU")
    : !s.identity.manufacturerIsEU ? v("required", "역외 제조자 제품은 EU 수입자를 거쳐 출시되므로 수입자 의무를 점검해야 합니다.", "identity.manufacturerIsEU")
    : v("optional", "EU 내 유통자가 있을 때 작성합니다.", "identity.manufacturerIsEU"),
  ssp: byClass((c) => c === "C" || c === "D", "Class C·D는 안전성·성능 요약(SSP)을 EUDAMED에 공개해야 합니다.", "Class A·B는 SSP 대상이 아닙니다."),
  psur: byClass((c) => c === "C" || c === "D", "Class C·D는 정기 안전성 갱신 보고서(PSUR)를 매년 갱신합니다.", "Class A·B는 PSUR 대신 PMS 보고서를 씁니다."),
  "pms-report": byClass((c) => c === "A" || c === "B", "Class A·B는 PMS 보고서를 작성합니다.", "Class C·D는 PMS 보고서 대신 PSUR을 씁니다."),
  "cs-compliance": byClass((c) => c === "D", "Class D는 공통기술규격(CS)이 있으면 적합성을 입증해야 합니다.", "Class D 품목이 아닙니다."),
  "eurl-batch-verification": byClass((c) => c === "D", "Class D는 출하 전 EU 기준검사실(EURL) 배치 검증을 받습니다.", "Class D 품목이 아닙니다."),
  "cdx-consultation": triRule("rule1to3Flags.companionDiagnostic", (s) => s.rule1to3Flags.companionDiagnostic, "동반진단은 의약품 당국·EMA 협의가 필요합니다.", "동반진단 제품이 아닙니다.", "동반진단 여부가 정해지면 판정됩니다."),
  "pmpf-plan": () => v("required", "시판 후 성능 추적(PMPF)은 원칙적으로 필요합니다. 하지 않으려면 그 사유를 PMS 계획에 적어야 합니다."),
  "trend-reporting": () => v("optional", "통계적으로 유의한 증가가 있을 때 작성합니다. 절차는 PMS 계획·비질런스 절차에 포함해 두세요."),
};

export const BASE_REQUIRED_REASON = "모든 IVDR 제품에 필요한 문서입니다.";

export function evaluateLeaf(leaf: DocLeaf, s: ProductSpec, cls: ClassResult): Applicability {
  if (leaf.requirement === "required") return { leafId: leaf.id, status: "required", reason: BASE_REQUIRED_REASON, dependsOn: [] };
  const rule = APPLICABILITY_RULES[leaf.id];
  if (!rule) return { leafId: leaf.id, status: "unknown", reason: "아직 판정 규칙이 없는 문서입니다. 해당 여부를 직접 판단해 주세요.", dependsOn: [] };
  return { leafId: leaf.id, ...rule(s, cls) };
}

export function evaluateDocSet(s: ProductSpec, cls: ClassResult): Applicability[] {
  return allLeaves().map((l) => evaluateLeaf(l, s, cls));
}

export function countByStatus(list: Applicability[]): Record<ApplStatus, number> {
  const c: Record<ApplStatus, number> = { required: 0, recommended: 0, optional: 0, excluded: 0, unknown: 0 };
  list.forEach((a) => c[a.status]++);
  return c;
}
