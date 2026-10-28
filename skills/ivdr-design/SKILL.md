---
name: ivdr-design
description: IVDR 기술문서(Annex II·III)와 설계 관리·위험관리 문서를 작성하는 개발·설계 부서 스킬. 기기 설명·사양, 라벨·IFU, 설계 입력·출력·검증·밸리데이션, 사용적합성(IEC 62366-1), 소프트웨어(IEC 62304)·사이버보안, 위험관리(ISO 14971) 파일을 다룬다. '기술문서', 'IFU', '라벨', '설계 검증', '위험관리', 'FMEA', '사용적합성', 'SW 밸리데이션' 요청에 사용.
---

# 5F 개발·설계팀 (곰 직원들)

IVDR 문서 공장의 **5F 개발·설계** 부서다. 담당 분야는 기술문서·설계·위험관리이다. 이 부서 직원(문서) 25명이 하는 일을 이 스킬 하나로 수행한다. 문서마다 섹션 순서와 근거는 `references/documents.md`에 있다.

## 일하는 순서

1. **기기 설명·사양을 만든다.** 키트 구성품, 판독 방식, 보관 조건, 유효기간 목표를 스펙에서 옮겨 적는다. 수치가 비어 있으면 `[사양: … — 사람이 정함]`으로 둔다.
2. **라벨·IFU를 쓴다.** 자가검사 제품이면 일반인이 이해할 수 있는 말로 쓴다. 기호는 ISO 15223-1을 참조한다. 검사 성능 수치는 `[실험 후 입력]`으로 둔다.
3. **설계 관리 문서를 쓴다.** 설계 입력은 스펙과 목표 성능에서 가져온다. 설계 출력, 검증(4F 실험 결과 참조), 밸리데이션 순서로 추적표를 만든다.
4. **위험관리를 한다 (ISO 14971).** 위해요인, 위해 상황, 위험 통제, 잔여 위험 순서로 정리한다. 사용 오류는 사용적합성 파일과 연결하고, 운송 위험은 3F와 연결한다.
5. **소프트웨어가 있으면 따로 다룬다.** 리더기나 앱 판독이 있으면 펌웨어와 앱을 소프트웨어로 보고 다음을 적용한다.
   - 수명주기: IEC 62304
   - 보안: IEC 81001-5-1, MDCG 2019-16
   - 분류: IVDR Annex VIII 1.4(기기와 같은 클래스), MDCG 2019-11(MDSW 판단)
   - 위 조항과 지침은 원문 확인 필요로 표시한다.
6. **넘기기:** 성능 수치가 필요한 칸은 4F, 운송 시험은 3F, 결정과 서명은 7F로 넘긴다.

## 담당 문서 (25개)

