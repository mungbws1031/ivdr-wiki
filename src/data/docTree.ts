// =====================================================================
// src/data/docTree.ts
// 제출 기준 문서 트리(마인드맵) — 실제 IVDR 문서 세트.
// 모든 잎은 고유 id 를 가지며 /doc/:id 로 열린다.
//   detailed=true  → 손으로 작성한 전용 템플릿(documents.ts)
//   detailed=false → 잎 정보로 일반 템플릿 자동 생성(resolveDoc)
// 콘텐츠는 stations.ts(정거장)와 stationId로 연결.
// 규제 위치는 2026.6 기준 — 실제 제출 전 최신 관보·NB 요건으로 재확인.
// =====================================================================

import type { TagTone } from "./stations";

export type DocRequirement = "required" | "conditional" | "ifApplicable";

export const requirementMeta: Record<
  DocRequirement,
  { label: string; tone: TagTone }
> = {
  required: { label: "필수", tone: "info" },
  conditional: { label: "조건부", tone: "warning" },
  ifApplicable: { label: "해당 시", tone: "neutral" },
};

export interface DocLeaf {
  id: string; // 고유 슬러그 (/doc/:id)
  title: string;
  refs: string[];
  stationId: number; // 산출 정거장 (1..11)
  requirement: DocRequirement;
  detailed?: boolean; // 전용 템플릿 보유
  note?: string;
}

export interface DocGroup {
  id: string;
  title: string;
  refs: string[];
  colorVar: string; // 그룹 색 (--p1..--p5)
  items: DocLeaf[];
}

