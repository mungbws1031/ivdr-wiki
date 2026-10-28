import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { DocState, FactoryDoc, FactoryFloor } from "../../lib/factory";
import { FloorDetail, pct, seedOf, STATE } from "./factoryArt";

// 미니룸 보기 — 모든 부서를 한 방에 모아 한눈에 본다 (싸이월드 미니룸처럼 고정 아이소메트릭).
// 바닥 좌표(타일 x·y)를 화면 좌표로 바꿔 그린다: x는 오른쪽 아래, y는 왼쪽 아래 방향.

const T = 17; // 타일 크기(px)
const C = 0.866; // cos 30°
const S = 3.6; // 책상 간격(타일) — 캐릭터(30×40px)가 서로 겹치지 않는 거리
const ROWS = 3; // 부서 구역마다 책상 줄 수
const BAND = ROWS * S + 3.2; // 구역 깊이(타일)
const WALL = 96; // 벽 높이(px)
const PAD = 24;
// 구역 배치: 뒤쪽 줄부터
const BANDS: string[][] = [["7F", "6F"], ["5F", "4F"], ["3F", "2F", "1F"]];

interface Zone { f: FactoryFloor; x: number; y: number; w: number; h: number; cols: number }

function layout(floors: FactoryFloor[]): { zones: Zone[]; X: number; Y: number } {
  const byId = new Map(floors.map((f) => [f.id as string, f]));
  const need = (f: FactoryFloor) => Math.max(7, Math.ceil(f.docs.length / ROWS) * S + 2.4);
  const bands = BANDS.map((ids) => ids.map((id) => byId.get(id)).filter((f): f is FactoryFloor => !!f));
  const X = Math.max(...bands.map((b) => b.reduce((n, f) => n + need(f), 0)));
  const zones: Zone[] = [];
  bands.forEach((b, bi) => {
    const sum = b.reduce((n, f) => n + need(f), 0);
    let x = 0;
    for (const f of b) {
      const w = (need(f) / sum) * X; // 남는 폭은 비율대로 나눠 줌
      zones.push({ f, x, y: bi * BAND, w, h: BAND, cols: Math.max(1, Math.floor((w - 2.4) / S) + 1) });
      x += w;
    }
  });
  return { zones, X, Y: bands.length * BAND };
}

// ── 싸이월드풍 미니미 ──────────────────────────────────────
const SKIN = ["#FFE3CF", "#FCD5B8", "#F3C29D", "#E0A87E"];
const HAIR = ["#3A2A22", "#6B4226", "#A0663A", "#2E2E3A", "#D8A35D", "#8E3B2F"];

function MiniHair({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0: // 바가지 머리
      return <path d="M4 15 Q3.5 3 15 3 Q26.5 3 26 15 Q24 9.5 15 9.5 Q6 9.5 4 15 Z" fill={color} />;
    case 1: // 긴 생머리
      return <path d="M3.6 24 Q2 3 15 3 Q28 3 26.4 24 L23.6 24 Q24.5 10 15 9.6 Q5.5 10 6.4 24 Z" fill={color} />;
    case 2: // 양갈래 똥머리
      return (
        <g fill={color}>
          <circle cx="5" cy="5.5" r="3.6" />
          <circle cx="25" cy="5.5" r="3.6" />
          <path d="M4 14 Q3.8 3.5 15 3.5 Q26.2 3.5 26 14 Q23 8.8 15 8.8 Q7 8.8 4 14 Z" />
        </g>
      );
    case 3: // 삐죽 머리
      return <path d="M4 14 L5 5 L8.5 7 L10.5 2 L13.5 5.5 L16.5 1.6 L18.5 5.5 L22 2.6 L22.8 6.8 L26 5.5 L26 14 Q22 8.8 15 8.8 Q8 8.8 4 14 Z" fill={color} />;
    case 4: // 옆가르마 + 리본
      return (
        <>
          <path d="M4 15 Q3.5 3 15 3 Q26.5 3 26 15 Q22 7.5 12 9.5 Q7 10.5 4 15 Z" fill={color} />
          <path d="M20 4 L24.5 1.8 L24 6.2 Z M20 4 L16.5 1.2 L16.2 6 Z" fill="#FF7FA8" />
          <circle cx="20" cy="4" r="1.2" fill="#FF5C8D" />
        </>
      );
    default: // 포니테일
      return (
        <>
          <path d="M4 14 Q3.8 3 15 3 Q26.2 3 26 14 Q23 8.6 15 8.6 Q7 8.6 4 14 Z" fill={color} />
          <path d="M24.5 6 Q31 9 28 19 Q27 13 24.8 11 Z" fill={color} />
        </>
      );
  }
}

