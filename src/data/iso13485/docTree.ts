// ivdr-wiki/src/data/iso13485/docTree.ts
export interface ISO13485DocLeaf {
  id: string;
  title: string;
  refs: string[];
  stationId: number;
  requirement: "required" | "conditional" | "ifApplicable";
  note?: string;
}

export const iso13485DocTree: ISO13485DocLeaf[] = [
  // Station 1 — QMS 문서화 체계
  { id: "iso-qms-scope",           title: "QMS 적용 범위 문서",          refs: ["4.1", "4.2.2"],    stationId: 1, requirement: "required" },
  { id: "iso-documented-info",     title: "문서화된 정보 관리 절차서",    refs: ["4.2.3", "4.2.5"],  stationId: 1, requirement: "required" },
  // Station 2 — 경영 책임
  { id: "iso-quality-policy",      title: "품질방침",                     refs: ["5.3"],             stationId: 2, requirement: "required" },
  { id: "iso-quality-objectives",  title: "품질목표",                     refs: ["5.4.1"],           stationId: 2, requirement: "required" },
  { id: "iso-management-review",   title: "경영 검토 기록",               refs: ["5.6"],             stationId: 2, requirement: "required" },
  // Station 3 — 인적 자원
  { id: "iso-competence-matrix",   title: "역량 매트릭스",                refs: ["6.2"],             stationId: 3, requirement: "required" },
  { id: "iso-training-records",    title: "교육훈련 기록",                refs: ["6.2"],             stationId: 3, requirement: "required" },
  // Station 4 — 인프라·작업환경
  { id: "iso-infra-maintenance",   title: "인프라 유지보수 기록",         refs: ["6.3"],             stationId: 4, requirement: "required" },
  { id: "iso-work-environment",    title: "작업환경 관리 기록",           refs: ["6.4"],             stationId: 4, requirement: "conditional", note: "오염·청결 관리가 필요한 경우 필수" },
  // Station 6 — 구매·공급자
  { id: "iso-approved-supplier-list",    title: "승인공급자목록(ASL)",    refs: ["7.4.1"],           stationId: 6, requirement: "required" },
  { id: "iso-purchasing-verification",   title: "구매 검사 기록",         refs: ["7.4.3"],           stationId: 6, requirement: "required" },
  // Station 7 — 생산·서비스
  { id: "iso-customer-property",         title: "고객 자산 관리 기록",    refs: ["7.5.4"],           stationId: 7, requirement: "conditional" },
  { id: "iso-identification-traceability", title: "식별·추적성 기록",     refs: ["7.5.3"],           stationId: 7, requirement: "required" },
  { id: "iso-service-records",           title: "서비스 기록",            refs: ["7.5.1"],           stationId: 7, requirement: "ifApplicable", note: "서비스 제공 시" },
  // Station 8 — 측정장비
  { id: "iso-calibration-records",       title: "측정장비 교정 기록",     refs: ["7.6"],             stationId: 8, requirement: "required" },
  // Station 9 — 모니터링·내부심사
  { id: "iso-internal-audit-report",     title: "내부심사 보고서",        refs: ["8.2.2"],           stationId: 9, requirement: "required" },
  { id: "iso-customer-satisfaction",     title: "고객 만족 측정 기록",    refs: ["8.2.1"],           stationId: 9, requirement: "required" },
  // Station 10 — 개선
  { id: "iso-corrective-action",         title: "시정조치(CA) 기록",      refs: ["8.5.2"],           stationId: 10, requirement: "required" },
  { id: "iso-preventive-action",         title: "예방조치(PA) 기록",      refs: ["8.5.3"],           stationId: 10, requirement: "required" },
];

export const iso13485LeafById = (id: string): ISO13485DocLeaf | undefined =>
  iso13485DocTree.find((l) => l.id === id);

export const iso13485LeavesByStation = (stationId: number): ISO13485DocLeaf[] =>
  iso13485DocTree.filter((l) => l.stationId === stationId);

export const allISO13485DocIds = (): string[] =>
  iso13485DocTree.map((l) => l.id);
