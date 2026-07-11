import { useMemo } from "react";
import { CheckCircle2, Footprints, MapPin, Clock3 } from "lucide-react";
import { SCENARIO } from "../data";
import { formatHHMM, pad2, useNow } from "../useNow";

/**
 * 다음 출발 카운트다운 (에디 시그니처, Flow 2).
 *  - 일정 시작 − (준비 + 이동)으로 '출발 시각'을 역산(FR-102·103).
 *  - 여유: 안심 톤 / 임박: 출발 넛지 + 나가기 전 체크 연결.
 *  - ⚠️ 여기서 '역산해 보여주는' 건 출발 시각이지 시계 오프셋이 아니다.
 *    시계 오프셋 비노출 규칙과 무관하며, 카운트다운은 정상 표시한다.
 */
export function DepartureCountdown({ onCheck }: { onCheck?: () => void }) {
  const now = useNow(1000);

  // 마운트 시점을 기준으로 이벤트/출발 시각을 고정(시간이 흘러도 일관).
  const { eventAt, departureAt, baseAt } = useMemo(() => {
    const base = new Date();
    const ev = new Date(base.getTime() + SCENARIO.minutesToEvent * 60_000);
    const dep = new Date(ev.getTime() - (SCENARIO.prepMin + SCENARIO.moveMin) * 60_000);
    return { eventAt: ev, departureAt: dep, baseAt: base };
  }, []);

  const msLeft = Math.max(0, departureAt.getTime() - now.getTime());
  const totalSec = Math.floor(msLeft / 1000);
  const minLeft = Math.floor(totalSec / 60);
  const secLeft = totalSec % 60;

  const imminent = minLeft < SCENARIO.imminentThresholdMin;

  // 진행 바: 기준~출발까지 경과 비율.
  const span = departureAt.getTime() - baseAt.getTime();
  const ratio = span > 0 ? Math.min(1, Math.max(0, (now.getTime() - baseAt.getTime()) / span)) : 1;

  const tone = imminent
    ? {
        cardBg: "var(--e-active-bg)",
        ring: "var(--e-active)",
        chipBg: "var(--e-active)",
        chipText: "#fff",
        label: "슬슬 나갈 준비!",
        big: "var(--e-primary-deep)",
      }
    : {
        cardBg: "var(--e-accent-weak)",
        ring: "var(--e-accent)",
        chipBg: "var(--e-accent-weak)",
        chipText: "var(--e-accent-deep)",
        label: "아직 여유 있어",
        big: "var(--e-text)",
      };

  return (
    <section
      className="mx-4 rounded-[var(--e-r-lg)] p-4 shadow-[var(--e-shadow-card)]"
      style={{ background: tone.cardBg }}
      aria-label="다음 출발 카운트다운"
    >
      {/* 상태 칩 + 다음 일정 */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold"
          style={{ background: tone.chipBg, color: tone.chipText }}
        >
          <Footprints size={13} strokeWidth={2.6} aria-hidden />
          {tone.label}
        </span>
        <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--e-text-muted)]">
          <MapPin size={12} strokeWidth={2.4} aria-hidden />
          {SCENARIO.eventPlace}
        </span>
      </div>

      {/* 카운트다운 본체 */}
      <div className="mt-3 flex items-end gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--e-text-muted)]">출발까지</p>
          <p className="mt-0.5 flex items-baseline gap-1">
            <span
              className="eddie-num text-[40px] font-bold leading-none"
              style={{ color: tone.big }}
              aria-label={`출발까지 ${minLeft}분 ${secLeft}초 남음`}
            >
              {pad2(minLeft)}:{pad2(secLeft)}
            </span>
            <span className="text-[13px] font-semibold text-[var(--e-text-subtle)]">min</span>
          </p>
        </div>

        {/* 역산 요약: 출발 → 이동 → 도착 */}
        <div className="ml-auto text-right text-[12px] leading-tight text-[var(--e-text-muted)]">
          <p className="font-bold text-[var(--e-text)]">
            <span className="eddie-num">{formatHHMM(departureAt)}</span> 출발
          </p>
          <p className="mt-0.5">
            준비 {SCENARIO.prepMin}분 · 이동 {SCENARIO.moveMin}분
          </p>
          <p className="mt-0.5">
            <span className="eddie-num">{formatHHMM(eventAt)}</span> {SCENARIO.eventTitle}
          </p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/5" aria-hidden>
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${ratio * 100}%`, background: tone.ring }}
        />
      </div>

      {/* 임박이면 나가기 전 체크 연결(FR-104), 여유면 담백한 안내 */}
      {imminent ? (
        <button
          type="button"
          onClick={onCheck}
          className="mt-3 flex min-h-[var(--e-touch)] w-full items-center justify-center gap-2 rounded-[var(--e-r-md)] bg-[var(--e-primary)] px-4 font-bold text-[var(--e-on-primary)] shadow-[var(--e-shadow-fab)] active:translate-y-px"
        >
          <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden />
          나가기 전 체크 — 약·준비물
        </button>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--e-text-muted)]">
          <Clock3 size={13} strokeWidth={2.4} aria-hidden />
          천천히 준비해도 괜찮아. 출발 시각 되면 알려줄게.
        </p>
      )}
    </section>
  );
}
