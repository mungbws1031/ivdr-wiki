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
