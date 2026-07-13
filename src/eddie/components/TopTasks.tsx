import { useState } from "react";
import { Check, CalendarClock, ChevronDown, Clock3, Moon } from "lucide-react";
import { SectionTitle } from "./TodayTimeline";
import type { TodayTask } from "../data";

/**
 * 할 일 우선 3개 (FR-204). 과다 시 압도 방지를 위해 오늘 3개만 노출,
 * 나머지는 '압박 아닌 안심' 톤으로 접어둔다.
 *  - 완료는 원탭 체크(부드러운 그린).
 *  - '시간 정하기'는 자동 배치가 아니라 제안 모달을 여는 진입점(R-07).
 */
export function TopTasks({
  tasks,
  hiddenCount,
  onSchedule,
}: {
  tasks: TodayTask[];
  hiddenCount: number;
  onSchedule?: (task: TodayTask) => void;
}) {
  const [done, setDone] = useState<Record<string, boolean>>(
    () => Object.fromEntries(tasks.map((t) => [t.id, t.done])),
  );

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  return (
    <section className="px-4">
      <SectionTitle title="오늘 할 일" hint="딱 3개만 골라뒀어" />

      <ul className="mt-3 space-y-2">
        {tasks.map((t) => {
          const isDone = done[t.id];
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-[var(--e-r-md)] border border-[var(--e-border)] bg-[var(--e-surface)] px-3 py-2.5 shadow-[var(--e-shadow-card)]"
            >
              {/* 원탭 체크 */}
              <button
                type="button"
                onClick={() => toggle(t.id)}
                role="checkbox"
                aria-checked={isDone}
                aria-label={`${t.title} 완료`}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors"
                style={{
                  borderColor: isDone ? "var(--e-accent)" : "var(--e-border-strong)",
                  background: isDone ? "var(--e-accent)" : "transparent",
                }}
              >
                {isDone && <Check size={16} strokeWidth={3} className="text-white" />}
              </button>

              {/* 제목 */}
              <span
                className="min-w-0 flex-1 text-[15px] font-bold"
                style={{
                  color: isDone ? "var(--e-text-subtle)" : "var(--e-text)",
                  textDecoration: isDone ? "line-through" : "none",
                  textDecorationColor: "var(--e-border-strong)",
                }}
              >
                {t.title}
              </span>

              {/* 상태별 우측 표시 — 미완료일 때만 */}
              {!isDone && (
                <>
                  {t.scheduledAt ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-[var(--e-r-sm)] bg-[var(--e-done-bg)] px-2.5 py-1.5 text-[12px] font-bold text-[var(--e-done)]">
                      <Clock3 size={14} strokeWidth={2.4} aria-hidden />
                      {t.scheduledAt}에 예정
                    </span>
                  ) : t.deferredToTomorrow ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-[var(--e-r-sm)] bg-[var(--e-deferred-bg)] px-2.5 py-1.5 text-[12px] font-bold text-[var(--e-text-muted)]">
                      <Moon size={14} strokeWidth={2.4} aria-hidden />
                      내일로 이월
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSchedule?.(t)}
                      className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-[var(--e-r-sm)] bg-[var(--e-primary-weak)] px-2.5 text-[12px] font-bold text-[var(--e-primary-deep)]"
                    >
                      <CalendarClock size={14} strokeWidth={2.4} aria-hidden />
                      시간 정하기
                    </button>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      {/* 나머지는 접어둠 — 압박 아닌 안심 톤 */}
      {hiddenCount > 0 && (
        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-[var(--e-r-md)] border border-dashed border-[var(--e-border-strong)] px-3 py-2 text-[13px] font-semibold text-[var(--e-text-muted)]"
        >
          나머지 {hiddenCount}개는 접어뒀어 — 천천히 봐도 돼
          <ChevronDown size={15} strokeWidth={2.4} aria-hidden />
        </button>
      )}
    </section>
  );
}
