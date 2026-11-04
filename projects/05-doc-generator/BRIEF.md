# 05 문서 생성기 강화

- 묶음: 제품 기능 확장 · 시작 조건: **바로 가능**

## 목표
추적성·위험관리 데이터로 제출용 형식의 문서를 더 만든다.

## 왜
추적성 매트릭스는 화면·CSV뿐이다. 회사 양식이 다르면 지금 문서를 그대로 쓰기 어렵다.

## 범위
넣을 것
- 추적성 매트릭스·위험관리 보고서·검증 요약 docx/xlsx 생성
- 회사 템플릿 분리(핵심 데이터 ↔ 회사 양식)
- 기존 Word·Excel(DDI·FMEA) 가져오기: 열 매핑 + 사람 검수

뺄 것
- AI 창작 문서

## 관련 파일
- `src/lib/docx.ts`
- `src/lib/pipelineExport.ts`
- `src/data/documents.ts`
- `src/lib/trace.ts`

## 선행 조건
- 없음

## 완료 기준
- 매트릭스·RMR docx가 근거 원장과 함께 나옴
- Excel 가져오기로 요구사항·위험 행이 들어옴

## 새 대화 첫 문장
> CLAUDE.md와 projects/05-doc-generator/BRIEF.md를 읽고, 계획부터 세워줘.