| 문서 | id | 필요 여부 | 근거 |
|---|---|---|---|
| 기기 설명서·사양 | `device-description` | 필수 | Annex II 1.1 |
| 설계·제조 정보 | `design-manufacturing-info` | 필수 | Annex II 3 |
| 기술문서 목차 + GSPR 체크리스트 | `tech-doc-toc-gspr` | 필수 | Annex II, Annex I |
| 라벨 사양서 | `labelling-spec` | 필수 | Annex I (정보), Art.18 |
| 사용설명서(IFU) | `ifu` | 필수 | Annex I (정보) |
| 이익-위험 분석서 | `benefit-risk` | 필수 | Annex I 1, Annex II |
| 안정성 시험 계획·보고서 | `stability-study` | 필수 | Annex II 6.2, Annex XIII |
| 생체적합성 평가 (ISO 10993) | `biocompatibility` | 해당 시 | ISO 10993, Annex I |
| 소프트웨어 검증·밸리데이션 | `sw-validation` | 해당 시 | Annex I 16, IEC 62304 |
| 사이버보안 문서 (MDCG 2019-16) | `cybersecurity` | 조건부 | MDCG 2019-16, Annex I 16.2 |
| 설계·개발 계획서 | `dd-plan` | 필수 | ISO 13485 7.3.2 |
| 설계 입력 (Design Inputs) | `design-inputs` | 필수 | ISO 13485 7.3.3, Annex I |
| 설계 출력 (Design Outputs) | `design-outputs` | 필수 | ISO 13485 7.3.4 |
| 설계 검토 (Design Review) | `design-review` | 필수 | ISO 13485 7.3.5 |
| 설계 검증 (Verification) | `design-verification` | 필수 | ISO 13485 7.3.6 |
| 설계 밸리데이션 (Validation) | `design-validation` | 필수 | ISO 13485 7.3.7 |
| 설계 이관 (Design Transfer) | `design-transfer` | 필수 | ISO 13485 7.3.8 |
| 설계 변경 관리 | `design-changes` | 필수 | ISO 13485 7.3.9 |
| 설계이력파일 (DHF) | `dhf` | 필수 | ISO 13485 7.3.10 |
| 요구사항 추적성 매트릭스 | `traceability-matrix` | 필수 | ISO 13485 7.3, Annex I |
| 위험관리 계획 + GSPR↔위험 추적표 | `risk-management-plan` | 필수 | ISO 14971:2019, Annex I |
| 위험관리 파일·보고서 | `risk-management-file` | 필수 | ISO 14971:2019 |
| FMEA (고장모드 영향분석) | `fmea` | 해당 시 | ISO 14971:2019, IEC 60812 |
| 사용적합성(IEC 62366) 계획·보고서 | `usability-file` | 조건부 | IEC 62366-1, Annex I |
| FTA (결함수 분석) | `fta` | 해당 시 | IEC 61025, ISO 14971 |

필요 여부가 '조건부·해당 시'인 문서는 제품 스펙으로 판정한다. 앱의 `/auto/docs`와 같은 규칙을 따르며, 판정할 수 없으면 "확인 필요"로 두고 7F로 넘긴다.

## 읽는 제품 스펙 항목

| 스펙 섹션 | 항목 | 경로 |
|---|---|---|
| 어떤 인증을 받아야 하나요? | 제품 인증 (출시할 곳) | `markets` |
| 제품 정보 | 제품명 | `identity.productName` |
| 제품 정보 | 모델 / 카탈로그 번호 | `identity.model` |
| 제품 정보 | 제조자 | `identity.manufacturerName` |
| 제품 정보 | EU 역내 제조자인가요? | `identity.manufacturerIsEU` |
| 제품 구분 | 제품 유형 | `productType` |
| 분석 대상 | 분석물 정식 명칭 | `analyte.name` |
| 분석 대상 | Cut-off | `analyte.cutoffValue` |
| 분석 대상 | Cut-off 단위 | `analyte.cutoffUnit` |
| 검체 · 결과 | 검체 | `specimen` |
| 검체 · 결과 | 판독 방식 | `result.readout` |
| 사용자 · 환경 | 사용자 | `user` |
| 사용자 · 환경 | 사용 환경 | `environment` |
| 의도된 목적 | 사용하면 안 되는 용도 | `intendedPurpose.outOfScope` |
| 기타 속성 | 앱·소프트웨어가 함께 제공되나요? | `software.hasApp` |
| 기타 속성 | 그 소프트웨어가 결과 판정·해석을 하나요? | `software.isMdsw` |
| 보관 · 안정성 | 보관 최저 온도 | `storage.tempMinC` |
| 보관 · 안정성 | 보관 최고 온도 | `storage.tempMaxC` |
| 보관 · 안정성 | 목표 유효기간 | `storage.shelfLifeMonths` |
| 보관 · 안정성 | 개봉 후 사용 시한 | `storage.openedStabilityMin` |
| 키트 구성품 | 구성품 | `kitComponents` |
| 목표 성능 | 목표 민감도 (PPA) | `targets.sensitivity` |
| 목표 성능 | 목표 특이도 (NPA) | `targets.specificity` |
| 목표 성능 | 평가 로트 수 | `targets.lots` |

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
