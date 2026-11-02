import type { ReactNode } from "react";

// 산업디자인 스케치 공용 — 사선 투영(3/4 시점), 두께 돌출, 마커 음영.
// 평면 좌표 (u = 길이, v = 폭)를 화면 좌표로 옮긴다. 두께는 화면에서 아래로 민다.
export const INK = "#26292f";
export const PAPER = "#fbfaf6";
export const RED = "#d64545";
export const SCREEN = "#e4f1ec";

export interface Palette { id: string; label: string; base: string; shade: string; deep: string; hi: string }
export const PALETTES: Palette[] = [
  { id: "white", label: "화이트", base: "#fbfbf8", shade: "#d8dbe1", deep: "#b9bec8", hi: "#ffffff" },
  { id: "mint", label: "민트", base: "#cdeee1", shade: "#94cfb9", deep: "#6fb59b", hi: "#f1fbf7" },
  { id: "lavender", label: "라벤더", base: "#e1dbf5", shade: "#b5a9e0", deep: "#9486cf", hi: "#f7f5fd" },
  { id: "peach", label: "피치", base: "#fbdac8", shade: "#eeb193", deep: "#de9470", hi: "#fff6f1" },
  { id: "charcoal", label: "차콜", base: "#5b606a", shade: "#3d4149", deep: "#2b2e34", hi: "#8a909b" },
];

export interface View { ox: number; oy: number; a: number; b: number; c: number; d: number }
export const view = (ox: number, oy: number, k = 1): View => ({ ox, oy, a: 0.92 * k, b: 0.3 * k, c: -0.42 * k, d: 0.56 * k });
export const P = (v: View, u: number, w: number, lift = 0): [number, number] => [v.ox + v.a * u + v.c * w, v.oy + v.b * u + v.d * w + lift];
export const M = (v: View) => `matrix(${v.a} ${v.b} ${v.c} ${v.d} ${v.ox} ${v.oy})`;

/** 둥근 사각형 path (평면 좌표) */
export const rr = (x: number, y: number, w: number, h: number, r: number) => {
  r = Math.min(r, w / 2, h / 2);
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
};

const NS = { vectorEffect: "non-scaling-stroke" as const };

/** 두께가 있는 판 — 옆면(진한 마커)을 쌓고 윗면을 덮는다. children은 윗면 위 디테일(평면 좌표). */
export function Slab({ v, box, t, pal, lift = 0, clipId, children, hiStrokes = true }: {
  v: View; box: [number, number, number, number, number]; t: number; pal: Palette; lift?: number; clipId: string; children?: ReactNode; hiStrokes?: boolean;
}) {
  const [bx, by, bw, bh, br] = box;
  const d = rr(bx, by, bw, bh, br);
  const steps = Math.max(2, Math.ceil(t / 1.5));
  // 옆면 실루엣 — 화면에서 가장 왼쪽·오른쪽 모서리에 세로선
  const k = Math.min(br, bw / 2, bh / 2) * (1 - Math.SQRT1_2);
  const corners = [P(v, bx + k, by + k), P(v, bx + bw - k, by + k), P(v, bx + bw - k, by + bh - k), P(v, bx + k, by + bh - k)];
  const left = corners.reduce((m, c) => (c[0] < m[0] ? c : m));
  const right = corners.reduce((m, c) => (c[0] > m[0] ? c : m));
  const layer = (dy: number, props: Record<string, unknown>, key?: number) => (
    <g key={key} transform={`translate(0 ${lift + dy})`}><g transform={M(v)}><path d={d} {...NS} {...props} /></g></g>
  );
  return (
    <g>
      {/* 바닥 그림자 */}
      <g transform={`translate(${t * 0.35} ${lift + t + 6})`} opacity={0.18}><g transform={M(v)}><path d={d} fill={INK} /></g></g>
      {layer(t, { fill: pal.shade }, -1)}
      {layer(t, { fill: "none", stroke: INK, strokeWidth: 3 }, -2)}
      {Array.from({ length: steps - 1 }, (_, i) => layer(t - (t * (i + 1)) / steps, { fill: pal.shade }, i))}
      {[left, right].map((c, i) => <line key={i} x1={c[0]} y1={c[1] + lift} x2={c[0]} y2={c[1] + lift + t} stroke={INK} strokeWidth={2.2} />)}
      <g transform={`translate(0 ${lift})`}>
        <g transform={M(v)}>
          <clipPath id={clipId}><path d={d} /></clipPath>
          <path d={d} fill={pal.base} {...NS} />
          {hiStrokes && (
            <g clipPath={`url(#${clipId})`} opacity={0.75}>
              {[-40, 10, 60].map((o) => <line key={o} x1={o} y1={-20} x2={o + 260} y2={400} stroke={pal.hi} strokeWidth={14} strokeLinecap="round" />)}
            </g>
          )}
          {children}
          <path d={d} fill="none" stroke={INK} strokeWidth={2.4} {...NS} />
          <path d={d} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.5} transform="translate(1.5 -1)" {...NS} />
        </g>
      </g>
    </g>
  );
}

/** 평면 좌표 디테일용 선 굵기 고정 props */
export const ink = (w = 1.4, extra: Record<string, unknown> = {}) => ({ stroke: INK, strokeWidth: w, vectorEffect: "non-scaling-stroke" as const, ...extra });

/** 치수선 — 수치는 지어내지 않는다 */
export function Dim({ x1, y1, x2, y2, label, off = 0 }: { x1: number; y1: number; x2: number; y2: number; label: string; off?: number }) {
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const nx = -(y2 - y1), ny = x2 - x1, nl = Math.hypot(nx, ny) || 1;
  const tick = (x: number, y: number) => <line x1={x - (nx / nl) * 6} y1={y - (ny / nl) * 6} x2={x + (nx / nl) * 6} y2={y + (ny / nl) * 6} stroke={INK} strokeWidth={1} />;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const a = ang > 90 || ang < -90 ? ang + 180 : ang;
  return (
    <g opacity={0.75}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={1} strokeDasharray="0" />
      {tick(x1, y1)}{tick(x2, y2)}
      <text x={mx} y={my} dy={-5 + off} fontSize={11} textAnchor="middle" fill={INK} transform={`rotate(${a} ${mx} ${my})`} style={{ paintOrder: "stroke" }} stroke={PAPER} strokeWidth={4}>{label}</text>
    </g>
  );
}
