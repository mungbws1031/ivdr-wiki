# ivdr-wiki — 작업 안내 (Claude용)

체외진단(IVD) 의료기기 **인증 문서 자동작성 툴**이다. 제품 컨셉 한 줄 → 인증 등급·경로·일정 → 실험계획 → 문서 초안 → 추적성까지 이어진다.
- 앱: React 19 + Vite + TypeScript + Tailwind v4 SPA
- 배포: GitHub Pages https://mungbws1031.github.io/ivdr-wiki/ (`.github/workflows/deploy.yml`, main 푸시 시 자동)
- 저장: **브라우저 localStorage만** 쓴다. 서버 없음. `server/`는 아직 배포하지 않은 AI 서버(Vercel) 초안
- 제품 요구사항·출시 이력·남은 과제: **`docs/PRD.md`** (먼저 읽을 것)
- 사용자와는 한국어로, 쉬운 말로 대화한다.

## 절대 규칙
1. **지어내지 않는다.** 수치·성능 값·위험 P·S·시험 조건·비교 기기 번호·규정 조항을 만들지 않는다.
   - 모르면 `[____]`, `[실험 후 입력]`, `[__분 — 시험 후 확정]`처럼 빈칸으로 둔다.
   - 규정 근거가 2차 자료면 출처·확인 날짜와 **"원문 확인 필요"**를 단다.
   - 세션 네트워크에서 eur-lex.europa.eu·health.ec.europa.eu·law.go.kr 등이 막힐 수 있다. 막히면 그렇게 말하고, 우회해서 추측하지 않는다.
2. **판정은 추천, 확정은 사람.** IVDR 클래스·국내 등급·FDA 제품 코드·추적성 연결 모두 사람이 확정한 값이 우선한다.
   - 빈 칸은 요구사항이 더 많은 쪽으로 보수적으로 가정하고 "(가정)"·"(추정)"을 표시한다.
   - 가정으로 나온 등급은 확정할 수 없게 한다.
3. **사람이 쓴 초안은 덮어쓰지 않는다.**
   - 초안은 문서별 섹션 순번(`ivdr-draft-<문서>-<번호>`)으로 저장된다.
   - 그래서 문서 템플릿(`src/data/documents.ts`)의 섹션은 **끝에만 추가**하고, 순서를 바꾸지 않는다.
4. 시장성 점검(`lib/market.ts`)은 **판매 예측이 아니다.** 입력값으로 한 계산만 보여 준다.
5. API 키는 사용자가 Vercel에서 직접 설정한다. 키를 다루거나 요구하지 않는다. 사용자 개인정보(이메일)를 외부로 보내지 않는다.
6. 화면 기준
   - 쉬운 한국어, 버튼·칩·입력 높이 40px 이상
   - 390px 모바일에서 가로 넘침 없음(표·스케치는 자체 가로 스크롤)
   - 다크 모드는 **아직 미구현**(`src/styles/tokens.css`에 주석만 있음)

## 작업 순서
```bash
npm run typecheck   # tsc -b --noEmit
npm test            # vitest (src/lib/**/*.test.ts 등)
npm run build       # tsc -b && vite build → dist/
```
- **화면 확인(Playwright)**
  - 클라우드 세션에는 Chromium·Playwright가 미리 설치돼 있다.
    - 스크립트에서 `createRequire("/opt/node22/lib/node_modules/")`로 `playwright`를 불러온다.
    - `chromium.launch({ args: ["--no-proxy-server"] })`로 띄운다.
  - 빌드 후 `python3 scripts/spa-server.py &`를 실행하면 http://127.0.0.1:4199/ivdr-wiki/ 에서 `dist`를 서빙한다.
  - 데스크톱 1280·모바일 390에서 가로 넘침·콘솔 오류를 확인한다. 외부 폰트 CDN 실패는 무시한다.
- **git·배포**
  1. 세션이 지정한 작업 브랜치에서 일한다. 시작할 때 `git fetch origin main && git checkout -B <브랜치> origin/main`
  2. 커밋한다. 푸시 전에 `git fetch origin <브랜치> && git merge origin/<브랜치>`로 원격 브랜치를 병합한다. **강제 push는 막혀 있다.**
  3. 일반 `git push -u origin <브랜치>`
  4. GitHub MCP로 PR 생성 → squash 머지 → Actions "Deploy to GitHub Pages" 성공 확인
  5. 커밋·PR 끝 서명 줄은 세션 지시를 따르고, 모델 ID는 넣지 않는다.
