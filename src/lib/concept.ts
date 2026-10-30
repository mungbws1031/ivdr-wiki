// =====================================================================
// src/lib/concept.ts
// 컨셉 한 줄 → 제품 스펙 추정값. "집에서 쓰는 소변 LH 스틱, 스마트폰 앱 연동" 같은 대충 입력에서
// 키워드로 값을 뽑는다 (AI 없음). 뽑은 값은 사람이 확인하기 전까지 '추정'이다.
// 비어 있는 칸만 채우고, 사람이 넣은 값은 덮어쓰지 않는다.
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import { setAt } from "../data/spec/validate";

export interface ConceptHit {
  path: string;
  value: unknown;
  /** 화면에 보여줄 값 */
  shown: string;
  /** 근거가 된 단어 */
  word: string;
}

interface Rule {
  path: string;
  value: unknown;
  shown: string;
  re: RegExp;
}

// 위에서부터 먼저 맞는 규칙을 쓴다 (같은 path는 하나만)
const RULES: Rule[] = [
  // 제품 형태 — 구체적인 것부터
  { path: "formFactor", value: "strip-only", shown: "스틱·스트립만 (기기 없이)", re: /스틱\s*만|스트립\s*만|기기\s*없이|육안/ },
  { path: "formFactor", value: "lab-analyzer", shown: "병원·검사실 대형 장비", re: /대형|분석기|분석 장비|자동화 장비|analy[sz]er/i },
  { path: "formFactor", value: "poct", shown: "POCT 기기", re: /POCT|현장\s*검사|약국|진료실/i },
  { path: "formFactor", value: "strip-reader", shown: "스틱 + 개인용 리더기", re: /리더기|reader|측정기/i },
  { path: "formFactor", value: "personal-device", shown: "개인용 진단 기기", re: /일체형|휴대용|개인용\s*(진단\s*)?기기/ },
  { path: "formFactor", value: "strip-only", shown: "스틱·스트립만", re: /스틱|스트립|테스트기|strip/i },
  // 검체
  { path: "specimen", value: "urine", shown: "소변", re: /소변|urine/i },
  { path: "specimen", value: "capillary-blood", shown: "모세혈(손끝)", re: /손끝|지두혈|모세혈|채혈침|finger/i },
  { path: "specimen", value: "venous-blood", shown: "정맥혈", re: /정맥혈|혈청|혈장|serum|plasma/i },
  { path: "specimen", value: "saliva", shown: "타액", re: /타액|침\s|saliva/i },
  { path: "specimen", value: "swab", shown: "면봉 채취 검체", re: /면봉|비강|비인두|swab/i },
  // 분석물 (측정 목적이 등급을 가른다)
  { path: "analyte.preset", value: "LH", shown: "LH (배란)", re: /\bLH\b|배란|황체형성/i },
  { path: "analyte.preset", value: "hCG", shown: "hCG (임신)", re: /hCG|임신/i },
  { path: "analyte.preset", value: "glucose", shown: "혈당", re: /혈당|포도당|글루코스|glucose/i },
  { path: "analyte.preset", value: "cholesterol", shown: "콜레스테롤", re: /콜레스테롤|cholesterol/i },
  { path: "analyte.preset", value: "urine-cells", shown: "소변 일반 검사 (적혈구·백혈구·세균)", re: /잠혈|백혈구|아질산|요검사|소변\s*일반|요로\s*감염/ },
  // 사용자·환경
  { path: "user", value: "professional", shown: "전문가", re: /전문가|의료진|임상\s*검사실|병원용/ },
  { path: "user", value: "lay", shown: "일반인 (자가검사)", re: /집에서|가정|자가|셀프|개인|home|self/i },
  { path: "environment", value: "lab", shown: "검사실", re: /검사실|병원|대형|lab/i },
  { path: "environment", value: "near-patient", shown: "근접검사 (약국·진료실)", re: /약국|진료실|POCT|현장/i },
  { path: "environment", value: "home", shown: "가정", re: /집에서|가정|home/i },
  // 결과·판독·소프트웨어
  { path: "result.kind", value: "quantitative", shown: "정량", re: /정량|수치|농도|측정값|quantitative/i },
  { path: "result.kind", value: "qualitative", shown: "정성 (양성/음성)", re: /정성|양성|음성|qualitative/i },
  { path: "assay.method", value: "lateral-flow", shown: "측방유동 면역크로마토그래피", re: /면역크로마토|측방\s*유동|래피드|lateral/i },
  { path: "assay.method", value: "fluorescence", shown: "형광 면역분석", re: /형광|fluoresc/i },
  { path: "assay.method", value: "electrochemical", shown: "전기화학", re: /전기화학|바이오센서|electrochem/i },
  { path: "assay.method", value: "molecular", shown: "분자진단", re: /PCR|등온|LAMP|분자진단/i },
  { path: "result.readout", value: "app", shown: "스마트폰 앱", re: /앱|스마트폰|어플|app/i },
  { path: "result.readout", value: "reader", shown: "전용 리더기", re: /리더기|reader|측정기/i },
  { path: "result.readout", value: "visual", shown: "육안 판독", re: /육안|눈으로/ },
  { path: "software.hasApp", value: true, shown: "앱 있음", re: /앱|스마트폰|어플|app/i },
  // 출시 시장
  { path: "markets", value: ["EU"], shown: "EU (IVDR)", re: /유럽|EU|CE|IVDR/i },
  { path: "markets", value: ["KR"], shown: "한국 (MFDS)", re: /한국|국내|식약처|MFDS/i },
  { path: "markets", value: ["US"], shown: "미국 (FDA)", re: /미국|FDA/i },
  // 재질
  { path: "materials", value: ["plastic"], shown: "플라스틱", re: /플라스틱|plastic/i },
];

