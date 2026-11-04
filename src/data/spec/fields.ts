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
    id: "certs",
    title: "어떤 인증을 받아야 하나요?",
    desc: "가장 먼저 골라 주세요. 고른 인증에 따라 등급, 필요한 문서, 실험, 포장 규정이 달라져요. 여러 개 골라도 돼요.",
    fields: [
      {
        path: "markets", label: "제품 인증 (출시할 곳)", kind: "multi", usedBy: ["conformity-route-plan", "labelling-spec", "declaration-of-conformity"],
        help: "한국은 체외진단의료기기법에 따른 식약처(MFDS) 신고·인증·허가예요. EU는 IVDR CE 마킹이에요.",
        options: [
          { value: "KR", label: "한국 — 식약처(MFDS) 체외진단의료기기" },
          { value: "EU", label: "EU — IVDR (CE 마킹)" },
          { value: "US", label: "미국 — FDA" },
          { value: "CA", label: "캐나다 — Health Canada" },
          { value: "AU", label: "호주 — TGA" },
          { value: "JP", label: "일본 — PMDA" },
          { value: "BR", label: "브라질 — ANVISA" },
        ],
      },
      {
        path: "qmsCerts", label: "품질 인증 (이미 있거나 받을 것)", kind: "multi", optional: true, usedBy: ["conformity-route-plan", "qms-manual"],
        help: "공장·회사의 품질경영시스템 인증이에요. 모르면 비워 두세요. 고른 제품 인증에 필요한 품질 인증을 결과 화면에서 알려 드려요.",
        options: [
          { value: "KGMP", label: "KGMP (국내 GMP 적합인정)" },
          { value: "ISO13485", label: "ISO 13485" },
          { value: "MDSAP", label: "MDSAP" },
        ],
      },
      {
        path: "krGrade", label: "식약처 등급 (한국 출시 시)", kind: "select", optional: true, usedBy: ["conformity-route-plan"],
        help: "체외진단의료기기 품목 분류(식약처 고시)에서 확인한 등급이에요. 모르면 비워 두세요. '확인 필요'로 남겨 둘게요.",
        options: [
          { value: "1", label: "1등급" },
          { value: "2", label: "2등급" },
          { value: "3", label: "3등급" },
          { value: "4", label: "4등급" },
        ],
      },
      {
        path: "usProductCode", label: "FDA 제품 코드 (미국 출시 시)", kind: "text", optional: true, usedBy: ["conformity-route-plan"],
        help: "FDA 제품 분류 데이터베이스에서 찾은 3글자 코드예요 (예: LCX). 모르면 비워 두세요. 앱은 추천만 하고 '확인 필요'로 남겨 둘게요.",
      },
    ],
  },
  {
    id: "identity",
    title: "제품 이름 · 만든 곳",
    desc: "모든 문서의 머리말, 라벨, 적합성 선언서(DoC)에 들어가요.",
    fields: [
      { path: "identity.productName", label: "제품명", kind: "text", placeholder: "예: Surearly LH 배란 테스트", usedBy: ["intended-purpose", "device-description", "labelling-spec", "ifu", "declaration-of-conformity"] },
      { path: "identity.model", label: "모델 / 카탈로그 번호", kind: "text", placeholder: "예: SE-LH-01", usedBy: ["device-description", "labelling-spec", "declaration-of-conformity"] },
      { path: "identity.manufacturerName", label: "제조자 (만드는 회사)", kind: "text", usedBy: ["labelling-spec", "ifu", "declaration-of-conformity"] },
      { path: "identity.manufacturerCountry", label: "제조국", kind: "text", placeholder: "예: 대한민국", usedBy: ["declaration-of-conformity", "authorised-rep-mandate"] },
      { path: "identity.manufacturerIsEU", label: "EU 안에 있는 회사인가요?", help: "EU 밖 회사라면 EU 대리인(Authorised Representative)이 있어야 해요.", kind: "tri", options: YES_NO_TRI, usedBy: ["authorised-rep-mandate", "labelling-spec"] },
      { path: "identity.basicUdiDi", label: "Basic UDI-DI", help: "제품 식별 번호예요. 아직 받기 전이면 비워 두세요. EUDAMED(EU 등록 시스템)에 올릴 때 필요해요.", kind: "text", optional: true, usedBy: ["udi-assignment", "declaration-of-conformity"] },
    ],
  },
  {
    id: "type",
    title: "제품 구분",
    desc: "기기와 시약은 등급 규칙과 필요한 문서가 달라요.",
    fields: [
      {
        path: "productType", label: "제품 유형", kind: "select", usedBy: ["classification-rationale", "device-description"],
        options: [
          { value: "reagent-kit", label: "시약·키트" },
          { value: "instrument", label: "기기", disabled: true, hint: "곧 지원" },
          { value: "software", label: "소프트웨어", disabled: true, hint: "곧 지원" },
          { value: "accessory", label: "부속품", disabled: true, hint: "곧 지원" },
        ],
      },
    ],
  },
  {
    id: "form",
    title: "형태 · 재질",
    desc: "스틱만 파는지, 리더기나 장비도 함께 파는지 골라 주세요. 전원이 있는 기기면 전기안전·EMC·펌웨어 문서가 더 필요해요.",
    fields: [
      {
        path: "formFactor", label: "제품 형태", kind: "select", usedBy: ["device-description", "electrical-safety-emc", "sw-validation", "labelling-spec"],
        help: "같은 시약이라도 리더기나 장비를 함께 팔면 전기안전·EMC(전자파)·소프트웨어 문서가 필요해요.",
        options: [
          { value: "strip-only", label: "스틱·스트립만 (기기 없이, 육안 판독)" },
          { value: "strip-reader", label: "스틱 + 개인용 리더기" },
          { value: "personal-device", label: "개인용 진단 기기 (일체형, 가정용)" },
          { value: "poct", label: "POCT 기기 (약국·진료실·현장)" },
          { value: "lab-analyzer", label: "병원·검사실 대형 진단 장비" },
        ],
      },
      {
        path: "materials", label: "주요 재질", kind: "multi", optional: true, usedBy: ["device-description", "biocompatibility", "packaging-design"],
        help: "겉 케이스, 스트립, 부품을 만드는 주된 재료예요. 전자부품이 있으면 EU RoHS·WEEE를 확인해야 해요.",
        options: [
          { value: "plastic", label: "플라스틱 (겉 케이스·카세트)" },
          { value: "paper-membrane", label: "종이·멤브레인 (니트로셀룰로스 스트립)" },
          { value: "glass", label: "유리" },
          { value: "metal", label: "금속" },
          { value: "electronics", label: "전자부품 (회로·배터리·디스플레이)" },
          { value: "other", label: "기타" },
        ],
      },
    ],
  },
  {
    id: "analyte",
    title: "분석 대상",
    desc: "무엇을 찾아내는 검사인지 적어 주세요. 등급(가임력·임신 예외)과 헷갈리기 쉬운 물질(교차반응) 목록이 여기서 정해져요.",
    fields: [
      {
        path: "analyte.preset", label: "검사 대상", kind: "select", usedBy: ["classification-rationale", "analytical-performance"],
        options: [
          { value: "LH", label: "LH (배란)" },
          { value: "hCG", label: "hCG (임신)" },
          { value: "glucose", label: "혈당" },
          { value: "cholesterol", label: "콜레스테롤" },
          { value: "urine-cells", label: "소변 적혈구·백혈구·세균 (소변 일반 검사)" },
          { value: "other", label: "기타" },
        ],
      },
      { path: "analyte.name", label: "검사 물질의 정식 이름", kind: "text", placeholder: "예: 황체형성호르몬(LH)", usedBy: ["intended-purpose", "ifu", "analytical-performance"] },
      { path: "analyte.cutoffValue", label: "Cut-off (기준 농도)", help: "양성과 음성을 가르는 농도예요. 이 값보다 높으면 양성으로 봐요.", kind: "number", usedBy: ["analytical-performance", "labelling-spec", "ifu"] },
      { path: "analyte.cutoffUnit", label: "Cut-off 단위", kind: "text", placeholder: "예: mIU/mL", usedBy: ["analytical-performance", "labelling-spec"] },
    ],
  },
  {
    id: "specimen",
    title: "검체 · 결과",
    desc: "실험 설계(방해 물질, 시료 수)와 사용설명서(IFU) 내용이 달라져요.",
    fields: [
      {
        path: "specimen", label: "검체 (검사에 쓰는 시료)", kind: "select", usedBy: ["intended-purpose", "analytical-performance", "ifu", "biocompatibility"],
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
        path: "result.kind", label: "결과 형태", help: "양성/음성만 보면 정성, 숫자로 보면 정량이에요. 정성이면 CLSI EP12, 정량이면 EP05·EP17 등으로 실험계획이 달라져요.", kind: "select", usedBy: ["analytical-performance", "metrological-traceability"],
        options: [
          { value: "qualitative", label: "정성 (양성/음성)" },
          { value: "semi-quantitative", label: "반정량" },
          { value: "quantitative", label: "정량" },
        ],
      },
      {
        path: "assay.method", label: "검사 방식", kind: "select", usedBy: ["device-description", "ifu"],
        help: "작동 원리와 사용설명서의 결과 읽는 법 초안이 이 값으로 정해져요.",
        options: [
          { value: "lateral-flow", label: "측방유동 면역크로마토그래피 (래피드 테스트)" },
          { value: "fluorescence", label: "형광 면역분석" },
          { value: "electrochemical", label: "전기화학 (바이오센서)" },
          { value: "molecular", label: "분자진단 (PCR·등온증폭)" },
          { value: "other", label: "기타" },
        ],
      },
      {
        path: "result.readout", label: "결과 읽는 방법", kind: "select", usedBy: ["usability-file", "sw-validation"],
        options: [
          { value: "visual", label: "눈으로 보기" },
          { value: "reader", label: "전용 리더기" },
          { value: "app", label: "스마트폰 앱" },
        ],
      },
    ],
  },
  {
    id: "user",
    title: "사용자 · 환경",
    desc: "일반인이 스스로 하는 검사면 등급(Rule 4)이 달라지고, 사용하기 쉬운지 평가(사용적합성)가 꼭 필요해요.",
    fields: [
      {
        path: "user", label: "사용자", kind: "select", usedBy: ["classification-rationale", "usability-file", "ifu", "clinical-performance"],
        options: [
          { value: "lay", label: "일반인 (자가검사)" },
          { value: "professional", label: "전문가 (의료인·검사자)" },
          { value: "both", label: "둘 다" },
        ],
      },
      {
        path: "environment", label: "사용 장소", kind: "select", usedBy: ["classification-rationale", "usability-file", "intended-purpose"],
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
    desc: "제품을 어디에 쓰는지 적어 주세요. 위 항목과 합쳐 '의도된 목적' 문장을 자동으로 만들어요.",
    fields: [
      { path: "intendedPurpose.clinicalDecision", label: "결과로 내리는 판단", kind: "textarea", placeholder: "예: 배란 예측을 통해 임신 시도 시기를 정하는 데 도움", usedBy: ["intended-purpose", "clinical-performance", "scientific-validity"] },
      { path: "intendedPurpose.targetPopulation", label: "대상자", kind: "text", placeholder: "예: 임신을 계획하는 가임기 여성", usedBy: ["intended-purpose", "clinical-performance"] },
      { path: "intendedPurpose.outOfScope", label: "사용하면 안 되는 용도", kind: "textarea", optional: true, placeholder: "예: 피임 목적, 불임 진단", usedBy: ["intended-purpose", "ifu"] },
    ],
  },
  {
    id: "rules",
    title: "등급을 정하는 질문",
    desc: "IVDR Annex VIII Rule 1~3에 해당하는지 묻는 질문이에요. 하나라도 모르면 등급은 '임시 추천'으로 보여 드려요.",
    fields: [
      { path: "rule1to3Flags.transmissibleAgent", label: "감염병(전파성 병원체)을 검출하나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.bloodGrouping", label: "혈액형·수혈 적합성을 판정하나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.tissueTyping", label: "조직 적합성(이식)을 판정하나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.geneticTesting", label: "유전자 검사인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.cancerScreening", label: "암 선별·진단·병기 판정에 쓰이나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.companionDiagnostic", label: "동반진단(특정 치료제 선택)인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale", "cdx-consultation"] },
      { path: "rule1to3Flags.congenitalScreening", label: "선천성 질환 선별(신생아·태아)인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
      { path: "rule1to3Flags.lifeThreatening", label: "결과가 틀리면 생명이 위험할 수 있는 병을 다루나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["classification-rationale"] },
    ],
  },
  {
    id: "attrs",
    title: "그 밖의 특징",
    desc: "해당할 때만 필요한 문서(멸균 밸리데이션, 소프트웨어 검증 등)를 정해요.",
    fields: [
      { path: "sterile", label: "멸균 제품인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["sterilization-validation", "packaging-validation", "classification-rationale"] },
      { path: "software.hasApp", label: "앱·소프트웨어가 함께 제공되나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["sw-validation", "cybersecurity"] },
      { path: "software.isMdsw", label: "그 소프트웨어가 결과 판정·해석을 하나요?", help: "결과를 판정한다면 의료기기 소프트웨어(MDSW)로 봐요.", kind: "tri", options: YES_NO_TRI, usedBy: ["sw-validation", "classification-rationale"] },
    ],
  },
  {
    id: "storage",
    title: "보관 · 안정성",
    desc: "안정성 실험 기간과 라벨에 적을 보관 조건이 여기서 정해져요.",
    fields: [
      { path: "storage.tempMinC", label: "보관 최저 온도", kind: "number", unit: "℃", usedBy: ["stability-study", "labelling-spec", "transport-validation"] },
      { path: "storage.tempMaxC", label: "보관 최고 온도", kind: "number", unit: "℃", usedBy: ["stability-study", "labelling-spec", "transport-validation"] },
      { path: "storage.shelfLifeMonths", label: "목표 유효기간", kind: "number", unit: "개월", usedBy: ["stability-study", "labelling-spec"] },
      { path: "storage.openedStabilityMin", label: "개봉 후 사용 시한", help: "파우치를 뜯은 뒤 몇 분 안에 써야 하는지 적어 주세요.", kind: "number", unit: "분", optional: true, usedBy: ["stability-study", "ifu"] },
    ],
  },
  {
    id: "kit",
    title: "키트 구성품",
    desc: "제품 설명과 라벨에 들어가요. 시약이 들어간 구성품은 표시해 주세요.",
    fields: [
      { path: "kitComponents", label: "구성품", kind: "components", usedBy: ["device-description", "labelling-spec", "ifu"] },
    ],
  },
  {
    id: "reference",
    title: "비교할 기준 검사",
    desc: "우리 제품 결과와 비교할 기준 검사예요. 일반인 사용 성능 연구를 설계할 때 써요.",
    fields: [
      { path: "referenceMethod.name", label: "기준 검사 방법", kind: "text", placeholder: "예: 정량 LH 면역분석(검사실)", usedBy: ["clinical-performance", "performance-eval-plan"] },
      { path: "referenceMethod.ceMarked", label: "기준 검사가 CE 인증 제품인가요?", kind: "tri", options: YES_NO_TRI, usedBy: ["clinical-performance"] },
      { path: "referenceMethod.lab", label: "기준 검사를 하는 기관", kind: "text", usedBy: ["clinical-performance"] },
    ],
  },
  {
    id: "targets",
    title: "목표 성능",
    desc: "실험 합격 기준과 표본 수가 여기서 계산돼요. 비워 두면 기준을 지어내지 않고 '할 일'로 남겨요.",
    fields: [
      { path: "targets.sensitivity", label: "목표 민감도 (PPA)", help: "실제 양성을 양성으로 맞히는 비율이에요.", kind: "number", unit: "%", usedBy: ["clinical-performance", "performance-eval-plan", "ifu"] },
      { path: "targets.specificity", label: "목표 특이도 (NPA)", help: "실제 음성을 음성으로 맞히는 비율이에요.", kind: "number", unit: "%", usedBy: ["clinical-performance", "performance-eval-plan", "ifu"] },
      { path: "targets.confidence", label: "신뢰수준", help: "결과를 얼마나 믿을 수 있는지 정하는 값이에요. 모르면 비워 두세요.", kind: "number", unit: "%", usedBy: ["performance-eval-plan"] },
      { path: "targets.lots", label: "평가 로트 수", help: "로트는 같은 때 만든 제품 묶음이에요. IVDR 성능 평가는 보통 3로트 이상이에요.", kind: "number", unit: "로트", usedBy: ["analytical-performance", "stability-study"] },
    ],
  },
];

/** 운송·포장 — /auto/transport 화면에서만 입력한다. /auto 진행률·미입력 목록에는 넣지 않는다. */
export const transportSections: FieldSection[] = [
  {
    id: "route",
    title: "어디로 · 어떻게",
    desc: "목적지와 운송 방식에 따라 지켜야 할 규정과 시험 순서(항공이면 저압 시험)가 정해져요.",
    fields: [
      {
        path: "transport.destinations", label: "목적지", kind: "multi", usedBy: ["transport-validation"],
        options: [
          { value: "KR", label: "국내" },
          { value: "EU", label: "EU" },
          { value: "US", label: "미국" },
          { value: "JP", label: "일본" },
          { value: "SEA", label: "동남아" },
          { value: "ME", label: "중동" },
          { value: "AU", label: "호주" },
          { value: "other", label: "기타" },
        ],
      },
      {
        path: "transport.modes", label: "운송 방식", help: "지금은 택배·소포와 항공을 지원해요. 팔레트 화물은 곧 지원할게요.", kind: "multi", usedBy: ["transport-validation"],
        options: [
          { value: "parcel", label: "택배·소포" },
          { value: "air", label: "항공" },
          { value: "road", label: "육상 화물" },
        ],
      },
    ],
  },
  {
    id: "shipper",
    title: "출하 박스",
    desc: "운송사에 넘기는 가장 바깥 박스 기준으로 적어 주세요. 무게에 따라 ISTA 3A 시험 강도 표가 정해져요.",
    fields: [
      { path: "transport.lengthCm", label: "가로", kind: "number", unit: "cm", usedBy: ["transport-validation"] },
      { path: "transport.widthCm", label: "세로", kind: "number", unit: "cm", usedBy: ["transport-validation"] },
      { path: "transport.heightCm", label: "높이", kind: "number", unit: "cm", usedBy: ["transport-validation"] },
      { path: "transport.grossWeightKg", label: "총 무게 (포장 포함)", kind: "number", unit: "kg", usedBy: ["transport-validation"] },
      { path: "transport.kitsPerShipper", label: "박스당 키트 수", kind: "number", unit: "키트", usedBy: ["transport-validation"] },
    ],
  },
  {
    id: "contents",
    title: "내용물 · 포장재",
    desc: "위험물·액체가 있는지와 포장재에 따라 IATA 위험물 규정과 PPWR 의무 범위가 정해져요.",
    fields: [
      { path: "transport.liquidReagent", label: "액체 시약(완충액 등)이 들어있나요?", help: "액체가 있으면 새지 않게 막는 설계와 저압 시험이 중요해져요.", kind: "tri", options: YES_NO_TRI, usedBy: ["transport-validation"] },
      { path: "transport.dangerousGoods", label: "SDS상 운송 위험물에 해당하나요?", help: "아지드화나트륨 같은 보존제가 있으면 SDS(물질안전보건자료) 14항 운송 정보를 확인해 주세요. 모르면 비워 두세요.", kind: "tri", options: YES_NO_TRI, usedBy: ["transport-validation"] },
      { path: "transport.primaryPlastic", label: "1차 포장(파우치·용기)에 플라스틱이 들어가나요?", kind: "tri", options: YES_NO_TRI, usedBy: ["transport-validation"] },
      {
        path: "transport.outerMaterial", label: "키트 상자·출하 박스 재질", kind: "select", usedBy: ["transport-validation"],
        options: [
          { value: "corrugated", label: "종이·골판지" },
          { value: "plastic", label: "플라스틱" },
          { value: "mixed", label: "복합 (종이+플라스틱)" },
        ],
      },
    ],
  },
];

/** /auto 의 기본 스펙 필드 (진행률·미입력 집계 대상). */
/** 제품 기획 화면(/auto/start)에서만 입력 — /auto 진행률·미입력 집계에서 뺀다 */
export const planFields: FieldDef[] = [
  { path: "plan.startDate", label: "개발 시작일", kind: "text", optional: true, usedBy: ["conformity-route-plan"], help: "YYYY-MM-DD" },
  { path: "plan.launchDate", label: "목표 판매일", kind: "text", optional: true, usedBy: ["conformity-route-plan"], help: "YYYY-MM-DD" },
];

/** 시장성 화면(/auto/market)에서만 입력 — 사람이 출처와 함께 넣는 값. 진행률 집계 밖. */
export const marketSections: FieldSection[] = [
  {
    id: "market-size", title: "시장 규모", desc: "조사 자료의 값을 출처와 함께 넣어 주세요. 앱은 시장 규모를 추정하지 않아요.",
    fields: [
      { path: "market.currency", label: "통화", kind: "select", optional: true, usedBy: [], options: [{ value: "KRW", label: "원 (KRW)" }, { value: "USD", label: "달러 (USD)" }, { value: "EUR", label: "유로 (EUR)" }] },
      { path: "market.year", label: "기준 연도", kind: "number", optional: true, usedBy: [], placeholder: "예: 2025" },
      { path: "market.tam", label: "전체 시장 (TAM)", help: "이 제품 종류 전체의 시장 규모예요.", kind: "number", unit: "백만", optional: true, usedBy: [] },
      { path: "market.tamSource", label: "전체 시장 출처", kind: "text", optional: true, usedBy: [], placeholder: "보고서명·발행처·URL" },
      { path: "market.sam", label: "목표 시장 (SAM)", help: "고른 나라·고객층에서 실제로 팔 수 있는 규모예요.", kind: "number", unit: "백만", optional: true, usedBy: [] },
      { path: "market.samSource", label: "목표 시장 출처", kind: "text", optional: true, usedBy: [], placeholder: "보고서명·발행처·URL 또는 계산 근거" },
      { path: "market.sharePct", label: "목표 점유율", help: "회사가 정하는 목표예요. SOM = SAM × 점유율.", kind: "number", unit: "%", optional: true, usedBy: [] },
    ],
  },
  {
    id: "market-sell", title: "가격 · 채널 · 고객", desc: "누구에게, 어디서, 얼마에 팔지 적어 주세요.",
    fields: [
      { path: "market.price", label: "목표 소비자 가격 (1개)", kind: "number", optional: true, usedBy: [], help: "위에서 고른 통화로 적어 주세요." },
      { path: "market.channels", label: "판매 채널", kind: "multi", optional: true, usedBy: [], options: [{ value: "online", label: "온라인·앱" }, { value: "pharmacy", label: "약국" }, { value: "hospital", label: "병원·의원" }, { value: "b2b", label: "기업·보험 (B2B)" }, { value: "other", label: "기타" }] },
      { path: "market.target", label: "타깃 고객", kind: "text", optional: true, usedBy: [], placeholder: "예: 갱년기 증상이 시작된 30~40대 여성" },
      { path: "market.differentiator", label: "우리 제품 차별점", kind: "textarea", optional: true, usedBy: [], placeholder: "예: 앱으로 변화 추이 기록, 주기적 측정" },
    ],
  },
];
export const marketFields: FieldDef[] = marketSections.flatMap((s) => s.fields);

export const allSpecFields: FieldDef[] = specSections.flatMap((s) => s.fields);
export const transportFields: FieldDef[] = transportSections.flatMap((s) => s.fields);
/** 가져오기 검증·경로 조회용 — 운송 필드까지 전부. */
export const everySpecField: FieldDef[] = [...allSpecFields, ...transportFields, ...planFields, ...marketFields];
export const fieldByPath = (path: string): FieldDef | undefined => everySpecField.find((f) => f.path === path);
