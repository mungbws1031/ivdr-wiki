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
    oneLine: "미국 FDA · 캐나다 Health Canada · 브라질 ANVISA · 호주 TGA · 일본 PMDA 동시 인정",
    tag: { label: "전략 수립", tone: "info" },
    body: [
      "MDSAP(의료기기 단일 심사 프로그램)은 하나의 QMS 심사로 5개국(미국·캐나다·브라질·호주·일본) 규제 요건을 동시에 충족하는 제도다. 각국 별도 심사를 대체해 심사 부담을 크게 줄인다.",
      "**미국 FDA**는 MDSAP 결과를 510(k)/PMA 심사 보완 자료로 인정하며, **캐나다**는 의무 적용 대상이다. **브라질**은 MDSAP를 ANVISA 등록 요건 일부로 인정한다. **일본**은 QMS 성령(省令) 적합성 확인에 활용한다.",
    ],
    todo: "목표 국가 시장 확정 후 MDSAP 취득 여부·일정·비용을 경영진과 합의한다",
    refs: ["MDSAP 프로그램 지침서(IMDRF MDSAP AU P0002)", "ISO 13485:2016"],
  },
  {
    id: 2,
    phase: "mdsap-prep",
    title: "갭 분석 · 심사기관(AO) 선정",
    icon: "search",
    oneLine: "기존 QMS와 MDSAP 7챕터 요건 간 갭 파악 + 공인 심사기관 계약",
    tag: { label: "사전 필수", tone: "warning" },
    body: [
      "MDSAP는 7개 챕터(경영·측정분석개선·설계·제품서비스통제·구매·생산·지원 프로세스)로 QMS를 평가한다. 현행 QMS를 이 체계에 매핑하고 누락된 요건을 파악하는 갭 분석이 출발점이다.",
      "심사기관(Auditing Organization, AO)은 IMDRF MDSAP 웹사이트에서 확인한다. AO와 초기 계약 시 심사 일정·비용·필요 문서 목록을 합의한다.",
    ],
    todo: "갭 분석 체크리스트 완성 후 AO 2~3곳에 RFQ를 발송한다",
    refs: ["MDSAP AU P0002 Ch.1-7", "IMDRF MDSAP Auditing Organization 목록"],
  },
  {
    id: 3,
    phase: "mdsap-qms",
    title: "MDSAP 7챕터 QMS 수립",
    icon: "layers",
    oneLine: "Ch.1 경영 ~ Ch.7 지원 프로세스 — ISO 13485 기반 문서 체계 확장",
    tag: { label: "핵심 구축", tone: "info" },
    body: [
      "MDSAP QMS는 ISO 13485:2016을 기반으로 하되, 각 챕터에 국가별 추가 요건이 더해진다. 예: Ch.3 측정·분석·개선은 미국 21 CFR Part 820의 CAPA·불만 처리 요건을 통합한다.",
      "문서 체계 구성 시 MDSAP Audit Approach 문서의 각 챕터 요건 테이블을 참조해 절차서·양식을 매핑한다. 기존 ISO 13485 문서가 있으면 갭 항목만 추가 작성한다.",
    ],
    todo: "7챕터 요건-절차서 매핑표 작성 + 누락 절차서 초안 작성",
    refs: ["MDSAP AU P0002 Ch.1-7", "ISO 13485:2016", "21 CFR Part 820"],
  },
  {
    id: 4,
    phase: "mdsap-qms",
    title: "기록 · 추적성 관리",
    icon: "archive",
    oneLine: "Ch.7 지원 프로세스 — 기록 보유·접근·추적성 체계 확립",
    tag: { label: "심사 핵심", tone: "info" },
    body: [
      "MDSAP 심사에서 기록 가용성(availability)은 핵심 평가 항목이다. 심사관은 설계 변경·CAPA·공급자 평가 기록을 현장에서 즉시 제시하도록 요구한다.",
      "디지털 QMS(eQMS) 사용 시 접근 권한 관리·백업 정책·소프트웨어 밸리데이션(Ch.7.4.9)이 추가 요건으로 발생한다. 기록 보유 기간은 제품 수명 + 2년(최소 2년) 이상을 권장한다.",
    ],
    todo: "기록 보유 기간 정책 확정 + eQMS 밸리데이션 계획 수립(해당 시)",
    refs: ["MDSAP AU P0002 Ch.7", "ISO 13485:2016 Clause 4.2.5"],
  },
  {
    id: 5,
    phase: "mdsap-audit",
    title: "Stage 1 · Stage 2 심사",
    icon: "clipboard-check",
    oneLine: "AO 현장 심사 — 문서 검토(Stage 1) + 시스템 이행 확인(Stage 2)",
    tag: { label: "심사 수행", tone: "danger" },
    body: [
      "**Stage 1**(문서 심사)에서 심사관은 QMS 문서·절차서·필수 기록이 MDSAP 요건을 충족하는지 검토한다. 미비 사항은 Stage 2 이전 해결해야 한다.",
      "**Stage 2**(현장 심사)에서는 QMS 실행 증거를 확인한다. 제품 추적성·CAPA 실효성·생산 통제·측정장비 교정·직원 역량 기록을 현장에서 직접 검증한다. 발견된 부적합은 Minor·Major·Critical 등급으로 분류된다.",
    ],
    todo: "Stage 1 준비 체크리스트 완성 + 심사 일정·담당자·공간 확보",
    refs: ["MDSAP AU P0002 심사 절차", "MDSAP Audit Approach", "ISO 13485:2016"],
  },
  {
    id: 6,
    phase: "mdsap-audit",
    title: "부적합 처리 · CAPA",
    icon: "alert-triangle",
    oneLine: "심사 결과 후속 — 부적합 분류·근본 원인 분석·시정조치",
    tag: { label: "필수 후속", tone: "warning" },
    body: [
      "심사 후 AO는 부적합 보고서를 발행한다. **Critical** 부적합은 인정 중단 또는 취소, **Major**는 30일 이내 시정조치 계획 제출이 요구된다. **Minor**는 다음 감시 심사 전 완료가 원칙이다.",
      "CAPA 프로세스는 증거 기반 근본 원인 분석(5-Why, 어골도 등)을 포함해야 한다. AO에 제출하는 CAPA 패키지는 ①원인 분석 ②조치 내용 ③효과 검증 방법 ④검증 증거를 포함한다.",
    ],
    todo: "CAPA 양식 업데이트 + 심사 부적합별 담당자·기한 배정",
    refs: ["MDSAP AU P0002 CAPA 요건", "ISO 13485:2016 Clause 8.5.2"],
  },
  {
    id: 7,
    phase: "mdsap-maintain",
    title: "연간 심사 · 재인정",
    icon: "refresh-cw",
    oneLine: "Annual Surveillance Audit + 3년 주기 재인정 심사 + 국가별 등록 갱신",
    tag: { label: "지속 의무", tone: "neutral" },
    body: [
      "MDSAP 인정 후 **매년 감시 심사**(Surveillance Audit)가 실시된다. 7챕터를 3년 주기로 순환하며 모든 챕터를 심사하고, 3년차에 **재인정 심사**(Reassessment)가 진행된다.",
      "각국 규제 기관은 MDSAP 심사 결과를 공유하므로, 부적합 처리가 늦어지면 복수 국가의 규제 당국에 동시 영향이 발생할 수 있다. 캐나다 MDEL·브라질 ANVISA 등록은 별도 갱신이 필요하다.",
    ],
    todo: "연간 심사 일정 3년치 캘린더 등록 + 각국 등록 갱신 기한 목록 작성",
    refs: ["MDSAP AU P0002 감시 심사 절차", "캐나다 MDEL 갱신 규정", "브라질 ANVISA RDC 665"],
  },
];
