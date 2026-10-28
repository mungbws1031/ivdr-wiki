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

// ── 캐릭터 — 동물 얼굴 직원 ───────────────────────────────
/** 문서 id로 정해지는 고정 난수 — 새로고침해도 같은 얼굴. */
export function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}


type Species = "bear" | "cat" | "rabbit" | "dog" | "fox" | "panda";
const SPECIES: Species[] = ["bear", "cat", "rabbit", "dog", "fox", "panda"];
const FUR: Record<Species, string[]> = {
  bear: ["#A67B5B", "#8C6239", "#C49A6C"],
  cat: ["#F2B36B", "#B8B8C2", "#F4EDE4", "#3F3D45"],
  rabbit: ["#F6F2EE", "#E8D9CC", "#CFC6C0"],
  dog: ["#D9A066", "#F1E1C8", "#B07A4A"],
  fox: ["#E8833A", "#D96A2B"],
  panda: ["#F7F7F5"],
};

/** 동물 머리 (머리 중심 15,9.6) — 귀·털색·주둥이가 종마다 다르다 */
function AnimalHead({ sp, fur }: { sp: Species; fur: string }) {
  const ink = "#3A2C26";
  const pink = "#F7A8B8";
  switch (sp) {
    case "bear":
      return (
        <g>
          <circle cx="9.6" cy="4.4" r="2.7" fill={fur} />
          <circle cx="20.4" cy="4.4" r="2.7" fill={fur} />
          <circle cx="9.6" cy="4.4" r="1.4" fill="#E8CDB0" />
          <circle cx="20.4" cy="4.4" r="1.4" fill="#E8CDB0" />
          <circle cx="15" cy="9.6" r="6.8" fill={fur} />
          <ellipse cx="15" cy="12.3" rx="3.2" ry="2.3" fill="#EBD3B8" />
          <ellipse cx="15" cy="11.2" rx="1.2" ry="0.8" fill={ink} />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M8.6 6.4 L9 0.8 L12.8 4 Z M21.4 6.4 L21 0.8 L17.2 4 Z" fill={fur} />
          <path d="M9.5 5 L9.7 2.4 L11.5 4 Z M20.5 5 L20.3 2.4 L18.5 4 Z" fill={pink} />
          <ellipse cx="15" cy="9.8" rx="7" ry="6.4" fill={fur} />
          <path d="M14.2 11 L15.8 11 L15 11.9 Z" fill={pink} />
          <g stroke={ink} strokeWidth="0.35" opacity="0.6">
            <path d="M8 11.2 L11 11.6 M8 12.6 L11 12.4 M22 11.2 L19 11.6 M22 12.6 L19 12.4" />
          </g>
        </g>
      );
    case "rabbit":
      return (
        <g>
          <ellipse cx="12.2" cy="1.6" rx="1.9" ry="4.6" fill={fur} transform="rotate(-8 12.2 1.6)" />
          <ellipse cx="17.8" cy="1.6" rx="1.9" ry="4.6" fill={fur} transform="rotate(8 17.8 1.6)" />
          <ellipse cx="12.2" cy="1.8" rx="0.9" ry="3.4" fill={pink} transform="rotate(-8 12.2 1.8)" />
          <ellipse cx="17.8" cy="1.8" rx="0.9" ry="3.4" fill={pink} transform="rotate(8 17.8 1.8)" />
          <circle cx="15" cy="9.8" r="6.6" fill={fur} stroke="#E3D8CF" strokeWidth="0.5" />
          <ellipse cx="15" cy="11.3" rx="0.9" ry="0.7" fill={pink} />
        </g>
      );
    case "dog":
      return (
        <g>
          <circle cx="15" cy="9.6" r="6.7" fill={fur} />
          <ellipse cx="8.4" cy="8.4" rx="2.1" ry="4" fill="#8A5A3B" transform="rotate(18 8.4 8.4)" />
          <ellipse cx="21.6" cy="8.4" rx="2.1" ry="4" fill="#8A5A3B" transform="rotate(-18 21.6 8.4)" />
          <ellipse cx="15" cy="12.4" rx="3.3" ry="2.4" fill="#F6E9D6" />
          <ellipse cx="15" cy="11.2" rx="1.3" ry="0.9" fill={ink} />
        </g>
      );
    case "fox":
      return (
        <g>
          <path d="M8.2 7 L8.4 0.6 L13 4 Z M21.8 7 L21.6 0.6 L17 4 Z" fill={fur} />
          <path d="M8.4 2.6 L8.4 0.6 L10 1.8 Z M21.6 2.6 L21.6 0.6 L20 1.8 Z" fill="#3A2C26" />
          <path d="M8 9.4 Q8.4 3 15 3 Q21.6 3 22 9.4 Q21 15.6 15 16.4 Q9 15.6 8 9.4 Z" fill={fur} />
          <path d="M8.6 10.6 Q12 11.4 15 16.2 Q18 11.4 21.4 10.6 Q20.4 15.2 15 16.4 Q9.6 15.2 8.6 10.6 Z" fill="#FFF4E8" />
          <ellipse cx="15" cy="11.6" rx="1" ry="0.7" fill={ink} />
        </g>
      );
    default: // panda
      return (
        <g>
          <circle cx="9.6" cy="4.4" r="2.6" fill="#2E2E33" />
          <circle cx="20.4" cy="4.4" r="2.6" fill="#2E2E33" />
          <circle cx="15" cy="9.6" r="6.8" fill={fur} stroke="#E6E6E2" strokeWidth="0.5" />
          <ellipse cx="12.3" cy="9.6" rx="1.9" ry="2.4" fill="#2E2E33" transform="rotate(20 12.3 9.6)" />
          <ellipse cx="17.7" cy="9.6" rx="1.9" ry="2.4" fill="#2E2E33" transform="rotate(-20 17.7 9.6)" />
          <ellipse cx="15" cy="11.3" rx="1.1" ry="0.75" fill="#2E2E33" />
        </g>
      );
  }
}

