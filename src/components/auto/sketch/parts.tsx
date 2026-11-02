import type { ReactNode } from "react";
import type { PartId, SketchKind } from "../../../lib/sketch";
import { INK, ink, M, P, PAPER, rr, RED, SCREEN, Slab, view, type Palette, type View } from "./geom";

// 형태별 본체 — 평면 좌표로 그리고 3/4 시점으로 투영한다. 각 형태는 콜아웃 앵커(화면 좌표)와 치수선을 함께 돌려준다.
export interface Drawn {
  node: ReactNode;
  anchors: Partial<Record<PartId, [number, number]>>;
  dims: { label: string; a: [number, number]; b: [number, number] }[];
}

const DIM = (L: string) => `${L} [__] mm`;

function lines(u1: number, u2: number, v1: number, v2: number) {
  return (
    <>
      <line x1={u1} y1={v1} x2={u1} y2={v2} stroke={RED} strokeWidth={3.2} vectorEffect="non-scaling-stroke" />
      <line x1={u2} y1={v1} x2={u2} y2={v2} stroke={RED} strokeWidth={3.2} vectorEffect="non-scaling-stroke" />
      <text x={u1} y={v2 + 13} fontSize={10} textAnchor="middle" fill={INK}>T</text>
      <text x={u2} y={v2 + 13} fontSize={10} textAnchor="middle" fill={INK}>C</text>
    </>
  );
}

/** 3면 치수(L·W·H) — 평면 판 기준 */
function slabDims(v: View, L: number, W: number, t: number, lift = 0, wAtStart = false): Drawn["dims"] {
  const wu = wAtStart ? -28 : L + 28;
  const out: Drawn["dims"] = [
    { label: DIM("L"), a: P(v, 0, -24, lift), b: P(v, L, -24, lift) },
    { label: DIM("W"), a: P(v, wu, 0, lift), b: P(v, wu, W, lift) },
  ];
  // 얇은 판은 높이 치수선이 너무 짧아 글자가 겹친다 — 40 이상일 때만
  if (t >= 40) out.push({ label: DIM("H"), a: [P(v, L, W, lift)[0] + 48, P(v, L, W, lift)[1]], b: [P(v, L, W, lift)[0] + 48, P(v, L, W, lift)[1] + t] });
  return out;
}

function cassetteTop(L: number, W: number) {
  const wy = W / 2;
  return (
    <>
      <circle cx={L * 0.2} cy={wy} r={W * 0.2} fill={PAPER} {...ink(1.4)} />
      <circle cx={L * 0.2} cy={wy} r={W * 0.11} fill="#ece8dc" {...ink(1)} />
      <text x={L * 0.2 - W * 0.32} y={wy + 4} fontSize={10} fill={INK}>S</text>
      <rect x={L * 0.45} y={wy - W * 0.17} width={L * 0.36} height={W * 0.34} rx={5} fill="#fff" {...ink(1.4)} />
      {lines(L * 0.56, L * 0.7, wy - W * 0.12, wy + W * 0.12)}
    </>
  );
}

