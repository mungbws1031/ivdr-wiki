# 01 추적성 2단계

- 묶음: 제품 기능 확장 · 시작 조건: **바로 가능**

## 목표
추적성 매트릭스(REQ↔RSK↔VFY↔EVD)에 설계 출력과 변경 영향, 리비전·감사 기록을 더한다.

## 왜
DesignFlow MD 비교에서 가장 큰 빈 곳. 지금은 설계 요소(부품·PCB·SW)가 없어서 '이걸 바꾸면 무엇을 다시 봐야 하나'에 답할 수 없다.

## 범위
넣을 것
- 설계 출력 개체(DSO): BOM·부품·PCB 리비전·펌웨어/앱 버전·도면
- REQ↔DSO 연결, DSO 변경 등록 → 영향 후보(REQ·RSK·VFY·문서 섹션) + Impact/No impact/재시험/재검토 지정
- 요구사항·연결 리비전, 변경 사유·작성자 칸(브라우저 저장 범위의 감사 기록)
- 의심(suspect) 링크: 원천이 바뀌면 연결을 재검토로

뺄 것
- 다중 사용자·전자서명(04에서)
- PLM·ERP 연동

## 관련 파일
- `src/lib/trace.ts`
- `src/components/auto/TracePage.tsx`
- `src/hooks/useTraceStore.ts`
- `src/lib/impact.ts`

## 선행 조건
- 없음(브라우저 저장으로 시작)

## 완료 기준
- 설계 요소 하나를 바꾸면 영향 후보 목록이 나오고 사람이 판정
- 리비전 이력과 변경 사유가 남고 CSV로 내보내짐
- 테스트·Playwright 확인

## 새 대화 첫 문장
> CLAUDE.md와 projects/01-traceability-2/BRIEF.md를 읽고, 계획부터 세워줘.
