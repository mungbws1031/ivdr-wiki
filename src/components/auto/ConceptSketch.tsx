import { useId, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import type { ProductSpec } from "../../data/spec/types";
import { sketchModel, type PartId } from "../../lib/sketch";
import { Dim, INK, PALETTES, PAPER } from "./sketch/geom";
import { drawBody, drawPhone } from "./sketch/parts";
import { Storyboard } from "./sketch/story";

// 개념 스케치 — 산업디자인 손스케치 스타일: 3/4 시점 선화 + 마커 음영, 부품 콜아웃, 치수 자리, 사용 순서 3컷.
// 디자인이 아니라 구성 확인용. 치수·시간은 지어내지 않는다([__]).
const W = 960, H = 620;
const COLOR_KEY = "ivdr-ui-sketch-color";
const readColor = () => { try { return localStorage.getItem(COLOR_KEY) ?? "white"; } catch { return "white"; } };
const textW = (s: string, fs: number) => [...s].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2000 ? fs * 0.98 : fs * 0.58), 0);

interface Callout { label: string; at: [number, number]; side: "L" | "R"; y: number; w: number }

function layoutCallouts(items: { part: PartId; label: string; at: [number, number] }[]): Callout[] {
  const FS = 12.5, TOP = 92, BOTTOM = 392, GAP = 30;
  const body = items.filter((c) => c.part !== "phone");
  const mid = body.reduce((n, c) => n + c.at[0], 0) / Math.max(body.length, 1);
  const out: Callout[] = [];
  for (const side of ["L", "R"] as const) {
    const col = items.filter((c) => c.part === "phone" ? side === "R" : side === "L" ? c.at[0] < mid : c.at[0] >= mid).sort((a, b) => a.at[1] - b.at[1]);
    // 폰이 있으면 오른쪽 본체 콜아웃은 위쪽에 모아 지시선이 폰을 가로지르지 않게 한다
    const hasPhone = side === "R" && col.some((c) => c.part === "phone");
    const ordered = hasPhone ? [...col.filter((c) => c.part !== "phone"), ...col.filter((c) => c.part === "phone")] : col;
    let prev = TOP - GAP;
    const placed = ordered.map((c) => {
      const y = hasPhone && c.part !== "phone" ? prev + GAP : Math.max(c.at[1], prev + GAP, TOP);
      prev = y;
      return { label: c.label, at: c.at, side, y, w: textW(c.label, FS) };
    });
    const over = placed.length ? placed[placed.length - 1].y - BOTTOM : 0;
    if (over > 0) placed.forEach((p) => (p.y -= over));
    out.push(...placed);
  }
  return out;
}

