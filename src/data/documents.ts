// =====================================================================
// src/data/documents.ts
// 정거장별 문서 작성 템플릿 (복사용). 정거장 1:1 매핑.
// toMarkdown() 으로 복사/.md 다운로드용 마크다운을 생성한다.
// 규제 사실은 2026.6 기준 확인값. 실제 제출 전 최신 관보·NB 요건으로 재확인할 것.
// =====================================================================

import {
  leafById,
  prereqKindLabel,
  rationaleFor,
  knowledgeFor,
  metaFor,
  prepDocsFor,
  effortFor,
  difficultyLabel,
  importanceLabel,
  type DocLeaf,
  type Prerequisite,
  type Level,
  type DocEffort,
} from "./docTree";
import { stations, type Station } from "./stations";
import { iso13485DocById } from "./iso13485/documents";
import { iso13485LeafById } from "./iso13485/docTree";

export interface DocSection {
  heading: string;
  guidance: string; // 무엇을 어떻게 쓰는지 안내
  placeholder: string; // 채워넣기 예시/뼈대
}

export type CalcToolType = "sens-spec" | "sample-size" | "risk-matrix";

export interface DocTemplate {
  id: string; // 고유 슬러그 (docTree 잎 id 와 일치)
  stationId: number; // 1..11
  docTitle: string;
  purpose: string; // 이 문서가 충족/증명하는 것 (무엇)
  rationale?: string; // 이 문서를 왜 쓰는가 (취지·근본 이유)
  difficulty?: Level; // 작성 난이도
  importance?: Level; // 중요도
  effort?: DocEffort; // 예상 소요 기간(단계별)
  prepDocs?: string[]; // 미리 만들어두면 좋은 문서(선행 잎 id)
  knowledge?: string[]; // 작성 전 알아야 할 것 (사전 지식 체크리스트)
  prerequisites?: Prerequisite[]; // 작성 전 준비물 (resolveDoc에서 잎으로부터 채움)
  experiments?: string[]; // 문서 작성 전 수행해야 할 실험 목록
  certTests?: string[];   // 필요한 인증·테스트 (수행·확인해야 할 규격 시험)
  requiredData?: string[]; // 반드시 확보해야 할 자료·데이터
  sections: DocSection[];
  checklist: string[];
  relatedConceptSlugs: string[];
  refs: string[];
  calcTools?: CalcToolType[];
}

