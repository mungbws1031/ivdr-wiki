import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { FactoryDoc, FactoryFloor, FactoryTask } from "../../lib/factory";
import { FloorDetail, Minimi, pct, seedOf, STATE } from "./factoryArt";

// 건물 단면 보기 — 고층 빌딩을 잘라 본 모습. 층마다 이름 띠, 부서별 실내, 가운데 엘리베이터.

const W = 1000; // 설계 폭(px) — 화면 폭에 맞춰 축소
const HB = 26; // 층 이름 띠 높이
const FH = 104; // 방 높이
const FRAME = 14; // 외벽 두께
const SHAFT = 64; // 엘리베이터 통로 폭
const ROOM_W = W - FRAME * 2 - SHAFT; // 방 폭
const DECOR_W = 150; // 방 오른쪽 부서 소품 자리

/** 부서별 실내 소품 (방 오른쪽 끝 + 벽 위) */
function Decor({ id, color }: { id: string; color: string }) {
  const x0 = ROOM_W - DECOR_W + 6;
  const floorY = FH - 22;
  const plant = (x: number) => (
    <g key={`pl${x}`}>
      <rect x={x - 7} y={floorY - 12} width={14} height={12} rx={2} fill="#D7DBE1" />
      <circle cx={x} cy={floorY - 22} r={9} fill="#4FA35A" />
      <circle cx={x - 7} cy={floorY - 15} r={6} fill="#62B86C" />
      <circle cx={x + 7} cy={floorY - 16} r={6} fill="#62B86C" />
    </g>
  );
  const shelf = (x: number, w = 46) => (
    <g key={`sh${x}`}>
      <rect x={x} y={floorY - 56} width={w} height={56} rx={2} fill="#8A5A3B" />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={x + 3} y={floorY - 53 + r * 18} width={w - 6} height={15} fill="#6E452C" />
          {Array.from({ length: Math.floor((w - 8) / 6) }, (_, i) => <rect key={i} x={x + 5 + i * 6} y={floorY - 51 + r * 18} width={4} height={12} fill={["#E8618C", "#4C8DF6", "#F5B83D", "#3FB872", "#9B7BE0"][(i + r) % 5]} />)}
        </g>
      ))}
    </g>
  );
  switch (id) {
    case "7F": // 결재실 — 큰 결재 책상 + 책장
      return (
        <g>
          {shelf(x0 + 4)}
          <rect x={x0 + 58} y={floorY - 20} width={78} height={20} rx={2} fill="#7A4B2E" />
          <rect x={x0 + 58} y={floorY - 23} width={78} height={4} rx={1} fill="#9C6640" />
          <rect x={x0 + 86} y={floorY - 33} width={20} height={10} rx={1} fill="#2F333D" />
          <text x={x0 + 97} y={floorY - 6} textAnchor="middle" fontSize="8" fontWeight="800" fill="#F5D9B0">결재</text>
        </g>
      );
    case "6F": // RA — 규정 바인더 책장 + 세계 지도
      return (
        <g>
          <rect x={x0 + 8} y={10} width={70} height={36} rx={3} fill="#DCEBF5" stroke="#B5C9D8" />
          <path d={`M${x0 + 16} 30 q8 -12 18 -4 q6 6 14 -2 q8 -6 18 6 q-6 8 -16 4 q-10 4 -18 0 q-8 4 -16 -4 z`} fill="#8FC79A" />
          <text x={x0 + 43} y={42} textAnchor="middle" fontSize="7" fontWeight="700" fill="#5A6B78">EU · KR · US</text>
          {shelf(x0 + 90, 52)}
        </g>
      );
    case "5F": // 개발·설계 — 화이트보드 + 화분
      return (
        <g>
          <rect x={x0 + 6} y={8} width={96} height={46} rx={3} fill="#fff" stroke="#C9CED6" strokeWidth="2" />
          <rect x={x0 + 14} y={16} width={24} height={12} rx={2} fill="none" stroke={color} strokeWidth="1.5" />
          <rect x={x0 + 54} y={16} width={24} height={12} rx={2} fill="none" stroke={color} strokeWidth="1.5" />
          <path d={`M${x0 + 38} 22 L${x0 + 54} 22 M${x0 + 26} 28 L${x0 + 26} 40 L${x0 + 66} 40 L${x0 + 66} 28`} stroke={color} strokeWidth="1.5" fill="none" />
          {plant(x0 + 126)}
        </g>
      );
    case "4F": // 성능평가 실험실 — 실험대 + 시험관 + 실험 보드
      return (
        <g>
          <rect x={x0 + 8} y={10} width={60} height={34} rx={3} fill="#fff" stroke="#C9CED6" strokeWidth="2" />
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={x0 + 13 + c * 18} y={14 + r * 10} width={15} height={7} rx={1} fill={["#3FB872", "#4C8DF6", "#F0A03C", "#E8618C"][(r + c) % 4]} />))}
          <rect x={x0 + 4} y={floorY - 22} width={136} height={22} rx={2} fill="#E9ECEF" stroke="#C9CED6" />
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={x0 + 14 + i * 16} y={floorY - 38} width={6} height={16} rx={3} fill="#fff" stroke="#9AA4B2" />
              <rect x={x0 + 14.5 + i * 16} y={floorY - 30} width={5} height={8} rx={2.5} fill={["#F5B83D", "#E8618C", "#4C8DF6"][i % 3]} opacity="0.8" />
            </g>
          ))}
        </g>
      );
    case "3F": // 생산 — 컨베이어 + 상자
      return (
        <g>
          <rect x={x0} y={floorY - 18} width={142} height={10} rx={5} fill="#5B6270" />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={x0 + 6 + i * 16} cy={floorY - 13} r={3} fill="#8C93A1" />)}
          <rect x={x0 + 4} y={floorY - 8} width={6} height={8} fill="#5B6270" />
          <rect x={x0 + 132} y={floorY - 8} width={6} height={8} fill="#5B6270" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={x0 + 12 + i * 32} y={floorY - 34} width={22} height={16} rx={1} fill="#D9A86C" stroke="#B9874E" />)}
        </g>
      );
    case "2F": // 품질 — 서류 캐비닛
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={x0 + 4 + i * 40} y={floorY - 58} width={34} height={58} rx={2} fill="#B9C1CC" />
              {[0, 1, 2].map((r) => (
                <g key={r}>
                  <rect x={x0 + 7 + i * 40} y={floorY - 55 + r * 19} width={28} height={16} rx={1} fill="#D5DBE3" />
                  <rect x={x0 + 17 + i * 40} y={floorY - 49 + r * 19} width={8} height={2.5} rx={1} fill="#7D8794" />
                </g>
              ))}
            </g>
          ))}
        </g>
      );
    default: // 1F 접수 — 안내 데스크 + 소파
      return (
        <g>
          <rect x={x0 + 4} y={floorY - 26} width={62} height={26} rx={3} fill="#EADFD3" stroke="#D3C3B1" />
          <rect x={x0 + 4} y={floorY - 30} width={62} height={5} rx={2} fill="#C99A6B" />
          <text x={x0 + 35} y={floorY - 11} textAnchor="middle" fontSize="8" fontWeight="800" fill="#8A6A4B">스펙 접수</text>
          <rect x={x0 + 78} y={floorY - 22} width={58} height={22} rx={6} fill="#4FA3A0" />
          <rect x={x0 + 78} y={floorY - 34} width={58} height={14} rx={6} fill="#3D8986" />
        </g>
      );
  }
}

