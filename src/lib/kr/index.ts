// =====================================================================
// src/lib/kr/index.ts
// 한국 식약처(MFDS) 체외진단의료기기 — 등급 추천, 자가검사 허용 품목 판정, 국내 제출 자료 목록.
// 등급은 추천일 뿐이다. 사람이 품목 분류로 확인한 krGrade 가 우선한다.
// 규정 원문(법·시행규칙·식약처 고시)과 대조하기 전이라 모든 판정에 "원문 확인 필요"를 단다.
// 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import { josa } from "../drafts";

export type KrGrade = "1" | "2" | "3" | "4";
export type KrStatus = "recommended" | "provisional" | "needs-review" | "blocked";

/** 한국 규칙이 담당자 검토를 받았는지. 검토 후 이름·날짜를 채운다. */
export const KR_RULES_REVIEWED: { by: string | null; date: string | null } = { by: null, date: null };

export const KR_SOURCES = {
  law: "체외진단의료기기법·시행규칙 (등급 분류 기준 — 개인 위해도·공중보건 위해도)",
  notice: "「체외진단의료기기 품목 및 품목별 등급에 관한 규정」(식약처 고시)",
  selfTest: "같은 고시 개정 (제2026-45호, 2026-06-30) — 자가검사용 품목 신설 보도 자료 기준",
};

/**
 * 자가검사용으로 허가받을 수 있다고 확인한 품목 (고시에 품목이 있어야 자가검사용 허가 가능).
 * 2차 자료(보도)로 확인한 것만 넣는다. 기존 9개 품목 전체 목록은 아직 확인하지 못했다.
 */
export const KR_SELF_TEST_ITEMS: { key: string; label: string; re: RegExp; source: string; checked: string }[] = [
  { key: "hcg", label: "임신 (hCG)", re: /hCG|임신|융모성/i, source: "기존 허용 9개 품목 중 하나 (보도)", checked: "2026-10-29" },
  { key: "glucose", label: "혈당", re: /혈당|포도당|glucose/i, source: "기존 허용 9개 품목 중 하나 (보도)", checked: "2026-10-29" },
  { key: "covid", label: "코로나19", re: /코로나|COVID|SARS-CoV-2/i, source: "기존 허용 9개 품목 중 하나 (보도)", checked: "2026-10-29" },
  { key: "flu", label: "인플루엔자", re: /인플루엔자|독감|influenza/i, source: "2026-06-30 신설 (고시 제2026-45호)", checked: "2026-10-29" },
  { key: "drug", label: "마약류 대사체", re: /마약|대사체|drug/i, source: "2026-06-30 신설 (고시 제2026-45호)", checked: "2026-10-29" },
];
const STI_RE = /성매개|성병|클라미디아|임질|매독|HIV|STI/i;

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

const LABEL = {
  1: "1등급 — 신고 (한국의료기기안전정보원)",
  2: "2등급 — 인증 (한국의료기기안전정보원)",
  3: "3등급 — 허가 (식품의약품안전처)",
  4: "4등급 — 허가 (식품의약품안전처)",
} as const;

export function krRouteLabel(g: KrGrade | null): string {
  return g ? LABEL[g] : "등급을 확인하면 신고·인증·허가 중 어느 경로인지 정해집니다.";
}

const isLay = (s: ProductSpec) => s.user === "lay" || s.user === "both";
/** 분석물 이름으로만 품목을 찾는다 — 임상적 판단 문장("임신 시도 시기")은 다른 품목과 헷갈린다 */
const analyteText = (s: ProductSpec) => (s.analyte.preset === "LH" ? "LH 배란" : s.analyte.preset === "hCG" ? "hCG 임신" : s.analyte.name ?? "");