export const documents: DocTemplate[] = [
  {
    id: "intended-purpose",
    stationId: 1,
    docTitle: "의도된 목적 정의서",
    purpose:
      "기기의 의도된 목적을 한 문단으로 확정해, 이후 분류·성능·라벨링의 기준을 고정한다.",
    sections: [
      {
        heading: "1. 제품 식별",
        guidance: "제품명·모델·버전·제조자를 적는다.",
        placeholder: "제품명: [____]\n모델/버전: [____]\n제조자: [____]",
      },
      {
        heading: "2. 의도된 목적 (5요소)",
        guidance:
          "무엇·검체·사용자·환경·결정을 한 문단으로. 라벨/IFU와 정확히 일치해야 한다.",
        placeholder:
          "본 기기는 [검체: 예 정맥혈]에서 [측정대상: 예 ___ 항원]을 [정성/정량] 검출하여, [사용자: 전문가/자가검사]가 [환경: 실험실/근접검사/가정]에서 [임상적 결정: 예 ___ 진단 보조]를 하도록 돕는 체외진단 의료기기다.",
      },
      {
        heading: "3. IVD 해당성 판단",
        guidance: "IVDR Art.2 정의에 해당하는지 근거와 함께 명시.",
        placeholder: "Art.2 IVD 정의 해당 여부: [해당/비해당]\n근거: [____]",
      },
      {
        heading: "4. 미사용 목적 (Out of scope)",
        guidance: "오용을 막기 위해 의도하지 않은 용도를 명시.",
        placeholder: "본 기기는 [____] 용도로는 사용하지 않는다.",
      },
    ],
    requiredData: [
      "EU 출시 대상 국가 목록 (언어 요건 포함)",
      "유사 기기 시장 분석 자료 (경쟁사 IFU·라벨 수집)",
      "사용자 분석 자료 (전문가/자가검사 여부 결정 근거)",
      "IVDR Art.2 IVD 정의 원문 및 MDCG 해석 문서",
      "제품 원리·기술 개요 (R&D 초안 자료)",
    ],
    checklist: [
      "5요소(무엇·검체·사용자·환경·결정)가 모두 들어갔는가",
      "라벨·IFU 문구와 의도된 목적이 일치하는가",
      "자가검사/근접검사 여부가 명확한가 (분류에 직접 영향)",
    ],
    relatedConceptSlugs: ["intended-purpose", "annex-viii"],
    refs: ["IVDR Art.2"],
  },
  {
    id: "classification-rationale",
    stationId: 2,
    docTitle: "분류 근거서",
    purpose:
      "Annex VIII Rule 1~7을 적용해 클래스를 결정하고 그 근거를 1장으로 남긴다. NB가 가장 먼저 보는 문서.",
    sections: [
      {
        heading: "1. 의도된 목적 요약",
        guidance: "정의서에서 핵심을 옮겨온다.",
        placeholder: "검체/측정대상/사용자/환경/결정: [____]",
      },
      {
        heading: "2. Rule 적용 내역",
        guidance:
          "Rule 1~7을 순서대로 검토하고 해당 여부·사유를 표로. 둘 이상 해당 시 최고 등급 채택.",
        placeholder:
          "Rule 1: [해당/비해당] — 사유 [____]\nRule 2: [____]\nRule 3: [____]\nRule 4(자가/근접검사): [____]\nRule 5: [____]\nRule 6: [____]\nRule 7: [____]",
      },
      {
        heading: "3. 최종 분류 및 근거",
        guidance: "결정 클래스와 결정적 Rule을 명시.",
        placeholder: "최종 클래스: [A/B/C/D]\n결정 Rule: [____]\n근거 요약: [____]",
      },
      {
        heading: "4. 경로 영향",
        guidance: "분류에 따른 NB 개입·전환 기한을 적는다.",
        placeholder: "NB 개입: [필요/불필요]\n전환 기한: [____]",
      },
    ],
    experiments: [
      "Rule 4 해당 여부 확인 — 자가검사·근접검사 프로토타입 사용자 관찰 (n≥5, 비전문가)",
    ],
    certTests: [
      "NANDO에서 내 scope 지원 NB 목록 조회 — 분류에 따른 NB 가용성 사전 확인",
    ],
    requiredData: [
      "의도된 목적 정의서 확정본",
      "IVDR Annex VIII Rule 1~7 원문",
      "유사 기기 분류 선례 자료 (NB 결정문·EUDAMED 등록 기기)",
      "자가검사/근접검사 해당 여부 판단 근거 (사용자 환경 분석)",
      "MDCG 2020-16 분류 가이드라인",
    ],
    checklist: [
      "Rule 1~7을 모두 순서대로 검토했는가",
      "자가/근접검사면 Rule 4(대체로 Class C)를 반영했는가",
      "둘 이상 해당 시 최고 등급을 채택했는가",
      "결정적 Rule과 근거가 한눈에 보이는가",
    ],
    relatedConceptSlugs: ["annex-viii", "notified-body", "intended-purpose"],
    refs: ["IVDR Annex VIII", "Art.47"],
  },
  {
    id: "conformity-route-plan",
    stationId: 3,
    docTitle: "적합성 평가 경로 계획 + 산출물 체크리스트",
    purpose:
      "결정된 클래스에 맞는 Annex IX~XI 경로를 확정하고, 필요한 산출물을 미리 고정한다.",
    sections: [
      {
        heading: "1. 클래스 및 경로 선택",
        guidance: "클래스에 맞는 Annex 경로(주로 IX, 또는 X+XI)를 명시.",
        placeholder: "클래스: [____]\n선택 경로: [Annex IX / Annex X+XI]\n사유: [____]",
      },
      {
        heading: "2. 산출물 체크리스트",
        guidance: "경로가 요구하는 문서를 나열하고 담당·기한을 배정.",
        placeholder:
          "- [ ] QMS 문서 — 담당 [__] 기한 [__]\n- [ ] 기술문서(Annex II/III) — [__]\n- [ ] 성능평가(PEP/PER) — [__]\n- [ ] 위험관리 파일 — [__]\n- [ ] DoC — [__]",
      },
      {
        heading: "3. NB 관여 범위",
        guidance: "심사 대상(QMS/기술문서 표본 등)을 적는다.",
        placeholder: "NB 심사 대상: [____]",
      },
    ],
    certTests: [
      "NB scope 적합성 사전 확인 — NANDO에서 선정 NB가 해당 분류·제품군을 심사 가능한지 확인",
    ],
    requiredData: [
      "분류 근거서 확정본 (클래스 결정)",
      "IVDR Annex IX~XI 원문 비교표",
      "NANDO NB 목록 및 scope 정보",
      "레거시 기기 해당 여부 판단 자료 (Class C: 2026.5.26, Class D: 2025.5.26)",
      "NB 접촉 일정 및 예비 슬롯 확인 결과",
    ],
    checklist: [
      "클래스와 Annex 경로가 일치하는가",
      "각 산출물에 담당·기한이 배정되었는가",
      "NB 관여 범위를 확인했는가",
    ],
    relatedConceptSlugs: ["notified-body", "annex-ii", "pep-per"],
    refs: ["IVDR Art.48", "Annex IX~XI"],
  },
  {
    id: "qms-ivdr-matrix",
    stationId: 4,
    docTitle: "QMS↔IVDR 연계 매트릭스",
    purpose:
      "ISO 13485 QMS에 IVDR 고유 프로세스를 연결해, 인증서만으로 부족한 부분을 메운다.",
    sections: [
      {
        heading: "1. QMS 기준",
        guidance: "적용 표준·인증 상태.",
        placeholder: "표준: ISO 13485:2016\n인증 상태/기관: [____]",
      },
      {
        heading: "2. IVDR 고유 프로세스 연계",
        guidance:
          "IVDR이 추가로 요구하는 프로세스를 절차서 번호에 매핑.",
        placeholder:
          "성능평가 → 절차 [SOP-__]\nPMS/PMPF → [SOP-__]\nPSUR → [SOP-__]\nUDI/EUDAMED 등록 → [SOP-__]\n시정·예방조치/바이질런스 → [SOP-__]",
      },
      {
        heading: "3. Art.10(8) 충족 근거",
        guidance: "QMS 수립·문서화·유지 증빙과 시점.",
        placeholder: "QMS 수립 시점: [____] (연장 조건: 2025.5.26까지)",
      },
    ],
    certTests: [
      "ISO 13485:2016 gap 분석 — IVDR 고유 요건(성능평가·PMS·UDI) 미반영 조항 식별",
      "내부 QMS 심사 — IVDR Art.10(8) 이행 현황 자체 점검",
    ],
    requiredData: [
      "ISO 13485:2016 인증서 (또는 인증 계획서)",
      "IVDR Art.10(8) 전문 및 MDCG 해석 가이드",
      "현행 SOP 전체 목록·최신 버전",
      "QMS 내부 심사 결과 (최근 1년)",
      "PRRC(규제 요건 책임자) 지정 문서",
    ],
    checklist: [
      "IVDR 고유 프로세스가 모두 절차서에 연결됐는가",
      "ISO 13485 인증 외 IVDR 추가 요구를 반영했는가",
      "Art.10(8) 시점 요건(2025.5.26)을 확인했는가",
    ],
    relatedConceptSlugs: ["iso-13485", "pms"],
    refs: ["IVDR Art.10(8)", "ISO 13485:2016"],
  },
  {
    id: "tech-doc-toc-gspr",
    stationId: 5,
    docTitle: "기술문서 목차(Annex II/III) + GSPR 체크리스트",
    purpose:
      "Annex II/III 목차를 폴더 구조로 만들고, GSPR(Annex I) 충족을 항목별로 추적한다.",
    sections: [
      {
        heading: "1. 기술문서 목차 (Annex II)",
        guidance: "Annex II 항목을 폴더로. 담당·기한 배정.",
        placeholder:
          "1. 기기 설명·의도된 목적 — [__]\n2. 라벨·IFU — [__]\n3. 설계·제조 정보 — [__]\n4. GSPR 충족 근거 — [__]\n5. 위험·이익 분석 — [__]\n6. 검증·밸리데이션(성능평가) — [__]",
      },
      {
        heading: "2. 시판 후 기술문서 (Annex III)",
        guidance: "PMS 계획·PSUR·PMPF 위치를 연결.",
        placeholder: "PMS 계획: [위치]\nPSUR/PMS 보고서: [위치]\nPMPF 계획·보고서: [위치]",
      },
      {
        heading: "3. GSPR 체크리스트 (Annex I)",
        guidance: "요구사항별 적용·충족방법·증거위치를 한 줄씩.",
        placeholder:
          "| GSPR 조항 | 요구사항 요약 | 적용 | 충족 방법 | 증거 위치 |\n|---|---|---|---|---|\n| §1 | 안전·성능 충족, 위험 최소화 | 예 | 성능평가 + 위험관리 | PER, RMF |\n| §2 | 위험 대비 잔여위험 수용 가능 | 예 | ISO 14971 | RMF §5 |\n| §3 | 의도된 성능 달성 | 예 | PER | PER §2 |\n| §5 | 기기 수명 중 성능 유지 | 예 | 안정성 시험 | 분석 성능 §6 |\n| §8 | 화학적·물리적 특성 안전 | 해당 시 | 원자재 시험 | TD §3 |\n| §11 | 측정 기능 정확도 | 예 | LoD·정밀도·정확도 시험 | PER §2 |\n| §13 | 라벨·IFU 정보 완전성 | 예 | IFU 사용적합성 | IFU v[__] |\n| §14 | 사이버보안 (SW 포함 시) | 해당 시 | IEC 81001-5-1 | SW 보안 파일 |\n| [추가] | [____] | [__] | [____] | [____] |",
      },
    ],
    experiments: [
      "GSPR 각 조항(§1~§14) 충족 방법 사전 매핑 워크숍 (R&D·RA 팀 공동)",
    ],
    requiredData: [
      "IVDR Annex I (GSPR) 원문",
      "IVDR Annex II/III 원문",
      "성능시험 결과 초안 (분석적·임상적 데이터)",
      "위험관리 파일 초안",
      "기기 설명서·BOM 초안",
      "IFU 초안",
      "MDCG 2021-26 기술문서 가이드라인",
    ],
    checklist: [
      "Annex II 모든 항목에 담당·기한이 있는가",
      "GSPR 각 항목에 증거 위치가 매핑됐는가",
      "Annex III(시판 후) 문서와 연결됐는가",
    ],
    relatedConceptSlugs: ["annex-ii", "annex-iii", "gspr"],
    refs: ["IVDR Annex II", "Annex III", "Annex I"],
  },
  {
    id: "performance-eval-plan",
    stationId: 6,
    docTitle: "성능평가 계획 (PEP) 목차",
    purpose:
      "과학적·분석적·임상적 성능 3단 증거를 어떻게 확보할지 먼저 설계한다(PER 이전).",
    sections: [
      {
        heading: "1. 과학적 타당성 (Scientific Validity)",
        guidance: "분석물질이 목표 임상 상태와 연관된다는 과학적 근거를 문헌·가이드라인으로 제시한다. (IVDR Annex XIII 1조)",
        placeholder: "분석물질: [예: SARS-CoV-2 뉴클레오캡시드 항원]\n임상 상태: [예: COVID-19 급성 감염]\n\n근거 문헌:\n1. [저자, 제목, 저널, 연도] — 핵심: [____]\n2. [____]\n\n공식 가이드라인:\n- [예: WHO Emergency Use Listing Procedure, 2021]\n- [예: CLSI EP27 또는 EP15]\n\n결론: [분석물질 ↔ 임상 상태 연관성 확립됨 / 추가 근거 필요]",
      },
      {
        heading: "2. 분석적 성능 연구 설계",
        guidance: "LoD·정밀도·정확도·특이성(교차반응)·안정성 연구를 설계한다. (IVDR Annex XIII 2.1조)",
        placeholder: "[ ] LoD (검출 한계) — 방법: [Probit 분석, CLSI EP17] / 목표: [____]\n[ ] 정밀도 — 반복성: [동일 장비, n=20] / 재현성: [3개 기관, 3일간]\n[ ] 진실성/정확도 — 참고법 비교: [____] / 검체수: [n≥40]\n[ ] 교차반응 — 시험 항원/균주 목록: [____]\n[ ] 기질 간섭 — 헤모글로빈·지질·빌리루빈: [____]\n[ ] 안정성 — 가속: [____°C × ____주] / 실시간: [____]",
      },
      {
        heading: "3. 임상적 성능 연구 설계",
        guidance: "민감도·특이도를 통계적으로 입증할 임상 연구를 설계한다. MDCG 2025-5의 성능 연구 유형을 참조하라.",
        placeholder: "연구 유형: [전향적 / 후향적 / 레지스트리 — MDCG 2025-5 Table 1 참조]\n대상 집단: [____] (나이·성별·임상 상태)\n참조 검사(Reference Standard): [예: PCR, 배양, 임상 진단]\n목표 Se: [____]% · 허용 오차: ±____% · 신뢰 수준: 95%\n목표 Sp: [____]% · 허용 오차: ±____%\n→ 최소 양성 검체: n ≥ [계산기 사용 →____] (Wilson 방법)\n→ 최소 음성 검체: n ≥ [____]\n참여 기관 수: [≥2개 기관 권장]\n통계 방법: [95% CI, Wilson 방법, Clopper-Pearson]",
      },
      {
        heading: "4. 연구 일정 및 책임",
        guidance: "PEP → 데이터 수집 → PER 완성까지 일정과 담당을 배정한다.",
        placeholder: "PEP 완성: [____] — 담당: [____]\n분석적 성능 연구 완료: [____] — 기관: [____]\n임상 검체 수집 시작: [____] — 기관: [____]\n임상 검체 수집 완료: [____]\nPER 초안 완성: [____] — 담당: [____]\nNB 제출 예정: [____]",
      },
    ],
    experiments: [
      "분석물질-임상상태 연관성 선행 문헌 검색 (PubMed, MEDLINE — 최소 50편 스크리닝)",
      "파일럿 LoD 예비 실험 — 연속 희석 n=3 농도 수준, 각 농도 n=10으로 검출 범위 추정",
      "검체 수집 가능성 사전 조사 — 임상 기관 협력 가능 여부 및 검체 확보 예상 기간",
      "참조 검사(Reference Standard) 성능 확인 — 예정 비교법의 민감도·특이도 문헌 검증",
    ],
    certTests: [
      "참조 검사(Reference Standard) 선정 및 적합성 검토 (IVDR Annex XIII 요건)",
      "CLSI 방법론 적용 가능성 검토 — EP17(LoD), EP15(정밀도), EP09(방법 비교)",
      "임상 연구 설계 IRB/윤리위원회 사전 상담 (검체 수집 계획 포함)",
    ],
    requiredData: [
      "MDCG 2025-5 성능 연구 가이드라인",
      "IVDR Annex XIII 원문",
      "유사 기기 성능 데이터 (benchmark — 동급 기기 PER 또는 공개 논문)",
      "참여 기관 계약서 초안 (임상 검체 수집 기관)",
      "IRB/윤리 심의 계획서 초안",
      "통계 산출 도구 (Wilson 방법 또는 Clopper-Pearson 계산기)",
      "CLSI EP17·EP15·EP09 가이드라인 원문",
    ],
    checklist: [
      "3단(과학적 타당성·분석적·임상적)이 모두 설계됐는가",
      "MDCG 2025-5 성능 연구 유형을 확인하고 연구 유형을 선택했는가",
      "LoD·정밀도·정확도 연구에 CLSI 또는 동등 방법론이 명시됐는가",
      "임상 연구에 통계적 검체수 산출 근거(Wilson 방법)가 있는가",
      "참조 검사(Reference Standard)가 명확히 정의됐는가",
      "PER로 닫는 일정과 담당이 지정됐는가",
      "Class C·D면 Annex XIII Part B 임상 연구 요건도 확인했는가",
    ],
    relatedConceptSlugs: ["pep-per", "annex-xiii", "gspr"],
    refs: ["IVDR Art.56", "Annex XIII", "MDCG 2025-5", "CLSI EP17", "CLSI EP15"],
    calcTools: ["sens-spec", "sample-size"],
  },
  {
    id: "risk-management-plan",
    stationId: 7,
    docTitle: "위험관리 계획 (ISO 14971) + GSPR↔위험 추적표",
    purpose:
      "ISO 14971 프로세스를 수립하고, 위험-요구(GSPR)-성능을 양방향 추적한다.",
    sections: [
      {
        heading: "1. 위험관리 계획 (ISO 14971 Clause 4.4)",
        guidance: "범위·적용 표준·위험 수용 기준·검토 시점을 정의한다.",
        placeholder: "적용 표준: ISO 14971:2019 + IVDR Annex I\n범위: [제품명 및 수명 주기 단계 — 설계부터 폐기까지]\n\n위험 수용 기준 행렬:\n- 수용 가능: P × S ≤ 3\n- ALARP 필요: 4 ≤ P × S ≤ 12\n- 수용 불가: P × S ≥ 15\n\n위험관리 팀: [이름/직책]\n검토 시점: [설계 단계별 / 시판 후 연간]",
      },
      {
        heading: "2. 위험 분석 — IVD 특유 위해요인",
        guidance: "IVD에 특화된 위해요인을 위해요인→위험상황→위해 형식으로 기술한다.",
        placeholder: "| 위해요인 | 위험상황 | 위해 | P | S | 초기위험 | 통제수단 | 잔여위험 | 검증 참조 |\n|---|---|---|---|---|---|---|---|---|\n| 위양성 결과 | 감염 없는 환자에게 불필요 항생제 처방 | 약물 부작용 | 2 | 4 | 8(ALARP) | IFU 확인 지침 + 임상 검증 기준 강화 | 2 | PER §3 |\n| 위음성 결과 | 감염 환자 미진단 | 치료 지연 | 2 | 5 | 10(ALARP) | 민감도 ≥95% 요건 + 재검사 지침 | 3 | PER §3 |\n| 교차반응 | 유사 항원 위양성 | 오진단 | 2 | 3 | 6(ALARP) | 교차반응 시험 목록 최소화 | 2 | 분석적 §5 |\n| 검체 오염 | 취급 오류 | 잘못된 결과 | 3 | 3 | 9(ALARP) | IFU 취급 절차 강화 | 2 | 사용적합성 |\n| [추가] | [____] | [____] | [__] | [__] | [__] | [____] | [__] | [____] |",
      },
      {
        heading: "3. GSPR↔위험↔성능 추적표",
        guidance: "GSPR 각 조항이 어떤 위험과 연결되고, 어떤 성능 증거로 충족되는지 매핑한다.",
        placeholder: "| GSPR 조항 | 요구사항 요약 | 관련 위험 | 충족 방법 | 성능 증거 위치 |\n|---|---|---|---|---|\n| Annex I §1 | 설계·제조가 의도된 목적 충족 | R-001, R-002 | 분석·임상 성능 시험 | PER §2, §3 |\n| Annex I §8 | 위험 최소화 | R-001~R-006 | ISO 14971 통제 | 위험관리 파일 |\n| Annex I §9 | 라벨·IFU 완전성 | R-004 | IFU 사용적합성 | IFU v[__] |\n| Annex I §13 | 자가검사 사용편의성 (해당 시) | R-005 | IEC 62366 | 사용적합성 보고서 |",
      },
      {
        heading: "4. 사용적합성 연계 (IEC 62366 — 자가검사·근접검사 해당 시)",
        guidance: "자가검사 또는 근접검사 제품은 사용 오류 위험을 IEC 62366으로 연계해야 한다.",
        placeholder: "적용 여부: [ ] 자가검사  [ ] 근접검사  [ ] 해당 없음 (전문가용)\n\n주요 사용 오류 위험:\n- [예: 검체 채취 방법 오류 → 잘못된 결과] — 완화: IFU 그림 지침 + 색상 코딩\n- [예: 판독 시간 초과 → 위음성] — 완화: 타이머 알람 기능\n\nIEC 62366 요약 가용성 파일(SUM) 참조: [위치]",
      },
    ],
    experiments: [
      "사용 오류 예비 분석 — IVD 특유 위해요인(위양성·위음성·교차반응) 위험 목록 초안 작성",
      "교차반응 가능 물질 예비 조사 — 유사 항원·간섭 물질 문헌 조사 및 시험 대상 목록 작성",
    ],
    certTests: [
      "ISO 14971:2019 gap 분석 — 기존 위험관리 프로세스 대비 요건 미충족 항목 식별",
      "IEC 62366-1 적용 여부 판단 — 자가검사·근접검사 해당 시 사용적합성 계획 수립 필수",
    ],
    requiredData: [
      "ISO 14971:2019 원문",
      "IVDR Annex I §8 원문",
      "유사 기기 위험 사례 문헌 (PubMed, 규제기관 DB)",
      "IEC 62366-1:2015+A1:2020 원문 (자가검사·근접검사 해당 시)",
      "제품 설계 사양서 초안 (잠재적 위해요인 도출용)",
      "제품 원자재·시약 안전 데이터 시트(SDS)",
    ],
    checklist: [
      "위험 수용 기준 행렬이 정의됐는가 (P × S 기준)",
      "IVD 특유 위해요인(위양성·위음성)이 포함됐는가",
      "GSPR 8조 이상의 위험 통제 조항이 추적됐는가",
      "잔여 위험이 모두 수용 기준 이하로 통제됐는가",
      "자가검사면 IEC 62366 연계를 확인했는가",
      "위험관리 파일이 수명 주기 전체를 다루는가",
    ],
    relatedConceptSlugs: ["iso-14971", "gspr", "iec-62366"],
    refs: ["ISO 14971:2019", "IVDR Annex I §8", "IEC 62366-1:2015"],
    calcTools: ["risk-matrix"],
  },
  {
    id: "nb-application",
    stationId: 8,
    docTitle: "NB 선정·접촉·신청 준비 체크리스트",
    purpose:
      "scope에 맞는 NB를 조기에 확보하고 신청 패키지를 준비한다. 슬롯 지연이 시장 접근을 막는다.",
    sections: [
      {
        heading: "1. NB 후보 선정",
        guidance: "NANDO에서 내 scope를 다루는 NB를 조사.",
        placeholder: "후보 NB(번호/scope): [____]\n접촉 담당·일자: [____]",
      },
      {
        heading: "2. 계약·일정",
        guidance: "서면계약·심사 일정 확보.",
        placeholder: "서면계약 상태: [____]\n예상 심사 일정: [____]",
      },
      {
        heading: "3. 신청 패키지",
        guidance: "제출 문서 목록 점검.",
        placeholder:
          "- [ ] QMS 문서\n- [ ] 기술문서(Annex II/III)\n- [ ] 성능평가(PER)\n- [ ] 위험관리 파일\n- [ ] 분류 근거서",
      },
    ],
    certTests: [
      "NANDO에서 scope 적합 NB 조회 — 분류·제품군(IVD)·EU 회원국 요건 동시 확인",
    ],
    requiredData: [
      "NANDO NB 검색 결과 (후보 NB 목록·scope·연락처)",
      "신청 패키지 체크리스트 — QMS·기술문서·PER·RMF·분류 근거서",
      "레거시 기기 마감일 확인 (Class C: 2026.5.26, Class D: 2025.5.26)",
      "NB 서면계약서 초안 (슬롯·일정·심사 범위)",
      "NB 심사 예상 기간 및 비용 견적",
    ],
    checklist: [
      "NANDO로 scope 적합 NB를 확인했는가",
      "서면계약을 확보했는가",
      "레거시 마감(Class C: 2026.5.26)을 확인했는가",
      "신청 패키지가 완비됐는가",
    ],
    relatedConceptSlugs: ["notified-body", "annex-viii"],
    refs: ["IVDR Art.38~46"],
  },
  {
    id: "declaration-of-conformity",
    stationId: 9,
    docTitle: "적합성 선언서 (DoC, Annex IV) 템플릿",
    purpose:
      "IVDR 충족을 공식 선언하고 CE 부착의 법적 근거를 만든다.",
    sections: [
      {
        heading: "1. 제조자·대리인",
        guidance: "이름·주소·SRN.",
        placeholder: "제조자: [____] / SRN: [____]\nEU 대리인(해당 시): [____]",
      },
      {
        heading: "2. 기기 식별",
        guidance: "제품명·모델·Basic UDI-DI.",
        placeholder: "제품명/모델: [____]\nBasic UDI-DI: [____]",
      },
      {
        heading: "3. 적합성 선언 내용",
        guidance: "분류·적용 규정·표준·NB 정보.",
        placeholder:
          "분류: [____]\n본 기기는 IVDR (EU) 2017/746을 충족함을 선언한다.\n적용 표준: [____]\nNB(해당 시) 번호·인증서: [____]",
      },
      {
        heading: "4. 서명",
        guidance: "서명권자·일자·장소.",
        placeholder: "서명권자: [____]\n일자/장소: [____]",
      },
    ],
    certTests: [
      "NB 심사 최종 통과 확인 — Annex IX 또는 X+XI 심사 결과서 수령",
      "CE 마킹 Annex V 크기·위치 요건 검토",
    ],
    requiredData: [
      "NB 인증서 사본 (해당 시 — Class C·D)",
      "기술문서 최종 서명본",
      "성능평가 보고서(PER) 최종본",
      "위험관리 파일 최종본",
      "GSPR 체크리스트 완성본",
      "Basic UDI-DI 확정값",
      "EU 대리인 계약서 (비EU 제조자)",
      "IVDR Annex IV 양식 원문",
      "EUDAMED 행위자 등록 완료(SRN) 확인",
    ],
    checklist: [
      "Annex IV 필수 항목을 모두 포함했는가",
      "Basic UDI-DI가 기재됐는가",
      "라벨·기술문서와 항목이 일치하는가",
      "CE 부착 규칙(Annex V)과 연동됐는가",
    ],
    relatedConceptSlugs: ["doc", "ce-marking", "udi"],
    refs: ["IVDR Annex IV", "Annex V", "Art.17~18"],
  },
  {
    id: "device-registration",
    stationId: 10,
    docTitle: "EUDAMED/UDI 등록 데이터 준비표",
    purpose:
      "행위자 등록(SRN)→기기 등록→UDI 체계를 정리해 합법 출시 요건을 채운다.",
    sections: [
      {
        heading: "1. 행위자 등록 (SRN)",
        guidance: "제조자/대리인/수입자 등록 정보.",
        placeholder: "행위자 유형: [____]\nSRN: [발급/대기]\n등록 담당·일자: [____]",
      },
      {
        heading: "2. UDI 체계",
        guidance: "Basic UDI-DI / UDI-DI / 캐리어.",
        placeholder:
          "Basic UDI-DI: [____]\nUDI-DI(모델별): [____]\n발행기관(GS1 등): [____]\n라벨 캐리어 형식: [____]",
      },
      {
        heading: "3. 기기 등록 데이터",
        guidance: "EUDAMED 기기 모듈에 넣을 항목.",
        placeholder: "기기명/분류/상태: [____]\n관련 인증서·DoC: [____]",
      },
      {
        heading: "4. 기한 점검",
        guidance: "의무화·레거시 마감.",
        placeholder:
          "첫 4개 모듈 의무화: 2026.5.28\n레거시 기기 등록 마감: 2026.11.28",
      },
    ],
    certTests: [
      "EUDAMED 테스트 환경에서 행위자 등록 시뮬레이션 — SRN 발급 절차 사전 점검",
      "UDI 발행기관 등록 확인 (GS1/HIBCC) — UDI 발급 전 기관 등록 필수",
      "UDI 캐리어 바코드 스캔 테스트 — 인쇄 품질·판독률 검증",
    ],
    requiredData: [
      "SRN 발급 완료 확인서",
      "Basic UDI-DI / UDI-DI 확정 목록 (모델별)",
      "DoC 최종 서명본",
      "NB 인증서 (해당 시)",
      "EUDAMED 첫 4개 모듈 의무화 일정 (2026.5.28) 및 레거시 기기 마감 (2026.11.28)",
      "IVDR Art.24~28 및 Annex VI 원문",
      "EU Decision (EU) 2025/2371 EUDAMED 최신 고시",
    ],
    checklist: [
      "SRN을 먼저 확보했는가",
      "Basic UDI-DI ↔ DoC ↔ 기기등록이 일관되는가",
      "2026.5.28 / 2026.11.28 기한을 반영했는가",
    ],
    relatedConceptSlugs: ["eudamed", "udi", "srn", "doc"],
    refs: ["IVDR Art.24~28", "Annex VI", "Decision (EU) 2025/2371"],
  },
  {
    id: "pms-plan",
    stationId: 11,
    docTitle: "시판 후 감시 계획 (PMS Plan) + PMPF/PSUR 일정",
    purpose:
      "PMS를 QMS에 통합하고 PMS→성능→위험 환류 경로를 명문화한다. 인증은 끝이 아니다.",
    sections: [
      {
        heading: "1. PMS 계획",
        guidance: "데이터 소스·수집 방법·주기·책임.",
        placeholder:
          "데이터 소스:\n① 고객 불만 (Complaint Log): [CRM/ERP 위치]\n② 바이질런스 보고 (EUDAMED): 심각 사고 15일 내, 추세 분석 분기별\n③ 문헌 감시: [PubMed 검색어·주기]\n④ 시장 피드백: [판매처·유통 피드백 채널]\n⑤ PMPF 데이터: [임상 성능 추적 연구]\n\n수집 주기: [월간 / 분기]\n분석·보고 주기: [분기 요약 + 연간 PSUR]\n책임자: [QA 담당자 이름/직책]",
      },
      {
        heading: "2. PMPF 계획",
        guidance: "시판 후 성능 추적 방법(Annex XIII Part B).",
        placeholder: "PMPF 활동: [____]\n주기/지표: [____]",
      },
      {
        heading: "3. PSUR 일정",
        guidance: "Class C·D는 매년.",
        placeholder: "PSUR 주기: [Class C·D 매년 / 기타 ____]\n최초 작성 예정: [____]",
      },
      {
        heading: "4. 환류 경로",
        guidance: "PMS→성능평가→위험관리 갱신 트리거.",
        placeholder: "환류 트리거·경로: [____]",
      },
    ],
    certTests: [
      "PSUR 양식 NB 사전 확인 — NB별 PSUR 제출 요건·양식 확인",
      "바이질런스 보고 프로세스 테스트 — 심각 사고 15일 이내 EUDAMED 보고 절차 시뮬레이션",
    ],
    requiredData: [
      "IVDR Art.78~85 전문",
      "MDCG 2025-10 PMS 가이드라인",
      "EUDAMED PMS·바이질런스 모듈 요건 문서",
      "CRM/ERP 고객 불만 처리 시스템 현황",
      "문헌 감시 키워드·PubMed 검색 전략 초안",
      "PMPF 프로토콜 초안 (임상 성능 추적 연구)",
      "IVDR Annex XIII Part B 원문",
    ],
    checklist: [
      "PMS가 QMS에 통합됐는가",
      "PMS→성능→위험 환류 경로가 명문화됐는가",
      "Class C·D면 PSUR 연간 일정이 있는가",
      "PMPF 계획이 Annex XIII Part B를 따르는가",
    ],
    relatedConceptSlugs: ["pms", "annex-iii", "annex-xiii"],
    refs: ["IVDR Art.78~81", "Annex III", "Annex XIII Part B", "MDCG 2025-10", "IVDR Art.85 (SSCP)"],
  },
  // ── 아래부터 추가 상세 템플릿 ─────────────────────────────────────
  {
    id: "device-description",
    stationId: 5,
    docTitle: "기기 설명서·사양 (Annex II 1.1)",
    purpose: "기기의 물리적 특성·구성·작동 원리를 문서화해 기술문서의 출발 항목을 완성한다.",
    sections: [
      {
        heading: "1. 제품 식별",
        guidance: "제품명·모델·버전·제조자·SRN·Basic UDI-DI.",
        placeholder: "제품명: [____]\n모델/버전: [____]\n제조자: [____] / SRN: [____]\nBasic UDI-DI: [____]",
      },
      {
        heading: "2. 기기 설명 및 의도된 목적",
        guidance: "의도된 목적 정의서에서 옮겨와 기기 유형·작동 원리를 설명.",
        placeholder: "기기 유형: [반응키트 / 분석기 / SW / 조합]\n작동 원리: [____]\n의도된 목적(요약): [____]",
      },
      {
        heading: "3. 구성 및 부품 목록",
        guidance: "시약·소모품·주요 부품·소프트웨어 버전. BOM 참조.",
        placeholder: "구성품:\n- [부품명] Rev.[__] — [역할]\n- SW [버전]: [기능 요약]\n참조 BOM: [문서번호/위치]",
      },
      {
        heading: "4. 기술 사양",
        guidance: "분석 범위·측정 단위·보관조건·환경 조건.",
        placeholder: "측정 범위: [____]\n검체 유형/부피: [____]\n보관 온도: [____] · 유효기간: [____]\n사용 환경 조건: [____]",
      },
      {
        heading: "5. 이전 세대·유사 기기",
        guidance: "기술 비교 — 동등성 주장 또는 변경 내역.",
        placeholder: "이전 세대: [없음 / 제품명-버전]\n주요 변경 사항: [____]",
      },
    ],
    experiments: [
      "작동 원리 검증 실험 — 시제품에서 측정 원리(효소반응·면역반응 등)가 정상 작동함을 확인",
      "환경 조건별 작동 확인 시험 — 온도(15~30°C), 습도(20~80% RH) 범위 내 성능 유지 확인",
    ],
    requiredData: [
      "BOM(부품 목록) 최신 확정본",
      "SW 버전 이력 및 릴리스 노트",
      "보관 조건 시험 데이터 (온도·습도 사이클링)",
      "이전 세대 기기 비교 자료 (변경 이력, 동등성 주장 또는 변경 사유)",
      "원자재·시약 규격서 및 공급업체 CoA",
    ],
    checklist: [
      "Basic UDI-DI·제조자 정보가 DoC·라벨과 일치하는가",
      "구성품이 BOM과 일치하는가",
      "의도된 목적이 정의서와 정확히 일치하는가",
      "보관조건·유효기간이 안정성 시험 결과와 연결됐는가",
    ],
    relatedConceptSlugs: ["annex-ii", "gspr", "udi"],
    refs: ["IVDR Annex II 1.1", "Art.2"],
  },
  {
    id: "labelling-spec",
    stationId: 9,
    docTitle: "라벨 사양서 (Annex I + Art.18)",
    purpose: "IVDR Annex I 정보 요건을 충족하는 라벨·포장 사양을 확정한다. UDI·CE·NB 번호 포함.",
    sections: [
      {
        heading: "1. 제조자·연락처",
        guidance: "제조자명·주소·웹·EU 대리인(해당 시).",
        placeholder: "제조자: [____]\n주소: [____]\nEU 대리인: [____] (비EU 제조자)",
      },
      {
        heading: "2. 기기 식별 정보",
        guidance: "제품명·모델·배치/로트·유효기간·보관.",
        placeholder: "제품명: [____] · 모델: [____]\nLot/Ref: [____] · 유효기간: [____]\nBasic UDI-DI: [____] · UDI 캐리어 형식: [GS1 DataMatrix / 바코드]",
      },
      {
        heading: "3. 성능·용도 표시",
        guidance: "사용 목적(축약)·주의·사용 제한.",
        placeholder: "사용 목적(라벨 축약): [____]\n경고/주의: [____]\n취급주의 심볼(ISO 15223-1): [____]",
      },
      {
        heading: "4. CE 마킹 및 NB",
        guidance: "CE 마킹 위치·NB 식별번호.",
        placeholder: "CE 마킹 위치: [____]\nNB 번호(해당 시): [____]\nAnnex V 크기 요건 준수: 예/아니오",
      },
      {
        heading: "5. 언어",
        guidance: "출시 국가별 요구 언어.",
        placeholder: "출시 국가: [____]\n표기 언어: [____]",
      },
    ],
    certTests: [
      "ISO 15223-1 심볼 적합성 검토 — 라벨에 사용한 심볼이 ISO 15223-1 최신판 기준인지 확인",
      "UDI 캐리어 스캔 테스트 — GS1 DataMatrix/바코드 인쇄 후 스캐너 판독률 ≥99% 검증",
      "CE 마킹 Annex V 크기·위치 요건 검토 (최소 높이 5mm 등)",
    ],
    requiredData: [
      "Basic UDI-DI 확정값",
      "UDI 발행기관 등록 확인서 (GS1/HIBCC)",
      "IVDR Annex I §20 정보 요건 체크리스트",
      "출시 국가별 공식 언어 요건 목록",
      "NB 번호 확정 (해당 시)",
      "DoC 확정본 (라벨 항목과 일관성 확인용)",
      "IFU 최종 초안 (라벨과 용어 일치 확인용)",
    ],
    checklist: [
      "Annex I 정보 요건 항목을 모두 포함했는가",
      "UDI 캐리어(바코드 등)가 규격에 맞는가",
      "CE 마킹이 Annex V 크기·위치 요건을 따르는가",
      "라벨 문구가 DoC·IFU·기기 설명서와 일치하는가",
      "EU 출시 국가 언어 요건을 충족했는가",
    ],
    relatedConceptSlugs: ["ce-marking", "udi", "doc"],
    refs: ["IVDR Annex I (정보 요건)", "Art.18", "Annex V", "ISO 15223-1"],
  },
  {
    id: "ifu",
    stationId: 9,
    docTitle: "사용설명서 (IFU, Annex I)",
    purpose: "사용자가 기기를 올바르고 안전하게 사용할 수 있도록 모든 필수 정보를 제공한다.",
    sections: [
      {
        heading: "1. 기기 식별 및 제조자",
        guidance: "제품명·모델·Basic UDI-DI·제조자 연락처.",
        placeholder: "제품명: [____] / Basic UDI-DI: [____]\n제조자: [____] / 연락처: [____]",
      },
      {
        heading: "2. 의도된 목적 및 적응증",
        guidance: "검출 대상·검체·사용자·환경·임상 결정을 명확히.",
        placeholder: "의도된 목적: [____]\n적응증/대상 집단: [____]\n금기 사항: [____]",
      },
      {
        heading: "3. 검사 원리",
        guidance: "측정 원리·시약 반응 요약.",
        placeholder: "검사 원리: [____]\n관련 간섭 물질: [____]",
      },
      {
        heading: "4. 사용 방법 (단계별)",
        guidance: "검체 채취→보관→검사→판독을 순서대로. 자가검사는 그림 포함 권장.",
        placeholder: "검체 채취: [____]\n검사 절차:\n  1. [____]\n  2. [____]\n  3. [____]\n결과 판독: [____]\n음성/양성/무효 기준: [____]",
      },
      {
        heading: "5. 성능 특성 요약",
        guidance: "민감도·특이도·정밀도 등 핵심 성능 지표.",
        placeholder: "민감도: [___]%  특이도: [___]%\n정밀도(CV%): [____]\n측정 범위: [____]",
      },
      {
        heading: "6. 한계·주의·경고",
        guidance: "결과 한계·오용 방지 경고·보관 조건.",
        placeholder: "결과의 한계: [____]\n보관: [____] / 유효기간: [____]\n경고: [____]",
      },
      {
        heading: "7. 심볼 범례",
        guidance: "라벨에 쓰인 ISO 15223-1 심볼 설명.",
        placeholder: "심볼 → 의미:\n[심볼] → [____]",
      },
    ],
    experiments: [
      "비전문가 독해성 테스트 — 대표 사용자 n≥5가 IFU를 읽고 올바르게 검사 수행하는지 관찰",
      "사용 절차 관찰 시험 — 검체 채취·검사·판독 단계별 오류 발생 여부 기록 (사전 형성 평가)",
    ],
    certTests: [
      "IEC 62366-1 사용적합성 형성 평가 통과 — IFU 초안 기반 인지 워크스루·관찰 평가",
      "IEC 62366-1 총괄 평가 통과 — 최종 IFU로 대표 사용자 n≥15 검사, 위험 관련 오류 0건",
      "번역 정확성 검토 — 출시 국가별 언어 번역본을 모국어 전문가가 의미 검증",
    ],
    requiredData: [
      "성능평가 보고서(PER) 확정본 — 성능 수치(Se/Sp/LoD 등) 기재용",
      "사용적합성 파일 — 사용 시나리오·위험 관련 사용 오류 목록",
      "ISO 15223-1 심볼 최신 목록",
      "라벨 사양서 최종본 (용어·심볼 일치 확인)",
      "출시 국가 목록 및 언어 요건",
    ],
    checklist: [
      "Annex I 정보 요건 전 항목을 IFU에서 다루는가",
      "자가검사면 비전문가 가독성(IEC 62366 사용적합성)을 검증했는가",
      "라벨·DoC·기기 설명서와 내용이 일치하는가",
      "출시 국가 언어로 번역됐는가",
      "개정 관리 이력이 있는가",
    ],
    relatedConceptSlugs: ["iec-62366", "gspr", "ce-marking"],
    refs: ["IVDR Annex I (정보 요건)", "Art.18", "IEC 62366-1"],
  },
  {
    id: "risk-management-file",
    stationId: 7,
    docTitle: "위험관리 파일·보고서 (ISO 14971)",
    purpose: "위험 분석→평가→통제→잔여위험 평가의 전 이력을 파일로 유지하고, 결론을 보고서로 닫는다.",
    sections: [
      {
        heading: "1. 파일 구조 및 색인",
        guidance: "위험관리 계획·분석·통제·잔여위험·검토 문서 목록.",
        placeholder: "위험관리 계획: [문서번호]\n위험 분석·통제 테이블: [____]\n잔여위험 평가 결과: [____]\nGSPR↔위험 추적표: [____]",
      },
      {
        heading: "2. 잔여위험 종합 평가",
        guidance: "통제 후 잔여위험 총량이 수용 기준 이내인지 확인.",
        placeholder: "잔여위험 합산: [____]\n수용 기준 대비: [____]\n이익-위험 결론: [____]",
      },
      {
        heading: "3. 위험관리 검토 (Production 단계)",
        guidance: "생산·시판 후 정보를 검토해 새로운 위험이 없음을 확인.",
        placeholder: "검토 일자: [____]\n신규 위험 발견: 없음 / [____]\n조치: [____]",
      },
      {
        heading: "4. 시판 후 환류",
        guidance: "PMS 데이터→위험 재평가 연결.",
        placeholder: "PMS 환류 주기: [____]\n위험 재평가 트리거: [____]",
      },
    ],
    experiments: [
      "위험 통제 효과 검증 시험 — 통제 조치 적용 후 잔여위험이 수용 기준 이내임을 시험으로 확인",
      "사용 오류 통제 검증 — IFU 개선 후 사용자 시험 재실시, 오류율 감소 확인 (n≥10)",
    ],
    certTests: [
      "ISO 14971:2019 적합성 독립 검토 — RA 전문가 또는 NB 사전 검토 (formal review)",
      "IEC 62366-1 총괄 평가 결과 확인 — 사용 오류 기반 위험이 모두 수용됐는지 연계 확인",
    ],
    requiredData: [
      "성능평가 보고서(PER) 최종본 — 잔여 성능 불확도 연결",
      "분석적 성능 시험 원시 데이터 일체",
      "임상 성능 연구 결과 보고서",
      "사용 오류 시험 결과 (IEC 62366 총괄 평가)",
      "위험관리 계획서 확정본",
      "GSPR↔위험 추적표 완성본",
    ],
    checklist: [
      "모든 위해요인이 식별·통제·잔여위험 평가됐는가",
      "잔여위험 총량이 이익 대비 수용 가능한가",
      "GSPR↔위험 추적이 양방향 성립하는가",
      "시판 후 환류 경로가 위험 파일에 연결됐는가",
    ],
    relatedConceptSlugs: ["iso-14971", "gspr", "pms"],
    refs: ["ISO 14971:2019", "IVDR Annex I"],
  },
  {
    id: "performance-eval-report",
    stationId: 6,
    docTitle: "성능평가 보고서 (PER, Annex XIII)",
    purpose: "PEP에서 설계한 3단 증거(과학·분석·임상)를 종합해 성능 결론을 확정하고 평가를 닫는다.",
    sections: [
      {
        heading: "1. 과학적 타당성 결론",
        guidance: "분석물질-임상상태 연관의 근거 요약.",
        placeholder: "분석물질: [____]\n임상상태: [____]\n근거(문헌 수·수준): [____]\n결론: 과학적 타당성 [확립/불충분]",
      },
      {
        heading: "2. 분석적 성능 결론",
        guidance: "정밀도·정확도·검출한계·특이성 결과 요약.",
        placeholder: "정밀도(CV%): [____] → 수용 기준: [____]\n정확도: [____]\n검출한계(LoD): [____]\n교차반응: [____]\n결론: [충족 / 미충족 — 조치]",
      },
      {
        heading: "3. 임상적 성능 결론",
        guidance: "민감도·특이도·검체·기준 방법 요약.",
        placeholder: "민감도: [___]% (95% CI: [___~___])\n특이도: [___]%\n검체 수/출처: [____]\n기준 방법: [____]\n결론: [임상 성능 충족]",
      },
      {
        heading: "4. 종합 결론 및 잔여 성능 불확도",
        guidance: "3단 결론을 통합해 이익-위험 결론과 연결.",
        placeholder: "성능 종합 결론: [____]\n잔여 성능 불확도: [____]\n이익-위험 결론 참조: [문서번호]\nPMPF 필요성: [필요 / 불필요]",
      },
    ],
    experiments: [
      "LoD 실험 — Probit 분석, CLSI EP17 준수, 최소 n=60 (6개 농도 × 10회)",
      "반복성 정밀도 실험 — 동일 장비, 동일 검체, n≥20 반복 측정 (CV% 산출)",
      "재현성 정밀도 실험 — 3개 기관, 3일간, 2명 검사자 (CV% 산출, CLSI EP15)",
      "진실성/정확도 시험 — 참조법 대비 n≥40 검체 비교, 회귀 분석 (CLSI EP09)",
      "교차반응 시험 — 유사 항원·미생물 최소 20종, 각 n≥3 반복",
      "기질 간섭 시험 — 헤모글로빈·지질·빌리루빈·점도 이상 검체 n≥5종",
      "안정성 시험 — 가속(40°C/75% RH, 예상 유효기간 ×3배 기간) + 실시간(권장 보관조건)",
      "임상 성능 연구 — 전향적/후향적, 최소 2개 기관, 통계 산출 검체수(Wilson 방법)",
    ],
    certTests: [
      "GCP 임상 연구 윤리 심의(IRB) 최종 승인 — 인간 검체 수집 전 필수",
      "참조 검사(Reference Standard) 검증 — 비교법의 민감도·특이도 공식 확인",
      "CLSI EP17·EP15·EP09 방법론 준수 여부 내부 검토",
      "NB 또는 독립 전문가의 PER 초안 사전 검토 (Class C·D)",
    ],
    requiredData: [
      "성능평가 계획(PEP) 최종본",
      "모든 분석적 성능 시험 원시 데이터 (엑셀/LIMS 출력본)",
      "임상 검체 수집 기관 계약서 사본",
      "임상 검체 IRB 승인서 및 피험자 동의서 양식",
      "참조 검사 결과 원본 데이터",
      "통계 분석 보고서 (95% CI, Wilson/Clopper-Pearson)",
      "문헌 과학적 타당성 근거 (최소 10편 주요 문헌 요약)",
    ],
    checklist: [
      "PEP의 모든 수용 기준을 데이터로 충족했는가",
      "3단(과학·분석·임상) 증거가 모두 있는가",
      "잔여 성능 불확도와 이익-위험을 연결했는가",
      "PER 이후 PMPF 계획이 연결됐는가",
    ],
    relatedConceptSlugs: ["pep-per", "annex-xiii", "gspr"],
    refs: ["IVDR Art.56", "Annex XIII"],
  },
  {
    id: "quality-manual",
    stationId: 4,
    docTitle: "품질매뉴얼 (ISO 13485 4.2.2)",
    purpose: "QMS 범위·적용 제외·프로세스 상호작용을 선언해 인증기관과 고객에게 QMS 체계를 한 권으로 보인다.",
    sections: [
      {
        heading: "1. 회사 및 QMS 범위",
        guidance: "제조자명·사업장·IVDR 적용 제품 범위·ISO 13485 적용 제외 항목.",
        placeholder: "회사명: [____] / 주소: [____]\nQMS 적용 범위: [____]\n적용 제외(ISO 13485): [없음 / 7.x — 사유: ____]",
      },
      {
        heading: "2. 프로세스 맵",
        guidance: "핵심 프로세스와 상호작용(경영→실현→지원·측정).",
        placeholder: "경영 프로세스: [경영검토, 품질방침, 목표]\n제품실현 프로세스: [설계, 구매, 생산, 검사]\n지원 프로세스: [HR, 인프라, 문서·기록]\n측정·분석·개선: [내부심사, CAPA, PMS]",
      },
      {
        heading: "3. 절차 문서 목록",
        guidance: "QMS를 구성하는 절차(SOP) 상호참조.",
        placeholder: "QP-01 문서·기록 관리\nQP-02 CAPA\nQP-03 공급자 관리\nQP-04 불만 처리\n… (SOP 목록 계속)",
      },
      {
        heading: "4. IVDR 고유 요구 연계",
        guidance: "IVDR Art.10(8)이 요구하는 추가 프로세스 위치.",
        placeholder: "성능평가 SOP: [SOP-__]\nPMS/PSUR SOP: [SOP-__]\nUDI/EUDAMED SOP: [SOP-__]\nPRRC 역할: [직책/성명]",
      },
    ],
    certTests: [
      "ISO 13485:2016 gap 분석 — 현행 QMS 대비 미충족 조항 식별",
      "내부 심사 QMS 완전성 점검 — 품질매뉴얼 기술 내용과 실제 프로세스 일치 여부",
    ],
    requiredData: [
      "ISO 13485:2016 원문",
      "IVDR Art.10(8) 전문 (IVDR 고유 프로세스 연계용)",
      "현행 SOP 전체 목록 및 최신 버전 목록",
      "조직도 (PRRC 포함)",
      "QMS 범위 결정 근거 (7.3 설계·개발 적용 여부 판단 포함)",
      "이전 QMS 내부 심사 결과 (개정 시)",
    ],
    checklist: [
      "ISO 13485 4.2.2 필수 항목을 모두 포함했는가",
      "IVDR Art.10(8) 고유 프로세스를 연결했는가",
      "QMS 범위와 NB 심사 범위가 일치하는가",
      "모든 SOP가 최신 개정본으로 상호참조됐는가",
    ],
    relatedConceptSlugs: ["iso-13485", "mdsap", "prrc"],
    refs: ["ISO 13485:2016 4.2.2", "IVDR Art.10(8)"],
  },
  {
    id: "benefit-risk",
    stationId: 7,
    docTitle: "이익-위험 분석서 (Annex I 1)",
    purpose: "기기가 제공하는 임상적 이익이 잔여위험을 상회함을 증명해 GSPR 1조를 충족한다.",
    sections: [
      {
        heading: "1. 이익 요약",
        guidance: "의도된 목적에 따른 임상적 이익(진단 정확도·환자 관리 개선).",
        placeholder: "의도된 목적 기반 이익:\n- 민감도 [___]%로 [____] 조기 진단 가능\n- [____] 관리 결정 지원\n임상 이익 근거: [PER / 문헌]",
      },
      {
        heading: "2. 잔여위험 요약",
        guidance: "위험관리 파일의 잔여위험 종합.",
        placeholder: "잔여위험 수:\n- 허용 잔여위험: [____]\n- 모니터링 필요 위험: [____]\n참조: 위험관리 파일 [문서번호]",
      },
      {
        heading: "3. 이익-위험 비교 결론",
        guidance: "이익이 잔여위험을 상회함을 명시적으로 서술.",
        placeholder: "결론: 이익 [____] > 잔여위험 [____]\n근거: [____]\n조건: [____] (시판 후 추가 데이터 등)",
      },
      {
        heading: "4. 시판 후 업데이트 계획",
        guidance: "PMS 데이터로 이익-위험 결론을 갱신하는 주기.",
        placeholder: "갱신 주기: [____]\n갱신 트리거: [바이질런스 보고·PSUR]",
      },
    ],
    certTests: [
      "임상 성능 데이터 신뢰성 독립 검토 — PER에 기재된 민감도·특이도 근거 충분성 검증",
    ],
    requiredData: [
      "성능평가 보고서(PER) 최종본 — 임상 이익 정량화용",
      "위험관리 파일 잔여위험 목록 확정본",
      "임상적 이익 문헌 근거 (유사 기기 이익-위험 비교 선례)",
      "유사 기기 이익-위험 분석 공개 데이터 (NB 결정문·학술 문헌)",
      "GSPR Annex I §1 원문 (이익 > 위험 충족 요건)",
    ],
    checklist: [
      "GSPR 1조(이익 > 위험) 충족을 명시적으로 선언했는가",
      "이익 근거가 PER·임상 데이터에 연결됐는가",
      "잔여위험이 위험관리 파일과 일치하는가",
      "시판 후 갱신 계획이 PMS/PSUR와 연결됐는가",
    ],
    relatedConceptSlugs: ["iso-14971", "gspr", "pep-per"],
    refs: ["IVDR Annex I 1", "Annex II", "ISO 14971:2019"],
  },
  {
    id: "usability-file",
    stationId: 7,
    docTitle: "사용적합성 파일·보고서 (IEC 62366-1)",
    purpose: "비전문가(자가검사·근접검사) 사용 오류를 체계적으로 줄여 GSPR 요건을 충족한다.",
    sections: [
      {
        heading: "1. 사용 명세 (Use Specification)",
        guidance: "사용자·사용 환경·사용 인터페이스·기존 지식 분석.",
        placeholder: "사용자 프로파일: [비전문가 / 전문가 / 혼합]\n사용 환경: [가정 / 근접검사 / 실험실]\n사용 인터페이스 요소: [시각·청각·촉각]\n사용자 역량·한계: [____]",
      },
      {
        heading: "2. 위험 관련 사용 시나리오",
        guidance: "사용 오류가 위험을 초래할 수 있는 시나리오 식별.",
        placeholder: "시나리오 1: [검체 채취 오류] → 위험: [____] → 완화: [____]\n시나리오 2: [결과 오판독] → 위험: [____] → 완화: [____]",
      },
      {
        heading: "3. 형성 평가 (Formative)",
        guidance: "초기 UI/IFU 시제품 평가 결과.",
        placeholder: "평가 방법: [인지 워크스루 / 사용자 관찰]\n참가자 수: [____]\n주요 발견: [____]\n설계 개선: [____]",
      },
      {
        heading: "4. 총괄 평가 (Summative)",
        guidance: "최종 설계에 대한 사용자 시험 — 위험 관련 사용 오류 없음을 확인.",
        placeholder: "참가자 수: [____] (대표 사용자)\n시험 결과: 위험 관련 오류 [0 / 발견 조치]\n결론: 사용적합성 [수용 / 조건부]",
      },
    ],
    experiments: [
      "형성 평가 (Formative Evaluation) — 인지 워크스루 및 사용자 관찰, n≥5 (대표 사용자)",
      "총괄 평가 (Summative Evaluation) — 최종 설계·IFU로 대표 사용자 n≥15 시험, 위험 관련 오류 0건 목표",
      "위험 관련 사용 시나리오 시험 — 검체 채취 오류·판독 오류 등 주요 시나리오 별도 확인",
    ],
    certTests: [
      "IEC 62366-1:2015+A1:2020 적합성 독립 검토 — 사용적합성 파일 완성 후 외부 전문가 리뷰",
      "IVDR GSPR §13 자가검사 요건 충족 확인 — 자가검사 제품의 경우 규제기관 요건 대조",
    ],
    requiredData: [
      "사용 명세(Use Specification) 초안 — 사용자·환경·인터페이스 분석 자료",
      "위험관리 파일 사용 오류 관련 위험 목록",
      "IFU 시제품 (형성 평가용)",
      "라벨 시제품 (형성 평가용)",
      "사용자 프로파일 분석 결과 (비전문가 특성·기존 지식 수준)",
      "형성 평가 결과 보고서 (총괄 평가 입력용)",
    ],
    checklist: [
      "자가검사·근접검사 여부를 반영했는가 (IEC 62366 적용 여부)",
      "위험 관련 사용 시나리오가 ISO 14971과 연계됐는가",
      "총괄 평가에서 허용 불가 사용 오류가 없는가",
      "IFU·라벨 최종본에 평가 결과를 반영했는가",
    ],
    relatedConceptSlugs: ["iec-62366", "iso-14971", "gspr"],
    refs: ["IEC 62366-1:2015+A1:2020", "IVDR Annex I"],
  },
];

