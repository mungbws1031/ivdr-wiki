# 제품 스펙 항목 (앱 `src/data/spec/fields.ts` 기준)

질문 순서는 이 문서의 섹션 순서를 따른다. 경로는 ProductSpec JSON의 점 경로다.

## 어떤 인증을 받아야 하나요?
가장 먼저 정합니다. 고른 인증에 맞춰 분류·필요 문서·실험·포장 규정이 달라집니다. 여러 개를 고를 수 있습니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 제품 인증 (출시할 곳) | `markets` | 필수 | `conformity-route-plan`, `labelling-spec`, `declaration-of-conformity` |
| 품질경영시스템 인증 (이미 있거나 받을 것) | `qmsCerts` | 선택 | `conformity-route-plan`, `qms-manual` |
| 식약처 등급 (한국 출시 시) | `krGrade` | 선택 | `conformity-route-plan` |

## 제품 정보
모든 문서의 머리말·라벨·DoC에 들어갑니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 제품명 | `identity.productName` | 필수 | `intended-purpose`, `device-description`, `labelling-spec`, `ifu`, `declaration-of-conformity` |
| 모델 / 카탈로그 번호 | `identity.model` | 필수 | `device-description`, `labelling-spec`, `declaration-of-conformity` |
| 제조자 | `identity.manufacturerName` | 필수 | `labelling-spec`, `ifu`, `declaration-of-conformity` |
| 제조국 | `identity.manufacturerCountry` | 필수 | `declaration-of-conformity`, `authorised-rep-mandate` |
| EU 역내 제조자인가요? | `identity.manufacturerIsEU` | 필수 | `authorised-rep-mandate`, `labelling-spec` |
| Basic UDI-DI | `identity.basicUdiDi` | 선택 | `udi-assignment`, `declaration-of-conformity` |

## 제품 구분
기기와 시약은 분류 규칙과 필요한 문서가 다릅니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 제품 유형 | `productType` | 필수 | `classification-rationale`, `device-description` |

## 분석 대상
무엇을 검출하는지. 분류(가임력·임신 예외)와 교차반응 물질 목록이 여기서 정해집니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 분석물 종류 | `analyte.preset` | 필수 | `classification-rationale`, `analytical-performance` |
| 분석물 정식 명칭 | `analyte.name` | 필수 | `intended-purpose`, `ifu`, `analytical-performance` |
| Cut-off | `analyte.cutoffValue` | 필수 | `analytical-performance`, `labelling-spec`, `ifu` |
| Cut-off 단위 | `analyte.cutoffUnit` | 필수 | `analytical-performance`, `labelling-spec` |

## 검체 · 결과
실험 설계(간섭 물질, 시료 수)와 IFU 내용이 달라집니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 검체 | `specimen` | 필수 | `intended-purpose`, `analytical-performance`, `ifu`, `biocompatibility` |
| 결과 형태 | `result.kind` | 필수 | `analytical-performance`, `metrological-traceability` |
| 판독 방식 | `result.readout` | 필수 | `usability-file`, `sw-validation` |

## 사용자 · 환경
일반인 자가검사면 분류(Rule 4)와 사용적합성 평가가 필수가 됩니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 사용자 | `user` | 필수 | `classification-rationale`, `usability-file`, `ifu`, `clinical-performance` |
| 사용 환경 | `environment` | 필수 | `classification-rationale`, `usability-file`, `intended-purpose` |

## 의도된 목적
위 항목과 합쳐 의도된 목적 문장이 자동으로 조립됩니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 결과로 내리는 판단 | `intendedPurpose.clinicalDecision` | 필수 | `intended-purpose`, `clinical-performance`, `scientific-validity` |
| 대상 집단 | `intendedPurpose.targetPopulation` | 필수 | `intended-purpose`, `clinical-performance` |
| 사용하면 안 되는 용도 | `intendedPurpose.outOfScope` | 선택 | `intended-purpose`, `ifu` |

