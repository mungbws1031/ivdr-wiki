import { useMemo, useState } from "react";
import { Check, Clock3, MoveRight } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { EddieMascot } from "./EddieMascot";
import { suggestSlots, type SuggestedSlot } from "../suggest";
import { useNow } from "../useNow";
import type { TodayTask } from "../data";

/**
 * 할 일 → 타임블록 제안 모달 (우선 설계 화면 2순위, Flow 3 / FR-202·203).
 *
 * 핵심 차별점: 에디는 빈 시간에 블록을 **제안**만 한다. 화면을 열어도
 * 아무것도 배치되지 않고, 사용자가 슬롯을 골라 '이 시간으로 넣기'를
 * 눌러야만 실제로 생긴다 — 자동 배치 금지(R-07).
 */
export function TaskSuggestModal({
  task,
  open,
  onClose,
  onAccept,
  onDefer,
}: {
  task: TodayTask | null;
  open: boolean;
  onClose: () => void;
  onAccept: (task: TodayTask, slot: SuggestedSlot) => void;
  onDefer: (task: TodayTask) => void;
}) {
  const now = useNow(60_000);
  const slots = useMemo(
    () => (task ? suggestSlots(now, task.estimateMin ?? 20) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task?.id],
  );
  const [selected, setSelected] = useState<string>(slots[0]?.id ?? "");

  if (!task) return null;
  const activeSlots = slots.length ? slots : suggestSlots(now, task.estimateMin ?? 20);
  const chosen = activeSlots.find((s) => s.id === selected) ?? activeSlots[0];

  return (
    <BottomSheet open={open} onClose={onClose} title="이 시간 어때?">
      {/* 에디 제안 말풍선 */}
      <div className="flex items-start gap-3">
        <EddieMascot mood="cheer" size={56} className="shrink-0" />
        <div className="mt-1 min-w-0 rounded-[var(--e-r-md)] rounded-tl-sm bg-[var(--e-primary-weak)] px-3.5 py-2.5">
          <p className="text-[14px] font-bold leading-snug text-[var(--e-text)]">
            "{task.title}" 오늘 빈 시간에 넣어볼까? 마음에 드는 시간 골라줘.
          </p>
        </div>
      </div>

      {/* 후보 슬롯 — 선택만, 아직 아무것도 배치되지 않음 */}
      <ul className="mt-4 space-y-2" role="radiogroup" aria-label="후보 시간">
        {activeSlots.map((s) => {
          const isSel = s.id === selected;
          return (
            <li key={s.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => setSelected(s.id)}
                className="flex min-h-[var(--e-touch)] w-full items-center gap-3 rounded-[var(--e-r-md)] border px-3.5 py-2.5 text-left"
                style={{
                  borderColor: isSel ? "var(--e-primary)" : "var(--e-border)",
                  background: isSel ? "var(--e-primary-weak)" : "var(--e-surface)",
                }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{
                    background: isSel ? "var(--e-primary)" : "var(--e-surface-2)",
                    color: isSel ? "var(--e-on-primary)" : "var(--e-text-subtle)",
                  }}
                >
                  <Clock3 size={16} strokeWidth={2.4} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="eddie-num block text-[16px] font-extrabold text-[var(--e-text)]">
                    {s.start}–{s.end}
                  </span>
                  {s.note && (
                    <span className="text-[12px] font-semibold text-[var(--e-text-subtle)]">
                      {s.note}
                    </span>
                  )}
                </span>
                {isSel && (
                  <Check size={18} strokeWidth={3} className="shrink-0 text-[var(--e-primary-deep)]" aria-hidden />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* 액션 — 수락(제안 확정) / 내일로 이월(자책 없음) */}
      <button
        type="button"
        onClick={() => chosen && onAccept(task, chosen)}
        className="mt-4 flex min-h-[var(--e-touch)] w-full items-center justify-center gap-2 rounded-[var(--e-r-md)] bg-[var(--e-primary)] px-4 font-bold text-[var(--e-on-primary)] shadow-[var(--e-shadow-fab)] active:translate-y-px"
      >
        <Check size={18} strokeWidth={2.6} aria-hidden />
        이 시간으로 넣기
      </button>
      <button
        type="button"
        onClick={() => onDefer(task)}
        className="mt-2 flex min-h-[var(--e-touch)] w-full items-center justify-center gap-1.5 text-[13px] font-bold text-[var(--e-text-muted)]"
      >
        <MoveRight size={15} strokeWidth={2.4} aria-hidden />
        오늘 말고 내일로 옮길래
      </button>
    </BottomSheet>
  );
}
