// src/data/ivdd/stations.ts
export type IVDDPhaseId = "ivdd-classify" | "ivdd-docs" | "ivdd-assess" | "ivdd-cert";

export interface IVDDPhase {
  id: IVDDPhaseId;
  order: number;
  title: string;
  subtitle: string;
  colorVar: string;
  tintVar: string;
}

export interface IVDDStation {
  id: number;
  phase: IVDDPhaseId;
  title: string;
  icon: string;
  oneLine: string;
  tag: { label: string; tone: "neutral" | "info" | "warning" | "danger" | "success" };
  body: string[];
  todo: string;
  refs: string[];
  note?: string;
}

export const ivddPhases: IVDDPhase[] = [
  { id: "ivdd-classify", order: 1, title: "분류·범위 확인",  subtitle: "Annex II 해당 여부 판별",          colorVar: "--p2", tintVar: "--p2-tint" },
  { id: "ivdd-docs",     order: 2, title: "기술문서 준비",   subtitle: "성능 자료·위험관리·QMS 증거 수집", colorVar: "--p3", tintVar: "--p3-tint" },
  { id: "ivdd-assess",   order: 3, title: "적합성 평가",     subtitle: "NB 심사 또는 자가선언 진행",       colorVar: "--p4", tintVar: "--p4-tint" },
  { id: "ivdd-cert",     order: 4, title: "CE 마킹·감시",    subtitle: "DoC 작성·CE 부착·사후 감시",      colorVar: "--p1", tintVar: "--p1-tint" },
];

export const ivddPhaseById = (id: IVDDPhaseId): IVDDPhase => ivddPhases.find((p) => p.id === id)!;

