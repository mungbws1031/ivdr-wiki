// =====================================================================
// src/lib/kr/index.ts
// 한국 식약처(MFDS) 체외진단의료기기 — 등급 추천, 자가검사 허용 품목 판정, 국내 제출 자료 목록.
// 등급은 추천일 뿐이다. 사람이 품목 분류로 확인한 krGrade 가 우선한다.
// 근거 원문 (국가법령정보센터에서 2026-11-05 확인):
//  - 체외진단의료기기법 시행규칙 제2조·제5조·제6조·제8조·제9조 (총리령 제2155호, 2026-09-18 시행)
//  - 체외진단의료기기 품목 및 품목별 등급에 관한 규정 제2조 (고시 제2026-45호, 2026-06-30)
//  - 체외진단의료기기 허가·신고·심사 등에 관한 규정 제22조·제25조·제26조 (고시 제2026-58호, 2026-08-10)
// 품목별 등급은 같은 고시 제2026-45호의 별표(국가법령정보센터 첨부 hwpx, 2026-11-05 내려받음)로 대조했다.
// 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import { josa } from "../drafts";

export type KrGrade = "1" | "2" | "3" | "4";
export type KrStatus = "recommended" | "provisional" | "needs-review" | "blocked";

/** 한국 규칙이 담당자 검토를 받았는지. 검토 후 이름·날짜를 채운다. */
export const KR_RULES_REVIEWED: { by: string | null; date: string | null } = { by: null, date: null };

export const KR_SOURCES = {
  law: "체외진단의료기기법 시행규칙 제2조(등급 지정 기준)·제5조(허가·인증·신고 대상) — 총리령 제2155호, 2026-09-18 시행",
  notice: "「체외진단의료기기 품목 및 품목별 등급에 관한 규정」 제2조·별표 (식약처 고시 제2026-45호, 2026-06-30)",
  selfTest: "자가검사용 품목은 같은 고시 별표에 있어야 해요. 품목번호·등급은 고시 제2026-45호 별표 기준 (2026-11-05 확인 — 고시가 바뀌면 다시 확인)",
  review: "「체외진단의료기기 허가·신고·심사 등에 관한 규정」 제22조·제25조·제26조 (식약처 고시 제2026-58호, 2026-08-10 시행)",
};

/**
 * 자가검사용 품목 (고시 별표에 품목이 있어야 자가검사용으로 허가·인증 가능).
 * grade 는 고시 별표에서 확인한 품목 등급.
 * effective 가 있으면 그날부터 시행되는 품목.
 */
export interface KrSelfTestItem {
  key: string;
  label: string;
  code: string | null;
  grade: KrGrade | null;
  re: RegExp;
  source: string;
  checked: string;
  effective?: string;
}