export const docTree: DocGroup[] = [
  {
    id: "scope",
    title: "범위·분류",
    refs: ["Art.2", "Annex VIII"],
    colorVar: "--p1",
    items: [
      { id: "intended-purpose", title: "의도된 목적 정의서", refs: ["Annex II 1.1", "Art.2"], stationId: 1, requirement: "required", detailed: true },
      { id: "qualification-statement", title: "제품 적격성(IVD 해당성) 판단서", refs: ["Art.2"], stationId: 1, requirement: "required", note: "IVDR 적용 대상인지 근거와 함께 판단." },
      { id: "classification-rationale", title: "분류 근거서", refs: ["Annex VIII", "Art.47"], stationId: 2, requirement: "required", detailed: true },
      { id: "conformity-route-plan", title: "적합성 평가 경로 계획 + 산출물 체크리스트", refs: ["Art.48", "Annex IX~XI"], stationId: 3, requirement: "required", detailed: true },
    ],
  },
  {
    id: "annex-ii",
    title: "기술문서 (Annex II)",
    refs: ["Annex II"],
    colorVar: "--p3",
    items: [
      { id: "device-description", title: "기기 설명서·사양", refs: ["Annex II 1.1"], stationId: 5, requirement: "required" },
      { id: "design-manufacturing-info", title: "설계·제조 정보", refs: ["Annex II 3"], stationId: 5, requirement: "required" },
      { id: "tech-doc-toc-gspr", title: "기술문서 목차 + GSPR 체크리스트", refs: ["Annex II", "Annex I"], stationId: 5, requirement: "required", detailed: true },
      { id: "labelling-spec", title: "라벨 사양서", refs: ["Annex I (정보)", "Art.18"], stationId: 9, requirement: "required", note: "UDI 캐리어·CE·NB 번호 포함." },
      { id: "ifu", title: "사용설명서(IFU)", refs: ["Annex I (정보)"], stationId: 9, requirement: "required", note: "자가검사는 사용적합성 검증과 연계." },
      { id: "benefit-risk", title: "이익-위험 분석서", refs: ["Annex I 1", "Annex II"], stationId: 7, requirement: "required" },
      { id: "stability-study", title: "안정성 시험 계획·보고서", refs: ["Annex II 6.2", "Annex XIII"], stationId: 6, requirement: "required", note: "표시 유효기간·운송 안정성 입증." },
      { id: "sw-validation", title: "소프트웨어 검증·밸리데이션", refs: ["Annex I 16", "IEC 62304"], stationId: 5, requirement: "ifApplicable", note: "소프트웨어 포함 기기에 한함." },
    ],
  },
  {
    id: "performance",
    title: "성능평가 (Annex XIII)",
    refs: ["Annex XIII", "Art.56"],
    colorVar: "--p2",
    items: [
      { id: "performance-eval-plan", title: "성능평가 계획 (PEP)", refs: ["Annex XIII", "Art.56"], stationId: 6, requirement: "required", detailed: true },
      { id: "scientific-validity", title: "과학적 타당성 보고서", refs: ["Annex XIII 1.2"], stationId: 6, requirement: "required" },
      { id: "analytical-performance", title: "분석적 성능 보고서", refs: ["Annex XIII 1.2.2"], stationId: 6, requirement: "required" },
      { id: "clinical-performance", title: "임상적 성능 보고서", refs: ["Annex XIII 1.2.3"], stationId: 6, requirement: "required" },
      { id: "performance-eval-report", title: "성능평가 보고서 (PER)", refs: ["Annex XIII", "Art.56"], stationId: 6, requirement: "required", note: "PEP→데이터→PER로 종결." },
    ],
  },
  {
    id: "risk",
    title: "위험·사용적합성",
    refs: ["ISO 14971", "IEC 62366"],
    colorVar: "--p4",
    items: [
      { id: "risk-management-plan", title: "위험관리 계획 + GSPR↔위험 추적표", refs: ["ISO 14971:2019", "Annex I"], stationId: 7, requirement: "required", detailed: true },
      { id: "risk-management-file", title: "위험관리 파일·보고서", refs: ["ISO 14971:2019"], stationId: 7, requirement: "required" },
      { id: "usability-file", title: "사용적합성(IEC 62366) 계획·보고서", refs: ["IEC 62366-1", "Annex I"], stationId: 7, requirement: "conditional", note: "자가검사·근접검사 필수." },
    ],
  },
  {
    id: "qms",
    title: "품질경영시스템 (QMS)",
    refs: ["Art.10(8)", "ISO 13485"],
    colorVar: "--p5",
    items: [
      { id: "qms-ivdr-matrix", title: "QMS↔IVDR 연계 매트릭스", refs: ["Art.10(8)", "ISO 13485:2016"], stationId: 4, requirement: "required", detailed: true },
      { id: "doc-record-control", title: "문서·기록 관리 절차(SOP)", refs: ["ISO 13485 4.2"], stationId: 4, requirement: "required" },
      { id: "capa-sop", title: "시정·예방조치(CAPA) 절차", refs: ["ISO 13485 8.5"], stationId: 4, requirement: "required" },
      { id: "supplier-control", title: "공급자·구매 관리 절차", refs: ["ISO 13485 7.4"], stationId: 4, requirement: "required" },
      { id: "complaint-handling", title: "불만 처리 절차", refs: ["Art.10", "ISO 13485 8.2"], stationId: 11, requirement: "required" },
      { id: "vigilance-sop", title: "바이질런스·사고 보고 절차", refs: ["Art.82~85"], stationId: 11, requirement: "required", note: "중대사고·FSCA 보고 경로." },
    ],
  },
  {
    id: "conformity",
    title: "적합성·인증",
    refs: ["Art.17~18", "Art.38~46"],
    colorVar: "--p1",
    items: [
      { id: "nb-application", title: "NB 신청 패키지·선정 체크리스트", refs: ["Art.38~46"], stationId: 8, requirement: "conditional", detailed: true, note: "Class A 비멸균은 NB 생략." },
      { id: "declaration-of-conformity", title: "적합성 선언서 (DoC)", refs: ["Annex IV", "Art.17"], stationId: 9, requirement: "required", detailed: true },
      { id: "ce-marking-application", title: "CE 마킹 적용 점검표", refs: ["Annex V", "Art.18"], stationId: 9, requirement: "required" },
      { id: "authorised-rep-mandate", title: "EU 대리인 위임 계약", refs: ["Art.11~12"], stationId: 10, requirement: "conditional", note: "역외(비EU) 제조자에 한함." },
    ],
  },
  {
    id: "registration",
    title: "등록·UDI (EUDAMED)",
    refs: ["Art.24~28", "Annex VI"],
    colorVar: "--p2",
    items: [
      { id: "actor-registration", title: "행위자 등록(SRN) 데이터", refs: ["Art.28", "Annex VI"], stationId: 10, requirement: "required", note: "기기 등록 전 선행." },
      { id: "device-registration", title: "EUDAMED/UDI 등록 데이터 준비표", refs: ["Art.24~28", "Annex VI", "Decision (EU) 2025/2371"], stationId: 10, requirement: "required", detailed: true },
      { id: "udi-assignment", title: "UDI 지정·라벨 적용표", refs: ["Art.24~27", "Annex VI Part C"], stationId: 10, requirement: "required" },
    ],
  },
  {
    id: "post-market",
    title: "시판 후 (Annex III)",
    refs: ["Art.78~81", "Annex III"],
    colorVar: "--p3",
    items: [
      { id: "pms-plan", title: "시판 후 감시 계획 (PMS Plan)", refs: ["Art.79", "Annex III"], stationId: 11, requirement: "required", detailed: true },
      { id: "pms-report", title: "PMS 보고서", refs: ["Art.80"], stationId: 11, requirement: "conditional", note: "Class A·B (비-PSUR 등급)." },
      { id: "psur", title: "정기 안전성 갱신 보고서 (PSUR)", refs: ["Art.81"], stationId: 11, requirement: "conditional", note: "Class C·D는 매년 갱신." },
      { id: "pmpf-plan", title: "시판 후 성능 추적(PMPF) 계획·보고서", refs: ["Annex XIII Part B"], stationId: 11, requirement: "ifApplicable" },
      { id: "trend-reporting", title: "트렌드 보고", refs: ["Art.83"], stationId: 11, requirement: "ifApplicable", note: "통계적으로 유의한 증가 시." },
    ],
  },
];

