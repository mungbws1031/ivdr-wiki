// =====================================================================
// src/lib/us/index.ts
// 미국 FDA 체외진단기기 — 분류·인허가 경로 추천, CLIA 판정, 제출 자료 목록.
// 분류는 추천일 뿐이다. 사람이 FDA 분류 데이터베이스에서 확인한 제품 코드(usProductCode)가 우선한다.
// 규정 번호는 2차 자료로 확인한 것만 쓰고, 나머지는 "제품 코드 확인 필요"로 둔다. 순수 함수.
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";

export type UsClass = "I" | "II" | "III";
export type UsPathway = "exempt" | "510k" | "denovo" | "pma" | "bla" | "check";
export type UsStatus = "provisional" | "needs-review" | "blocked";

/** 미국 규칙이 담당자 검토를 받았는지. 검토 후 이름·날짜를 채운다. */
export const US_RULES_REVIEWED: { by: string | null; date: string | null } = { by: null, date: null };

export const PATHWAY_LABEL: Record<UsPathway, string> = {
  exempt: "510(k) 면제 — 등록·리스팅 후 판매 (면제 근거 기록)",
  "510k": "510(k) 시판 전 신고 — 실질적 동등성 입증 (eSTAR 제출)",
  denovo: "De Novo — 비교할 기존 기기가 없는 저·중위험 신규 기기",
  pma: "PMA 시판 전 승인 — 고위험 (Class III)",
  bla: "BLA — 혈액·조직 공여자 선별 등 CBER 관할 가능성",
  check: "확인 필요 — 제품 코드로 결정",
};

/** 확인한 품목 (규정 번호·등급). 출처는 2차 자료 — 원문(eCFR·FDA 분류 DB) 확인 필요. */
export const US_KNOWN: Record<"LH" | "hCG", { regulation: string; deviceClass: UsClass; productCode: string | null; pathway: UsPathway; note: string; source: string; checked: string }> = {
  hCG: {
    regulation: "21 CFR 862.1155 (Human chorionic gonadotropin test system)",
    deviceClass: "II", productCode: null, pathway: "510k",
    note: "Class II — 510(k) 필요. FDA 가이드 'Over the Counter (OTC) Human Chorionic Gonadotropin (hCG) 510(k)s' 참조.",
    source: "FDA 가이드·510(k) 허가 사례 (K012215 등)", checked: "2026-10-30",
  },
  LH: {
    regulation: "21 CFR 862.1485 (Luteinizing hormone test system)",
    deviceClass: "I", productCode: "NGE (OTC)", pathway: "check",
    note: "Class I — 510(k) 면제이나 § 862.9 제한이 붙는다. 가정용 배란 검사는 510(k) 허가 사례가 있어(K981207 등) 제한 적용 여부를 862.9 원문으로 확인해야 한다.",
    source: "21 CFR 862.1485 본문, FDA 제품 코드 NGE (2차 자료)", checked: "2026-10-30",
  },
};

export interface UsClia { status: "waived-otc" | "waiver-application" | "categorization" | "check"; label: string; reason: string }

export interface UsResult {
  deviceClass: UsClass | null;
  regulation: string | null;
  productCode: string | null;
  /** 사람이 입력한 제품 코드 */
  confirmedCode: string | null;
  pathway: UsPathway;
  status: UsStatus;
  rationale: string[];
  citations: string[];
  steps: string[];
  clia: UsClia;
  otc: boolean | null;
}

const isLay = (s: ProductSpec) => s.user === "lay" || s.user === "both";
const foreignOf = (s: ProductSpec) => (s.identity.manufacturerCountry === null ? null : !/미국|USA|United States|US\b/i.test(s.identity.manufacturerCountry));

export function usClia(s: ProductSpec): UsClia {
  if (s.user === null) return { status: "check", label: "확인 필요", reason: "사용자가 입력되지 않았습니다." };
  if (isLay(s)) return { status: "waived-otc", label: "CLIA 면제 (가정용)", reason: "가정용(OTC)으로 허가받은 검사는 CLIA 면제(waived)로 분류됩니다 — 별도 waiver 신청 없음 (원문 확인 필요)." };
  if (s.environment === "near-patient") return { status: "waiver-application", label: "CLIA waiver 신청", reason: "진료실·약국 등 근접검사로 쓰려면 CLIA waiver가 필요합니다. 510(k)와 함께 내는 Dual 510(k)/CLIA Waiver 경로가 있습니다." };
  return { status: "categorization", label: "CLIA 복잡도 분류", reason: "검사실용은 허가 후 FDA가 CLIA 복잡도(moderate/high)를 분류합니다." };
}

