import { useState } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";
import "./eddie.css";
import { EddieClock } from "./components/EddieClock";
import { DepartureCountdown } from "./components/DepartureCountdown";
import { TodayTimeline } from "./components/TodayTimeline";
import { TopTasks } from "./components/TopTasks";
import { MedicationCard } from "./components/MedicationCard";
import { BottomTabBar } from "./components/BottomTabBar";
import { QuickCaptureFab } from "./components/QuickCaptureFab";
import { TaskSuggestModal } from "./components/TaskSuggestModal";
import { RecoveryModal, type RecoveryAction } from "./components/RecoveryModal";
import { HIDDEN_TASK_COUNT, MEDS, TASKS, TIMELINE } from "./data";
import type { TimelineBlock, TodayTask } from "./data";
import type { SuggestedSlot } from "./suggest";
import { formatHHMM, useNow } from "./useNow";

/**
 * 에디의 하루 · '오늘 탭' 화면 (390×844).
 * 구성: 에디 시계 + 출발 카운트다운 + 오늘 타임라인 + 할 일 3개 + 복약 카드.
 * + 우선 설계 화면 2·3순위 모달: 할 일→타임블록 제안 / 실패·회복.
 *
 * 금지 패턴 준수:
 *  - 자책 문구 없음(놓침·이월은 담백/회복 톤).
 *  - 빠른 시계 오프셋 비노출(EddieClock).
 *  - 자동 배치 없음(할 일은 제안 모달에서 직접 수락해야 배치됨, R-07).
 *  - 정서적 과의존 유도 카피 없음(담백한 격려).
 */
export function EddieTodayScreen() {
  const [timeline, setTimeline] = useState<TimelineBlock[]>(TIMELINE);
  const [tasks, setTasks] = useState<TodayTask[]>(TASKS);

  const [suggestTask, setSuggestTask] = useState<TodayTask | null>(null);
  const [recoveryBlock, setRecoveryBlock] = useState<TimelineBlock | null>(null);

  // 할 일 → 타임블록 제안: 수락해야만 실제로 생긴다(자동 배치 금지, R-07).
  const acceptSuggestion = (task: TodayTask, slot: SuggestedSlot) => {
    const newBlock: TimelineBlock = {
      id: `sug-${task.id}`,
      time: slot.start,
      span: `${task.estimateMin ?? 20}분`,
      title: task.title,
      status: "planned",
      tag: "할일",
    };
    setTimeline((prev) => sortByTime([...prev.filter((b) => b.id !== newBlock.id), newBlock]));
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, scheduledAt: slot.start } : t)),
    );
    setSuggestTask(null);
  };

  const deferTaskToTomorrow = (task: TodayTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, deferredToTomorrow: true } : t)),
    );
    setSuggestTask(null);
  };

  // 실패·회복: 어떤 선택도 비난 없이 처리(R-02). 스트릭은 리셋되지 않음.
  const resolveRecovery = (block: TimelineBlock, action: RecoveryAction) => {
    setTimeline((prev) =>
      prev.map((b) => {
        if (b.id !== block.id) return b;
        switch (action) {
          case "now":
            return { ...b, status: "done", recovered: true };
          case "evening":
            return { ...b, status: "deferred", time: "저녁", span: "재배치됨" };
          case "tomorrow":
            return { ...b, status: "deferred", time: "내일", span: "이월됨" };
          case "pass":
            return { ...b, status: "skipped", span: "패스" };
        }
      }),
    );
  };

  return (
    <div className="grid min-h-[100dvh] w-full place-items-center bg-[#EFE7DD] p-0 sm:p-6">
      {/* 디바이스 프레임 */}
      <div className="eddie-app relative flex h-[100dvh] w-full max-w-[390px] flex-col overflow-hidden bg-[var(--e-bg)] sm:h-[844px] sm:rounded-[44px] sm:shadow-[0_30px_70px_rgba(80,50,20,.28)] sm:ring-1 sm:ring-black/5">
        <StatusBar />

        {/* 스크롤 영역 (하단 탭바 + FAB 공간 확보) */}
        <main className="eddie-scroll flex-1 overflow-y-auto pb-[150px]">
          <EddieClock mood="cheer" greeting={greetingFor(new Date())} />

          <div className="space-y-5">
            <DepartureCountdown />
            <TodayTimeline blocks={timeline} onRecover={setRecoveryBlock} />
            <TopTasks
              tasks={tasks}
              hiddenCount={HIDDEN_TASK_COUNT}
              onSchedule={setSuggestTask}
            />
            <MedicationCard meds={MEDS} />
            <Footer />
          </div>
        </main>

        <QuickCaptureFab />
        <BottomTabBar active="today" />

        {/* 우선 설계 화면 2순위 — 할 일→타임블록 제안 모달 */}
        <TaskSuggestModal
          task={suggestTask}
          open={suggestTask !== null}
          onClose={() => setSuggestTask(null)}
          onAccept={acceptSuggestion}
          onDefer={deferTaskToTomorrow}
        />

        {/* 우선 설계 화면 3순위 — 실패·회복 모달(Flow 4, 가장 중요) */}
        <RecoveryModal
          block={recoveryBlock}
          open={recoveryBlock !== null}
          onClose={() => setRecoveryBlock(null)}
          onResolve={resolveRecovery}
        />
      </div>
    </div>
  );
}

/** "HH:MM" 블록을 앞쪽에, 단어 라벨("저녁"·"내일" 등)은 뒤로 보내는 정렬. */
function sortByTime(blocks: TimelineBlock[]): TimelineBlock[] {
  const parse = (s: string): number | null => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(s);
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
  };
  return [...blocks].sort((a, b) => {
    const pa = parse(a.time);
    const pb = parse(b.time);
    if (pa !== null && pb !== null) return pa - pb;
    if (pa !== null) return -1;
    if (pb !== null) return 1;
    return 0;
  });
}

/** iOS 풍 상태바(목업) — 모바일 프레임 현실감. */
function StatusBar() {
  const now = useNow(15_000);
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-bold text-[var(--e-text)]">
      <span className="eddie-num">{formatHHMM(now)}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={15} strokeWidth={2.6} aria-hidden />
        <Wifi size={15} strokeWidth={2.6} aria-hidden />
        <BatteryFull size={18} strokeWidth={2} aria-hidden />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-5 pb-2 pt-1 text-center">
      <p className="text-[11px] leading-relaxed text-[var(--e-text-subtle)]">
        완벽하지 않아도 괜찮아요. 오늘 하나만 해내도 충분히 잘한 하루예요.
      </p>
    </footer>
  );
}

/** 시간대별 담백한 인사(과한 정서 표현 금지). */
function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "아직 밤이야";
  if (h < 11) return "좋은 아침이야";
  if (h < 17) return "좋은 오후야";
  if (h < 22) return "저녁이네";
  return "슬슬 하루를 접자";
}
