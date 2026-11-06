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
import { ivddDocById } from "./ivdd/documents";
import { mdsapDocById } from "./mdsap/documents";

export interface DocSection {
  heading: string;
  guidance: string; // 무엇을 어떻게 쓰는지 안내
  placeholder: string; // 채워넣기 예시/뼈대
}

export type CalcToolType = "sens-spec" | "sample-size" | "risk-matrix" | "lod-calc" | "mkt" | "regression";

export interface DocTemplate {
  id: string; // 고유 슬러그 (docTree 잎 id 와 일치)
  stationId: number; // 1..11
  docTitle: string;
  purpose: string; // 이 문서가 충족/증명하는 것 (무엇)
  rationale?: string; // 이 문서를 왜 쓰는가 (취지·근본 이유)
  intent?: string;  // 기획 의도 (이 문서를 시스템에 추가한 배경·설계 의도)
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
      "기기의 의도된 목적을 한 문단으로 확정해요. 그러면 이후 분류·성능·라벨링의 기준이 고정돼요.",
    rationale: "IVDR Art.10(1)과 {{annex-viii|Annex VIII}}은 의도된 목적을 명확히 정하라고 요구해요. 기기의 등급 결정(Annex VIII), 성능 요건, 라벨·IFU 내용, 적합성 평가 경로처럼 뒤따르는 모든 기술 결정의 기준이 돼요.",
    intent: "5요소(무엇·검체·사용자·환경·임상 결정)를 빠짐없이 적도록 틀을 짰어요. NB(인증기관)가 가장 먼저 확인하는 문서의 품질을 높이려고 설계했어요.",
    sections: [
      {
        heading: "1. 제품 식별",
        guidance: "제품명·모델·버전·제조자를 적어 주세요.",
        placeholder: "제품명: {{auto.productName}}\n모델/버전: {{auto.model}}\n제조자: {{auto.manufacturer}}",
      },
      {
        heading: "2. 의도된 목적 (5요소)",
        guidance:
          "무엇·검체·사용자·환경·결정을 한 문단으로 적어 주세요. 라벨/IFU와 정확히 같아야 해요.",
        placeholder:
          "{{auto.intendedPurpose}}\n\n[5요소]\n검체: {{auto.specimen}}\n측정 대상: {{auto.analyte}} — {{auto.resultKind}}\n사용자: {{auto.user}}\n사용 환경: {{auto.environment}}\n임상적 결정: {{auto.clinicalDecision}}\n대상 집단: {{auto.targetPopulation}}",
      },
      {
        heading: "3. IVD 해당성 판단",
        guidance: "IVDR Art.2 정의에 해당하는지 근거와 함께 적어 주세요.",
        placeholder: "Art.2 IVD 정의 해당 여부: {{auto.ivdJustification}}",
      },
      {
        heading: "4. 미사용 목적 (Out of scope)",
        guidance: "오용을 막도록, 의도하지 않은 용도를 적어 주세요.",
        placeholder: "본 기기는 {{auto.outOfScope}} 용도로는 사용하지 않는다.",
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
      "Annex VIII Rule 1~7을 적용해 등급을 정하고, 그 근거를 1장으로 남겨요. NB(인증기관)가 가장 먼저 보는 문서예요.",
    rationale: "IVDR {{annex-viii|Annex VIII}}에 따라 모든 IVD는 A~D 등급으로 분류해야 해요. 등급에 따라 {{notified-body|NB}} 개입 여부와 적합성 평가 경로가 달라져요. 이 문서가 있으면 분류 결정을 나중에도 추적할 수 있어요.",
    intent: "Rule 1~7을 차례로 검토하는 표를 넣어 분류 실수를 막아요. NB 사전 검토 때 신뢰도도 높아지도록 설계했어요.",
    sections: [
      {
        heading: "1. 의도된 목적 요약",
        guidance: "의도된 목적 정의서에서 핵심을 옮겨 와 주세요.",
        placeholder: "{{auto.intendedPurpose}}",
      },
      {
        heading: "2. Rule 적용 내역",
        guidance:
          "Rule 1~7을 순서대로 검토하고, 해당 여부·사유를 표로 적어 주세요. 둘 이상 해당하면 가장 높은 등급을 골라요.",
        placeholder:
          "{{auto.ruleTable}}",
      },
      {
        heading: "3. 최종 분류 및 근거",
        guidance: "결정한 등급과 결정적인 Rule을 적어 주세요.",
        placeholder: "최종 클래스: {{auto.cls}} (추천값 — 담당자 확정 필요)\n결정 Rule: {{auto.rule}}\n근거 요약: {{auto.rationale}}",
      },
      {
        heading: "4. 경로 영향",
        guidance: "분류에 따른 NB 개입과 전환 기한을 적어 주세요.",
        placeholder: "NB 개입: {{auto.nb}}\n전환 기한: [신규 제품은 해당 없음 / 레거시 기기면 IVDR Art.110 전환 기한 기재]",
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
      "자가검사면 Rule 4(a)(원칙 C, 예외 B)를, 근접검사면 Rule 4(b)(그 자체로 분류)를 반영했는가",
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
      "정해진 등급에 맞는 Annex IX~XI 경로를 확정하고, 필요한 산출물을 미리 정해 둬요.",
    rationale: "IVDR Annex IX(QMS 심사), Annex X(기술문서 심사), Annex XI(기술문서 심사)는 등급별로 다른 경로를 정해요. 경로 선택은 전체 일정과 비용에 바로 이어져요.",
    intent: "경로 선택이 일정·비용·NB 가용성에 주는 영향을 팀 모두가 이해하도록 했어요. 초기에 현실적인 일정을 세울 수 있게 설계했어요.",
    sections: [
      {
        heading: "1. 클래스 및 경로 선택",
        guidance: "등급에 맞는 Annex 경로(주로 IX, 또는 X+XI)를 적어 주세요.",
        placeholder: "클래스: {{auto.cls}}\n선택 경로:\n{{auto.route}}\n사유: {{auto.rationale}}",
      },
      {
        heading: "2. 산출물 체크리스트",
        guidance: "경로가 요구하는 문서를 나열하고, 담당과 기한을 정해 주세요.",
        placeholder:
          "- [ ] QMS 문서 — 담당 [__] 기한 [__]\n- [ ] 기술문서(Annex II/III) — [__]\n- [ ] 성능평가(PEP/PER) — [__]\n- [ ] 위험관리 파일 — [__]\n- [ ] DoC — [__]",
      },
      {
        heading: "3. NB 관여 범위",
        guidance: "심사 대상(QMS/기술문서 표본 등)을 적어 주세요.",
        placeholder: "NB 심사 대상: {{auto.nbScope}}",
      },
      {
        heading: "4. 인증 일정 로드맵",
        guidance: "제품 기획(/auto/start)에서 정한 시작일·목표 판매일과 항목별 기간으로 계산해요. 기간은 추정 범위예요. 회사 계획에 맞게 바꿔 주세요.",
        placeholder: "{{auto.roadmapTable}}",
      },
    ],
    certTests: [
      "NB scope 적합성 사전 확인 — NANDO에서 선정 NB가 해당 분류·제품군을 심사 가능한지 확인",
    ],
    requiredData: [
      "분류 근거서 확정본 (등급 결정)",
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
      "ISO 13485 QMS에 IVDR만의 프로세스를 연결해요. 인증서만으로는 부족한 부분을 메워요.",
    rationale: "IVDR Art.10(8)은 {{iso-13485|ISO 13485}} QMS를 바탕으로 하되, 성능평가·UDI·PMS 같은 IVDR만의 요건을 더 넣으라고 요구해요. NB는 QMS가 IVDR 요건과 어떻게 이어지는지 증거를 요청해요.",
    intent: "ISO 13485 조항과 IVDR 요건을 한눈에 맞대 볼 수 있는 표를 넣었어요. QMS를 고칠 범위는 최소로, 감사 준비 시간은 짧게 하도록 설계했어요.",
    sections: [
      {
        heading: "1. QMS 기준",
        guidance: "적용 표준과 인증 상태를 적어 주세요.",
        placeholder: "표준: ISO 13485:2016\n인증 상태/기관: [____]",
      },
      {
        heading: "2. IVDR 고유 프로세스 연계",
        guidance:
          "IVDR이 더 요구하는 프로세스를 절차서 번호에 연결해 주세요.",
        placeholder:
          "성능평가 → 절차 [SOP-__]\nPMS/PMPF → [SOP-__]\nPSUR → [SOP-__]\nUDI/EUDAMED 등록 → [SOP-__]\n시정·예방조치/바이질런스 → [SOP-__]",
      },
      {
        heading: "3. Art.10(8) 충족 근거",
        guidance: "QMS를 세우고, 문서로 만들고, 유지한 증빙과 그 시점을 적어 주세요.",
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
      "Annex II/III 목차를 폴더 구조로 만들어요. GSPR(Annex I, 일반 안전·성능 요구사항) 충족을 항목별로 추적해요.",
    rationale: "IVDR Annex II·III는 기술문서에 꼭 들어갈 구성을 정해요. 또 Annex I({{gspr|GSPR}}) 20개 조항(3개 장) 하나하나에 충족 증거를 요구해요. NB는 이 표로 증거가 빠진 곳을 찾아요.",
    intent: "기술문서를 쓰기 시작할 때 '어떤 증거가 어느 조항을 커버하는지' 전체 지도를 그려요. 뒤에 가서 증거가 빠지는 일을 미리 막도록 설계했어요.",
    sections: [
      {
        heading: "1. 기술문서 목차 (Annex II)",
        guidance: "Annex II 항목을 폴더로 만들고, 담당과 기한을 정해 주세요.",
        placeholder:
          "1. 기기 설명·의도된 목적 — [__]\n2. 라벨·IFU — [__]\n3. 설계·제조 정보 — [__]\n4. GSPR 충족 근거 — [__]\n5. 위험·이익 분석 — [__]\n6. 검증·밸리데이션(성능평가) — [__]",
      },
      {
        heading: "2. 시판 후 기술문서 (Annex III)",
        guidance: "PMS 계획·PSUR·PMPF가 있는 위치를 연결해 주세요.",
        placeholder: "PMS 계획: [위치]\nPSUR/PMS 보고서: [위치]\nPMPF 계획·보고서: [위치]",
      },
      {
        heading: "3. GSPR 체크리스트 (Annex I)",
        guidance: "조항별 적용 여부는 제품 정보로 1차 판정돼요. 충족 방법과 증거 위치를 채우고, 확인 필요 조항을 판정해 주세요.",
        placeholder:
          "{{auto.gsprTable}}",
      },
    ],
    experiments: [
      "GSPR 각 조항(§1~§20) 충족 방법 사전 매핑 워크숍 (R&D·RA 팀 공동)",
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
      "과학적·분석적·임상적 성능, 이 3단 증거를 어떻게 확보할지 먼저 설계해요(PER 전에).",
    rationale: "IVDR {{annex-xiii|Annex XIII}} Part A는 모든 IVD에 성능 평가를 요구해요. 계획 없이 성능 평가를 하면 통계가 타당한지, 참조 검사가 알맞은지 증명하기 어려워요. 그래서 NB 승인이 늦어져요.",
    intent: "분석적·임상적 성능 연구를 시작하기 전에 설계하도록 이끌어요. IRB 신청·검체 확보·통계 설계처럼 오래 걸리는 일을 일찍 찾을 수 있게 설계했어요.",
    sections: [
      {
        heading: "1. 과학적 타당성 (Scientific Validity)",
        guidance: "검사 대상이 목표 임상 상태와 관련 있다는 과학적 근거를 문헌·가이드라인으로 보여 주세요. (IVDR Annex XIII 1조)",
        placeholder: "분석물질: {{auto.analyte}} (Cut-off {{auto.cutoff}})\n임상 상태: [예: COVID-19 급성 감염]\n\n근거 문헌:\n1. [저자, 제목, 저널, 연도] — 핵심: [____]\n2. [____]\n\n공식 가이드라인:\n- [예: WHO Emergency Use Listing Procedure, 2021]\n- [예: CLSI EP27 또는 EP15]\n\n결론: [분석물질 ↔ 임상 상태 연관성 확립됨 / 추가 근거 필요]",
      },
      {
        heading: "2. 분석적 성능 연구 설계",
        guidance: "LoD(검출한계)·정밀도·정확도·특이성(교차반응)·안정성 연구를 설계해 주세요. (IVDR Annex XIII 2.1조)",
        placeholder: "{{auto.analyticalPlan}}\n\n{{auto.stabilityPlan}}",
      },
      {
        heading: "3. 임상적 성능 연구 설계",
        guidance: "민감도·특이도를 통계로 입증할 임상 연구를 설계해 주세요. MDCG 2025-5의 성능 연구 유형을 참고하세요.",
        placeholder: "{{auto.clinicalPlan}}\n\n참여 기관 수: [≥2개 기관 권장]\n통계 방법: 단측 신뢰하한 (Clopper-Pearson), 보조로 Wilson 95% 구간",
      },
      {
        heading: "4. 연구 일정 및 책임",
        guidance: "PEP → 데이터 수집 → PER 완성까지 일정과 담당을 정해 주세요.",
        placeholder: "{{auto.studySchedule}}\n\nPEP 완성: [____] — 담당: [____]\nPER 초안 완성: [____] — 담당: [____]\nNB 제출 예정: [____]",
      },
    ],
    experiments: [
      "검사 대상-임상 상태 연관성 선행 문헌 검색 (PubMed, MEDLINE — 최소 50편 스크리닝)",
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
      "ISO 14971 프로세스를 세우고, 위험-요구(GSPR)-성능을 양방향으로 추적해요.",
    rationale: "IVDR Annex I 1장(위험관리 시스템은 §3 — 원문 확인 필요)은 {{iso-14971|ISO 14971}} 기반 위험관리 시스템을 요구해요. 계획 없이 쓴 위험관리 파일은 위험 수용 기준과 통제 조치 검증이 일관되지 않아 NB 지적을 받아요.",
    intent: "위험 식별 → 평가 → 통제 → 잔여위험 수용의 전체 흐름을 시작 전에 계획하도록 안내해요. 성능·사용적합성 팀과 위험관리 팀이 데이터를 함께 쓸 수 있게 설계했어요.",
    sections: [
      {
        heading: "1. 위험관리 계획 (ISO 14971 Clause 4.4)",
        guidance: "범위·적용 표준·위험 수용 기준·검토 시점을 정해 주세요.",
        placeholder: "적용 표준: ISO 14971:2019 + IVDR Annex I\n범위: {{auto.productName}} ({{auto.model}}) — 설계부터 폐기까지 전 수명 주기\n\n위험 수용 기준 (P × S 행렬): [회사 위험 수용 기준 — 위험관리 절차서에서 정한 값. 가이드의 예시 행렬은 참고용]\n\n위험관리 팀: [이름/직책]\n검토 시점: [설계 단계별 / 시판 후 연간]",
      },
      {
        heading: "2. 위험 분석 — IVD 특유 위해요인",
        guidance: "IVD에 특화된 위해요인을 '위해요인→위험상황→위해' 형식으로 적어 주세요.",
        placeholder: "{{auto.hazardTable}}",
      },
      {
        heading: "3. GSPR↔위험↔성능 추적표",
        guidance: "GSPR 각 조항이 어떤 위험과 이어지고, 어떤 성능 증거로 충족되는지 연결해 주세요.",
        placeholder: "{{auto.riskGsprTrace}}",
      },
      {
        heading: "4. 사용적합성 연계 (IEC 62366 — 자가검사·근접검사 해당 시)",
        guidance: "자가검사나 근접검사 제품은 사용 오류 위험을 IEC 62366과 연계해야 해요.",
        placeholder: "{{auto.usabilityScope}}\n\nIEC 62366 요약 가용성 파일(SUM) 참조: [위치]",
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
      "scope(심사 범위)에 맞는 NB를 일찍 확보하고 신청 패키지를 준비해요. 심사 일정(슬롯)이 늦어지면 시장 진입이 막혀요.",
    rationale: "IVDR은 Class B(일부)·C·D 기기에 {{notified-body|NB}} 심사를 의무로 정해요(Annex IX~XI). NB 슬롯이 부족해 신청이 늦어지면 전환 기한을 넘길 수 있어요.",
    intent: "NB 선정 기준(scope·경험·슬롯 가용성)을 적고 신청 패키지 체크리스트를 넣었어요. 첫 신청에서 반려를 최소로 줄이도록 설계했어요.",
    sections: [
      {
        heading: "1. NB 후보 선정",
        guidance: "NANDO(EU 인증기관 목록)에서 내 scope를 다루는 NB를 찾아 주세요.",
        placeholder: "후보 NB(번호/scope): [____]\n접촉 담당·일자: [____]",
      },
      {
        heading: "2. 계약·일정",
        guidance: "서면계약과 심사 일정을 확보해 주세요.",
        placeholder: "서면계약 상태: [____]\n예상 심사 일정: [____]",
      },
      {
        heading: "3. 신청 패키지",
        guidance: "제출 문서 목록을 점검해 주세요.",
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
      "IVDR을 충족했다고 공식 선언해요. CE 부착의 법적 근거가 돼요.",
    rationale: "IVDR Art.17과 Annex IV는 제조자가 CE 마킹 전에 {{doc|DoC}}를 발행하고 최소 10년간 보관하도록 의무로 정해요. DoC는 CE 마킹의 법적 근거 문서예요.",
    intent: "Annex IV의 필수 기재 항목을 모두 담은 양식을 넣었어요. CE 마킹 직전에 서류가 빠져 늦어지는 일을 막도록 설계했어요.",
    sections: [
      {
        heading: "1. 제조자·대리인",
        guidance: "이름·주소·SRN(EUDAMED 등록번호)을 적어 주세요.",
        placeholder: "제조자: [____] / SRN: [____]\nEU 대리인(해당 시): [____]",
      },
      {
        heading: "2. 기기 식별",
        guidance: "제품명·모델·Basic UDI-DI를 적어 주세요.",
        placeholder: "제품명/모델: [____]\nBasic UDI-DI: [____]",
      },
      {
        heading: "3. 적합성 선언 내용",
        guidance: "분류·적용 규정·표준·NB 정보를 적어 주세요.",
        placeholder:
          "분류: [____]\n본 기기는 IVDR (EU) 2017/746을 충족함을 선언한다.\n적용 표준: [____]\nNB(해당 시) 번호·인증서: [____]",
      },
      {
        heading: "4. 서명",
        guidance: "서명권자·일자·장소를 적어 주세요.",
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
      "행위자 등록(SRN)→기기 등록→UDI 체계를 정리해, 합법적으로 출시하기 위한 요건을 채워요.",
    rationale: "IVDR Art.24~28과 Annex VI는 기기·행위자·{{udi|UDI}}를 {{eudamed|EUDAMED}}에 등록하도록 의무로 정해요. 등록 없이 EU 시장에 기기를 출시하면 Art.89~92의 제재를 받아요.",
    intent: "SRN 취득·UDI 발급·EUDAMED 모듈별 등록 절차를 단계별로 안내해요. 처음 등록하는 담당자도 빠짐없이 마칠 수 있게 설계했어요.",
    sections: [
      {
        heading: "1. 행위자 등록 (SRN)",
        guidance: "제조자/대리인/수입자 등록 정보를 적어 주세요.",
        placeholder: "행위자 유형: [____]\nSRN: [발급/대기]\n등록 담당·일자: [____]",
      },
      {
        heading: "2. UDI 체계",
        guidance: "Basic UDI-DI / UDI-DI / 캐리어를 적어 주세요.",
        placeholder:
          "Basic UDI-DI: [____]\nUDI-DI(모델별): [____]\n발행기관(GS1 등): [____]\n라벨 캐리어 형식: [____]",
      },
      {
        heading: "3. 기기 등록 데이터",
        guidance: "EUDAMED 기기 모듈에 넣을 항목을 적어 주세요.",
        placeholder: "기기명/분류/상태: [____]\n관련 인증서·DoC: [____]",
      },
      {
        heading: "4. 기한 점검",
        guidance: "의무화 시점과 레거시 마감을 적어 주세요.",
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
      "PMS(시판 후 감시)를 QMS에 넣고, PMS→성능→위험으로 되돌아가는 경로를 글로 정해요. 인증은 끝이 아니에요.",
    rationale: "IVDR Art.78~80은 제조자에게 체계적인 시판 후 감시 시스템을 요구해요. 계획 없이 PMS를 하면 PSUR·PMPF 때 데이터를 거슬러 모아야 해서 비효율이 생겨요.",
    intent: "출시 전에 고객 불만·문헌 감시·PMPF 프로토콜·PSUR 일정을 설계하도록 안내해요. PMS 운영 부담은 줄이고 데이터가 끊기지 않게 설계했어요.",
    sections: [
      {
        heading: "1. PMS 계획",
        guidance: "데이터 출처·수집 방법·주기·책임을 적어 주세요.",
        placeholder:
          "데이터 소스:\n① 고객 불만 (Complaint Log): [CRM/ERP 위치]\n② 바이질런스 보고 (EUDAMED): 심각 사고 15일 내, 추세 분석 분기별\n③ 문헌 감시: [PubMed 검색어·주기]\n④ 시장 피드백: [판매처·유통 피드백 채널]\n⑤ PMPF 데이터: [임상 성능 추적 연구]\n\n수집 주기: [월간 / 분기]\n분석·보고 주기: [분기 요약 + 연간 PSUR]\n책임자: [QA 담당자 이름/직책]",
      },
      {
        heading: "2. PMPF 계획",
        guidance: "시판 후 성능을 추적하는 방법(Annex XIII Part B)을 적어 주세요.",
        placeholder: "PMPF 활동: [____]\n주기/지표: [____]",
      },
      {
        heading: "3. PSUR 일정",
        guidance: "PSUR 주기는 Class C·D가 매년이에요.",
        placeholder: "PSUR 주기: [Class C·D 매년 / 기타 ____]\n최초 작성 예정: [____]",
      },
      {
        heading: "4. 환류 경로",
        guidance: "PMS→성능평가→위험관리를 갱신하는 계기(트리거)를 적어 주세요.",
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
    purpose: "기기의 물리적 특성·구성·작동 원리를 문서로 남겨요. 기술문서의 첫 항목을 완성해요.",
    rationale: "IVDR Annex II §1은 기기 설명, 기능 원리, BOM(부품 목록), 제조 방법을 기술문서에 넣도록 요구해요. NB는 이걸로 기기 설계의 전체 그림을 파악해요.",
    intent: "R&D 팀이 가진 기술 정보를 규제 문서 형식으로 옮기도록 안내해요. 기술문서를 처음 쓸 때의 진입 장벽을 낮추도록 설계했어요.",
    sections: [
      {
        heading: "1. 제품 식별",
        guidance: "제품명·모델·버전·제조자·SRN·Basic UDI-DI를 적어 주세요.",
        placeholder: "제품명: {{auto.productName}}\n모델/버전: {{auto.model}}\n제조자: {{auto.manufacturer}} / SRN: [____]\nBasic UDI-DI: {{auto.basicUdiDi}}",
      },
      {
        heading: "2. 기기 설명 및 의도된 목적",
        guidance: "의도된 목적 정의서에서 옮겨 와, 기기 유형과 작동 원리를 설명해 주세요.",
        placeholder: "기기 유형: {{auto.productType}}\n제품 형태: {{auto.formFactor}}\n주요 재질: {{auto.materials}}\n작동 원리:\n{{auto.principle}}\n의도된 목적(요약): {{auto.intendedPurpose}}",
      },
      {
        heading: "3. 구성 및 부품 목록",
        guidance: "시약·소모품·주요 부품·소프트웨어 버전을 적어 주세요. BOM을 참조해요.",
        placeholder: "구성품:\n{{auto.components}}\n참조 BOM: [문서번호/위치]",
      },
      {
        heading: "4. 기술 사양",
        guidance: "분석 범위·측정 단위·보관조건·환경 조건을 적어 주세요.",
        placeholder: "결과 형태: {{auto.resultKind}} · Cut-off: {{auto.cutoff}}\n검체 유형/부피: {{auto.specimen}} / [부피]\n보관 온도: {{auto.storage}} · 유효기간: {{auto.shelfLife}}\n사용 환경: {{auto.environment}}",
      },
      {
        heading: "5. 이전 세대·유사 기기",
        guidance: "기술 비교를 적어 주세요. 동등성 주장 또는 변경 내역을 적어요.",
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
    purpose: "IVDR Annex I 정보 요건을 충족하는 라벨·포장 사양을 확정해요. UDI·CE·NB 번호를 포함해요.",
    rationale: "IVDR Annex I §20은 제조자명·{{udi|UDI}}·CE 마킹·언어 요건 같은 라벨 기재 사항을 자세히 정해요. 라벨 오류는 출시 후에 고치면 비용이 커요.",
    intent: "출시 전 라벨 검토 체크리스트를 넣었어요. UDI 누락·심볼 오류·언어 미달 같은 흔한 문제를 최종 생산 전에 찾도록 설계했어요.",
    sections: [
      {
        heading: "1. 제조자·연락처",
        guidance: "제조자명·주소·웹·EU 대리인(해당 시)을 적어 주세요.",
        placeholder: "제조자: {{auto.manufacturer}}\n주소: [____]\nEU 대리인: {{auto.authRep}}",
      },
      {
        heading: "2. 기기 식별 정보",
        guidance: "제품명·모델·배치/로트·유효기간·보관을 적어 주세요.",
        placeholder: "제품명: {{auto.productName}} · 모델: {{auto.model}}\nLot/Ref: [____] · 유효기간: {{auto.shelfLife}}\nBasic UDI-DI: {{auto.basicUdiDi}} · UDI 캐리어 형식: [GS1 DataMatrix / 바코드]",
      },
      {
        heading: "3. 성능·용도 표시",
        guidance: "사용 목적(줄여서)·주의·사용 제한을 적어 주세요.",
        placeholder: "사용 목적(라벨 축약): {{auto.analyte}} {{auto.resultKind}} 검출 · {{auto.user}}\n보관 조건: {{auto.storage}}\n경고/주의:\n{{auto.labelWarnings}}\n\n심볼:\n{{auto.labelSymbols}}",
      },
      {
        heading: "4. CE 마킹 및 NB",
        guidance: "CE 마킹 위치와 NB 식별번호를 적어 주세요.",
        placeholder: "CE 마킹 위치: [____]\nNB 번호(해당 시): [____]\nAnnex V 크기 요건 준수: 예/아니오",
      },
      {
        heading: "5. 언어",
        guidance: "출시 국가별로 필요한 언어를 적어 주세요.",
        placeholder: "출시 시장: {{auto.markets}}\n표기 언어: [출시 회원국 공용어 — 자가검사 라벨·IFU는 해당국 언어 필수]",
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
    purpose: "사용자가 기기를 올바르고 안전하게 쓸 수 있도록 필수 정보를 모두 담아요.",
    rationale: "IVDR Annex I §20은 IFU(사용설명서) 기재 사항을, Art.7은 거짓·오해를 부르는 정보 금지를 정해요. 자가검사·근접검사 기기는 {{iec-62366|IEC 62366-1}} 사용적합성 평가를 IFU와 연계해야 해요.",
    intent: "비전문가 사용자도 이해할 수 있는 IFU 구조를 안내해요. 사용적합성 시험에서 찾은 사용 오류가 IFU에 반영되도록 작업 흐름을 설계했어요.",
    sections: [
      {
        heading: "1. 기기 식별 및 제조자",
        guidance: "제품명·모델·Basic UDI-DI·제조자 연락처를 적어 주세요.",
        placeholder: "제품명: {{auto.productName}} / Basic UDI-DI: {{auto.basicUdiDi}}\n제조자: {{auto.manufacturer}} / 연락처: [____]",
      },
      {
        heading: "2. 의도된 목적 및 적응증",
        guidance: "검출 대상·검체·사용자·환경·임상 결정을 분명하게 적어 주세요.",
        placeholder: "의도된 목적: {{auto.intendedPurpose}}\n대상 집단: {{auto.targetPopulation}}\n사용하면 안 되는 용도: {{auto.outOfScope}}\n금기 사항: [____]",
      },
      {
        heading: "3. 검사 원리",
        guidance: "측정 원리와 시약 반응을 짧게 적어 주세요.",
        placeholder: "{{auto.ifuPrinciple}}\n관련 간섭 물질: [분석 성능 시험 결과 참조]",
      },
      {
        heading: "4. 사용 방법 (단계별)",
        guidance: "검체 채취→보관→검사→결과 읽기를 순서대로 적어 주세요. 자가검사는 그림을 넣는 걸 권해요.",
        placeholder: "검체: {{auto.specimen}}\n검사 절차:\n{{auto.ifuSteps}}\n\n결과 판독:\n{{auto.ifuReading}}",
      },
      {
        heading: "5. 성능 특성 요약",
        guidance: "민감도·특이도·정밀도 같은 핵심 성능 지표를 적어 주세요.",
        placeholder: "민감도: [실험 후 입력 — 목표 {{auto.targetSe}}]  특이도: [실험 후 입력 — 목표 {{auto.targetSp}}]\nCut-off: {{auto.cutoff}}\n재현성: [실험 후 입력]",
      },
      {
        heading: "6. 한계·주의·경고",
        guidance: "결과의 한계·오용 방지 경고·보관 조건을 적어 주세요.",
        placeholder: "결과의 한계:\n{{auto.ifuLimitations}}\n\n보관: {{auto.storage}} / 유효기간: {{auto.shelfLife}}\n개봉 후: {{auto.openedStability}}\n\n경고:\n{{auto.ifuWarnings}}",
      },
      {
        heading: "7. 심볼 범례",
        guidance: "라벨에 쓴 ISO 15223-1 심볼을 설명해 주세요.",
        placeholder: "{{auto.labelSymbols}}",
      },
    ],
    experiments: [
      "비전문가 독해성 테스트 — 대표 사용자 n≥5가 IFU를 읽고 올바르게 검사 수행하는지 관찰",
      "사용 절차 관찰 시험 — 검체 채취·검사·결과 읽기 단계별 오류 발생 여부 기록 (사전 형성 평가)",
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
    purpose: "위험 분석→평가→통제→잔여위험 평가의 모든 이력을 파일로 유지하고, 결론을 보고서로 마무리해요.",
    rationale: "IVDR Annex I §8과 {{iso-14971|ISO 14971:2019}}는 제품 수명주기 전체에 걸친 위험관리 활동 결과물을 파일로 유지하도록 요구해요. NB는 이 파일로 잔여위험이 수용 기준 안에 있는지 검증해요.",
    intent: "위험 식별부터 잔여위험 수용까지를 한 파일에서 추적할 수 있게 짰어요. NB 심사 때 증거를 빨리 보여 줄 수 있도록 설계했어요.",
    sections: [
      {
        heading: "1. 파일 구조 및 색인",
        guidance: "위험관리 계획·분석·통제·잔여위험·검토 문서 목록을 적어 주세요.",
        placeholder: "위험관리 계획: [문서번호]\n위험 분석·통제 테이블: [____]\n잔여위험 평가 결과: [____]\nGSPR↔위험 추적표: [____]",
      },
      {
        heading: "2. 잔여위험 종합 평가",
        guidance: "통제 뒤 잔여위험 총량이 수용 기준 안에 있는지 확인해 주세요.",
        placeholder: "잔여위험 합산: [____]\n수용 기준 대비: [____]\n이익-위험 결론: [____]",
      },
      {
        heading: "3. 위험관리 검토 (Production 단계)",
        guidance: "생산·시판 후 정보를 검토해 새로운 위험이 없음을 확인해 주세요.",
        placeholder: "검토 일자: [____]\n신규 위험 발견: 없음 / [____]\n조치: [____]",
      },
      {
        heading: "4. 시판 후 환류",
        guidance: "PMS 데이터가 위험 재평가로 이어지게 연결해 주세요.",
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
    calcTools: ["risk-matrix"],
  },
  {
    id: "performance-eval-report",
    stationId: 6,
    docTitle: "성능평가 보고서 (PER, Annex XIII)",
    purpose: "PEP에서 설계한 3단 증거(과학·분석·임상)를 모아 성능 결론을 확정하고 평가를 마무리해요.",
    rationale: "IVDR {{annex-xiii|Annex XIII}} Part B는 성능 평가의 모든 결과(분석적·임상적 성능, 과학적 타당성)를 보고서로 쓰도록 요구해요. Class C·D는 NB가 PER을 심사해요.",
    intent: "LoD·정밀도·정확도·임상 Se/Sp(민감도/특이도) 같은 필수 분석 항목과 통계 방법을 미리 정해 뒀어요. 데이터를 모은 뒤 보고서를 빨리 쓸 수 있도록 설계했어요.",
    sections: [
      {
        heading: "1. 과학적 타당성 결론",
        guidance: "검사 대상과 임상 상태가 연관된다는 근거를 요약해 주세요.",
        placeholder: "분석물질: [____]\n임상상태: [____]\n근거(문헌 수·수준): [____]\n결론: 과학적 타당성 [확립/불충분]",
      },
      {
        heading: "2. 분석적 성능 결론",
        guidance: "정밀도·정확도·검출한계·특이성 결과를 요약해 주세요.",
        placeholder: "정밀도(CV%): [____] → 수용 기준: [____]\n정확도: [____]\n검출한계(LoD): [____]\n교차반응: [____]\n결론: [충족 / 미충족 — 조치]",
      },
      {
        heading: "3. 임상적 성능 결론",
        guidance: "민감도·특이도·검체·기준 방법을 요약해 주세요.",
        placeholder: "민감도: [___]% (95% CI: [___~___])\n특이도: [___]%\n검체 수/출처: [____]\n기준 방법: [____]\n결론: [임상 성능 충족]",
      },
      {
        heading: "4. 종합 결론 및 잔여 성능 불확도",
        guidance: "3단 결론을 하나로 묶어 이익-위험 결론과 연결해 주세요.",
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
    calcTools: ["sens-spec", "sample-size", "lod-calc", "regression"],
  },
  {
    id: "quality-manual",
    stationId: 4,
    docTitle: "품질매뉴얼 (ISO 13485 4.2.2)",
    purpose: "QMS 범위·적용 제외·프로세스 상호작용을 선언해요. 인증기관과 고객에게 QMS 체계를 한 권으로 보여 줘요.",
    rationale: "{{iso-13485|ISO 13485}}:2016 Clause 4.2.2와 IVDR Art.10(8)은 QMS 범위와 상호작용을 적은 품질매뉴얼을 요구해요. ISO 13485 인증 심사에서 핵심으로 검토하는 문서예요.",
    intent: "IVDR만의 프로세스(성능평가·UDI·PMS)가 기존 ISO 13485 품질매뉴얼에 들어가도록 안내해요. 따로 문서를 만들지 않고 하나의 QMS 체계를 유지하도록 설계했어요.",
    sections: [
      {
        heading: "1. 회사 및 QMS 범위",
        guidance: "제조자명·사업장·IVDR 적용 제품 범위·ISO 13485 적용 제외 항목을 적어 주세요.",
        placeholder: "회사명: [____] / 주소: [____]\nQMS 적용 범위: [____]\n적용 제외(ISO 13485): [없음 / 7.x — 사유: ____]",
      },
      {
        heading: "2. 프로세스 맵",
        guidance: "핵심 프로세스와 상호작용(경영→실현→지원·측정)을 적어 주세요.",
        placeholder: "경영 프로세스: [경영검토, 품질방침, 목표]\n제품실현 프로세스: [설계, 구매, 생산, 검사]\n지원 프로세스: [HR, 인프라, 문서·기록]\n측정·분석·개선: [내부심사, CAPA, PMS]",
      },
      {
        heading: "3. 절차 문서 목록",
        guidance: "QMS를 이루는 절차(SOP)를 서로 참조하게 적어 주세요.",
        placeholder: "QP-01 문서·기록 관리\nQP-02 CAPA\nQP-03 공급자 관리\nQP-04 불만 처리\n… (SOP 목록 계속)",
      },
      {
        heading: "4. IVDR 고유 요구 연계",
        guidance: "IVDR Art.10(8)이 요구하는 추가 프로세스의 위치를 적어 주세요.",
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
    purpose: "기기가 주는 임상적 이익이 잔여위험보다 크다는 것을 증명해 GSPR 1조를 충족해요.",
    rationale: "IVDR Annex I §1은 기기의 임상적 이익이 잔여 위험보다 커야 CE 마킹을 할 수 있다고 정해요. NB는 DoC 발행 전에 이 분석이 타당한지 검토해요.",
    intent: "임상 이익의 정량 근거(Se/Sp 데이터)와 잔여위험 목록을 이어 줘요. 이익 > 위험임을 논리적으로 증명하는 구조를 주도록 설계했어요.",
    sections: [
      {
        heading: "1. 이익 요약",
        guidance: "의도된 목적에 따른 임상적 이익(진단 정확도·환자 관리 개선)을 적어 주세요.",
        placeholder: "의도된 목적 기반 이익:\n- 민감도 [___]%로 [____] 조기 진단 가능\n- [____] 관리 결정 지원\n임상 이익 근거: [PER / 문헌]",
      },
      {
        heading: "2. 잔여위험 요약",
        guidance: "위험관리 파일의 잔여위험을 모아 적어 주세요.",
        placeholder: "잔여위험 수:\n- 허용 잔여위험: [____]\n- 모니터링 필요 위험: [____]\n참조: 위험관리 파일 [문서번호]",
      },
      {
        heading: "3. 이익-위험 비교 결론",
        guidance: "이익이 잔여위험보다 크다는 것을 분명하게 적어 주세요.",
        placeholder: "결론: 이익 [____] > 잔여위험 [____]\n근거: [____]\n조건: [____] (시판 후 추가 데이터 등)",
      },
      {
        heading: "4. 시판 후 업데이트 계획",
        guidance: "PMS 데이터로 이익-위험 결론을 갱신하는 주기를 적어 주세요.",
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
    calcTools: ["sens-spec"],
  },
  {
    id: "usability-file",
    stationId: 7,
    docTitle: "사용적합성 파일·보고서 (IEC 62366-1)",
    purpose: "비전문가(자가검사·근접검사)의 사용 오류를 체계적으로 줄여 GSPR 요건을 충족해요.",
    rationale: "IVDR GSPR §13과 {{iec-62366|IEC 62366-1}}은 자가검사·근접검사 기기에서 사용 오류로 생기는 위험을 최소화하는 설계와, 그 검증 과정을 기록하도록 요구해요.",
    intent: "사용 오류 관련 위험을 IFU·라벨 개선으로 통제하는 순환을 문서로 남겨요. 형성 평가 → 설계 개선 → 총괄 평가를 추적할 수 있도록 설계했어요.",
    sections: [
      {
        heading: "1. 사용 명세 (Use Specification)",
        guidance: "사용자·사용 환경·사용 인터페이스·기존 지식을 분석해 주세요.",
        placeholder: "사용자 프로파일: {{auto.user}} — 대상 집단: {{auto.targetPopulation}}\n사용 환경: {{auto.environment}}\n사용 인터페이스 요소: {{auto.readout}} · 검체 {{auto.specimen}}\n사용자 역량·한계: [____]",
      },
      {
        heading: "2. 위험 관련 사용 시나리오",
        guidance: "사용 오류가 위험을 일으킬 수 있는 상황(시나리오)을 찾아 주세요.",
        placeholder: "시나리오 1: [검체 채취 오류] → 위험: [____] → 완화: [____]\n시나리오 2: [결과 오판독] → 위험: [____] → 완화: [____]",
      },
      {
        heading: "3. 형성 평가 (Formative)",
        guidance: "초기 UI/IFU 시제품 평가 결과를 적어 주세요.",
        placeholder: "평가 방법: [인지 워크스루 / 사용자 관찰]\n참가자 수: [____]\n주요 발견: [____]\n설계 개선: [____]",
      },
      {
        heading: "4. 총괄 평가 (Summative)",
        guidance: "최종 설계로 사용자 시험을 해요. 위험 관련 사용 오류가 없음을 확인해 주세요.",
        placeholder: "참가자 수: [____] (대표 사용자)\n시험 결과: 위험 관련 오류 [0 / 발견 조치]\n결론: 사용적합성 [수용 / 조건부]",
      },
    ],
    experiments: [
      "형성 평가 (Formative Evaluation) — 인지 워크스루 및 사용자 관찰, n≥5 (대표 사용자)",
      "총괄 평가 (Summative Evaluation) — 최종 설계·IFU로 대표 사용자 n≥15 시험, 위험 관련 오류 0건 목표",
      "위험 관련 사용 시나리오 시험 — 검체 채취 오류·결과 읽기 오류 등 주요 시나리오 별도 확인",
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
  {
    // 섹션 1~4는 자동 생성(generic) 템플릿과 같은 순서 — 이미 저장된 초안의 섹션 순번을 지키기 위해. 새 섹션은 뒤에만 붙인다.
    id: "analytical-performance",
    stationId: 6,
    docTitle: "분석적 성능 보고서",
    purpose: "분석적 성능(cut-off 특성·정밀도·교차반응·간섭·후크 효과·검체 안정성)을 입증해요 (IVDR Annex XIII 1.2.2).",
    intent: "제품 정보로 실험계획(설계·시료·판정 기준)을 자동으로 채워요. 규격 원문 값과 합격 수치는 원문과 사람의 결정으로 남기도록 설계했어요.",
    sections: [
      {
        heading: "1. 목적 · 적용 범위",
        guidance: "이 문서의 목적과 대상 제품·적용 범위를 적어 주세요.",
        placeholder: "목적: 분석적 성능(cut-off 특성·정밀도·교차반응·간섭·후크 효과·검체 안정성)을 입증한다 (IVDR Annex XIII 1.2.2).\n적용 범위(제품·모델): {{auto.productName}} ({{auto.model}}) — {{auto.analyte}}, 검체 {{auto.specimen}}, {{auto.resultKind}}",
      },
      {
        heading: "2. 실험 설계",
        guidance: "실험별 목적·설계·시료를 적어 주세요. 반복 수·시험 농도는 CLSI 원문 표의 값을 옮기고 출처를 적어 주세요.",
        placeholder: "{{auto.analyticalPlan}}",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적어 주세요.",
        placeholder: "IVDR Annex I §9.1 — 성능 특성\nIVDR Annex XIII 1.2.2 — 분석적 성능\nCLSI EP12 · EP07 · EP37\n연결 문서: 성능평가 계획(PEP), 성능평가 보고서(PER), 위험관리 파일",
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록해 주세요.",
        placeholder: "작성: [__]\n검토: [__]\n승인: [__]\n일자: [__]",
      },
      {
        heading: "5. 판정 기준",
        guidance: "시험 전에 판정 기준을 확정해 주세요. 수치는 위험관리·성능 목표에서 가져오고 근거를 적어 주세요.",
        placeholder: "{{auto.analyticalAcceptance}}",
      },
      {
        heading: "6. 결과",
        guidance: "실험별 결과를 원자료와 함께 적어 주세요.",
        placeholder: "{{auto.analyticalResults}}",
      },
      {
        heading: "7. 결론",
        guidance: "판정 기준 충족 여부와, IFU·라벨에 적을 성능 주장을 정리해 주세요.",
        placeholder: "판정 기준 충족: [실험 후 입력]\nIFU 성능 주장: [실험 후 입력]",
      },
    ],
    experiments: [
      "Cut-off 특성(C5–C95)·정밀도 — CLSI EP12",
      "교차반응 — 구조 유사 물질",
      "간섭 물질 — CLSI EP07·EP37",
      "고농도 후크 효과",
      "검체 안정성",
    ],
    requiredData: [
      "국제표준물질(WHO IS 등)과 추적성 기록",
      "교차반응·간섭 후보 물질 목록(검토 완료본)",
      "로트별 시험 원자료",
    ],
    checklist: [
      "반복 수·시험 농도의 원문 출처를 적었는가",
      "판정 기준을 시험 전에 확정했는가",
      "로트 간 차이를 평가했는가",
      "교차반응·간섭 후보 목록을 검토했는가",
      "결과를 IFU 성능 주장과 맞췄는가",
    ],
    relatedConceptSlugs: ["annex-xiii", "pep-per", "gspr"],
    refs: ["IVDR Annex XIII 1.2.2", "IVDR Annex I §9.1", "CLSI EP12", "CLSI EP07", "CLSI EP37"],
    calcTools: ["lod-calc", "regression"],
  },
  {
    // 섹션 1~4는 자동 생성(generic) 템플릿과 같은 순서 — 이미 저장된 초안의 섹션 순번을 지키기 위해. 새 섹션은 뒤에만 붙인다.
    id: "clinical-performance",
    stationId: 6,
    docTitle: "임상적 성능 보고서",
    purpose: "의도된 사용자·사용 조건에서 기준 방법과 비교한 임상 성능(민감도·특이도)을 입증해요 (IVDR Annex XIII 1.2.3).",
    intent: "제품 정보로 실험계획(설계·시료·판정 기준)을 자동으로 채워요. 규격 원문 값과 합격 수치는 원문과 사람의 결정으로 남기도록 설계했어요.",
    sections: [
      {
        heading: "1. 목적 · 적용 범위",
        guidance: "이 문서의 목적과 대상 제품·적용 범위를 적어 주세요.",
        placeholder: "목적: 의도된 사용자·사용 조건에서 기준 방법 대비 임상 성능(민감도·특이도)을 입증한다 (IVDR Annex XIII 1.2.3).\n적용 범위(제품·모델): {{auto.productName}} ({{auto.model}}) — {{auto.analyte}}, 검체 {{auto.specimen}}, {{auto.resultKind}}",
      },
      {
        heading: "2. 연구 설계",
        guidance: "대상 집단·기준 방법·맹검·표본수 근거를 적어 주세요.",
        placeholder: "{{auto.clinicalPlan}}",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적어 주세요.",
        placeholder: "IVDR Annex XIII 1.2.3 — 임상적 성능\nMDCG 2025-5 — 성능 연구\nISO 20916 — 성능 연구 GSP\n연결 문서: 성능평가 계획(PEP), 사용적합성 파일",
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록해 주세요.",
        placeholder: "작성: [__]\n검토: [__]\n승인: [__]\n일자: [__]",
      },
      {
        heading: "5. 표본수 근거",
        guidance: "목표 성능을 신뢰하한으로 입증하는 표본수 계산과, 허용 오판정 수를 적어 주세요.",
        placeholder: "{{auto.sampleSize}}",
      },
      {
        heading: "6. 판정 기준",
        guidance: "시험 전에 판정 기준을 확정해 주세요.",
        placeholder: "{{auto.clinicalAcceptance}}",
      },
      {
        heading: "7. 결과 · 결론",
        guidance: "2×2 표, 민감도·특이도와 신뢰구간, 무효 결과를 적어 주세요.",
        placeholder: "{{auto.clinicalResults}}",
      },
    ],
    experiments: [
      "임상 성능 — 기준 방법 대비 일치도 (일반인 사용 시 일반인이 직접 검사하고 결과를 읽음)",
    ],
    requiredData: [
      "윤리위원회(IRB) 승인서",
      "참여 기관·기준 방법 시험기관 계약",
      "통계 분석 계획",
    ],
    checklist: [
      "대상 집단이 의도된 목적과 일치하는가",
      "기준 방법이 적합하고 맹검을 지켰는가",
      "표본수 근거(신뢰하한)를 적었는가",
      "판정 기준을 시험 전에 확정했는가",
      "무효 결과를 보고했는가",
    ],
    relatedConceptSlugs: ["annex-xiii", "pep-per", "intended-purpose"],
    refs: ["IVDR Annex XIII 1.2.3", "MDCG 2025-5", "ISO 20916"],
    calcTools: ["sens-spec", "sample-size"],
  },
  {
    // 섹션 1~4는 자동 생성(generic) 템플릿과 같은 순서 — 이미 저장된 초안의 섹션 순번을 지키기 위해. 새 섹션은 뒤에만 붙인다.
    id: "stability-study",
    stationId: 6,
    docTitle: "안정성 시험 계획·보고서",
    purpose: "표시한 유효기간·개봉 후 사용 시한·운송 안정성을 입증해요 (EN ISO 23640).",
    intent: "제품 정보로 실험계획(설계·시료·판정 기준)을 자동으로 채워요. 규격 원문 값과 합격 수치는 원문과 사람의 결정으로 남기도록 설계했어요.",
    sections: [
      {
        heading: "1. 목적 · 적용 범위",
        guidance: "이 문서의 목적과 대상 제품·적용 범위를 적어 주세요.",
        placeholder: "목적: 표시 유효기간·개봉 후 사용 시한·운송 안정성을 입증한다 (EN ISO 23640).\n적용 범위(제품·모델): {{auto.productName}} ({{auto.model}}) — {{auto.analyte}}, 검체 {{auto.specimen}}, {{auto.resultKind}}",
      },
      {
        heading: "2. 실험 설계",
        guidance: "온도 조건·시점·로트·시험 방법을 적어 주세요.",
        placeholder: "보관 조건: {{auto.storage}} · 목표 유효기간: {{auto.shelfLife}}\n\n{{auto.stabilityPlan}}",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적어 주세요.",
        placeholder: "EN ISO 23640 — IVD 시약 안정성 평가\nIVDR Annex II 6.2 — 안정성 데이터\n연결 문서: 라벨 사양, IFU, 운송 밸리데이션",
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록해 주세요.",
        placeholder: "작성: [__]\n검토: [__]\n승인: [__]\n일자: [__]",
      },
      {
        heading: "5. 결과",
        guidance: "시점별 결과를 적어 주세요.",
        placeholder: "{{auto.stabilityResults}}",
      },
      {
        heading: "6. 결론 · 라벨 반영",
        guidance: "입증된 유효기간·보관 조건·개봉 후 시한을 라벨·IFU에 반영해 주세요.",
        placeholder: "{{auto.stabilityConclusion}}\n라벨·IFU 반영: [실험 후 입력]",
      },
    ],
    experiments: [
      "실시간 안정성 — 보관 범위 양 끝 온도",
      "가속 안정성 (잠정 근거)",
      "개봉 후 안정성",
      "운송 안정성",
    ],
    requiredData: [
      "설계 확정 로트",
      "안정성 챔버 온도 기록",
      "시점별 시험 원자료",
    ],
    checklist: [
      "보관 범위 양 끝 온도를 모두 시험했는가",
      "가속 결과를 실시간 결과로 확정했는가",
      "라벨 유효기간이 입증 기간을 넘지 않는가",
      "개봉 후 시한 근거가 있는가",
    ],
    relatedConceptSlugs: ["ifu", "pep-per"],
    refs: ["EN ISO 23640", "IVDR Annex II 6.2"],
    calcTools: ["mkt"],
  },
  {
    // 섹션 1~4는 자동 생성(generic) 템플릿과 같은 순서 — 이미 저장된 초안의 섹션 순번을 지키기 위해. 새 섹션은 뒤에만 붙인다.
    id: "sw-validation",
    stationId: 5,
    docTitle: "소프트웨어 검증·밸리데이션 (IEC 62304)",
    purpose: "펌웨어·앱처럼 결과에 관여하는 소프트웨어를 IEC 62304 수명주기로 입증해요. 요구사항대로 동작하는지(검증), 의도된 사용자·환경에서 의도된 목적을 달성하는지(밸리데이션) 보여 줘요 (IVDR Annex I 16).",
    intent: "IEC 62304 활동을 안전 등급별로 빠짐없이 기록하도록 섹션을 수명주기 순서로 나눴어요. 제품 정보의 결과 읽기 방식·앱·MDSW 여부와 IVDR 등급을 자동으로 채우도록 설계했어요.",
    sections: [
      {
        heading: "1. 목적 · 적용 범위",
        guidance: "대상 소프트웨어(펌웨어·앱·서버)와 버전, 제품과의 관계를 적어 주세요. 검증은 '요구사항대로 만들었는가', 밸리데이션은 '사용자에게 맞는 것을 만들었는가'예요.",
        placeholder: "대상 제품: {{auto.productName}} ({{auto.model}})\n소프트웨어 구성: {{auto.swScope}}\n소프트웨어 이름·버전: [____]\n실행 환경(MCU·OS·지원 스마트폰 OS 버전): [____]",
      },
      {
        heading: "2. 소프트웨어 안전 등급 · 수명주기 계획",
        guidance: "IEC 62304 §4.3 안전 등급(A·B·C)을 정하고, 등급별로 필요한 활동과 산출물을 계획해 주세요. 등급은 외부 위험 통제를 고려한 뒤, 소프트웨어 고장이 일으킬 수 있는 위해의 심각도로 정해요. 개발 계획(§5.1)에 표준·도구·형상관리·문제 해결 방법을 적어 주세요.",
        placeholder: "안전 등급: [A / B / C] — 근거: 소프트웨어 고장 → 위험 상황 [예: 음성을 양성으로 표시] → 위해 [____], 외부 위험 통제 [____]\n등급별 활동: 요구사항·아키텍처·시스템 시험(전 등급) / 상세 설계·단위 검증(B·C) / [____]\n개발 계획 문서 번호: [____] · 코딩 표준: [____] · 개발 도구·컴파일러 버전: [____]",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적어 주세요.",
        placeholder: "IVDR Annex I 16 — 전자 프로그래머블 시스템·소프트웨어\nIVDR Annex VIII 1.4 — 소프트웨어 분류 규칙\nIEC 62304:2006+A1:2015 — 의료기기 소프트웨어 수명주기\nIEC 82304-1 — 독립형 헬스 소프트웨어 (앱 단독 제공 시)\nIEC 62366-1 — 사용적합성 / ISO 14971 — 위험관리\nMDCG 2019-11 — 소프트웨어 해당성·분류 / MDCG 2019-16 — 사이버보안\n연결 문서: 설계 입력, 위험관리 파일, 사용적합성 파일, 사이버보안 문서",
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록해 주세요.",
        placeholder: "작성: [__]\n검토: [__]\n승인: [__]\n일자: [__]",
      },
      {
        heading: "5. 소프트웨어 요구사항 (IEC 62304 §5.2)",
        guidance: "기능·성능·인터페이스·경보·보안·사용성·IFU 관련 요구사항에 ID를 붙여 적고, 위험 통제 요구사항은 따로 표시해 주세요. 요구사항마다 시험으로 확인할 수 있게 써 주세요.",
        placeholder: "| ID | 요구사항 | 출처(설계 입력·위험 통제) | 검증 방법 |\n|---|---|---|---|\n| SRS-01 | 결과창 신호를 판독해 양성·음성·무효를 표시한다 | DI-[__] | 시스템 시험 |\n| SRS-02 | 판독 시간 [__]분 이전에는 결과를 표시하지 않는다 | RC-[__] | 시스템 시험 |\n| SRS-03 | 무효(대조선 없음) 시 재검사를 안내한다 | RC-[__] | 시스템 시험 |\n| SRS-[__] | [____] | [____] | [____] |",
      },
      {
        heading: "6. 아키텍처 · 상세 설계 · SOUP (§5.3–5.4)",
        guidance: "소프트웨어 항목 구조와 인터페이스, 위험 통제를 맡는 항목의 분리를 적어 주세요. SOUP(외부 라이브러리·OS)는 이름·버전·용도·알려진 결함 검토 결과를 표로 남겨요. B·C 등급은 상세 설계까지 적어요.",
        placeholder: "아키텍처 개요(항목·인터페이스): [그림·문서 번호]\n위험 통제 항목 분리: [____]\n\n| SOUP | 버전 | 용도 | 기능·성능 요구 | 알려진 결함 검토 |\n|---|---|---|---|---|\n| [예: RTOS] | [__] | [__] | [__] | [검토일·결론] |\n| [예: 이미지 처리 라이브러리] | [__] | [__] | [__] | [__] |",
      },
      {
        heading: "7. 검증 — 단위 · 통합 · 시스템 시험 (§5.5–5.7)",
        guidance: "시험 계획과 판정 기준을 먼저 정해요. 요구사항↔시험 추적표로 빠짐없이 시험했음을 보여 주세요. 결과 읽기 알고리즘은 기준 결과 읽기(전문가·기준 방법)와 비교한 성능 시험을 분석적 성능과 연결해요. 결함은 문제 해결 절차로 기록해요.",
        placeholder: "단위 검증(B·C): 방법 [정적 분석·코드 리뷰·단위 시험] · 판정 기준 [____]\n통합 시험: [____]\n시스템 시험: 요구사항 SRS-01~[__] 전부 — 결과 [실험 후 입력]\n판독 알고리즘 성능: 기준 판독 대비 일치율 [사양: 기준 % — 사람이 정함] — 결과 [실험 후 입력]\n회귀 시험 범위(변경 시): [____]",
      },
      {
        heading: "8. 밸리데이션 (설계 밸리데이션)",
        guidance: "최종 소프트웨어를 실제 사용자·사용 환경에서 써서 의도된 목적을 달성함을 확인해 주세요. 사용적합성 총괄 평가와 임상 성능 연구(앱·리더기 결과 읽기 포함)를 근거로 연결해요.",
        placeholder: "의도된 목적: {{auto.intendedPurpose}}\n사용자·환경: {{auto.user}} · {{auto.environment}}\n밸리데이션 근거: 사용적합성 총괄 평가 [문서 번호] · 임상 성능 연구(소프트웨어 판독 포함) [문서 번호]\n결론: [실험 후 입력]",
      },
      {
        heading: "9. 소프트웨어 위험관리 (§7 · ISO 14971)",
        guidance: "소프트웨어가 원인이 될 수 있는 위험 상황(잘못된 결과 읽기·표시 오류·데이터 손실·보안 침해)과 통제, 통제의 검증을 위험관리 파일과 연결해 주세요.",
        placeholder: "| 원인(SW 고장) | 위험 상황 | 위해 | 통제(요구사항 ID) | 검증 |\n|---|---|---|---|---|\n| 판독 알고리즘 오류 | 양성을 음성으로 표시 | 진단·치료 지연 | SRS-[__] | 시스템 시험 [__] |\n| [____] | [____] | [____] | [____] | [____] |",
      },
      {
        heading: "10. 형상관리 · 문제 해결 · 릴리스 (§5.8 · §8 · §9)",
        guidance: "릴리스 버전과 빌드 재현 방법, 남은 알려진 결함과 그 위험 판단, 소프트웨어 구성 목록(SBOM)을 남겨 주세요.",
        placeholder: "릴리스 버전: [____] · 빌드 식별(해시·태그): [____]\n남은 알려진 결함과 위험 판단: [____]\nSBOM 문서 번호: [____]\n보관 위치: [____]",
      },
      {
        heading: "11. 유지보수 · 시판 후 (§6)",
        guidance: "배포 후 문제 보고·패치·보안 업데이트 절차를 적어 주세요. 변경이 인증에 영향을 주는지(NB 통지 대상 여부) 평가하는 방법도 적어요.",
        placeholder: "문제 접수 경로: [____]\n패치·업데이트 배포 방법: [____]\n변경 영향 평가 절차: [____] — NB 통지 대상 여부 판단 기준 [____]\n사이버보안 취약점 대응: 사이버보안 문서 참조",
      },
    ],
    experiments: [
      "소프트웨어 시스템 시험 — 요구사항 전부, 추적표로 확인",
      "결과 읽기 알고리즘 성능 시험 — 기준 결과 읽기 대비 (리더기·앱으로 결과를 읽을 때)",
      "단위·통합 시험 — 안전 등급 B·C",
      "사용적합성 총괄 평가 — 최종 소프트웨어 UI 포함",
    ],
    requiredData: [
      "소프트웨어 요구사항 명세(SRS)·아키텍처 문서",
      "SOUP 목록과 알려진 결함 검토 기록",
      "요구사항↔시험 추적표",
      "위험관리 파일 (소프트웨어 원인 위험)",
      "릴리스 노트·SBOM",
    ],
    checklist: [
      "안전 등급과 그 근거(위해 심각도·외부 통제)를 적었는가",
      "등급별로 필요한 IEC 62304 활동을 모두 했는가",
      "요구사항마다 시험이 있고 추적표로 확인했는가",
      "SOUP의 버전·알려진 결함을 검토했는가",
      "밸리데이션을 실제 사용자·환경 근거와 연결했는가",
      "남은 알려진 결함의 위험을 판단하고 릴리스했는가",
      "유지보수·변경 영향 평가 절차가 있는가",
    ],
    relatedConceptSlugs: ["iec-62304", "mdsw", "iso-14971", "iec-62366"],
    refs: ["IEC 62304:2006+A1:2015", "IVDR Annex I 16", "IVDR Annex VIII 1.4", "IEC 82304-1", "MDCG 2019-11", "ISO 14971"],
  },
  {
    // 섹션 1~4는 자동 생성(generic) 템플릿과 같은 순서 — 이미 저장된 초안의 섹션 순번을 지키기 위해. 새 섹션은 뒤에만 붙인다.
    id: "cybersecurity",
    stationId: 5,
    docTitle: "사이버보안 문서 (MDCG 2019-16)",
    purpose: "연결·소프트웨어 기기가 무단 접근·변조·정보 유출에 대비해 보안 설계·검증·시판 후 관리를 갖췄음을 입증해요 (IVDR Annex I 16, MDCG 2019-16).",
    intent: "위협 식별 → 보안 통제 → 검증 → 시판 후 취약점 관리 순서로 섹션을 나눴어요. 소프트웨어 구성은 제품 정보에서 채우도록 설계했어요.",
    sections: [
      {
        heading: "1. 목적 · 적용 범위",
        guidance: "보안 대상(펌웨어·앱·서버·통신 구간)과 연결 방식, 다루는 데이터(개인·건강 정보)를 적어 주세요.",
        placeholder: "대상 제품: {{auto.productName}} ({{auto.model}})\n소프트웨어 구성: {{auto.swScope}}\n연결 방식: [BLE / Wi-Fi / USB / 클라우드 / 없음]\n다루는 데이터: [검사 결과·개인정보 — GDPR 해당 여부]",
      },
      {
        heading: "2. 보안 위험관리 — 자산 · 위협 · 위험",
        guidance: "보호할 자산과 진입 지점, 위협(위·변조, 정보 유출, 서비스 거부 등)을 찾고, 안전 위험과 보안 위험을 함께 평가해 주세요. 보안 위험이 안전에 영향을 주면 위험관리 파일과 연결해요.",
        placeholder: "| 자산 | 진입 지점 | 위협 | 영향(안전·정보) | 위험 수준 | 통제 |\n|---|---|---|---|---|---|\n| 검사 결과 데이터 | BLE 통신 | 가로채기·변조 | 잘못된 결과 표시 | [__] | 암호화·무결성 검증 |\n| 펌웨어 | 업데이트 경로 | 위조 펌웨어 설치 | 오작동 | [__] | 서명 검증 |\n| [____] | [____] | [____] | [____] | [__] | [____] |",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적어 주세요.",
        placeholder: "IVDR Annex I 16 — IT 보안 요구\nMDCG 2019-16 — 의료기기 사이버보안 지침\nIEC 81001-5-1 — 헬스 소프트웨어 보안 수명주기\nIEC 62304 / ISO 14971\nGDPR (개인정보를 다루는 경우)\n연결 문서: 소프트웨어 검증·밸리데이션, 위험관리 파일, IFU",
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록해 주세요.",
        placeholder: "작성: [__]\n검토: [__]\n승인: [__]\n일자: [__]",
      },
      {
        heading: "5. 보안 설계 통제",
        guidance: "인증·접근 통제, 암호화, 펌웨어·앱 업데이트 무결성, 로그, 안전한 기본 설정 등 적용한 통제를 요구사항 ID와 함께 적어 주세요.",
        placeholder: "인증·접근 통제: [____]\n통신 암호화: [____]\n업데이트 무결성(서명 검증): [____]\n보안 로그·이상 감지: [____]\n안전한 기본 설정·불필요 기능 비활성화: [____]",
      },
      {
        heading: "6. 보안 검증",
        guidance: "보안 요구사항 시험, 취약점 스캔, 침투 시험, 퍼징 등 수행한 검증과 결과를 적어 주세요. 발견 사항은 위험을 판단한 뒤 조치 기록을 남겨요.",
        placeholder: "보안 요구사항 시험: [실험 후 입력]\n취약점 스캔(도구·일자): [실험 후 입력]\n침투 시험(수행 기관·범위): [실험 후 입력]\n발견 사항·조치: [실험 후 입력]",
      },
      {
        heading: "7. SBOM · 취약점 관리",
        guidance: "소프트웨어 구성 목록(SBOM)을 유지하고, 알려진 취약점(CVE) 모니터링과 판단 기준을 정해 주세요.",
        placeholder: "SBOM 문서 번호·형식: [____]\n취약점 모니터링 출처·주기: [____]\n대응 기준(심각도별 조치 기한): [____]",
      },
      {
        heading: "8. 시판 후 보안 관리",
        guidance: "취약점 제보 창구, 보안 업데이트 배포, 사용자·당국 통지, 지원 종료 정책을 적어 주세요.",
        placeholder: "취약점 제보 창구: [____]\n보안 업데이트 배포·검증 방법: [____]\n통지 절차(사용자·유통자·당국): [____]\n지원 기간(소프트웨어 수명): [____]",
      },
      {
        heading: "9. 사용자에게 주는 보안 정보 (IFU)",
        guidance: "사용자가 지켜야 할 운영 환경 요구(지원 OS 버전, 네트워크 조건, 업데이트 방법)와 보안 관련 주의 사항을 IFU에 넣어 주세요.",
        placeholder: "지원 환경(스마트폰 OS·버전): [____]\n업데이트 안내: [____]\n보안 주의 사항: [____]",
      },
    ],
    experiments: [
      "보안 요구사항 시험",
      "취약점 스캔",
      "침투 시험 (연결 기기)",
    ],
    requiredData: [
      "위협 모델(자산·진입 지점·데이터 흐름도)",
      "SBOM",
      "보안 시험 보고서",
      "취약점 대응 절차",
    ],
    checklist: [
      "자산·진입 지점·위협을 식별했는가",
      "보안 위험이 안전에 주는 영향을 위험관리 파일과 연결했는가",
      "업데이트 무결성(서명 검증)을 갖췄는가",
      "침투 시험 등 보안 검증 결과와 조치가 있는가",
      "SBOM과 취약점 모니터링 절차가 있는가",
      "IFU에 운영 환경·보안 정보를 넣었는가",
    ],
    relatedConceptSlugs: ["mdsw", "iec-62304", "gdpr"],
    refs: ["MDCG 2019-16", "IVDR Annex I 16", "IEC 81001-5-1", "IEC 62304"],
  },
  {
    // 섹션 1~4는 자동 생성(generic) 템플릿과 같은 순서 — 이미 저장된 초안의 섹션 순번을 지키기 위해. 새 섹션은 뒤에만 붙인다.
    id: "transport-validation",
    stationId: 5,
    docTitle: "운송(수송) 밸리데이션 (ISTA 3A)",
    purpose: "실제 운송 경로의 충격·진동·저압·온도 노출 뒤에도 포장이 제품을 보호하고 시약 성능이 유지됨을 입증해요 (IVDR Annex I §7).",
    intent: "제품 정보의 운송·포장 내용으로 적용 규격·포장 사양·시험 순서·운송 과정을 자동으로 채워요. 시험 강도와 합격 수치는 원문과 사람의 결정으로 남기도록 설계했어요.",
    sections: [
      {
        heading: "1. 목적 · 적용 범위",
        guidance: "무엇을 입증하는지와 대상 제품·포장 구성·운송 경로를 적어 주세요.",
        placeholder: "목적: {{auto.productName}}({{auto.model}})이 출하부터 사용자 수령까지의 운송 스트레스를 겪은 뒤에도 포장 무결성과 표시 성능을 유지함을 입증한다.\n적용 범위: 출하 포장 상태의 키트 — 구성품:\n{{auto.components}}",
      },
      {
        heading: "2. 운송 경로 · 조건 · 적용 규격",
        guidance: "목적지·운송 방식·출하 박스 정보와 적용 규정·규격, 그 이유를 적어 주세요. 최악 경로(가장 길고 덥거나 추운 경로)를 기준으로 삼아요.",
        placeholder: "{{auto.transportRoute}}\n\n적용 규정·규격:\n{{auto.transportStandards}}",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적어 주세요.",
        placeholder: "IVDR Annex I §7 — 운송·보관 중 성능 유지\nEN ISO 23640 — IVD 시약 안정성 평가\nISTA 3A — 택배 단일 포장 시험\nISO 13485 7.5.11 — 제품 보존\nRegulation (EU) 2025/40 (PPWR) — 포장 요건 (원문 확인 필요)\n연결 문서: 안정성 시험, 포장 사양, 취급·보관·배송 관리",
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록해 주세요.",
        placeholder: "작성: [__]\n검토: [__]\n승인: [__]\n일자: [__]",
      },
      {
        heading: "5. 포장 구성",
        guidance: "1차(파우치)·2차(키트 상자)·3차(출하 박스) 구성과 재질, PPWR(EU 포장 규정) 대응을 적어 주세요. 포장 사양 문서 번호를 연결해요.",
        placeholder: "{{auto.packagingSpec}}",
      },
      {
        heading: "6. 시험 순서 · 조건",
        guidance: "시험 순서와 단계별 방법을 적어 주세요. 낙하 높이·진동 강도·박스 수는 ISTA 원문 표의 값을 그대로 옮기고 출처(판·표 번호)를 적어요.",
        placeholder: "{{auto.transportTests}}",
      },
      {
        heading: "7. 판정 기준",
        guidance: "외관·포장 무결성·성능 판정 기준을 시험 전에 확정해 주세요. 허용 기준 수치는 위험관리·성능 목표에서 가져오고 근거를 적어요.",
        placeholder: "{{auto.transportAcceptance}}",
      },
      {
        heading: "8. 운송 과정 관리",
        guidance: "출하부터 사용자 수령까지 단계별 위험·관리·기록을 적어 주세요. 유통자·수입자 의무와 연결해요.",
        placeholder: "{{auto.transportProcess}}",
      },
      {
        heading: "9. 결과 · 결론",
        guidance: "시험 결과를 판정 기준과 비교하고 결론을 적어 주세요. 이탈이 있으면 원인과 포장 개선·재시험을 기록해요.",
        placeholder: "{{auto.transportResults}}",
      },
    ],
    experiments: [
      "ISTA 3A 운송 시뮬레이션 — 전처리 → 낙하 → 랜덤 진동 → (항공) 저압 → 최종 낙하",
      "운송 온도 노출 — 상온 제품은 EN ISO 23640 운송 시뮬레이션, 냉장 제품은 ISTA 7E",
      "운송 후 성능 확인 — 운송 시료 대 비운송 대조, cut-off 근처 시료",
    ],
    certTests: [
      "ISTA 인증 시험소 시험 (선택) — ISTA 3A 결과를 외부 보고서로 확보",
    ],
    requiredData: [
      "포장 사양서 (1·2·3차 포장 재질·치수·구성)",
      "운송 경로 조사 — 목적지·운송사·계절 온도·대기 시간",
      "SDS 14항 운송 정보 (위험물 해당 여부)",
      "포장재 공급사 자료 — 중금속 함량·재질 (PPWR)",
      "안정성 시험 결과 (운송 후 성능 비교 기준)",
    ],
    checklist: [
      "최악 운송 경로(가장 길고 덥거나 추운 경로)를 기준으로 삼았는가",
      "시험 강도(낙하 높이·진동)를 ISTA 원문 표에서 옮기고 출처를 적었는가",
      "항공 구간이 있으면 저압 단계를 넣었는가",
      "판정 기준을 시험 전에 확정했는가",
      "운송 후 성능을 비운송 대조와 비교했는가",
      "EU 출시면 PPWR 의무(재활용·빈 공간·중금속)와 1차 포장 예외 근거를 정리했는가",
    ],
    relatedConceptSlugs: ["gspr", "ifu"],
    refs: ["IVDR Annex I §7", "EN ISO 23640", "ISTA 3A", "ISTA 7E", "ASTM D4169", "ISO 13485 7.5.11", "Regulation (EU) 2025/40 (PPWR)"],
    calcTools: ["mkt"],
  },
  {
    id: "kr-technical-doc",
    stationId: 2,
    docTitle: "[한국] 체외진단의료기기 기술문서 초안 (식약처)",
    purpose: "식약처 신고·인증·허가에 내는 기술문서 항목을 제품 정보와 IVDR 문서에서 가져와 초안으로 만들어요.",
    rationale: "국내 기술문서는 사용 목적·작용 원리·원재료·제조 방법·성능·시험 규격·저장 방법·사용 방법·주의사항·포장 단위를 요구해요. IVDR용으로 이미 쓴 내용과 겹치는 부분이 많아서, 한 번 쓴 근거를 다시 써요. 항목 구성은 원문(체외진단의료기기 허가·신고·심사 규정) 확인 필요.",
    sections: [
      { heading: "1. 등급 및 허가 경로", guidance: "식약처 품목 분류로 확인한 등급과 경로를 적어 주세요.", placeholder: "{{auto.krGrade}}\n품목명·분류 코드: [____]" },
      { heading: "2. 사용 목적", guidance: "IVDR 의도된 목적과 같은 내용을 국내 표현으로 적어 주세요.", placeholder: "{{auto.intendedPurpose}}\n\n자가검사 품목: {{auto.krSelfTest}}" },
      { heading: "3. 작용 원리", guidance: "검사 원리를 그림 없이 문장으로 적어 주세요.", placeholder: "{{auto.principle}}" },
      { heading: "4. 원재료", guidance: "구성품별 원재료와 규격을 적어 주세요 (회사 자료).", placeholder: "구성품:\n{{auto.components}}\n\n원재료(항체·항원·멤브레인 등)와 규격: [____]" },
      { heading: "5. 제조 방법", guidance: "제조 공정을 요약해 주세요 (회사 자료).", placeholder: "[제조 공정 요약 — 회사 자료]" },
      { heading: "6. 성능", guidance: "분석적·임상적 성능 시험 계획과 결과를 적어 주세요.", placeholder: "판정 기준:\n{{auto.analyticalAcceptance}}\n\n결과:\n{{auto.analyticalResults}}" },
      { heading: "7. 시험 규격", guidance: "출하 시험 항목과 기준을 적어 주세요 (회사 자료).", placeholder: "[출하 시험 항목·기준 — 회사 자료]" },
      { heading: "8. 저장 방법 및 사용 기간", guidance: "안정성 시험 근거를 적어 주세요.", placeholder: "저장 방법: {{auto.storage}}\n사용 기간: {{auto.shelfLife}}\n개봉 후: {{auto.openedStability}}" },
      { heading: "9. 사용 방법", guidance: "IFU 사용 단계와 결과 읽는 법을 적어 주세요.", placeholder: "{{auto.ifuSteps}}\n\n결과 판독:\n{{auto.ifuReading}}" },
      { heading: "10. 사용 시 주의사항", guidance: "IFU의 한계와 경고를 적어 주세요.", placeholder: "{{auto.ifuLimitations}}\n\n{{auto.ifuWarnings}}" },
      { heading: "11. 포장 단위", guidance: "판매 포장 단위를 적어 주세요.", placeholder: "[__회 검사용 / 키트] — 구성품 표 참조" },
    ],
    checklist: [
      "식약처 품목 분류로 등급·품목명을 확인했는가",
      "자가검사용이면 허용 품목인지 고시 원문으로 확인했는가",
      "원재료·제조 방법·시험 규격을 회사 자료로 채웠는가",
      "성능·안정성 결과가 시험 보고서와 일치하는가",
    ],
    relatedConceptSlugs: [],
    refs: ["체외진단의료기기법", "체외진단의료기기 품목 및 품목별 등급에 관한 규정"],
  },
  {
    id: "us-510k-draft",
    stationId: 2,
    docTitle: "[미국] FDA 510(k) 제출 초안 (eSTAR 흐름)",
    purpose: "FDA 시판 전 신고(510(k)) 또는 De Novo 제출 내용을 제품 정보와 IVDR 문서에서 가져와 초안으로 만들어요.",
    rationale: "510(k)는 비교 대상 기기(predicate)와 실질적으로 동등하다는 것을 성능 자료로 보여 주는 제출이에요. 기기 설명·사용 적응증·성능·라벨은 IVDR 문서와 겹쳐서, 한 번 쓴 근거를 다시 써요. 섹션 순서는 eSTAR 흐름의 요약이며 원문(FDA eSTAR·21 CFR 807.87) 확인 필요.",
    sections: [
      { heading: "1. 분류와 제출 경로", guidance: "FDA 분류 데이터베이스에서 제품 코드를 확인해 주세요.", placeholder: "{{auto.usClass}}" },
      { heading: "2. 사용 적응증 (Indications for Use)", guidance: "FDA 3881 양식에 들어갈 문장이에요. OTC/Rx(일반용/처방용)를 표시해 주세요.", placeholder: "{{auto.intendedPurpose}}\n\n대상 집단: {{auto.targetPopulation}}\n사용하면 안 되는 용도: {{auto.outOfScope}}" },
      { heading: "3. 기기 설명", guidance: "구성·원리·형태를 적어 주세요.", placeholder: "제품 형태: {{auto.formFactor}}\n작동 원리:\n{{auto.principle}}\n\n구성품:\n{{auto.components}}" },
      { heading: "4. 실질적 동등성 비교", guidance: "비교 대상 기기(predicate)와 같은 점·다른 점을 표로 적어 주세요.", placeholder: "| 항목 | 이 기기 | 비교 대상 기기 (K[______]) |\n|---|---|---|\n| 사용 적응증 | {{auto.analyte}} {{auto.resultKind}} · {{auto.user}} | [____] |\n| 검체 | {{auto.specimen}} | [____] |\n| 원리 | [위 작동 원리 요약] | [____] |\n| Cut-off | {{auto.cutoff}} | [____] |\n| 판독 | {{auto.readout}} | [____] |" },
      { heading: "5. 분석 성능", guidance: "CLSI 기준 시험 설계와 결과를 적어 주세요.", placeholder: "판정 기준:\n{{auto.analyticalAcceptance}}\n\n결과:\n{{auto.analyticalResults}}" },
      { heading: "6. 임상 / 일반인 사용 연구", guidance: "가정용은 일반인이 쓴 결과와 기준 방법을 비교해 주세요.", placeholder: "판정 기준:\n{{auto.clinicalAcceptance}}\n\nCLIA: {{auto.usClia}}" },
      { heading: "7. 안정성", guidance: "유효기간·개봉 후 안정성 근거를 적어 주세요.", placeholder: "보관: {{auto.storage}}\n유효기간: {{auto.shelfLife}}\n개봉 후: {{auto.openedStability}}" },
      { heading: "8. 라벨·사용설명서 (21 CFR 809.10)", guidance: "IFU 초안을 영어로 옮길 바탕이에요.", placeholder: "사용 방법:\n{{auto.ifuSteps}}\n\n결과 판독:\n{{auto.ifuReading}}\n\n한계:\n{{auto.ifuLimitations}}" },
      { heading: "9. 소프트웨어·사이버보안", guidance: "앱·펌웨어가 있으면 FDA 소프트웨어 문서와 524B 사이버보안 자료를 넣어 주세요.", placeholder: "{{auto.swScope}}" },
    ],
    checklist: [
      "FDA 분류 데이터베이스에서 제품 코드·규정 번호를 확인했는가",
      "비교 대상 기기(K-번호)를 정하고 동등성 표를 채웠는가 (510(k)일 때)",
      "가정용이면 일반인 사용 연구를 계획했는가",
      "라벨이 21 CFR 809.10 항목을 모두 담는가",
      "영문 번역본을 만들었는가",
    ],
    relatedConceptSlugs: [],
    refs: ["21 CFR 807", "21 CFR 809.10", "21 CFR 862", "FDA eSTAR"],
  },
];

export const docByStationId = (id: number): DocTemplate | undefined =>
  documents.find((d) => d.stationId === id);

export const docById = (id: string): DocTemplate | undefined =>
  documents.find((d) => d.id === id);

/** 전용 템플릿이 없는 잎은 일반 템플릿을 자동 생성한다. */
// 전용 템플릿이 없는(자동 생성) 문서에 내장 계산기를 붙이는 매핑
const GENERIC_CALC_TOOLS: Record<string, CalcToolType[]> = {
  "transport-validation": ["mkt"],
};

function buildGenericDoc(leaf: DocLeaf, station: Station): DocTemplate {
  return {
    id: leaf.id,
    stationId: leaf.stationId,
    docTitle: leaf.title,
    purpose:
      leaf.note ??
      `${station.title} 단계의 산출 문서예요. ${station.oneLine}`,
    calcTools: GENERIC_CALC_TOOLS[leaf.id],
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
        guidance: "이 문서의 목적과 대상 제품·적용 범위를 적어 주세요.",
        placeholder: "목적: [____]\n적용 범위(제품·모델): [____]",
      },
      {
        heading: "2. 핵심 내용",
        guidance: "관련 요구사항에 따라 핵심 내용을 써 주세요.",
        placeholder: "[____]",
      },
      {
        heading: "3. 근거 · 참조",
        guidance: "관련 조항·표준·연결 문서를 적어 주세요.",
        placeholder: leaf.refs.join("\n"),
      },
      {
        heading: "4. 검토 · 승인",
        guidance: "작성자·검토자·승인자와 일자를 기록해 주세요.",
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
      purpose: isoLeaf.note ?? `ISO 13485 Clause ${isoLeaf.refs.join("·")} 요건을 충족하는 문서예요.`,
      sections: [
        {
          heading: "1. 내용",
          guidance: "ISO 13485 요구사항에 따라 써 주세요.",
          placeholder: `[${isoLeaf.title} 내용을 여기에 작성하세요]`,
        },
      ],
      checklist: [`${isoLeaf.title} 내용이 ISO 13485 Clause ${isoLeaf.refs.join("·")} 요건을 충족한다`],
      relatedConceptSlugs: ["iso-13485"],
      refs: isoLeaf.refs.map((r) => `ISO 13485:2016 Clause ${r}`),
    };
  }
  // IVDD 상세 템플릿
  const ivddDetailed = ivddDocById(id);
  if (ivddDetailed) return ivddDetailed;
  // MDSAP 상세 템플릿
  const mdsapDetailed = mdsapDocById(id);
  if (mdsapDetailed) return mdsapDetailed;
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