- 큰 기능은 먼저 계획(plan)을 세워 사용자 승인을 받는다. 방향이 여러 가지면 질문으로 고르게 한다.

## 코드 지도
| 위치 | 내용 |
|---|---|
| `src/data/spec/` | 제품 스펙 `types.ts` · 필드 정의 `fields.ts`(폼·진행률·미입력 목록의 원천) · `validate.ts`(emptySpec·exampleSpec·validateSpec·specHash) |
| `src/data/documents.ts`, `docTree.ts` | 문서 템플릿(IVDR 76+ · 한국 기술문서 · 510(k) 초안 등), 문서 트리·의존 관계 |
| `src/lib/rules/` | IVDR 분류(`classify`), 문서 세트(`applicability`), Rule 1~7 표(`justify`), 국가별 인증 경로(`certRoutes`) |
| `src/lib/kr/`, `src/lib/us/` | 한국 MFDS·미국 FDA 판정(등급·경로·제출 자료). 확인한 품목은 `US_KNOWN` 등에 출처·날짜와 함께 |
| `src/lib/gspr.ts`, `drafts/` | GSPR 1차 판정, 작동 원리·라벨·IFU·위해요인 표 등 초안 토큰 |
| `src/lib/tokens.ts`, `evidence.ts`, `impact.ts` | `{{auto.key}}` 채움, 근거 원장·가정 표시, 변경 영향 |
| `src/lib/planner/`, `results.ts` | 실험계획(CLSI EP 등)·표본수, 결과 입력 |
| `src/lib/roadmap.ts`, `transport/`, `market.ts`, `trace.ts` | 인증 일정, 운송·포장(PPWR), 시장성 점검, 추적성 매트릭스(REQ↔RSK↔VFY↔EVD) |
| `src/lib/concept.ts`, `sketch.ts`, `nextActions.ts`, `difficulty.ts`, `factory.ts` | 컨셉 한 줄 추정, 개념 스케치 모델, 지금 할 일, 난이도 얼굴, 문서 공장 |
| `src/components/auto/` | 자동작성 화면들. 단계 탭 `AutoSteps.tsx`(기획·판정·실험·문서) |
| `src/hooks/` | localStorage 저장소. 키 접두 `ivdr-`는 전체 백업(`lib/backup.ts`)에 자동 포함 |
| `skills/` | 부서 스킬 7개(`ivdr-*`) + 가상 심사관 5인 패널(`mfds-review-panel`, 실제 식약처 아님) |
| `reviews/` | 사용성 점검 기록 |

자주 하는 변경
- **새 스펙 칸**
  - `types.ts`에 키를 추가한다.
  - `fields.ts`에 한 줄을 추가한다.
  - `validate.ts`의 `emptySpec`을 고친다. 배열·객체 칸이면 `validateSpec`도 고친다.
  - 분류와 무관한 묶음은 `specHash`에서 뺀다.
- **새 화면**
  - `App.tsx`에 lazy 라우트를 추가한다.
  - `AutoSteps.tsx`의 `GROUPS`·`StepPath`를 고친다.
  - `src/lib/autoSteps.test.ts`의 탭 개수를 바꾼다.
- **새 문서 토큰**
  - `drafts`·`tokens.ts`에 값을 추가한다.
  - `TOKEN_LABEL`, `evidence.ts`의 `TOKEN_DEPS`·`INPUT_FIELD`를 함께 고친다.
- **판단 로직은 `src/lib`의 순수 함수**로 짜고, 같은 이름의 `*.test.ts`를 붙인다.

## 다음 큰 작업 후보 (자세한 건 `docs/PRD.md` 11절)
- **추적성 2단계**: 설계 출력(BOM·PCB·SW 버전)·변경 영향, 리비전·승인 기록(감사 추적). 다중 사용자는 서버가 필요하다.
- **AI 서버(Vercel)**: 문장 다듬기·요구사항 리뷰. 승인된 데이터만 쓰고, 출처 표시와 사람 승인을 거친다.
- **규정 원문 대조**: Rule 4(a) 예외, 국내 자가검사 허용 품목(FSH 포함 여부), 21 CFR 862.9·862.1300. 네트워크 허용이 필요하다.
- **기타**: MDR(비IVD) 확장, 다크 모드
