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
  cls.value === null ? unknown("등급이 정해지면 판단해요.") : pass(cls.value) ? v("required", yes) : v("excluded", no);

const triRule = (path: string, get: (s: ProductSpec) => boolean | null, yes: string, no: string, ask: string): Rule => (s) => {
  const x = get(s);
  return x === null ? unknown(ask, path) : x ? v("required", yes, path) : v("excluded", no, path);
};

export const APPLICABILITY_RULES: Record<string, Rule> = {
  "usability-file": (s) => {
    if (s.user === null && s.environment === null) return unknown("사용자와 사용 장소를 정하면 판단해요.", "user", "environment");
    const lay = s.user === "lay" || s.user === "both";
    const nearPatient = s.environment === "near-patient" || s.environment === "home";
    return lay || nearPatient
      ? v("required", lay ? "일반인 자가검사라 사용 오류가 곧 임상 위험이에요. IEC 62366-1 사용적합성 평가가 꼭 필요해요." : "근접검사 환경이라 사용적합성 평가가 필요해요.", "user", "environment")
      : v("recommended", "검사실 전문가용이지만, IEC 62366-1 사용적합성 문서를 GSPR 충족 근거로 갖춰 두길 권해요.", "user", "environment");
  },
  "electrical-safety-emc": (s) => {
    if (s.formFactor === null) return unknown("제품 형태(스틱만 / 리더기·기기 포함)를 정하면 판단해요.", "formFactor");
    if (s.formFactor === "strip-only") return v("excluded", "기기 없이 스틱만 팔아요. 전원이 있는 부품이 없어 전기안전·EMC 시험 대상이 아니에요.", "formFactor");
    return v("required", "전원이 들어가는 리더기·기기가 있어요. 전기안전(IEC 61010-1·-2-101)과 EMC(IEC 61326-2-6) 시험이 필요하고, EU면 RoHS·WEEE도 확인해야 해요 (원문 확인 필요).", "formFactor");
  },
  "sw-validation": (s) => {
    // 결과를 리더기·앱으로 읽으면 펌웨어·앱이 결과에 관여한다 — 앱 별도 제공 여부와 관계없이 IEC 62304 대상
    const fw = s.result.readout === "reader" || s.result.readout === "app" || (s.formFactor !== null && s.formFactor !== "strip-only");
    if (s.software.hasApp === true || fw)
      return v("required", fw && s.software.hasApp !== true ? `결과를 ${s.result.readout === "reader" ? "전용 리더기(펌웨어)로" : "스마트폰 앱으로"} 읽어요. 결과에 관여하는 소프트웨어라 IEC 62304 수명주기·검증이 필요해요.` : "앱·소프트웨어가 함께 제공돼요. IEC 62304 수명주기·검증이 필요해요.", "software.hasApp", "result.readout");
    if (s.software.hasApp === null || s.result.readout === null) return unknown("앱·소프트웨어를 함께 주는지와 결과 읽는 방식을 정하면 판단해요.", "software.hasApp", "result.readout");
    return v("excluded", "눈으로 결과를 읽고, 앱·소프트웨어가 없는 제품이에요.", "software.hasApp", "result.readout");
  },
  cybersecurity: triRule("software.hasApp", (s) => s.software.hasApp, "앱·연결 기능이 있어 사이버보안 문서(MDCG 2019-16)가 사실상 꼭 필요해요.", "연결 기능이 없는 제품이에요.", "앱·소프트웨어를 함께 주는지 정하면 판단해요."),
  "sterilization-validation": triRule("sterile", (s) => s.sterile, "멸균 제품이에요.", "비멸균 제품이에요.", "멸균 여부를 정하면 판단해요."),
  "packaging-validation": triRule("sterile", (s) => s.sterile, "멸균 배리어 포장 검증(ISO 11607)이 필요해요.", "비멸균 제품이라 멸균 배리어 포장 검증은 대상이 아니에요. 일반 포장 보호는 운송 밸리데이션에서 다뤄요.", "멸균 여부를 정하면 판단해요."),
  biocompatibility: (s) => {
    if (s.specimen === null) return unknown("검체 채취 방식을 정하면 판단해요.", "specimen");
    if (s.specimen === "capillary-blood" || s.specimen === "swab")
      return v("required", s.specimen === "capillary-blood" ? "채혈기·피부 접촉 부품이 있어 ISO 10993 평가가 필요해요." : "면봉이 점막에 닿아 ISO 10993 평가가 필요해요.", "specimen");
    return v("excluded", "기기가 몸에 닿지 않고 채취한 검체에만 닿아요. 제외 사유를 기술문서에 남겨 두세요.", "specimen");
  },
  "metrological-traceability": (s) =>
    s.result.kind === null ? unknown("결과 형태(정성/정량)를 정하면 판단해요.", "result.kind")
    : s.result.kind === "quantitative" ? v("required", "정량 검사라 교정물질·관리물질 지정값의 추적성이 필요해요.", "result.kind")
    : v("optional", "정성 검사라 꼭 필요하진 않지만, cut-off를 국제표준물질(WHO IS 등)에 연결하면 근거가 강해져요.", "result.kind"),
  "transport-validation": (s) =>
    s.transport.modes?.length
      ? v("required", "제품을 실제로 운송해요. IVDR Annex I §7은 운송·보관 중 성능 유지를 요구하므로 운송 영향을 검증해야 해요. 적용 규격은 운송·포장 단계에서 확인하세요.", "transport.modes")
      : v("recommended", "소형 IVD는 대개 택배로 보내서, 운송 중 온도·진동·낙하 영향을 검증해 두는 것이 실무 표준이에요(ISTA 3A). 운송·포장 단계에서 운송 방식을 적으면 판단해요.", "transport.modes"),
  "clinical-performance-study-plan": (s) =>
    s.rule1to3Flags.companionDiagnostic === true
      ? v("required", "동반진단 성능 연구는 Art.58 신고 대상이에요.", "rule1to3Flags.companionDiagnostic")
      : s.specimen === null ? unknown("검체 채취 방식을 정하면 판단해요.", "specimen")
      : v("excluded", "비침습 검체로 하는 연구는 Art.58 신청 대상이 아니에요. 윤리위원회(IRB) 승인은 따로 필요해요.", "specimen", "rule1to3Flags.companionDiagnostic"),
  fmea: () => v("recommended", "법적 의무는 아니지만 ISO 14971 위험분석의 실무 표준 기법이에요."),
  fta: () => v("optional", "FMEA를 보완하는 하향식 분석이에요. 중대 위해 시나리오가 있을 때 써요."),
  "qms-software-validation": () => unknown("회사가 eQMS·ERP 등 QMS용 소프트웨어를 쓰면 필요해요. 제품 정보가 아니라 회사 상황으로 판단해 주세요."),
  "nb-application": (s, cls) =>
    cls.value === null ? unknown("등급이 정해지면 판단해요.")
    : cls.value === "A" && s.sterile !== true ? v("excluded", "Class A 비멸균은 NB 심사 없이 자기선언해요.", "sterile")
    : v("required", `Class ${cls.value}${cls.value === "A" ? " 멸균" : ""}은 NB 심사가 필요해요.`, "sterile"),
  "authorised-rep-mandate": triRule("identity.manufacturerIsEU", (s) => (s.identity.manufacturerIsEU === null ? null : !s.identity.manufacturerIsEU), "EU 역외 제조자라 EU 대리인(Authorised Representative)을 지정해야 해요.", "EU 역내 제조자예요.", "EU 역내 제조자인지 정하면 판단해요."),
  "importer-distributor": (s) =>
    s.identity.manufacturerIsEU === null ? unknown("EU 역내 제조자인지 정하면 판단해요.", "identity.manufacturerIsEU")
    : !s.identity.manufacturerIsEU ? v("required", "역외 제조자 제품은 EU 수입자를 거쳐 출시되므로 수입자 의무를 점검해야 해요.", "identity.manufacturerIsEU")
    : v("optional", "EU 안에 유통자가 있을 때 써요.", "identity.manufacturerIsEU"),
  ssp: byClass((c) => c === "C" || c === "D", "Class C·D는 안전성·성능 요약(SSP)을 EUDAMED에 공개해야 해요.", "Class A·B는 SSP 대상이 아니에요."),
  psur: byClass((c) => c === "C" || c === "D", "Class C·D는 정기 안전성 갱신 보고서(PSUR)를 매년 갱신해요.", "Class A·B는 PSUR 대신 PMS 보고서를 써요."),
  "pms-report": byClass((c) => c === "A" || c === "B", "Class A·B는 PMS 보고서를 써요.", "Class C·D는 PMS 보고서 대신 PSUR을 써요."),
  "cs-compliance": byClass((c) => c === "D", "Class D는 공통기술규격(CS)이 있으면 적합성을 입증해야 해요.", "Class D 품목이 아니에요."),
  "eurl-batch-verification": byClass((c) => c === "D", "Class D는 출하 전 EU 기준검사실(EURL) 배치 검증을 받아요.", "Class D 품목이 아니에요."),
  "cdx-consultation": triRule("rule1to3Flags.companionDiagnostic", (s) => s.rule1to3Flags.companionDiagnostic, "동반진단은 의약품 당국·EMA와 협의해야 해요.", "동반진단 제품이 아니에요.", "동반진단 여부를 정하면 판단해요."),
  "pmpf-plan": () => v("required", "시판 후 성능 추적(PMPF)은 원칙적으로 필요해요. 하지 않으려면 그 사유를 PMS 계획에 적어야 해요."),
  "trend-reporting": () => v("optional", "통계적으로 유의한 증가가 있을 때 써요. 절차는 PMS 계획·비질런스 절차에 넣어 두세요."),
};

export const BASE_REQUIRED_REASON = "모든 IVDR 제품에 필요한 문서예요.";

export function evaluateLeaf(leaf: DocLeaf, s: ProductSpec, cls: ClassResult): Applicability {
  if (leaf.requirement === "required") return { leafId: leaf.id, status: "required", reason: BASE_REQUIRED_REASON, dependsOn: [] };
  const rule = APPLICABILITY_RULES[leaf.id];
  if (!rule) return { leafId: leaf.id, status: "unknown", reason: "아직 판단 규칙이 없는 문서예요. 필요한지 직접 판단해 주세요.", dependsOn: [] };
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
