// =====================================================================
// src/data/concepts.ts
// 개념 위키 — IVDR 조항·Annex·표준·핵심 개념. 정거장/문서와 양방향 연결.
// 글 원본: content/wiki/*.md (옵시디언 노트). 노트의 [[slug|표시텍스트]] 링크는
// 빌드할 때 {{slug|표시텍스트}} 로 바뀌어 renderRich 가 처리한다.
// 규제 사실은 2026.6 기준 확인값. 실제 진행 시 최신 관보로 재확인할 것.
// =====================================================================

import conceptNotes from "virtual:wiki-concepts";

export type ConceptCategory =
  | "annex" // IVDR 부속서
  | "standard" // 국제 표준
  | "concept" // 핵심 개념/시스템
  | "actor" // 행위자/기관
  | "deliverable"; // 산출물 문서

export interface WikiConcept {
  slug: string;
  term: string;
  aka?: string[];
  category: ConceptCategory;
  summary: string; // 한 줄 정의 (인덱스/칩)
  body: string[]; // 심화 문단 ({{slug|label}} 허용)
  refs: string[];
  relatedStationIds: number[];
  relatedConceptSlugs: string[];
}

export const categoryLabel: Record<ConceptCategory, string> = {
  annex: "부속서(Annex)",
  standard: "국제 표준",
  concept: "핵심 개념",
  actor: "행위자·기관",
  deliverable: "산출물 문서",
};

// 본문 데이터는 content/wiki/<slug>.md 노트(옵시디언에서 편집)에서 빌드할 때 읽어 온다.
// 변환·검사 규칙: vite/wikiContent.ts
export const concepts: WikiConcept[] = conceptNotes;

export const conceptBySlug = (slug: string): WikiConcept | undefined =>
  concepts.find((c) => c.slug === slug);