export function classifyUs(s: ProductSpec): UsResult {
  const rationale: string[] = [];
  const citations = ["21 CFR 862 (임상화학·독성학 기기 분류)", "21 CFR 807 (등록·리스팅·510(k))", "21 CFR 809.10 (IVD 라벨)"];
  const confirmedCode = s.usProductCode?.trim() || null;
  const out = (deviceClass: UsClass | null, regulation: string | null, productCode: string | null, pathway: UsPathway, status: UsStatus): UsResult => ({
    deviceClass, regulation, productCode, confirmedCode, pathway, status, rationale, citations,
    steps: usSteps(s, pathway), clia: usClia(s), otc: s.user === null ? null : isLay(s),
  });

  if (!s.productType) {
    rationale.push("제품 유형이 입력되지 않았습니다.");
    return out(null, null, null, "check", "blocked");
  }
  const f = s.rule1to3Flags;
  if (f.transmissibleAgent) {
    rationale.push("감염병 검출 제품입니다. 혈액·조직 공여자 선별이면 CBER 관할(BLA·PMA), 진단용이면 질환에 따라 Class II(510(k)) 또는 Class III(PMA)입니다. 제품 코드로 확인해 주세요.");
    return out(null, null, null, "check", "needs-review");
  }
  if (f.companionDiagnostic) {
    rationale.push("동반진단은 치료제 결정에 직접 쓰여 대개 Class III·PMA 대상입니다 (치료제 허가와 함께 검토).");
    return out("III", null, null, "pma", "provisional");
  }
  if (f.bloodGrouping || f.tissueTyping) {
    rationale.push("혈액형·조직 적합성 검사는 수혈·이식 안전과 연결돼 CBER 관할(BLA 또는 510(k))일 수 있습니다.");
    return out(null, null, null, "bla", "needs-review");
  }
  const p = s.analyte.preset;
  if (p === "LH" || p === "hCG") {
    const k = US_KNOWN[p];
    rationale.push(`${p === "LH" ? "LH(배란)" : "hCG(임신)"} 검사: ${k.regulation}. ${k.note}`);
    if (isLay(s)) rationale.push("가정용(OTC)이면 일반인 사용 연구와 OTC 라벨이 필요합니다.");
    return out(k.deviceClass, k.regulation, k.productCode, k.pathway, "provisional");
  }
  if (p === "glucose" || p === "cholesterol" || p === "urine-cells") {
    rationale.push(`${p === "glucose" ? "혈당" : p === "cholesterol" ? "콜레스테롤" : "소변 일반"} 검사: 규정 번호를 확인하지 못했습니다. 대부분 Class II·510(k)이며, 가정용은 FDA 가정용 가이드를 확인하세요. 제품 코드로 확정하세요.`);
    if (isLay(s)) rationale.push("가정용(OTC)이면 일반인 사용 연구와 OTC 라벨이 필요합니다.");
    return out("II", null, null, "check", "provisional");
  }
  if (f.geneticTesting || f.cancerScreening) {
    rationale.push("유전자·암 관련 검사는 제품 코드에 따라 510(k)·De Novo·PMA로 갈립니다. 비교할 기존 기기가 없으면 De Novo입니다.");
    return out(null, null, null, "check", "provisional");
  }
  rationale.push("대부분의 진단 시약은 Class II·510(k)입니다. FDA 분류 데이터베이스에서 같은 분석물의 제품 코드를 찾아 확정하세요. 비교할 기존 기기(predicate)가 없으면 De Novo입니다.");
  if (s.productType === "instrument") rationale.push("범용 분석기는 Class I(면제)일 수 있습니다 — 제품 코드로 확인.");
  return out("II", null, null, "check", "provisional");
}

function usSteps(s: ProductSpec, pathway: UsPathway): string[] {
  const foreign = foreignOf(s);
  return [
    "FDA 제품 분류 데이터베이스에서 제품 코드·규정 번호 확인 (필요하면 513(g) 분류 질의 또는 Pre-Sub)",
    ...(foreign !== false ? ["US Agent 지정 (해외 제조자)"] : []),
    "시설 등록·기기 리스팅 (21 CFR 807, 연간 등록비)",
    pathway === "exempt" ? "510(k) 면제 근거 기록 (§ 862.9 제한에 걸리지 않는지 포함)"
      : pathway === "check" ? "인허가 경로 결정 후 제출 — 510(k)는 eSTAR"
      : `${PATHWAY_LABEL[pathway]} 제출`,
    "QMSR (21 CFR 820, ISO 13485 기반 — 2026-02-02 시행)",
    "UDI 표시·GUDID 등록 (21 CFR 830)",
    `라벨 (21 CFR 809.10)${isLay(s) ? " — 가정용(OTC) 일반인 표시" : ""}`,
    "시판 후: 부작용 보고 MDR (21 CFR 803), 시정·회수 보고 (21 CFR 806)",
  ];
}

// ── 제출 자료 ────────────────────────────────────────────────
export type UsDocStatus = "required" | "conditional" | "excluded" | "check";
export const US_DOC_STATUS_LABEL: Record<UsDocStatus, string> = { required: "필수", conditional: "해당 시", excluded: "불필요", check: "확인 필요" };
export interface UsDoc { id: string; title: string; status: UsDocStatus; reason: string; reuse: string[] }