/** 시안의 사람 모양(동그란 머리·사원증 셔츠·두 다리)에 눈·코·입. 표정은 상태에 따라 바뀐다. */
export function Minimi({ seed, state, shirt, walking }: { seed: string; state: DocState; shirt: string; walking: boolean }) {
  const n = seedOf(seed);
  const skin = SKIN[n % SKIN.length];
  const hair = HAIR[(n >>> 3) % HAIR.length];
  const style = (n >>> 6) % 6;
  const ink = "#3A2C26";
  const eyes =
    state === "done" ? (
      <g stroke={ink} strokeWidth="0.8" fill="none" strokeLinecap="round">
        <path d="M11.6 9.8 Q12.5 8.8 13.4 9.8" />
        <path d="M16.6 9.8 Q17.5 8.8 18.4 9.8" />
      </g>
    ) : state === "writing" ? (
      <g stroke={ink} strokeWidth="0.8" strokeLinecap="round">
        <path d="M11.7 9.7 L13.3 9.7" />
        <path d="M16.7 9.7 L18.3 9.7" />
      </g>
    ) : (
      <g fill={ink}>
        <circle cx="12.5" cy="9.5" r="0.95" />
        <circle cx="17.5" cy="9.5" r="0.95" />
        <circle cx="12.8" cy="9.2" r="0.3" fill="#fff" />
        <circle cx="17.8" cy="9.2" r="0.3" fill="#fff" />
      </g>
    );
  const mouth =
    state === "done" ? <path d="M13.3 12.6 Q15 14.4 16.7 12.6 Z" fill="#D9535F" />
    : state === "blocked" ? <path d="M13.5 13.6 Q15 12.6 16.5 13.6" stroke={ink} strokeWidth="0.7" fill="none" strokeLinecap="round" />
    : <path d="M13.7 12.8 Q15 13.8 16.3 12.8" stroke={ink} strokeWidth="0.7" fill="none" strokeLinecap="round" />;
  return (
    <svg width="30" height="40" viewBox="0 0 30 40" aria-hidden style={{ overflow: "visible" }}>
      <ellipse cx="15" cy="38.6" rx="7.5" ry="2.4" fill="rgba(0,0,0,.14)" />
      {/* 다리 */}
      <g className={walking ? "factory-leg" : undefined} style={{ transformOrigin: "12px 30px" }}><rect x="10.2" y="29.5" width="3.6" height="9" rx="1.5" fill="#3B3F4A" /></g>
      <g className={walking ? "factory-leg factory-leg-r" : undefined} style={{ transformOrigin: "18px 30px" }}><rect x="16.2" y="29.5" width="3.6" height="9" rx="1.5" fill="#3B3F4A" /></g>
      {/* 셔츠 + 사원증 */}
      <rect x="8.5" y="16.5" width="13" height="15" rx="5" fill={shirt} />
      <rect x="12.1" y="20" width="5.8" height="7" rx="1.1" fill="#fff" opacity="0.92" />
      <rect x="13.2" y="21.3" width="3.6" height="1" rx="0.5" fill={shirt} opacity="0.7" />
      {/* 머리 */}
      <circle cx="15" cy="9.6" r="6.6" fill={skin} />
      <g transform="translate(15 9.6) scale(0.6) translate(-15 -14)">
        <MiniHair style={style} color={hair} />
      </g>
      {eyes}
      {/* 코 */}
      <path d="M15 10.4 Q14.5 11.5 15.3 11.6" stroke="#B07A58" strokeWidth="0.6" fill="none" strokeLinecap="round" />
      <ellipse cx="11.2" cy="11.9" rx="1.1" ry="0.6" fill="#F59A9A" opacity="0.55" />
      <ellipse cx="18.8" cy="11.9" rx="1.1" ry="0.6" fill="#F59A9A" opacity="0.55" />
      {mouth}
      {state === "blocked" && <path d="M21.6 4.6 Q22.8 6.4 21.6 7.1 Q20.4 6.4 21.6 4.6 Z" fill="#7CC4F0" />}
    </svg>
  );
}

