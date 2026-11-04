// src/data/mdsap/stations.ts
export type MDSAPPhaseId = "mdsap-prep" | "mdsap-qms" | "mdsap-audit" | "mdsap-maintain";

export interface MDSAPPhase {
  id: MDSAPPhaseId;
  order: number;
  title: string;
  subtitle: string;
  colorVar: string;
  tintVar: string;
}

export interface MDSAPStation {
  id: number;
  phase: MDSAPPhaseId;
  title: string;
  icon: string;
  oneLine: string;
  tag: { label: string; tone: "neutral" | "info" | "warning" | "danger" | "success" };
  body: string[];
  todo: string;
  refs: string[];
  note?: string;
}

export const mdsapPhases: MDSAPPhase[] = [
  { id: "mdsap-prep",     order: 1, title: "준비·갭 분석",     subtitle: "MDSAP 요건 이해·갭 파악",      colorVar: "--p1", tintVar: "--p1-tint" },
  { id: "mdsap-qms",      order: 2, title: "QMS 구축",          subtitle: "7 챕터 기반 QMS 수립",         colorVar: "--p3", tintVar: "--p3-tint" },
  { id: "mdsap-audit",    order: 3, title: "심사 수행",          subtitle: "Stage 1·2 심사·CAPA",         colorVar: "--p4", tintVar: "--p4-tint" },
  { id: "mdsap-maintain", order: 4, title: "인정 유지",          subtitle: "연간 심사·재인정·국가 등록",   colorVar: "--p2", tintVar: "--p2-tint" },
];

export const mdsapPhaseById = (id: MDSAPPhaseId): MDSAPPhase => mdsapPhases.find((p) => p.id === id)!;

