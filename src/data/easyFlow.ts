// ---------------------------------------------------------------------
// 쉬운 6단계 순서 — 상세 11단계(docOrder)를 처음 보는 사람용으로 묶은 보기.
// 제품 정의 → 계획 → 시험 → 문서 정리 → 심사·출시 → 사후관리.
// 문서 칩은 docTree 의 잎 id 를 그대로 쓴다(같은 문서가 처음 쓰는 단계와
// 최종본을 묶는 단계에 두 번 나올 수 있다).
// 회사 내부 양식 번호(F-, SU-QP)는 넣지 않는다 — 구조만 참고했다.
// ---------------------------------------------------------------------

export interface EasyPair {
  /** 먼저 쓰는 계획 문서 */
  plan: string;
  /** 나중에 짝이 되는 결과 문서 */
  result: string;
}

export interface EasyNext {
  /** gate = 다음 단계로 가는 조건, loop = 앞 단계로 돌아가는 경우 */
  kind: "gate" | "loop";
  text: string;
  /** loop 일 때 돌아가는 단계 번호 (정해지지 않았으면 비움 = "앞 단계로") */
  backTo?: number;
}

export interface EasyStage {
  n: number;
  title: string;
  /** 이 단계에서 답할 질문 하나 */
  question: string;
  why: string;
  docIds: string[];
  /** 제품에 해당할 때만 쓰는 문서 */
  ifApplicable?: { label: string; docIds: string[] };
  /** 계획 → 결과 짝 */
  pairs?: EasyPair[];
  /** 등급·조건에 따라 달라지는 안내 */
  note?: string;
  next: EasyNext;
  /** 같은 내용이 들어 있는 상세 11단계 번호 */
  detailSteps: number[];
}

/** 모든 단계의 바닥 — 품질경영시스템(QMS). 6단계와 따로 먼저 갖춘다. */
export const easyFoundation = {
  title: "바닥: 품질경영시스템(QMS)",
  why: "6단계 전체가 이 위에서 돌아가요. 문서 관리·교육·공급자 관리 같은 회사 차원의 규칙을 먼저 세워요.",
  docIds: [
    "quality-manual",
    "quality-policy-org",
    "qms-ivdr-matrix",
    "prrc",
    "doc-record-control",
    "supplier-control",
    "training-competence",
    "calibration-maintenance",
    "qms-software-validation",
  ],
  detailSteps: [2],
};