export function usDocSet(s: ProductSpec, us: UsResult): UsDoc[] {
  const premarket = us.pathway !== "exempt";
  const is510k = us.pathway === "510k" || us.pathway === "check";
  const lay = isLay(s);
  const app = !!s.software.hasApp || s.result.readout === "app";
  const sw = app || s.result.readout === "reader" || (s.formFactor !== null && s.formFactor !== "strip-only");
  const contact = s.specimen === "capillary-blood" || s.specimen === "swab";
  const foreign = foreignOf(s);
  const v = (id: string, title: string, status: UsDocStatus, reason: string, reuse: string[] = []): UsDoc => ({ id, title, status, reason, reuse });
  return [
    v("us-description", "기기 설명 (Device Description)", "required", "구성·원리·사용 방법", ["device-description", "us-510k-draft"]),
    v("us-ifu", "사용 적응증 (Indications for Use, FDA 3881)", premarket ? "required" : "check", premarket ? "제출 경로 공통" : "면제 기기도 라벨의 사용 목적으로 남긴다", ["intended-purpose"]),
    v("us-se", "실질적 동등성 비교 (predicate)", is510k ? (us.pathway === "check" ? "check" : "required") : "excluded", is510k ? "510(k)면 비교 대상 기기(K-번호)와 차이점 표" : "510(k) 경로가 아님", ["us-510k-draft"]),
    v("us-analytical", "분석 성능 (CLSI 기준 시험)", premarket ? "required" : "check", "정밀도·검출한계·간섭·교차반응 등", ["analytical-performance"]),
    v("us-clinical", lay ? "일반인 사용 연구 (OTC 비교 연구)" : "임상 성능 / 비교 연구", lay ? "required" : "check", lay ? "가정용은 일반인이 쓴 결과와 기준 방법 비교가 필요" : "경로·품목에 따라 다름", ["clinical-performance"]),
    v("us-label", "라벨·사용설명서 (21 CFR 809.10)", "required", lay ? "OTC 일반인 표시 포함" : "전문가용 표시", ["labelling-spec", "ifu"]),
    v("us-stability", "안정성 (유효기간·개봉 후)", "required", "라벨의 유효기간 근거", ["stability-study"]),
    v("us-software", "소프트웨어 문서", sw ? "required" : "excluded", sw ? "앱·펌웨어가 결과에 관여" : "소프트웨어 없음", ["sw-validation"]),
    v("us-cyber", "사이버보안 (FD&C Act 524B)", app ? "required" : "excluded", app ? "인터넷에 연결되는 앱 — 사이버 기기 요건" : "연결 기능 없음", ["cybersecurity"]),
    v("us-biocomp", "생체적합성", contact ? "required" : "excluded", contact ? "피부·점막에 닿는 구성품" : "검체만 닿음", ["biocompatibility"]),
    v("us-sterility", "멸균", s.sterile ? "required" : "excluded", s.sterile ? "멸균 제품" : "비멸균", ["sterilization-validation"]),
    v("us-risk", "위험관리 (ISO 14971)", "required", "QMSR·심사 공통", ["risk-management-plan", "risk-management-file"]),
    v("us-qmsr", "QMSR (21 CFR 820)", "required", "ISO 13485 기반 품질시스템", ["quality-manual"]),
    v("us-reg", "시설 등록·기기 리스팅 (21 CFR 807)", "required", "판매 전 등록", []),
    v("us-udi", "UDI·GUDID (21 CFR 830)", "required", "라벨 UDI와 데이터베이스 등록", ["udi-assignment"]),
    v("us-agent", "US Agent 지정", foreign === null ? "check" : foreign ? "required" : "excluded", foreign === null ? "제조국 미입력" : foreign ? "해외 제조자" : "미국 제조", []),
  ];
}

const CLASS_TEXT = (c: UsClass | null) => (c ? `Class ${c}` : "[등급 — 제품 코드 확인 필요]");

/** 510(k) 초안 토큰 */
export function usTokens(s: ProductSpec): Record<string, string | null> {
  if (!s.markets?.includes("US")) return { usClass: null, usClia: null };
  const us = classifyUs(s);
  const code = us.confirmedCode ? `${us.confirmedCode} (담당자 확인)` : us.productCode ? `${us.productCode} — 추천 (확인 필요)` : "[제품 코드 — FDA 분류 DB 확인]";
  return {
    usClass: s.productType ? [
      `분류: ${CLASS_TEXT(us.deviceClass)} (추천 — 원문 확인 필요)`,
      `규정: ${us.regulation ?? "[규정 번호 — 제품 코드로 확인]"}`,
      `제품 코드: ${code}`,
      `경로: ${PATHWAY_LABEL[us.pathway]}`,
      `사용: ${us.otc === null ? "[OTC/Rx — 사용자 미입력]" : us.otc ? "가정용 (OTC)" : "전문가용 (Rx)"}`,
    ].join("\n") : null,
    usClia: s.user === null ? null : `${us.clia.label} — ${us.clia.reason}`,
  };
}
