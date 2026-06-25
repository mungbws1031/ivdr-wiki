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

export interface DocSection {
  heading: string;
  guidance: string; // 무엇을 어떻게 쓰는지 안내
  placeholder: string; // 채워넣기 예시/뼈대
}

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
  sections: DocSection[];
  checklist: string[];
  relatedConceptSlugs: string[];
  refs: string[];
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
          "| GSPR 항목 | 적용 | 충족 방법 | 증거 위치 |\n|---|---|---|---|\n| [____] | 예/아니오 | [____] | [____] |",
      },
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
        heading: "1. 과학적 타당성",
        guidance: "분석물질-임상상태 연관의 근거(문헌·가이드라인).",
        placeholder: "분석물질↔임상상태 근거: [____]\n출처: [____]",
      },
      {
        heading: "2. 분석적 성능",
        guidance: "정밀도·정확도·검출한계·교차반응 등 연구 설계.",
        placeholder:
          "정밀도: [설계]\n정확도/진실성: [설계]\n검출한계(LoD): [설계]\n특이성/교차반응: [설계]",
      },
      {
        heading: "3. 임상적 성능",
        guidance: "민감도·특이도·임상적 유효성 연구 설계.",
        placeholder: "임상 민감도/특이도: [설계]\n검체 수·출처: [____]",
      },
      {
        heading: "4. 산출물 흐름",
        guidance: "PEP→데이터→PER 연결.",
        placeholder: "PER 작성 일정·담당: [____]",
      },
    ],
    checklist: [
      "3단(과학·분석·임상)이 모두 설계됐는가",
      "각 성능 지표에 수용 기준이 있는가",
      "PER로 닫는 일정이 있는가",
    ],
    relatedConceptSlugs: ["pep-per", "annex-xiii", "gspr"],
    refs: ["IVDR Art.56", "Annex XIII"],
  },
  {
    id: "risk-management-plan",
    stationId: 7,
    docTitle: "위험관리 계획 (ISO 14971) + GSPR↔위험 추적표",
    purpose:
      "ISO 14971 프로세스를 수립하고, 위험-요구(GSPR)-성능을 양방향 추적한다.",
    sections: [
      {
        heading: "1. 위험관리 범위·기준",
        guidance: "적용 표준·위험 수용 기준.",
        placeholder: "표준: ISO 14971:2019\n위험 수용 기준: [____]",
      },
      {
        heading: "2. 위험 분석·통제",
        guidance: "위해요인→위험상황→위해, 통제수단, 잔여위험.",
        placeholder:
          "| 위해요인 | 위험상황 | 통제수단 | 잔여위험 | 검증 |\n|---|---|---|---|---|\n| [__] | [__] | [__] | [__] | [__] |",
      },
      {
        heading: "3. GSPR↔위험↔성능 추적표",
        guidance: "요구·위험·성능 증거가 서로를 가리키게.",
        placeholder: "| GSPR 항목 | 관련 위험 | 성능 증거 |\n|---|---|---|\n| [__] | [__] | [__] |",
      },
      {
        heading: "4. 사용적합성 연계 (해당 시)",
        guidance: "자가검사면 IEC 62366 연계.",
        placeholder: "사용 오류 위험·완화: [____] (IEC 62366)",
      },
    ],
    checklist: [
      "위험-GSPR-성능이 양방향 추적되는가",
      "잔여위험이 평가·수용됐는가",
      "자가검사면 사용적합성을 연계했는가",
    ],
    relatedConceptSlugs: ["iso-14971", "gspr", "iec-62366"],
    refs: ["ISO 14971:2019", "IVDR Annex I"],
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
          "데이터 소스: [불만·바이질런스·문헌·시장피드백]\n수집/분석 주기: [____]\n책임자: [____]",
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
    checklist: [
      "PMS가 QMS에 통합됐는가",
      "PMS→성능→위험 환류 경로가 명문화됐는가",
      "Class C·D면 PSUR 연간 일정이 있는가",
      "PMPF 계획이 Annex XIII Part B를 따르는가",
    ],
    relatedConceptSlugs: ["pms", "annex-iii", "annex-xiii"],
    refs: ["IVDR Art.78~81", "Annex III", "Annex XIII Part B"],
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
  if (!leaf) return undefined;
  const station = stations.find((s) => s.id === leaf.stationId);
  if (!station) return undefined;
  return buildGenericDoc(leaf, station);
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