export const docByStationId = (id: number): DocTemplate | undefined =>
  documents.find((d) => d.stationId === id);

export const docById = (id: string): DocTemplate | undefined =>
  documents.find((d) => d.id === id);

/** 전용 템플릿이 없는 잎은 일반 템플릿을 자동 생성한다. */
function buildGenericDoc(leaf: DocLeaf, station: Station): DocTemplate {
  return {
    id: leaf.id,
    stationId: leaf.stationId,
    docTitle: leaf.title,
    purpose:
      leaf.note ??
      `${station.title} 단계의 산출 문서입니다. ${station.oneLine}`,
    rationale: rationaleFor(leaf.id),
    difficulty: metaFor(leaf.id)?.difficulty,
    importance: metaFor(leaf.id)?.importance,
    effort: effortFor(leaf.id),
    prepDocs: prepDocsFor(leaf.id),
    knowledge: knowledgeFor(leaf.id),
    prerequisites: leaf.prerequisites ?? [],
    sections: [
      {
        heading: "1. 목적 · 적용 범위",
        guidance: "이 문서의 목적과 대상 제품·적용 범위를 적는다.",
        placeholder: "목적: [____]\n적용 범위(제품·모델): [____]",
      },
      {
        heading: "2. 핵심 내용",
        guidance: "관련 요구사항에 따라 핵심 내용을 작성한다.",
        placeholder: "[____]",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적는다.",
        placeholder: leaf.refs.join("\n"),
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록한다.",
        placeholder: "작성: [__]\n검토: [__]\n승인: [__]\n일자: [__]",
      },
    ],
    checklist: [
      "관련 조항·표준 요구를 모두 반영했는가",
      "관련 문서와 상호 참조(추적)했는가",
      "작성·검토·승인 이력이 있는가",
    ],
    relatedConceptSlugs: [],
    refs: leaf.refs,
  };
}

