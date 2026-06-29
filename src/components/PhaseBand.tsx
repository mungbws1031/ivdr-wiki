import type { Phase, Station } from "../data/stations";
import { StationCard } from "./StationCard";

/**
 * 페이즈 색 밴드 + 라벨 + 카드들.
 * 틴트 배경으로 그룹을 즉시 인지 (게슈탈트 공통영역).
 */
export function PhaseBand({
  phase,
  stations,
  activeId,
  onOpen,
  registerRef,
}: {
  phase: Phase;
  stations: Station[];
  activeId?: number;
  onOpen: (id: number) => void;
  registerRef?: (el: HTMLElement | null) => void;
}) {
  const color = `var(${phase.colorVar})`;
  const tint = `var(${phase.tintVar})`;

  return (
    <section
      ref={registerRef}
      id={`phase-${phase.id}`}
      aria-labelledby={`phase-${phase.id}-title`}
      className="scroll-mt-24 rounded-[var(--r-lg)]"
      style={{ background: tint, padding: "var(--s-6)" }}
    >
      {/* 페이즈 헤더 */}
      <header className="mb-5 flex items-center gap-3">
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-[var(--r-md)] text-text-on-color font-extrabold"
          style={{ background: color, width: 40, height: 40, fontSize: "var(--t-lg)" }}
          aria-hidden
        >
          {phase.order}
        </span>
        <div className="min-w-0">
          <h2
            id={`phase-${phase.id}-title`}
            className="font-extrabold text-text"
            style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)" }}
          >
            <span style={{ color }}>Phase {phase.order}</span> · {phase.title}
          </h2>
          <p className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
            {phase.subtitle}
          </p>
        </div>
      </header>

      {/* 카드 그리드 — 데스크톱 multi-col, 모바일 1-col */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {stations.map((s) => (
          <StationCard
            key={s.id}
            station={s}
            active={activeId === s.id}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}