export function krSelfTest(s: ProductSpec): KrSelfTest {
  const labelling = ["외부 포장에 '자가검사용' 표시", "'확진용이 아닌 보조검사용' 주의 문구 (표시 의무화 예정 — 시행일 확인 필요)"];
  if (!isLay(s)) return { status: "not-applicable", item: null, reason: s.user === null ? "사용자가 입력되지 않았습니다." : "전문가용 — 자가검사 품목 제한 대상 아님", labelling: [] };
  const text = analyteText(s);
  if (STI_RE.test(text)) return { status: "check", item: "성매개감염", reason: "성매개감염 자가검사는 2026-06 개정에서 보류됐습니다 — 추가 검토 결과 확인 필요", labelling };
  const hit = KR_SELF_TEST_ITEMS.find((i) => i.re.test(text));
  if (hit) return { status: "allowed", item: hit.label, reason: `자가검사용 허용 품목 — ${hit.source}. 원문 확인 필요`, labelling };
  return {
    status: "check",
    item: s.analyte.name,
    reason: `${josa(s.analyte.name ?? "이 분석물", "이", "가")} 고시의 자가검사용 품목에 있는지 확인하지 못했습니다. 품목이 없으면 자가검사용으로 허가받을 수 없습니다 (전문가용으로 허가하거나 품목 신설 요청).`,
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
    rationale.push("제품 유형이 입력되지 않았습니다.");
    openQuestions.push("productType");
    return finish(null, "blocked", "—");
  }
  if (s.productType === "instrument") {
    rationale.push("분석기·범용 기기는 낮은 등급(1등급) 후보입니다. 측정 항목·전용 여부에 따라 달라 품목 분류로 확인해야 합니다.");
    return finish("1", "provisional", "기기 (위해도 낮음)");
  }

  const f = s.rule1to3Flags;
  (Object.keys(f) as (keyof typeof f)[]).forEach((k) => { if (f[k] === null) openQuestions.push(`rule1to3Flags.${k}`); });

  if (f.transmissibleAgent) {
    rationale.push("감염병 검출 제품입니다. 수혈·이식 안전성이나 전파 위험이 큰 감염병이면 개인·공중보건 위해도가 모두 높아 4등급, 그 외는 3등급 후보입니다.");
    rationale.push("질환별 판단이 필요해 앱이 정하지 않습니다. 품목 분류로 확인해 주세요.");
    return finish(null, "needs-review", "개인·공중보건 위해도 (4 또는 3등급)");
  }

  let grade: KrGrade | null = null;
  let rule = "";
  const up = (g: KrGrade, r: string, why: string) => {
    rationale.push(why);
    if (!grade || Number(g) > Number(grade)) { grade = g; rule = r; }
  };
  if (f.bloodGrouping || f.tissueTyping) up("3", "혈액형·조직형", "혈액형·조직 적합성 판정은 개인 위해도가 높아 3등급 후보입니다 (일부 표지자는 4등급 — 확인 필요).");
  const r3 = [f.geneticTesting && "유전자 검사", f.cancerScreening && "암 선별·진단", f.companionDiagnostic && "동반진단", f.congenitalScreening && "선천성 질환 선별", f.lifeThreatening && "생명위협 상태"].filter(Boolean);
  if (r3.length) up("3", "개인 위해도 높음", `${r3.join(", ")} — 결과 오류의 개인 위해도가 높아 3등급 후보입니다.`);

  if (s.user === null) {
    rationale.push("사용자(일반인 자가검사 / 전문가)가 입력되지 않아 등급을 정할 수 없습니다.");
    openQuestions.unshift("user");
    return finish(grade, "blocked", rule || "—");
  }
  if (isLay(s)) {
    const p = s.analyte.preset;
    if (p === "LH" || p === "hCG") up("2", "자가검사 — 저위해 품목", `일반인 자가검사는 원칙적으로 높은 등급이지만, ${p === "LH" ? "배란(가임력)" : "임신"} 검사는 결과 오류의 위해가 낮아 2등급 후보입니다 (품목 분류로 확인 필요).`);
    else {
      up("3", "자가검사", "일반인 자가검사는 결과 오류를 전문가가 걸러 주지 못해 3등급 후보입니다. 혈당 등 일부 품목은 다를 수 있어 품목 분류로 확인해야 합니다.");
      if (p === null) openQuestions.push("analyte.preset");
    }
  } else if (!grade) {
    up("2", "그 밖의 전문가용 시약", "위 기준에 해당하지 않는 전문가용 시약은 2등급 후보입니다.");
  }

  rationale.push("국내 등급은 식약처 고시의 품목별 등급으로 최종 정해집니다. 이 추천은 품목을 찾기 위한 출발점입니다.");
  // 국내 규칙은 원문 대조 전이라 담당자 검토 전에는 항상 잠정
  return finish(grade, KR_RULES_REVIEWED.by && !openQuestions.length ? "recommended" : "provisional", rule);
}