/** 정면에서 본 책상 + 모니터 (작성 중이면 켜짐) */
function FrontDesk({ on, color }: { on: boolean; color: string }) {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden>
      <rect x="27" y="0" width="12" height="9" rx="1" fill={on ? color : "#2F333D"} stroke={on ? "#fff" : "#1F2229"} strokeWidth="0.8" />
      <rect x="32" y="9" width="2" height="3" fill="#4A4F5C" />
      <rect x="0" y="11" width="40" height="4" rx="1" fill="#C99A6B" />
      <rect x="2" y="15" width="36" height="9" fill="#B98654" />
      <rect x="2" y="15" width="36" height="1.5" fill="#A0703F" />
    </svg>
  );
}

function Person({ d, color, walk }: { d: FactoryDoc; color: string; walk: number }) {
  const st = STATE[d.state];
  const shirt = d.state === "todo" ? `color-mix(in srgb, ${color} 70%, #fff)` : d.state === "done" ? "#7ED3A0" : d.state === "blocked" ? "#FFC266" : color;
  const walking = d.state === "todo" || d.state === "done";
  const n = seedOf(d.id);
  const dur = 9 + ((n >>> 4) % 7);
  const style = walking ? ({ "--wx": `${walk}px`, "--f": walk >= 0 ? 1 : -1, animationDuration: `${dur}s`, animationDelay: `${-((n >>> 9) % dur)}s` } as React.CSSProperties) : undefined;
  return (
    <div className={walking ? "tower-walk" : undefined} style={style}>
      <Link to={`/doc/${d.id}`} title={`${d.title} — ${st.label}${d.why ? ` (${d.why})` : ""} · ${pct(d.progress)}`} aria-label={`${d.title}, ${st.label}, ${pct(d.progress)}`} className="relative block group" style={{ width: 30, height: 40 }}>
        {(d.state === "writing" || d.state === "blocked") && (
          <span aria-hidden className="absolute inline-flex items-center rounded-full font-extrabold whitespace-nowrap" style={{ bottom: 41, left: "50%", transform: "translateX(-50%)", padding: "1px 6px", fontSize: 8.5, background: d.state === "writing" ? "#4C8DF6" : "#F0A03C", color: "#fff" }}>
            {d.state === "writing" ? "작성 중" : "대기"}
          </span>
        )}
        <span className="absolute rounded-full font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ top: -16, left: "50%", transform: "translateX(-50%)", padding: "1px 6px", fontSize: 8.5, background: "rgba(31,36,48,.85)", color: "#fff", zIndex: 2, transition: "opacity .15s" }}>
          {d.title.length > 10 ? `${d.title.slice(0, 10)}…` : d.title}
        </span>
        <span className={walking ? "block tower-flip" : "block"} style={{ ...(walking ? style : undefined), animation: d.state === "blocked" ? "factory-bob 1.6s ease-in-out infinite" : undefined }}>
          <Minimi seed={d.id} state={d.state} shirt={shirt} walking={walking} />
        </span>
        {d.state === "done" && <span aria-hidden className="absolute inline-grid place-items-center rounded-full font-extrabold" style={{ top: -3, right: -3, width: 12, height: 12, fontSize: 8, background: "var(--success)", color: "#fff" }}>✓</span>}
      </Link>
    </div>
  );
}