const TABLE = "고시 제2026-45호 별표 (2026-11-05 확인)";
export const KR_SELF_TEST_ITEMS: KrSelfTestItem[] = [
  { key: "pregnancy", label: "임신·가임기 등 내분비 (hCG·LH) — 개인용임신내분비물질검사지/검사기", code: "J14030.01 / J04030.01", grade: "2", re: /hCG|LH|임신|배란|가임|융모성|황체형성/i, source: TABLE, checked: "2026-11-05" },
  { key: "glucose", label: "혈당·케톤 — 개인용혈당검사지/측정기", code: "J14010.01 / J04010.01", grade: "3", re: /혈당|포도당|glucose|케톤/i, source: TABLE, checked: "2026-11-05" },
  { key: "lipid", label: "콜레스테롤 등 단백질·지질 — 개인용단백질·지질검사지", code: "J14020.01", grade: "2", re: /콜레스테롤|cholesterol|중성지방|HDL|지질/i, source: TABLE, checked: "2026-11-05" },
  { key: "coag", label: "혈액응고시간 — 개인용혈액응고시간검사지/검사기", code: "J14040.01 / J04040.01", grade: "3", re: /응고|INR|PT\b|프로트롬빈/i, source: TABLE, checked: "2026-11-05" },
  { key: "urine-analyzer", label: "소변 화학 성분 (분석기) — 개인용요화학분석기", code: "J04020.01", grade: "2", re: /요화학/i, source: TABLE, checked: "2026-11-05" },
  { key: "hiv", label: "HIV — 자가검사용HIV면역검사시약", code: "K05060.01", grade: "4", re: /HIV|면역결핍/i, source: TABLE, checked: "2026-11-05" },
  { key: "respiratory", label: "인플루엔자·코로나19 (비강 검체 등, 항원·항체) — 자가검사용호흡기바이러스면역검사시약", code: "K05070.01", grade: "3", re: /인플루엔자|독감|influenza|코로나|COVID|SARS-CoV-2/i, source: TABLE, checked: "2026-11-05" },
  { key: "drug", label: "마약류 대사체 (소변·타액) — 자가검사용마약류물질대사검사시약", code: "K06060.01", grade: "2", re: /마약|대마|대사체|drug/i, source: "고시 제2026-45호 별표·부칙 제1조·제3조 — 2028-06-30부터 시행, 그 전에도 인증 절차는 진행 가능", checked: "2026-11-05", effective: "2028-06-30" },
];
const STI_RE = /성매개|성병|클라미디아|임질|매독|STI/i;

export interface KrSelfTest {
  status: "allowed" | "check" | "not-applicable";
  item: string | null;
  reason: string;
  labelling: string[];
}

export interface KrResult {
  grade: KrGrade | null;
  status: KrStatus;
  rule: string;
  rationale: string[];
  route: string;
  steps: string[];
  citations: string[];
  selfTest: KrSelfTest;
  /** 사람이 입력한 krGrade 와 비교 */
  confirmed: { value: KrGrade | null; matches: boolean | null };
  openQuestions: string[];
}

// 시행규칙 제5조·제6조·제8조·제9조: 허가는 식약처장, 인증·신고는 한국의료기기안전정보원
const LABEL = {
  1: "1등급 — 신고 (한국의료기기안전정보원)",
  2: "2등급 — 인증 (한국의료기기안전정보원). 단, 인증 대상으로 고시된 품목이 아니거나 이미 허가·인증·신고된 제품과 본질적으로 동등하지 않으면 허가 (식품의약품안전처)",
  3: "3등급 — 허가 (식품의약품안전처)",
  4: "4등급 — 허가 (식품의약품안전처)",
} as const;

export function krRouteLabel(g: KrGrade | null): string {
  return g ? LABEL[g] : "등급이 정해지면 신고·인증·허가 중 어느 경로인지 알 수 있어요.";
}

const isLay = (s: ProductSpec) => s.user === "lay" || s.user === "both";
/** 검사 대상 이름으로만 품목을 찾는다 — 임상적 판단 문장("임신 시도 시기")은 다른 품목과 헷갈린다 */
const PRESET_TEXT: Record<string, string> = { LH: "LH 배란", hCG: "hCG 임신", glucose: "혈당", cholesterol: "콜레스테롤", "urine-cells": "소변 일반" };
const analyteText = (s: ProductSpec) => (s.analyte.preset && PRESET_TEXT[s.analyte.preset]) || s.analyte.name || "";

/** 일반인용 제품의 검사 대상이 별표의 자가검사용 품목과 맞는지 찾는다 */
export function krSelfTestItem(s: ProductSpec): KrSelfTestItem | null {
  if (!isLay(s)) return null;
  const text = analyteText(s);
  return KR_SELF_TEST_ITEMS.find((i) => i.re.test(text)) ?? null;
}

