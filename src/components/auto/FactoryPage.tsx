import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { resolveDoc } from "../../data/documents";
import { completion, specHash, unresolvedFields } from "../../data/spec/validate";
import { useSpec } from "../../hooks/useSpecStore";
import { useResults } from "../../hooks/useResultsStore";
import { useClassConfirm } from "../../hooks/useClassConfirm";
import { hasDraft, useStoreVersion } from "../../hooks/useDraftStore";
import { classify } from "../../lib/rules/classify";
import { evaluateDocSet } from "../../lib/rules/applicability";
import { buildTokenContext, docMissingTokens } from "../../lib/tokens";
import { buildFactory, type DocState, type FactoryDoc, type FactoryFloor } from "../../lib/factory";

const STATE: Record<DocState, { label: string; color: string }> = {
  done: { label: "완료", color: "var(--success)" },
  writing: { label: "작성 중", color: "var(--info)" },
  blocked: { label: "사람 대기", color: "var(--warning)" },
  todo: { label: "시작 전", color: "var(--text-subtle)" },
};

const pct = (v: number) => `${Math.round(v * 100)}%`;

function readStatus(): Record<string, "not_started" | "in_progress" | "done"> {
  try {
    return JSON.parse(localStorage.getItem("cert-progress-ivdr") ?? "{}");
  } catch {
    return {};
  }
}

// ── 캐릭터 ─────────────────────────────────────────────────
const SKIN = ["#F6D7BD", "#EFC39E", "#D9A47A", "#B97E56", "#8D5A3B"];
const HAIR = ["#2B2321", "#5A3A26", "#8A5A35", "#C99A5B", "#3B3F4A", "#A23A2A"];

