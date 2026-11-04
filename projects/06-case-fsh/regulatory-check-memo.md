# 06 사례 적용: 갱년기 FSH — 규제 확인 메모

> 전부 2차 자료(앱 코드 주석·가상 패널 보고서) 기준이다. 원문(법령·고시·EUR-Lex·eCFR)을 직접 대조하지 않은 항목은 모두 "확인 필요"로 둔다. 지어낸 조항·수치 없음.

## 1. 한국 — 식약처 FSH 허용 품목·등급

### 자가검사 허용 품목 여부
- `src/lib/kr/index.ts`의 `KR_SELF_TEST_ITEMS`(자가검사용 허용 품목, 2차 자료로 확인한 목록): hCG(임신), 혈당, 코로나19, 인플루엔자, 마약류 대사체 — **FSH 없음**.
- `classifyKr()`를 FSH로 실제 실행하면 `selfTest.status = "check"`, 이유: "난포자극호르몬(FSH)이(가) 고시의 자가검사용 품목에 있는지 확인하지 못했습니다. 품목이 없으면 자가검사용으로 허가받을 수 없습니다(전문가용으로 허가하거나 품목 신설 요청)."
- `skills/mfds-review-panel/references/scenarios.md` S7: "국내 등급·자가검사 허용 품목도 고시 원문 확인 전이다."
- `skills/mfds-review-panel/reports/2026-11-04-3차.md`의 L위원 의견(L-01): "S7 FSH는 `KR_SELF_TEST_ITEMS`(hcg·glucose·covid·flu·drug) 목록에 없어 `krSelfTest()`가 '확인 필요'를 정확히 돌려준다. 이건 결함이 아니라 올바른 동작이다."
- **결론: FSH가 식약처 자가검사용 허용 품목(9개 기존 + 2026-06-30 신설 2개)에 포함되는지 — 확인 필요.** 고시 원문(「체외진단의료기기 품목 및 품목별 등급에 관한 규정」)을 직접 대조해야 한다.

### 등급
- `classifyKr()` 실행 결과: 등급 3(추천, 잠정). 근거: "일반인 자가검사는 틀린 결과를 전문가가 걸러 주지 못해 3등급 후보예요. 혈당 등 일부 품목은 다를 수 있어 품목 분류로 확인해야 해요."
- `skills/.../2026-11-04-3차.md` 표: "KR grade=3, selfTest=check"
- **결론: 식약처 품목 분류 데이터베이스에서 FSH(난포자극호르몬) 검사의 정확한 품목명·등급을 확인 필요.** 자가검사용 허용 품목이 아니면 전문가용(등급 2 가능성도 있음 — LH·hCG처럼 저위해 자가검사 품목이면 2등급 후보)으로 가는 경로도 사람이 검토해야 한다.

## 2. IVDR (EU) — B/C 판단 메모

- `classify()` 실행 결과: **Class C**, Rule 4(a), status "recommended"(이 실행에서는 openQuestions가 비어 있어 "recommended"로 나왔지만, 실제로는 FSH가 예외 목록에 있는지 모르는 상태다 — 아래 F-11 참고).
- 근거 문장(코드 원문): "일반인 자가검사는 Rule 4(a)에 따라 원칙적으로 C이지만, [품목]는 예외로 B입니다." FSH는 `SELF_TEST_EXCEPTION`(LH·hCG·glucose·cholesterol·urine-cells)에 없어 예외를 못 받고 일반 규칙(C)으로 떨어진다.
- `skills/mfds-review-panel/references/scenarios.md` S7 기대 판정: "C(원문 확인 필요) — Rule 4(a), FSH는 예외 목록 원문 확인 필요."
- S7 메모: "이 'C'는 Rule 4(a) 예외 목록에 FSH가 있는지 원문(Annex VIII)으로 확인하기 전까지는 확정이 아니다."
- **결론: IVDR Annex VIII Rule 4(a) 예외 목록(원문)에 FSH가 포함되는지 — 확인 필요.** 포함되면 B, 아니면 C로 남는다. 세션 네트워크에서 eur-lex.europa.eu가 막힐 수 있으므로(CLAUDE.md 절대 규칙 1) 02-regulation-check 묶음에서 네트워크 허용 후 원문 대조를 이어간다.

## 3. 미국 (FDA) — 참고 (이미 확인된 특례)

- `US_KNOWN.FSH`(src/lib/us/index.ts): 21 CFR 862.1300, Class I, 제품 코드 "NGA (OTC) · CGJ", pathway "check". 출처: "FDA 제품 분류 DB(NGA)·510(k) 사례(2차 자료, 원문 확인 필요)", 확인일 2026-11-03.
- note: "Class I — 510(k) 면제지만 § 862.9 제한이 붙어요. 예전 가정용 폐경 FSH 소변 검사는 510(k)를 거친 사례가 있어요(K040575·K030058·K052662, 제품 코드 CGJ). 앱 알고리즘으로 폐경 '단계'를 판정하는 것처럼 새로운 용도·기술이면 면제 범위를 벗어날 수 있어서 862.9 원문으로 확인해야 해요."
- **결론: 21 CFR 862.9(면제 제한) 원문 — 확인 필요.** 3국 중 미국만 전용 특례가 이미 들어가 있다(F-13 참고).

## 4. 요약 표

| 국가 | 등급/클래스 (앱 추천) | 자가검사 허용 여부 | 원문 확인 필요 항목 |
|---|---|---|---|
| EU (IVDR) | Class C (Rule 4(a)) | 자가검사 기기 자체는 허용, 품목 예외(B) 여부가 문제 | Annex VIII Rule 4(a) 예외 목록에 FSH 포함 여부 |
| 한국 (MFDS) | 3등급 (잠정) | **확인 필요** — `KR_SELF_TEST_ITEMS`에 FSH 없음 | 고시(「체외진단의료기기 품목 및 품목별 등급에 관한 규정」) 원문의 FSH 품목·등급 |
| 미국 (FDA) | Class I, 21 CFR 862.1300 | 허용(OTC) — 2차 자료로 이미 확인 | § 862.9 면제 제한 원문(앱 알고리즘 폐경 단계 판정이 면제 범위 안인지) |

## 5. 참고 자료

- `skills/mfds-review-panel/references/scenarios.md` (S7 행, S7 메모)
- `skills/mfds-review-panel/reports/2026-11-04-3차.md` (S7 FSH 종합 판정 표, T/Q/L 위원 의견, F-11·F-12·F-13)
- `src/lib/us/index.ts` `US_KNOWN.FSH`
- `src/lib/kr/index.ts` `KR_SELF_TEST_ITEMS`, `krSelfTest()`
- `src/lib/rules/classify.ts` `SELF_TEST_EXCEPTION`