export function allLeaves(): DocLeaf[] {
  return docTree.flatMap((g) => g.items);
}

export function leafById(id: string): DocLeaf | undefined {
  return allLeaves().find((l) => l.id === id);
}

/** 정거장의 대표 문서(전용 템플릿) id — drawer '문서 작성하기'용. */
export function primaryDocIdForStation(stationId: number): string {
  const detailed = allLeaves().find(
    (l) => l.stationId === stationId && l.detailed,
  );
  return detailed?.id ?? `station-${stationId}`;
}

export function docTreeStats() {
  const all = allLeaves();
  return {
    total: all.length,
    detailed: all.filter((l) => l.detailed).length,
    groups: docTree.length,
  };
}

/** 마스터 등록부 .md — 담당·상태 빈 칸 포함(파일에서 관리). */
export function toRegisterMarkdown(): string {
  const lines: string[] = [];
  lines.push("# IVDR 제출 문서 마스터 등록부");
  lines.push("");
  lines.push("> 써야 할 문서 전체 목록. 담당·상태 칸을 채워 진행 관리에 사용하세요.");
  lines.push("> 규제 위치는 2026.6 기준 — 실제 제출 전 최신 관보·NB 요건으로 재확인.");
  lines.push("");
  for (const g of docTree) {
    lines.push(`## ${g.title}`);
    lines.push(`_근거: ${g.refs.join(" · ")}_`);
    lines.push("");
    lines.push("| 문서 | IVDR 위치 | 산출 정거장 | 유형 | 담당 | 상태 |");
    lines.push("|---|---|---|---|---|---|");
    for (const it of g.items) {
      const req = requirementMeta[it.requirement].label;
      lines.push(`| ${it.title} | ${it.refs.join(", ")} | St${it.stationId} | ${req} |  |  |`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push("_IVDR 여정 위키 생성 등록부. 정보 제공용이며 법적 자문이 아님._");
  return lines.join("\n");
}
