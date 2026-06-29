import { stations, phaseById, phases } from "../data/stations";

/** 정거장 짧은 라벨 (지도용). */
const SHORT: Record<number, string> = {
  1: "출발점",
  2: "분류",
  3: "평가경로",
  4: "QMS",
  5: "기술문서",
  6: "성능평가",
  7: "위험관리",
  8: "NB 심사",
  9: "CE 마킹",
  10: "등록·UDI",
  11: "시판후 감시",
};

/** 정거장 좌표 (serpentine: 1→4 우, 5→8 좌, 9→11 우). */
const POS: Record<number, { x: number; y: number; labelBelow: boolean }> = {
  1: { x: 130, y: 120, labelBelow: false },
  2: { x: 320, y: 120, labelBelow: false },
  3: { x: 510, y: 120, labelBelow: false },
  4: { x: 700, y: 120, labelBelow: false },
  5: { x: 820, y: 300, labelBelow: true },
  6: { x: 620, y: 300, labelBelow: true },
  7: { x: 420, y: 300, labelBelow: true },
  8: { x: 220, y: 300, labelBelow: true },
  9: { x: 260, y: 470, labelBelow: true },
  10: { x: 470, y: 470, labelBelow: true },
  11: { x: 680, y: 470, labelBelow: true },
};

const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function colorOf(id: number): string {
  const st = stations.find((s) => s.id === id)!;
  return `var(${phaseById(st.phase).colorVar})`;
}

/** 두 정거장 사이 노선 path (U턴 구간은 곡선). */
function segPath(a: number, b: number): string {
  const p = POS[a];
  const q = POS[b];
  if (a === 4 && b === 5) return `M${p.x},${p.y} C880,120 880,300 ${q.x},${q.y}`;
  if (a === 8 && b === 9) return `M${p.x},${p.y} C120,300 120,470 ${q.x},${q.y}`;
  return `M${p.x},${p.y} L${q.x},${q.y}`;
}

/** St2 분류 갈림길 분기 (지도 위 작은 가지). */
const FORKS = [
  { x: 196, y: 44, label: "A → 바로 CE", color: "var(--success)" },
  { x: 320, y: 30, label: "B·C → NB", color: "var(--warning)" },
  { x: 452, y: 44, label: "D → NB+검사실", color: "var(--danger)" },
];

/**
 * 여정 노선도 — 11 정거장을 5색 페이즈 노선으로 잇는 메트로식 지도.
 * 정거장 클릭 → 상세 drawer. 현재 위치(출발)는 SU Red 단일 accent.
 */
export function JourneyRouteMap({ onOpen }: { onOpen: (id: number) => void }) {
  return (
    <section
      aria-label="IVDR 여정 노선도"
      className="rounded-[var(--r-lg)] border"
      style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-5)" }}
    >
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox="0 0 950 540"
          role="img"
          aria-label="5 페이즈 11 정거장 여정 지도"
          style={{ width: "100%", minWidth: 620, height: "auto", display: "block" }}
        >
          {/* 노선 (페이즈 색 세그먼트) */}
          {ORDER.slice(0, -1).map((id, i) => {
            const next = ORDER[i + 1];
            return (
              <path
                key={`seg-${id}`}
                d={segPath(id, next)}
                fill="none"
                stroke={colorOf(id)}
                strokeWidth={11}
                strokeLinecap="round"
                opacity={0.9}
              />
            );
          })}

          {/* St2 분류 갈림길 분기 */}
          {FORKS.map((f) => (
            <g key={f.label}>
              <path
                d={`M${POS[2].x},${POS[2].y} L${f.x},${f.y + 8}`}
                stroke={f.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="2 5"
                fill="none"
              />
              <circle cx={f.x} cy={f.y} r={5} fill={f.color} />
              <text
                x={f.x}
                y={f.y - 10}
                textAnchor="middle"
                style={{ fontSize: 12, fontWeight: 700, fill: "var(--text)" }}
              >
                {f.label}
              </text>
            </g>
          ))}

          {/* 정거장 노드 */}
          {ORDER.map((id) => {
            const p = POS[id];
            const color = colorOf(id);
            const isStart = id === 1;
            return (
              <g
                key={id}
                onClick={() => onOpen(id)}
                style={{ cursor: "pointer" }}
                tabIndex={0}
                role="button"
                aria-label={`정거장 ${id} ${SHORT[id]} 상세 열기`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onOpen(id);
                }}
              >
                {/* 현재 위치(출발) 링 — 단일 accent */}
                {isStart && (
                  <circle cx={p.x} cy={p.y} r={30} fill="none" stroke="var(--accent)" strokeWidth={3} />
                )}
                <circle cx={p.x} cy={p.y} r={22} fill={color} stroke="#fff" strokeWidth={3} />
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  style={{ fontSize: 17, fontWeight: 800, fill: "#fff" }}
                >
                  {id}
                </text>
                {/* 라벨 */}
                <text
                  x={p.x}
                  y={p.labelBelow ? p.y + 44 : p.y - 34}
                  textAnchor="middle"
                  style={{ fontSize: 13, fontWeight: 700, fill: "var(--text)" }}
                >
                  {SHORT[id]}
                </text>
                {isStart && (
                  <text
                    x={p.x}
                    y={p.y + 58}
                    textAnchor="middle"
                    style={{ fontSize: 11, fontWeight: 700, fill: "var(--accent)" }}
                  >
                    ● 현재 위치
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 페이즈 범례 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" style={{ marginTop: "var(--s-3)" }}>
        {phases.map((ph) => (
          <span key={ph.id} className="inline-flex items-center gap-1.5" style={{ fontSize: "var(--t-xs)" }}>
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{ width: 12, height: 12, background: `var(${ph.colorVar})` }}
            />
            <span className="font-semibold text-text">P{ph.order}</span>
            <span className="text-text-muted">{ph.title}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
