// ivdr-wiki/src/data/iso13485/stations.ts

export type ISO13485PhaseId = "qms" | "resource" | "realization" | "improvement";

export interface ISO13485Phase {
  id: ISO13485PhaseId;
  order: number;
  title: string;
  subtitle: string;
  colorVar: string;
  tintVar: string;
}

export interface ISO13485Station {
  id: number;
  phase: ISO13485PhaseId;
  title: string;
  icon: string;
  oneLine: string;
  tag: { label: string; tone: "neutral" | "info" | "warning" | "danger" | "success" };
  body: string[];
  todo: string;
  refs: string[];
  note?: string;
}

export const iso13485Phases: ISO13485Phase[] = [
  { id: "qms",         order: 1, title: "QMS 기반",    subtitle: "문서체계·경영책임 수립",    colorVar: "--p1", tintVar: "--p1-tint" },
  { id: "resource",    order: 2, title: "자원 관리",   subtitle: "인적·인프라 자원 확보",     colorVar: "--p2", tintVar: "--p2-tint" },
  { id: "realization", order: 3, title: "제품 실현",   subtitle: "설계~생산~서비스·교정",    colorVar: "--p3", tintVar: "--p3-tint" },
  { id: "improvement", order: 4, title: "측정·개선",   subtitle: "감사·시정·예방 루프",       colorVar: "--p4", tintVar: "--p4-tint" },
];

export const iso13485PhaseById = (id: ISO13485PhaseId): ISO13485Phase =>
  iso13485Phases.find((p) => p.id === id)!;

