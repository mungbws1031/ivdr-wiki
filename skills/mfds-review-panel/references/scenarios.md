# 시험 시나리오 6개

입력은 `exampleSpec()`(LH 배란 자가검사 스틱)에서 바꾼 값만 적었다. 모든 시나리오는 `markets = ["EU","KR","US"]`다.

**기대값**은 규정상 맞아야 할 값이다. "원문 확인 필요"가 붙은 값은 패널이 원문으로 확인하기 전까지 판정 근거로 쓰지 않는다.

| # | 제품 | 바꾸는 값 |
|---|---|---|
| S1 | LH 배란 자가검사 스틱 (소변) | 없음 |
| S2 | hCG 임신 자가검사 | `analyte.preset=hCG`, `analyte.name=hCG`, `intendedPurpose.clinicalDecision=임신 여부 확인` |
| S3 | 코로나19 항원 자가검사 (면봉) | `analyte.preset=other`, `analyte.name=SARS-CoV-2 항원 (코로나19)`, `specimen=swab`, `rule1to3Flags.transmissibleAgent=true` |
| S4 | 혈당 측정기 + 앱 (손끝 혈액, 정량) | `analyte.preset=other`, `analyte.name=혈당(포도당)`, `specimen=capillary-blood`, `result.kind=quantitative`, `result.readout=app`, `formFactor=personal-device`, `software.hasApp=true`, `assay.method=electrochemical` |
| S5 | 전문가용 암 표지자(PSA) 정량, 검사실 장비 | `analyte.preset=other`, `analyte.name=PSA`, `user=professional`, `environment=lab`, `specimen=venous-blood`, `result.kind=quantitative`, `rule1to3Flags.cancerScreening=true`, `formFactor=lab-analyzer`, `result.readout=reader` |
| S6 | 수혈 혈액 선별 HIV 항체 (전문가) | `analyte.preset=other`, `analyte.name=HIV 항체 (수혈 혈액 선별)`, `user=professional`, `environment=lab`, `specimen=venous-blood`, `rule1to3Flags.transmissibleAgent=true` |

## 기대 판정

| # | IVDR | 한국 | 미국 | 문서·GSPR | 위험 |
|---|---|---|---|---|---|
| S1 | B (Rule 4(a) 예외) | 2등급 잠정 · 자가검사 확인 필요 · 인증 | Class I · 경로 확인 (862.1485, 862.9 제한) · CLIA 면제 | 사용적합성 필수 · SW·사이버·전기 불필요 · §16·§17 비해당 · §19 해당 | 위양성·위음성·사용 오류, 채혈침·전기·SW 없음 |
| S2 | B (Rule 4(a) 예외) | 2등급 잠정 · 자가검사 허용 | Class II · 510(k) (862.1155) | S1과 같음 | S1과 같음 |
| S3 | 담당자 판단 (Rule 1 또는 3) | 담당자 판단 · 자가검사 허용 품목(코로나19) | 담당자 판단 | 생체적합성 필수(면봉) | 감염 전파 위해 (원문 확인 필요) |
| S4 | **B (Rule 4(a) 예외 — 혈당)** (원문 확인 필요) | 등급 확인 필요 · 자가검사 허용(혈당) | Class II 가능성 · 제품 코드 확인 | SW·사이버·전기·생체적합성·측정 소급성 필수 · §14·§16·§17·§18 해당 | 채혈침·전기·SW·사이버·개인정보 |
| S5 | C (Rule 3) | 3등급 잠정 · 임상 자료 필수 · 자가검사 해당 없음 | 경로 확인 · CLIA 복잡도 분류 | SW·전기·소급성 필수 · §19 비해당 | 전기·SW, 사용 오류 없음 |
| S6 | 담당자 판단 (Rule 1 후보 — D) | 담당자 판단 (4등급 후보) | 담당자 판단 · BLA 가능성 | §14~19 비해당 | **수혈 감염 전파(공중보건) 위해** |