export const mdsapStations: MDSAPStation[] = [
  {
    id: 1,
    phase: "mdsap-prep",
    title: "MDSAP 개요 · 5개국 규정",
    icon: "globe",
    oneLine: "미국 FDA · 캐나다 Health Canada · 브라질 ANVISA · 호주 TGA · 일본 PMDA에서 한 번에 인정받아요",
    tag: { label: "전략 수립", tone: "info" },
    body: [
      "MDSAP(의료기기 단일 심사 프로그램)는 QMS(품질경영시스템) 심사 한 번으로 5개국(미국·캐나다·브라질·호주·일본) 규제 요건을 함께 충족하는 제도예요. 나라마다 따로 받던 심사를 대신해서 심사 부담이 크게 줄어요.",
      "**미국 FDA**는 MDSAP 결과를 510(k)/PMA 심사 보완 자료로 인정해요. **캐나다**는 의무 적용 대상이에요. **브라질**은 MDSAP를 ANVISA 등록 요건의 일부로 인정해요. **일본**은 QMS 성령(省令) 적합성 확인에 활용해요.",
    ],
    todo: "목표 국가 시장을 정한 뒤, MDSAP 취득 여부·일정·비용을 경영진과 합의해 주세요",
    refs: ["MDSAP 프로그램 지침서(IMDRF MDSAP AU P0002)", "ISO 13485:2016"],
  },
  {
    id: 2,
    phase: "mdsap-prep",
    title: "갭 분석 · 심사기관(AO) 선정",
    icon: "search",
    oneLine: "지금 QMS와 MDSAP 7챕터 요건의 차이(갭)를 찾고, 공인 심사기관과 계약해요",
    tag: { label: "사전 필수", tone: "warning" },
    body: [
      "MDSAP는 7개 챕터(경영·측정분석개선·설계·제품서비스통제·구매·생산·지원 프로세스)로 QMS를 평가해요. 첫걸음은 갭 분석이에요. 지금 QMS를 이 체계에 맞춰 보고 빠진 요건을 찾아요.",
      "심사기관(Auditing Organization, AO)은 IMDRF MDSAP 웹사이트에서 확인해요. AO와 처음 계약할 때 심사 일정·비용·필요 문서 목록을 합의해요.",
    ],
    todo: "갭 분석 체크리스트를 완성하고, AO 2~3곳에 RFQ(견적 요청)를 보내 주세요",
    refs: ["MDSAP AU P0002 Ch.1-7", "IMDRF MDSAP Auditing Organization 목록"],
  },
  {
    id: 3,
    phase: "mdsap-qms",
    title: "MDSAP 7챕터 QMS 수립",
    icon: "layers",
    oneLine: "Ch.1 경영 ~ Ch.7 지원 프로세스 — ISO 13485 기반 문서 체계를 넓혀요",
    tag: { label: "핵심 구축", tone: "info" },
    body: [
      "MDSAP QMS는 ISO 13485:2016을 바탕으로 해요. 여기에 챕터마다 나라별 추가 요건이 더해져요. 예를 들어 Ch.3 측정·분석·개선에는 미국 21 CFR Part 820의 CAPA(시정·예방조치)·불만 처리 요건이 들어가요.",
      "문서 체계를 짤 때 MDSAP Audit Approach 문서의 챕터별 요건 표를 보고 절차서·양식을 짝지어요. 이미 ISO 13485 문서가 있으면 빠진 항목만 더 쓰면 돼요.",
    ],
    todo: "7챕터 요건-절차서 매핑표를 만들고, 빠진 절차서 초안을 써 주세요",
    refs: ["MDSAP AU P0002 Ch.1-7", "ISO 13485:2016", "21 CFR Part 820"],
  },
  {
    id: 4,
    phase: "mdsap-qms",
    title: "기록 · 추적성 관리",
    icon: "archive",
    oneLine: "Ch.7 지원 프로세스 — 기록 보관·접근·추적성 체계를 갖춰요",
    tag: { label: "심사 핵심", tone: "info" },
    body: [
      "MDSAP 심사에서는 기록을 바로 꺼내 보일 수 있는지(availability)가 핵심 평가 항목이에요. 심사관은 설계 변경·CAPA·공급자 평가 기록을 현장에서 바로 보여 달라고 해요.",
      "디지털 QMS(eQMS)를 쓰면 접근 권한 관리·백업 정책·소프트웨어 밸리데이션(Ch.7.4.9)이 추가 요건으로 생겨요. 기록 보관 기간은 제품 수명 + 2년(최소 2년) 이상을 권장해요.",
    ],
    todo: "기록 보관 기간 정책을 확정하고, eQMS 밸리데이션 계획을 세워 주세요(해당 시)",
    refs: ["MDSAP AU P0002 Ch.7", "ISO 13485:2016 Clause 4.2.5"],
  },
  {
    id: 5,
    phase: "mdsap-audit",
    title: "Stage 1 · Stage 2 심사",
    icon: "clipboard-check",
    oneLine: "AO 현장 심사 — 문서 검토(Stage 1)와 시스템 이행 확인(Stage 2)이에요",
    tag: { label: "심사 수행", tone: "danger" },
    body: [
      "**Stage 1**(문서 심사)에서 심사관은 QMS 문서·절차서·필수 기록이 MDSAP 요건을 충족하는지 검토해요. 부족한 점은 Stage 2 전에 해결해야 해요.",
      "**Stage 2**(현장 심사)에서는 QMS를 실제로 실행한 증거를 확인해요. 제품 추적성·CAPA 실효성·생산 통제·측정장비 교정·직원 역량 기록을 현장에서 직접 검증해요. 발견된 부적합은 Minor·Major·Critical 등급으로 나뉘어요.",
    ],
    todo: "Stage 1 준비 체크리스트를 완성하고, 심사 일정·담당자·공간을 확보해 주세요",
    refs: ["MDSAP AU P0002 심사 절차", "MDSAP Audit Approach", "ISO 13485:2016"],
  },
  {
    id: 6,
    phase: "mdsap-audit",
    title: "부적합 처리 · CAPA",
    icon: "alert-triangle",
    oneLine: "심사 결과 후속 — 부적합 분류·근본 원인 분석·시정조치예요",
    tag: { label: "필수 후속", tone: "warning" },
    body: [
      "심사 후 AO는 부적합 보고서를 내요. **Critical** 부적합은 인정 중단 또는 취소로 이어져요. **Major**는 30일 이내에 시정조치 계획을 내야 해요. **Minor**는 다음 감시 심사 전에 끝내는 것이 원칙이에요.",
      "CAPA(시정·예방조치) 프로세스에는 증거에 기반한 근본 원인 분석(5-Why, 어골도 등)이 들어가야 해요. AO에 내는 CAPA 패키지에는 ①원인 분석 ②조치 내용 ③효과 검증 방법 ④검증 증거가 들어가요.",
    ],
    todo: "CAPA 양식을 업데이트하고, 심사 부적합마다 담당자·기한을 정해 주세요",
    refs: ["MDSAP AU P0002 CAPA 요건", "ISO 13485:2016 Clause 8.5.2"],
  },
  {
    id: 7,
    phase: "mdsap-maintain",
    title: "연간 심사 · 재인정",
    icon: "refresh-cw",
    oneLine: "Annual Surveillance Audit + 3년 주기 재인정 심사 + 국가별 등록 갱신이에요",
    tag: { label: "지속 의무", tone: "neutral" },
    body: [
      "MDSAP 인정 후에는 **매년 감시 심사**(Surveillance Audit)를 받아요. 7챕터를 3년 주기로 돌아가며 모든 챕터를 심사해요. 3년차에는 **재인정 심사**(Reassessment)를 받아요.",
      "각국 규제 기관은 MDSAP 심사 결과를 공유해요. 그래서 부적합 처리가 늦어지면 여러 나라의 규제 당국에 동시에 영향이 갈 수 있어요. 캐나다 MDEL·브라질 ANVISA 등록은 따로 갱신해야 해요.",
    ],
    todo: "연간 심사 일정 3년치를 캘린더에 넣고, 나라별 등록 갱신 기한 목록을 만들어 주세요",
    refs: ["MDSAP AU P0002 감시 심사 절차", "캐나다 MDEL 갱신 규정", "브라질 ANVISA RDC 665"],
  },
];
