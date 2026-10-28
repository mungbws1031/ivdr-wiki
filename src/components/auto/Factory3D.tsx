import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, RotateCw, ScanLine } from "lucide-react";
import type { FactoryFloor } from "../../lib/factory";
import { FloorDetail, pct, seedOf, Worker } from "./factoryArt";

// 문서 공장 3D — CSS 3D 변환으로 7층 건물을 세운다 (라이브러리 없음).
// 좌표: x 오른쪽, y 아래(화면 기준), z 앞쪽. 층 바닥 중심이 원점.

const W = 760; // 층 가로
const D = 300; // 층 깊이
const H = 118; // 층 높이
const LIFT = 150; // 층을 펼칠 때 위층이 들리는 높이
const QUEUE_W = 200; // 오른쪽 앞 대기줄 구역
const SLOT = 46; // 책상 간격

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

interface View { yaw: number; pitch: number; zoom: number }
const DEFAULT: View = { yaw: -30, pitch: 12, zoom: 1 };
const BASE_SCALE = 0.62;

/** 층 하나 — 바닥판·뒷벽·왼벽·앞면 두께와 그 위의 직원·대기줄. */
function Storey({ f, level, lifted, selected, view, onSelect }: {
  f: FactoryFloor; level: number; lifted: boolean; selected: boolean; view: View; onSelect: () => void;
}) {
  const desks = f.docs.filter((d) => d.state !== "blocked");
  const queue = f.docs.filter((d) => d.state === "blocked");
  const cols = Math.max(1, Math.floor((W - QUEUE_W - 60) / SLOT));
  // 화면을 향해 서도록 월드 회전의 역회전 (빌보드)
  const face = `rotateY(${-view.yaw}deg) rotateX(${view.pitch}deg)`;
  const tint = (pctMix: number) => `color-mix(in srgb, ${f.color} ${pctMix}%, var(--bg))`;
  const y = -level * H - (lifted ? LIFT : 0);

  const deskAt = (i: number) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return { x: -W / 2 + 50 + col * SLOT, z: -D / 2 + 70 + row * 74 };
  };
  const queueItems = [...queue.map((d) => ({ kind: "doc" as const, d })), ...f.tasks.map((t) => ({ kind: "task" as const, t }))].slice(0, 8);

  return (
    <div className="absolute" style={{ transformStyle: "preserve-3d", transform: `translateY(${y}px)`, transition: "transform .55s cubic-bezier(.2,.8,.2,1)" }}>
      {/* 바닥판 (윗면) — 누르면 층 선택 */}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${f.id} ${f.name}, 진행률 ${pct(f.progress)}${selected ? ", 선택됨" : ""}`}
        className="absolute"
        style={{
          width: W, height: D, left: -W / 2, top: -D / 2,
          transform: "rotateX(90deg)",
          border: `2px solid ${selected ? f.color : "var(--border-strong)"}`,
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0 59px, color-mix(in srgb, var(--border) 70%, transparent) 59px 60px), repeating-linear-gradient(90deg, transparent 0 59px, color-mix(in srgb, var(--border) 70%, transparent) 59px 60px)`,
          backgroundColor: tint(selected ? 20 : 10),
        }}
      />
      {/* 앞면 두께 */}
      <div aria-hidden className="absolute" style={{ width: W, height: 12, left: -W / 2, top: 0, transform: `translateZ(${D / 2}px)`, background: "var(--border-strong)" }} />
      {/* 오른면 두께 */}
      <div aria-hidden className="absolute" style={{ width: D, height: 12, left: -D / 2, top: 0, transform: `translateX(${W / 2}px) rotateY(90deg)`, background: "color-mix(in srgb, var(--border-strong) 80%, var(--text))" }} />
      {/* 뒷벽 + 층 이름·진행률 */}
      <div
        className="absolute flex flex-col justify-start"
        style={{ width: W, height: H - 12, left: -W / 2, top: -(H - 12), transform: `translateZ(${-D / 2}px)`, background: tint(18), borderTop: `4px solid ${f.color}`, padding: "10px 16px" }}
      >
        <span className="flex items-baseline" style={{ gap: 10 }}>
          <span className="font-extrabold" style={{ fontSize: 30, color: f.color, lineHeight: 1 }}>{f.id}</span>
          <span className="font-bold text-text" style={{ fontSize: 17 }}>{f.name}</span>
          <span className="font-extrabold" style={{ fontSize: 17, color: f.color, fontVariantNumeric: "tabular-nums", marginLeft: "auto" }}>{pct(f.progress)}</span>
        </span>
        <span className="rounded-full overflow-hidden" style={{ height: 7, background: "var(--border)", marginTop: 8, width: "100%" }}>
          <span className="block h-full" style={{ width: pct(f.progress), background: f.color }} />
        </span>
        {/* 창문 */}
        <span aria-hidden className="flex" style={{ gap: 14, marginTop: 12 }}>
          {Array.from({ length: 9 }, (_, i) => <span key={i} style={{ width: 52, height: 26, borderRadius: 3, background: "color-mix(in srgb, var(--info) 14%, var(--bg))", border: "1px solid var(--border)" }} />)}
        </span>
      </div>
      {/* 기둥 — 앞 양쪽 모서리 */}
      {[-W / 2, W / 2 - 14].map((x) => (
        <div key={x} aria-hidden className="absolute" style={{ width: 14, height: H - 12, left: x, top: -(H - 12), transform: `translateZ(${D / 2 - 2}px)`, background: "color-mix(in srgb, var(--border-strong) 85%, var(--text))" }} />
      ))}
      {/* 왼벽 */}
      <div aria-hidden className="absolute" style={{ width: D, height: H - 12, left: -D / 2, top: -(H - 12), transform: `translateX(${-W / 2}px) rotateY(90deg)`, background: tint(26), borderTop: `4px solid ${f.color}` }} />

      {/* 직원 (책상 줄) */}
      {desks.map((d, i) => {
        const { x, z } = deskAt(i);
        // 작성 중이면 책상에 앉아 있고, 시작 전·완료면 책상 주변을 걸어다닌다 (문서마다 고정된 경로)
        if (d.state === "writing") {
          return (
            <div key={d.id} className="absolute" style={{ left: x - 17, top: -50, transform: `translateZ(${z}px) ${face}`, transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}>
              <Worker d={d} color={f.color} />
            </div>
          );
        }
        const n = seedOf(d.id);
        const dir = x > -W / 2 + 50 + (cols * SLOT) / 2 ? -1 : 1; // 층 가운데 쪽으로 걷기 시작
        const dx = dir * (50 + (n % 80));
        let dz = ((n >>> 4) % 2 ? 1 : -1) * (26 + ((n >>> 7) % 34));
        if (z + dz > D / 2 - 30 || z + dz < -D / 2 + 50) dz = -dz;
        const dur = 11 + ((n >>> 10) % 9);
        const delay = -((n >>> 13) % dur);
        const walk = { "--wx": `${dx}px`, "--wz": `${dz}px`, "--f": dir, animationDuration: `${dur}s`, animationDelay: `${delay}s` } as React.CSSProperties;
        return (
          <div key={d.id} className="absolute" style={{ left: x - 17, top: -50, transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}>
            {/* 빈 책상 */}
            <div aria-hidden className="absolute" style={{ left: 1, top: 46, width: 32, height: 4, borderRadius: 2, background: "var(--room-desk, var(--border))", transform: face, transformOrigin: "50% 100%" }} />
            <div className="factory-walk" style={{ ...walk, transformStyle: "preserve-3d" }}>
              <div style={{ transform: face, transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}>
                <div className="factory-flip" style={walk}>
                  <Worker d={d} color={f.color} walking />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* 대기줄 — 오른쪽 앞 */}
      {queueItems.map((q, i) => {
        const x = W / 2 - QUEUE_W + 24 + (i % 4) * 44;
        const z = D / 2 - 40 - Math.floor(i / 4) * 64;
        return (
          <div key={q.kind === "doc" ? q.d.id : q.t.id} className="absolute" style={{ left: x - 17, top: -50, transform: `translateZ(${z}px) ${face}`, transformOrigin: "50% 100%" }}>
            {q.kind === "doc" ? <Worker d={q.d} color={f.color} /> : (
              <span title={`${q.t.title} — ${q.t.why}`} className="inline-grid place-items-center rounded-[4px] font-extrabold" style={{ width: 26, height: 34, marginTop: 10, background: "var(--bg)", border: "1.5px solid var(--warning)", color: "var(--warning)", fontSize: 13 }}>✋</span>
            )}
          </div>
        );
      })}
      {queue.length + f.tasks.length > 0 && (
        <div className="absolute font-bold rounded-full" style={{ left: W / 2 - QUEUE_W + 10, top: -96, transform: `translateZ(${D / 2 - 20}px) ${face}`, fontSize: 12, padding: "2px 10px", background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning)", whiteSpace: "nowrap" }}>
          대기줄 {queue.length + f.tasks.length}{queue.length + f.tasks.length > 8 ? ` (+${queue.length + f.tasks.length - 8})` : ""}
        </div>
      )}
    </div>
  );
}

/** 3D 건물 보기 — 드래그로 돌리고, 층을 눌러 펼친다. */
export function Factory3D({ floors, overall }: { floors: FactoryFloor[]; overall: { progress: number; done: number; total: number } }) {
  const [view, setView] = useState<View>(DEFAULT);
  const [sel, setSel] = useState<string | null>(null);
  const [fit, setFit] = useState(1050); // 장면 폭(px)
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; v: View; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  // 화면 폭에 맞춰 축소
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setFit(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const order = [...floors].reverse(); // 1F가 맨 아래 (level 0)
  const selLevel = sel ? order.findIndex((f) => f.id === sel) : -1;
  // 폭에 맞춰 건물 크기를 정하고(좁은 화면에서도 너무 작지 않게), 높이는 건물 높이에 맞춘다
  const base = Math.min(BASE_SCALE, fit / (W * 1.55));
  const scale = base * view.zoom;
  const height = Math.round((order.length * H + 170) * base * 1.12 + 56);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, v: view, moved: false };
    suppressClick.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) < 5) return;
    if (!g.moved) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    g.moved = true;
    setView({ ...g.v, yaw: clamp(g.v.yaw + dx * 0.35, -75, 75), pitch: clamp(g.v.pitch - dy * 0.25, 0, 45) });
  };
  const onUp = () => {
    if (drag.current?.moved) suppressClick.current = true;
    drag.current = null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] }[e.key];
    if (!step) return;
    e.preventDefault();
    setView((v) => ({ ...v, yaw: clamp(v.yaw + step[0], -75, 75), pitch: clamp(v.pitch + step[1], 0, 45) }));
  };
  const btn = "inline-grid place-items-center rounded-[var(--r-sm)] hover:bg-surface";
  const selected = floors.find((f) => f.id === sel) ?? null;

  return (
    <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
      {/* 조작 */}
      <div className="flex flex-wrap items-center justify-between" style={{ gap: "var(--s-2)" }}>
        <div className="flex flex-wrap" style={{ gap: 6 }} role="group" aria-label="층 고르기">
          {floors.map((f) => (
            <button key={f.id} type="button" onClick={() => setSel((x) => (x === f.id ? null : f.id))} aria-pressed={sel === f.id}
              className="inline-flex items-center gap-1.5 rounded-full font-bold"
              style={{ fontSize: "var(--t-xs)", padding: "4px 10px", minHeight: 30, border: `1.5px solid ${sel === f.id ? f.color : "var(--border)"}`, background: sel === f.id ? `color-mix(in srgb, ${f.color} 14%, var(--bg))` : "var(--bg)", color: "var(--text)" }}>
              <span style={{ color: f.color }}>{f.id}</span> {f.name} <span className="text-text-subtle" style={{ fontVariantNumeric: "tabular-nums" }}>{pct(f.progress)}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-[var(--r-md)] border" style={{ borderColor: "var(--border)", padding: 2, gap: 2 }}>
          <button type="button" className={btn} style={{ width: 34, height: 34 }} aria-label="왼쪽으로 돌리기" onClick={() => setView((v) => ({ ...v, yaw: clamp(v.yaw - 30, -75, 75) }))}><RotateCcw size={16} /></button>
          <button type="button" className={btn} style={{ width: 34, height: 34 }} aria-label="오른쪽으로 돌리기" onClick={() => setView((v) => ({ ...v, yaw: clamp(v.yaw + 30, -75, 75) }))}><RotateCw size={16} /></button>
          <button type="button" className={btn} style={{ width: 34, height: 34 }} aria-label="정면 보기" onClick={() => setView((v) => ({ ...v, yaw: 0, pitch: 6 }))}><ScanLine size={16} /></button>
          <button type="button" className={btn} style={{ width: 34, height: 34 }} aria-label="축소" onClick={() => setView((v) => ({ ...v, zoom: clamp(v.zoom - 0.15, 0.55, 1.6) }))}><Minus size={16} /></button>
          <button type="button" className={btn} style={{ width: 34, height: 34 }} aria-label="확대" onClick={() => setView((v) => ({ ...v, zoom: clamp(v.zoom + 0.15, 0.55, 1.6) }))}><Plus size={16} /></button>
          <button type="button" className={`${btn} font-semibold`} style={{ height: 34, padding: "0 10px", fontSize: "var(--t-xs)" }} onClick={() => { setView(DEFAULT); setSel(null); }}>초기화</button>
        </div>
      </div>

      {/* 장면 */}
      <div
        ref={box}
        tabIndex={0}
        role="application"
        aria-label="문서 공장 3D 건물. 끌어서 돌리고, 화살표 키로도 돌릴 수 있습니다. 층 바닥을 누르면 그 층이 펼쳐집니다."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        onClickCapture={(e) => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } }}
        className="relative overflow-hidden rounded-[var(--r-lg)] border select-none"
        style={{ height, borderColor: "var(--border)", background: "linear-gradient(to bottom, color-mix(in srgb, var(--info) 10%, var(--bg)), var(--bg) 70%)", perspective: Math.max(1600, fit * 2.4), touchAction: "none", cursor: drag.current ? "grabbing" : "grab" }}
      >
        <div
          className="absolute"
          style={{
            left: "50%", top: `calc(100% - ${Math.round(40 + 30 * base)}px)`, width: 0, height: 0, transformStyle: "preserve-3d",
            transform: `scale(${scale}) rotateX(${-view.pitch}deg) rotateY(${view.yaw}deg)`,
            transition: drag.current ? "none" : "transform .35s ease-out",
          }}
        >
          {/* 땅 */}
          <div aria-hidden className="absolute" style={{ width: W + 360, height: D + 360, left: -(W + 360) / 2, top: -(D + 360) / 2, transform: "translateY(14px) rotateX(90deg)", background: "radial-gradient(closest-side, color-mix(in srgb, var(--text) 16%, transparent), transparent)", borderRadius: "50%" }} />
          {order.map((f, level) => (
            <Storey key={f.id} f={f} level={level} view={view} selected={sel === f.id} lifted={selLevel >= 0 && level > selLevel} onSelect={() => setSel((x) => (x === f.id ? null : f.id))} />
          ))}
          {/* 지붕 + 간판 */}
          <div className="absolute" style={{ transformStyle: "preserve-3d", transform: `translateY(${-order.length * H - (selLevel >= 0 && selLevel < order.length - 1 ? LIFT : 0)}px)`, transition: "transform .55s cubic-bezier(.2,.8,.2,1)" }}>
            <div aria-hidden className="absolute" style={{ width: W + 24, height: D + 24, left: -(W + 24) / 2, top: -(D + 24) / 2, transform: "rotateX(90deg)", background: "var(--border-strong)" }} />
            <div className="absolute flex items-center rounded-[var(--r-md)]" style={{ width: 460, left: -230, top: -86, transform: `translateZ(${D / 2 - 10}px)`, gap: 14, padding: "12px 18px", background: "var(--text)", color: "var(--bg)", boxShadow: "0 8px 24px rgba(0,0,0,.18)" }} role="status">
              <span className="font-extrabold" style={{ fontSize: 20, whiteSpace: "nowrap" }}>IVDR 문서 공장</span>
              <span className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: "color-mix(in srgb, var(--bg) 25%, transparent)" }}>
                <span className="block h-full rounded-full" style={{ width: pct(overall.progress), background: "var(--success)" }} />
              </span>
              <span className="font-extrabold" style={{ fontSize: 22, fontVariantNumeric: "tabular-nums" }}>{pct(overall.progress)}</span>
            </div>
          </div>
        </div>
        <p className="absolute text-text-subtle pointer-events-none" style={{ left: 12, bottom: 8, fontSize: "var(--t-xs)" }}>
          끌어서 돌리기 · 층 바닥을 누르면 펼치기 · 완료 {overall.done}/{overall.total}
        </p>
      </div>

      {selected && (
        <div className="rounded-[var(--r-lg)] border overflow-hidden" style={{ borderColor: selected.color }}>
          <p className="font-bold text-text" style={{ padding: "var(--s-3) var(--s-4)", fontSize: "var(--t-sm)", background: `color-mix(in srgb, ${selected.color} 10%, var(--bg))` }}>
            <span style={{ color: selected.color }}>{selected.id}</span> {selected.name} — 진행률 {pct(selected.progress)}
          </p>
          <FloorDetail f={selected} />
        </div>
      )}
    </div>
  );
}