function TaskPerson({ t }: { t: FactoryTask }) {
  return (
    <Link to={t.to} title={`${t.title} — ${t.why}`} aria-label={`할 일: ${t.title}`} className="relative block" style={{ width: 30, height: 40, animation: "factory-bob 1.6s ease-in-out infinite" }}>
      <Minimi seed={t.id} state="blocked" shirt="#FFC266" walking={false} />
      <span aria-hidden className="absolute" style={{ top: -6, right: -6, fontSize: 12 }}>✋</span>
    </Link>
  );
}

function TowerFloor({ f, open, onToggle }: { f: FactoryFloor; open: boolean; onToggle: () => void }) {
  const area = ROOM_W - DECOR_W - 24;
  const people: ({ kind: "doc"; d: FactoryDoc } | { kind: "task"; t: FactoryTask })[] =
    f.docs.length > 0 ? f.docs.map((d) => ({ kind: "doc" as const, d })) : f.tasks.slice(0, f.tasks.length > Math.floor(area / 40) ? Math.floor(area / 40) - 2 : f.tasks.length).map((t) => ({ kind: "task" as const, t }));
  const step = Math.min(56, area / Math.max(1, people.length));
  const more = f.docs.length === 0 ? f.tasks.length - people.length : 0;
  const tint = `color-mix(in srgb, ${f.color} 9%, #FBF4EA)`;
  return (
    <div style={{ borderBottom: `${FRAME / 2}px solid #1F2A3A` }}>
      {/* 층 이름 띠 */}
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center text-left" style={{ height: HB, gap: 10, padding: "0 12px", background: open ? "#2E3E54" : "#263445", color: "#fff" }}>
        <span className="font-extrabold" style={{ fontSize: 13, color: "#fff", fontVariantNumeric: "tabular-nums", minWidth: 24 }}>{f.id}</span>
        <span className="font-bold whitespace-nowrap" style={{ fontSize: 12 }}>{f.name}</span>
        <span className="truncate" style={{ fontSize: 10.5, color: "#AFC0D3" }}>{f.desc}</span>
        <span className="ml-auto flex items-center" style={{ gap: 8, fontSize: 11 }}>
          {f.tasks.length > 0 && <span className="font-bold" style={{ color: "#F5B83D" }}>✋ {f.tasks.length}</span>}
          {f.docs.length > 0 && <span style={{ color: "#AFC0D3", fontVariantNumeric: "tabular-nums" }}>완료 {f.counts.done}/{f.docs.length}</span>}
          <span className="rounded-full overflow-hidden" style={{ width: 70, height: 6, background: "rgba(255,255,255,.18)" }}>
            <span className="block h-full" style={{ width: pct(f.progress), background: f.color }} />
          </span>
          <span className="font-extrabold" style={{ fontVariantNumeric: "tabular-nums", minWidth: 30, textAlign: "right" }}>{pct(f.progress)}</span>
        </span>
      </button>
      {/* 실내 */}
      <div className="relative" style={{ height: FH, background: tint }}>
        <svg width={ROOM_W} height={FH} className="absolute left-0 top-0" aria-hidden>
          {/* 벽 조명 · 바닥 */}
          <rect width={ROOM_W} height={FH} fill={tint} />
          <rect width={ROOM_W} height={10} fill="rgba(0,0,0,.05)" />
          {[0.12, 0.38, 0.64].map((t) => <ellipse key={t} cx={ROOM_W * t} cy={2} rx={34} ry={4} fill="#FFF7D6" opacity="0.9" />)}
          <rect y={FH - 22} width={ROOM_W} height={22} fill="#D9B98F" />
          {Array.from({ length: Math.ceil(ROOM_W / 60) }, (_, i) => <rect key={i} x={i * 60} y={FH - 22} width={1} height={22} fill="#C7A57A" />)}
          <rect y={FH - 24} width={ROOM_W} height={3} fill="#B58E62" />
          <Decor id={f.id} color={f.color} />
        </svg>
        {people.map((p, i) => {
          const cx = 14 + step * (i + 0.5);
          const n = seedOf(p.kind === "doc" ? p.d.id : p.t.id);
          const walk = Math.round((n % 2 ? 1 : -1) * Math.min(step * 0.42, 22));
          return (
            <div key={p.kind === "doc" ? p.d.id : p.t.id} className="absolute" style={{ left: cx - 15, bottom: 6 }}>
              {p.kind === "doc" ? <Person d={p.d} color={f.color} walk={walk} /> : <TaskPerson t={p.t} />}
              {p.kind === "doc" && (
                <div className="absolute pointer-events-none" style={{ left: -5, bottom: -6 }}>
                  <FrontDesk on={p.d.state === "writing"} color={f.color} />
                </div>
              )}
            </div>
          );
        })}
        {more > 0 && (
          <button type="button" onClick={onToggle} className="absolute rounded-full font-extrabold" style={{ left: 14 + step * people.length, bottom: 20, padding: "1px 8px", fontSize: 11, background: "#fff", border: "2px solid #C26A00", color: "#C26A00" }}>+{more}</button>
        )}
        {f.docs.length === 0 && f.tasks.length === 0 && <span className="absolute text-text-subtle" style={{ left: 24, bottom: 34, fontSize: 12 }}>할 일 없음</span>}
      </div>
    </div>
  );
}