export function krSelfTest(s: ProductSpec): KrSelfTest {
  const labelling = ["외부 포장에 '자가검사용' 표시", "'확진용이 아닌 보조검사용' 주의 문구 (표시 의무화 예정 — 시행일 확인 필요)"];
  if (!isLay(s)) return { status: "not-applicable", item: null, reason: s.user === null ? "사용자를 아직 안 적었어요." : "전문가용 — 자가검사 품목 제한 대상 아님", labelling: [] };
  const text = analyteText(s);
  const hit = krSelfTestItem(s);
  if (hit?.effective) return { status: "check", item: hit.label, reason: `${hit.label} (${hit.code}) — ${hit.source}. 시행일 전에는 판매할 수 없어요.`, labelling };
  if (hit) return { status: "allowed", item: hit.label, reason: `자가검사용 품목 — ${hit.label}${hit.code ? ` (${hit.code}${hit.grade ? `, ${hit.grade}등급` : ""})` : ""}. ${hit.source}`, labelling };
  if (STI_RE.test(text)) return { status: "check", item: "성매개감염", reason: "성매개감염 자가검사는 2026-06 개정에서 보류됐습니다 — 추가 검토 결과 확인 필요 (HIV는 별도 품목이 있어요)", labelling };
  return {
    status: "check",
    item: s.analyte.name,
    reason: `${josa(s.analyte.name ?? "이 검사 대상", "이", "가")} 고시 별표의 자가검사용 품목에 있는지 확인하지 못했습니다. 품목이 없으면 자가검사용으로 허가받을 수 없습니다 (전문가용으로 허가하거나 품목 재분류 신청 — 고시 제2조제3항·제4항).`,
    labelling,
  };
}