export function drawBody(kind: SketchKind, pal: Palette, resultText: string, uid: string, hasPhone: boolean): Drawn {
  const cx = hasPhone ? -60 : 0; // 폰 자리만큼 왼쪽으로
  switch (kind) {
    case "midstream": {
      const v = view(250 + cx, 130, 1.25), L = 340, W = 54, t = 14;
            const cap = v;
      return {
        node: (
          <>
            <Slab v={cap} box={[30, 110, 110, 62, 30]} t={16} pal={pal} clipId={`${uid}c`}>
              <path d={rr(42, 122, 86, 38, 19)} fill="none" {...ink(1, { opacity: 0.5 })} />
            </Slab>
            <Slab v={v} box={[0, 0, L, W, 26]} t={t} pal={pal} clipId={`${uid}a`}>
              <path d={`M26 0H72V${W}H26A26 26 0 0 1 0 ${W - 26}V26A26 26 0 0 1 26 0Z`} fill="#f4f1e8" {...ink(1.2)} />
              {Array.from({ length: 7 }, (_, i) => <line key={i} x1={10 + i * 8} y1={8} x2={6 + i * 8} y2={W - 8} {...ink(0.8, { opacity: 0.55 })} />)}
              <rect x={130} y={14} width={88} height={26} rx={7} fill="#fff" {...ink(1.4)} />
              {lines(160, 190, 18, 36)}
              {Array.from({ length: 8 }, (_, i) => <line key={i} x1={252 + i * 9} y1={10} x2={252 + i * 9} y2={W - 10} {...ink(1, { opacity: 0.7 })} />)}
            </Slab>
          </>
        ),
        anchors: { tip: P(v, 36, 27), window: P(v, 140, 27), lines: P(v, 175, 20), grip: P(v, 290, 27), cap: P(v, 85, 141) },
        dims: slabDims(v, L, W, t),
      };
    }
    case "cassette": {
      const v = view(270 + cx, 140, 1.4), L = 260, W = 90, t = 14;
      return {
        node: <Slab v={v} box={[0, 0, L, W, 18]} t={t} pal={pal} clipId={`${uid}a`}>{cassetteTop(L, W)}<path d={rr(8, 8, L - 16, W - 16, 12)} fill="none" {...ink(0.8, { opacity: 0.35 })} /></Slab>,
        anchors: { well: P(v, L * 0.2, W / 2), window: P(v, L * 0.47, W * 0.35), lines: P(v, L * 0.63, W * 0.62) },
        dims: slabDims(v, L, W, t),
      };
    }
    case "reader": {
      const v = view(300 + cx, 110), L = 290, W = 190, t = 46;
            return {
        node: (
          <>
            <Slab v={v} box={[95, 120, 100, 150, 16]} t={10} lift={24} pal={{ ...pal, base: "#fbfbf8", shade: "#d8dbe1", deep: "#b9bec8", hi: "#fff" }} clipId={`${uid}c`}>
              <circle cx={145} cy={238} r={14} fill={PAPER} {...ink(1.2)} />
              <circle cx={145} cy={238} r={7} fill="#ece8dc" {...ink(0.8)} />
            </Slab>
            <Slab v={v} box={[0, 0, L, W, 44]} t={t} pal={pal} clipId={`${uid}a`}>
              <path d={rr(28, 24, 168, 82, 12)} fill={SCREEN} {...ink(1.6)} />
              <text x={112} y={72} fontSize={18} fontWeight={700} textAnchor="middle" fill={INK}>{resultText}</text>
              <circle cx={240} cy={64} r={17} fill={pal.shade} {...ink(1.4)} />
              <circle cx={240} cy={64} r={7} fill="none" {...ink(1.2)} />
              <path d={rr(70, 160, 150, 14, 7)} fill={INK} opacity={0.85} />
            </Slab>
          </>
        ),
        anchors: { screen: P(v, 60, 60), button: P(v, 240, 64), slot: P(v, 210, 167), well: P(v, 145, 238, 24) },
        dims: slabDims(v, L, W, t),
      };
    }
    case "meter": {
      const v = view(260 + cx, 140), L = 260, W = 130, t = 34;
      return {
        node: (
          <>
            <Slab v={v} box={[250, 50, 120, 30, 4]} t={3} lift={14} pal={{ ...pal, base: "#fbfbf8", shade: "#d8dbe1", deep: "#b9bec8", hi: "#fff" }} clipId={`${uid}c`} hiStrokes={false}>
              {[0, 1, 2].map((i) => <rect key={i} x={256} y={56 + i * 7} width={22} height={4} fill="#c9a640" />)}
              <circle cx={358} cy={65} r={7} fill="#f1d3d3" {...ink(0.8)} />
            </Slab>
            <Slab v={v} box={[0, 0, L, W, 52]} t={t} pal={pal} clipId={`${uid}a`}>
              <path d={rr(26, 20, 132, 90, 14)} fill={SCREEN} {...ink(1.6)} />
              <text x={92} y={70} fontSize={16} fontWeight={700} textAnchor="middle" fill={INK}>{resultText}</text>
              <circle cx={196} cy={42} r={14} fill={pal.shade} {...ink(1.3)} />
              <circle cx={196} cy={88} r={14} fill={pal.shade} {...ink(1.3)} />
              <path d={rr(246, 48, 10, 34, 3)} fill={INK} />
            </Slab>
          </>
        ),
        anchors: { screen: P(v, 50, 50), button: P(v, 196, 88), port: P(v, 252, 65), strip: P(v, 340, 65, 14) },
        dims: slabDims(v, L, W, t, 0, true),
      };
    }
    case "poct": {
      const v = view(300 + cx, 100), L = 300, W = 220, t = 80;
      const f = (u: number, dy: number) => P(v, u, W, dy);
      const drawer = [f(90, 26), f(230, 26), f(230, 54), f(90, 54)];
      return {
        node: (
          <>
            <Slab v={v} box={[0, 0, L, W, 30]} t={t} pal={pal} clipId={`${uid}a`}>
              <path d={rr(24, 22, 170, 120, 12)} fill={SCREEN} {...ink(1.6)} />
              <text x={109} y={88} fontSize={18} fontWeight={700} textAnchor="middle" fill={INK}>{resultText}</text>
              <circle cx={252} cy={42} r={13} fill={pal.shade} {...ink(1.3)} />
              {Array.from({ length: 6 }, (_, i) => <line key={i} x1={226 + i * 10} y1={150} x2={226 + i * 10} y2={196} {...ink(1, { opacity: 0.5 })} />)}
            </Slab>
            <polygon points={drawer.map((p) => p.join(",")).join(" ")} fill={INK} opacity={0.85} />
            <Slab v={v} box={[120, 214, 80, 46, 6]} t={8} lift={30} pal={{ ...pal, base: "#fbfbf8", shade: "#d8dbe1", deep: "#b9bec8", hi: "#fff" }} clipId={`${uid}c`} hiStrokes={false}>
              <circle cx={140} cy={240} r={8} fill={PAPER} {...ink(1)} />
            </Slab>
          </>
        ),
        anchors: { touch: P(v, 60, 60), button: P(v, 252, 42), drawer: P(v, 220, W, 40) },
        dims: slabDims(v, L, W, t),
      };
    }
    case "analyzer": {
      const v = view(310 + cx, 90, 0.85), L = 380, W = 240, t = 120;
      const front = (u: number, dy: number) => P(v, u, W, dy);
      const scr = [front(30, 24), front(150, 24), front(150, 84), front(30, 84)];
      return {
        node: (
          <>
            <Slab v={v} box={[0, 0, L, W, 16]} t={t} pal={pal} clipId={`${uid}a`}>
              {Array.from({ length: 8 }, (_, i) => (
                <g key={i}>
                  <rect x={200 + (i % 4) * 42} y={22 + Math.floor(i / 4) * 54} width={34} height={46} rx={5} fill={pal.shade} {...ink(1.1)} />
                  <circle cx={217 + (i % 4) * 42} cy={45 + Math.floor(i / 4) * 54} r={9} fill={PAPER} {...ink(1)} />
                </g>
              ))}
              <path d={rr(24, 160, 170, 46, 8)} fill={pal.shade} {...ink(1.2)} />
              {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={40 + i * 18} cy={183} r={7} fill={["#f2c14e", "#7cc4a6", "#e98b8b"][i % 3]} {...ink(1)} />)}
              <path d={rr(24, 22, 150, 110, 10)} fill="none" {...ink(1, { opacity: 0.4, strokeDasharray: "6 5" })} />
            </Slab>
            <polygon points={scr.map((p) => p.join(",")).join(" ")} fill={SCREEN} stroke={INK} strokeWidth={1.6} />
            <text x={(scr[0][0] + scr[2][0]) / 2} y={(scr[0][1] + scr[2][1]) / 2 + 4} fontSize={12} fontWeight={700} textAnchor="middle" fill={INK}>{resultText}</text>
          </>
        ),
        anchors: { screen: front(60, 50), reagents: P(v, 280, 70), rack: P(v, 110, 183) },
        dims: slabDims(v, L, W, t),
      };
    }
  }
}

/** 앱(스마트폰) — 본체 옆에 세워 둔 모습 */
export function drawPhone(pal: Palette, resultText: string, uid: string): Drawn {
  const v: View = { ...view(660, 175), a: 0.5, b: 0.18, c: -0.46, d: 0.76 };
  const L = 110, W = 210;
  return {
    node: (
      <Slab v={v} box={[0, 0, L, W, 20]} t={10} pal={{ ...pal, base: "#2f333a", shade: "#1f2227", deep: "#16181c", hi: "#4a505a" }} clipId={`${uid}p`}>
        <path d={rr(8, 20, L - 16, W - 40, 10)} fill={SCREEN} {...ink(1.2)} />
        <text x={L / 2} y={98} fontSize={13} fontWeight={700} textAnchor="middle" fill={INK}>{resultText}</text>
        <rect x={22} y={120} width={66} height={8} rx={4} fill="#9fd3c0" />
        <circle cx={L / 2} cy={11} r={3} fill="#9aa3af" />
      </Slab>
    ),
    anchors: { phone: P(v, L / 2, 60) },
    dims: [],
  };
}

export { M };