/** id 로 문서 콘텐츠 해석 — 전용 템플릿 우선, 없으면 자동 생성. */
export function resolveDoc(id: string): DocTemplate | undefined {
  // IVDR 전용 상세 템플릿
  const leaf = leafById(id);
  const detailed = docById(id);
  if (detailed) {
    // 준비물·취지는 docTree(잎/맵)에서 단일 출처로 관리 → 전용 템플릿에도 주입
    const m = metaFor(id);
    return {
      ...detailed,
      rationale: rationaleFor(id),
      difficulty: m?.difficulty,
      importance: m?.importance,
      effort: effortFor(id),
      prepDocs: prepDocsFor(id),
      knowledge: knowledgeFor(id),
      prerequisites: leaf?.prerequisites ?? [],
    };
  }
  // IVDR 자동 생성 템플릿
  if (leaf) {
    const station = stations.find((s) => s.id === leaf.stationId);
    if (station) return buildGenericDoc(leaf, station);
  }
  // ISO 13485 상세 템플릿
  const isoDetailed = iso13485DocById(id);
  if (isoDetailed) return isoDetailed;
  // ISO 13485 자동 생성 템플릿
  const isoLeaf = iso13485LeafById(id);
  if (isoLeaf) {
    return {
      id: isoLeaf.id,
      stationId: isoLeaf.stationId,
      docTitle: isoLeaf.title,
      purpose: isoLeaf.note ?? `ISO 13485 Clause ${isoLeaf.refs.join("·")} 요건을 충족하는 문서입니다.`,
      sections: [
        {
          heading: "1. 내용",
          guidance: "ISO 13485 요구사항에 따라 작성한다.",
          placeholder: `[${isoLeaf.title} 내용을 여기에 작성하세요]`,
        },
      ],
      checklist: [`${isoLeaf.title} 내용이 ISO 13485 Clause ${isoLeaf.refs.join("·")} 요건을 충족한다`],
      relatedConceptSlugs: ["iso-13485"],
      refs: isoLeaf.refs.map((r) => `ISO 13485:2016 Clause ${r}`),
    };
  }
  return undefined;
}

