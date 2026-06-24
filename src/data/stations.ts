// =====================================================================
// src/data/stations.ts
// IVDR 여정 콘텐츠 — 부록 A (검증된 규제 사실 포함, 2026.6 기준)
// 글/조항 수정은 이 파일에서만. 컴포넌트 코드와 분리되어 유지보수가 쉽다.
// =====================================================================

export type PhaseId = "p1" | "p2" | "p3" | "p4" | "p5";

export interface Phase {
  id: PhaseId;
  order: number;
  title: string; // "범위 정의"
  subtitle: string; // 페이즈 한 줄 설명
  colorVar: string; // "--p1"
  tintVar: string; // "--p1-tint"
}

/** 상태칩 — 색 단독 금지(IEC 62366): 항상 라벨 텍스트를 동반한다. */
export type TagTone = "neutral" | "info" | "warning" | "danger" | "success";

export interface StationTag {
  label: string;
  tone: TagTone;
}

export interface ForkPath {
  label: string; // "Class A (비멸균)"
  desc: string;
  route: string; // "자가선언 → 바로 CE"
  tone: TagTone; // 분기별 위험/난이도 신호
}

export interface Station {
  id: number; // 1..11
  phase: PhaseId;
  title: string; // "출발점 — 내 제품이 IVD인가?"
  icon: string; // lucide 이름: "target"
  oneLine: string; // 카드 한 줄
  tag: StationTag; // 상태칩
  body: string[]; // 상세 문단 (마크다운 허용)
  todo: string; // 🧭 지금 할 일 (한 줄)
  refs: string[]; // 관련 조항
  note?: string; // 비고/주의
  forks?: ForkPath[]; // St2만: 갈림길
}

// ---------------------------------------------------------------------
// 5 페이즈
// ---------------------------------------------------------------------
export const phases: Phase[] = [
  {
    id: "p1",
    order: 1,
    title: "범위 정의",
    subtitle: "내가 무엇을 인증하는지 못 박기",
    colorVar: "--p1",
    tintVar: "--p1-tint",
  },
  {
    id: "p2",
    order: 2,
    title: "분류·경로",
    subtitle: "여정의 갈림길 — 클래스가 모든 것을 결정",
    colorVar: "--p2",
    tintVar: "--p2-tint",
  },
  {
    id: "p3",
    order: 3,
    title: "증거 구축",
    subtitle: "QMS·기술문서·성능·위험 — 인증의 본체",
    colorVar: "--p3",
    tintVar: "--p3-tint",
  },
  {
    id: "p4",
    order: 4,
    title: "적합성 인증",
    subtitle: "심사를 통과하고 CE를 부착",
    colorVar: "--p4",
    tintVar: "--p4-tint",
  },
  {
    id: "p5",
    order: 5,
    title: "시장·유지",
    subtitle: "출시 후에도 끝나지 않는 루프",
    colorVar: "--p5",
    tintVar: "--p5-tint",
  },
];

export const phaseById = (id: PhaseId): Phase =>
  phases.find((p) => p.id === id)!;

