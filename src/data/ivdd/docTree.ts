// src/data/ivdd/docTree.ts
export interface IVDDDocLeaf {
  id: string;
  title: string;
  refs: string[];
  stationId: number;
  requirement: "required" | "conditional" | "ifApplicable";
  note?: string;
}

export const ivddDocTree: IVDDDocLeaf[] = [
  // Station 1 — 분류 결정
  { id: "ivdd-classification",       title: "기기 분류 결정서",             refs: ["Art.9", "Annex II"],            stationId: 1, requirement: "required" },
  // Station 2 — 의도된 목적
  { id: "ivdd-intended-purpose",     title: "의도된 목적 명세서",           refs: ["Art.1(2)(b)", "Annex I Sec.3"], stationId: 2, requirement: "required" },
  // Station 3 — 기술문서
  { id: "ivdd-tech-doc",             title: "기술문서(Technical File)",     refs: ["Annex III"],                    stationId: 3, requirement: "required" },
  { id: "ivdd-conformity-procedure", title: "적합성 절차 선택 근거",         refs: ["Annex IV-VII"],                 stationId: 3, requirement: "required" },
  // Station 4 — 성능 평가
  { id: "ivdd-analytical-perf",      title: "분석 성능 데이터 패키지",      refs: ["Annex I Sec.8"],                stationId: 4, requirement: "required" },
  { id: "ivdd-clinical-perf",        title: "임상 성능 평가 자료",          refs: ["Annex I Sec.9"],                stationId: 4, requirement: "required" },
  // Station 5 — NB
  { id: "ivdd-nb-submission",        title: "NB 제출 패키지",               refs: ["Annex IV", "Annex V"],          stationId: 5, requirement: "conditional", note: "List A/B 기기에 해당" },
  // Station 6 — DoC & CE
  { id: "ivdd-doc",                  title: "EC 적합성선언(DoC)",           refs: ["Art.11", "Annex III"],          stationId: 6, requirement: "required" },
  // Station 7 — PMS
  { id: "ivdd-pms-plan",             title: "사후 시장 감시 계획",          refs: ["Art.11(4)"],                    stationId: 7, requirement: "required" },
];

export const ivddLeafById = (id: string): IVDDDocLeaf | undefined => ivddDocTree.find((l) => l.id === id);
export const ivddLeavesByStation = (stationId: number): IVDDDocLeaf[] => ivddDocTree.filter((l) => l.stationId === stationId);
export const allIVDDDocIds = (): string[] => ivddDocTree.map((l) => l.id);