/** 개념 스케치 (SVG). 내려받기: SVG·PNG. */
export function ConceptSketch({ spec }: { spec: ProductSpec }) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [colorId, setColorId] = useState(readColor);
  const pal = PALETTES.find((p) => p.id === colorId) ?? PALETTES[0];
  const m = useMemo(() => sketchModel(spec), [spec]);
  const body = drawBody(m.kind, pal, m.resultText, uid, m.phone);
  const phone = m.phone ? drawPhone(pal, m.resultText, uid) : null;
  const callouts = layoutCallouts(
    m.callouts
      .map((c) => ({ ...c, at: (c.part === "phone" ? phone?.anchors.phone : body.anchors[c.part]) as [number, number] | undefined }))
      .filter((c): c is { part: PartId; label: string; at: [number, number] } => !!c.at),
  );
  const pick = (id: string) => { setColorId(id); try { localStorage.setItem(COLOR_KEY, id); } catch { /* 이번 화면에서만 */ } };
  const today = new Date().toISOString().slice(0, 10);

  const save = (kind: "svg" | "png") => {
    const svg = ref.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const file = `concept-sketch.${kind}`;
    const done = (href: string) => { const a = document.createElement("a"); a.href = href; a.download = file; document.body.appendChild(a); a.click(); a.remove(); };
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
    if (kind === "svg") { done(url); setTimeout(() => URL.revokeObjectURL(url), 1000); return; }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W * 2; c.height = H * 2;
      c.getContext("2d")!.drawImage(img, 0, 0, W * 2, H * 2);
      URL.revokeObjectURL(url);
      c.toBlob((b) => { if (b) { const u = URL.createObjectURL(b); done(u); setTimeout(() => URL.revokeObjectURL(u), 1000); } });
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
      <div className="flex flex-wrap items-center" style={{ gap: 8 }} role="group" aria-label="본체 색">
        <span className="font-semibold text-text-muted" style={{ fontSize: "var(--t-xs)" }}>본체 색</span>
        {PALETTES.map((p) => (
          <button key={p.id} type="button" onClick={() => pick(p.id)} aria-pressed={p.id === pal.id} title={p.label}
            className="inline-flex items-center rounded-full font-semibold" style={{ gap: 6, minHeight: 40, padding: "4px 12px 4px 6px", fontSize: "var(--t-xs)", border: `1.5px solid ${p.id === pal.id ? "var(--text)" : "var(--border)"}`, background: "var(--bg)", color: "var(--text)" }}>
            <span aria-hidden className="rounded-full" style={{ width: 22, height: 22, background: p.base, border: `2px solid ${p.shade}` }} />
            {p.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[12px]" style={{ border: "1px solid var(--border)" }}>
        <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`개념 스케치: ${m.title} — ${m.subtitle}`}
          style={{ display: "block", width: "100%", minWidth: 640, height: "auto" }} fontFamily="Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif">
          <defs>
            <pattern id={`${uid}dots`} width={16} height={16} patternUnits="userSpaceOnUse"><circle cx={1} cy={1} r={0.9} fill="#d9d4c6" /></pattern>
            <filter id={`${uid}wob`} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={4} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <rect width={W} height={H} fill={PAPER} />
          <rect width={W} height={H} fill={`url(#${uid}dots)`} />

          <text x={24} y={38} fontSize={22} fontWeight={800} fill={INK}>{m.title}</text>
          <text x={24} y={60} fontSize={12.5} fill={INK} opacity={0.75}>{m.subtitle}</text>

          <g filter={`url(#${uid}wob)`}>
            {body.node}
            {phone?.node}
          </g>
          {body.dims.map((d) => <Dim key={d.label} x1={d.a[0]} y1={d.a[1]} x2={d.b[0]} y2={d.b[1]} label={d.label} />)}

          {callouts.map((c) => {
            const lx = c.side === "L" ? 24 : W - 24;
            const end = c.side === "L" ? lx + c.w + 6 : lx - c.w - 6;
            const elbow = c.side === "L" ? end + 18 : end - 18;
            return (
              <g key={c.label}>
                <polyline points={`${end},${c.y - 4} ${elbow},${c.y - 4} ${c.at[0]},${c.at[1]}`} fill="none" stroke={INK} strokeWidth={1.1} />
                <circle cx={c.at[0]} cy={c.at[1]} r={3.6} fill={INK} />
                <circle cx={c.at[0]} cy={c.at[1]} r={7} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.6} />
                <text x={lx} y={c.y} fontSize={12.5} fontWeight={700} textAnchor={c.side === "L" ? "start" : "end"} fill={INK}>{c.label}</text>
                <line x1={c.side === "L" ? lx : end} y1={c.y + 4} x2={c.side === "L" ? end : lx} y2={c.y + 4} stroke={INK} strokeWidth={0.8} opacity={0.5} />
              </g>
            );
          })}

          <g filter={`url(#${uid}wob)`}><Storyboard m={m} pal={pal} x={24} y={440} /></g>

          <line x1={24} y1={590} x2={W - 24} y2={590} stroke={INK} strokeWidth={0.8} opacity={0.4} />
          <text x={24} y={608} fontSize={10.5} fill={INK} opacity={0.7}>개념 스케치 — 디자인 아님 · 치수·시간은 설계·시험 후 확정 · 제품 스펙으로 자동 생성</text>
          <text x={W - 24} y={608} fontSize={10.5} textAnchor="end" fill={INK} opacity={0.7}>{today} · {pal.label}</text>
        </svg>
      </div>
      <p className="sm:hidden text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>옆으로 밀어서 전체 스케치 보기 →</p>
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {(["svg", "png"] as const).map((k) => (
          <button key={k} type="button" onClick={() => save(k)} className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] border font-semibold" style={{ padding: "6px 12px", fontSize: "var(--t-xs)", borderColor: "var(--border)", minHeight: 40 }}>
            <Download size={14} aria-hidden /> {k.toUpperCase()} 내려받기
          </button>
        ))}
      </div>
    </div>
  );
}
