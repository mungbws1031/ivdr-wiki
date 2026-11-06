# 06 사례 적용: 갱년기 FSH — 이슈 목록

> 코드는 이 묶음에서 고치지 않았다. 버그를 발견해도 여기 기록만 하고, 수정은 다른 묶음(주로 02-regulation-check) 몫이다.

## F-11 (경미, 재인용 — 보고만 아님, 고칠 곳 있음)

- **내용**: `classify.ts`의 자가검사 일반 분기(126~135행)는 메시지에 "예외로 B입니다. 임신·가임력·콜레스테롤…"만 나열하고, 글루코스 분기처럼 "(원문 확인 필요)" 꼬리말을 달지 않는다. preset이 "other"(FSH 등)인 분석물은 전부 이 분기로 떨어지는데, 실제로는 Rule 4(a) 예외 목록에 있는지 모르는 상태인데도 문장이 "C입니다"로 단정적으로 들린다.
- **근거**: `src/lib/rules/classify.ts:126-135`, `docs/reviews/mfds-panel/2026-11-04-3차.md` T위원 의견.
- **이번 사례 재확인**: `.tmp/fsh-case.test.ts`로 FSH 컨셉을 실제로 돌려 본 결과, `classify()`가 돌려준 `status`는 "recommended"(openQuestions가 비어 있어서)였고 rationale에도 "(원문 확인 필요)" 문구가 없었다 — 보고서에 적힌 증상이 그대로 재현됨.
- **처리**: 고쳐야 함 — 02-regulation-check 묶음에서. `src/lib/rules/classify.ts`의 preset === "other" 분기에 "(Rule 4(a) 예외 목록 원문 확인 필요)" 꼬리말 추가.

## F-12 (주요, 재인용)

- **내용**: `hazards()`의 `decisionHarm()`이 알려진 분석물(LH·hCG·glucose·cholesterol·urine-cells·감염병) 외에는 `clinicalDecision` 문장을 그대로 위해 문구로 써서, FSH 같은 신규 분석물의 위해가 구체적이지 않다.
- **근거**: `src/lib/drafts/index.ts:200-211`, `docs/reviews/mfds-panel/2026-11-04-3차.md` Q위원 의견.
- **이번 사례 재확인**: 실제 실행에서 R-001·R-002의 harm이 "'폐경 이행기(갱년기) 여부 확인 보조' 판단을 잘못 내림 — 위해 [검토 필요]"로 나왔다 — 구체적 위해(예: "호르몬 치료 시작·중단을 그릇되게 결정")가 없어 위험관리 팀이 바로 쓸 근거가 약하다는 기존 발견이 그대로 재현됨.
- **처리**: 고쳐야 함 — 02-regulation-check 묶음에서(또는 05-doc-generator). 호르몬·내분비 계열처럼 "판단을 잘못 내림/놓침"이 임상적으로 어떤 조치 오류로 이어지는지 범주를 추가하거나, 최소한 "구체적 위해는 RA·의료 전문가가 채워야 함"이라는 안내를 rationale에 남긴다.

## F-13 (경미, 보고만 — 재인용)

- **내용**: `docs/PRD.md`의 "FDA FSH(#56)"로 US 쪽은 이미 FSH 전용 판정(`US_KNOWN.FSH`, 21 CFR 862.1300)이 있는데, IVDR·한국 쪽은 FSH 전용 특례가 없어 일반 규칙으로만 처리된다. 결함은 아니지만 세 나라 판정의 정교함 차이가 크다.
- **근거**: `src/lib/us/index.ts:40-45` vs `src/lib/rules/classify.ts`, `src/lib/kr/index.ts`.
- **처리**: 보고만(해당 없음) — 02-regulation-check에서 IVDR Rule 4(a)·국내 고시의 FSH 포함 여부를 원문으로 확인하면 EU·KR 쪽에도 전용 판정을 추가할 수 있다.

## F-14 (신규, 주요)

- **내용**: `src/lib/concept.ts`의 `DECISION` 테이블(`DECISION.other = "폐경 이행기(갱년기) 여부 확인 보조"`)이 FSH 컨셉을 자동으로 채울 때 `intendedPurpose.clinicalDecision`에 넣는 문구가, 이번 묶음 BRIEF가 요구한 안전 문구("진단 아님, 호르몬 변화 모니터링")와 다르다.
  - "여부 확인 보조"는 양성/음성 식 진단처럼 들릴 수 있고, "진단 아님"이라는 부정 표현이 빠져 있다 — 안전·광고 관점에서 뉘앙스 차이가 있다.
  - 화면(ConceptBox 등)에서 이 자동 채움 값이 BRIEF·회사 안전 정책과 다를 수 있다는 경고가 없다 — 사람이 모르고 그대로 쓸 위험이 있다.
- **근거**: `src/lib/concept.ts:78-82`(DECISION 테이블), `docs/projects/06-case-fsh/BRIEF.md`("IFU·라벨 문구: '진단 아님, 호르몬 변화 모니터링'"), 이번 사례 실제 실행 결과(`intendedPurpose.clinicalDecision` = "폐경 이행기(갱년기) 여부 확인 보조").
- **심각도**: 주요 — 안전 문구가 BRIEF 요구와 다른데 화면에서 경고 없이 그대로 문서 초안(IFU·위해요인)에 전파된다(위해 문구 R-001·R-002에도 이 문장이 그대로 들어감 — F-12와 연쇄).
- **처리**: 고쳐야 함(수정은 다른 묶음 몫 — 02-regulation-check 또는 05-doc-generator에서 검토). 제안:
  1. `DECISION.other` 문구를 "확인 필요" 꼬리말과 함께 더 중립적으로 바꾸거나,
  2. preset이 "other"일 때 자동 채운 clinicalDecision 값 옆에 "앱이 추정한 문구입니다 — 안전·광고 문구는 RA 담당자가 확정하세요"라는 안내를 화면에 추가한다.
  - 이번 묶음에서는 코드를 고치지 않고, 대신 `docs/projects/06-case-fsh/ifu-label-draft.md`에 BRIEF 요구 문구와 앱 자동 채움 문구를 나란히 적어 사람이 고르도록 안내했다.

## 처리 현황 요약

| ID | 심각도 | 처리 |
|---|---|---|
| F-11 | 경미 | 고쳐야 함 — 02-regulation-check |
| F-12 | 주요 | 고쳐야 함 — 02-regulation-check / 05-doc-generator |
| F-13 | 경미 | 보고만 |
| F-14 | 주요 | 고쳐야 함 — 02-regulation-check / 05-doc-generator (이번 묶음은 보고만) |
