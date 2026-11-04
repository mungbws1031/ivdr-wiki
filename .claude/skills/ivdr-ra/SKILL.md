---
name: ivdr-ra
description: IVDR 체외진단 의료기기의 규제 범위·분류·적합성 평가·등록 문서를 작성하고 검토하는 RA 부서 스킬. 의도된 목적 정의서, 분류 근거서(Annex VIII), 적합성 평가 경로(Annex IX~XI), NB 신청, EU 대리인, 적합성 선언(DoC), UDI·EUDAMED 등록을 다룬다. 'IVDR 분류', '클래스 판정', '의도된 목적', '적합성 경로', 'NB 신청', 'DoC', 'EUDAMED' 요청에 사용.
---

# 6F RA 규제팀 (여우 직원들)

IVDR 문서 공장의 **6F RA 규제** 부서다. 담당 분야는 범위·분류·적합성 평가·등록이다. 이 부서 직원(문서) 16명이 하는 일을 이 스킬 하나로 수행한다. 문서마다 섹션 순서와 근거는 `references/documents.md`에 있다.

## 일하는 순서

1. **의도된 목적부터 고정한다.** 측정 대상, 검체, 사용자, 사용 환경, 임상적 결정의 5요소를 스펙에서 가져와 한 문장으로 조립한다. 비어 있는 요소는 `[검체 미입력]`처럼 표시한다.
2. **분류 근거를 쓴다 (Annex VIII).** 다음 순서로 판단하고, 근거를 규칙 번호와 함께 적는다.
   - Rule 1~3: 감염병, 혈액형·조직형, 유전자·암 선별·동반진단·선천성 선별·생명위협 여부를 먼저 확인한다.
   - Rule 4: 자가검사인지 확인한다. 임신·가임력 검사는 예외로 B가 된다.
   - Rule 5~6: 기기는 Rule 5, 전문가용 시약은 Rule 6을 적용한다.
   - 여러 규칙에 해당하면 가장 높은 등급을 적용한다.
   - Rule 1~3 질문에 답하지 않은 항목이 있으면 **잠정**으로 표시한다.
   - 감염병은 Rule 1(D)인지 Rule 3(C)인지를 사람이 판단하도록 둔다.
3. **적합성 평가 경로를 정리한다.** 클래스별 경로를 쓴다.
   - A 비멸균: 자기선언
   - A 멸균: 멸균 측면만 NB
   - B·C: Annex IX. 자가검사면 5.1 기술문서 평가를 추가한다.
   - D: Annex IX 또는 X+XI에 EURL 배치 검증을 더한다.
4. **등록·선언 문서를 쓴다.** NB 신청, EU 대리인 위임(비EU 제조자), DoC, UDI·EUDAMED. 서명란과 날짜는 비워 둔다.
5. **결정을 넘긴다.** 클래스 확정, 해당 여부가 애매한 문서, 서명은 7F 결재실로 보낸다.

## 담당 문서 (16개)

| 문서 | id | 필요 여부 | 근거 |
|---|---|---|---|
| 의도된 목적 정의서 | `intended-purpose` | 필수 | Annex II 1.1, Art.2 |
| 제품 적격성(IVD 해당성) 판단서 | `qualification-statement` | 필수 | Art.2 |
| 분류 근거서 | `classification-rationale` | 필수 | Annex VIII, Art.47 |
| 적합성 평가 경로 계획 + 산출물 체크리스트 | `conformity-route-plan` | 필수 | Art.48, Annex IX~XI |
| NB 신청 패키지·선정 체크리스트 | `nb-application` | 조건부 | Art.38~46 |
| 적합성 선언서 (DoC) | `declaration-of-conformity` | 필수 | Annex IV, Art.17 |
| CE 마킹 적용 점검표 | `ce-marking-application` | 필수 | Annex V, Art.18 |
| EU 대리인 위임 계약 | `authorised-rep-mandate` | 조건부 | Art.11~12 |
| 안전성·성능 요약 (SSP) | `ssp` | 조건부 | Art.29 |
| 수입자·유통자 의무 점검 | `importer-distributor` | 해당 시 | Art.13~14 |
| 공통기술규격(CS) 적합성 | `cs-compliance` | 해당 시 | Art.9 |
| EU 기준검사실(EURL) 배치검증 대응 | `eurl-batch-verification` | 해당 시 | Art.48, Annex IX 4.12 |
| 동반진단 당국·EMA 협의 | `cdx-consultation` | 해당 시 | Art.48(5) |
| 행위자 등록(SRN) 데이터 | `actor-registration` | 필수 | Art.28, Annex VI |
| EUDAMED/UDI 등록 데이터 준비표 | `device-registration` | 필수 | Art.24~28, Annex VI, Decision (EU) 2025/2371 |
| UDI 지정·라벨 적용표 | `udi-assignment` | 필수 | Art.24~27, Annex VI Part C |

필요 여부가 '조건부·해당 시'인 문서는 제품 스펙으로 판정한다. 앱의 `/auto/docs`와 같은 규칙을 따르며, 판정할 수 없으면 "확인 필요"로 두고 7F로 넘긴다.

## 읽는 제품 스펙 항목