// ── 가구 ─────────────────────────────────────────────────
/** 아이소메트릭 책상 + 모니터 (발밑 기준 좌표에 그려진다). 작성 중이면 모니터가 켜져 있다. */
function Desk({ on, color }: { on: boolean; color: string }) {
  // 책상 윗면: 타일 1.6×1 크기의 마름모, 높이 9px
  const a = 1.6 * T, b = 1 * T, h = 9;
  const p = (x: number, y: number, z = 0) => `${(x - y) * C + b * C},${(x + y) * 0.5 - z + 14}`;
  return (
    <svg width={(a + b) * C} height={(a + b) * 0.5 + 16} aria-hidden style={{ overflow: "visible" }}>
      <polygon points={`${p(0, b, h)} ${p(a, b, h)} ${p(a, b)} ${p(0, b)}`} fill="#B98654" />
      <polygon points={`${p(a, 0, h)} ${p(a, b, h)} ${p(a, b)} ${p(a, 0)}`} fill="#A0703F" />
      <polygon points={`${p(0, 0, h)} ${p(a, 0, h)} ${p(a, b, h)} ${p(0, b, h)}`} fill="#DDB07A" stroke="#C39461" strokeWidth="0.6" />
      {/* 키보드 */}
      <polygon points={`${p(a * 0.32, b * 0.55, h + 0.4)} ${p(a * 0.68, b * 0.55, h + 0.4)} ${p(a * 0.68, b * 0.8, h + 0.4)} ${p(a * 0.32, b * 0.8, h + 0.4)}`} fill="#E6E8EE" />
      {/* 모니터 (뒷면이 보임) + 받침 */}
      <polygon points={`${p(a * 0.48, b * 0.3, h)} ${p(a * 0.52, b * 0.3, h)} ${p(a * 0.52, b * 0.3, h + 4)} ${p(a * 0.48, b * 0.3, h + 4)}`} fill="#4A4F5C" />
      <polygon points={`${p(a * 0.22, b * 0.3, h + 4)} ${p(a * 0.78, b * 0.3, h + 4)} ${p(a * 0.78, b * 0.3, h + 15)} ${p(a * 0.22, b * 0.3, h + 15)}`} fill={on ? color : "#2F333D"} stroke={on ? "#fff" : "#1F2229"} strokeWidth="0.6" />
    </svg>
  );
}

function iso(ox: number, oy: number, x: number, y: number): [number, number] {
  return [ox + (x - y) * C * T, oy + (x + y) * 0.5 * T];
}

/** 아이소메트릭 상자(바닥 x0..x1, y0..y1, 높이 h px) — 보이는 세 면. */
function IsoBox({ o, x0, y0, x1, y1, h, top, left, right, z = 0 }: { o: [number, number]; x0: number; y0: number; x1: number; y1: number; h: number; top: string; left: string; right: string; z?: number }) {
  const q = (x: number, y: number, zz: number) => { const [a, b] = iso(o[0], o[1], x, y); return `${a},${b - zz}`; };
  return (
    <g>
      <polygon points={`${q(x0, y1, z)} ${q(x1, y1, z)} ${q(x1, y1, z + h)} ${q(x0, y1, z + h)}`} fill={left} />
      <polygon points={`${q(x1, y0, z)} ${q(x1, y1, z)} ${q(x1, y1, z + h)} ${q(x1, y0, z + h)}`} fill={right} />
      <polygon points={`${q(x0, y0, z + h)} ${q(x1, y0, z + h)} ${q(x1, y1, z + h)} ${q(x0, y1, z + h)}`} fill={top} />
    </g>
  );
}

/** 화분 */
function Plant({ o, x, y, big = false }: { o: [number, number]; x: number; y: number; big?: boolean }) {
  const [cx, cy] = iso(o[0], o[1], x, y);
  const r = big ? 1.25 : 1;
  return (
    <g>
      <IsoBox o={o} x0={x - 0.4} y0={y - 0.4} x1={x + 0.4} y1={y + 0.4} h={9} top="#E9ECEF" left="#C9CED6" right="#B5BBC5" />
      <g transform={`translate(${cx} ${cy - 9}) scale(${r})`}>
        <circle cx="0" cy="-10" r="8" fill="#4FA35A" />
        <circle cx="-7" cy="-4" r="6" fill="#62B86C" />
        <circle cx="7" cy="-5" r="6" fill="#62B86C" />
        <circle cx="1" cy="-17" r="5.5" fill="#74C77D" />
      </g>
    </g>
  );
}