// ---------------------------------------------------------------------
// 11 정거장 (부록 A)
// ---------------------------------------------------------------------
export const stations: Station[] = [
  {
    id: 1,
    phase: "p1",
    title: "출발점 — 내 제품이 IVD인가?",
    icon: "target",
    oneLine: "내 제품이 IVD인가? 의도된 목적을 확정한다.",
    tag: { label: "여정 시작", tone: "neutral" },
    body: [
      "모든 IVDR 여정은 {{intended-purpose|의도된 목적(intended purpose)}} 한 문단에서 시작한다. 이 문장이 제품의 분류·성능 요구·라벨링·심사 범위를 전부 좌우하므로, 가장 먼저 그리고 가장 정확하게 못 박아야 한다.",
      "의도된 목적은 다음 5요소를 포함해야 한다 — **무엇을** 검출/측정하는가, 어떤 **검체**(혈액·소변·타액 등)를 쓰는가, **사용자**는 누구인가(전문가·자가검사), 사용 **환경**은 어디인가(실험실·근접검사·가정), 그리고 그 결과로 어떤 임상적 **결정**을 돕는가.",
      "제품이 IVDR Art.2 의 IVD 정의에 해당하는지 먼저 확인한다. 정의에 들어오지 않으면 IVDR 대상이 아니며, 들어오면 이후 11정거장 전부가 적용된다.",
    ],
    todo: "의도된 목적(무엇·검체·사용자·환경·결정)을 한 문단으로 확정",
    refs: ["IVDR Art.2 (정의)"],
  },
  {
    id: 2,
    phase: "p2",
    title: "분류 — 클래스 결정",
    icon: "git-fork",
    oneLine: "Class A/B/C/D 결정 — 여정의 갈림길.",
    tag: { label: "결정점", tone: "danger" },
    body: [
      "IVDR은 위험 기반 4단계 분류(A < B < C < D)를 쓴다. {{annex-viii|Annex VIII 의 Rule 1~7}} 을 순서대로 적용해 가장 높은 위험 등급을 채택한다. 클래스는 평가 경로·{{notified-body|NB}} 개입·전환 기한을 전부 바꾸므로 여정 전체의 갈림길이다.",
      "분류 결과와 그 근거(어떤 Rule을 왜 적용했는지)를 **1장짜리 분류 근거 문서**로 남겨야 한다. 이는 기술문서의 첫 장이자 NB가 가장 먼저 보는 자료다.",
      "특히 **자가검사(self-testing)·근접검사(near-patient)** 는 Rule 4에 의해 대체로 **Class C** 로 올라간다(임신·가임력 검사 일부만 B). 일반 소비자 대상 스틱·스트립 제품이라면 거의 확실히 C 이상이라고 보는 것이 안전하다.",
    ],
    todo: "Annex VIII Rule 1~7로 클래스 결정 + 분류 근거 1장 작성",
    refs: ["IVDR Annex VIII (분류 규칙)"],
    note: "자가검사·근접검사는 Rule 4로 대체로 Class C (임신·가임력 일부는 B).",
    forks: [
      {
        label: "Class A (비멸균)",
        desc: "최저 위험. NB 개입 없음.",
        route: "자가선언 → 바로 CE (NB 생략)",
        tone: "success",
      },
      {
        label: "Class A 멸균 / B / C",
        desc: "중간 위험. 인증기관 심사 필요.",
        route: "NB 개입 필수",
        tone: "warning",
      },
      {
        label: "Class D",
        desc: "최고 위험. 가장 무거운 경로.",
        route: "NB + EU 기준검사실 검증 + 공통기술규격(CS)",
        tone: "danger",
      },
    ],
  },
  {
    id: 3,
    phase: "p2",
    title: "평가 경로 선택",
    icon: "route",
    oneLine: "클래스별 적합성 평가 절차를 선택한다.",
    tag: { label: "경로 확정", tone: "info" },
    body: [
      "클래스가 정해지면 그에 맞는 **적합성 평가 경로(Annex IX~XI)** 를 택한다. 대부분의 B/C/D는 **Annex IX**(전체 QMS + 기술문서 심사) 경로를 따르고, 일부는 Annex X(형식검사)+XI(생산품질보증)를 조합한다.",
      "경로가 확정되면 그 경로가 요구하는 **산출물 체크리스트**를 만들어 이후 정거장(QMS·기술문서·성능·위험)의 작업 범위를 미리 고정한다. 경로를 늦게 정하면 증거를 다시 만드는 재작업이 발생한다.",
    ],
    todo: "내 클래스의 Annex(IX/X/XI) 경로 확정 + 산출물 체크리스트",
    refs: ["IVDR Art.48", "Annex IX~XI (적합성 평가)"],
  },
  {
    id: 4,
    phase: "p3",
    title: "QMS — 품질경영시스템",
    icon: "layers",
    oneLine: "ISO 13485 — 모든 활동에 깔리는 바닥.",
    tag: { label: "기반 시스템", tone: "info" },
    body: [
      "QMS는 특정 정거장이 아니라 **전체 여정에 깔리는 바닥**이다. 대부분 {{iso-13485|ISO 13485:2016}} 으로 구축하되, IVDR이 추가로 요구하는 고유 프로세스({{pep-per|성능평가}}·{{pms|PMS·PSUR}}·{{udi|UDI}} 등)를 절차서에 명시적으로 연결해야 한다.",
      "Art.10(8)은 제조자가 QMS를 수립·문서화·유지하도록 요구한다. 전환 기한 연장을 받으려면 **2025.5.26 까지 Art.10(8) QMS** 가 갖춰져 있어야 하는 조건이 걸려 있으므로, QMS는 일정상 가장 먼저 착수할 항목이다.",
    ],
    todo: "ISO 13485 QMS 구축 + IVDR 고유 프로세스를 절차서에 연결",
    refs: ["IVDR Art.10(8)", "ISO 13485:2016"],
    note: "ISO 13485 인증서만으로 IVDR을 충족하는 것은 아니다 — IVDR 고유 요구를 별도로 반영해야 한다.",
  },
  {
    id: 5,
    phase: "p3",
    title: "기술문서 (Technical Documentation)",
    icon: "file-text",
    oneLine: "Annex II·III 증거 묶음.",
    tag: { label: "증거 묶음", tone: "info" },
    body: [
      "기술문서는 제품의 적합성을 입증하는 **증거 묶음**이다. {{annex-ii|Annex II}}(기술문서)와 {{annex-iii|Annex III}}(시판 후 감시 기술문서)의 목차를 그대로 폴더 구조로 만들어 각 항목에 담당자와 기한을 배정한다.",
      "기술문서의 출발점은 {{gspr|GSPR(일반 안전·성능 요구사항, Annex I)}} 체크리스트다. 각 요구사항에 대해 '적용 여부 → 충족 방법 → 증거 위치'를 한 줄씩 매핑하면 성능평가·위험관리 산출물이 자연스럽게 연결된다.",
    ],
    todo: "Annex II 목차를 폴더 구조로 만들고 담당·기한 배정",
    refs: ["IVDR Annex II (기술문서)", "Annex III (PMS 기술문서)", "Annex I (GSPR)"],
  },
  {
    id: 6,
    phase: "p3",
    title: "성능평가 (Performance Evaluation)",
    icon: "activity",
    oneLine: "과학적·분석적·임상적 성능 3단 (Annex XIII).",
    tag: { label: "3단 설계", tone: "info" },
    body: [
      "성능평가는 IVDR의 임상적 심장부다. **과학적 타당성 → 분석적 성능 → 임상적 성능** 의 3단으로 구성되며, 먼저 {{pep-per|성능평가 계획(PEP)}} 을 세운 뒤 데이터를 모아 {{pep-per|성능평가 보고서(PER)}} 로 닫는다.",
      "분석적 성능(정밀도·정확도·검출한계·교차반응 등)과 임상적 성능(민감도·특이도·임상적 유효성)을 어떤 연구로 확보할지 PEP 단계에서 설계해야 재작업이 없다. {{annex-xiii|Annex XIII}}가 요구하는 항목을 PEP 목차로 삼는다.",
    ],
    todo: "성능평가 계획(PEP) 먼저 — 과학적·분석적·임상적 3단 설계",
    refs: ["IVDR Art.56", "Annex XIII (성능평가)"],
    note: "산출물 흐름: PEP(계획) → PER(보고서).",
  },
  {
    id: 7,
    phase: "p3",
    title: "위험관리 (Risk Management)",
    icon: "shield-alert",
    oneLine: "ISO 14971 + GSPR(Annex I) 양방향 추적.",
    tag: { label: "추적 연결", tone: "info" },
    body: [
      "위험관리는 {{iso-14971|ISO 14971:2019}} 에 따라 위험 분석→평가→통제→잔여위험 평가를 수행하고, 그 결과를 {{gspr|GSPR(Annex I)}} 및 성능평가 결과와 **양방향으로 추적 연결**한다. 위험-요구-증거가 서로를 가리키지 않으면 NB 심사에서 막힌다.",
      "자가검사 제품은 사용자가 비전문가이므로 {{iec-62366|IEC 62366 사용적합성(usability)}} 엔지니어링을 위험관리와 연계해야 한다. 사용 오류가 곧 임상적 위험이 되기 때문이다.",
    ],
    todo: "ISO 14971 파일을 GSPR·성능결과와 양방향 추적 연결",
    refs: ["ISO 14971:2019", "IVDR Annex I (GSPR)"],
    note: "자가검사는 IEC 62366 사용적합성과 연계한다.",
  },
  {
    id: 8,
    phase: "p4",
    title: "NB 심사 (Notified Body)",
    icon: "badge-check",
    oneLine: "Notified Body 적합성 심사 (A 비멸균 제외).",
    tag: { label: "마감 2026.5.26", tone: "danger" },
    body: [
      "Class A 비멸균을 제외한 모든 기기는 {{notified-body|인증기관(Notified Body)}} 의 심사를 받아야 한다. NB는 QMS와 기술문서를 심사하고, 통과하면 인증서를 발급한다.",
      "{{notified-body|NANDO}} 데이터베이스에서 내 제품 scope를 다루는 NB를 조기에 찾아 접촉하고 **서면 계약**을 확보해야 한다. NB의 심사 슬롯은 한정적이라, 늦으면 시장 접근 자체가 지연된다.",
    ],
    todo: "NANDO에서 내 scope 다루는 NB 조기 접촉, 서면계약 확보",
    refs: ["IVDR Art.38~46 (인증기관)"],
    note: "위험: NB 슬롯 지연 시 시장 접근 차단. Class C 레거시 기기의 NB 신청 마감은 2026.5.26.",
  },
  {
    id: 9,
    phase: "p4",
    title: "CE 마킹",
    icon: "stamp",
    oneLine: "적합성 선언(Annex IV) + CE 부착(Annex V).",
    tag: { label: "적합성 선언", tone: "success" },
    body: [
      "심사를 통과하면 제조자가 {{doc|적합성 선언서(DoC, Annex IV)}} 를 작성·서명하여 제품이 IVDR을 충족함을 공식 선언하고, {{ce-marking|CE 마킹(Annex V)}} 을 규정에 맞게 부착한다.",
      "DoC의 필수 항목(제품 식별·분류·적용 규정·NB 정보 등)을 점검하고, CE 부착 규정을 **라벨링/IFU** 와 연동해 라벨에 누락이 없도록 한다. CE는 곧 EU 시장 출시 자격이다.",
    ],
    todo: "적합성 선언서 항목 점검 + CE 부착 규정을 라벨링과 연동",
    refs: ["IVDR Annex IV (DoC)", "Annex V (CE)", "Art.18"],
  },
  {
    id: 10,
    phase: "p5",
    title: "EUDAMED + UDI",
    icon: "database",
    oneLine: "행위자·기기 등록 + 고유기기식별.",
    tag: { label: "2026.5.28 의무화", tone: "warning" },
    body: [
      "출시를 위해 {{eudamed|EUDAMED}}(유럽 의료기기 데이터베이스)에 등록한다. 먼저 {{srn|행위자 등록으로 SRN(단일 등록 번호)}} 을 확보한 뒤, 기기를 등록하고 {{udi|UDI-DI}} 식별 체계를 정리한다.",
      "Decision (EU) 2025/2371 에 따라 EUDAMED **첫 4개 모듈이 2026.5.28 의무화** 되며, 레거시 기기 등록은 **2026.11.28** 까지 완료해야 한다. 등록 누락은 합법 출시를 막는다.",
    ],
    todo: "행위자 등록으로 SRN 먼저 확보 + UDI-DI 체계 정리",
    refs: ["IVDR Art.24·26", "Annex VI", "Decision (EU) 2025/2371"],
    note: "EUDAMED 첫 4개 모듈 2026.5.28 의무화, 레거시 기기 등록 2026.11.28까지.",
  },
  {
    id: 11,
    phase: "p5",
    title: "시판 후 감시 (PMS)",
    icon: "repeat",
    oneLine: "PMS·PMPF·PSUR — 루프로 환류.",
    tag: { label: "환류 루프", tone: "info" },
    body: [
      "인증은 끝이 아니다. {{pms|시판 후 감시(PMS)}} 계획을 QMS에 통합하고, **PMS → 성능평가 → 위험관리** 로 데이터가 되돌아가는 **환류 경로**를 명문화한다. 시장에서 얻은 신호가 증거를 갱신한다.",
      "{{annex-xiii|PMPF}}(시판 후 성능 추적, Annex XIII Part B)로 성능을 지속 확인하고, **Class C·D는 PSUR(정기 안전성 보고서)을 매년** 갱신해야 한다. 이 루프가 IVDR을 '한 번 통과'가 아닌 '계속 유지'로 만든다.",
    ],
    todo: "PMS 계획을 QMS에 통합 + PMS→성능→위험 환류 경로 명문화",
    refs: ["IVDR Art.78~81", "Annex XIII Part B (PMPF)"],
    note: "Class C·D는 PSUR 매년 갱신.",
  },
];

