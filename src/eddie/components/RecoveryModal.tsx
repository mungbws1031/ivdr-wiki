import { useEffect, useState } from "react";
import { Check, Moon, SunMedium, Timer, X } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { EddieMascot } from "./EddieMascot";
import { pad2 } from "../useNow";
import type { EddieMood, TimelineBlock } from "../data";

export type RecoveryAction = "now" | "evening" | "tomorrow" | "pass";

const MINI_TIMER_SEC = 15 * 60;

/**
 * 실패·회복 모달 (우선 설계 화면 3순위, Flow 4 — "가장 중요").
 *
 * 절대 규칙(R-02, NFR-A-002): 자책 유발 문구 금지, 선택지 3개 이하 우선
 * (여기서는 4개까지 브리프에서 명시적으로 허용), 스트릭은 리셋이 아니라
 * '회복'으로 표현. 놓침은 항상 회색+아이콘이며 절대 빨강을 쓰지 않는다.
 */
export function RecoveryModal({
  block,
  open,
  onClose,
  onResolve,
}: {
  block: TimelineBlock | null;
  open: boolean;
  onClose: () => void;
  onResolve: (block: TimelineBlock, action: RecoveryAction) => void;
}) {
  const [view, setView] = useState<"choice" | "timer" | "confirm">("choice");
  const [confirmedAction, setConfirmedAction] = useState<RecoveryAction | null>(null);
  const [secLeft, setSecLeft] = useState(MINI_TIMER_SEC);

  // 모달이 새로 열릴 때마다(블록이 바뀔 때) 처음 화면으로.
  useEffect(() => {
    if (open) {
      setView("choice");
      setConfirmedAction(null);
      setSecLeft(MINI_TIMER_SEC);
    }
  }, [open, block?.id]);

  useEffect(() => {
    if (view !== "timer") return;
    const id = setInterval(() => setSecLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [view]);

  if (!block) return null;

  const choose = (action: RecoveryAction) => {
    if (action === "now") {
      setView("timer");
      return;
    }
    setConfirmedAction(action);
    setView("confirm");
  };

  const finishTimer = () => {
    setConfirmedAction("now");
    setView("confirm");
  };

  const done = () => {
    if (confirmedAction) onResolve(block, confirmedAction);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={view === "choice" ? "괜찮아" : undefined}>
      {view === "choice" && (
        <ChoiceView blockTitle={block.title} onChoose={choose} />
      )}
      {view === "timer" && (
        <TimerView
          blockTitle={block.title}
          secLeft={secLeft}
          onFinish={finishTimer}
          onBack={() => setView("choice")}
        />
      )}
      {view === "confirm" && confirmedAction && (
        <ConfirmView action={confirmedAction} onClose={done} />
      )}
    </BottomSheet>
  );
}

function ChoiceView({
  blockTitle,
  onChoose,
}: {
  blockTitle: string;
  onChoose: (a: RecoveryAction) => void;
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <EddieMascot mood="calm" size={56} className="shrink-0" />
        <div className="mt-1 min-w-0 rounded-[var(--e-r-md)] rounded-tl-sm bg-[var(--e-missed-bg)] px-3.5 py-2.5">
          <p className="text-[14px] font-bold leading-snug text-[var(--e-text)]">
            "{blockTitle}" 놓쳤구나. 괜찮아 — 지금 할래? 옮길래?
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <RecoveryOption
          icon={Timer}
          title="지금 15분만"
          desc="짧게라도 지금 해볼까"
          onClick={() => onChoose("now")}
        />
        <RecoveryOption
          icon={SunMedium}
          title="저녁으로 옮기기"
          desc="오늘 안에 다시 시도"
          onClick={() => onChoose("evening")}
        />
        <RecoveryOption
          icon={Moon}
          title="내일로 이월"
          desc="내일 아침에 다시 보여줄게"
          onClick={() => onChoose("tomorrow")}
        />
        <RecoveryOption
          icon={X}
          title="오늘은 패스"
          desc="비난 없이 접어둘게"
          onClick={() => onChoose("pass")}
        />
      </div>
    </div>
  );
}

function RecoveryOption({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: typeof Timer;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[var(--e-touch)] w-full items-center gap-3 rounded-[var(--e-r-md)] border border-[var(--e-border)] bg-[var(--e-surface)] px-3.5 py-3 text-left active:bg-[var(--e-surface-2)]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--e-surface-2)] text-[var(--e-text-muted)]">
        <Icon size={18} strokeWidth={2.2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold text-[var(--e-text)]">{title}</span>
        <span className="block text-[12px] font-semibold text-[var(--e-text-subtle)]">{desc}</span>
      </span>
    </button>
  );
}

function TimerView({
  blockTitle,
  secLeft,
  onFinish,
  onBack,
}: {
  blockTitle: string;
  secLeft: number;
  onFinish: () => void;
  onBack: () => void;
}) {
  const m = Math.floor(secLeft / 60);
  const s = secLeft % 60;
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <EddieMascot mood="cheer" size={64} className="eddie-bob" />
      <p className="mt-3 text-[14px] font-bold text-[var(--e-text-muted)]">
        "{blockTitle}" 딱 15분만 같이 해보자
      </p>
      <p className="eddie-num mt-2 text-[48px] font-extrabold text-[var(--e-primary-deep)]" aria-live="polite">
        {pad2(m)}:{pad2(s)}
      </p>
      <button
        type="button"
        onClick={onFinish}
        className="mt-4 flex min-h-[var(--e-touch)] w-full items-center justify-center gap-2 rounded-[var(--e-r-md)] bg-[var(--e-primary)] px-4 font-bold text-[var(--e-on-primary)] shadow-[var(--e-shadow-fab)] active:translate-y-px"
      >
        <Check size={18} strokeWidth={2.6} aria-hidden />
        다 했어요
      </button>
      <button
        type="button"
        onClick={onBack}
        className="mt-2 min-h-[var(--e-touch)] text-[13px] font-bold text-[var(--e-text-subtle)]"
      >
        다른 걸로 바꿀래
      </button>
    </div>
  );
}

const CONFIRM: Record<RecoveryAction, { mood: EddieMood; text: string }> = {
  now: { mood: "happy", text: "회복 완료! 짧아도 해낸 거야, 잘했어." },
  evening: { mood: "cheer", text: "좋아, 저녁으로 옮겨뒀어. 그때 다시 알려줄게." },
  tomorrow: { mood: "calm", text: "괜찮아, 내일 아침에 다시 보여줄게." },
  pass: { mood: "calm", text: "그래, 오늘은 여기까지. 내일 또 하면 돼." },
};

function ConfirmView({ action, onClose }: { action: RecoveryAction; onClose: () => void }) {
  const { mood, text } = CONFIRM[action];
  return (
    <div className="flex flex-col items-center py-3 text-center">
      <EddieMascot mood={mood} size={72} className="eddie-rise" />
      <p className="mt-3 max-w-[240px] text-[15px] font-bold leading-snug text-[var(--e-text)]">
        {text}
      </p>
      <p className="mt-1 text-[12px] font-semibold text-[var(--e-text-subtle)]">
        스트릭은 그대로야 — 리셋 없음
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 min-h-[var(--e-touch)] w-full rounded-[var(--e-r-md)] bg-[var(--e-surface-2)] px-4 font-bold text-[var(--e-text)]"
      >
        확인
      </button>
    </div>
  );
}
