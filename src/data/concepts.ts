// =====================================================================
// src/data/concepts.ts
// 개념 위키 — IVDR 조항·Annex·표준·핵심 개념. 정거장/문서와 양방향 연결.
// 본문은 {{slug|표시텍스트}} 인라인 링크 마크업을 허용한다(renderRich 처리).
// 규제 사실은 2026.6 기준 확인값. 실제 진행 시 최신 관보로 재확인할 것.
// =====================================================================

export type ConceptCategory =
  | "annex" // IVDR 부속서
  | "standard" // 국제 표준
  | "concept" // 핵심 개념/시스템
  | "actor" // 행위자/기관
  | "deliverable"; // 산출물 문서

export interface WikiConcept {
  slug: string;
  term: string;
  aka?: string[];
  category: ConceptCategory;
  summary: string; // 한 줄 정의 (인덱스/칩)
  body: string[]; // 심화 문단 ({{slug|label}} 허용)
  refs: string[];
  relatedStationIds: number[];
  relatedConceptSlugs: string[];
}

export const categoryLabel: Record<ConceptCategory, string> = {
  annex: "부속서(Annex)",
  standard: "국제 표준",
  concept: "핵심 개념",
  actor: "행위자·기관",
  deliverable: "산출물 문서",
};

export const concepts: WikiConcept[] = [
  {
    slug: "intended-purpose",
    term: "의도된 목적 (Intended Purpose)",
    aka: ["Intended Purpose", "사용목적"],
    category: "concept",
    summary: "제조자가 정한 기기의 용도. 분류·성능·라벨링의 출발점.",
    body: [
      "의도된 목적은 제조자가 라벨·사용설명서(IFU)·판촉자료에 명시한 기기의 용도다. IVDR 여정 전체가 이 한 문단에서 갈라지므로 **가장 먼저, 가장 정확히** 확정해야 한다.",
      "최소 5요소를 포함한다 — **무엇을** 검출/측정하는가, 어떤 **검체**인가, **사용자**는 누구인가(전문가·자가검사), 사용 **환경**(실험실·근접검사·가정), 그리고 결과가 돕는 임상적 **결정**. 이 요소들이 {{annex-viii|분류}}와 {{annex-xiii|성능평가}} 설계를 직접 좌우한다.",
    ],
    refs: ["IVDR Art.2 (정의)"],
    relatedStationIds: [1, 2, 6],
    relatedConceptSlugs: ["annex-viii", "annex-xiii"],
  },
  {
    slug: "annex-viii",
    term: "Annex VIII — 분류 규칙",
    aka: ["Annex VIII", "Classification Rules"],
    category: "annex",
    summary: "Rule 1~7로 A/B/C/D 위험 등급을 결정하는 분류 규칙.",
    body: [
      "Annex VIII은 IVD를 위험 기반 4등급(A < B < C < D)으로 나누는 7개 규칙을 담는다. 규칙을 순서대로 적용하고, 둘 이상 해당하면 **가장 높은 등급**을 채택한다.",
      "Rule 1~2는 최고위험(혈액 스크리닝·생명위협 감염 등 → 주로 D), Rule 3은 중간(C), Rule 4는 **자가검사·근접검사**(대체로 C, 임신·가임력 일부 B), Rule 5는 A(시약·기구·용기·일반 배지 등), Rule 6은 그 외 C, Rule 7은 자가관리(self-monitoring) 등을 다룬다.",
      "분류 결과는 {{notified-body|NB}} 개입 여부와 전환 기한을 통째로 바꾸므로, 적용한 규칙과 근거를 1장짜리 분류 근거서로 남긴다.",
    ],
    refs: ["IVDR Annex VIII", "Art.47"],
    relatedStationIds: [2, 3],
    relatedConceptSlugs: ["intended-purpose", "notified-body"],
  },
  {
    slug: "gspr",
    term: "GSPR — 일반 안전·성능 요구사항",
    aka: ["Annex I", "General Safety and Performance Requirements"],
    category: "annex",
    summary: "모든 IVD가 충족해야 할 안전·성능 요구사항 (Annex I).",
    body: [
      "GSPR(Annex I)은 모든 IVD가 충족해야 할 일반 안전·성능 요구사항의 목록이다. 기술문서의 뼈대이며, 각 요구사항에 대해 **적용 여부 → 충족 방법 → 증거 위치**를 매핑하는 GSPR 체크리스트가 출발점이 된다.",
      "GSPR는 {{annex-xiii|성능평가}} 결과와 {{iso-14971|위험관리}} 파일을 한데 묶는 허브 역할을 한다. 요구사항 ↔ 위험 ↔ 성능 증거가 서로를 가리켜야 추적성이 성립한다.",
    ],
    refs: ["IVDR Annex I (GSPR)"],
    relatedStationIds: [5, 7],
    relatedConceptSlugs: ["annex-ii", "iso-14971", "annex-xiii"],
  },
  {
    slug: "annex-ii",
    term: "Annex II — 기술문서",
    aka: ["Annex II", "Technical Documentation"],
    category: "annex",
    summary: "제품 적합성을 입증하는 기술문서의 필수 목차.",
    body: [
      "Annex II는 기술문서가 담아야 할 항목을 규정한다 — 기기 설명·의도된 목적, 라벨·IFU, 설계·제조 정보, {{gspr|GSPR}} 충족 근거, 위험·이익 분석, 검증·밸리데이션(성능평가 포함).",
      "Annex II 목차를 그대로 폴더 구조로 만들어 항목별 담당자·기한을 배정하면 증거 수집이 체계화된다. 시판 후 영역은 {{annex-iii|Annex III}}가 보완한다.",
    ],
    refs: ["IVDR Annex II"],
    relatedStationIds: [5],
    relatedConceptSlugs: ["gspr", "annex-iii", "annex-xiii"],
  },
  {
    slug: "annex-iii",
    term: "Annex III — 시판 후 감시 기술문서",
    aka: ["Annex III", "PMS Technical Documentation"],
    category: "annex",
    summary: "PMS 계획·PSUR·PMPF 등 시판 후 문서의 요건.",
    body: [
      "Annex III는 시판 후 감시({{pms|PMS}}) 관련 기술문서의 요건을 규정한다 — PMS 계획, PMS 보고서 또는 {{pms|PSUR}}, 그리고 {{annex-xiii|PMPF}} 계획·보고서.",
      "{{annex-ii|Annex II}}(출시 전 증거)와 짝을 이뤄, 출시 후 수집 데이터가 성능·위험 파일로 환류되도록 연결한다.",
    ],
    refs: ["IVDR Annex III"],
    relatedStationIds: [5, 11],
    relatedConceptSlugs: ["annex-ii", "pms", "annex-xiii"],
  },
  {
    slug: "annex-xiii",
    term: "Annex XIII — 성능평가·PMPF",
    aka: ["Annex XIII", "Performance Evaluation"],
    category: "annex",
    summary: "성능평가 3단(과학·분석·임상)과 PMPF의 절차.",
    body: [
      "Annex XIII는 {{pep-per|성능평가}}의 절차를 규정한다 — **과학적 타당성 → 분석적 성능 → 임상적 성능**의 3단 증거를 계획(PEP)하고 수집해 보고서(PER)로 닫는다.",
      "Part B는 **PMPF(시판 후 성능 추적)**를 다룬다. 출시 후에도 성능을 지속 확인하여 {{pms|PMS}} 루프에 환류한다.",
    ],
    refs: ["IVDR Annex XIII", "Art.56"],
    relatedStationIds: [6, 11],
    relatedConceptSlugs: ["pep-per", "pms", "gspr"],
  },
  {
    slug: "iso-13485",
    term: "ISO 13485:2016 — 의료기기 QMS",
    aka: ["ISO 13485", "품질경영시스템"],
    category: "standard",
    summary: "의료기기 품질경영시스템 국제 표준. IVDR QMS의 토대.",
    body: [
      "ISO 13485:2016은 의료기기 품질경영시스템(QMS) 국제 표준으로, 대부분의 제조자가 IVDR QMS의 토대로 삼는다.",
      "다만 **ISO 13485 인증서만으로 IVDR을 충족하지는 않는다.** IVDR 고유 프로세스({{annex-xiii|성능평가}}·{{pms|PMS}}·{{pms|PSUR}}·{{udi|UDI}})를 절차서에 명시적으로 연결해야 한다. 전환 기한 연장 조건에도 '2025.5.26까지 Art.10(8) QMS'가 포함된다.",
    ],
    refs: ["ISO 13485:2016", "IVDR Art.10(8)"],
    relatedStationIds: [4],
    relatedConceptSlugs: ["pms", "annex-xiii"],
  },
  {
    slug: "iso-14971",
    term: "ISO 14971:2019 — 위험관리",
    aka: ["ISO 14971", "Risk Management"],
    category: "standard",
    summary: "의료기기 위험관리 국제 표준. GSPR·성능과 추적 연결.",
    body: [
      "ISO 14971:2019는 의료기기 위험관리 프로세스(분석→평가→통제→잔여위험 평가→생산·시판후 모니터링) 표준이다.",
      "위험관리 파일은 {{gspr|GSPR}} 및 성능 결과와 **양방향 추적**되어야 한다. 자가검사 제품은 사용자가 비전문가이므로 {{iec-62366|IEC 62366}} 사용적합성과 연계해 사용 오류 위험을 다룬다.",
    ],
    refs: ["ISO 14971:2019", "IVDR Annex I"],
    relatedStationIds: [7],
    relatedConceptSlugs: ["gspr", "iec-62366"],
  },
  {
    slug: "iec-62366",
    term: "IEC 62366-1 — 사용적합성",
    aka: ["IEC 62366", "Usability Engineering"],
    category: "standard",
    summary: "사용적합성(휴먼팩터) 엔지니어링 표준. 자가검사 필수.",
    body: [
      "IEC 62366-1은 사용적합성(usability/휴먼팩터) 엔지니어링 표준이다. 사용 인터페이스를 설계·평가해 사용 오류로 인한 위험을 줄인다.",
      "특히 비전문가가 쓰는 **자가검사·근접검사** 기기에서 핵심이다. 사용 오류가 곧 임상 위험이 되므로 {{iso-14971|위험관리}}와 연계한다.",
    ],
    refs: ["IEC 62366-1", "IVDR Annex I"],
    relatedStationIds: [7],
    relatedConceptSlugs: ["iso-14971"],
  },
  {
    slug: "notified-body",
    term: "Notified Body (NB) · NANDO",
    aka: ["NB", "인증기관", "NANDO"],
    category: "actor",
    summary: "적합성을 심사·인증하는 제3자 기관. A 비멸균 제외 필수.",
    body: [
      "Notified Body(NB, 인증기관)는 EU가 지정한 제3자 적합성 평가 기관이다. Class A 비멸균을 제외한 모든 기기는 NB의 QMS·기술문서 심사를 거쳐 인증서를 받아야 한다.",
      "내 제품 scope를 다루는 NB는 **NANDO** 데이터베이스에서 찾는다. NB 심사 슬롯이 한정적이라 조기 접촉·서면계약이 중요하다. Class C 레거시 기기의 NB 신청 마감은 **2026.5.26**.",
    ],
    refs: ["IVDR Art.38~46", "NANDO 데이터베이스"],
    relatedStationIds: [3, 8],
    relatedConceptSlugs: ["annex-viii", "ce-marking"],
  },
  {
    slug: "ce-marking",
    term: "CE 마킹 (Annex V)",
    aka: ["CE Marking", "Annex V"],
    category: "concept",
    summary: "IVDR 적합성을 나타내는 마크. EU 시장 출시 자격.",
    body: [
      "CE 마킹은 제품이 적용 EU 규정(IVDR)을 충족함을 나타내는 표시로, 부착 형태·규칙은 Annex V가 정한다. NB가 관여한 경우 NB 식별번호가 함께 표기된다.",
      "CE 부착의 근거는 제조자가 작성하는 {{doc|적합성 선언서(DoC)}}다. CE는 곧 EU 시장 출시 자격이다.",
    ],
    refs: ["IVDR Annex V", "Art.18"],
    relatedStationIds: [9],
    relatedConceptSlugs: ["doc", "notified-body"],
  },
  {
    slug: "doc",
    term: "적합성 선언서 (DoC, Annex IV)",
    aka: ["DoC", "Declaration of Conformity", "Annex IV"],
    category: "deliverable",
    summary: "제조자가 IVDR 충족을 공식 선언하는 문서.",
    body: [
      "적합성 선언서(DoC)는 제조자가 기기의 IVDR 적합성을 공식 선언·서명하는 문서로, 필수 항목은 Annex IV가 규정한다 — 제조자/대리인 식별, 기기 식별(Basic UDI-DI 포함), 분류, 적용 규정·표준, NB 정보(해당 시) 등.",
      "DoC는 {{ce-marking|CE 마킹}}의 법적 근거이며, 라벨링과 항목이 일치해야 한다.",
    ],
    refs: ["IVDR Annex IV", "Art.17"],
    relatedStationIds: [9],
    relatedConceptSlugs: ["ce-marking", "udi"],
  },
  {
    slug: "pep-per",
    term: "PEP / PER — 성능평가 계획·보고서",
    aka: ["PEP", "PER", "Performance Evaluation Plan/Report"],
    category: "deliverable",
    summary: "성능평가의 계획(PEP)과 그 결과 보고서(PER).",
    body: [
      "PEP(성능평가 계획)는 {{annex-xiii|Annex XIII}}가 요구하는 과학적 타당성·분석적 성능·임상적 성능 증거를 **어떻게 확보할지** 먼저 설계하는 문서다. 계획 없이 데이터를 모으면 재작업이 발생한다.",
      "PER(성능평가 보고서)는 수집된 증거로 성능을 입증해 평가를 닫는 문서다. 흐름: **PEP → 데이터 → PER**. 출시 후에는 {{annex-xiii|PMPF}}로 이어진다.",
    ],
    refs: ["IVDR Art.56", "Annex XIII"],
    relatedStationIds: [6],
    relatedConceptSlugs: ["annex-xiii", "gspr"],
  },
  {
    slug: "pms",
    term: "PMS · PMPF · PSUR — 시판 후 감시",
    aka: ["PMS", "PMPF", "PSUR", "Post-Market Surveillance"],
    category: "concept",
    summary: "출시 후 안전·성능을 지속 감시하고 환류하는 시스템.",
    body: [
      "PMS(시판 후 감시)는 출시 후 기기의 안전·성능 데이터를 능동·체계적으로 수집·분석하는 활동으로, {{iso-13485|QMS}}에 통합한다. 계획·문서 요건은 {{annex-iii|Annex III}}.",
      "**PMPF**({{annex-xiii|Annex XIII}} Part B)는 시판 후 성능을 지속 추적한다. **PSUR**(정기 안전성 갱신 보고서)은 PMS 결과를 종합하며, **Class C·D는 매년** 갱신한다. PMS → 성능 → 위험으로 데이터가 환류되는 경로를 명문화해야 한다.",
    ],
    refs: ["IVDR Art.78~81", "Annex III", "Annex XIII Part B"],
    relatedStationIds: [11],
    relatedConceptSlugs: ["annex-iii", "annex-xiii", "iso-13485"],
  },
  {
    slug: "eudamed",
    term: "EUDAMED",
    aka: ["European Database on Medical Devices"],
    category: "concept",
    summary: "유럽 의료기기 데이터베이스. 행위자·기기·UDI 등록.",
    body: [
      "EUDAMED는 행위자·기기·인증서·{{udi|UDI}}·시판후·임상/성능 데이터를 담는 EU 통합 데이터베이스다.",
      "Decision (EU) 2025/2371에 따라 **첫 4개 모듈이 2026.5.28 의무화**되며, 레거시 기기 등록은 **2026.11.28**까지 완료해야 한다. 먼저 {{srn|행위자 등록(SRN)}}을 확보한 뒤 기기를 등록한다.",
    ],
    refs: ["IVDR Art.33~34", "Decision (EU) 2025/2371"],
    relatedStationIds: [10],
    relatedConceptSlugs: ["udi", "srn"],
  },
  {
    slug: "srn",
    term: "SRN — 단일 등록 번호",
    aka: ["Single Registration Number"],
    category: "concept",
    summary: "행위자(제조자 등)가 EUDAMED 등록 시 받는 고유 번호.",
    body: [
      "SRN(단일 등록 번호)은 제조자·대리인·수입자가 {{eudamed|EUDAMED}}에 행위자 등록을 하면 부여되는 고유 식별번호다.",
      "SRN은 이후 기기 등록·인증·DoC 등에서 행위자를 식별하는 데 쓰이므로, 등록 절차의 **가장 먼저** 확보해야 할 항목이다.",
    ],
    refs: ["IVDR Art.28", "Annex VI"],
    relatedStationIds: [10],
    relatedConceptSlugs: ["eudamed", "udi"],
  },
  {
    slug: "udi",
    term: "UDI — 고유기기식별",
    aka: ["UDI-DI", "Basic UDI-DI", "Unique Device Identification"],
    category: "concept",
    summary: "기기를 전 세계 고유하게 식별하는 코드 체계.",
    body: [
      "UDI(고유기기식별)는 기기를 전 세계적으로 고유하게 식별하는 체계다. **UDI-DI**(기기 식별자)와 생산정보(UDI-PI)로 구성되며, **Basic UDI-DI**는 규제 문서({{doc|DoC}}·인증서·{{eudamed|EUDAMED}})를 묶는 상위 식별자다.",
      "라벨에 UDI 캐리어(바코드 등)를 표기하고, UDI-DI를 EUDAMED 기기 등록과 연결한다.",
    ],
    refs: ["IVDR Art.24~27", "Annex VI Part C"],
    relatedStationIds: [10],
    relatedConceptSlugs: ["eudamed", "srn", "doc"],
  },
  {
    slug: "mdsap",
    term: "MDSAP — 의료기기 단일심사프로그램",
    aka: ["Medical Device Single Audit Program", "단일심사"],
    category: "standard",
    summary: "호주·브라질·캐나다·일본·미국 5개국 규제기관이 인정하는 단일 QMS 심사 프로그램.",
    body: [
      "MDSAP(Medical Device Single Audit Program)는 {{iso-13485|ISO 13485}} QMS를 기반으로 호주(TGA)·브라질(ANVISA)·캐나다(Health Canada)·일본(PMDA)·미국(FDA) 5개 규제기관이 공동 인정하는 단일 심사 프로그램이다. 한 번 심사를 통과하면 5개국 시장 규제 요건을 동시에 충족한다.",
      "MDSAP는 ISO 13485의 **상위 집합(superset)**이다 — ISO 13485 QMS에 각국 규제 챕터(호주·브라질 등 국가별 요구)를 추가 심사한다. 우리 IVDR 문서셋의 상당수(QMS·설계·위험·생산·기술/성능 증거)가 MDSAP와 공통 재사용된다. EU CE 인증 준비와 병행하면 다중 시장 진출 비용을 절감할 수 있다.",
    ],
    refs: ["MDSAP Auditing Organizations", "ISO 13485:2016"],
    relatedStationIds: [4],
    relatedConceptSlugs: ["iso-13485", "pms"],
  },
  {
    slug: "iec-62304",
    term: "IEC 62304 — 의료기기 소프트웨어 수명주기",
    aka: ["IEC 62304", "Software Lifecycle"],
    category: "standard",
    summary: "의료기기 소프트웨어 개발·유지보수·위험관리 국제 표준.",
    body: [
      "IEC 62304는 의료기기에 포함된 소프트웨어의 **수명주기 프로세스**(개발·유지보수·문제 해결)를 정의하는 국제 표준이다. 소프트웨어 안전 클래스(A·B·C)를 정하고, 클래스별로 요구되는 설계·검증·밸리데이션·형상 관리 활동을 규정한다.",
      "IVDR에서 소프트웨어를 포함하는 IVD는 GSPR 16조 요구사항을 충족해야 하며, IEC 62304 준수가 핵심 수단이다. SW 위험 클래스가 높을수록 단위 시험·통합 시험·형상관리·SOUP(기성 소프트웨어) 관리 요건이 강화된다. {{iso-14971|ISO 14971}} 위험관리와 연계해 SW 위험을 다룬다.",
    ],
    refs: ["IEC 62304:2015+A1:2015", "IVDR Annex I 16"],
    relatedStationIds: [5],
    relatedConceptSlugs: ["iso-14971", "gspr"],
  },
  {
    slug: "prrc",
    term: "PRRC — 규제준수책임자",
    aka: ["Person Responsible for Regulatory Compliance", "Art.15"],
    category: "actor",
    summary: "제조자가 지정해야 하는 규제 적합성 최종 책임자 (IVDR Art.15).",
    body: [
      "PRRC(Person Responsible for Regulatory Compliance, 규제준수책임자)는 IVDR Art.15가 모든 제조자에게 요구하는 역할이다. **법학·자연과학·공학 관련 학위 + 1년 이상 규제 또는 QMS 경력**(학위 없는 경우 4년 경력)을 보유해야 하며, 제조자 내부 또는 외부 전문가가 될 수 있다.",
      "PRRC의 핵심 책임: ① 기술문서·QMS 적합성 확인, ② DoC 서명 전 검토, ③ 시판 후 의무(PMS·PSUR·바이질런스) 이행 감독, ④ EUDAMED·UDI 등록 감독, ⑤ 규제 당국 대응. 중소기업은 외부 PRRC 계약도 가능하나, 지정 사실을 문서화해야 한다.",
    ],
    refs: ["IVDR Art.15"],
    relatedStationIds: [4],
    relatedConceptSlugs: ["iso-13485", "eudamed", "pms"],
  },
  {
    slug: "ssp",
    term: "SSP — 안전성·성능 요약서",
    aka: ["Summary of Safety and Performance", "Art.29"],
    category: "deliverable",
    summary: "Class C·D 기기의 안전성·성능 데이터를 일반에 공개하는 요약 문서 (EUDAMED 게시).",
    body: [
      "SSP(Summary of Safety and Performance, 안전성·성능 요약서)는 IVDR Art.29가 **Class C·D** 기기에 의무화한 공개 문서다. 기술문서(PER·위험 파일)의 핵심을 **일반인이 읽을 수 있는 수준**으로 요약하며, EUDAMED에 게시된다.",
      "필수 항목(Annex III 참조): 기기 식별(UDI-DI), 의도된 목적, 분류·경로, 설계 특성 요약, 분석·임상 성능 결론, 잔여위험 및 이익-위험 결론, 적용 규정·표준, {{pms|PMS}}/PMPF 계획 요약, 개정 이력. NB가 검토·승인 후 EUDAMED에 업로드한다.",
    ],
    refs: ["IVDR Art.29", "Annex III"],
    relatedStationIds: [9],
    relatedConceptSlugs: ["pep-per", "pms", "eudamed", "doc"],
  },
  {
    slug: "kr-regulatory-history",
    term: "한국 의료기기 문서화 역사",
    aka: ["의료기기법 역사", "MFDS 규제 변천", "기술문서 제도"],
    category: "concept",
    summary: "1963년 약사법부터 2025년 IVDR 이중 관리까지, 한국 의료기기 문서화 제도의 60년 흐름.",
    body: [
      "**1단계 — 약사법 시대 (1963~2002): 문서 없던 시절.** 1963년 약사법 제정 시 의료기기는 의약품의 하위 개념으로 편입됐다. 등록 서류는 품목 신고서와 제조 방법 개요 수준에 불과했고, 설계 이력·위험 분석·임상 근거라는 개념 자체가 없었다. 1994년 WTO 가입 이후 수출 기업이 FDA 510(k)·CE 마킹 요건과 처음 맞닥뜨리면서 '기술문서(Technical File)가 무엇인가'라는 질문이 처음 나왔다.",
      "**2단계 — 의료기기법 독립 (2003): 가장 큰 전환점.** 2003년 5월 29일 의료기기법이 약사법에서 분리·제정됐다. 이 순간부터 '문서로 증명해야 팔 수 있다'는 패러다임이 법제화됐다. 위험도에 따른 1~4등급 분류 체계, 등급별 차등 허가/인증/신고, 기술문서(성능시험 성적서·설계 사양·원자재 등) 제출 의무가 생겼다. 배경에는 1990년대 말~2000년대 초 실리콘 보형물·불량 혈당계 부작용 사고와 이에 따른 국회 압력이 있었다.",
      "**3단계 — GMP·ISO 13485 도입 (2007~2010): 과정도 문서화.** 2007년 의료기기 제조·품질관리기준(GMP) 의무 시행으로 완제품 성적서(결과)를 넘어 제조 프로세스 전체를 문서화하는 시대가 열렸다. 설계 이력 파일(DHF)·제조 이력 기록(DHR)·품질 매뉴얼·SOP·내부 심사 기록이 필수가 됐다. 2008년 ISO 13485:2003이 한국산업표준(KS)으로 채택되면서 한국 GMP와 ISO 13485가 사실상 동일화되기 시작했다. 유럽·일본이 ISO 13485를 요구하자 수출 기업들이 먼저 도입했고 KFDA가 뒤따랐다.",
      "**4단계 — 임상·성능 근거 의무화 (2012~2016): 효과도 증명하라.** 2012년 의료기기법 개정으로 3·4등급 신규 품목에 임상시험 자료 또는 문헌 근거 제출이 의무화됐다. 2013년 KFDA가 장관급 식품의약품안전처(MFDS)로 격상되면서 예산·인력이 확대되고 규제 강도가 높아졌다. 배경에는 2011년 유럽 PIP 실리콘 보형물 스캔들로 촉발된 글로벌 임상 근거 요구 확산이 있다.",
      "**5단계 — 위험관리·PMS 명문화 (2017~2019): 출시 후에도 계속.** EU MDR 2017/745 발표에 연동해 한국도 의료기기법 전부개정(2017년 제정·2019년 시행)을 단행했다. {{iso-14971|ISO 14971}} 위험관리 파일 제출(3·4등급), 시판 후 조사(PMS) 계획·보고서 의무화, 이상 사례 보고(ICSR) 30일/15일 기한 명문화, UDI 로드맵이 함께 도입됐다.",
      "**6단계 — AI·IVD·글로벌 이중 관리 (2020~현재): 디지털 시대.** 2020년 AI 의료기기 허가 가이드라인이 처음 발표됐고, 2021년에는 체외진단기기법이 의료기기법에서 독립 분리됐다. EU IVDR(2017/746)의 성능평가 3단 구조(과학적 타당성·분석적·임상적)가 한국 체외진단기기 허가 기준에도 반영됐다. 2025년 EU IVDR 전면 시행으로 수출 기업은 EUDAMED 등록 + MDCG 가이드 반영 문서를 한국 허가 문서와 병행 관리해야 하는 **이중 문서 관리 시대**에 진입했다.",
      "**핵심 드라이버 요약.** ① 수출 필요성(FDA·CE 요건 흡수) — 가장 큰 동력. ② 국내 부작용 사고 — 국회 압력으로 독립법·GMP 제정. ③ EU MDR/IVDR 발표 — 한국 법 즉각 연동 개정. ④ AI·디지털헬스 부상 — 알고리즘 검증·RWE 등 새 문서 유형 추가. 문서화가 무거워진 이유를 한 줄로 요약하면: **'팔려면 증명해야 한다'는 글로벌 기준이 수입됐고, 국내 사고가 불신을 키워 국회가 법으로 강제했다.**",
    ],
    refs: [
      "약사법 (1963)",
      "의료기기법 (2003.5.29 제정)",
      "의료기기 GMP 기준 (2007)",
      "ISO 13485:2016 / KS P ISO 13485",
      "의료기기법 전부개정 (2017, 2019 시행)",
      "체외진단기기법 (2021)",
      "MFDS AI 의료기기 허가·심사 가이드라인 (2020~2024)",
    ],
    relatedStationIds: [1, 2, 4, 5, 6, 11],
    relatedConceptSlugs: ["iso-13485", "iso-14971", "pms", "gspr", "eudamed"],
  },
  // ── HTML wiki v8 기반 추가 개념 ──────────────────────────────────
  {
    slug: "fmea",
    term: "FMEA — 고장모드 영향분석",
    aka: ["Failure Mode and Effects Analysis", "설계 FMEA", "공정 FMEA", "DFMEA", "PFMEA"],
    category: "deliverable",
    summary: "부품·기능·공정의 잠재 고장모드와 영향을 평가해 위험을 우선순위화하는 ISO 14971 실행 도구.",
    body: [
      "FMEA(Failure Mode and Effects Analysis, 고장모드 영향분석)는 각 부품·기능·공정에서 발생할 수 있는 고장모드를 나열하고, 심각도(Severity)·발생도(Occurrence)·검출도(Detection)를 평가해 위험 우선순위를 정하는 기법이다. {{iso-14971|ISO 14971}} 위험관리의 가장 대표적인 실행 도구다.",
      "**설계 FMEA(DFMEA)**는 광학 모듈 드리프트, 센서 오차 등 설계상 고장모드를 다루고, **공정 FMEA(PFMEA)**는 제조·조립 공정의 고장모드를 다룬다. 통제 후 잔여위험도를 통제 전 값과 비교해 개선 효과를 수치로 보여야 하며, 검출 수단의 실제 신뢰성을 과대평가하면 위험 수용 판단이 왜곡된다.",
    ],
    refs: ["ISO 14971:2019", "IEC TR 24971:2020"],
    relatedStationIds: [3, 5],
    relatedConceptSlugs: ["iso-14971", "gspr", "pms"],
  },
  {
    slug: "dhf",
    term: "DHF — 설계 이력 파일",
    aka: ["Design History File", "설계개발 파일", "Design & Development File"],
    category: "deliverable",
    summary: "설계 입력→출력→검증→확인(V&V) 전 과정의 산출물을 추적하는 파일. ISO 13485의 '설계·개발 파일'에 대응.",
    body: [
      "DHF(Design History File, 설계 이력 파일)는 설계 입력(Design Input) → 설계 출력(Design Output) → 검증(Verification) → 확인(Validation)의 모든 산출물을 한 묶음으로 보존하는 파일이다. {{iso-13485|ISO 13485}} 7.3조의 '설계·개발 파일' 요건에 대응한다.",
      "각 단계의 기록이 실제로 존재하는지, 최신 설계 변경이 반영되어 있는지가 핵심이다. 특히 **검증(Verification, 사양 충족)**과 **확인(Validation, 사용 목적 충족)**을 혼동하면 NB 심사에서 지적된다. 설계 입력 요구마다 어떤 출력과 검증이 대응되는지 추적표(Traceability Matrix)를 유지하는 것이 좋다.",
    ],
    refs: ["ISO 13485:2016 §7.3", "IVDR Annex II §3"],
    relatedStationIds: [3, 4, 5],
    relatedConceptSlugs: ["iso-13485", "iso-14971", "pep-per"],
  },
  {
    slug: "vigilance",
    term: "Vigilance — 중대사고 보고",
    aka: ["Vigilance Reporting", "중대사고", "FSCA", "Field Safety Corrective Action", "비질런스"],
    category: "concept",
    summary: "중대사고(Serious Incident)와 현장안전조치(FSCA)를 법정 기한 내 당국에 보고하는 의무 체계.",
    body: [
      "Vigilance(비질런스)는 중대사고(Serious Incident)와 현장안전조치(FSCA, Field Safety Corrective Action)를 관할 당국에 보고하는 의무 체계다. {{pms|PMS(시판 후 감시)}}의 하위 축이지만 **법정 기한**이 있어 별도로 관리해야 한다. 기한 초과는 그 자체로 규제 위반이다.",
      "출시 제품은 중대사고 인지 시 즉시 보고 절차를 가동해야 한다. 트리거 정의, 담당자, 보고 기한, 양식을 SOP로 명확히 정의하고 훈련하는 것이 핵심이다. 중대성 판단이 애매한 경우 '인지 시점'부터 기한이 흐른다고 보수적으로 처리해야 과태료 위험을 피할 수 있다.",
    ],
    refs: ["IVDR Art.82~89", "MEDDEV 2.12/1", "EU Implementing Regulation 2022/197"],
    relatedStationIds: [9, 10, 11],
    relatedConceptSlugs: ["pms", "eudamed", "gspr"],
  },
  {
    slug: "ifu",
    term: "IFU / 라벨링",
    aka: ["Instructions for Use", "사용설명서", "Labelling", "IFU", "Labels"],
    category: "deliverable",
    summary: "IVDR Annex I Chapter III 요건과 EN ISO 18113 기준을 충족해야 하는 라벨과 사용설명서.",
    body: [
      "IFU(Instructions for Use, 사용설명서)와 라벨은 단순 안내문이 아니라 **위험통제 수단**이다. {{gspr|GSPR}} Annex I Chapter III의 정보 제공 요구와 EN ISO 18113(체외진단 기기 라벨 정보) 기준을 충족해야 한다. 기호 사용은 EN ISO 15223에 따른다.",
      "가정용·자가검사 기기는 일반인 가독성이 특히 중요하다. {{iec-62366|IEC 62366}} 사용적합성 평가 전에 IFU를 최종화하면 안 된다 — 평가 결과에 따라 문구·그림이 바뀔 수 있다. UDI 표기, 경고·한계·해석 안내도 필수 항목이다.",
    ],
    refs: ["IVDR Annex I Chapter III", "EN ISO 18113", "EN ISO 15223-1"],
    relatedStationIds: [6, 8, 10],
    relatedConceptSlugs: ["gspr", "iec-62366", "udi"],
  },
  {
    slug: "gdpr",
    term: "GDPR — 개인정보보호규정",
    aka: ["General Data Protection Regulation", "GDPR", "개인정보보호"],
    category: "concept",
    summary: "EU 개인정보 처리를 규율하는 규정. IVDR과 별개이지만 기기·앱이 건강정보를 다루면 함께 적용.",
    body: [
      "GDPR(General Data Protection Regulation, 일반개인정보보호규정)은 IVDR과 별개의 규제 축이지만, 기기나 앱이 측정 결과·건강정보 등 **개인 건강 데이터**를 처리하면 동시에 적용된다. 건강·생식 관련 데이터는 GDPR상 **민감정보(특수범주)**로, 원칙적으로 처리가 금지되며 명확한 법적 근거가 필요하다.",
      "준수를 위해서는 데이터 처리 흐름도(Data Flow Map), 처리 목적별 적법근거, 동의 관리, 보관 기한, 국외이전 대응을 별도로 문서화해야 한다. IVDR 인증이 통과해도 GDPR 위반은 독립적으로 제재(최대 전 세계 연매출 4% 또는 2,000만 유로)가 부과된다.",
    ],
    refs: ["GDPR (EU) 2016/679", "Art.9 특수범주 데이터"],
    relatedStationIds: [],
    relatedConceptSlugs: ["pms", "eudamed"],
  },
  {
    slug: "mdsw",
    term: "MDSW — 의료기기 소프트웨어",
    aka: ["Medical Device Software", "MDSW", "SaMD", "Software as Medical Device"],
    category: "concept",
    summary: "의료 목적 기능(진단·해석·측정 등)을 수행하는 소프트웨어로, 기기 또는 독립형 소프트웨어로 규제 대상이 될 수 있음.",
    body: [
      "MDSW(Medical Device Software)는 소프트웨어가 단순 표시·기록을 넘어 **결과 산출·해석**에 관여하면 규제 대상 의료기기(또는 그 일부)로 분류될 수 있다. 해당 여부는 기능 명세와 의도된 목적을 기준으로 RA가 판단하며, MDCG 2019-11 등 가이던스를 참고한다.",
      "MDSW로 판정되면 소프트웨어 수명주기({{iec-62304|IEC 62304}}), 검증·확인, 사이버보안(IEC 81001-5-1), {{iso-14971|ISO 14971}} 위험관리 요건이 추가된다. '그냥 앱'으로 단정하면 후반부에 대규모 재작업이 필요해진다. 기능을 '표시/기록'과 '산출/해석'으로 분류하면 판단이 명확해진다.",
    ],
    refs: ["MDCG 2019-11", "IEC 62304:2015+A1", "IVDR Annex I §16"],
    relatedStationIds: [5, 8],
    relatedConceptSlugs: ["iec-62304", "iso-14971", "gspr", "iec-62366"],
  },
];

export const conceptBySlug = (slug: string): WikiConcept | undefined =>
  concepts.find((c) => c.slug === slug);
