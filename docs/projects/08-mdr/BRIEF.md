# 08 MDR 확장 (비IVD)

- 묶음: 제품 기능 확장 · 시작 조건: **설계부터**

## 목표
체외진단이 아닌 의료기기(EU MDR)까지 판정 범위를 넓힌다.

## 왜
제품 유형에서 '기기·SW'가 '다음 단계'로 막혀 있다. 2차 시장(전자 의료기기·SaMD)으로 가려면 필요하다.

## 범위
넣을 것
- MDR Annex VIII Rule 1~22 규칙 데이터 설계
- SaMD(Rule 11) 우선
- 문서 세트 차이(MDR TD·임상평가)

뺄 것
- 모든 MDR 규칙의 한 번에 구현

## 관련 파일
- `src/lib/rules/`
- `src/data/spec/fields.ts`
- `src/data/docTree.ts`

## 선행 조건
- 02와 같은 원문 확인 네트워크 권장

## 완료 기준
- SaMD 예시로 등급·경로·문서 세트가 나옴(원문 확인 필요 표시)

## 새 대화 첫 문장
> CLAUDE.md와 docs/projects/08-mdr/BRIEF.md를 읽고, 계획부터 세워줘.
