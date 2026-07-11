import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { EddieMascot } from "./EddieMascot";
import { SCENARIO } from "../data";
import { formatClock, useNow } from "../useNow";
import type { EddieMood } from "../data";

/**
 * 에디 시계 — 실제보다 5~10분 빠르게 표시(시간맹 보정, FR-101).
 *
 * ⚠️ 금지 패턴 준수: 정확한 오프셋(몇 분 빠른지)을 절대 노출하지 않는다(R-01).
 *    "조금 빨라요"까지만 안내하고 숫자는 어디에도 쓰지 않는다.
 */
export function EddieClock({ mood = "calm", greeting }: { mood?: EddieMood; greeting: string }) {
  const now = useNow(15_000); // 15초마다 갱신(분 단위 표시라 충분)
  const [showHint, setShowHint] = useState(false);

  // 세션 동안 고정된 숨은 오프셋(5~10분). 화면에 노출하지 않는다.
  const offsetMin = useMemo(() => {
    const [lo, hi] = SCENARIO.clockOffsetMinRange;
    return lo + Math.floor(Math.random() * (hi - lo + 1));
  }, []);

  const shown = new Date(now.getTime() + offsetMin * 60_000);
  const { hh, mm } = formatClock(shown);

  return (
    <header className="eddie-rise px-5 pt-4 pb-5">
      <div className="flex items-center justify-between gap-4">
        {/* 인사 + 시계 */}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--e-text-subtle)]">
            {greeting}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className="eddie-num text-[52px] font-bold leading-none text-[var(--e-text)]"
              aria-label={`에디 시계 ${hh}시 ${mm}분`}
            >
              {hh}
              <span className="text-[var(--e-primary)]">:</span>
              {mm}
            </span>
          </div>

          {/* 에디 시계 라벨 + 오프셋 비노출 힌트 */}
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            aria-expanded={showHint}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--e-primary-weak)] px-2.5 py-1 text-[12px] font-semibold text-[var(--e-primary-deep)]"
          >
            <span className="eddie-now-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--e-primary)]" />
            에디 시계
            <Info size={13} strokeWidth={2.4} aria-hidden />
          </button>
          {showHint && (
            <p className="mt-2 max-w-[210px] text-[12px] leading-relaxed text-[var(--e-text-muted)]">
              에디 시계는 실제보다 <b className="text-[var(--e-text)]">조금 빨라요</b>. 덕분에
              마음이 덜 급해져요. 얼마나 빠른지는 비밀이에요 🙂
            </p>
          )}
        </div>

        {/* 마스코트 */}
        <EddieMascot mood={mood} size={84} className="eddie-bob shrink-0" />
      </div>
    </header>
  );
}