/** 복사/.md 다운로드용 마크다운 생성. */
export function toMarkdown(t: DocTemplate): string {
  const lines: string[] = [];
  lines.push(`# ${t.docTitle}`);
  lines.push("");
  lines.push(`> 목적: ${t.purpose}`);
  lines.push(`> 관련 조항: ${t.refs.join(" · ")}`);
  if (t.difficulty && t.importance) {
    lines.push(`> 난이도: ${difficultyLabel[t.difficulty]} · 중요도: ${importanceLabel[t.importance]}`);
  }
  if (t.effort) {
    lines.push(`> 예상 소요(추정): ${t.effort.total} — 자료확보 ${t.effort.gather} · 맥락이해 ${t.effort.context} · 작성 ${t.effort.draft} · 검토 ${t.effort.review} · RA 피드백 ${t.effort.raRounds}회`);
  }
  lines.push("");
  if (t.rationale) {
    lines.push(`## 취지 — 왜 이 문서를 쓰는가`);
    lines.push(t.rationale);
    lines.push("");
  }
  if (t.prepDocs && t.prepDocs.length) {
    lines.push(`## 미리 만들어두면 좋은 문서`);
    for (const id of t.prepDocs) {
      const l = leafById(id);
      if (l) lines.push(`- ${l.title}`);
    }
    lines.push("");
  }
  if (t.knowledge && t.knowledge.length) {
    lines.push(`## 작성 전 알아야 할 것`);
    for (const k of t.knowledge) lines.push(`- [ ] ${k}`);
    lines.push("");
  }
  if (t.prerequisites && t.prerequisites.length) {
    lines.push(`## 작성 전 준비물`);
    for (const p of t.prerequisites) {
      lines.push(`- [ ] (${prereqKindLabel[p.kind]}) ${p.label}`);
    }
    lines.push("");
  }
  for (const s of t.sections) {
    lines.push(`## ${s.heading}`);
    lines.push(`<!-- ${s.guidance} -->`);
    lines.push("");
    lines.push(s.placeholder);
    lines.push("");
  }
  lines.push(`## 완료 체크리스트`);
  for (const c of t.checklist) lines.push(`- [ ] ${c}`);
  lines.push("");
  lines.push(
    `---\n_IVDR 여정 위키 생성 템플릿. 규제 사실은 최신 관보·NB 요건으로 재확인할 것. 본 문서는 정보 제공용이며 법적 자문이 아님._`,
  );
  return lines.join("\n");
}
