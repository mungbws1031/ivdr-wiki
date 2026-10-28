// =====================================================================
// src/lib/tokens.ts
// 문서 템플릿의 {{auto.키}} 자리를 제품 스펙(+ 분류 결과)으로 채운다. 순수 함수.
// 값이 없으면 지어내지 않고 "[제품명 — 스펙 미입력]"처럼 남긴다.
// 토큰에 "|" 를 쓰지 않는다 — 개념 링크 {{slug|표시}} 문법과 겹치지 않게.
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import { composeIntendedPurpose } from "../data/spec/validate";
import { classify, type ClassResult } from "./rules/classify";
import { transportTokens } from "./transport";
import { plannerTokens } from "./planner";
import { resultsTokens, type ResultsMap } from "./results";

const TOKEN_RE = /\{\{auto\.([a-zA-Z]+)\}\}/g;

const SPECIMEN: Record<string, string> = { urine: "소변", "capillary-blood": "모세혈(손끝)", "venous-blood": "정맥혈", saliva: "타액", swab: "면봉 채취 검체", other: "기타 검체" };
const KIND: Record<string, string> = { qualitative: "정성 (양성/음성)", "semi-quantitative": "반정량", quantitative: "정량" };
const READOUT: Record<string, string> = { visual: "육안 판독", reader: "전용 리더기", app: "스마트폰 앱" };
const USER: Record<string, string> = { lay: "일반인 (자가검사)", professional: "전문가", both: "일반인·전문가" };
const ENV: Record<string, string> = { home: "가정", "near-patient": "근접검사 (약국·진료실)", lab: "검사실" };
const PTYPE: Record<string, string> = { "reagent-kit": "반응키트 (시약·키트)", instrument: "분석기 (기기)", software: "소프트웨어", accessory: "부속품" };
const MARKET: Record<string, string> = { EU: "EU (IVDR)", KR: "한국 (MFDS)", US: "미국 (FDA)", CA: "캐나다", AU: "호주", JP: "일본", BR: "브라질" };

/** 토큰별 사람이 읽는 이름 — 미입력 표시와 화면 안내에 쓴다. */
export const TOKEN_LABEL: Record<string, string> = {
  productName: "제품명", model: "모델", manufacturer: "제조자", manufacturerCountry: "제조국", basicUdiDi: "Basic UDI-DI",
  productType: "제품 유형", analyte: "분석물", cutoff: "Cut-off", specimen: "검체", resultKind: "결과 형태", readout: "판독 방식",
  user: "사용자", environment: "사용 환경", clinicalDecision: "결과로 내리는 판단", targetPopulation: "대상 집단", outOfScope: "사용하면 안 되는 용도",
  intendedPurpose: "의도된 목적", ivdJustification: "IVD 해당 근거",
  cls: "클래스", rule: "결정 규칙", rationale: "분류 근거", ruleTable: "Rule 적용 내역", route: "적합성 평가 경로", nb: "NB 개입", nbScope: "NB 심사 대상",
  storage: "보관 온도", shelfLife: "유효기간", openedStability: "개봉 후 사용 시한", components: "구성품", authRep: "EU 대리인", markets: "출시 시장",
  targetSe: "목표 민감도", targetSp: "목표 특이도", referenceMethod: "비교 기준 방법", lots: "평가 로트 수",
  swScope: "소프트웨어 범위", transportRoute: "운송 경로·조건", transportStandards: "적용 규격", packagingSpec: "포장 구성", transportTests: "운송 시험 순서",
  transportAcceptance: "운송 판정 기준", transportProcess: "운송 과정 관리",
  studyList: "실험 목록", analyticalPlan: "분석 성능 실험 설계", analyticalAcceptance: "분석 성능 판정 기준", analyticalResults: "분석 성능 결과",
  stabilityPlan: "안정성 실험 설계", stabilityResults: "안정성 결과", clinicalPlan: "임상 성능 연구 설계",
  clinicalAcceptance: "임상 성능 판정 기준", sampleSize: "표본수", studySchedule: "실험 일정",
  clinicalResults: "임상 성능 결과", stabilityConclusion: "입증된 유효기간", transportResults: "운송 시험 결과",
};

const yn = (b: boolean | null, yes: string, no: string) => (b === null ? null : b ? yes : no);

