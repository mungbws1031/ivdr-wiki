# 02 규정 원문 대조

- 묶음: 규제 정확도·검증 · 시작 조건: **네트워크 허용 필요**

## 목표
2차 자료로 넣은 규칙을 원문과 대조해 '원문 확인 필요' 표시를 줄인다.

## 왜
모든 판정이 아직 'RA 검토 전·원문 확인 필요'다. 혈당 판정처럼 2차 자료 해석이 틀린 사례가 이미 있었다.

## 범위
넣을 것
- IVDR Annex VIII Rule 4(a) 예외 목록 원문, MDCG 2020-16 예시(FSH 등)
- 국내 「체외진단의료기기 품목 및 품목별 등급에 관한 규정」 자가검사 허용 품목·FSH·LH 등급
- 21 CFR 862.9 면제 한계, 862.1155·862.1300·862.1485
- ISO 15223-1 심볼 명칭
- 대조 결과를 규칙 데이터의 출처·확인 날짜로 갱신, 검토 기록 표

뺄 것
- 규칙 엔진 구조 변경

## 관련 파일
- `src/lib/rules/classify.ts`
- `src/lib/kr/index.ts`
- `src/lib/us/index.ts`
- `src/lib/drafts/index.ts`

## 선행 조건
- 세션 네트워크에 eur-lex.europa.eu, health.ec.europa.eu, law.go.kr, mfds.go.kr, ecfr.gov, accessdata.fda.gov 허용

## 완료 기준
- 항목마다 원문 인용·확인 날짜·차이점 기록
- 틀린 판정 수정 + 테스트
- 확인된 항목은 '원문 확인 필요' 제거

## 새 대화 첫 문장
> CLAUDE.md와 projects/02-regulation-check/BRIEF.md를 읽고, 계획부터 세워줘.