export function classifyKr(s: ProductSpec): KrResult {
  const rationale: string[] = [];
  const citations = [KR_SOURCES.law, KR_SOURCES.notice];
  const openQuestions: string[] = [];
  const selfTest = krSelfTest(s);
  const confirmedValue = s.krGrade ?? null;
  const finish = (grade: KrGrade | null, status: KrStatus, rule: string): KrResult => {
    const g = confirmedValue ?? grade;
    return {
      grade, status, rule, rationale, citations, selfTest, openQuestions,
      route: krRouteLabel(g),
      steps: krSteps(s, g),
      confirmed: { value: confirmedValue, matches: confirmedValue && grade ? confirmedValue === grade : null },
    };
  };

  if (!s.productType) {
    rationale.push("제품 유형을 아직 안 적었어요.");
    openQuestions.push("productType");
    return finish(null, "blocked", "—");
  }
  if (s.productType === "instrument") {
    rationale.push("분석기·범용 기기는 낮은 등급(1등급) 후보예요. 무엇을 재는지, 전용 기기인지에 따라 달라져서 품목 분류로 확인해야 해요.");
    rationale.push("체외진단 소프트웨어 품목은 2025-04-07 고시 개정으로 이 고시에서 빠지고 디지털의료제품 분류 고시로 옮겨졌어요 — 소프트웨어가 따로 있으면 그쪽도 확인해 주세요.");
    return finish("1", "provisional", "기기 (위해도 낮음)");
  }

  const f = s.rule1to3Flags;
  (Object.keys(f) as (keyof typeof f)[]).forEach((k) => { if (f[k] === null) openQuestions.push(`rule1to3Flags.${k}`); });

  const lay0 = krSelfTestItem(s);
  // 감염병 자가검사 품목(HIV·호흡기 바이러스)은 별표에 등급이 따로 있다
  if (f.transmissibleAgent && lay0?.grade && (lay0.key === "hiv" || lay0.key === "respiratory")) {
    rationale.push(`감염병 검사지만 고시 별표에 자가검사용 품목 ${lay0.label} (${lay0.code})이 따로 있어 그 등급(${lay0.grade}등급)을 따라요 — ${TABLE}.`);
    return finish(lay0.grade, KR_RULES_REVIEWED.by ? "recommended" : "provisional", `자가검사 품목 ${lay0.code}`);
  }
  if (f.transmissibleAgent) {
    rationale.push("감염병을 찾는 제품이에요. 수혈·이식 안전과 관련되거나 잘 퍼지는 감염병이면 개인·공중보건 위해도가 모두 높아 4등급, 그 밖에는 3등급 후보예요.");
    rationale.push("질환마다 따로 판단해야 해서 앱이 정하지 않아요. 품목 분류로 확인해 주세요.");
    return finish(null, "needs-review", "개인·공중보건 위해도 (4 또는 3등급)");
  }

  let grade: KrGrade | null = null;
  let rule = "";
  const up = (g: KrGrade, r: string, why: string) => {
    rationale.push(why);
    if (!grade || Number(g) > Number(grade)) { grade = g; rule = r; }
  };
  if (f.bloodGrouping || f.tissueTyping) up("3", "혈액형·조직형", "혈액형·조직 적합성 판정은 개인 위해도가 높아 3등급 후보예요 (일부 표지자는 4등급 — 확인 필요).");
  const r3 = [f.geneticTesting && "유전자 검사", f.cancerScreening && "암 선별·진단", f.companionDiagnostic && "동반진단", f.congenitalScreening && "선천성 질환 선별", f.lifeThreatening && "생명위협 상태"].filter(Boolean);
  if (r3.length) up("3", "개인 위해도 높음", `${r3.join(", ")} — 결과가 틀렸을 때 개인 위해도가 높아 3등급 후보예요.`);

  if (s.user === null) {
    rationale.push("사용자(일반인 자가검사 / 전문가)를 아직 안 적어서 등급을 정할 수 없어요.");
    openQuestions.unshift("user");
    return finish(grade, "blocked", rule || "—");
  }
  if (isLay(s)) {
    const item = krSelfTestItem(s);
    if (item?.grade) {
      up(item.grade, `자가검사 품목 ${item.code}`, `고시 별표의 자가검사용 품목 ${item.label} (${item.code})은 ${item.grade}등급이에요 — ${TABLE}.`);
    } else if (s.analyte.preset === "urine-cells") {
      rationale.push("소변 일반 자가검사는 별표에 개인용요화학분석기(J04020.01, 2등급)는 있지만 자가검사용 소변 검사지 품목은 없어요 — 검사지라면 품목 분류로 확인해 주세요.");
      if (!rule) rule = "소변 자가검사 — 품목별 등급 확인 필요";
    } else {
      up("3", "자가검사", "일반인 자가검사는 틀린 결과를 전문가가 걸러 주지 못해 3등급 후보예요. 고시 별표에서 품목을 찾으면 그 등급을 따라요.");
      if (s.analyte.preset === null) openQuestions.push("analyte.preset");
    }
  } else if (!grade) {
    up("2", "그 밖의 전문가용 시약", "위 기준에 해당하지 않는 전문가용 시약은 2등급 후보예요.");
  }

  rationale.push("국내 등급은 품목·품목류별로 고시 별표에서 정해져요 (시행규칙 제2조제2항). 이 추천은 품목을 찾기 위한 출발점이에요.");
  // 국내 규칙은 담당자 검토 전에는 항상 잠정
  return finish(grade, KR_RULES_REVIEWED.by && !openQuestions.length ? "recommended" : "provisional", rule);
}

function krSteps(s: ProductSpec, g: KrGrade | null): string[] {
  const lay = isLay(s);
  return [
    g === null ? "품목 분류 검색으로 품목명·등급 확인 (의료기기안전정보원 품목분류 데이터)" : `품목·등급 확정: ${g}등급 (품목 분류 코드 기록)`,
    ...(g === "2" ? ["2등급 경로 확인: 인증 대상으로 고시된 품목이고 기존 제품과 본질적으로 동등하면 인증(정보원), 아니면 허가(식약처) — 시행규칙 제5조"] : []),
    "KGMP(체외진단의료기기 제조 및 품질관리 기준) 적합인정 — 제조소 심사",
    "기술문서 작성·심사 — 명칭, 모양 및 구조, 원재료, 제조방법, 사용목적, 성능, 사용방법, 주의사항, 포장단위, 저장방법·사용기간, 시험규격, 제조원 (허가 고시 제7조~제18조)",
    g === "3" || g === "4" ? "임상적 성능시험 — 식약처 지정 임상적 성능시험기관에서 수행 (계획 승인 대상 여부 확인)" : "임상적 성능시험 자료 필요 여부 확인 (2등급은 새로운·개량·동등 제품 구분에 따라 면제될 수 있음 — 허가 고시 제26조)",
    ...(lay ? ["자가검사용 품목 확인 + '자가검사용'·'보조검사용' 표시 + 사용적합성 자료"] : []),
    "표시기재·UDI 등록, 시판 후 안전관리(부작용 보고·추적관리 해당 여부)",
  ];
}

