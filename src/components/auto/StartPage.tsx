import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { AssumptionBanner } from "./AutoUi";
import { ConceptBox } from "./ConceptBox";
import { ConceptSketch } from "./ConceptSketch";
import { SpecField } from "./SpecField";
import { fieldByPath } from "../../data/spec/fields";
import { getAt } from "../../data/spec/validate";
import { setSpecField, useWorkingSpec } from "../../hooks/useSpecStore";
import { classify } from "../../lib/rules/classify";
import { certRoutes } from "../../lib/rules/certRoutes";
import { addMonths, buildRoadmap, LANE_LABEL, schedule, type Lane, type Scheduled } from "../../lib/roadmap";

const LANE_COLOR: Record<Lane, string> = {
  dev: "var(--p1, #6366f1)", verify: "var(--p2, #0ea5e9)", quality: "var(--p3, #10b981)", eu: "var(--accent)", kr: "var(--p4, #f59e0b)", us: "var(--p5, #8b5cf6)", prod: "var(--text-muted)",
};
const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" } as const;
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function DateInput({ path, label }: { path: string; label: string }) {
  const { raw } = useWorkingSpec();
  const v = (getAt(raw, path) as string | null) ?? "";
  return (
    <label className="flex flex-col" style={{ gap: 4, fontSize: "var(--t-sm)" }}>
      <span className="font-semibold text-text">{label}</span>
      <input type="date" value={v} onChange={(e) => setSpecField(path, e.target.value || null)} className="rounded-[var(--r-sm)] text-text"
        style={{ border: "1.5px solid var(--border)", background: "var(--bg)", padding: "8px 12px", minHeight: 40 }} />
    </label>
  );
}

function DurationInput({ it }: { it: Scheduled }) {
  const { raw } = useWorkingSpec();
  const set = (v: string) => {
    const cur = { ...(raw.plan?.durations ?? {}) };
    const n = Number(v);
    if (v === "" || !Number.isFinite(n) || n < 0) delete cur[it.id];
    else cur[it.id] = n;
    setSpecField("plan.durations", Object.keys(cur).length ? cur : null);
  };
  return (
    <input type="number" min={0} step={0.5} defaultValue={it.overridden ? it.min : ""} placeholder={it.min === it.max ? fmt(it.min) : `${fmt(it.min)}~${fmt(it.max)}`}
      onBlur={(e) => set(e.target.value)} aria-label={`${it.title} 기간(개월) 직접 입력`} className="rounded-[var(--r-sm)] text-text"
      style={{ width: 72, border: `1.5px solid ${it.overridden ? "var(--accent)" : "var(--border)"}`, background: "var(--bg)", padding: "4px 6px", fontSize: "var(--t-xs)" }} />
  );
}