/** 미니룸 — 모든 부서가 한 방. 직원을 누르면 문서, 구역을 누르면 그 부서 목록. */
export function FactoryRoom({ floors, overall }: { floors: FactoryFloor[]; overall: { progress: number; done: number; total: number; tasks: number } }) {
  const [sel, setSel] = useState<string | null>(null);
  const [tags, setTags] = useState(false); // 이름표 항상 보기
  const [fit, setFit] = useState({ w: 1050, h: 800 });
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setFit({ w: e.contentRect.width, h: window.innerHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { zones, X, Y } = layout(floors);
  const DW = (X + Y) * C * T + PAD * 2;
  const DH = (X + Y) * 0.5 * T + WALL + PAD * 2 + 10;
  const ox = PAD + Y * C * T, oy = PAD + WALL;
  // 폭과 화면 높이 둘 다에 맞춰 방 전체가 한 화면에 들어오게
  const scale = Math.min(1.2, fit.w / DW, Math.max(0.35, (fit.h - 170) / DH));
  const m = (sx: number, sy: number) => `matrix(${C * T * sx} ${0.5 * T * sx} ${-C * T * sy} ${0.5 * T * sy} ${ox} ${oy})`;

  const selected = floors.find((f) => f.id === sel) ?? null;
  const counts = { writing: 0, blocked: 0, done: 0, todo: 0 } as Record<DocState, number>;
  for (const f of floors) for (const d of f.docs) counts[d.state]++;
  const o: [number, number] = [ox, oy];
  const [bx, by] = iso(ox, oy, X, 0); // 오른쪽 벽 끝
  const [lx, ly] = iso(ox, oy, 0, Y); // 왼쪽 벽 끝

  return (
    <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
      {/* 상단 현황 — 진행률 + 상태별 인원 */}
      <div className="rounded-[var(--r-md)] flex flex-wrap items-center" style={{ gap: "10px 14px", padding: "10px 16px", background: "#1F2430", color: "#fff" }} role="status">
        <span className="inline-flex items-center font-extrabold" style={{ gap: 8, fontSize: "var(--t-base)" }}>
          <span className="inline-grid place-items-center rounded-[6px]" style={{ width: 26, height: 26, background: "#F5B83D", color: "#1F2430", fontSize: 12 }}>IV</span>
          IVDR 문서 공장 오피스
        </span>
        <span className="flex items-center" style={{ gap: 8, minWidth: 160, flex: "1 1 160px" }}>
          <span className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,.18)" }}>
            <span className="block h-full rounded-full" style={{ width: pct(overall.progress), background: "#5BD08A", transition: "width .4s" }} />
          </span>
          <span className="font-extrabold" style={{ fontVariantNumeric: "tabular-nums" }}>{pct(overall.progress)}</span>
        </span>
        <span className="flex flex-wrap" style={{ gap: 6 }}>
          {([["작성 중", counts.writing, "#4C8DF6"], ["사람 대기", counts.blocked, "#F0A03C"], ["완료", counts.done, "#3FB872"], ["할 일 ✋", overall.tasks, "#E8618C"]] as const).map(([k, v, c]) => (
            <span key={k} className="inline-flex items-center rounded-full font-bold" style={{ gap: 5, padding: "3px 10px", fontSize: 12, background: "rgba(255,255,255,.08)", border: `1px solid ${c}` }}>
              <span className="rounded-full" style={{ width: 7, height: 7, background: c }} />{k} <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span>
            </span>
          ))}
          <button type="button" onClick={() => setTags((x) => !x)} aria-pressed={tags} className="inline-flex items-center rounded-full font-bold" style={{ padding: "3px 10px", fontSize: 12, background: tags ? "#fff" : "transparent", color: tags ? "#1F2430" : "#fff", border: "1px solid rgba(255,255,255,.5)" }}>
            이름표 {tags ? "켜짐" : "보기"}
          </button>
        </span>
      </div>

      {/* 부서 고르기 — 작은 화면에서도 누르기 쉽게 */}
      <div className="flex flex-wrap" style={{ gap: 6 }} role="group" aria-label="부서 고르기">
        {floors.map((f) => (
          <button key={f.id} type="button" onClick={() => setSel((x) => (x === f.id ? null : f.id))} aria-pressed={sel === f.id}
            className="inline-flex items-center gap-1.5 rounded-full font-bold"
            style={{ fontSize: "var(--t-xs)", padding: "4px 10px", minHeight: 30, border: `1.5px solid ${sel === f.id ? f.color : "var(--border)"}`, background: sel === f.id ? `color-mix(in srgb, ${f.color} 14%, var(--bg))` : "var(--bg)", color: "var(--text)" }}>
            <span style={{ color: f.color }}>{f.id}</span> {f.name}
            <span className="text-text-subtle" style={{ fontVariantNumeric: "tabular-nums" }}>{pct(f.progress)}{f.tasks.length > 0 ? ` · ✋${f.tasks.length}` : ""}</span>
          </button>
        ))}
      </div>

      <div ref={box} className="rounded-[var(--r-lg)] border overflow-hidden" style={{ borderColor: "var(--border)", background: "linear-gradient(to bottom, color-mix(in srgb, #FFC9DE 22%, var(--bg)), var(--bg))" }}>
        <div className="relative mx-auto" style={{ width: DW * scale, height: DH * scale }}>
          <div className="absolute left-0 top-0" style={{ width: DW, height: DH, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            <svg width={DW} height={DH} className="absolute left-0 top-0" aria-hidden>
              <defs>
                {/* 원목 마루 (타일 좌표, 판자 한 장 = 4×0.8) */}
                <pattern id="mr-floor" width="4" height="1.6" patternUnits="userSpaceOnUse">
                  <rect width="4" height="1.6" fill="#E9D5B7" />
                  <rect y="0.8" width="4" height="0.8" fill="#E3CCAA" />
                  <rect x="2" y="0.8" width="0.04" height="0.8" fill="#D2B68E" />
                  <rect x="0" y="0" width="0.04" height="0.8" fill="#D2B68E" />
                </pattern>
                <linearGradient id="mr-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#9FD1F5" />
                  <stop offset="1" stopColor="#E3F2FC" />
                </linearGradient>
              </defs>
              {/* 뒤쪽 벽 두 장 = 통유리창 + 도시 풍경 */}
              <polygon points={`${ox},${oy - WALL} ${bx},${by - WALL} ${bx},${by} ${ox},${oy}`} fill="url(#mr-sky)" />
              <polygon points={`${ox},${oy - WALL} ${lx},${ly - WALL} ${lx},${ly} ${ox},${oy}`} fill="url(#mr-sky)" style={{ filter: "brightness(.95)" }} />
              {([[C * T, X], [-C * T, Y]] as const).map(([ux, len], wi) => (
                <g key={wi} transform={`matrix(${ux} ${0.5 * T} 0 1 ${ox} ${oy})`}>
                  {/* 건물 실루엣 */}
                  {Array.from({ length: Math.ceil(len / 1.6) }, (_, i) => {
                    const hgt = 22 + ((i * 37 + wi * 11) % 7) * 8;
                    return <rect key={i} x={i * 1.6 + 0.1} y={-hgt - 8} width={1.3} height={hgt} fill={i % 3 ? "#B9CFE0" : "#A7C0D6"} opacity="0.8" />;
                  })}
                  {/* 창틀 */}
                  {Array.from({ length: Math.floor(len / 3.2) + 1 }, (_, i) => <rect key={i} x={i * 3.2 - 0.08} y={-WALL} width={0.16} height={WALL} fill="#EEF2F6" />)}
                  <rect x={0} y={-WALL} width={len} height={5} fill="#D9DEE5" />
                  <rect x={0} y={-8} width={len} height={8} fill="#C6CCD5" />
                </g>
              ))}
              {/* 바닥 + 부서 구역(러그) */}
              <g transform={m(1, 1)}>
                <rect width={X} height={Y} fill="url(#mr-floor)" />
                {zones.map((z) => (
                  <rect key={z.f.id} x={z.x + 0.35} y={z.y + 0.35} width={z.w - 0.7} height={z.h - 0.7} rx="0.6"
                    fill={`color-mix(in srgb, ${z.f.color} ${sel === z.f.id ? 30 : 12}%, transparent)`}
                    stroke={z.f.color} strokeWidth={sel === z.f.id ? 0.22 : 0.08} strokeDasharray={sel === z.f.id ? undefined : "0.4 0.25"} />
                ))}
                {/* 접수 라운지 러그 */}
                {zones.filter((z) => z.f.id === "1F").map((z) => <rect key="rug" x={z.x + 1} y={z.y + z.h - 4} width={Math.min(9, z.w - 2)} height={3.4} rx="1.2" fill="#F4E3E9" stroke="#E7C6D2" strokeWidth="0.08" />)}
              </g>

              {/* 가구 — 결재실은 유리벽 방 + 큰 결재 책상, 접수는 소파 라운지 */}
              {zones.map((z) => {
                if (z.f.id === "7F") {
                  const ex = z.x + z.w, ey = z.y + z.h;
                  const g = (x0: number, y0: number, x1: number, y1: number) => { const [a1, b1] = iso(ox, oy, x0, y0); const [a2, b2] = iso(ox, oy, x1, y1); return `${a1},${b1} ${a2},${b2} ${a2},${b2 - 44} ${a1},${b1 - 44}`; };
                  return (
                    <g key={z.f.id}>
                      <IsoBox o={o} x0={z.x + z.w / 2 - 2.4} y0={z.y + 0.9} x1={z.x + z.w / 2 + 2.4} y1={z.y + 2.2} h={11} top="#8A5A3B" left="#6E452C" right="#5C3922" />
                      <IsoBox o={o} x0={z.x + z.w / 2 - 0.6} y0={z.y + 1.1} x1={z.x + z.w / 2 + 0.6} y1={z.y + 1.4} h={6} z={11} top="#2F333D" left="#2F333D" right="#22252C" />
                      <polygon points={g(z.x + 0.2, ey, ex, ey)} fill="rgba(190,225,255,.22)" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" />
                      <polygon points={g(ex, z.y + 0.2, ex, ey)} fill="rgba(190,225,255,.18)" stroke="rgba(255,255,255,.9)" strokeWidth="1.2" />
                    </g>
                  );
                }
                if (z.f.id === "1F") {
                  const y1 = z.y + z.h - 0.9, x0 = z.x + 1.4;
                  return (
                    <g key={z.f.id}>
                      <IsoBox o={o} x0={x0} y0={y1 - 2.6} x1={x0 + 4.4} y1={y1 - 1.9} h={15} top="#EADFD3" left="#D9CBBB" right="#C9B9A6" />
                      <IsoBox o={o} x0={x0} y0={y1 - 1.9} x1={x0 + 4.4} y1={y1 - 0.9} h={7} top="#F2E8DC" left="#DCCDBC" right="#CDBCA8" />
                      <IsoBox o={o} x0={x0 + 1.2} y0={y1 - 0.6} x1={x0 + 3.2} y1={y1} h={5} top="#C99A6B" left="#A87A4D" right="#946A42" />
                      <IsoBox o={o} x0={x0 + 5.2} y0={y1 - 2.2} x1={x0 + 6.6} y1={y1 - 0.8} h={8} top="#4FA3A0" left="#3D8986" right="#337572" />
                    </g>
                  );
                }
                return null;
              })}
              {/* 화분 — 벽 쪽 구석마다 */}
              <Plant o={o} x={0.8} y={0.8} big />
              {zones.filter((z) => z.y === 0).map((z) => <Plant key={`p-${z.f.id}`} o={o} x={z.x + z.w - 1} y={0.8} />)}
              {zones.filter((z) => z.x === 0 && z.y > 0).map((z) => <Plant key={`q-${z.f.id}`} o={o} x={0.8} y={z.y + z.h - 1} />)}
            </svg>

            {/* 부서 간판·할 일 게시판 */}
            {zones.map((z) => {
              const [sx, sy] = iso(ox, oy, z.x + 0.7, z.y + 0.7);
              return (
                <button key={z.f.id} type="button" onClick={() => setSel((x) => (x === z.f.id ? null : z.f.id))} aria-pressed={sel === z.f.id}
                  aria-label={`간판 ${z.f.id} ${z.f.name} — 진행률 ${pct(z.f.progress)}, 할 일 ${z.f.tasks.length}`}
                  className="absolute inline-flex items-center rounded-full whitespace-nowrap font-extrabold"
                  style={{ left: sx - 12, top: sy - 12, zIndex: 5000, gap: 5, padding: "2px 9px", fontSize: 11, background: `linear-gradient(to right, color-mix(in srgb, ${z.f.color} 26%, #fff) ${pct(z.f.progress)}, #fff ${pct(z.f.progress)})`, border: `2px solid ${z.f.color}`, boxShadow: "0 2px 0 rgba(0,0,0,.12)", color: "#2B2321" }}>
                  <span style={{ color: z.f.color }}>{z.f.id}</span> {z.f.name}
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{pct(z.f.progress)}</span>
                  {z.f.tasks.length > 0 && <span style={{ color: "#C26A00" }}>✋{z.f.tasks.length}</span>}
                </button>
              );
            })}

            {/* 직원(문서) */}
            {zones.flatMap((z) =>
              z.f.docs.map((d, i) => {
                const col = Math.floor(i / ROWS), row = i % ROWS;
                const tx = z.x + 1.8 + col * S, ty = z.y + 3.1 + row * S;
                const [hx, hy] = iso(ox, oy, tx, ty);
                return <Spot key={d.id} d={d} color={z.f.color} hx={hx} hy={hy} zone={z} tx={tx} ty={ty} tags={tags} />;
              }),
            )}

            {/* 문서가 없는 부서(결재실·접수)는 사람 할 일이 줄을 선다 */}
            {zones.filter((z) => z.f.docs.length === 0).flatMap((z) => {
              const cap = Math.max(1, Math.floor((z.w - 2) / 2.2)) * 2;
              const shown = z.f.tasks.slice(0, cap);
              const perRow = Math.ceil(shown.length / 2);
              const items = shown.map((t, i) => {
                const [hx, hy] = iso(ox, oy, z.x + 1.8 + (i % perRow) * 2.2, z.y + 3.6 + Math.floor(i / perRow) * 3.6);
                return (
                  <Link key={t.id} to={t.to} title={`${t.title} — ${t.why}`} aria-label={`할 일: ${t.title}`} className="absolute block" style={{ left: hx - 15, top: hy - 38, zIndex: Math.round(hy), width: 30, height: 40, animation: "factory-bob 1.6s ease-in-out infinite", animationDelay: `${-(i % 5) * 0.3}s` }}>
                    <Minimi seed={t.id} state="blocked" shirt="#FFC266" walking={false} />
                    <span aria-hidden className="absolute" style={{ top: -6, right: -6, fontSize: 12 }}>✋</span>
                  </Link>
                );
              });
              if (z.f.tasks.length > shown.length) {
                const [hx, hy] = iso(ox, oy, z.x + z.w - 1.2, z.y + z.h - 1.4);
                items.push(
                  <button key={`${z.f.id}-more`} type="button" onClick={() => setSel(z.f.id)} className="absolute rounded-full font-extrabold" style={{ left: hx - 20, top: hy - 12, zIndex: 4000, padding: "1px 8px", fontSize: 11, background: "#fff", border: "2px solid #C26A00", color: "#C26A00" }}>
                    +{z.f.tasks.length - shown.length}
                  </button>,
                );
              }
              return items;
            })}
          </div>
        </div>
      </div>
      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
        시작 전·완료 직원은 돌아다니고, 작성 중이면 모니터 앞에서 일하고, 사람 대기면 "대기" 말풍선이 뜹니다. 직원에 마우스를 올리면 이름표가 보이고 멈춥니다. 결재실·접수에는 사람이 할 일(✋)이 줄을 서 있습니다. 부서 간판을 누르면 목록이 열립니다.
      </p>

      <Briefing floors={floors} overall={overall} counts={counts} />

      {selected && (
        <div className="rounded-[var(--r-md)] border overflow-hidden" style={{ borderColor: selected.color }}>
          <div className="flex items-center justify-between" style={{ padding: "var(--s-3) var(--s-4)", background: `color-mix(in srgb, ${selected.color} 10%, var(--bg))` }}>
            <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
              <span style={{ color: selected.color }}>{selected.id}</span> {selected.name} — {selected.desc}
            </span>
            <button type="button" onClick={() => setSel(null)} className="font-semibold text-text-muted hover:text-text" style={{ fontSize: "var(--t-xs)" }}>닫기</button>
          </div>
          <FloorDetail f={selected} />
        </div>
      )}
    </div>
  );
}

/** 책상 하나와 그 자리 직원. */
function Spot({ d, color, hx, hy, zone, tx, ty, tags }: { d: FactoryDoc; color: string; hx: number; hy: number; zone: Zone; tx: number; ty: number; tags: boolean }) {
  const st = STATE[d.state];
  const shirt = d.state === "todo" ? `color-mix(in srgb, ${color} 70%, #fff)` : d.state === "done" ? "#7ED3A0" : d.state === "blocked" ? "#FFC266" : color;
  const walking = d.state === "todo" || d.state === "done";
  const label = `${d.title} — ${st.label}${d.why ? ` (${d.why})` : ""} · ${pct(d.progress)}`;
  const depth = Math.round(hy);

  // 걷는 경로: 자기 칸 안에서만 x로 갔다가 y로, 다시 돌아오기 (모두 같은 방향이라 이웃과 겹치지 않음)
  let walk: React.CSSProperties | undefined;
  if (walking) {
    const n = seedOf(d.id);
    let dx = 0.5 + ((n >>> 2) % 5) / 10;
    let dy = 0.5 + ((n >>> 7) % 5) / 10;
    if (tx + dx > zone.x + zone.w - 0.8 || tx + dx < zone.x + 0.8) dx = -dx;
    if (ty + dy > zone.y + zone.h - 0.6 || ty + dy < zone.y + 2.6) dy = -dy;
    const ax = dx * C * T, ay = dx * 0.5 * T, bx = -dy * C * T, by = dy * 0.5 * T;
    const sg = (v: number) => (v >= 0 ? 1 : -1);
    const dur = 10 + ((n >>> 10) % 8);
    walk = {
      "--ax": `${ax}px`, "--ay": `${ay}px`, "--bx": `${bx}px`, "--by": `${by}px`,
      "--f1": sg(ax), "--f2": sg(bx), "--f3": -sg(ax), "--f4": -sg(bx),
      animationDuration: `${dur}s`, animationDelay: `${-((n >>> 13) % dur)}s`,
    } as React.CSSProperties;
  }

  const person = (
    <Link to={`/doc/${d.id}`} title={label} aria-label={`${d.title}, ${st.label}, ${pct(d.progress)}`} className="relative block group" style={{ width: 30, height: 40 }}>
      {/* 말풍선 — 작성 중 / 사람 대기 */}
      {(d.state === "writing" || d.state === "blocked") && (
        <span aria-hidden className="absolute inline-flex items-center rounded-full font-extrabold whitespace-nowrap" style={{ bottom: 41, left: "50%", transform: "translateX(-50%)", padding: "1px 6px", fontSize: 8.5, gap: 2, background: d.state === "writing" ? "#4C8DF6" : "#F0A03C", color: "#fff", boxShadow: "0 1px 0 rgba(0,0,0,.15)" }}>
          {d.state === "writing" ? <>작성 중{[0, 1, 2].map((i) => <span key={i} className="rounded-full" style={{ width: 2, height: 2, background: "#fff", animation: `factory-dot 1.2s ${i * 0.15}s infinite` }} />)}</> : "대기"}
        </span>
      )}
      {/* 이름표 — 마우스를 올리거나 '이름표 보기'를 켜면 */}
      <span aria-hidden className={`absolute rounded-full font-bold whitespace-nowrap pointer-events-none ${tags ? "" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`} style={{ top: 40, left: "50%", transform: "translateX(-50%)", padding: "1px 6px", fontSize: 8.5, background: "rgba(31,36,48,.82)", color: "#fff", zIndex: 1, transition: "opacity .15s" }}>
        {d.title.length > 9 ? `${d.title.slice(0, 9)}…` : d.title}
      </span>
      <span className="block" style={{ animation: d.state === "blocked" ? "factory-bob 1.6s ease-in-out infinite" : undefined }}>
        <Minimi seed={d.id} state={d.state} shirt={shirt} walking={walking} />
      </span>
      {d.state === "done" && <span aria-hidden className="absolute inline-grid place-items-center rounded-full font-extrabold" style={{ top: -3, right: -3, width: 12, height: 12, fontSize: 8, background: "var(--success)", color: "#fff" }}>✓</span>}
    </Link>
  );

  return (
    <>
      {/* 책상은 직원 앞(화면 아래쪽)에 — 앉아 있으면 다리가 가려진다 */}
      <div className="absolute" style={{ left: hx - 1 * T * C - 2, top: hy - 8, zIndex: depth + 2, pointerEvents: "none" }}>
        <Desk on={d.state === "writing"} color={color} />
      </div>
      {walking ? (
        <div className="absolute minimi-walk" style={{ ...walk, left: hx - 6, top: hy - 34, zIndex: depth + 3 }}>
          <div className="minimi-flip" style={walk}>{person}</div>
        </div>
      ) : (
        <div className="absolute" style={{ left: hx - 3, top: hy - 30, zIndex: depth + 1 }}>{person}</div>
      )}
    </>
  );
}


/** 비서 브리핑 — 지금 사람이 할 일과 막힌 문서를 대화처럼 알려준다 (규칙 기반, AI 아님). */
function Briefing({ floors, overall, counts }: { floors: FactoryFloor[]; overall: { progress: number; done: number; total: number; tasks: number }; counts: Record<DocState, number> }) {
  const tasks = floors.flatMap((f) => f.tasks.map((t) => ({ t, f })));
  const blocked = floors.flatMap((f) => f.docs.filter((d) => d.state === "blocked").map((d) => ({ d, f })));
  const writing = floors.flatMap((f) => f.docs.filter((d) => d.state === "writing").map((d) => ({ d, f })));
  const bubble = "rounded-[14px] rounded-tl-[4px] text-text";
  const bubbleStyle = { padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" } as const;
  return (
    <section className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--border)", background: "var(--bg)", padding: "var(--s-4)" }} aria-label="비서 브리핑">
      <div className="flex items-center" style={{ gap: 10, marginBottom: "var(--s-3)" }}>
        <span className="inline-grid place-items-center rounded-full overflow-hidden" style={{ width: 44, height: 44, background: "#FDE7EF" }}>
          <span style={{ transform: "scale(1.6) translateY(5px)" }}><Minimi seed="secretary-2" state="done" shirt="#E8618C" walking={false} /></span>
        </span>
        <span>
          <span className="block font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>비서 · 오늘의 브리핑</span>
          <span className="block text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>지금 상태로 자동 정리 — 사람이 할 일만 모았어요</span>
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: 8, maxWidth: 760 }}>
        <p className={bubble} style={bubbleStyle}>
          전체 진행률 <b>{pct(overall.progress)}</b>, 문서 {overall.total}개 중 <b>{overall.done}개 완료</b>입니다. 작성 중 {counts.writing} · 사람 대기 {counts.blocked} · 시작 전 {counts.todo}.
        </p>
        {tasks.length > 0 ? (
          <div className={bubble} style={bubbleStyle}>
            <p>사람이 해야 할 일이 <b>{tasks.length}건</b> 있어요. 먼저 이것부터 해 주세요:</p>
            <ol className="flex flex-col" style={{ gap: 4, marginTop: 6, paddingLeft: 18, listStyle: "decimal" }}>
              {tasks.slice(0, 5).map(({ t, f }) => (
                <li key={t.id}>
                  <Link to={t.to} className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>{t.title}</Link>
                  <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}> — {f.id} {f.name} · {t.why}</span>
                </li>
              ))}
            </ol>
            {tasks.length > 5 && <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: 4 }}>외 {tasks.length - 5}건은 부서 간판을 눌러 확인하세요.</p>}
          </div>
        ) : (
          <p className={bubble} style={bubbleStyle}>지금 사람이 할 일은 없어요. 🎉</p>
        )}
        {blocked.length > 0 && (
          <div className={bubble} style={bubbleStyle}>
            <p>이 문서들은 사람 입력을 기다리고 있어요:</p>
            <ul className="flex flex-col" style={{ gap: 2, marginTop: 4 }}>
              {blocked.slice(0, 5).map(({ d, f }) => (
                <li key={d.id}>
                  <Link to={`/doc/${d.id}`} className="font-semibold hover:underline text-text">{d.title}</Link>
                  <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}> — {f.name}{d.why ? ` · ${d.why}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {writing.length > 0 && (
          <p className={bubble} style={bubbleStyle}>
            작성 중: {writing.slice(0, 4).map(({ d }, i) => <span key={d.id}>{i > 0 && ", "}<Link to={`/doc/${d.id}`} className="font-semibold hover:underline text-text">{d.title}</Link> {pct(d.progress)}</span>)}
            {writing.length > 4 && ` 외 ${writing.length - 4}개`}
          </p>
        )}
      </div>
    </section>
  );
}
