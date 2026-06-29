# IVDR 여정 위키 (v1)

처음 보는 사람이 **글을 읽지 않고도** 한눈에 "전체 여정 + 지금 위치 + 다음 할 일"을
파악하는 IVDR 인증 가이드. `ivdr-wiki-spec.md` 스펙 구현.

> 판정 기준: *"3초 안에 전체 그림이 들어오는가?"*

## 스택

- React 19 + Vite 6 + TypeScript + Tailwind CSS v4
- 아이콘: `lucide-react`
- 라우팅(딥링크): `react-router-dom`
- 디자인 토큰: `src/styles/tokens.css` → `src/index.css`의 `@theme inline`으로 Tailwind에 연결

## 실행

```bash
npm install
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # 타입체크 + 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
```

## 구조

```
src/
├─ index.css            # Tailwind + tokens.css 연결 (@theme inline) + 베이스
├─ styles/tokens.css    # 70:25:5 + 8pt + AAA + 페이즈 5색 디자인 토큰
├─ data/stations.ts     # ⭐ 콘텐츠 단일 출처 — 5 페이즈·11 정거장·전환 기한
├─ lib/icons.tsx        # lucide kebab 이름 → 컴포넌트 매핑
└─ components/
   ├─ JourneyMap.tsx       # 랜딩 전체 지도 (scroll-spy, 딥링크 drawer)
   ├─ PhaseNav.tsx         # sticky 페이즈 레일 (현재 위치 강조)
   ├─ PhaseBand.tsx        # 페이즈 틴트 밴드 + 카드 그리드 (게슈탈트 공통영역)
   ├─ StationCard.tsx      # 글랜서블 최소 단위 (번호·아이콘·상태칩·한 줄)
   ├─ DecisionFork.tsx     # St2 분류 갈림길 히어로 (3갈래)
   ├─ StationDetail.tsx    # 상세 drawer (본문·🧭지금할일·조항) — 점진적 공개
   ├─ TransitionTimeline.tsx # 클래스별 전환 기한 타임라인
   └─ StatusChip.tsx       # 색+아이콘+라벨 3중 신호 (IEC 62366)
```

**콘텐츠 수정은 `src/data/stations.ts` 한 곳에서만** 한다 — 글/조항 변경이 컴포넌트
코드와 분리되어 유지보수가 쉽다.

## 디자인 원칙 (스펙 §2·§6 준수)

- **Map-first** — 랜딩은 시각 지도, 본문은 카드 클릭 시 drawer로 점진 공개
- **5단계 청킹** — 11정거장을 5 페이즈로 묶고 `--p1`~`--p5` 색상 코딩
- **70:25:5** — SU Red(`--accent`)는 현재 위치/CTA에만. 페이즈색·상태색과 역할 분리
- **3중 신호** — 모든 상태는 색 + 아이콘 + 라벨(텍스트). 색 단독 금지
- **접근성** — AAA 본문 대비, 48px 터치 타깃, focus-ring, `prefers-reduced-motion` 존중,
  키보드(`tab`/`enter`/`esc`) 지원

## 구현 상태

- [x] tokens.css → Tailwind 테마 연결, 베이스 레이아웃
- [x] `stations.ts` 데이터 (부록 A 전체)
- [x] StationCard → PhaseBand → **JourneyMap (랜딩 완성)**
- [x] DecisionFork (St2 히어로)
- [x] StationDetail drawer + 딥링크 (`/station/:id`)
- [x] PhaseNav (sticky 현재 위치 레일 + scroll-spy)
- [x] TransitionTimeline (전환 기한)
- [ ] PhaseFilter (페이즈 필터 토글) — 후속
- [ ] ProgressRail 완전판(정거장 단위 진행도) — 후속
```
