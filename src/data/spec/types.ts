// =====================================================================
// src/data/spec/types.ts
// 제품 스펙 — 자동작성 툴의 단일 입력. 규칙 엔진·실험계획·문서 채움이 모두 이걸 읽는다.
// null = "모름/나중에". 추측하지 않고 그대로 "사람이 할 일"로 넘긴다.
// DOM 의존 금지 (서버 함수도 import 할 예정).
// =====================================================================

export type Maybe<T> = T | null;

export type ProductType = "reagent-kit" | "instrument" | "software" | "accessory";
/** 제품 형태 — 스틱만 / 스틱+리더기 / 개인용 일체형 기기 / POCT 기기 / 병원·검사실 대형 장비 */
export type FormFactor = "strip-only" | "strip-reader" | "personal-device" | "poct" | "lab-analyzer";
export type Material = "plastic" | "paper-membrane" | "glass" | "metal" | "electronics" | "other";
export type AnalytePreset = "LH" | "hCG" | "other";
export type SpecimenType = "urine" | "capillary-blood" | "venous-blood" | "saliva" | "swab" | "other";
export type ResultKind = "qualitative" | "semi-quantitative" | "quantitative";
export type Readout = "visual" | "reader" | "app";
/** 검사 방식 — 작동 원리·판독 규칙 초안이 이걸로 갈린다 */
export type AssayMethod = "lateral-flow" | "fluorescence" | "electrochemical" | "molecular" | "other";
export type UserType = "lay" | "professional" | "both";
export type Environment = "home" | "near-patient" | "lab";
export type Destination = "KR" | "EU" | "US" | "JP" | "SEA" | "ME" | "AU" | "other";
export type ShipMode = "parcel" | "air" | "road";
export type OuterMaterial = "corrugated" | "plastic" | "mixed";

export interface KitComponent {
  name: string;
  qtyPerKit: Maybe<number>;
  isReagent: boolean;
}

export interface ProductSpec {
  schemaVersion: 1;
  identity: {
    productName: Maybe<string>;
    model: Maybe<string>;
    manufacturerName: Maybe<string>;
    manufacturerCountry: Maybe<string>;
    manufacturerIsEU: Maybe<boolean>;
    basicUdiDi: Maybe<string>;
  };
  productType: Maybe<ProductType>;
  formFactor: Maybe<FormFactor>;
  materials: Maybe<Material[]>;
  analyte: {
    preset: Maybe<AnalytePreset>;
    name: Maybe<string>;
    cutoffValue: Maybe<number>;
    cutoffUnit: Maybe<string>;
  };
  specimen: Maybe<SpecimenType>;
  result: {
    kind: Maybe<ResultKind>;
    readout: Maybe<Readout>;
  };
  assay: {
    method: Maybe<AssayMethod>;
  };
  user: Maybe<UserType>;
  environment: Maybe<Environment>;
  intendedPurpose: {
    clinicalDecision: Maybe<string>;
    targetPopulation: Maybe<string>;
    outOfScope: Maybe<string>;
  };
  /** Annex VIII Rule 1~3 판단용 — 하나라도 미답이면 분류는 잠정(provisional). */
  rule1to3Flags: {
    transmissibleAgent: Maybe<boolean>;
    bloodGrouping: Maybe<boolean>;
    tissueTyping: Maybe<boolean>;
    geneticTesting: Maybe<boolean>;
    cancerScreening: Maybe<boolean>;
    companionDiagnostic: Maybe<boolean>;
    congenitalScreening: Maybe<boolean>;
    lifeThreatening: Maybe<boolean>;
  };
  sterile: Maybe<boolean>;
  software: {
    hasApp: Maybe<boolean>;
    isMdsw: Maybe<boolean>;
  };
  /** 받아야 할 제품 인증(출시 시장) — 스펙 화면 첫 질문 */
  markets: Maybe<string[]>;
  qmsCerts: Maybe<string[]>;
  /** 식약처 체외진단의료기기 등급 (사람이 품목 분류로 확인) */
  krGrade: Maybe<"1" | "2" | "3" | "4">;
  /** FDA 제품 코드 (분류 데이터베이스에서 사람이 확인한 값, 예: LCX) */
  usProductCode: Maybe<string>;
  storage: {
    tempMinC: Maybe<number>;
    tempMaxC: Maybe<number>;
    shelfLifeMonths: Maybe<number>;
    openedStabilityMin: Maybe<number>;
  };
  kitComponents: KitComponent[];
  referenceMethod: {
    name: Maybe<string>;
    ceMarked: Maybe<boolean>;
    lab: Maybe<string>;
  };
  targets: {
    sensitivity: Maybe<number>; // %
    specificity: Maybe<number>; // %
    confidence: Maybe<number>; // %
    lots: Maybe<number>;
  };
  /** 운송·포장 — /auto/transport 에서만 입력. 분류(specHash)에는 영향 없음. */
  transport: {
    destinations: Maybe<Destination[]>;
    modes: Maybe<ShipMode[]>;
    lengthCm: Maybe<number>;
    widthCm: Maybe<number>;
    heightCm: Maybe<number>;
    grossWeightKg: Maybe<number>;
    kitsPerShipper: Maybe<number>;
    liquidReagent: Maybe<boolean>;
    dangerousGoods: Maybe<boolean>; // SDS 14항 기준 운송 위험물 해당 여부
    primaryPlastic: Maybe<boolean>; // 1차 포장(파우치)에 플라스틱이 들어가는지
    outerMaterial: Maybe<OuterMaterial>;
  };
  meta: {
    updatedAt: string | null;
  };
}