## 분류 판단 질문
Annex VIII Rule 1~3 해당 여부. 하나라도 모르면 클래스는 잠정 추천으로 표시됩니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 감염병(전파성 병원체)을 검출하나요? | `rule1to3Flags.transmissibleAgent` | 필수 | `classification-rationale` |
| 혈액형·수혈 적합성을 판정하나요? | `rule1to3Flags.bloodGrouping` | 필수 | `classification-rationale` |
| 조직 적합성(이식)을 판정하나요? | `rule1to3Flags.tissueTyping` | 필수 | `classification-rationale` |
| 유전자 검사인가요? | `rule1to3Flags.geneticTesting` | 필수 | `classification-rationale` |
| 암 선별·진단·병기 판정에 쓰이나요? | `rule1to3Flags.cancerScreening` | 필수 | `classification-rationale` |
| 동반진단(특정 치료제 선택)인가요? | `rule1to3Flags.companionDiagnostic` | 필수 | `classification-rationale`, `cdx-consultation` |
| 선천성 질환 선별(신생아·태아)인가요? | `rule1to3Flags.congenitalScreening` | 필수 | `classification-rationale` |
| 결과 오류가 생명을 위협할 수 있는 상태를 다루나요? | `rule1to3Flags.lifeThreatening` | 필수 | `classification-rationale` |

## 기타 속성
해당할 때만 필요한 문서(멸균 밸리데이션, SW 검증 등)를 정합니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 멸균 제품인가요? | `sterile` | 필수 | `sterilization-validation`, `packaging-validation`, `classification-rationale` |
| 앱·소프트웨어가 함께 제공되나요? | `software.hasApp` | 필수 | `sw-validation`, `cybersecurity` |
| 그 소프트웨어가 결과 판정·해석을 하나요? | `software.isMdsw` | 필수 | `sw-validation`, `classification-rationale` |

## 보관 · 안정성
안정성 실험 기간과 라벨의 보관 조건이 여기서 정해집니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 보관 최저 온도 | `storage.tempMinC` | 필수 | `stability-study`, `labelling-spec`, `transport-validation` |
| 보관 최고 온도 | `storage.tempMaxC` | 필수 | `stability-study`, `labelling-spec`, `transport-validation` |
| 목표 유효기간 | `storage.shelfLifeMonths` | 필수 | `stability-study`, `labelling-spec` |
| 개봉 후 사용 시한 | `storage.openedStabilityMin` | 선택 | `stability-study`, `ifu` |

## 키트 구성품
제품 설명과 라벨에 들어갑니다. 시약이 들어간 구성품은 표시해 주세요.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 구성품 | `kitComponents` | 필수 | `device-description`, `labelling-spec`, `ifu` |

## 기준 방법
임상 성능 비교의 기준. 일반인 사용 성능 연구 설계에 쓰입니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 비교 기준 방법 | `referenceMethod.name` | 필수 | `clinical-performance`, `performance-eval-plan` |
| 기준 방법이 CE 인증 제품인가요? | `referenceMethod.ceMarked` | 필수 | `clinical-performance` |
| 기준 방법 시험기관 | `referenceMethod.lab` | 필수 | `clinical-performance` |

## 목표 성능
실험 판정기준과 표본수가 여기서 계산됩니다. 비워두면 판정기준을 지어내지 않고 할 일로 남깁니다.

| 항목 | 경로 | 필수 | 쓰는 문서 |
|---|---|---|---|
| 목표 민감도 (PPA) | `targets.sensitivity` | 필수 | `clinical-performance`, `performance-eval-plan`, `ifu` |
| 목표 특이도 (NPA) | `targets.specificity` | 필수 | `clinical-performance`, `performance-eval-plan`, `ifu` |
| 신뢰수준 | `targets.confidence` | 필수 | `performance-eval-plan` |
| 평가 로트 수 | `targets.lots` | 필수 | `analytical-performance`, `stability-study` |