const ANALYTE_NAME: Record<string, string> = {
  LH: "황체형성호르몬(LH)", hCG: "인간 융모성 생식선 자극호르몬(hCG)", glucose: "혈중 포도당(혈당)", cholesterol: "총 콜레스테롤", "urine-cells": "소변 적혈구·백혈구·아질산(세균)",
};
const DECISION: Record<string, string> = {
  LH: "배란 시기 예측 (가임기 확인)", hCG: "임신 여부 확인", glucose: "혈당 관리 (식사·약물 조절 판단 보조)",
  cholesterol: "콜레스테롤 수치 확인 (진료 필요 여부 판단 보조)", "urine-cells": "요로 감염·혈뇨 가능성 확인 (진료 필요 여부 판단 보조)",
};

function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/** 컨셉 문장에서 뽑은 값들. 시장·재질은 여러 개를 모은다. */
export function parseConcept(text: string): ConceptHit[] {
  const hits: ConceptHit[] = [];
  const t = ` ${text} `;
  for (const r of RULES) {
    const m = t.match(r.re);
    if (!m) continue;
    const prev = hits.find((h) => h.path === r.path);
    if (prev) {
      if (Array.isArray(prev.value) && Array.isArray(r.value) && !prev.value.includes(r.value[0])) {
        prev.value = [...prev.value, ...r.value];
        prev.shown = `${prev.shown}, ${r.shown}`;
        prev.word = `${prev.word}, ${m[0].trim()}`;
      }
      continue;
    }
    hits.push({ path: r.path, value: r.value, shown: r.shown, word: m[0].trim() });
  }
  const preset = hits.find((h) => h.path === "analyte.preset")?.value as string | undefined;
  if (preset) {
    hits.push({ path: "analyte.name", value: ANALYTE_NAME[preset], shown: ANALYTE_NAME[preset], word: preset });
    hits.push({ path: "intendedPurpose.clinicalDecision", value: DECISION[preset], shown: DECISION[preset], word: preset });
  }
  // 스틱만이고 검사 방식을 말하지 않았으면 측방유동으로 본다 (추정)
  if (hits.some((h) => h.path === "formFactor" && h.value === "strip-only") && !hits.some((h) => h.path === "assay.method"))
    hits.push({ path: "assay.method", value: "lateral-flow", shown: "측방유동 면역크로마토그래피", word: "스틱" });
  // 병원 대형 장비면 사용자는 전문가로 본다 (따로 말하지 않았을 때)
  if (hits.some((h) => h.path === "formFactor" && h.value === "lab-analyzer") && !hits.some((h) => h.path === "user"))
    hits.push({ path: "user", value: "professional", shown: "전문가", word: "대형 장비" });
  // 시약 키트로 보는 신호 (기기 자체 분류는 다음 단계 지원)
  if (/스틱|스트립|키트|테스트|시약|검사|진단|측정/.test(text)) hits.push({ path: "productType", value: "reagent-kit", shown: "시약·키트", word: "검사·키트" });
  return hits;
}

/** 분석물 종류(LH·hCG)를 고르면 따라 정해지는 칸 — 정식 명칭·결과로 내리는 판단 */
export function presetHits(preset: string): ConceptHit[] {
  if (!ANALYTE_NAME[preset]) return [];
  return [
    { path: "analyte.name", value: ANALYTE_NAME[preset], shown: ANALYTE_NAME[preset], word: preset },
    { path: "intendedPurpose.clinicalDecision", value: DECISION[preset], shown: DECISION[preset], word: preset },
  ];
}

/** 비어 있는 칸만 채운 스펙과, 실제로 채운 항목(= 추정). 사람이 넣은 값은 그대로 둔다. */
export function applyConcept(s: ProductSpec, hits: ConceptHit[]): { spec: ProductSpec; applied: ConceptHit[] } {
  let spec = s;
  const applied: ConceptHit[] = [];
  for (const h of hits) {
    const cur = getAt(spec, h.path);
    if (cur !== null && cur !== undefined && !(Array.isArray(cur) && cur.length === 0) && cur !== "") continue;
    spec = setAt(spec, h.path, h.value);
    applied.push(h);
  }
  return { spec, applied };
}

/** 등급·문서 세트를 바꾸는데 아직 비어 있는 칸 — 영향이 큰 순서로 최대 n개 질문. */
export const DECISION_FIELDS = ["analyte.preset", "user", "formFactor", "specimen", "result.kind", "markets", "software.hasApp", "rule1to3Flags.transmissibleAgent"];

export function openQuestions(s: ProductSpec, n = 5): string[] {
  return DECISION_FIELDS.filter((p) => {
    const v = getAt(s, p);
    return v === null || v === undefined || (Array.isArray(v) && v.length === 0);
  }).slice(0, n);
}