function ruleTable(s: ProductSpec, c: ClassResult): string {
  const f = s.rule1to3Flags;
  const ask = "[답변 필요 — 제품 스펙의 분류 판단 질문]";
  const r3 = [
    f.geneticTesting && "유전자 검사", f.cancerScreening && "암 선별·진단", f.companionDiagnostic && "동반진단",
    f.congenitalScreening && "선천성 질환 선별", f.lifeThreatening && "생명위협 상태",
  ].filter(Boolean);
  const r3Unknown = [f.geneticTesting, f.cancerScreening, f.companionDiagnostic, f.congenitalScreening, f.lifeThreatening].some((x) => x === null);
  const lay = s.user === "lay" || s.user === "both";
  const exception = s.analyte.preset === "LH" || s.analyte.preset === "hCG";
  const lines = [
    `Rule 1: ${f.transmissibleAgent === null ? ask : f.transmissibleAgent ? "해당 가능 — 감염병 검출 (RA 판단 필요)" : "비해당 — 전파성 병원체를 검출하지 않음"}`,
    `Rule 2: ${f.bloodGrouping === null || f.tissueTyping === null ? ask : f.bloodGrouping || f.tissueTyping ? "해당 — 혈액형·조직 적합성 판정" : "비해당 — 혈액형·조직 적합성을 판정하지 않음"}`,
    `Rule 3: ${r3.length ? `해당 — ${r3.join(", ")}` : r3Unknown ? ask : "비해당 — 유전자·암·동반진단·선천성 선별·생명위협 상태에 해당하지 않음"}`,
    `Rule 4(자가/근접검사): ${s.user === null ? ask : lay ? (exception ? `해당 — 일반인 자가검사이나 ${s.analyte.preset === "LH" ? "가임력(배란)" : "임신"} 검사 예외로 B` : "해당 — 일반인 자가검사로 C") : "비해당 — 전문가용"}`,
    `Rule 5: ${s.productType === "instrument" ? "해당 — IVD 전용 기기" : "비해당 — 특정 분석물 검출 시약 (범용 실험실 시약·기기·검체 용기 아님)"}`,
    `Rule 6: ${c.rule === "Rule 6" ? "해당 — 다른 규칙에 해당하지 않음" : "비해당 — 앞선 규칙이 적용됨"}`,
    `Rule 7: 비해당 — 지정값 없는 관리물질이 아님`,
  ];
  return lines.join("\n");
}

/** 소프트웨어 구성과 분류 연결 — 판독 방식·앱·MDSW 여부로 조립. 모르면 null. */
function swScope(s: ProductSpec, c: ClassResult): string | null {
  const { hasApp, isMdsw } = s.software;
  const r = s.result.readout;
  if (hasApp === null && r === null) return null;
  const parts: string[] = [];
  if (r === "reader") parts.push("전용 리더기 펌웨어 (결과 판독)");
  if (r === "app" || hasApp) parts.push(`스마트폰 앱${isMdsw ? " — 결과를 판정·해석하므로 의료기기 소프트웨어(MDSW)" : isMdsw === false ? " — 결과 판정을 하지 않는 보조 앱" : " — MDSW 해당 여부 [확인 필요]"}`);
  if (!parts.length) return "소프트웨어 없음 (육안 판독, 앱 미제공)";
  const cls = c.value ? `Class ${c.value}` : "[클래스 — 확정 전]";
  return `${parts.join(" / ")}\n분류: 기기를 구동하거나 사용에 영향을 주는 소프트웨어는 그 기기와 같은 클래스(${cls})를 따르고, 독립 소프트웨어는 따로 분류한다 (IVDR Annex VIII 1.4).`;
}