/** /auto/start — 제품 기획: 컨셉 → 필요한 인증 → 기간·일정 로드맵 → 개념 스케치. */
export function StartPage() {
  const { spec, raw, assumed, assumeOn } = useWorkingSpec();
  const cls = useMemo(() => classify(spec), [spec]);
  const routes = useMemo(() => certRoutes(spec, cls), [spec, cls]);
  const plan = useMemo(() => schedule(buildRoadmap(spec, cls), raw.plan?.startDate ?? null, raw.plan?.launchDate ?? null), [spec, cls, raw]);
  const start = raw.plan?.startDate ?? null;
  const at = (m: number) => (start ? addMonths(start, m) : `+${fmt(m)}개월`);
  const span = Math.max(plan.launchMax, plan.available ?? 0, ...plan.items.map((i) => i.endMax)) + 1;
  const pos = (m: number) => `${(m / span) * 100}%`;
  const lanes = [...new Set(plan.items.map((i) => i.lane))];
  const rows = plan.items.filter((i) => i.id !== "launch");

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="제품 기획" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/start" />
          <AssumptionBanner assumed={assumed} assumeOn={assumeOn} />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>제품 기획</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            개발 전에 컨셉 한 줄만 적으세요. 어떤 인증이 필요한지, 얼마나 걸리는지, 판매하려면 언제까지 무엇을 시작해야 하는지 계산하고 개념 스케치를 그립니다. 여기서 정한 제품 정보로 문서가 개발과 함께 써집니다.
          </p>
        </header>

        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          <ConceptBox />

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="plan-in-title">
            <h2 id="plan-in-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginBottom: "var(--s-3)" }}>어디서 팔고, 언제까지</h2>
            <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
              {["markets", "qmsCerts"].map((p) => { const f = fieldByPath(p)!; return <div key={p}><SpecField def={f} value={getAt(raw, p)} onChange={(v) => setSpecField(p, v)} /></div>; })}
              <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
                <DateInput path="plan.startDate" label="개발 시작일" />
                <DateInput path="plan.launchDate" label="목표 판매일" />
              </div>
            </div>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="plan-cert-title">
            <h2 id="plan-cert-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>필요한 인증</h2>
            {routes.length === 0 ? <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>위에서 판매할 곳(인증)을 고르세요.</p> : (
              <ul className="flex flex-col" style={{ gap: 6, marginTop: "var(--s-3)" }}>
                {routes.map((r) => (
                  <li key={r.market} className="flex flex-wrap items-baseline" style={{ gap: 8, fontSize: "var(--t-sm)" }}>
                    <b className="text-text">{r.name}</b>
                    <span className="text-text-muted">{r.headline}</span>
                    {r.links[0] && <Link to={r.links[0].to} className="font-semibold hover:underline" style={{ color: "var(--info)", fontSize: "var(--t-xs)" }}>{r.links[0].label} →</Link>}
                  </li>
                ))}
                {(spec.qmsCerts ?? []).length === 0 && <li className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>품질 인증(ISO 13485·KGMP)을 아직 갖고 있지 않으면 로드맵에 준비 기간이 들어갑니다.</li>}
              </ul>
            )}
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="plan-road-title">
            <div className="flex flex-wrap items-baseline justify-between" style={{ gap: "var(--s-3)" }}>
              <h2 id="plan-road-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>인증 일정 로드맵</h2>
              <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>출시 가능: {at(plan.launchMin)} ~ {at(plan.launchMax)}</span>
            </div>
            {plan.verdict !== "unknown" && (
              <p role="status" data-verdict={plan.verdict} className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] font-bold" style={{ marginTop: "var(--s-3)", padding: "8px 12px", fontSize: "var(--t-sm)",
                color: plan.verdict === "ok" ? "var(--success)" : plan.verdict === "tight" ? "var(--warning)" : "var(--danger)",
                background: plan.verdict === "ok" ? "var(--success-bg)" : plan.verdict === "tight" ? "var(--warning-bg)" : "var(--danger-bg)" }}>
                {plan.verdict === "ok" ? <CheckCircle2 size={16} aria-hidden /> : <AlertTriangle size={16} aria-hidden />}
                {plan.verdict === "ok" ? `목표 판매일(${raw.plan?.launchDate})에 맞출 수 있습니다 — 늦은 경우에도 여유가 있습니다.`
                  : plan.verdict === "tight" ? `목표 판매일(${raw.plan?.launchDate})은 빠르게 진행될 때만 가능합니다 — ★ 항목을 먼저 시작하세요.`
                  : `목표 판매일(${raw.plan?.launchDate})보다 최소 ${fmt(plan.shortage)}개월 부족합니다 — 판매일·시장·범위를 조정하세요.`}
              </p>
            )}
            {!start && <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: 6 }}>개발 시작일을 넣으면 날짜로, 목표 판매일을 넣으면 "늦어도 시작"이 계산됩니다.</p>}

            <div className="overflow-x-auto" style={{ marginTop: "var(--s-4)" }}>
              <div style={{ minWidth: 760 }}>
                <div className="grid text-text-subtle" style={{ gridTemplateColumns: "230px 1fr 84px", fontSize: 11, padding: "0 0 4px" }}>
                  <span>항목 · ★ 가장 긴 경로</span>
                  <div className="relative" style={{ height: 14 }}>
                    {Array.from({ length: Math.ceil(span / 6) + 1 }, (_, k) => k * 6).filter((m) => m <= span).map((m) => <span key={m} className="absolute" style={{ left: pos(m), transform: "translateX(-50%)" }}>{m}개월</span>)}
                  </div>
                  <span style={{ textAlign: "right" }}>기간 직접</span>
                </div>
                {lanes.filter((l) => l !== "prod" || rows.some((r) => r.lane === "prod")).map((lane) => (
                  <div key={lane} style={{ borderTop: "1px solid var(--border)", padding: "6px 0" }}>
                    <p className="font-bold" style={{ fontSize: "var(--t-xs)", color: LANE_COLOR[lane], marginBottom: 2 }}>{LANE_LABEL[lane]}</p>
                    {rows.filter((r) => r.lane === lane).map((it) => (
                      <div key={it.id} data-road={it.id} className="grid items-center" style={{ gridTemplateColumns: "230px 1fr 84px", gap: 0, minHeight: 30 }}>
                        <span className="text-text" style={{ fontSize: "var(--t-xs)", lineHeight: 1.3, paddingRight: 8 }} title={`${it.source}${it.latestStart !== null ? ` · 늦어도 시작: ${at(it.latestStart)}` : ""}`}>
                          {it.critical && <b style={{ color: "var(--danger)" }}>★ </b>}{it.title}
                          {it.latestStart !== null && <span className="block" style={{ color: it.latestStart < 0 ? "var(--danger)" : "var(--text-subtle)", fontSize: 10 }}>늦어도 시작 {at(Math.max(it.latestStart, 0))}{it.latestStart < 0 ? " (이미 늦음)" : ""}</span>}
                        </span>
                        <div className="relative" style={{ height: 18, background: "repeating-linear-gradient(90deg, transparent 0 calc(100% / " + span + " - 1px), var(--border) calc(100% / " + span + " - 1px) calc(100% / " + span + "))" }}>
                          <div className="absolute rounded-full" style={{ left: pos(it.startMin), width: `calc(${pos(it.endMax - it.startMin)} )`, top: 4, height: 10, background: LANE_COLOR[lane], opacity: 0.22 }} />
                          <div className="absolute rounded-full" style={{ left: pos(it.startMin), width: pos(Math.max(it.min, 0.3)), top: 4, height: 10, background: LANE_COLOR[lane], outline: it.critical ? "2px solid var(--danger)" : undefined }} />
                        </div>
                        <span style={{ textAlign: "right" }}><DurationInput it={it} /></span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="grid items-center" style={{ gridTemplateColumns: "230px 1fr 84px", borderTop: "1px solid var(--border)", paddingTop: 6 }}>
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-xs)" }}><Clock size={12} className="inline" aria-hidden /> 양산·판매 시작</span>
                  <div className="relative" style={{ height: 22 }}>
                    <div className="absolute" style={{ left: pos(plan.launchMin), width: pos(plan.launchMax - plan.launchMin), top: 6, height: 10, background: "var(--text)", opacity: 0.25, borderRadius: 4 }} />
                    {plan.available !== null && <div className="absolute" title="목표 판매일" style={{ left: pos(plan.available), top: 0, bottom: 0, width: 2, background: "var(--danger)" }} />}
                  </div>
                  <span />
                </div>
              </div>
            </div>
            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)", lineHeight: "var(--lh-base)" }}>
              진한 막대는 가장 빠른 경우, 연한 막대는 늦은 경우까지입니다. 기간은 추정 범위이고 항목 이름에 마우스를 올리면 근거가 보입니다. 회사 계획이나 기관 안내가 있으면 "기간 직접"에 개월 수를 넣으세요. 실시간 안정성은 출시를 막지 않는 것으로 계산했습니다(가속 시험으로 잠정 유효기간 — 기관별 확인 필요).
            </p>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="plan-sketch-title">
            <h2 id="plan-sketch-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginBottom: "var(--s-3)" }}>개념 스케치</h2>
            <ConceptSketch spec={spec} />
            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>제품 형태·판독 방식·검체·앱 여부로 그린 구성도입니다. 실제 디자인 이미지는 AI 서버 연결 후 지원할 예정입니다.</p>
          </section>

          <Link to="/auto/overview" className="flex items-center justify-between rounded-[var(--r-lg)] font-bold self-end" style={{ padding: "var(--s-4) var(--s-6)", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)", gap: "var(--s-4)" }}>
            다음: 문서 자동작성 (결과 한눈에) <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </main>
    </div>
  );
}
