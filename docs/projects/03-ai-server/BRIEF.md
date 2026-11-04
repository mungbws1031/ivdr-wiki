# 03 AI 서버 (Vercel)

- 묶음: 플랫폼 (서버) · 시작 조건: **사용자 설정 필요**

## 목표
experimental/server/를 Vercel에 배포하고 요구사항 리뷰·문장 다듬기·번역을 붙인다.

## 왜
규칙만으로는 '모호한 요구사항', '검증 불가능한 문장'을 잡기 어렵다. AI는 추천만 하고 사람이 승인한다.

## 범위
넣을 것
- Vercel 함수(접근 코드·요청 제한·CORS·요청 크기 검사)
- 요구사항 리뷰: 모호·검증 불가·판정 기준 누락 탐지와 개선 문장 제안
- 문서 섹션 문장 다듬기(지어낸 수치 탐지 시 플래그)
- 번역(영문 제출용)

뺄 것
- AI가 판정·수치를 확정하는 기능

## 관련 파일
- `experimental/server/api/`
- `experimental/server/lib/`
- `src/lib/translate.ts`

## 선행 조건
- 사용자가 Vercel 프로젝트와 ANTHROPIC_API_KEY·접근 코드를 직접 설정
- Anthropic 콘솔 지출 한도 설정

## 완료 기준
- 추적성 화면에서 요구사항 리뷰 버튼 → 제안·출처·승인
- 키 없이도 앱의 나머지 기능은 그대로 동작

## 새 대화 첫 문장
> CLAUDE.md와 docs/projects/03-ai-server/BRIEF.md를 읽고, 계획부터 세워줘.