/** 스펙 + 분류 결과 + 실험 결과 → 토큰 값. null 은 "스펙 미입력". */
export function buildTokenContext(s: ProductSpec, c: ClassResult = classify(s), results: ResultsMap = {}): Record<string, string | null> {
  const id = s.identity;
  const cutoff = s.analyte.cutoffValue !== null ? `${s.analyte.cutoffValue}${s.analyte.cutoffUnit ? ` ${s.analyte.cutoffUnit}` : ""}` : null;
  const st = s.storage;
  const comps = s.kitComponents.filter((k) => k.name.trim());
  return {
    productName: id.productName, model: id.model, manufacturer: id.manufacturerName, manufacturerCountry: id.manufacturerCountry,
    basicUdiDi: id.basicUdiDi,
    productType: s.productType ? PTYPE[s.productType] : null,
    analyte: s.analyte.name, cutoff,
    specimen: s.specimen ? SPECIMEN[s.specimen] : null,
    resultKind: s.result.kind ? KIND[s.result.kind] : null,
    readout: s.result.readout ? READOUT[s.result.readout] : null,
    user: s.user ? USER[s.user] : null,
    environment: s.environment ? ENV[s.environment] : null,
    clinicalDecision: s.intendedPurpose.clinicalDecision, targetPopulation: s.intendedPurpose.targetPopulation,
    outOfScope: s.intendedPurpose.outOfScope,
    intendedPurpose: composeIntendedPurpose(s),
    ivdJustification: s.specimen && s.analyte.name
      ? `해당 — 인체 유래 검체(${SPECIMEN[s.specimen]})를 체외에서 검사해 ${s.analyte.name} 정보를 제공하는 ${s.productType === "instrument" ? "기기" : "시약"}이므로 IVDR Art.2(2) 정의에 해당한다.`
      : null,
    cls: c.value, rule: c.value ? c.rule : null,
    rationale: c.rationale.length ? c.rationale.join(" ") : null,
    ruleTable: ruleTable(s, c),
    route: c.route.length ? c.route.map((r) => `- ${r}`).join("\n") : null,
    nb: c.value === null ? null : c.value === "A" && s.sterile !== true ? "불필요 — Class A 비멸균 (자기선언)" : `필요 — Class ${c.value}${c.value === "A" ? " 멸균 (멸균 측면)" : ""}`,
    nbScope: c.route.length ? c.route.join(" / ") : null,
    storage: st.tempMinC !== null && st.tempMaxC !== null ? `${st.tempMinC}–${st.tempMaxC}℃` : null,
    shelfLife: st.shelfLifeMonths !== null ? `${st.shelfLifeMonths}개월 (목표 — 안정성 시험으로 확정)` : null,
    openedStability: st.openedStabilityMin !== null ? `파우치 개봉 후 ${st.openedStabilityMin}분 이내 사용` : null,
    components: comps.length ? comps.map((k) => `- ${k.name}${k.qtyPerKit !== null ? ` × ${k.qtyPerKit}` : ""}${k.isReagent ? " (시약 포함)" : ""}`).join("\n") : null,
    authRep: yn(id.manufacturerIsEU, "해당 없음 (EU 역내 제조자)", "필요 — EU 대리인 이름·주소: [____]"),
    markets: s.markets?.length ? s.markets.map((m) => MARKET[m] ?? m).join(", ") : null,
    targetSe: s.targets.sensitivity !== null ? `${s.targets.sensitivity}%` : null,
    targetSp: s.targets.specificity !== null ? `${s.targets.specificity}%` : null,
    referenceMethod: s.referenceMethod.name,
    lots: s.targets.lots !== null ? `${s.targets.lots}로트` : null,
    swScope: swScope(s, c),
    ...transportTokens(s),
    ...plannerTokens(s),
    ...resultsTokens(s, results),
  };
}

/** 텍스트 안의 {{auto.키}}를 채운다. 모르는 값은 [이름 — 스펙 미입력]. */
export function fillTokens(text: string, ctx: Record<string, string | null>): string {
  return text.replace(TOKEN_RE, (_m, key: string) => {
    const v = ctx[key];
    if (v !== null && v !== undefined && v !== "") return v;
    return `[${TOKEN_LABEL[key] ?? key} — 스펙 미입력]`;
  });
}

export function hasTokens(text: string): boolean {
  TOKEN_RE.lastIndex = 0;
  return TOKEN_RE.test(text);
}

/** 이 텍스트에서 비어 있는 토큰 이름 목록. */
export function missingTokens(text: string, ctx: Record<string, string | null>): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(TOKEN_RE)) {
    const v = ctx[m[1]];
    if (v === null || v === undefined || v === "") out.add(m[1]);
  }
  return [...out];
}

/** 문서 템플릿의 모든 섹션 예시(placeholder)를 스펙으로 채운 사본. 토큰이 없으면 원본 그대로. */
export function fillDoc<T extends { sections: { placeholder: string }[] }>(doc: T, ctx: Record<string, string | null>): T {
  if (!doc.sections.some((s) => hasTokens(s.placeholder))) return doc;
  return { ...doc, sections: doc.sections.map((s) => ({ ...s, placeholder: fillTokens(s.placeholder, ctx) })) };
}

/** 문서 전체에서 비어 있는 토큰 이름 (중복 제거). */
export function docMissingTokens(doc: { sections: { placeholder: string }[] }, ctx: Record<string, string | null>): string[] {
  return [...new Set(doc.sections.flatMap((s) => missingTokens(s.placeholder, ctx)))];
}
