# 작업 묶음 (projects)

> 이 저장소는 **IVDR을 처음 접해도, 내 제품 한 줄 설명에서 시작해 인증 계획과 문서 초안까지 따라가며 배우는 허브**다. 묶음은 이 방향에 가까운 것부터 한다.

새 대화 하나에 묶음 하나를 맡긴다. 새 대화는 저장소의 `CLAUDE.md`(공통 규칙)를 자동으로 읽는다. 시작할 때 묶음의 `BRIEF.md`를 함께 읽게 한다.

**시작 문장 예:** `CLAUDE.md와 docs/projects/05-doc-generator/BRIEF.md를 읽고, 계획부터 세워줘.`

전체 그림: [mindmap.html](mindmap.html) (브라우저로 열기) · [roadmap.xmind](roadmap.xmind) (XMind로 편집) — 두 파일은 아직 이전 분류 기준이다.

## 지금

| # | 묶음 | 목표 | 메모 |
|---|---|---|---|
| — | 홈 입구 2갈래 · 위키↔도구 연결 | 홈 입구를 "IVDR이 처음이에요"(`/ivdr`·`/wiki`)와 "내 제품이 있어요"(`/auto`) 둘로 줄이고, `/auto` 용어 → 위키, 위키 → `/auto` 링크를 단다. | 브리프 폴더 없음 — 범위는 `docs/PRD.md` 11장. 홈(`CertHub`)에 `/auto/start` 카드는 이미 있으나 인증 지도 카드들 사이에 섞여 있다 |
| 05 | [문서 생성기 강화](05-doc-generator/BRIEF.md) | 추적성·위험관리 데이터로 제출용 형식의 문서를 더 만든다. | 시작 조건: 바로 가능. 06에서 나온 F-12·F-14(`docs/projects/06-case-fsh/issues.md`)를 함께 본다 |

## 다음

| # | 묶음 | 목표 | 메모 |
|---|---|---|---|
| 10 | [통합 PRD](10-integrated-prd/BRIEF.md) | DesignFlow MD PRD와 ivdr-wiki를 합친 통합 PRD를 만든다. | 브리프의 PoC 서비스 패키지·KPI(사업화) 부분은 보류로 뺀다 |
| 02 | [규정 원문 대조](02-regulation-check/BRIEF.md) | 2차 자료로 넣은 규칙을 원문과 대조해 '원문 확인 필요' 표시를 줄인다. | 시작 조건 "네트워크 허용"은 로컬 PC에서는 충족(2026-11-05 EUR-Lex 접속 확인). IVDR 전환 일정·PSUR 주기 표시 4곳은 브랜치 `claude/eurlex-verify`에서 정리함(미머지) |

## 보류 — 사용자가 풀기 전까지 시작하지 않는다

| # | 묶음 | 목표 | 보류 이유 |
|---|---|---|---|
| 03 | [AI 서버 (Vercel)](03-ai-server/BRIEF.md) | experimental/server/를 Vercel에 배포하고 요구사항 리뷰·문장 다듬기·번역을 붙인다. | Vercel·키 설정 필요, 지금은 브라우저 저장만 쓰는 방향 |
| 04 | [서버 저장·다중 사용자](04-multi-user/BRIEF.md) | 브라우저 저장을 넘어 팀이 같은 프로젝트를 쓰게 한다. | 03 이후 |
| 08 | [MDR 확장 (비IVD)](08-mdr/BRIEF.md) | 체외진단이 아닌 의료기기(EU MDR)까지 판정 범위를 넓힌다. | 지금 정체성은 IVDR(IVD) 중심 |
| 10 | [사업화 (10의 일부)](10-integrated-prd/BRIEF.md) | PoC 서비스 패키지, KPI 기준값 측정 방법 | 사업 방향 결정 전 |

## 완료

| # | 묶음 | 결과 |
|---|---|---|
| 01 | [추적성 2단계](01-traceability-2/BRIEF.md) | 설계 출력(DSO) 등록·영향 후보 판정·CSV 감사 기록 — `/auto/trace` "설계 출력" 탭 |
| 06 | [사례 적용: 갱년기 FSH](06-case-fsh/BRIEF.md) | 사례 보고서·IFU·라벨 초안·규제 메모·이슈 목록. 남은 이슈 F-12·F-14는 05로 |
| 07 | [검증 3차](07-verification-3/BRIEF.md) | 가상 심사관 패널 3차·사용성 3차, RA 검토 요청서, "심사관에게 물어보기" 버튼 |
| 09 | [화면 품질](09-ui-quality/BRIEF.md) | 다크 모드 토큰·하드코딩 색 토큰화·체크리스트 완료 축하, 번들 분석(vendor 분리는 역효과라 되돌림) |

## 규칙
- 묶음끼리 같은 파일을 동시에 크게 고치지 않는다(특히 `src/lib/trace.ts`, `src/data/spec/`).
- 동시에 진행하면 먼저 머지된 쪽을 다음 묶음이 받아서 시작한다.
- 묶음을 끝내면 `docs/PRD.md` 출시 이력과 이 파일의 구간(지금·다음·보류·완료)을 갱신한다.
