/* =====================================================================
   에디의 하루 · 오늘 탭 — 타입 & 목업 데이터
   ---------------------------------------------------------------------
   실제 앱에서는 로컬 캐시 + 외부 캘린더 동기화로 채워지는 자리.
   여기서는 시안 검증용 고정 데이터를 둔다.
   ===================================================================== */

/** 에디 감정 상태 — 블록 상태에 종속(IA §3). 과장 없는 4종. */
export type EddieMood = "calm" | "happy" | "cheer" | "night";

/**
 * 타임블록 상태 — 색+아이콘+라벨 병행. '놓침'은 종착역이 아니라 회복 가능.
 * 상태 다이어그램(IA §3): Planned→Active→Done / Active→Missed→Recovering→Done
 * / Missed→Deferred→Planned / Missed→Skipped(비난 없음).
 */
export type BlockStatus = "done" | "active" | "planned" | "missed" | "deferred" | "skipped";

export interface TimelineBlock {
  id: string;
  /** 표시용 시각 라벨 (예: "09:00") */
  time: string;
  /** 소요/구간 라벨 (예: "30분", "09:00–09:30") */
  span?: string;
  title: string;
  status: BlockStatus;
  /** 카테고리 태그(개인/업무/루틴 등) — 선택 */
  tag?: string;
  /** Recovering 경로를 거쳐 완료됐는지 — '그냥 완료'와 다르게 담백히 축하(IA §3). */
  recovered?: boolean;
}

export interface TodayTask {
  id: string;
  title: string;
  done: boolean;
  /** 예상 소요(분) — 블록 제안 시 참고 */
  estimateMin?: number;
  /** 제안 수락으로 배정된 시각 라벨(있으면 '시간 정하기' 대신 표시) */
  scheduledAt?: string;
  /** 부드러운 이월 표시(자책 없음, FR-205) */
  deferredToTomorrow?: boolean;
}

export type MedStatus = "planned" | "done" | "missed";

export interface Medication {
  id: string;
  name: string;
  dose: string;
  /** 예정 시각 라벨 */
  time: string;
  status: MedStatus;
}

/* ------------------------------------------------------------------ */
/* 목업 데이터                                                          */
/* ------------------------------------------------------------------ */

/** 오늘 타임라인 — 5개 상태를 모두 보여주는 하루 (완료→놓침→진행→예정→이월) */
export const TIMELINE: TimelineBlock[] = [
  { id: "b1", time: "07:30", span: "20분", title: "아침 약 · 세수", status: "done", tag: "루틴" },
  { id: "b2", time: "08:10", span: "20분", title: "아침 스트레칭", status: "missed", tag: "루틴" },
  { id: "b3", time: "08:40", span: "30분", title: "출근 준비", status: "active", tag: "이동" },
  { id: "b4", time: "09:00", span: "30분", title: "팀 스탠드업 회의", status: "planned", tag: "업무" },
  { id: "b5", time: "11:00", span: "45분", title: "보고서 초안 쓰기", status: "planned", tag: "업무" },
  { id: "b6", time: "저녁", span: "이월됨", title: "방 정리 15분", status: "deferred", tag: "집안" },
];

/** 할 일 — 임계 초과 시 오늘 3개만 우선 노출(FR-204). 나머지는 접어둠. */
export const TASKS: TodayTask[] = [
  { id: "t1", title: "약국 처방전 받기", done: false, estimateMin: 20 },
  { id: "t2", title: "월세 이체", done: false, estimateMin: 5 },
  { id: "t3", title: "엄마한테 전화", done: true, estimateMin: 10 },
];
/** 접혀 있는 나머지 할 일 개수(압박 아닌 안심 톤으로 안내). */
export const HIDDEN_TASK_COUNT = 4;

/** 복약 카드 — 예정/완료/놓침 3종을 담백하게. 놓침도 자책 없이. */
export const MEDS: Medication[] = [
  { id: "m1", name: "콘서타", dose: "18mg", time: "아침 8:00", status: "done" },
  { id: "m2", name: "오메가3", dose: "1정", time: "아침 8:00", status: "missed" },
  { id: "m3", name: "비타민 D", dose: "1정", time: "점심 12:30", status: "planned" },
];

/* ------------------------------------------------------------------ */
/* 라이브 시나리오(에디 시계 · 출발 카운트다운) 파라미터                 */
/* ------------------------------------------------------------------ */

/**
 * 다음 일정까지 남은 분(데모 기준). 이동+준비 역산 결과가 '임박'이 되도록
 * 아침 출근 시나리오(Flow 2)의 대표 순간을 재현한다.
 */
export const SCENARIO = {
  /** 다음 일정 제목 */
  eventTitle: "팀 스탠드업 회의",
  eventPlace: "회사",
  /** 지금부터 일정 시작까지(분) */
  minutesToEvent: 40,
  /** 준비시간(분) — 일정 유형별 기본값(FR-105) */
  prepMin: 15,
  /** 이동시간(분) — 지도/기본값 역산(FR-102) */
  moveMin: 20,
  /** '임박' 판정 임계(분). 이 값 이하면 출발 넛지 강조. */
  imminentThresholdMin: 15,
  /**
   * 에디 시계 오프셋 범위(분). 실제보다 5~10분 빠름.
   * ⚠️ 정확한 오프셋은 화면에 절대 노출하지 않는다(R-01). 내부 계산용.
   */
  clockOffsetMinRange: [5, 10] as const,
};
