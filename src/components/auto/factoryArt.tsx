import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import type { DocState, FactoryDoc, FactoryFloor } from "../../lib/factory";

// 문서 공장 2D·3D 화면이 함께 쓰는 상태 색·캐릭터·층 상세.

export const STATE: Record<DocState, { label: string; color: string }> = {
  done: { label: "완료", color: "var(--success)" },
  writing: { label: "작성 중", color: "var(--info)" },
  blocked: { label: "사람 대기", color: "var(--warning)" },
  todo: { label: "시작 전", color: "var(--text-subtle)" },
};

export const pct = (v: number) => `${Math.round(v * 100)}%`;

// ── 캐릭터 ─────────────────────────────────────────────────
const SKIN = ["#F6D7BD", "#EFC39E", "#D9A47A", "#B97E56", "#8D5A3B"];
const HAIR = ["#2B2321", "#5A3A26", "#8A5A35", "#C99A5B", "#3B3F4A", "#A23A2A"];

/** 문서 id로 정해지는 고정 난수 — 새로고침해도 같은 얼굴. */
export function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

function Hair({ style, color }: { style: number; color: string }) {
  switch (style) {
    case 0: // 짧은 머리
      return <path d="M7.5 9 Q7.5 3 14 3 Q20.5 3 20.5 9 Q18 6.5 14 6.5 Q10 6.5 7.5 9 Z" fill={color} />;
    case 1: // 단발
      return <path d="M6.5 14 Q5.5 3 14 3 Q22.5 3 21.5 14 L19.8 14 Q20 7.5 14 7 Q8 7.5 8.2 14 Z" fill={color} />;
    case 2: // 포니테일
      return (
        <>
          <path d="M7.5 9.5 Q7.5 3 14 3 Q20.5 3 20.5 9.5 Q17.5 6 14 6 Q10.5 6 7.5 9.5 Z" fill={color} />
          <path d="M20 6 Q25.5 7 23.5 15 Q22.5 11 20.3 9.5 Z" fill={color} />
        </>
      );
    case 3: // 곱슬
      return (
        <g fill={color}>
          {[[8.5, 7], [11, 4.6], [14, 3.8], [17, 4.6], [19.5, 7], [7.8, 10], [20.2, 10]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.6" />)}
        </g>
      );
    case 4: // 올림머리
      return (
        <>
          <circle cx="14" cy="2.6" r="2.6" fill={color} />
          <path d="M7.5 9.5 Q7.8 4 14 4 Q20.2 4 20.5 9.5 Q17.5 6.8 14 6.8 Q10.5 6.8 7.5 9.5 Z" fill={color} />
        </>
      );
    default: // 뾰족 머리
      return <path d="M7.5 9.5 L8.5 4.5 L10.5 6 L12 2.8 L14 5 L16 2.8 L17.5 6 L19.5 4.5 L20.5 9.5 Q14 6.5 7.5 9.5 Z" fill={color} />;
  }
}

/** 눈·코·입 + 헤어스타일. 표정은 상태(완료·작성 중·대기·시작 전)에 따라 바뀐다. */
export function Avatar({ seed, state, shirt }: { seed: string; state: DocState; shirt: string }) {
  const n = seedOf(seed);
  const skin = SKIN[n % SKIN.length];
  const hair = HAIR[(n >>> 3) % HAIR.length];
  const style = (n >>> 6) % 6;
  const glasses = (n >>> 9) % 5 === 0;
  const blush = state === "done" || (n >>> 11) % 3 === 0;
  const eyeY = 10.6;
  const mouth =
    state === "done" ? <path d="M11.6 13.6 Q14 16 16.4 13.6" stroke="#5B2A1E" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    : state === "blocked" ? <path d="M11.8 14.8 Q14 13.2 16.2 14.8" stroke="#5B2A1E" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    : state === "writing" ? <ellipse cx="14" cy="14.3" rx="1" ry="0.7" fill="#5B2A1E" />
    : <path d="M12.3 14.3 L15.7 14.3" stroke="#5B2A1E" strokeWidth="0.9" strokeLinecap="round" />;
  return (
    <svg width="28" height="38" viewBox="0 0 28 38" aria-hidden>
      {/* 몸 + 목 */}
      <rect x="12.2" y="15.5" width="3.6" height="3.5" fill={skin} />
      <path d="M4 37 Q4 19 14 19 Q24 19 24 37 Z" fill={shirt} />
      <path d="M11 19.3 L14 23 L17 19.3" fill="none" stroke="var(--bg)" strokeWidth="1" />
      {/* 얼굴 */}
      <ellipse cx="14" cy="10.5" rx="6.3" ry="6.8" fill={skin} />
      <ellipse cx="7.8" cy="11" rx="1" ry="1.4" fill={skin} />
      <ellipse cx="20.2" cy="11" rx="1" ry="1.4" fill={skin} />
      <Hair style={style} color={hair} />
      {/* 눈 */}
      {state === "done" ? (
        <g stroke="#2B2321" strokeWidth="0.9" fill="none" strokeLinecap="round">
          <path d="M10.6 10.9 Q11.6 9.9 12.6 10.9" />
          <path d="M15.4 10.9 Q16.4 9.9 17.4 10.9" />
        </g>
      ) : (
        <g fill="#2B2321">
          <ellipse cx="11.6" cy={eyeY} rx="0.85" ry={state === "writing" ? 0.6 : 1} />
          <ellipse cx="16.4" cy={eyeY} rx="0.85" ry={state === "writing" ? 0.6 : 1} />
          <circle cx="11.9" cy={eyeY - 0.3} r="0.25" fill="#fff" />
          <circle cx="16.7" cy={eyeY - 0.3} r="0.25" fill="#fff" />
        </g>
      )}
      {/* 눈썹 — 대기 중이면 걱정 */}
      <g stroke={hair} strokeWidth="0.8" strokeLinecap="round">
        {state === "blocked" ? (
          <>
            <path d="M10.4 8.6 L12.6 8.1" />
            <path d="M15.4 8.1 L17.6 8.6" />
          </>
        ) : (
          <>
            <path d="M10.5 8.4 Q11.6 7.8 12.7 8.3" fill="none" />
            <path d="M15.3 8.3 Q16.4 7.8 17.5 8.4" fill="none" />
          </>
        )}
      </g>
      {glasses && (
        <g stroke="#3B3F4A" strokeWidth="0.6" fill="none">
          <circle cx="11.6" cy={eyeY} r="1.9" />
          <circle cx="16.4" cy={eyeY} r="1.9" />
          <path d="M13.5 10.5 L14.5 10.5" />
        </g>
      )}
      {/* 코 */}
      <path d="M14 11.4 Q13.4 12.7 14.3 12.8" stroke="#A0694A" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      {blush && (
        <g fill="#F08C8C" opacity="0.45">
          <ellipse cx="10.2" cy="13" rx="1.1" ry="0.6" />
          <ellipse cx="17.8" cy="13" rx="1.1" ry="0.6" />
        </g>
      )}
      {mouth}
      {/* 땀방울 — 대기 중 */}
      {state === "blocked" && <path d="M21.5 6 Q22.6 7.8 21.5 8.4 Q20.4 7.8 21.5 6 Z" fill="#7CC4F0" />}
    </svg>
  );
}

/** 문서 한 장 = 직원 한 명. 상태에 따라 자리·색·동작이 바뀐다. */
export function Worker({ d, color, walking = false }: { d: FactoryDoc; color: string; walking?: boolean }) {
  const st = STATE[d.state];
  const body = d.state === "todo" ? "var(--border-strong)" : d.state === "done" ? "var(--success)" : d.state === "blocked" ? "var(--warning)" : color;
  return (
    <Link
      to={`/doc/${d.id}`}
      title={`${d.title} — ${st.label}${d.why ? ` (${d.why})` : ""} · ${pct(d.progress)}`}
      aria-label={`${d.title}, ${st.label}, ${pct(d.progress)}`}
      className="relative inline-flex flex-col items-center shrink-0"
      style={{ width: 34, animation: d.state === "blocked" ? "factory-bob 1.6s ease-in-out infinite" : undefined }}
    >
      {d.state === "writing" && (
        <span aria-hidden className="absolute flex" style={{ top: -9, gap: 2 }}>
          {[0, 1, 2].map((i) => <span key={i} className="rounded-full" style={{ width: 3, height: 3, background: color, animation: `factory-dot 1.2s ${i * 0.15}s infinite` }} />)}
        </span>
      )}
      <Avatar seed={d.id} state={d.state} shirt={body} />
      {d.state === "done" && (
        <span aria-hidden className="absolute inline-grid place-items-center rounded-full" style={{ top: -4, right: 0, width: 13, height: 13, background: "var(--success)", color: "var(--text-on-color)" }}>
          <Check size={9} strokeWidth={3.5} />
        </span>
      )}
      {d.state === "blocked" && (
        <span aria-hidden className="absolute inline-grid place-items-center rounded-full font-extrabold" style={{ top: -4, right: 0, width: 13, height: 13, fontSize: 9, background: "var(--warning)", color: "var(--text-on-color)" }}>!</span>
      )}
      {walking ? (
        // 걷는 다리 — 3D 보기에서 돌아다닐 때
        <span aria-hidden className="flex" style={{ gap: 5, marginTop: -2, height: 7 }}>
          <span className="factory-leg" style={{ width: 4, height: 7, borderRadius: 2, background: "#3B3F4A", transformOrigin: "50% 0" }} />
          <span className="factory-leg factory-leg-r" style={{ width: 4, height: 7, borderRadius: 2, background: "#3B3F4A", transformOrigin: "50% 0" }} />
        </span>
      ) : (
        /* 책상 */
        <span aria-hidden style={{ width: 32, height: 4, marginTop: 1, borderRadius: 2, background: d.state === "blocked" ? "transparent" : "var(--room-desk, var(--border))" }} />
      )}
    </Link>
  );
}

/** 층을 골랐을 때 보이는 문서·할 일 목록 (2D·3D 공용). */
export function FloorDetail({ f }: { f: FactoryFloor }) {
  return (
    <div className="grid" style={{ gap: "var(--s-4)", padding: "var(--s-4)", background: "var(--surface)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", borderTop: "1px dashed var(--border)" }}>
      {f.tasks.length > 0 && (
        <div>
          <p className="font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--warning)", marginBottom: 4 }}>사람이 할 일 {f.tasks.length}</p>
          <ul className="flex flex-col" style={{ gap: 4 }}>
            {f.tasks.map((t) => (
              <li key={t.id}>
                <Link to={t.to} className="block rounded-[var(--r-sm)] hover:bg-bg" style={{ padding: "4px 8px" }}>
                  <span className="block font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{t.title}</span>
                  <span className="block text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{t.why}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {f.docs.length > 0 && (
        <div>
          <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 4 }}>문서 {f.docs.length} — {f.desc}</p>
          <ul className="flex flex-col" style={{ gap: 2 }}>
            {f.docs.map((d) => (
              <li key={d.id}>
                <Link to={`/doc/${d.id}`} className="grid items-center rounded-[var(--r-sm)] hover:bg-bg" style={{ gridTemplateColumns: "minmax(0,1fr) auto 44px", gap: 8, padding: "4px 8px" }}>
                  <span className="min-w-0">
                    <span className="block text-text" style={{ fontSize: "var(--t-sm)" }}>{d.title}</span>
                    {d.why && <span className="block" style={{ fontSize: "var(--t-xs)", color: "var(--warning)" }}>{d.why}</span>}
                  </span>
                  <span className="font-bold" style={{ fontSize: "var(--t-xs)", color: STATE[d.state].color }}>{STATE[d.state].label}</span>
                  <span className="text-right text-text-muted" style={{ fontSize: "var(--t-xs)", fontVariantNumeric: "tabular-nums" }}>{pct(d.progress)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
