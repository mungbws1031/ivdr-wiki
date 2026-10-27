// =====================================================================
// src/data/spec/fields.ts
// 제품 스펙 필드 정의 — 폼·진행률·미입력 목록이 전부 여기서 나온다.
// 항목을 늘릴 때는 types.ts 에 키를 추가하고 여기에 한 줄을 추가한다.
// usedBy: 이 값을 쓰는 문서(docTree 잎 id). 다음 단계에서 "막힌 문서" 계산에 쓴다.
// =====================================================================

export type FieldKind = "text" | "textarea" | "number" | "select" | "tri" | "multi" | "components";

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean; // 1차 범위 밖 (예: 기기)
  hint?: string;
}

export interface FieldDef {
  path: string; // ProductSpec 안의 점 경로
  label: string;
  help?: string;
  kind: FieldKind;
  options?: FieldOption[];
  unit?: string;
  placeholder?: string;
  optional?: boolean; // 진행률·미입력 집계에서 제외
  usedBy: string[];
}

export interface FieldSection {
  id: string;
  title: string;
  desc: string;
  fields: FieldDef[];
}

const YES_NO_TRI: FieldOption[] = [
  { value: "true", label: "예" },
  { value: "false", label: "아니오" },
];

export const specSections: FieldSection[] = [
  {
    id: "identity",
    title: "제품 정보",
    desc: "모든 문서의 머리말·라벨·DoC에 들어갑니다.",
    fields: [
      { path: "identity.productName", label: "제품명", kind: "text", placeholder: "예: Surearly LH 배란 테스트", usedBy: ["intended-purpose", "device-description", "labelling-spec", "ifu", "declaration-of-conformity"] },
      { path: "identity.model", label: "모델 / 카탈로그 번호", kind: "text", placeholder: "예: SE-LH-01", usedBy: ["device-description", "labelling-spec", "declaration-of-conformity"] },
      { path: "identity.manufacturerName", label: "제조자", kind: "text", usedBy: ["labelling-spec", "ifu", "declaration-of-conformity"] },
      { path: "identity.manufacturerCountry", label: "제조국", kind: "text", placeholder: "예: 대한민국", usedBy: ["declaration-of-conformity", "authorised-rep-mandate"] },
      { path: "identity.manufacturerIsEU", label: "EU 역내 제조자인가요?", help: "역외 제조자는 EU 대리인(Authorised Representative)이 필요합니다.", kind: "tri", options: YES_NO_TRI, usedBy: ["authorised-rep-mandate", "labelling-spec"] },
      { path: "identity.basicUdiDi", label: "Basic UDI-DI", help: "아직 발급 전이면 비워두세요. EUDAMED 등록 단계에서 필요합니다.", kind: "text", optional: true, usedBy: ["udi-assignment", "declaration-of-conformity"] },
    ],
  },
  {
    id: "type",
    title: "제품 구분",
    desc: "기기와 시약은 분류 규칙과 필요한 문서가 다릅니다.",
    fields: [
      {
        path: "productType", label: "제품 유형", kind: "select", usedBy: ["classification-rationale", "device-description"],
        options: [
          { value: "reagent-kit", label: "시약·키트" },
          { value: "instrument", label: "기기", disabled: true, hint: "다음 단계 지원" },
          { value: "software", label: "소프트웨어", disabled: true, hint: "다음 단계 지원" },
          { value: "accessory", label: "부속품", disabled: true, hint: "다음 단계 지원" },
        ],
      },
    ],
  },
  {
    id: "analyte",
    title: "분석 대상",
    desc: "무엇을 검출하는지. 분류(가임력·임신 예외)와 교차반응 물질 목록이 여기서 정해집니다.",
    fields: [
      {
        path: "analyte.preset", label: "분석물 종류", kind: "select", usedBy: ["classification-rationale", "analytical-performance"],
        options: [
          { value: "LH", label: "LH (배란)" },
          { value: "hCG", label: "hCG (임신)" },
          { value: "other", label: "기타" },
        ],
      },
      { path: "analyte.name", label: "분석물 정식 명칭", kind: "text", placeholder: "예: 황체형성호르몬(LH)", usedBy: ["intended-purpose", "ifu", "analytical-performance"] },
      { path: "analyte.cutoffValue", label: "Cut-off", help: "정성 검사에서 양성/음성을 가르는 농도.", kind: "number", usedBy: ["analytical-performance", "labelling-spec", "ifu"] },
      { path: "analyte.cutoffUnit", label: "Cut-off 단위", kind: "text", placeholder: "예: mIU/mL", usedBy: ["analytical-performance", "labelling-spec"] },
    ],
  },
  {
    id: "specimen",
    title: "검체 · 결과",
    desc: "실험 설계(간섭 물질, 시료 수)와 IFU 내용이 달라집니다.",
    fields: [
      {
        path: "specimen", label: "검체", kind: "select", usedBy: ["intended-purpose", "analytical-performance", "ifu", "biocompatibility"],
        options: [
          { value: "urine", label: "소변" },
          { value: "capillary-blood", label: "모세혈(손끝)" },
          { value: "venous-blood", label: "정맥혈" },
          { value: "saliva", label: "타액" },
          { value: "swab", label: "면봉 채취" },
          { value: "other", label: "기타" },
        ],
      },
      {
        path: "result.kind", label: "결과 형태", help: "정성이면 CLSI EP12, 정량이면 EP05·EP17 등으로 실험계획이 갈립니다.", kind: "select", usedBy: ["analytical-performance", "metrological-traceability"],
        options: [
          { value: "qualitative", label: "정성 (양성/음성)" },
          { value: "semi-quantitative", label: "반정량" },
          { value: "quantitative", label: "정량" },
        ],
      },
      {
        path: "result.readout", label: "판독 방식", kind: "select", usedBy: ["usability-file", "sw-validation"],
        options: [
          { value: "visual", label: "육안 판독" },
          { value: "reader", label: "전용 리더기" },
          { value: "app", label: "스마트폰 앱" },
        ],
      },
    ],
  },
  {
    id: "user",
    title: "사용자 · 환경",
    desc: "일반인 자가검사면 분류(Rule 4)와 사용적합성 평가가 필수가 됩니다.",
    fields: [
      {
        path: "user", label: "사용자", kind: "select", usedBy: ["classification-rationale", "usability-file", "ifu", "clinical-performance"],
        options: [
          { value: "lay", label: "일반인 (자가검사)" },
          { value: "professional", label: "전문가" },
          { value: "both", label: "둘 다" },
        ],
      },
      {
        path: "environment", label: "사용 환경", kind: "select", usedBy: ["classification-rationale", "usability-file", "intended-purpose"],
        options: [
          { value: "home", label: "가정" },
          { value: "near-patient", label: "근접검사 (약국·진료실)" },
          { value: "lab", label: "검사실" },
        ],
      },
    ],
  },
  {
    id: "purpose",
    title: "의도된 목적",
    desc: "위 항목과 합쳐 의도된 목적 문장이 자동으로 조립됩니다.",
    fields: [
      { path: "intendedPurpose.clinicalDecision", label: "결과로 내리는 판단", kind: "textarea", placeholder: "예: 배란 예측을 통해 임신 시도 시기를 정하는 데 도움", usedBy: ["intended-purpose", "clinical-performance", "scientific-validity"] },
      { path: "intendedPurpose.targetPopulation", label: "대상 집단", kind: "text", placeholder: "예: 임신을 계획하는 가임기 여성", usedBy: ["intended-purpose", "clinical-performance"] },
      { path: "intendedPurpose.outOfScope", label: "사용하면 안 되는 용도", kind: "textarea", optional: true, placeholder: "예: 피임 목적, 불임 진단", usedBy: ["intended-purpose", "ifu"] },
    ],
  },
  {
    id: "rules",
    title: "분류 판단 질문",
    desc: "Annex VIII Rule 1~3 해당 여부. 하나라도 모르면 클래스는 잠정 추천으로 표시됩니다.",
    fields: [
      { path: "rule1to3Flags.transmissibleAgent", label: "감염병(전파성 병원체)을 검출하나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.bloodGrouping", label: "혈액형·수혈 적합성을 판정하나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.tissueTyping", label: "조직 적합성(이식)을 판정하나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.geneticTesting", label: "유전자 검사인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.cancerScreening", label: "암 선별·진단·병기 판정에 쓰이나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.companionDiagnostic", label: "동반진단(특정 치료제 선택)인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale", "cdx-consultation"] },
      { path: "rule1to3Flags.congenitalScreening", label: "선천성 질환 선별(신생아·태아)인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.lifeThreatening", label: "결과 오류가 생명을 위협할 수 있는 상태를 다루나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
    ],
  },
  {
    id: "attrs",
    title: "기타 속성",
    desc: "해당할 때만 필요한 문서(멸균 밸리데이션, SW 검증 등)를 정합니다.",
    fields: [
      { path: "sterile", label: "멸균 제품인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["sterilization-validation", "packaging-validation", "classification-rationale"] },
      { path: "software.hasApp", label: "앱·소프트웨어가 함께 제공되나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["sw-validation", "cybersecurity"] },
      { path: "software.isMdsw", label: "그 소프트웨어가 결과 판정·해석을 하나요?", help: "결과를 판정하면 의료기기 소프트웨어(MDSW)로 봅니다.", kind: "tri", options: YES_NO_TRI, usedBy: ["sw-validation", "classification-rationale"] },
      {
        path: "markets", label: "출시 시장", kind: "multi", usedBy: ["conformity-route-plan", "labelling-spec"],
        options: [
          { value: "EU", label: "EU (IVDR)" },
          { value: "KR", label: "한국 (MFDS)" },
          { value: "US", label: "미국 (FDA)" },
          { value: "CA", label: "캐나다" },
          { value: "AU", label: "호주" },
          { value: "JP", label: "일본" },
          { value: "BR", label: "브라질" },
        ],
      },
    ],
  },
  {
    id: "storage",
    title: "보관 · 안정성",
    desc: "안정성 실험 기간과 라벨의 보관 조건이 여기서 정해집니다.",
    fields: [
      { path: "storage.tempMinC", label: "보관 최저 온도", kind: "number", unit: "℃", usedBy: ["stability-study", "labelling-spec", "transport-validation"] },
      { path: "storage.tempMaxC", label: "보관 최고 온도", kind: "number", unit: "℃", usedBy: ["stability-study", "labelling-spec", "transport-validation"] },
      { path: "storage.shelfLifeMonths", label: "목표 유효기간", kind: "number", unit: "개월", usedBy: ["stability-study", "labelling-spec"] },
      { path: "storage.openedStabilityMin", label: "개봉 후 사용 시한", help: "파우치 개봉 후 몇 분 안에 써야 하는지.", kind: "number", unit: "분", optional: true, usedBy: ["stability-study", "ifu"] },
    ],
  },
  {
    id: "kit",
    title: "키트 구성품",
    desc: "제품 설명과 라벨에 들어갑니다. 시약이 들어간 구성품은 표시해 주세요.",
    fields: [
      { path: "kitComponents", label: "구성품", kind: "components", usedBy: ["device-description", "labelling-spec", "ifu"] },
    ],
  },
  {
    id: "reference",
    title: "기준 방법",
    desc: "임상 성능 비교의 기준. 일반인 사용 성능 연구 설계에 쓰입니다.",
    fields: [
      { path: "referenceMethod.name", label: "비교 기준 방법", kind: "text", placeholder: "예: 정량 LH 면역분석(검사실)", usedBy: ["clinical-performance", "performance-eval-plan"] },
      { path: "referenceMethod.ceMarked", label: "기준 방법이 CE 인증 제품인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["clinical-performance"] },
      { path: "referenceMethod.lab", label: "기준 방법 시험기관", kind: "text", usedBy: ["clinical-performance"] },
    ],
  },
  {
    id: "targets",
    title: "목표 성능",
    desc: "실험 판정기준과 표본수가 여기서 계산됩니다. 비워두면 판정기준을 지어내지 않고 할 일로 남깁니다.",
    fields: [
      { path: "targets.sensitivity", label: "목표 민감도 (PPA)", kind: "number", unit: "%", usedBy: ["clinical-performance", "performance-eval-plan", "ifu"] },
      { path: "targets.specificity", label: "목표 특이도 (NPA)", kind: "number", unit: "%", usedBy: ["clinical-performance", "performance-eval-plan", "ifu"] },
      { path: "targets.confidence", label: "신뢰수준", kind: "number", unit: "%", usedBy: ["performance-eval-plan"] },
      { path: "targets.lots", label: "평가 로트 수", help: "IVDR 성능 평가는 보통 3로트 이상.", kind: "number", unit: "로트", usedBy: ["analytical-performance", "stability-study"] },
    ],
  },
];

export const allSpecFields: FieldDef[] = specSections.flatMap((s) => s.fields);
export const fieldByPath = (path: string): FieldDef | undefined => allSpecFields.find((f) => f.path === path);