// ---------------------------------------------------------------------
// 정거장별 '알아야 할 정보' 체크리스트 — 이 단계에서 머릿속에 정리돼 있어야 할 것.
// ---------------------------------------------------------------------
export const stationKnowledge: Record<number, string[]> = {
  1: [
    "내 제품이 검출/측정하는 정확한 대상과 그 임상적 의미",
    "검체 종류(혈액·소변·타액 등)",
    "사용자(전문가/자가검사)와 사용 환경(실험실/가정)",
    "결과가 보조하는 임상 결정",
    "IVDR Art.2 IVD 정의 해당 여부",
  ],
  2: [
    "확정된 의도된 목적(St1 결과)",
    "검출 대상의 위험 수준(감염성·생명위협 여부)",
    "자가검사·근접검사 여부와 Rule 4 영향",
    "Annex VIII Rule 1~7 적용 순서",
    "둘 이상 해당 시 최고 등급 채택 원칙",
  ],
  3: [
    "확정된 클래스(A/B/C/D)",
    "클래스별 가능한 Annex 경로(IX/X/XI)의 차이",
    "각 경로에서 NB가 심사하는 범위",
    "경로별로 필요한 산출물 목록",
  ],
  4: [
    "ISO 13485와 IVDR 요구의 차이",
    "IVDR 고유 프로세스 목록(성능·PMS·PSUR·UDI 등)",
    "Art.10(8) QMS 시점 요건(전환 조건 2025.5.26)",
    "조직·책임 체계(PRRC 포함)",
  ],
  5: [
    "Annex II·III 기술문서 목차 구조",
    "GSPR(Annex I) 각 항목의 의미와 적용 여부",
    "각 요구의 증거가 어디에 있는지(추적성)",
    "설계관리·성능·위험 산출물과의 연결",
  ],
  6: [
    "성능평가 3단(과학적·분석적·임상적)의 관계",
    "각 성능 지표의 정의와 수용 기준",
    "필요한 연구 유형(중재/비중재)",
    "PEP → 데이터 → PER 흐름",
  ],
  7: [
    "ISO 14971 위험관리 흐름",
    "위험 수용 기준 설정 방법",
    "위험-요구(GSPR)-성능 양방향 추적의 의미",
    "자가검사면 IEC 62366 사용적합성 연계",
  ],
  8: [
    "내 클래스의 NB 개입 여부",
    "NANDO에서 내 scope를 다루는 NB 매칭",
    "심사 단계·소요 기간·슬롯 지연 리스크",
    "레거시 마감(Class C 신청 2026.5.26)",
  ],
  9: [
    "Annex IV 적합성 선언서(DoC) 필수 기재 항목",
    "CE 부착 규칙(크기·위치·NB 번호 병기)",
    "라벨링·IFU와의 항목 일관성",
    "SSP(Class C·D) 필요 여부",
  ],
  10: [
    "행위자 역할 구분(제조자/대리인/수입자)",
    "SRN 발급 → 기기 등록의 선후 관계",
    "Basic UDI-DI와 UDI-DI의 관계",
    "의무 시점(첫 4개 모듈 2026.5.28 · 레거시 2026.11.28)",
  ],
  11: [
    "능동 vs 수동 PMS 데이터",
    "PMS → 성능 → 위험 환류 경로",
    "PSUR 주기(Class C·D 매년)",
    "바이질런스 보고 기한·대상 당국",
  ],
};

