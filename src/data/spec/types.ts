// =====================================================================
// src/data/spec/types.ts
// 제품 스펙 — 자동작성 툴의 단일 입력. 규칙 엔진·실험계획·문서 채움이 모두 이걸 읽는다.
// null = "모름/나중에". 추측하지 않고 그대로 "사람이 할 일"로 넘긴다.
// DOM 의존 금지 (서버 함수도 import 할 예정).
// =====================================================================

export type Maybe<T> = T | null;

export type ProductType = "reagent-kit" | "instrument" | "software" | "accessory";
export type AnalytePreset = "LH" | "hCG" | "other";
export type SpecimenType = "urine" | "capillary-blood" | "venous-blood" | "saliva" | "swab" | "other";
export type ResultKind = "qualitative" | "semi-quantitative" | "quantitative";
export type Readout = "visual" | "reader" | "app";
export type UserType = "lay" | "professional" | "both";
export type Environment = "home" | "near-patient" | "lab";

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
  markets: Maybe<string[]>;
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
  meta: {
    updatedAt: string | null;
  };
}