/** 문서 id로 정해지는 고정 난수 — 새로고침해도 같은 얼굴. */
function seedOf(id: string): number {
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
function Avatar({ seed, state, shirt }: { seed: string; state: DocState; shirt: string }) {
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
function Worker({ d, color }: { d: FactoryDoc; color: string }) {
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
      {/* 책상 */}
      <span aria-hidden style={{ width: 32, height: 4, marginTop: 1, borderRadius: 2, background: d.state === "blocked" ? "transparent" : "var(--room-desk, var(--border))" }} />
    </Link>
  );
}

function Floor({ f, open, onToggle }: { f: FactoryFloor; open: boolean; onToggle: () => void }) {
  const desks = f.docs.filter((d) => d.state !== "blocked");
  const queue = f.docs.filter((d) => d.state === "blocked");
  return (
    <div style={{ borderTop: "3px solid var(--border-strong)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full grid items-stretch text-left"
        style={{ gridTemplateColumns: "minmax(78px, 110px) minmax(0,1fr)", background: open ? "var(--surface)" : "var(--bg)" }}
      >
        <span className="flex flex-col justify-center" style={{ padding: "10px 12px", borderRight: "2px solid var(--border)", background: `color-mix(in srgb, ${f.color} 10%, var(--bg))` }}>
          <span className="font-extrabold" style={{ fontSize: "var(--t-lg)", color: f.color, lineHeight: 1 }}>{f.id}</span>
          <span className="font-bold text-text" style={{ fontSize: "var(--t-xs)", marginTop: 4 }}>{f.name}</span>
          <span className="font-bold" style={{ fontSize: "var(--t-xs)", color: f.color, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{pct(f.progress)}</span>
          <span className="rounded-full overflow-hidden" style={{ height: 4, background: "var(--border)", marginTop: 3 }}>
            <span className="block h-full" style={{ width: pct(f.progress), background: f.color }} />
          </span>
        </span>
        <span className="flex flex-wrap items-end min-w-0" style={{ padding: "16px 12px 8px", gap: "14px 6px", minHeight: 76, backgroundImage: "linear-gradient(to top, var(--surface-2) 0, var(--surface-2) 6px, transparent 6px)" }}>
          {desks.map((d) => <Worker key={d.id} d={d} color={f.color} />)}
          {f.docs.length === 0 && f.tasks.length === 0 && <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>할 일 없음</span>}
          {(queue.length > 0 || f.tasks.length > 0) && (
            <span className="ml-auto flex flex-wrap items-end rounded-[var(--r-sm)]" style={{ gap: "10px 4px", padding: "4px 8px", maxWidth: "100%", background: "var(--warning-bg)", border: "1px dashed var(--warning)" }}>
              <span className="font-bold" style={{ fontSize: 11, color: "var(--warning)", alignSelf: "center", marginRight: 2, whiteSpace: "nowrap" }}>
                대기줄 {queue.length + f.tasks.length}
              </span>
              {queue.slice(0, 6).map((d) => <Worker key={d.id} d={d} color={f.color} />)}
              {f.tasks.slice(0, Math.max(0, 6 - queue.length)).map((t) => (
                <span key={t.id} title={`${t.title} — ${t.why}`} className="inline-grid place-items-center rounded-[4px] font-extrabold" style={{ width: 22, height: 28, background: "var(--bg)", border: "1.5px solid var(--warning)", color: "var(--warning)", fontSize: 11 }}>✋</span>
              ))}
              {queue.length + f.tasks.length > 6 && <span className="font-bold" style={{ fontSize: 11, color: "var(--warning)", alignSelf: "center" }}>+{queue.length + f.tasks.length - 6}</span>}
            </span>
          )}
        </span>
      </button>
      {open && (
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
      )}
    </div>
  );
}

/** /auto/factory — 문서 공장 건물: 층(부서)마다 문서가 일하는 모습과 진행률. */
export function FactoryPage() {
  useStoreVersion(); // 초안이 바뀌면 다시 계산
  const spec = useSpec();
  const results = useResults();
  const confirm = useClassConfirm();
  const [open, setOpen] = useState<string | null>(null);
  const { filled } = completion(spec);
  const cls = useMemo(() => classify(spec), [spec]);
  const docSet = useMemo(() => evaluateDocSet(spec, cls), [spec, cls]);
  const ctx = useMemo(() => buildTokenContext(spec, cls, results), [spec, cls, results]);
  const status = readStatus();
  const factory = buildFactory({
    spec, cls, docSet, results,
    classConfirmed: !!confirm && confirm.specHash === specHash(spec) && confirm.value === cls.value,
    status: (id) => status[id] ?? "not_started",
    sections: (id) => {
      const d = resolveDoc(id);
      if (!d) return [0, 0];
      return [d.sections.filter((_, i) => hasDraft(id, i)).length, d.sections.length];
    },
    missingSpec: (id) => {
      const d = resolveDoc(id);
      return d ? docMissingTokens(d, ctx).length : 0;
    },
    specMissingCount: unresolvedFields(spec).length,
  });
  const o = factory.overall;
  const counts = factory.floors.flatMap((f) => f.docs).reduce((m, d) => ({ ...m, [d.state]: (m[d.state] ?? 0) + 1 }), {} as Partial<Record<DocState, number>>);

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="문서 공장" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/factory" />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>IVDR 문서 공장</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            문서 한 장이 직원 한 명입니다. 층은 부서이고, 사람의 결정·입력이 필요한 문서는 대기줄에 서 있습니다. 직원을 누르면 그 문서가 열리고, 층을 누르면 그 층의 할 일이 펼쳐집니다.
          </p>
        </header>

        {filled === 0 ? (
          <div className="rounded-[var(--r-lg)] border text-center" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-12) var(--s-6)" }}>
            <p className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>아직 공장이 쉬고 있습니다</p>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)" }}>제품 스펙을 넣으면 필요한 문서들이 각 층에 출근합니다.</p>
            <Link to="/auto" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ marginTop: "var(--s-4)", padding: "10px 18px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
              제품 스펙 입력하기 <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="mx-auto" style={{ maxWidth: 980 }}>
            {/* 지붕 + 간판 + 전체 진행률 */}
            <div aria-hidden style={{ height: 22, margin: "0 6%", background: "var(--border-strong)", clipPath: "polygon(4% 100%, 50% 0, 96% 100%)" }} />
            <div className="rounded-t-[var(--r-md)] flex flex-wrap items-center" style={{ gap: "var(--s-4)", padding: "var(--s-4) var(--s-6)", background: "var(--text)", color: "var(--bg)" }} role="status">
              <span className="font-extrabold" style={{ fontSize: "var(--t-lg)", letterSpacing: "var(--ls-snug)" }}>IVDR 문서 공장</span>
              <span className="flex-1 flex items-center" style={{ gap: "var(--s-3)", minWidth: 220 }}>
                <span className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: "color-mix(in srgb, var(--bg) 25%, transparent)" }}>
                  <span className="block h-full rounded-full" style={{ width: pct(o.progress), background: "var(--success)", transition: "width .4s" }} />
                </span>
                <span className="font-extrabold" style={{ fontSize: "var(--t-xl)", fontVariantNumeric: "tabular-nums" }}>{pct(o.progress)}</span>
              </span>
              <span style={{ fontSize: "var(--t-sm)", fontVariantNumeric: "tabular-nums" }}>완료 {o.done}/{o.total} · 사람 대기 {o.tasks + (counts.blocked ?? 0)}</span>
            </div>

            <div className="border-x-[3px]" style={{ borderColor: "var(--border-strong)" }}>
              {factory.floors.map((f) => <Floor key={f.id} f={f} open={open === f.id} onToggle={() => setOpen((x) => (x === f.id ? null : f.id))} />)}
            </div>
            {/* 땅 */}
            <div aria-hidden style={{ height: 10, background: "var(--border-strong)", borderRadius: "0 0 6px 6px", margin: "0 -8px" }} />

            <div className="flex flex-wrap items-center justify-between" style={{ gap: "var(--s-3)", marginTop: "var(--s-4)" }}>
              <div className="flex flex-wrap" style={{ gap: "var(--s-3)", fontSize: "var(--t-xs)" }}>
                {(Object.keys(STATE) as DocState[]).map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <span className="rounded-full" style={{ width: 10, height: 10, background: STATE[k].color }} />
                    <span className="text-text">{STATE[k].label} {counts[k] ?? 0}</span>
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5 text-text">✋ 사람이 할 일 {o.tasks}</span>
              </div>
              <Link to="/auto/overview" className="inline-flex items-center gap-1 font-bold hover:underline" style={{ fontSize: "var(--t-sm)", color: "var(--accent)" }}>
                결과 한눈에 보기 <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginTop: "var(--s-3)" }}>
              진행률 = 문서마다 (완료면 100%, 아니면 직접 쓴 섹션 비율)의 평균. 문서 화면에서 상태를 "완료"로 바꾸면 완료로 셉니다. 이 제품에 불필요한 문서는 출근하지 않습니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