export const stationKnowledgeFor = (id: number): string[] =>
  stationKnowledge[id] ?? [];

// ---------------------------------------------------------------------
// 전환 기한 (TransitionTimeline) — Regulation (EU) 2024/1860
// ---------------------------------------------------------------------
export interface TransitionMilestone {
  cls: string; // "Class D"
  deadline: string; // "2027.12"
  detail?: string; // 부가 마일스톤
  tone: TagTone;
}

export const transitions: TransitionMilestone[] = [
  {
    cls: "A 비멸균",
    deadline: "2022.5.26",
    detail: "연장 없음 — 이미 전면 적용",
    tone: "danger",
  },
  {
    cls: "Class D",
    deadline: "2027.12",
    detail: "NB 신청 2025.5.26 · 서면계약 2025.9.26",
    tone: "warning",
  },
  {
    cls: "Class C",
    deadline: "2028.12",
    detail: "NB 신청 2026.5.26 · 서면계약 2026.9.26",
    tone: "warning",
  },
  {
    cls: "Class B · A멸균",
    deadline: "2029.12",
    detail: "NB 신청 2027.5.26 · 서면계약 2027.9.26",
    tone: "info",
  },
];

/** 전환 기한 연장은 자동이 아니다 — 아래 조건을 모두 충족해야 한다. */
export const transitionConditions: string[] = [
  "IVDD 적합성을 계속 유지할 것",
  "2025.5.26까지 Art.10(8) QMS를 갖출 것",
  "클래스별 마일스톤(NB 신청·서면계약)을 기한 내 충족할 것",
];