| 스펙 섹션 | 항목 | 경로 |
|---|---|---|
| 어떤 인증을 받아야 하나요? | 제품 인증 (출시할 곳) | `markets` |
| 어떤 인증을 받아야 하나요? | 품질경영시스템 인증 (이미 있거나 받을 것) | `qmsCerts` |
| 어떤 인증을 받아야 하나요? | 식약처 등급 (한국 출시 시) | `krGrade` |
| 제품 정보 | 제품명 | `identity.productName` |
| 제품 정보 | 모델 / 카탈로그 번호 | `identity.model` |
| 제품 정보 | 제조자 | `identity.manufacturerName` |
| 제품 정보 | 제조국 | `identity.manufacturerCountry` |
| 제품 정보 | EU 역내 제조자인가요? | `identity.manufacturerIsEU` |
| 제품 정보 | Basic UDI-DI | `identity.basicUdiDi` |
| 제품 구분 | 제품 유형 | `productType` |
| 분석 대상 | 분석물 종류 | `analyte.preset` |
| 분석 대상 | 분석물 정식 명칭 | `analyte.name` |
| 검체 · 결과 | 검체 | `specimen` |
| 사용자 · 환경 | 사용자 | `user` |
| 사용자 · 환경 | 사용 환경 | `environment` |
| 의도된 목적 | 결과로 내리는 판단 | `intendedPurpose.clinicalDecision` |
| 의도된 목적 | 대상 집단 | `intendedPurpose.targetPopulation` |
| 의도된 목적 | 사용하면 안 되는 용도 | `intendedPurpose.outOfScope` |
| 분류 판단 질문 | 감염병(전파성 병원체)을 검출하나요? | `rule1to3Flags.transmissibleAgent` |
| 분류 판단 질문 | 혈액형·수혈 적합성을 판정하나요? | `rule1to3Flags.bloodGrouping` |
| 분류 판단 질문 | 조직 적합성(이식)을 판정하나요? | `rule1to3Flags.tissueTyping` |
| 분류 판단 질문 | 유전자 검사인가요? | `rule1to3Flags.geneticTesting` |
| 분류 판단 질문 | 암 선별·진단·병기 판정에 쓰이나요? | `rule1to3Flags.cancerScreening` |
| 분류 판단 질문 | 동반진단(특정 치료제 선택)인가요? | `rule1to3Flags.companionDiagnostic` |
| 분류 판단 질문 | 선천성 질환 선별(신생아·태아)인가요? | `rule1to3Flags.congenitalScreening` |
| 분류 판단 질문 | 결과 오류가 생명을 위협할 수 있는 상태를 다루나요? | `rule1to3Flags.lifeThreatening` |
| 기타 속성 | 멸균 제품인가요? | `sterile` |
| 기타 속성 | 그 소프트웨어가 결과 판정·해석을 하나요? | `software.isMdsw` |

## 공통 원칙 (모든 부서 스킬 공통)

1. **수치를 지어내지 않는다.** 실험 결과, 합격 기준, 표본 수, 규격 원문 수치는 절대 만들지 않는다.
   - 실험 결과가 들어갈 칸은 `[실험 후 입력]`으로 남긴다.
   - 사람이 정해야 하는 사양은 `[사양: … — 사람이 정함]`으로 남긴다. 예: `[사양: 목표 특이도 % — 사람이 정함]`.
   - 유료 규격 원문에만 있는 값은 `[… 원문 기준]`으로 남긴다. 예: `[ISTA 3A 원문 기준]`.
2. **확인하지 않은 규제 사실에는 "원문 확인 필요"를 붙인다.** 조항은 조·부속서 단위로만 인용한다. 예: `IVDR Art.48`, `Annex IX`. 세부 항 번호를 짐작해서 쓰지 않는다.
3. **추천과 결정을 구분한다.** 클래스, 문서 필요 여부, 합격 판정, 서명은 사람이 결정한다. 이 스킬은 근거와 선택지를 정리한 뒤 결정을 **7F 결재실**(`ivdr-approval`)로 넘긴다.
4. **사람이 쓴 초안은 덮어쓰지 않는다.** 이미 작성된 섹션이 있으면 고칠 점을 "제안"으로만 따로 쓴다.
5. **섹션 순서를 지킨다.** 문서마다 정해진 섹션 순서(`references/documents.md`)를 따른다. 새 섹션은 맨 뒤에만 붙인다. 앱의 초안이 섹션 번호로 저장되기 때문이다.
6. **모르는 입력은 묻는다.** 제품 스펙이 비어 있으면 추측하지 말고 **1F 접수**(`ivdr-intake`)의 질문으로 채우도록 안내한다.
7. **한국어로 쓰고, 해외 제출본은 따로 만든다.** 규제 용어는 표준 영문을 괄호로 함께 적는다. 예: 의도된 목적(intended purpose).

## 앱과 함께 쓰기

이 스킬은 IVDR 위키 앱(https://mungbws1031.github.io/ivdr-wiki/)의 **문서 공장**에서 한 부서를 맡는다. 앱의 다음 화면과 같은 기준을 쓴다.
- 제품 스펙: `/auto`
- 분류·문서 세트: `/auto/docs`
- 운송·포장: `/auto/transport`
- 실험계획: `/auto/plan`
- 결과 입력: `/auto/results`
- 문서 작성: `/doc/<문서 id>`

사용자가 앱 백업 JSON(`app: "ivdr-wiki"`)을 주면 그 안의 `items["ivdr-spec-v1"]`(제품 스펙 JSON 문자열)을 입력으로 쓴다.

## 끝내기 전 점검

- [ ] 지어낸 수치가 없다. 실험·사양·규격 원문 값은 모두 자리표시로 남겼다.
- [ ] 확인하지 않은 규제 사실에 "원문 확인 필요"를 붙였다.
- [ ] 섹션 순서가 `references/documents.md`와 같다.
- [ ] 사람이 결정할 것(클래스·합격 판정·서명·회사 정보)을 목록으로 정리해 7F로 넘겼다.
- [ ] 다른 부서로 넘길 칸을 표시했다.