export const iso13485Stations: ISO13485Station[] = [
  {
    id: 1,
    phase: "qms",
    title: "QMS 문서화 체계",
    icon: "folder-open",
    oneLine: "Clause 4 — QMS 적용 범위·절차서·기록을 관리해요",
    tag: { label: "기반 수립", tone: "info" },
    body: [
      "ISO 13485:2016 Clause 4는 품질경영시스템(QMS)의 **문서화 요구사항**을 정해요. 조직은 문서로 된 정보 체계를 갖춰야 해요. 품질매뉴얼, 적용 범위 설명, 절차서(필수 6가지 이상), 작업지시서, 기록 등이 들어가요.",
      "특히 4.2.4(의료기기 파일)와 4.2.5(기록 관리)는 심사관이 꼼꼼히 보는 항목이에요. 모든 기록은 최소 제품 수명 + 2년(또는 국가별 규정) 동안 보관해야 해요.",
    ],
    todo: "QMS 적용 범위 문서, 절차서 목록, 기록 보관 기간 정책을 만들어 주세요",
    refs: ["ISO 13485:2016 Clause 4.1", "4.2.1", "4.2.3", "4.2.4", "4.2.5"],
  },
  {
    id: 2,
    phase: "qms",
    title: "경영 책임",
    icon: "users",
    oneLine: "Clause 5 — 경영진 의지·품질방침·목표·경영검토예요",
    tag: { label: "경영 참여", tone: "info" },
    body: [
      "Clause 5는 최고경영진이 QMS(품질경영시스템)에 직접 참여해야 한다고 정해요. 품질방침(5.3)과 품질목표(5.4.1)를 문서로 만들고, 조직 전체에 알려요. 그리고 경영 검토(5.6)를 정기적으로 해서 QMS가 효과적인지 평가해야 해요.",
      "경영 검토의 입력 항목(고객 피드백·프로세스 성과·시정/예방조치·변경 사항 등)과 출력 항목(개선 결정·자원 필요성)을 기록으로 남겨 두어야 해요.",
    ],
    todo: "품질방침·목표를 문서로 만들고, 경영 검토 주기·의제·기록 서식을 정해 주세요",
    refs: ["ISO 13485:2016 Clause 5.1", "5.3", "5.4", "5.5", "5.6"],
  },
  {
    id: 3,
    phase: "resource",
    title: "인적 자원·역량",
    icon: "graduation-cap",
    oneLine: "Clause 6.2 — 역량 요건·교육훈련·역량 확인이에요",
    tag: { label: "역량 관리", tone: "info" },
    body: [
      "Clause 6.2는 QMS(품질경영시스템) 활동에 영향을 주는 직원의 역량을 교육·경험·기술로 정하라고 요구해요. 그 역량이 맞는지 평가하고 문서로 남겨야 해요. 역량 매트릭스와 교육훈련 기록은 심사에서 꼭 확인하는 항목이에요.",
      "교육훈련이 실제로 효과가 있었는지 보는 **효과성 평가** 방법(퀴즈·현장 평가·관찰 등)을 미리 정해 두세요. 훈련을 마쳤다는 기록만으로는 부족해요.",
    ],
    todo: "역할별 역량 매트릭스를 만들고, 교육훈련 계획과 효과성 평가 방법을 정해 주세요",
    refs: ["ISO 13485:2016 Clause 6.2"],
  },
  {
    id: 4,
    phase: "resource",
    title: "인프라·작업환경",
    icon: "building-2",
    oneLine: "Clause 6.3–6.4 — 시설·장비·소프트웨어·작업환경이에요",
    tag: { label: "환경 통제", tone: "info" },
    body: [
      "Clause 6.3은 제품 적합성에 필요한 인프라(건물·장비·소프트웨어·지원 서비스)를 유지보수하라고 요구해요. Clause 6.4는 작업환경 조건(오염 방지·청결·온습도 등)을 문서로 정하고 모니터링하라고 정해요.",
      "소프트웨어를 품질 활동(검사·측정·데이터 관리 등)에 쓰면 **소프트웨어 밸리데이션(4.1.6)** 이 필요해요. 자주 놓치는 항목이에요.",
    ],
    todo: "인프라 목록과 유지보수 일정을 만들고, 작업환경 기준값과 모니터링 기록을 설계해 주세요",
    refs: ["ISO 13485:2016 Clause 6.3", "6.4", "4.1.6"],
  },
  {
    id: 5,
    phase: "realization",
    title: "설계·개발 관리",
    icon: "pen-tool",
    oneLine: "Clause 7.3 — 설계 계획·입력·출력·검증·유효성확인이에요",
    tag: { label: "설계 통제", tone: "info" },
    body: [
      "Clause 7.3은 설계·개발 전 과정을 계획하고, 실행하고, 기록하라고 요구해요. 설계 입력(요구사항)→ 설계 출력(도면·사양)→ 검증(요구사항을 충족했는지 확인)→ 유효성확인(의도된 사용에 맞는지 확인)의 흐름을 추적할 수 있어야 해요.",
      "**설계 변경(7.3.9)** 관리도 중요해요. 모든 변경은 영향 평가, 검증/유효성확인, 승인 기록을 남겨야 해요. IVDR QMS의 설계 관리와 대부분 겹쳐요.",
    ],
    todo: "설계 계획서, 입출력 추적표(Design History File), 변경 관리 절차서를 써 주세요",
    refs: ["ISO 13485:2016 Clause 7.3.1", "7.3.2", "7.3.3", "7.3.4", "7.3.5", "7.3.7", "7.3.9"],
    note: "IVDR 기술문서(Annex II)의 설계 산출물이 이 정거장의 공통 증거가 돼요.",
  },
  {
    id: 6,
    phase: "realization",
    title: "구매·공급자 관리",
    icon: "truck",
    oneLine: "Clause 7.4 — 공급자 선정·평가·구매 정보·검사예요",
    tag: { label: "공급망 통제", tone: "warning" },
    body: [
      "Clause 7.4는 외부에서 사 오는 제품/서비스가 품질에 주는 영향에 따라 공급자를 고르고, 평가하고, 모니터링하라고 요구해요. **승인공급자목록(ASL)** 을 유지하고, 공급자 성과를 주기적으로 다시 평가해야 해요.",
      "구매 정보(7.4.2)에는 무엇을 사는지 분명히 적어야 해요. 구매 검사(7.4.3)는 정해진 방법으로 하고 기록을 남겨요.",
    ],
    todo: "승인공급자목록을 만들고, 공급자 평가 기준·주기와 구매 검사 절차서를 정해 주세요",
    refs: ["ISO 13485:2016 Clause 7.4.1", "7.4.2", "7.4.3"],
  },
  {
    id: 7,
    phase: "realization",
    title: "생산·서비스 제공",
    icon: "factory",
    oneLine: "Clause 7.5 — 생산 통제·청결·추적성·고객 자산이에요",
    tag: { label: "생산 관리", tone: "info" },
    body: [
      "Clause 7.5는 제품을 만드는 전 과정(생산·서비스·포장·보관)의 통제 요구사항을 정해요. 특히 7.5.3(추적성)에 따라 배치/묶음 단위로 제품을 식별하고 추적할 수 있어야 해요. 7.5.4(고객 자산)에 따라 고객 소유 자재·기기는 따로 관리해야 해요.",
      "서비스 제공(7.5.1.2.2)이 해당되면 서비스 절차서와 기록을 유지해야 해요. 무균 제품에는 7.5.2(청결)에 따른 별도 요건이 적용돼요.",
    ],
    todo: "생산 작업지시서, 배치 기록 양식, 추적성 체계, 고객 자산 관리 절차서를 만들어 주세요",
    refs: ["ISO 13485:2016 Clause 7.5.1", "7.5.2", "7.5.3", "7.5.4"],
  },
  {
    id: 8,
    phase: "realization",
    title: "측정장비 관리",
    icon: "gauge",
    oneLine: "Clause 7.6 — 교정·검증·측정 불확도·소프트웨어예요",
    tag: { label: "교정 관리", tone: "info" },
    body: [
      "Clause 7.6은 측정·모니터링에 쓰는 기기를 국제표준까지 거슬러 확인할 수 있는(소급 가능한) 교정/검증으로 관리하라고 요구해요. 교정 상태, 불합격 기기 처리, 이전 측정 결과를 다시 평가할 필요가 있는지를 기록으로 남겨야 해요.",
      "측정 소프트웨어도 쓰기 전에 밸리데이션이 필요해요(4.1.6). 교정 기록은 기기 수명 동안 보관해야 해요.",
    ],
    todo: "측정장비 목록을 만들고, 교정 일정·방법·기준값과 교정 기록 양식을 정해 주세요",
    refs: ["ISO 13485:2016 Clause 7.6"],
  },
  {
    id: 9,
    phase: "improvement",
    title: "모니터링·내부심사",
    icon: "search",
    oneLine: "Clause 8.1–8.2 — 고객만족·내부심사·프로세스/제품 모니터링이에요",
    tag: { label: "감시 체계", tone: "info" },
    body: [
      "Clause 8.2에는 고객 만족 모니터링(8.2.1), 내부심사(8.2.2), 프로세스 모니터링(8.2.3), 제품 모니터링(8.2.4~8.2.6) 요건이 들어 있어요. 내부심사는 독립성이 보장된 심사원이 해야 해요. 발견사항은 모두 기록하고 시정조치와 연결해야 해요.",
      "고객 만족을 재는 방법(설문·컴플레인 분석 등)과 활용 계획을 미리 정해 두세요. 이 데이터는 경영 검토의 입력 항목이기도 해요.",
    ],
    todo: "내부심사 프로그램(연간), 심사 체크리스트, 고객만족 측정 방법을 정해 주세요",
    refs: ["ISO 13485:2016 Clause 8.1", "8.2.1", "8.2.2", "8.2.3", "8.2.4"],
  },
  {
    id: 10,
    phase: "improvement",
    title: "개선 활동",
    icon: "trending-up",
    oneLine: "Clause 8.3–8.5 — 부적합품·데이터 분석·시정·예방조치예요",
    tag: { label: "지속 개선", tone: "success" },
    body: [
      "Clause 8.3은 부적합 제품을 찾아내고, 따로 떼어 두고, 처리하라고 요구해요. 8.4는 모은 데이터를 분석해 QMS(품질경영시스템)가 효과적임을 보여 주라고 요구해요. 8.5는 시정조치(CA)와 예방조치(PA)로 근본 원인을 없애고 재발을 막는 과정이에요.",
      "CA/PA는 문제 크기에 맞는 깊이로 하면 돼요. 단, 모든 단계(원인·조치·효과 검증)를 기록으로 남겨요. 이 루프가 ISO 13485 지속 개선의 엔진이에요.",
    ],
    todo: "부적합 관리 절차서, 시정/예방조치(CAPA) 양식, 데이터 분석 보고 주기를 정해 주세요",
    refs: ["ISO 13485:2016 Clause 8.3", "8.4", "8.5.1", "8.5.2", "8.5.3"],
  },
];