export const ivddStations: IVDDStation[] = [
  {
    id: 1,
    phase: "ivdd-classify",
    title: "기기 분류 결정",
    icon: "layers",
    oneLine: "Annex II List A·B vs 자가검사 vs 일반 IVD — 적합성 평가 경로 결정",
    tag: { label: "필수 첫 단계", tone: "info" },
    body: [
      "98/79/EC는 IVD를 4등급으로 구분한다. **Annex II List A**(HIV·B형 간염·혈액형 등)는 NB 심사 + EC 설계 검사가 필요하다. **Annex II List B**(임신·혈당·PSA 등)는 NB 형식 검사 또는 제조사 QA 인증이 요구된다.",
      "**자가검사(self-testing)** 기기는 일반인이 사용하므로 별도 NB 개입이 필요하다. 위 어디에도 해당하지 않는 일반 IVD는 자가선언(Annex III~VII)으로 CE를 취득할 수 있다.",
    ],
    todo: "제품이 Annex II List A·B·자가검사·일반 IVD 중 어디에 해당하는지 결정하고 문서화한다",
    refs: ["98/79/EC Art.9", "Annex II List A", "Annex II List B", "Art.1(1)(b)"],
  },
  {
    id: 2,
    phase: "ivdd-classify",
    title: "의도된 목적 정의",
    icon: "target",
    oneLine: "Article 1(2)(b) — 제조자 의도가 분류와 성능 요건을 결정",
    tag: { label: "문서화 필수", tone: "info" },
    body: [
      "98/79/EC에서 '의도된 목적'은 라벨링·IFU에 명시된 기기 사용 목적이다. 의도된 목적이 분류(List A/B/자가검사)와 필수 요건(Annex I)을 결정한다.",
      "기술 시 포함 항목: 검출 대상 물질, 검체 유형, 사용 환경(전문 실험실/자가검사), 임상 의사결정 방식. 의도된 목적이 바뀌면 분류가 달라질 수 있다.",
    ],
    todo: "라벨·IFU에 의도된 목적을 확정하고 분류 근거 문서에 연결한다",
    refs: ["98/79/EC Art.1(2)(b)", "Annex I Sec.3", "MEDDEV 2.14/3"],
  },
  {
    id: 3,
    phase: "ivdd-docs",
    title: "기술문서 작성",
    icon: "file-text",
    oneLine: "Annex III~VIII — 기술문서 구성·5년 이상 유지",
    tag: { label: "핵심 산출물", tone: "warning" },
    body: [
      "Annex III(EC 적합성선언 문서)는 기기 설명, 설계·제조 정보, 필수요건 충족 증거를 포함하는 기술문서 유지를 요구한다. Annex IV~VII는 분류별 적합성 절차(QA·형식 검사·설계 검사)를 규정한다.",
      "기술문서는 기기 수명 최소 5년(이식형 10년)까지 보유해야 한다. IVDR 전환 시 Annex II·III 형식으로 재구성이 필요하다.",
    ],
    todo: "기술문서 목록(TDF index) 작성 후 누락 항목을 파악한다",
    refs: ["98/79/EC Annex III", "Annex IV", "Annex V", "Annex VI", "Annex VII"],
  },
  {
    id: 4,
    phase: "ivdd-docs",
    title: "성능 평가 자료",
    icon: "bar-chart-2",
    oneLine: "Annex I Sec.8–9 — 분석 성능·임상 성능 근거 확보",
    tag: { label: "핵심 증거", tone: "warning" },
    body: [
      "98/79/EC는 **분석 성능**(민감도·특이도·직선성·정밀도·측정범위·교차반응)과 **임상 성능**(진단 민감도·특이도·PPV/NPV)의 증거를 요구한다.",
      "성능 평가는 참고문헌 데이터, 비교 연구, 외부 품질평가(EQA) 결과를 종합한다. IVDR PER(성능 평가 보고서)의 전신에 해당하며, IVDR 전환 시 그대로 활용 가능하다.",
    ],
    todo: "분석 성능 및 임상 성능 데이터 목록 작성 후 갭을 파악한다",
    refs: ["98/79/EC Annex I Sec.8", "Annex I Sec.9", "MEDDEV 2.14/3"],
  },
  {
    id: 5,
    phase: "ivdd-assess",
    title: "공인기관(NB) 심사",
    icon: "building",
    oneLine: "List A·B 및 자가검사 기기 — NB 선정·계약·심사",
    tag: { label: "List A·B 필수", tone: "danger" },
    body: [
      "Annex II List A 기기는 **EC 형식 검사(Annex IV)** + **설계 검사(Annex IV Sec.6)** 를 받아야 한다. List B 기기는 EC 형식 검사(Annex V) 또는 EC 선언(Annex VI)이 필요하다.",
      "NB는 NANDO(EU 공인기관 데이터베이스)에서 98/79/EC 코드로 검색한다. Brexit 이후 영국 UKCA는 별도 Approved Body가 필요하다.",
    ],
    todo: "NANDO에서 해당 분류에 지정된 NB 목록을 확인하고 계약 협의를 시작한다",
    refs: ["98/79/EC Annex IV", "Annex V", "Annex VI", "NANDO 데이터베이스"],
    note: "일반 IVD는 NB 없이 자가선언 가능 (Annex III + Annex VII)",
  },
  {
    id: 6,
    phase: "ivdd-assess",
    title: "EU 적합성선언 & CE 마킹",
    icon: "check-circle",
    oneLine: "Article 11 — EC 선언 작성·CE 부착·EU 대리인 지정",
    tag: { label: "최종 관문", tone: "success" },
    body: [
      "적합성 절차 완료 후 제조자는 **EC 적합성선언(DoC)** 을 작성하고 서명한다. DoC에는 기기 식별·적용 지침·절차·NB 번호(해당 시)·제조자 서명이 포함된다.",
      "EU 외 제조자는 EU 대리인(Authorized Representative)을 지정해야 한다. CE 마크는 NB가 개입한 경우 CE + NB 번호 조합으로 부착한다.",
    ],
    todo: "DoC 초안 작성, EU 대리인 계약, CE 마킹 양식 확정",
    refs: ["98/79/EC Art.11", "Art.10", "Annex III", "Annex VIII"],
  },
  {
    id: 7,
    phase: "ivdd-cert",
    title: "사후 시장 감시·IVDR 전환",
    icon: "activity",
    oneLine: "Art.11(4) — PMS·비질란스 + IVDR 전환 일정 대응",
    tag: { label: "지속 의무", tone: "neutral" },
    body: [
      "CE 취득 후에도 **사후 시장 감시(PMS)** 를 수행하고 비질란스 사건을 소관 당국에 보고해야 한다. 비일상적 사건은 15일 이내, 사망·중상은 10일 이내 보고한다.",
      "**IVDR 전환 일정:** Class D(=List A) → 2025.5.26 완료, Class C(=List B) → 2026.5.26, Class B(일반+자가검사) → 2027.5.26. 현재 CE를 보유해도 전환 일정 내 IVDR 인증을 획득해야 계속 판매가 가능하다.",
    ],
    todo: "IVDR 전환 목표 일자 확정, PMS 보고 절차서 수립, 당국 연락처 확보",
    refs: ["98/79/EC Art.11(4)", "IVDR Art.120(3)(d)", "EU 이행 결정 2022/1024"],
    note: "IVDR 전환 기한 미준수 시 EU 시장 판매 불가",
  },
];