/** 건물 단면 — 층 이름 띠를 누르면 그 층 목록이 열린다. */
export function FactoryTower({ floors, overall }: { floors: FactoryFloor[]; overall: { progress: number; done: number; total: number; tasks: number } }) {
  const [open, setOpen] = useState<string | null>(null);
  const [fit, setFit] = useState(W);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setFit(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.min(1, fit / W);
  const floorH = HB + FH + FRAME / 2;
  const ROOF = 64;
  const H = ROOF + floors.length * floorH + 18;
  const selected = floors.find((f) => f.id === open) ?? null;

  return (
    <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
      <div ref={box} className="rounded-[var(--r-lg)] overflow-hidden" style={{ background: "linear-gradient(to bottom, #9FD1F5, #E3F2FC 70%, #F4F7FA)" }}>
        <div className="relative mx-auto" style={{ width: W * scale, height: H * scale }}>
          <div className="absolute left-0 top-0" style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
            {/* 지붕 간판 */}
            <div className="absolute flex items-center" style={{ left: FRAME, right: FRAME, top: 8, height: ROOF - 14, gap: 16, padding: "0 18px", background: "#1F2A3A", color: "#fff", borderRadius: "10px 10px 0 0" }} role="status">
              <span className="font-extrabold" style={{ fontSize: 18, letterSpacing: "-0.01em" }}>IVDR 문서 공장 타워</span>
              <span className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: "rgba(255,255,255,.18)" }}>
                <span className="block h-full rounded-full" style={{ width: pct(overall.progress), background: "#5BD08A" }} />
              </span>
              <span className="font-extrabold" style={{ fontSize: 20, fontVariantNumeric: "tabular-nums" }}>{pct(overall.progress)}</span>
              <span style={{ fontSize: 12, color: "#AFC0D3", fontVariantNumeric: "tabular-nums" }}>완료 {overall.done}/{overall.total} · ✋ {overall.tasks}</span>
            </div>
            {/* 외벽 + 층들 */}
            <div className="absolute" style={{ left: 0, top: ROOF - 6, width: W, background: "#1F2A3A", padding: `${FRAME / 2}px ${FRAME}px 0`, borderRadius: 4 }}>
              <div className="relative" style={{ marginRight: SHAFT }}>
                {floors.map((f) => <TowerFloor key={f.id} f={f} open={open === f.id} onToggle={() => setOpen((x) => (x === f.id ? null : f.id))} />)}
              </div>
              {/* 엘리베이터 통로 */}
              <div className="absolute" style={{ right: FRAME, top: FRAME / 2, width: SHAFT - 6, bottom: 0, background: "#2A3647", borderLeft: "2px solid #344458" }} aria-hidden>
                {floors.map((f, i) => (
                  <span key={f.id} className="absolute font-extrabold" style={{ left: 0, right: 0, top: i * floorH + 6, textAlign: "center", fontSize: 10, color: "#7F93AA" }}>{f.id}</span>
                ))}
                <div className="tower-elev absolute" style={{ left: 7, right: 7, top: HB + 10, height: FH - 18, "--step": `${floorH}px` } as React.CSSProperties}>
                  <div className="h-full rounded-[3px] flex" style={{ background: "#C9D3DE", border: "2px solid #E8EDF2", boxShadow: "0 0 0 2px #1F2A3A" }}>
                    <span className="flex-1" style={{ borderRight: "1px solid #9AA8B8", background: "linear-gradient(to right, #B8C4D1, #D7DFE8)" }} />
                    <span className="flex-1" style={{ background: "linear-gradient(to left, #B8C4D1, #D7DFE8)" }} />
                  </div>
                </div>
              </div>
            </div>
            {/* 땅 */}
            <div className="absolute" style={{ left: -20, right: -20, bottom: 0, height: 18, background: "#9AA5B1" }} />
          </div>
        </div>
      </div>
      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
        층 이름 띠를 누르면 그 층의 문서·할 일 목록이 열립니다. 직원에 마우스를 올리면 이름표가 보이고, 누르면 문서가 열립니다.
      </p>
      {selected && (
        <div className="rounded-[var(--r-md)] border overflow-hidden" style={{ borderColor: selected.color }}>
          <div className="flex items-center justify-between" style={{ padding: "var(--s-3) var(--s-4)", background: `color-mix(in srgb, ${selected.color} 10%, var(--bg))` }}>
            <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
              <span style={{ color: selected.color }}>{selected.id}</span> {selected.name} — {selected.desc}
            </span>
            <button type="button" onClick={() => setOpen(null)} className="font-semibold text-text-muted hover:text-text" style={{ fontSize: "var(--t-xs)" }}>닫기</button>
          </div>
          <FloorDetail f={selected} />
        </div>
      )}
    </div>
  );
}