export const easyFlow: EasyStage[] = [
  {
    n: 1,
    title: "제품이 무엇인지 정하기",
    question: "무엇을 검사하고, 누가 쓰는 제품인가?",
    why: "사용목적을 먼저 정해야 등급과 필요한 시험·문서가 정해져요.",
    docIds: ["intended-purpose", "qualification-statement", "device-description", "classification-rationale", "conformity-route-plan"],
    next: { kind: "gate", text: "사용목적·제품 범위·등급이 정리되면 ②로 가요." },
    detailSteps: [1],
  },
  {
    n: 2,
    title: "개발과 시험 계획 세우기",
    question: "무엇을 만들고, 무엇으로 입증할 것인가?",
    why: "시험 방법과 합격 기준은 시험 전에 계획서로 정해 둬요. 계획서마다 ③·④에서 짝이 되는 결과 문서가 생겨요.",
    docIds: ["dd-plan", "design-inputs", "risk-management-plan", "performance-eval-plan", "clinical-performance-study-plan"],
    ifApplicable: { label: "소프트웨어가 있으면", docIds: ["cybersecurity"] },
    pairs: [
      { plan: "design-inputs", result: "design-verification" },
      { plan: "risk-management-plan", result: "risk-management-file" },
      { plan: "performance-eval-plan", result: "performance-eval-report" },
      { plan: "clinical-performance-study-plan", result: "clinical-performance" },
    ],
    next: { kind: "gate", text: "요구사항과 시험 방법·합격 기준을 검토·승인한 뒤 ③으로 가요." },
    detailSteps: [3, 4, 5],
  },
  {
    n: 3,
    title: "시험하고 결과 남기기",
    question: "계획대로 한 결과가 기준을 만족하는가?",
    why: "②의 계획서와 짝이 되는 결과 보고서를 써요. 원자료와 연결해 두면 나중에 묶기 쉬워요.",
    docIds: [
      "design-outputs",
      "scientific-validity",
      "analytical-performance",
      "clinical-performance",
      "stability-study",
      "metrological-traceability",
      "fmea",
      "fta",
      "usability-file",
      "design-verification",
      "design-review",
      "process-validation",
      "packaging-validation",
      "transport-validation",
    ],
    ifApplicable: { label: "제품에 해당하면", docIds: ["sw-validation", "cybersecurity", "sterilization-validation", "biocompatibility"] },
    next: { kind: "loop", text: "기준을 못 맞추면 설계·계획을 고치고, 필요한 시험을 다시 한 뒤 결과를 재검토해요.", backTo: 2 },
    detailSteps: [3, 4, 5, 6, 7],
  },
  {
    n: 4,
    title: "제출할 기술문서 묶기",
    question: "흩어진 근거가 제품별 한 묶음으로 모였는가?",
    why: "①~③에서 쓴 자료를 모아 최종본을 만들고, GSPR 체크리스트로 요구사항마다 증거를 연결해요.",
    docIds: [
      "performance-eval-report",
      "risk-management-file",
      "benefit-risk",
      "design-validation",
      "traceability-matrix",
      "device-description",
      "design-manufacturing-info",
      "labelling-spec",
      "ifu",
      "pms-plan",
      "pmpf-plan",
      "dhf",
      "tech-doc-toc-gspr",
    ],
    pairs: [{ plan: "pms-plan", result: "pms-report" }],
    next: { kind: "gate", text: "빠진 근거와 문서끼리 맞지 않는 곳을 고친 뒤 ⑤로 가요." },
    detailSteps: [5, 7, 8],
  },
  {
    n: 5,
    title: "적합성 평가 후 출시 준비하기",
    question: "등급에 맞는 평가를 마치고 최종 문서를 확정했는가?",
    why: "적합성 평가를 끝낸 뒤 적합성 선언(DoC)에 서명하고 CE를 붙여요. 등록과 생산 준비도 이때 마쳐요.",
    note:
      "Class A 비멸균은 인증기관 심사 없이 제조자가 스스로 적합성을 확인해요. 그래도 기술문서는 똑같이 갖춰야 해요. Class A 멸균·B·C·D는 인증기관 심사와 보완을 마쳐야 해요. SSP는 Class C·D만 써요.",
    docIds: [
      "nb-application",
      "declaration-of-conformity",
      "ce-marking-application",
      "ssp",
      "udi-assignment",
      "actor-registration",
      "device-registration",
      "authorised-rep-mandate",
      "importer-distributor",
      "design-transfer",
      "dmr",
      "product-preservation",
    ],
    ifApplicable: { label: "해당하면", docIds: ["cs-compliance", "eurl-batch-verification", "cdx-consultation"] },
    next: { kind: "gate", text: "출시 전에 인증·선언·표시·등록과 생산 준비가 모두 끝났는지 확인해요." },
    detailSteps: [6, 9, 10],
  },
  {
    n: 6,
    title: "출시 후 결과로 문서 갱신하기",
    question: "고객 사용 결과와 변경 사항을 계속 반영하고 있는가?",
    why: "시판 후 정보를 모아 성능평가·위험관리 문서에 다시 반영해요.",
    note: "보고서는 등급에 맞춰 써요. Class A·B는 PMS 보고서, Class C·D는 PSUR예요.",
    docIds: [
      "pms-report",
      "psur",
      "trend-reporting",
      "complaint-handling",
      "vigilance-sop",
      "fsca-recall",
      "capa-sop",
      "nonconforming-product",
      "design-changes",
      "dhr",
      "internal-audit",
      "management-review",
    ],
    next: { kind: "loop", text: "변경이 생기면 영향받는 앞 단계로 돌아가 재검토·재시험·문서 개정을 해요." },
    detailSteps: [11],
  },
];

/** 문서 id 가 처음 나오는 쉬운 단계 번호 (없으면 undefined). */
export function easyStageOf(id: string, from = 1): number | undefined {
  return easyFlow.find((s) => s.n >= from && (s.docIds.includes(id) || s.ifApplicable?.docIds.includes(id)))?.n;
}
