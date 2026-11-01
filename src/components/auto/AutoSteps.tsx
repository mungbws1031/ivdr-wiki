import { Link } from "react-router-dom";
import { useSpec } from "../../hooks/useSpecStore";

type Step = { to: string; label: string; market?: string };
export interface StepGroup { id: string; label: string; steps: Step[] }

const GROUPS: StepGroup[] = [
  { id: "plan", label: "기획", steps: [{ to: "/auto/start", label: "제품 기획" }, { to: "/auto", label: "제품 스펙" }] },
  { id: "judge", label: "판정", steps: [
    { to: "/auto/docs", label: "분류·문서 세트" },
    { to: "/auto/kr", label: "한국(MFDS)", market: "KR" },
    { to: "/auto/us", label: "미국(FDA)", market: "US" },
    { to: "/auto/transport", label: "운송·포장" },
  ] },
  { id: "test", label: "실험", steps: [{ to: "/auto/plan", label: "실험계획" }, { to: "/auto/results", label: "결과 입력" }] },
  { id: "docs", label: "문서", steps: [{ to: "/auto/overview", label: "결과 한눈에" }, { to: "/auto/factory", label: "문서 공장" }] },
];

export type StepPath = "/auto/start" | "/auto" | "/auto/docs" | "/auto/kr" | "/auto/us" | "/auto/transport" | "/auto/plan" | "/auto/results" | "/auto/overview" | "/auto/factory";

/** 4단계 묶음 — 고르지 않은 시장의 국가 탭은 뺀다 (지금 보고 있는 화면이면 남긴다). 순수 함수. */
export function stepGroups(markets: string[] | null, current?: string): StepGroup[] {
  const m = markets ?? [];
  return GROUPS.map((g) => ({ ...g, steps: g.steps.filter((s) => !s.market || m.includes(s.market) || s.to === current) }));
}

/** 자동작성 단계 탭 — 첫 줄은 4단계, 둘째 줄은 현재 단계의 화면. */
export function AutoSteps({ current }: { current: StepPath }) {
  const spec = useSpec();
  const groups = stepGroups(spec.markets, current);
  const active = groups.find((g) => g.steps.some((s) => s.to === current)) ?? groups[0];
  return (
    <nav aria-label="자동작성 단계" className="flex flex-col" style={{ gap: 8 }}>
      <ol className="flex items-center overflow-x-auto" style={{ gap: 6, scrollbarWidth: "none" }}>
        {groups.map((g, i) => {
          const on = g.id === active.id;
          return (
            <li key={g.id} className="flex items-center shrink-0" style={{ gap: 6 }}>
              {i > 0 && <span aria-hidden className="text-text-subtle" style={{ fontSize: 12 }}>›</span>}
              <Link to={g.steps[0].to} aria-current={on ? "step" : undefined} className="inline-flex items-center rounded-full font-bold"
                style={{ gap: 6, padding: "6px 14px", minHeight: 40, fontSize: "var(--t-sm)", background: on ? "var(--accent)" : "var(--bg)", color: on ? "var(--text-on-color)" : "var(--text)", border: on ? "none" : "1px solid var(--border-strong)" }}>
                <span aria-hidden className="inline-grid place-items-center rounded-full" style={{ width: 20, height: 20, fontSize: 11, background: on ? "var(--text-on-color)" : "var(--surface-2)", color: on ? "var(--accent)" : "var(--text-muted)" }}>{i + 1}</span>
                {g.label}
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center" style={{ gap: 4 }}>
        {active.steps.map((s) => {
          const on = s.to === current;
          return (
            <Link key={s.to} to={s.to} aria-current={on ? "page" : undefined} className="inline-flex items-center rounded-[var(--r-md)] font-semibold"
              style={{ padding: "6px 12px", minHeight: 40, fontSize: "var(--t-xs)", color: on ? "var(--accent)" : "var(--text-muted)", background: on ? "var(--accent-weak)" : "transparent", border: on ? "1px solid var(--accent)" : "1px solid transparent" }}>
              {s.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
