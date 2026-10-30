import { Link } from "react-router-dom";

const STEPS = [
  { to: "/auto", label: "제품 스펙" },
  { to: "/auto/overview", label: "결과 한눈에" },
  { to: "/auto/docs", label: "분류·문서 세트" },
  { to: "/auto/kr", label: "한국(MFDS)" },
  { to: "/auto/us", label: "미국(FDA)" },
  { to: "/auto/transport", label: "운송·포장" },
  { to: "/auto/plan", label: "실험계획" },
  { to: "/auto/results", label: "결과 입력" },
  { to: "/auto/factory", label: "문서 공장" },
] as const;

/** 자동작성 단계 탭. */
export function AutoSteps({ current }: { current: (typeof STEPS)[number]["to"] }) {
  return (
    <nav aria-label="자동작성 단계" className="flex flex-wrap items-center" style={{ gap: 6 }}>
      {STEPS.map((s, i) => {
        const active = s.to === current;
        const base = {
          fontSize: "var(--t-xs)",
          padding: "5px 12px",
          minHeight: 32,
          borderRadius: "var(--r-full)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 700,
        } as const;
        const num = (
          <span
            aria-hidden
            className="inline-grid place-items-center rounded-full"
            style={{ width: 18, height: 18, fontSize: 11, background: active ? "var(--text-on-color)" : "var(--surface-2)", color: active ? "var(--accent)" : "var(--text-muted)" }}
          >
            {i + 1}
          </span>
        );
        return (
          <Link
            key={s.label}
            to={s.to}
            aria-current={active ? "page" : undefined}
            style={{ ...base, background: active ? "var(--accent)" : "var(--bg)", color: active ? "var(--text-on-color)" : "var(--text)", border: active ? "none" : "1px solid var(--border-strong)" }}
          >
            {num}
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
