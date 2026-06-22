import { phaseById, type Station } from "../data/stations";
import { getIcon } from "../lib/icons";
import { StatusChip } from "./StatusChip";

/**
 * 정거장 1개 = 글랜서블 최소 단위.
 * 한 줄에 [번호 원·페이즈색][아이콘][상태칩] → 제목 → 한 줄 요약.
 * 좌측 4px 페이즈 색 막대. hover 시 살짝 떠오름. 클릭 → StationDetail.
 */
export function StationCard({
  station,
  active,
  onOpen,
}: {
  station: Station;
  active?: boolean;
  onOpen: (id: number) => void;
}) {
  const phase = phaseById(station.phase);
  const color = `var(${phase.colorVar})`;
  const Icon = getIcon(station.icon);

  return (
    <button
      type="button"
      onClick={() => onOpen(station.id)}
      aria-label={`정거장 ${station.id}. ${station.title} — 상세 열기`}
      className="group relative w-full overflow-hidden rounded-[var(--r-md)] border bg-bg text-left transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5"
      style={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        boxShadow: active ? "var(--shadow-pop)" : "var(--shadow-card)",
        minHeight: 116,
        paddingInline: "var(--s-4)",
        paddingBlock: "var(--s-3)",
      }}
    >
      {/* 좌측 4px 페이즈 색 막대 */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: color }}
      />

      {/* 1행: 번호 원 + 아이콘 + 상태칩 */}
      <div className="flex items-center gap-3 pl-2">
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full text-text-on-color font-bold"
          style={{
            background: color,
            width: 30,
            height: 30,
            fontSize: "var(--t-sm)",
          }}
        >
          {station.id}
        </span>
        <Icon
          size={20}
          strokeWidth={2}
          style={{ color }}
          className="shrink-0"
          aria-hidden
        />
        <span className="ml-auto">
          <StatusChip label={station.tag.label} tone={station.tag.tone} />
        </span>
      </div>

      {/* 제목 */}
      <h3
        className="pl-2 font-bold text-text"
        style={{
          fontSize: "var(--t-lg)",
          lineHeight: "var(--lh-tight)",
          marginTop: "var(--s-2)",
        }}
      >
        {station.title}
      </h3>

      {/* 한 줄 요약 — 여기까지 읽으면 파악 끝 */}
      <p
        className="pl-2 text-text-muted"
        style={{ fontSize: "var(--t-sm)", marginTop: 2 }}
      >
        {station.oneLine}
      </p>
    </button>
  );
}
