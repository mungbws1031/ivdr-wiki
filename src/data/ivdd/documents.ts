// src/data/ivdd/documents.ts
// IVDD 98/79/EC 문서 템플릿 — 9개 문서
import type { DocTemplate } from "../documents";

export const ivddDocuments: DocTemplate[] = [
  // ── Station 1 · 기기 분류 결정 ──────────────────────────────────────
  {
    id: "ivdd-classification",
    stationId: 1,
    docTitle: "기기 분류 결정서",
    purpose:
      "98/79/EC Annex II(List A·B)·자가검사·일반 IVD 중 해당 분류를 결정하고 적합성 평가 경로를 확정한다.",
    rationale:
      "98/79/EC Art.9는 모든 IVD를 분류하고 분류에 따라 NB 심사 의무 여부가 달라지도록 규정한다. 분류 오류는 잘못된 적합성 평가 경로로 이어져 CE를 무효화한다. 특히 List A 기기를 List B로 오분류하면 설계 검사(Annex IV Sec.6)를 누락하게 된다.",
    intent:
      "List A→B→자가검사→일반 순서로 해당 여부를 항목별로 확인하고, NB 개입 필요성을 조기에 파악하여 인증 일정을 최적화하도록 체크리스트 형식으로 설계했다.",
    sections: [
      {
        heading: "1. 의도된 목적 요약",
        guidance: "의도된 목적 명세서에서 핵심(검출 대상·검체·사용자·환경)을 가져온다.",
        placeholder:
          "검출 대상: [____]\n검체 유형: [____]\n사용자: [전문가 / 자가검사]\n사용 환경: [임상 실험실 / 근접검사 / 가정]",
      },
      {
        heading: "2. Annex II 해당 여부 확인",
        guidance:
          "List A→B→자가검사→일반 순서로 해당 여부를 체크한다. 해당하는 첫 번째 항목이 최종 분류를 결정한다.",
        placeholder:
          "[ ] Annex II List A — HIV·혈액형·B형간염·HCV 수혈 선별 등\n    → 해당 시: EC 형식 검사(Annex IV) + EC 설계 검사(Annex IV Sec.6) 필수\n\n[ ] Annex II List B — 임신 테스트·혈당·PSA·Rh·풍진 항체 등\n    → 해당 시: EC 형식 검사(Annex V) 또는 완전한 품질보증(Annex VI)\n\n[ ] 자가검사(Self-Testing) — 일반인이 직접 사용하는 기기\n    → 해당 시: NB 개입 필수\n\n[ ] 일반 IVD — 위 어디에도 해당 없음\n    → EC 선언(Annex III + Annex VII) 자가선언 가능\n\n최종 분류: [____]\n결정 근거: [____]",
      },
      {
        heading: "3. 적합성 평가 경로 확정",
        guidance:
          "분류에 맞는 Annex 경로를 명시하고 NB 개입 범위와 일정을 확인한다.",
        placeholder:
          "선택 경로:\n[ ] Annex IV — EC 형식 검사 + 설계 검사 (List A)\n[ ] Annex V — EC 형식 검사 (List B·자가검사)\n[ ] Annex VI — EC 선언, 완전한 품질보증 (List B 대안)\n[ ] Annex VII — EC 선언, 제품 적합성 (일반 IVD)\n\nNB 개입: [필요 / 불필요]\nNANDO 검색 NB 목록: [____]\n예상 심사 기간: [____]",
      },
      {
        heading: "4. 검토·승인",
        guidance: "RA·경영진의 검토·승인을 기록한다.",
        placeholder:
          "작성: [____] 일자: [____]\n검토(RA): [____] 일자: [____]\n승인: [____] 일자: [____]",
      },
    ],
    certTests: [
      "NANDO에서 해당 분류의 NB 목록 조회 — 98/79/EC 코드로 가용 NB 사전 확인",
    ],
    requiredData: [
      "98/79/EC Annex II List A·B 원문",
      "의도된 목적 명세서 초안",
      "유사 제품 분류 선례 (EUDAMED 또는 NB 결정문·공개 사례)",
      "MEDDEV 2.14/3 분류 가이드라인",
    ],
    checklist: [
      "List A→B→자가검사→일반 순서로 모두 검토했는가",
      "분류 결정 근거가 의도된 목적과 연결됐는가",
      "해당 적합성 평가 경로(Annex)를 명시했는가",
      "NB 개입 필요 여부를 결론 지었는가",
      "RA의 검토 서명이 있는가",
    ],
    relatedConceptSlugs: ["notified-body"],
    refs: ["98/79/EC Art.9", "Annex II List A", "Annex II List B", "Art.1(1)(b)"],
  },

  // ── Station 2 · 의도된 목적 정의 ───────────────────────────────────
  {
    id: "ivdd-intended-purpose",
    stationId: 2,
    docTitle: "의도된 목적 명세서",
    purpose:
      "98/79/EC Art.1(2)(b) 정의에 따라 기기의 의도된 목적을 확정하고 분류·성능 요건·라벨링의 기준을 고정한다.",
    rationale:
      "IVDD에서 의도된 목적은 분류(List A/B/자가검사)와 Annex I 필수 요건을 결정하는 핵심 기준이다. 라벨·IFU와 정확히 일치해야 하며, 목적이 바뀌면 재분류가 필요하다.",
    intent:
      "IVDR 의도된 목적 5요소 구조(검출 대상·검체·사용자·환경·임상 결정)를 IVDD에 맞게 적용해 NB 사전 검토 시 누락 없이 제출할 수 있도록 설계했다.",
    sections: [
      {
        heading: "1. 제품 식별",
        guidance: "제품명·모델·버전·제조자를 기재한다.",
        placeholder: "제품명: [____]\n모델/버전: [____]\n제조자: [____]",
      },
      {
        heading: "2. 의도된 목적 (5요소)",
        guidance:
          "검출 대상·검체·사용자·사용 환경·임상 결정을 한 문단으로 서술한다. 라벨·IFU 문구와 정확히 일치해야 한다.",
        placeholder:
          "본 기기는 [검체: 예 정맥혈/혈청]에서 [측정 대상: 예 ___ 항원/항체]을 [정성/정량] 검출하여, [사용자: 임상 전문가/자가검사자]가 [환경: 임상 실험실/가정]에서 [임상 결정: 예 ___ 진단 보조/감염 스크리닝]을 하도록 돕는 체외진단 의료기기다.",
      },
      {
        heading: "3. 해당하지 않는 용도 (Out of Scope)",
        guidance: "오용을 막기 위해 의도하지 않은 사용 목적을 명시한다.",
        placeholder:
          "본 기기는 다음 용도로는 사용하지 않는다:\n- [예: 수혈 전 혈액 스크리닝 — List A 해당 시 별도 기기 필요]\n- [____]",
      },
      {
        heading: "4. 라벨·IFU 일관성 확인",
        guidance: "라벨과 IFU의 의도된 목적 문구가 본 정의서와 동일한지 대조·확인한다.",
        placeholder:
          "라벨 의도된 목적 문구 위치: [____]\nIFU 의도된 목적 섹션: [____]\n일관성 확인자: [____] 일자: [____]",
      },
    ],
    requiredData: [
      "라벨 초안 (의도된 목적 문구 포함)",
      "IFU 초안 (의도된 목적·적응증 섹션)",
      "98/79/EC Art.1(2)(b) 원문",
      "MEDDEV 2.14/3 의도된 목적 가이드라인",
    ],
    checklist: [
      "검출 대상·검체·사용자·환경·임상 결정이 모두 기재됐는가",
      "라벨·IFU와 의도된 목적이 정확히 일치하는가",
      "자가검사 여부가 명확히 표시됐는가 (분류에 직접 영향)",
      "미사용 목적(Out of Scope)을 명시했는가",
    ],
    relatedConceptSlugs: ["intended-purpose"],
    refs: ["98/79/EC Art.1(2)(b)", "Annex I Sec.3", "MEDDEV 2.14/3"],
  },

  // ── Station 3 · 기술문서 (1/2) ─────────────────────────────────────
  {
    id: "ivdd-tech-doc",
    stationId: 3,
    docTitle: "기술문서(Technical File)",
    purpose:
      "98/79/EC Annex III에 따른 기술문서를 체계적으로 구성해 CE 마킹의 기술적 근거를 완성하고 최소 5년간 유지한다.",
    rationale:
      "98/79/EC Annex III는 EC 적합성선언의 근거가 될 기술문서를 제조자가 작성·유지하도록 규정한다. 기기 수명 최소 5년(이식형 10년) 보관 의무가 있으며, IVDR 전환 시 Annex II/III 형식으로 재구성이 필요하다.",
    intent:
      "IVDD 기술문서 구성 항목을 목차 형식으로 제공해 처음 IVDD를 준비하는 팀도 누락 없이 구축할 수 있도록 했다. IVDR Annex II 전환 시 그대로 활용 가능한 구조로 설계했다.",
    sections: [
      {
        heading: "1. 기기 설명 및 의도된 목적",
        guidance: "제품명·모델·기기 유형·작동 원리·의도된 목적을 기술한다.",
        placeholder:
          "제품명/모델: [____]\n기기 유형: [시약 키트 / 분석기 / SW / 조합]\n작동 원리: [효소면역반응 / 핵산 증폭 / 전기화학 / ___]\n의도된 목적(요약): [____]\n특수 특성: [자가검사 / 근접검사 / 없음]",
      },
      {
        heading: "2. Annex I 필수 요건 충족 매핑",
        guidance:
          "Annex I 필수 요건 각 조항에 대한 충족 방법과 증거 문서 위치를 기재한다.",
        placeholder:
          "| Annex I 조항 | 요건 요약 | 충족 방법 | 증거 위치 |\n|---|---|---|---|\n| Sec.1 | 성능 달성 | 분석·임상 성능 시험 | 성능 패키지 §2 |\n| Sec.2 | 위험 최소화 | 위험관리 파일 | RMF §3 |\n| Sec.3 | 의도된 목적 정의 | 의도된 목적 명세서 | IntPur.doc |\n| Sec.8 | 분석 성능 데이터 | 분석 성능 패키지 | AnalPerf.doc |\n| Sec.9 | 임상 성능 데이터 | 임상 성능 평가 | ClinPerf.doc |\n| Sec.10 | 라벨링 정보 | 라벨·IFU | Label v[__] |",
      },
      {
        heading: "3. 설계·제조 정보",
        guidance: "제조 프로세스, BOM, QMS 시스템, 원자재 정보를 기재한다.",
        placeholder:
          "QMS 기준: ISO 13485:2016 / 인증 기관: [____] / 인증 범위: [____]\n제조 사이트: [____]\n주요 원자재/시약: [____]\nBOM 참조: [문서번호/위치]",
      },
      {
        heading: "4. 성능 데이터 및 위험관리 참조",
        guidance: "분석·임상 성능 데이터와 위험관리 파일 문서 위치를 연결한다.",
        placeholder:
          "분석 성능 패키지: [문서번호]\n임상 성능 평가 자료: [____]\n위험관리 파일: [____]\n외부 품질평가(EQA) 기록: [____]",
      },
      {
        heading: "5. 기술문서 보관 계획",
        guidance: "기술문서 보관 기간과 책임자를 명시한다.",
        placeholder:
          "보관 기간: 최소 5년 (출시일로부터)\n보관 담당: [____]\n개정 이력 관리 절차: [SOP-__]",
      },
    ],
    certTests: [
      "ISO 13485:2016 QMS 인증 유지 확인 — 제조 프로세스와 기술문서의 연계 점검",
    ],
    requiredData: [
      "98/79/EC Annex I 필수 요건 원문",
      "98/79/EC Annex III 원문",
      "BOM(자재 목록) 확정본",
      "분석 성능 데이터 패키지",
      "임상 성능 평가 자료",
      "위험관리 파일",
      "라벨 최종본·IFU",
    ],
    checklist: [
      "Annex I 필수 요건 모든 조항에 충족 증거를 매핑했는가",
      "BOM·제조 정보가 포함됐는가",
      "성능 데이터(분석·임상) 위치가 연결됐는가",
      "기술문서 보관 기간(5년 이상)과 담당자를 지정했는가",
    ],
    relatedConceptSlugs: ["annex-ii"],
    refs: ["98/79/EC Annex III", "Annex I"],
  },

  // ── Station 3 · 기술문서 (2/2) ─────────────────────────────────────
  {
    id: "ivdd-conformity-procedure",
    stationId: 3,
    docTitle: "적합성 절차 선택 근거",
    purpose:
      "분류에 따라 Annex IV~VII 중 적합한 적합성 평가 절차를 선택하고 그 근거를 문서화해 CE 마킹까지의 경로를 확정한다.",
    rationale:
      "98/79/EC Art.9에 따라 각 분류(List A·B·자가검사·일반)에 적용 가능한 Annex가 다르다. 잘못된 경로 선택은 CE 마킹 무효로 이어질 수 있다.",
    intent:
      "Annex IV~VII 요건을 비교 표로 제공하여 처음 IVDD 인증을 준비하는 팀도 적합한 경로를 쉽게 선택하고, 선택 근거를 명확히 남길 수 있도록 설계했다.",
    sections: [
      {
        heading: "1. 분류 및 경로 선택",
        guidance:
          "분류 결정서에서 분류를 가져와 해당 Annex 경로를 선택하고 사유를 기재한다.",
        placeholder:
          "최종 분류: [____]\n\n[ ] Annex IV — EC 형식 검사 + 설계 검사 (List A 필수)\n[ ] Annex V — EC 형식 검사 (List B·일부 자가검사)\n[ ] Annex VI — EC 선언(완전한 품질보증) (List B 대안)\n[ ] Annex VII — EC 선언(제품 적합성) (일반 IVD 자가선언)\n\n선택 사유: [____]",
      },
      {
        heading: "2. NB 관여 범위",
        guidance:
          "선택 경로에 따른 NB 심사 범위와 계약 상태를 명시한다.",
        placeholder:
          "NB 명칭: [____] / NB 번호(NANDO): [____]\n\nNB 심사 유형:\n[ ] EC 형식 검사 (Annex IV/V)\n[ ] EC 설계 검사 (Annex IV Sec.6 — List A만)\n[ ] QMS 심사 (Annex VI 선택 시)\n[ ] 해당 없음(자가선언)\n\nNB 계약 상태: [계약 완료 / 협의 중]\n예상 심사 기간: [____]",
      },
      {
        heading: "3. 자가선언 시 내부 기술 검토 (일반 IVD 해당 시)",
        guidance:
          "일반 IVD(Annex VII) 자가선언 시 Annex I 필수 요건 전체를 내부 기술 검토한 결과를 기재한다.",
        placeholder:
          "검토 범위: Annex I 필수 요건 전 항목\n내부 검토자(RA): [____]\n검토 완료 일자: [____]\n결론: 필수 요건 [충족 / 미충족 항목: ____]",
      },
      {
        heading: "4. 경로 승인",
        guidance: "RA·경영진의 검토·승인을 기록한다.",
        placeholder:
          "RA 검토: [____] 일자: [____]\n경영진 승인: [____] 일자: [____]",
      },
    ],
    requiredData: [
      "기기 분류 결정서 확정본",
      "98/79/EC Annex IV·V·VI·VII 원문 비교표",
      "NANDO NB 목록 및 scope 정보 (해당 시)",
      "NB 계약서 초안 (해당 시)",
    ],
    checklist: [
      "분류 결정서와 경로 선택이 일치하는가",
      "선택한 Annex의 모든 요건을 충족할 계획이 있는가",
      "List A인 경우 설계 검사(Annex IV Sec.6)를 별도로 계획했는가",
      "NB 개입이 필요한 경우 NB를 확보했는가",
    ],
    relatedConceptSlugs: ["notified-body"],
    refs: ["98/79/EC Art.9", "Annex IV", "Annex V", "Annex VI", "Annex VII"],
  },

  // ── Station 4 · 분석 성능 ───────────────────────────────────────────
  {
    id: "ivdd-analytical-perf",
    stationId: 4,
    docTitle: "분석 성능 데이터 패키지",
    purpose:
      "98/79/EC Annex I Sec.8에 따라 분석 성능(LoD·정밀도·정확도·교차반응·안정성)의 데이터 근거를 패키지로 정리해 기술문서에 편입한다.",
    rationale:
      "98/79/EC Annex I Sec.8은 기기의 분석 성능이 제조자가 표방한 특성을 충족함을 증명하도록 요구한다. 이 데이터는 IVDR PER 분석 성능 섹션에 직접 재활용되므로, CLSI 방법론을 IVDD 단계부터 적용하면 전환 비용이 크게 줄어든다.",
    intent:
      "IVDR 전환 시 그대로 PER에 통합할 수 있는 구조로 작성하도록 안내했다. 각 시험 항목의 CLSI 방법론 참조와 표방 특성 충족 여부를 명시하도록 설계했다.",
    sections: [
      {
        heading: "1. 표방 특성 목록 (Claimed Characteristics)",
        guidance:
          "제조자가 라벨·IFU에 표방하는 성능 지표 목록을 먼저 정의한다. 이후 모든 시험은 이 목록 충족을 증명하기 위한 것이다.",
        placeholder:
          "- 검출 한계(LoD): [____]\n- 반복성(Within-run CV%): ≤[____]%\n- 재현성(Between-day CV%): ≤[____]%\n- 진단 민감도: ≥[____]%\n- 진단 특이도: ≥[____]%\n- 측정 범위: [____]\n- 유효기간: [____]",
      },
      {
        heading: "2. LoD 및 정밀도 시험 결과",
        guidance:
          "검출 한계(CLSI EP17 또는 동등) 및 반복성·재현성 데이터를 기재한다.",
        placeholder:
          "LoD 시험:\n  방법: [Probit 분석, CLSI EP17]\n  시험 농도: [____] 수준 × n=[____]회\n  결과 LoD: [____]\n\n정밀도:\n  반복성(Within-run): CV = [____]% (n≥20)\n  재현성(Between-day): CV = [____]% ([____]기관 [____]일간, CLSI EP15)\n\n결론: 표방 특성 [충족 / 미충족 — 조치 사항]",
      },
      {
        heading: "3. 정확도 및 방법 비교",
        guidance:
          "참조 방법 대비 정확도 시험 결과(회귀분석 또는 Bland-Altman)를 기재한다.",
        placeholder:
          "비교 방법(Reference Standard): [____]\n검체 수: n = [____]\n상관계수 또는 양성 일치율: [____]\n계통 오차/편향: [____]\n결론: [____]",
      },
      {
        heading: "4. 교차반응 및 간섭 물질 시험",
        guidance:
          "교차반응 가능 항원·미생물과 간섭 물질(헤모글로빈·지질·빌리루빈 등) 시험 결과를 기재한다.",
        placeholder:
          "교차반응 시험 대상: [____] (최소 10종 권장)\n결과: 교차반응 없음 / 교차반응 발견: [____]\n\n간섭 물질 시험:\n- 헤모글로빈 [____g/dL] → [____]\n- 지질 [____mg/dL] → [____]\n- 빌리루빈 [____mg/dL] → [____]\n결론: [____]",
      },
      {
        heading: "5. 안정성 데이터",
        guidance:
          "가속·실시간 안정성 시험 결과로 유효기간을 뒷받침한다.",
        placeholder:
          "가속 안정성: [____°C, ____% RH, ____주] → 유효기간 예측: [____]\n실시간 안정성: [____] (진행 중 / 완료)\n개봉 후 안정성: [____]일\n수송 안정성: [____]",
      },
    ],
    experiments: [
      "LoD 시험 — 연속 희석, 최소 n=60 (6농도 × 10회, CLSI EP17 준수)",
      "반복성 정밀도 — 동일 장비, 동일 검체, n≥20 (CV% 산출)",
      "재현성 정밀도 — ≥2개 기관, 3일간, 2명 검사자 (CLSI EP15 준수)",
      "진실성/방법 비교 — 참조법 대비 n≥40 검체 비교 (CLSI EP09)",
      "교차반응 시험 — 유사 항원/균주 ≥10종, 각 n≥3",
      "간섭 물질 시험 — 헤모글로빈·지질·빌리루빈·점도 이상 검체 ≥5종",
      "가속 안정성 시험 — 40°C/75%RH, 유효기간×3배 기간",
    ],
    certTests: [
      "CLSI EP17·EP15·EP09 방법론 준수 여부 내부 검토",
      "외부 품질평가(EQA/PT) 참여 — 분석 성능 독립 검증",
    ],
    requiredData: [
      "98/79/EC Annex I Sec.8 원문",
      "라벨·IFU의 표방 특성 목록 초안",
      "CLSI EP17·EP15·EP09 가이드라인",
      "교차반응 대상 항원/균주 선정 근거 문헌",
      "원자재 SDS(안전데이터시트) — 간섭 물질 선정용",
    ],
    checklist: [
      "LoD·정밀도·정확도·교차반응·간섭·안정성이 모두 시험됐는가",
      "각 결과가 표방 특성(라벨·IFU 수치)을 충족하는가",
      "CLSI 또는 동등한 방법론을 사용했는가",
      "안정성 데이터가 유효기간을 뒷받침하는가",
    ],
    relatedConceptSlugs: ["pep-per"],
    refs: ["98/79/EC Annex I Sec.8", "CLSI EP17", "CLSI EP15", "CLSI EP09"],
    calcTools: ["lod-calc"],
  },

  // ── Station 4 · 임상 성능 ───────────────────────────────────────────
  {
    id: "ivdd-clinical-perf",
    stationId: 4,
    docTitle: "임상 성능 평가 자료",
    purpose:
      "98/79/EC Annex I Sec.9에 따라 진단 민감도·특이도 등 임상 성능을 입증하는 데이터 패키지를 작성해 기술문서에 편입한다.",
    rationale:
      "98/79/EC Annex I Sec.9는 기기가 표방하는 임상 성능(진단 민감도·특이도)을 적절한 임상 또는 후향적 연구로 입증하도록 요구한다. 이 자료는 IVDR PER 임상 성능 섹션에 직접 재활용된다.",
    intent:
      "IVDR 임상 성능 연구 설계를 IVDD 단계부터 선제적으로 적용해 전환 시 추가 임상 연구 부담을 최소화하고, 통계적 충분성을 미리 확보하도록 안내했다.",
    sections: [
      {
        heading: "1. 임상 성능 연구 설계",
        guidance:
          "참조 방법·대상 집단·표본 크기·연구 기관·연구 유형을 기재한다.",
        placeholder:
          "연구 유형: [전향적 / 후향적 / 레지스트리]\n대상 집단: [____] (나이·성별·임상 조건)\n참조 방법(Reference Standard): [____]\n\n최소 검체 수 산출 (Wilson 방법):\n  목표 민감도: [____]% / 허용 오차: ±[____]% / 신뢰 수준: 95%\n  최소 양성 검체: n ≥ [____]\n  최소 음성 검체: n ≥ [____]\n\n연구 기관: [____] (≥2개 기관 권장)",
      },
      {
        heading: "2. 임상 성능 결과 요약",
        guidance:
          "진단 민감도·특이도·PPV·NPV와 95% CI를 표로 요약한다.",
        placeholder:
          "| 지표 | 값(%) | 95% CI |\n|---|---|---|\n| 진단 민감도 | [____] | [[__]–[__]] |\n| 진단 특이도 | [____] | [[__]–[__]] |\n| 양성 예측도(PPV) | [____] | [____] |\n| 음성 예측도(NPV) | [____] | [____] |\n\n총 검체 수: 양성 n=[____], 음성 n=[____]\n참조 방법: [____]\n연구 기관 수: [____]",
      },
      {
        heading: "3. 연구 결론 및 잔여 불확도",
        guidance:
          "표방 특성 충족 여부를 명시하고 잔여 불확도와 추가 연구 필요성을 언급한다.",
        placeholder:
          "결론: 임상 성능 [표방 특성 충족 / 미충족 — 조치]\n잔여 불확도: [____]\n추가 연구 계획(IVDR 전환 대비): [____]",
      },
      {
        heading: "4. 외부 품질평가(EQA) 참여 기록",
        guidance:
          "EQA/PT 참여로 임상 성능을 독립 검증한 기록을 첨부한다.",
        placeholder:
          "EQA 기관: [____]\n참여 기간: [____]\nEQA 결과: [적합 / 부적합 — 조치]\n증빙 첨부: [____]",
      },
    ],
    experiments: [
      "임상 성능 연구 — 전향적 또는 후향적, ≥2개 기관, 통계 산출 검체수 확보",
      "EQA(외부 품질평가) 참여 — 독립적 임상 성능 검증",
    ],
    certTests: [
      "IRB/윤리위원회 심의 — 임상 검체 수집 전 필수 (인간 대상 연구)",
      "참조 방법(Reference Standard) 적합성 확인 및 선정 근거 문서화",
    ],
    requiredData: [
      "98/79/EC Annex I Sec.9 원문",
      "임상 연구 기관 계약서 및 IRB 승인서",
      "참조 방법 성능 확인 자료",
      "통계 계산 도구 (Wilson 방법 또는 Clopper-Pearson)",
      "EQA 참여 기관 정보 및 결과 보고서",
    ],
    checklist: [
      "임상 연구가 ≥2개 기관에서 수행됐는가",
      "통계적으로 충분한 검체 수를 확보했는가 (Wilson 방법 산출)",
      "95% CI가 산출됐는가",
      "EQA 참여 기록이 있는가",
      "결과가 표방 특성을 충족하는가",
    ],
    relatedConceptSlugs: ["pep-per"],
    refs: ["98/79/EC Annex I Sec.9", "MEDDEV 2.14/3"],
    calcTools: ["sens-spec", "sample-size"],
  },

  // ── Station 5 · NB 제출 패키지 (조건부) ─────────────────────────────
  {
    id: "ivdd-nb-submission",
    stationId: 5,
    docTitle: "NB 제출 패키지",
    purpose:
      "Annex IV 또는 V에 따른 NB 심사 신청을 위해 전체 제출 문서 패키지를 완성하고 신청서를 제출한다.",
    rationale:
      "98/79/EC Annex IV Sec.4 및 Annex V Sec.4는 NB 심사 신청 시 제출해야 할 문서 목록을 규정한다. 첫 제출에서 누락이 있으면 보완 요청으로 수개월 지연된다.",
    intent:
      "List A·B 기기의 NB 제출에서 흔히 누락되는 항목을 체크리스트로 제공해 최초 제출에서 반려 없이 심사가 시작될 수 있도록 설계했다.",
    sections: [
      {
        heading: "1. NB 정보 및 계약 확인",
        guidance: "선정된 NB, 계약 상태, 심사 유형을 확인한다.",
        placeholder:
          "NB 명칭: [____]\nNB 번호(NANDO): [____]\n계약 서명 일자: [____]\n심사 유형: [ ] Annex IV  [ ] Annex V\n예상 심사 기간: [____]\n담당 심사원: [____]",
      },
      {
        heading: "2. 제출 문서 체크리스트",
        guidance: "NB에 제출할 전체 문서를 확인하고 완비 여부를 점검한다.",
        placeholder:
          "[ ] 기기 분류 결정서\n[ ] 의도된 목적 명세서\n[ ] 기술문서(Technical File) — 목차·색인 포함\n[ ] Annex I 필수 요건 충족 매핑표\n[ ] 분석 성능 데이터 패키지\n[ ] 임상 성능 평가 자료 — IRB 포함\n[ ] 위험관리 파일\n[ ] QMS 문서 / ISO 13485 인증서\n[ ] 라벨·IFU 최종 초안\n[ ] EC 적합성선언 초안",
      },
      {
        heading: "3. List A 추가 요건 (해당 시)",
        guidance:
          "List A 기기는 EC 형식 검사에 추가하여 EC 설계 검사(Annex IV Sec.6)가 필요하다.",
        placeholder:
          "[ ] List A 해당 여부 재확인\n[ ] EC 설계 검사 범위 NB와 협의 완료\n[ ] 설계 검사 추가 제출 문서: [____]\n설계 검사 일정: [____]",
      },
      {
        heading: "4. 제출·수령 기록",
        guidance: "제출 일자와 NB 수령 확인 정보를 기록한다.",
        placeholder:
          "제출 일자: [____]\nNB 수령 확인 번호: [____]\n예상 결과 통보일: [____]\n담당자 연락처: [____]",
      },
    ],
    requiredData: [
      "NB 계약서 서명본",
      "기술문서 전체 패키지 (분류 결정서~PMS 계획)",
      "NANDO NB scope 확인 결과 (98/79/EC 코드)",
      "98/79/EC Annex IV·V 원문 (제출 요건 확인용)",
    ],
    checklist: [
      "NANDO에서 NB가 해당 분류를 심사할 수 있는지 확인했는가",
      "제출 문서 목록이 빠짐없이 완비됐는가",
      "List A인 경우 EC 설계 검사를 별도로 신청했는가",
      "제출 일자가 IVDR 전환 마감일과 맞는가",
    ],
    relatedConceptSlugs: ["notified-body"],
    refs: ["98/79/EC Annex IV", "Annex V", "NANDO 데이터베이스"],
  },

  // ── Station 6 · DoC ─────────────────────────────────────────────────
  {
    id: "ivdd-doc",
    stationId: 6,
    docTitle: "EC 적합성선언(DoC)",
    purpose:
      "98/79/EC Art.11 및 Annex III에 따라 기기가 지침의 필수 요건을 충족함을 공식 선언하고 CE 마킹의 법적 근거를 만든다.",
    rationale:
      "DoC는 CE 마킹의 필수 전제 문서다. 제조자는 DoC를 작성·서명 후 최소 5년간 보관해야 하며, NB가 개입한 경우 NB 번호와 인증서 정보를 포함해야 한다.",
    intent:
      "Annex III에서 요구하는 DoC 필수 기재 항목을 빠짐없이 포함한 템플릿을 제공하여 최종 CE 마킹 직전 서류 지연을 방지하도록 설계했다.",
    sections: [
      {
        heading: "1. 제조자 및 기기 식별",
        guidance: "제조자명·주소·EU 대리인(비EU 제조자)·제품 식별 정보를 기재한다.",
        placeholder:
          "제조자: [____]\n주소: [____]\nEU 대리인(비EU 제조자): [____] / 주소: [____]\n\n제품명: [____] / 모델: [____]\n배치/Lot 번호 체계: [____]",
      },
      {
        heading: "2. 적합성 선언 내용",
        guidance:
          "적용 지침·분류·적합성 절차·NB 정보·적용 표준을 기재한다.",
        placeholder:
          "본 기기는 체외진단용 의료기기에 관한 지침 98/79/EC의 필수 요건을 충족함을 선언한다.\n\n분류: [Annex II List A / List B / 자가검사 / 일반 IVD]\n적합성 절차(Annex): [____]\n\nNB 명칭·번호(해당 시): [____]\nNB 인증서 번호·유효기간(해당 시): [____]\n\n적용 표준: ISO 13485:[____], [기타 표준]",
      },
      {
        heading: "3. 서명",
        guidance: "제조자 법적 대리인이 서명·날인한다. CE 마킹은 DoC 서명 후 부착한다.",
        placeholder:
          "서명: [____] (법적 대리인)\n직책: [____]\n장소: [____]\n일자: [____]\n\n※ CE 마킹 부착일: [____]\n※ NB 번호 병기(해당 시): CE [NB번호]",
      },
    ],
    requiredData: [
      "NB 인증서 (List A·B·자가검사인 경우)",
      "기술문서 최종 서명본",
      "분석·임상 성능 데이터 최종본",
      "98/79/EC Annex III 원문",
      "EU 대리인 계약서 (비EU 제조자)",
    ],
    checklist: [
      "제조자·제품 식별 정보가 기술문서·라벨과 일치하는가",
      "분류·적합성 절차·NB 정보가 올바르게 기재됐는가",
      "법적 대리인이 서명했는가",
      "5년 이상 보관 계획이 있는가",
      "EU 대리인 정보가 포함됐는가 (비EU 제조자)",
    ],
    relatedConceptSlugs: ["doc", "ce-marking"],
    refs: ["98/79/EC Art.11", "Annex III"],
  },

  // ── Station 7 · PMS 계획 ────────────────────────────────────────────
  {
    id: "ivdd-pms-plan",
    stationId: 7,
    docTitle: "사후 시장 감시(PMS) 계획",
    purpose:
      "98/79/EC Art.11(4)에 따라 CE 마킹 이후 지속적인 PMS 활동과 비질란스 보고 체계를 수립하고, IVDR 전환 대비 PMS 고도화 경로를 포함한다.",
    rationale:
      "98/79/EC Art.11(4)는 CE 취득 후 제조자가 기기 성능을 지속적으로 모니터링하고 중대 사건을 당국에 보고하도록 요구한다. IVDR 전환 후에는 Art.78~80 수준의 PSUR·PMPF가 필요하다.",
    intent:
      "IVDR PMS 계획 구조를 IVDD 단계부터 선제적으로 적용해 전환 시 문서 재작성 부담을 최소화하도록 설계했다.",
    sections: [
      {
        heading: "1. PMS 데이터 소스 및 수집 계획",
        guidance:
          "고객 불만·비질란스·문헌 감시 등 데이터 소스와 수집·분석 주기를 명시한다.",
        placeholder:
          "데이터 소스:\n① 고객 불만 처리: [CRM 시스템/담당자]\n② 비질란스 보고 (소관 당국 보고)\n③ 문헌 감시: [PubMed 검색어/주기]\n④ EQA/PT 결과 모니터링\n⑤ 유통업체·현장 피드백: [____]\n\n수집 주기: [월간 / 분기]\n책임자: [____]",
      },
      {
        heading: "2. 비질란스 보고 절차",
        guidance:
          "98/79/EC에 따른 비질란스 사건 분류·보고 기한·보고 경로를 명시한다.",
        placeholder:
          "사건 분류 및 보고 기한:\n- 사망·중상 초래 사고: 10일 이내\n- 비일상적 사건: 15일 이내\n- 추세 분석 대상: 30일 이내\n\n소관 당국 연락처: [____]\n보고 양식: MEDDEV 2.12/1 또는 국가 양식",
      },
      {
        heading: "3. PMS 보고서 및 IVDR 전환 대비",
        guidance:
          "연간 PMS 보고서 계획과 IVDR 전환 후 PSUR·PMPF 연계 계획을 기재한다.",
        placeholder:
          "PMS 보고서 주기: [연간]\n최초 PMS 보고서 예정: [____]\n\nIVDR 전환 계획:\n  예상 IVDR 클래스: [____]\n  전환 목표일: [____]\n  전환 후 PSUR 주기: [Class C·D 매년]\n  PMPF 계획 필요 여부: [필요 / 불필요]",
      },
      {
        heading: "4. 책임자 및 승인",
        guidance: "PMS 담당자와 계획 승인을 기록한다.",
        placeholder:
          "PMS 책임자: [____]\nPMS 계획 승인: [____] 일자: [____]",
      },
    ],
    requiredData: [
      "98/79/EC Art.11(4) 원문",
      "IVDR Art.78~80 (전환 후 PMS 요건 선행 검토용)",
      "소관 당국 비질란스 보고 양식 (MEDDEV 2.12/1)",
      "고객 불만 처리 시스템(CRM) 현황",
      "문헌 감시 키워드·PubMed 검색 전략 초안",
    ],
    checklist: [
      "PMS 데이터 소스와 수집 주기가 명시됐는가",
      "비질란스 보고 기한(10/15/30일)이 반영됐는가",
      "연간 PMS 보고서 계획이 있는가",
      "IVDR 전환 일정 및 PSUR·PMPF 연계 계획이 포함됐는가",
    ],
    relatedConceptSlugs: ["pms"],
    refs: ["98/79/EC Art.11(4)", "MEDDEV 2.12/1", "IVDR Art.78~80"],
  },
];

export const ivddDocById = (id: string): DocTemplate | undefined =>
  ivddDocuments.find((d) => d.id === id);
