import { GitFork, ArrowRight } from "lucide-react";
import type { ForkPath, TagTone } from "../data/stations";

const TONE_COLOR: Record<TagTone, { line: string; bg: string; fg: string }> = {
  success: { line: "var(--success)", bg: "var(--success-bg)", fg: "var(--success)" },
  warning: { line: "var(--warning)", bg: "var(--warning-bg)", fg: "var(--warning)" },
  danger: { line: "var(--danger)", bg: "var(--danger-bg)", fg: "var(--danger)" },
  info: { line: "var(--info)", bg: "var(--info-bg)", fg: "var(--info)" },
  neutral: { line: "var(--border-strong)", bg: "var(--surface-2)", fg: "var(--text-muted)" },
};

/**
 * St2 분류 갈림길 — 페이지 최대 시각 요소. 3갈래 분기.
 * 결정점을 가장 시각적으로(개선 원칙 4).
 */
export function DecisionFork({
  forks,
  onOpenStation,
}: {
  forks: ForkPath[];
  onOpenStation: (id: number) => void;
}) {
  return (
    <section
      aria-labelledby="fork-heading"
      className="rounded-[var(--r-lg)] border"
      style={{
        borderColor: "var(--border)",
        background: "var(--p2-tint)",
        padding: "var(--s-8)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 920 }}>
        {/* 결정 노드 */}
        <div className="flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full font-bold text-text-on-color"
            style={{
              background: "var(--p2)",
              padding: "6px 16px",
              fontSize: "var(--t-sm)",
            }}
          >
            <GitFork size={16} strokeWidth={2.25} aria-hidden />
            정거장 2 · 결정점
          </span>
          <h2
            id="fork-heading"
            className="font-extrabold text-text"
            style={{
              fontSize: "var(--t-2xl)",
              lineHeight: "var(--lh-tight)",
              marginTop: "var(--s-3)",
            }}
          >
            클래스가 모든 경로를 가른다
          </h2>
          <p
            className="text-text-muted"
            style={{ fontSize: "var(--t-base)", marginTop: "var(--s-2)", maxWidth: 560 }}
          >
            Annex VIII Rule 1~7로 A/B/C/D를 결정한다. 어느 가지로 가느냐에 따라
            인증기관 개입과 전환 기한이 통째로 바뀐다.
          </p>
        </div>

        {/* 3갈래 분기 */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginTop: "var(--s-8)",
          }}
        >
          {forks.map((f) => {
            const c = TONE_COLOR[f.tone];
            return (
              <div
                key={f.label}
                className="flex flex-col rounded-[var(--r-md)] bg-bg"
                style={{
                  borderTop: `4px solid ${c.line}`,
                  boxShadow: "var(--shadow-card)",
                  padding: "var(--s-4)",
                }}
              >
                <span
                  className="inline-flex w-fit items-center rounded-full font-bold"
                  style={{
                    background: c.bg,
                    color: c.fg,
                    fontSize: "var(--t-sm)",
                    padding: "3px 12px",
                  }}
                >
                  {f.label}
                </span>
                <p
                  className="text-text-muted"
                  style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-3)" }}
                >
                  {f.desc}
                </p>
                <div
                  className="mt-auto flex items-center gap-2 font-semibold text-text"
                  style={{ fontSize: "var(--t-sm)", paddingTop: "var(--s-3)" }}
                >
                  <ArrowRight size={16} strokeWidth={2.25} style={{ color: c.line }} aria-hidden />
                  {f.route}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => onOpenStation(2)}
            className="font-semibold text-text-muted underline-offset-4 hover:underline"
            style={{ fontSize: "var(--t-sm)" }}
          >
            분류 규칙·주의사항 자세히 보기 →
          </button>
        </div>
      </div>
    </section>
  );
}