// ── 국내 제출 자료 ───────────────────────────────────────────
export type KrDocStatus = "required" | "conditional" | "excluded" | "check";
export interface KrDoc {
  id: string;
  title: string;
  status: KrDocStatus;
  reason: string;
  /** 이미 만든 IVDR 문서 중 다시 쓸 수 있는 것 */
  reuse: string[];
}

export const KR_DOC_STATUS_LABEL: Record<KrDocStatus, string> = { required: "필수", conditional: "해당 시", excluded: "불필요", check: "확인 필요" };

export function krDocSet(s: ProductSpec, kr: KrResult): KrDoc[] {
  const g = kr.confirmed.value ?? kr.grade;
  const lay = isLay(s);
  const foreign = s.identity.manufacturerCountry !== null ? !/한국|대한민국|korea|KR/i.test(s.identity.manufacturerCountry) : null;
  const exempt2 = "2등급은 새로운·개량·동등 제품 구분에 따라 면제될 수 있어요 (허가 고시 제22조제2항·제26조제1항, 별표 7).";
  const d: KrDoc[] = [
    { id: "kr-tech", title: "기술문서 (명칭·모양 및 구조·원재료·제조방법·사용목적·성능·사용방법·주의사항·포장단위·저장방법·시험규격·제조원)", status: "required", reason: "신고·인증·허가 모두 기술문서 심사(또는 검토)를 받아요 — 허가 고시 제7조~제18조.", reuse: ["kr-technical-doc", "device-description", "intended-purpose"] },
    { id: "kr-compare", title: "이미 허가·인증받은 제품과 비교한 자료", status: "required", reason: "허가 고시 제25조제1항제1호. 2등급은 이 비교로 새로운·개량·동등 제품을 나눠요 (제22조제2항).", reuse: [] },
    { id: "kr-origin", title: "기원·개발 경위, 검출·측정 원리·방법 자료", status: g === "3" || g === "4" ? "check" : "required", reason: g === "3" || g === "4" ? "3·4등급은 별표 7에 따라 면제될 수 있어요 (제26조제2항)." : "허가 고시 제25조제1항제2호.", reuse: [] },
    { id: "kr-usage", title: "국내·외 사용 현황 자료", status: "required", reason: "허가 고시 제25조제1항제3호.", reuse: [] },
    { id: "kr-analytical", title: "분석적 성능시험 자료 (분석적 민감도·분석적 특이도·정밀도·정확도)", status: "required", reason: "허가 고시 제25조제1항제7호가목.", reuse: ["analytical-performance"] },
    {
      id: "kr-clinical", title: "임상적 성능시험 자료 (임상적 민감도·임상적 특이도)",
      status: g === "3" || g === "4" ? "required" : "check",
      reason: g === "3" || g === "4" ? "3·4등급은 임상적 성능시험 자료가 필요해요 (지정 시험기관) — 허가 고시 제25조제1항제7호나목." : g === "2" ? exempt2 : "등급·품목에 따라 필요한지가 달라요 — 품목을 확인한 뒤 정해요.",
      reuse: ["clinical-performance", "performance-eval-plan"],
    },
    { id: "kr-qc", title: "품질관리 시험 자료", status: "required", reason: "허가 고시 제25조제1항제7호다목.", reuse: [] },
    { id: "kr-reference", title: "표준물질 및 검체 보관 자료", status: g === "2" ? "check" : "required", reason: g === "2" ? exempt2 : "허가 고시 제25조제1항제7호라목.", reuse: [] },
    { id: "kr-handler", title: "취급자 안전 자료", status: g === "2" ? "check" : "required", reason: g === "2" ? exempt2 : "허가 고시 제25조제1항제8호.", reuse: [] },
    { id: "kr-usability", title: "사용적합성 자료 (자가검사용)", status: lay ? (g === null ? "check" : "conditional") : "excluded", reason: lay ? "자가검사용은 사용적합성 자료를 내요 (허가 고시 제25조제1항제9호). 2등급과 3·4등급 모두 별표 7에 따라 면제될 수 있어서 해당 여부를 확인해요 (제26조)." : "전문가용", reuse: lay ? ["usability-file"] : [] },
    { id: "kr-stability", title: "저장방법과 사용기간(유효기간) 자료 — 안정성 시험", status: "required", reason: "허가 고시 제25조제1항제6호, 사용기간은 「의료기기의 안정성시험 기준」에 따라 정해요 (제16조).", reuse: ["stability-study"] },
    { id: "kr-kgmp", title: "KGMP 적합인정", status: "required", reason: "제조소 품질관리 기준 심사예요 — 1등급도 필요한지와 심사 종류는 원문 확인 필요.", reuse: ["quality-manual"] },
    { id: "kr-label", title: `표시기재 (용기·포장·첨부문서)${lay ? " — 자가검사 문구 포함" : ""}`, status: "required", reason: lay ? "'자가검사용'·'확진용이 아닌 보조검사용' 표시를 넣어요." : "제품명·제조번호·사용 기간·저장 방법 등을 적어요.", reuse: ["labelling-spec", "ifu"] },
    { id: "kr-udi", title: "UDI 표시·등록", status: "required", reason: "체외진단의료기기에도 UDI를 적용해요 — 등급별 시행 시점은 확인 필요.", reuse: ["udi-assignment"] },
    { id: "kr-selftest", title: "자가검사용 품목 확인 기록", status: lay ? (kr.selfTest.status === "allowed" ? "required" : "check") : "excluded", reason: lay ? kr.selfTest.reason : "전문가용", reuse: [] },
    { id: "kr-import", title: "수입업 허가·국내 수입자 (해외 제조 시)", status: foreign === null ? "check" : foreign ? "required" : "excluded", reason: foreign === null ? "제조국을 아직 안 적었어요." : foreign ? "해외에서 만들면 국내 수입업자가 신고·인증·허가를 받아요." : "국내에서 만들어요.", reuse: [] },
    { id: "kr-risk", title: "위험관리 자료", status: "required", reason: "기술문서·KGMP 심사에서 위험관리 근거를 확인해요.", reuse: ["risk-management-plan", "risk-management-file"] },
  ];
  return d;
}

/** 한국 기술문서 초안에 쓰는 토큰 */
export function krTokens(s: ProductSpec): Record<string, string | null> {
  if (!s.markets?.includes("KR")) return { krGrade: null, krSelfTest: null };
  const kr = classifyKr(s);
  const g = kr.confirmed.value;
  const grade = g
    ? `${krRouteLabel(g)} (담당자 확인 등급)${kr.confirmed.matches === false ? ` — 앱 추천 ${kr.grade}등급과 다름, 근거 확인` : ""}`
    : kr.grade ? `${krRouteLabel(kr.grade)} — 추천 (품목 분류로 확인 필요)` : null;
  const st = kr.selfTest;
  const self = st.status === "not-applicable" ? "해당 없음 (전문가용)" : `${st.status === "allowed" ? "허용 품목" : "[확인 필요]"} — ${st.reason}${st.labelling.length ? `\n표시: ${st.labelling.join(" / ")}` : ""}`;
  return { krGrade: grade, krSelfTest: s.user === null ? null : self };
}
