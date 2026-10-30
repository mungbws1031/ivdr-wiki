// =====================================================================
// src/lib/planner/crossReactants.ts
// 분석물별 교차반응·간섭 후보 — 출발점일 뿐이며 RA·개발 담당자 검토가 필요하다(reviewed: false).
// 시험 농도는 넣지 않는다 (CLSI EP07·EP37 원문과 생리적 최대 농도로 사람이 정한다).
// =====================================================================

import type { AnalytePreset, SpecimenType } from "../../data/spec/types";

export const CROSS_REACTANTS_REVIEWED = false;

/** LH·hCG·FSH·TSH는 알파 소단위를 공유하는 당단백 호르몬이라 서로 교차반응 후보가 된다. */
export const CROSS_REACTANTS: Record<AnalytePreset, string[]> = {
  LH: ["hCG (임신·hCG 투여)", "FSH (폐경기 고농도)", "TSH"],
  hCG: ["LH (배란기 급증)", "FSH (폐경기 고농도)", "TSH"],
  glucose: [],
  cholesterol: [],
  "urine-cells": [],
  other: [],
};

export const INTERFERENTS: Partial<Record<SpecimenType, string[]>> = {
  urine: ["헤모글로빈·혈뇨", "포도당", "단백(알부민)", "아스코르브산", "케톤", "빌리루빈", "pH 극단값", "비중(진한·묽은 소변)", "흔한 복용약 (아세트아미노펜, 아스피린, 이부프로펜, 카페인)"],
  "capillary-blood": ["헤모글로빈(용혈)", "빌리루빈", "지질(중성지방)", "적혈구용적률 극단값", "류마티스 인자", "HAMA(이종 항체)", "흔한 복용약"],
  "venous-blood": ["헤모글로빈(용혈)", "빌리루빈", "지질(중성지방)", "류마티스 인자", "HAMA(이종 항체)", "흔한 복용약"],
  saliva: ["음식물 잔여", "치약·구강청결제", "혈액 혼입", "흡연"],
  swab: ["점액", "혈액 혼입", "비강 스프레이·점비약", "구강청결제"],
};