function krSteps(s: ProductSpec, g: KrGrade | null): string[] {
  const lay = isLay(s);
  return [
    g === null ? "품목 분류 검색으로 품목명·등급 확인 (의료기기안전정보원 품목분류 데이터)" : `품목·등급 확정: ${g}등급 (품목 분류 코드 기록)`,
    "KGMP(체외진단의료기기 제조 및 품질관리 기준) 적합인정 — 제조소 심사",
    "기술문서 작성·심사 — 사용 목적, 작용 원리, 원재료, 제조 방법, 성능, 시험 규격, 저장 방법·사용 기간 등",
    g === "3" || g === "4" ? "임상적 성능시험 — 식약처 지정 임상적 성능시험기관에서 수행 (계획 승인 대상 여부 확인)" : "임상적 성능시험 자료 필요 여부 확인 (등급·품목에 따라 다름)",
    ...(lay ? ["자가검사용 허용 품목 확인 + '자가검사용'·'보조검사용' 표시"] : []),
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
  const d: KrDoc[] = [
    { id: "kr-tech", title: "기술문서 (사용 목적·작용 원리·원재료·제조 방법·성능·시험 규격·저장 방법·사용 방법·주의사항·포장 단위)", status: "required", reason: "신고·인증·허가 모두 기술문서 심사(또는 검토)를 받습니다.", reuse: ["kr-technical-doc", "device-description", "intended-purpose"] },
    { id: "kr-analytical", title: "분석적 성능시험 자료", status: "required", reason: "검출한계·정밀도·특이도(교차반응·간섭) 등 분석 성능 근거", reuse: ["analytical-performance"] },
    {
      id: "kr-clinical", title: "임상적 성능시험 자료",
      status: g === "3" || g === "4" ? "required" : "check",
      reason: g === "3" || g === "4" ? "3·4등급은 임상적 성능시험 자료가 필요합니다 (지정 시험기관)." : "등급·품목에 따라 필요 여부가 다릅니다 — 품목 확인 후 판정",
      reuse: ["clinical-performance", "performance-eval-plan"],
    },
    { id: "kr-stability", title: "안정성 시험 자료 (저장 방법·사용 기간 근거)", status: "required", reason: "기술문서의 저장 방법·사용 기간을 뒷받침합니다.", reuse: ["stability-study"] },
    { id: "kr-kgmp", title: "KGMP 적합인정", status: "required", reason: "제조소 품질관리 기준 심사 — 1등급 포함 필요 여부와 심사 종류는 원문 확인", reuse: ["quality-manual"] },
    { id: "kr-label", title: `표시기재 (용기·포장·첨부문서)${lay ? " — 자가검사 문구 포함" : ""}`, status: "required", reason: lay ? "'자가검사용'·'확진용이 아닌 보조검사용' 표시 포함" : "제품명·제조번호·사용 기간·저장 방법 등", reuse: ["labelling-spec", "ifu"] },
    { id: "kr-udi", title: "UDI 표시·등록", status: "required", reason: "체외진단의료기기 UDI 적용 — 등급별 시행 시점 확인", reuse: ["udi-assignment"] },
    { id: "kr-selftest", title: "자가검사용 허용 품목 확인 기록", status: lay ? (kr.selfTest.status === "allowed" ? "required" : "check") : "excluded", reason: lay ? kr.selfTest.reason : "전문가용", reuse: [] },
    { id: "kr-import", title: "수입업 허가·국내 수입자 (해외 제조 시)", status: foreign === null ? "check" : foreign ? "required" : "excluded", reason: foreign === null ? "제조국이 입력되지 않았습니다." : foreign ? "해외 제조 — 국내 수입업자가 신고·인증·허가를 받습니다." : "국내 제조", reuse: [] },
    { id: "kr-risk", title: "위험관리 자료", status: "required", reason: "기술문서·KGMP에서 위험관리 근거를 확인합니다.", reuse: ["risk-management-plan", "risk-management-file"] },
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
