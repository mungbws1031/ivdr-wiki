import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Target } from "lucide-react";
import { goalDone, type Goal } from "../../lib/goals";

/** 목표 체크리스트 — 게임의 '성장 목표'처럼 단계별 진행 막대. 아직 안 끝난 첫 목표를 '지금' 표시. */
export function GoalChecklist({ goals }: { goals: Goal[] }) {
  const [open, setOpen] = useState(true);
  const doneCount = goals.filter(goalDone).length;
  const next = goals.find((g) => !goalDone(g));
  return (
    <section className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--border)", background: "var(--surface)" }} aria-label="목표 체크리스트">
      <button type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open} className="w-full flex items-center text-left" style={{ gap: 10, padding: "12px 16px" }}>
        <Target size={18} style={{ color: "var(--accent)" }} aria-hidden />
        <span className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>목표 체크리스트</span>
        <span className="rounded-full font-bold" style={{ padding: "1px 9px", fontSize: "var(--t-xs)", background: "var(--bg)", border: "1px solid var(--border)", fontVariantNumeric: "tabular-nums" }}>{doneCount} / {goals.length}</span>
        <span className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)", maxWidth: 220 }}>
          <span className="block h-full rounded-full" style={{ width: `${(doneCount / goals.length) * 100}%`, background: "var(--success)", transition: "width .4s" }} />
        </span>
        {next && <span className="truncate text-text-muted" style={{ fontSize: "var(--t-xs)" }}>지금: <b className="text-text">{next.title}</b></span>}
        <ChevronDown size={16} className="ml-auto shrink-0 text-text-subtle" style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .2s" }} aria-hidden />
      </button>
      {open && (
        <ol className="grid" style={{ gap: 8, padding: "0 16px 14px", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))" }}>
          {goals.map((g, i) => {
            const ok = goalDone(g);
            const now = g === next;
            const ratio = g.total > 0 ? Math.min(1, g.done / g.total) : 0;
            return (
              <li key={g.id}>
                <Link to={g.to} className="flex items-start rounded-[var(--r-md)] hover:brightness-[.98]" style={{ gap: 10, padding: "10px 12px", height: "100%", background: "var(--bg)", border: `1.5px solid ${now ? "var(--accent)" : ok ? "color-mix(in srgb, var(--success) 45%, var(--border))" : "var(--border)"}` }}>
                  <span className="inline-grid place-items-center rounded-[6px] shrink-0" style={{ width: 20, height: 20, marginTop: 1, background: ok ? "var(--success)" : "var(--bg)", border: ok ? "none" : "1.5px solid var(--border-strong)", color: "#fff" }}>
                    {ok ? <Check size={13} strokeWidth={3.5} aria-hidden /> : <span className="text-text-subtle font-bold" style={{ fontSize: 10 }}>{i + 1}</span>}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center" style={{ gap: 6 }}>
                      <span className="font-bold text-text truncate" style={{ fontSize: "var(--t-sm)", textDecoration: ok ? "line-through" : undefined, opacity: ok ? 0.7 : 1 }}>{g.title}</span>
                      {now && <span className="rounded-full font-extrabold shrink-0" style={{ padding: "0 6px", fontSize: 10, background: "var(--accent)", color: "var(--text-on-color)" }}>지금</span>}
                    </span>
                    <span className="block text-text-subtle truncate" style={{ fontSize: "var(--t-xs)" }}>{g.hint}</span>
                    {g.total > 1 && (
                      <span className="flex items-center" style={{ gap: 6, marginTop: 5 }}>
                        <span className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "var(--border)" }}>
                          <span className="block h-full rounded-full" style={{ width: `${ratio * 100}%`, background: ok ? "var(--success)" : "var(--accent)" }} />
                        </span>
                        <span className="font-bold text-text-muted" style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{g.done}/{g.total}</span>
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
