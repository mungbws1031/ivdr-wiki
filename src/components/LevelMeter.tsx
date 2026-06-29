import { Gauge, Star } from "lucide-react";
import {
  difficultyLabel,
  importanceLabel,
  levelRank,
  type Level,
} from "../data/docTree";

/** 난이도/중요도 3핀 미터 + 라벨. 색 단독 금지(라벨 동반). */
export function LevelMeter({
  kind,
  level,
  showLabel = true,
}: {
  kind: "difficulty" | "importance";
  level: Level;
  showLabel?: boolean;
}) {
  const rank = levelRank[level];
  const isImp = kind === "importance";
  const label = isImp ? importanceLabel[level] : difficultyLabel[level];
  const Icon = isImp ? Star : Gauge;
  const fill = isImp
    ? level === "high"
      ? "var(--accent)"
      : level === "med"
        ? "var(--warning)"
        : "var(--text-subtle)"
    : "var(--text-muted)";

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`${isImp ? "중요도" : "난이도"}: ${label}`}
    >
      <Icon size={13} style={{ color: fill }} aria-hidden />
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: i <= rank ? fill : "transparent",
              border: i <= rank ? "none" : "1px solid var(--border-strong)",
            }}
          />
        ))}
      </span>
      {showLabel && (
        <span className="font-semibold" style={{ fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>
          {isImp ? "중요도" : "난이도"} {label}
        </span>
      )}
    </span>
  );
}
