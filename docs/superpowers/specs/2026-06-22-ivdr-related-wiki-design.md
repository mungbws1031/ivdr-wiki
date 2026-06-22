# IVDR 연관 위키 — 설계 문서 (v1)

> 날짜: 2026-06-22 · 상태: 승인됨 (인라인) · 기반: `ivdr-wiki` 랜딩(JourneyMap) 위에 위키 레이어 추가

## 0. 목표

기존 11정거장 여정 지도를 **문서 작성용 레퍼런스**로 확장한다. 사용자가 정거장을
보며 "이 단계에서 어떤 문서를 어떻게 쓰는가"를 바로 파악하고, **복사용 마크다운
템플릿**으로 실제 IVDR 문서 초안을 시작할 수 있게 한다. 개념·정거장·문서가 서로
연결("연관")된다.

## 1. 결정 사항

- **성격**: 통합형 — 개념 위키 + 문서 템플릿을 정거장에 연결.
- **활용**: 복사용 초안 템플릿. 각 문서에 `전체 복사` + `.md 다운로드`. **앱 내 편집·저장 없음**.
- **구조**: 하이브리드 — 랜딩+drawer 유지(빠른 미리보기), 문서/개념은 전체 페이지.

## 2. 라우트 / 화면

| 라우트 | 컴포넌트 | 용도 |
|--------|----------|------|
| `/`, `/station/:id` | `JourneyMap` + `StationDetail` (기존) | 지도 + 빠른 미리보기 drawer |
| `/doc/:id` | `DocumentWorkspace` (신규) | 정거장별 문서 템플릿 + 복사/다운로드 |
| `/wiki` | `WikiIndex` (신규) | 개념 카테고리별 인덱스 |
| `/wiki/:slug` | `ConceptPage` (신규) | 개념 심화 + 관련 정거장·개념·조항 |

`StationDetail` drawer 하단에 `📄 문서 작성하기 →` 기본 버튼(→ `/doc/:id`)과,
본문 인라인 개념 링크(→ `/wiki/:slug`)를 추가한다.

## 3. 데이터 모델 (콘텐츠 단일 출처)

```ts
// src/data/concepts.ts
export type ConceptCategory = "annex" | "standard" | "concept" | "actor" | "deliverable";
export interface WikiConcept {
  slug: string;            // "gspr"
  term: string;            // "GSPR — 일반 안전·성능 요구사항"
  aka?: string[];          // ["Annex I", "General Safety and Performance Requirements"]
  category: ConceptCategory;
  summary: string;         // 한 줄 정의 (카드/인덱스용)
  body: string[];          // 심화 문단 (인라인 링크 {{slug|label}} 허용)
  refs: string[];          // 조항
  relatedStationIds: number[];
  relatedConceptSlugs: string[];
}

// src/data/documents.ts
export interface DocSection { heading: string; guidance: string; placeholder: string; }
export interface DocTemplate {
  stationId: number;       // 1..11 (정거장 1:1)
  docTitle: string;        // "의도된 목적 정의서"
  purpose: string;         // 이 문서가 무엇을 증명/충족하는가
  sections: DocSection[];  // 채워넣기식 목차
  checklist: string[];     // 완료 점검 항목
  relatedConceptSlugs: string[];
  refs: string[];
}
export function toMarkdown(t: DocTemplate): string; // 복사/다운로드용 .md 생성
```

인라인 링크 마크업: `{{slug|표시텍스트}}` → 렌더 시 `/wiki/slug` 링크. 기존
`**bold**` 렌더러를 확장한 공용 `renderRich()` 유틸로 처리(`src/lib/richText.tsx`).

## 4. 콘텐츠 인벤토리

### 문서 템플릿 11개 (정거장 1:1)
1. 의도된 목적 정의서 (Intended Purpose Statement)
2. 분류 근거서 (Classification Rationale — Annex VIII Rule 적용)
3. 적합성 평가 경로 계획 + 산출물 체크리스트
4. QMS↔IVDR 연계 매트릭스 (ISO 13485 기반 + IVDR 고유 프로세스)
5. 기술문서 목차(Annex II/III) + GSPR 체크리스트
6. 성능평가 계획 (PEP) 목차
7. 위험관리 계획 (ISO 14971) + GSPR↔위험 추적표
8. NB 선정·접촉·신청 준비 체크리스트
9. 적합성 선언서 (DoC, Annex IV) 템플릿
10. EUDAMED/UDI 등록 데이터 준비표 (Actor·SRN·UDI-DI·기기등록)
11. 시판 후 감시 계획 (PMS Plan) + PMPF/PSUR 일정

### 개념 위키 ~16개
GSPR(Annex I), Annex II(기술문서), Annex III(PMS 기술문서), Annex VIII(분류),
Annex XIII(성능평가/PMPF), ISO 13485, ISO 14971, IEC 62366, Notified Body/NANDO,
EUDAMED, UDI(UDI-DI/Basic UDI-DI), SRN, PEP/PER, PMS/PMPF/PSUR, DoC(Annex IV),
CE 마킹(Annex V).

## 5. 컴포넌트

| 컴포넌트 | 역할 |
|---------|------|
| `DocumentWorkspace` | 전체 페이지. 좌: 문서 섹션(guidance+placeholder), 우: 체크리스트+관련개념+조항. 상단 복사/다운로드 CTA |
| `ConceptPage` | 전체 페이지. 요약→본문→관련 정거장 카드→관련 개념→조항 |
| `WikiIndex` | 카테고리별 개념 그리드 |
| `ConceptChip` / `ConceptLink` | 인라인·블록 개념 링크 |
| `PageHeader` | 전체 페이지 공용 헤더(뒤로 가기, 브레드크럼) |
| `CopyMarkdownBar` | 전체 복사 + `.md` 다운로드 (Blob) |

## 6. 재사용 / 일관성

토큰·`StatusChip`·`getIcon`·페이즈 색·`renderRich` 재사용. 신규 페이지도 70:25:5,
8pt, AAA 대비, focus-ring, 48px 터치타깃, `prefers-reduced-motion` 준수. accent(SU Red)는
현재위치/CTA(복사·다운로드·문서작성 버튼)에만.

## 7. 범위 밖 (YAGNI)

앱 내 편집/저장, 백엔드/인증, 전문 검색엔진(인덱스로 충분), PhaseFilter·ProgressRail
완전판(별도 후속).

## 8. 빌드 순서

1. `concepts.ts` + `documents.ts` 데이터 + `toMarkdown`
2. `richText.tsx`(인라인 개념 링크) — 기존 bold 렌더러 대체
3. 공용 `PageHeader`, `CopyMarkdownBar`, `ConceptLink`
4. `DocumentWorkspace` (`/doc/:id`) + 라우트
5. `ConceptPage` (`/wiki/:slug`) + `WikiIndex` (`/wiki`) + 라우트
6. `StationDetail`에 `문서 작성하기` 버튼 + 본문 개념 링크 연결
7. 검증: 타입체크·빌드·딥링크·복사/다운로드·크로스링크 왕복
```
