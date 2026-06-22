import { CalendarClock, AlertTriangle } from "lucide-react";
import { transitions, transitionConditions, type TagTone } from "../data/stations";

const PIN: Record<TagTone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
  neutral: "var(--text-muted)",
};

/**
 * 전환 기한 (클래스별) — 가로 타임라인, 마일스톤 핀.
 * Regulation (EU) 2024/1860.
 */
export function TransitionTimeline() {
  return (
    <section
      aria-labelledby="transition-heading"
      className="rounded-[var(--r-lg)] border bg-surface"
      style={{ borderColor: "var(--border)", padding: "var(--s-6)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-2)" }}>
        <CalendarClock size={20} style={{ color: "var(--text-muted)" }} aria-hidden />
        <h2 id="transition-heading" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>
          전환 기한 — 클래스별 마감
        </h2>
      </div>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-6)" }}>
        Regulation (EU) 2024/1860. 높은 위험일수록 마감이 빠르다.
      </p>

      {/* 타임라인 */}
      <div className="relative" style={{ paddingLeft: 8 }}>
        <div
          aria-hidden
          className="absolute left-2 top-1 bottom-1 w-0.5"
          style={{ background: "var(--border-strong)" }}
        />
        <ul className="flex flex-col" style={{ gap: "var(--s-4)" }}>
          {transitions.map((t) => (
            <li key={t.cls} className="relative flex items-start gap-4" style={{ paddingLeft: 18 }}>
              <span
                aria-hidden
                className="absolute left-0 top-1.5 rounded-full"
                style={{
                  width: 14,
                  height: 14,
                  background: PIN[t.tone],
                  boxShadow: "0 0 0 3px var(--surface)",
                }}
              />
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                  {t.cls}
                </span>
                <span
                  className="font-mono font-bold"
                  style={{ color: PIN[t.tone], fontSize: "var(--t-base)" }}
                >
                  {t.deadline}
                </span>
                {t.detail && (
                  <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
                    {t.detail}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 연장 조건 경고 */}
      <div
        className="flex gap-2 rounded-[var(--r-md)]"
        style={{ background: "var(--danger-bg)", padding: "var(--s-4)", marginTop: "var(--s-6)" }}
      >
        <AlertTriangle size={18} style={{ color: "var(--danger)" }} className="mt-0.5 shrink-0" aria-hidden />
        <div>
          <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
            연장은 자동이 아니다 — 아래를 모두 충족해야 한다
          </p>
          <ul className="list-disc text-text-muted" style={{ fontSize: "var(--t-sm)", paddingLeft: 18, marginTop: 4 }}>
            {transitionConditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