/** 동물 얼굴 직원 — 사원증 셔츠·두 다리, 표정은 상태(완료·작성 중·대기·시작 전)에 따라 바뀐다. */
export function Minimi({ seed, state, shirt, walking }: { seed: string; state: DocState; shirt: string; walking: boolean }) {
  const n = seedOf(seed);
  const sp = SPECIES[n % SPECIES.length];
  const furs = FUR[sp];
  const fur = furs[(n >>> 4) % furs.length];
  const panda = sp === "panda";
  const ink = panda ? "#fff" : "#2B2321";
  const line = "#3A2C26";
  const eyes =
    state === "done" ? (
      <g stroke={ink} strokeWidth="0.85" fill="none" strokeLinecap="round">
        <path d="M11.6 9.9 Q12.5 8.9 13.4 9.9" />
        <path d="M16.6 9.9 Q17.5 8.9 18.4 9.9" />
      </g>
    ) : state === "writing" ? (
      <g stroke={ink} strokeWidth="0.85" strokeLinecap="round">
        <path d="M11.7 9.7 L13.3 9.7" />
        <path d="M16.7 9.7 L18.3 9.7" />
      </g>
    ) : (
      <g fill={ink}>
        <circle cx="12.5" cy="9.5" r="1" />
        <circle cx="17.5" cy="9.5" r="1" />
        {!panda && <circle cx="12.8" cy="9.2" r="0.32" fill="#fff" />}
        {!panda && <circle cx="17.8" cy="9.2" r="0.32" fill="#fff" />}
      </g>
    );
  const mouth =
    state === "done" ? <path d="M13.6 13 Q15 14.7 16.4 13 Z" fill="#D9535F" />
    : state === "blocked" ? <path d="M13.8 14 Q15 13.1 16.2 14" stroke={line} strokeWidth="0.65" fill="none" strokeLinecap="round" />
    : <path d="M13.8 12.9 Q14.4 13.6 15 12.9 Q15.6 13.6 16.2 12.9" stroke={line} strokeWidth="0.6" fill="none" strokeLinecap="round" />;
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
      <AnimalHead sp={sp} fur={fur} />
      {eyes}
      <ellipse cx="10.9" cy="12" rx="1.1" ry="0.6" fill="#F59A9A" opacity="0.55" />
      <ellipse cx="19.1" cy="12" rx="1.1" ry="0.6" fill="#F59A9A" opacity="0.55" />
      {mouth}
      {state === "blocked" && <path d="M22 4.6 Q23.2 6.4 22 7.1 Q20.8 6.4 22 4.6 Z" fill="#7CC4F0" />}
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
      <Minimi seed={d.id} state={d.state} shirt={body} walking={walking} />
      {d.state === "done" && (
        <span aria-hidden className="absolute inline-grid place-items-center rounded-full" style={{ top: -4, right: 0, width: 13, height: 13, background: "var(--success)", color: "var(--text-on-color)" }}>
          <Check size={9} strokeWidth={3.5} />
        </span>
      )}
      {d.state === "blocked" && (
        <span aria-hidden className="absolute inline-grid place-items-center rounded-full font-extrabold" style={{ top: -4, right: 0, width: 13, height: 13, fontSize: 9, background: "var(--warning)", color: "var(--text-on-color)" }}>!</span>
      )}
      {/* 책상 (걸을 때는 다리가 보이도록 비움) */}
      {!walking && <span aria-hidden style={{ width: 32, height: 4, marginTop: -2, borderRadius: 2, background: d.state === "blocked" ? "transparent" : "var(--room-desk, var(--border))" }} />}
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
