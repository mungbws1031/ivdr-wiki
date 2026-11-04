import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { AssumptionBanner, WikiLink } from "./AutoUi";
import { ConceptBox } from "./ConceptBox";
import { ConceptSketch } from "./ConceptSketch";
import { SpecField } from "./SpecField";
import { fieldByPath, transportFields } from "../../data/spec/fields";
import { StorageNote } from "../StorageNote";
import { WithTerms } from "../Term";
import { completion, getAt, isFilled } from "../../data/spec/validate";
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
      style={{ width: 76, minHeight: 40, border: `1.5px solid ${it.overridden ? "var(--accent)" : "var(--border)"}`, background: "var(--bg)", padding: "4px 6px", fontSize: "var(--t-xs)" }} />
  );
}

/** 입력 현황판 (U-8) — 입력이 세 화면에 흩어져 있으니 한곳에서 상태를 보고 바로 간다. */
function InputStatus() {
  const { raw } = useWorkingSpec();
  const c = completion(raw);
  const dates = [raw.plan?.startDate, raw.plan?.launchDate].filter(Boolean).length;
  const tFilled = transportFields.filter((f) => isFilled(f, raw)).length;
  const items = [
    { label: "제품 정보", n: c.filled, total: c.total, to: "/auto", cta: "제품 정보" },
    { label: "날짜", n: dates, total: 2, to: "#plan-in-title", cta: "아래에서 입력" },
    { label: "운송 정보", n: tFilled, total: transportFields.length, to: "/auto/transport", cta: "운송·포장" },
  ];
  return (
    <section aria-label="입력 현황" className="grid" style={{ gap: "var(--s-3)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
      {items.map((it) => {
        const st = it.n === 0 ? { t: "비어 있음", c: "var(--text-subtle)" } : it.n >= it.total ? { t: "완료", c: "var(--success)" } : { t: "일부만", c: "var(--warning)" };
        const body = (
          <>
            <span className="flex items-center justify-between" style={{ gap: 8 }}>
              <b className="text-text" style={{ fontSize: "var(--t-sm)" }}>{it.label}</b>
              <span className="font-bold" style={{ fontSize: 11, color: st.c }}>{st.t}</span>
            </span>
            <span className="block rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)", margin: "6px 0 4px" }} aria-hidden>
              <span className="block h-full" style={{ width: `${(it.n / Math.max(it.total, 1)) * 100}%`, background: st.c }} />
            </span>
            <span className="flex justify-between text-text-muted" style={{ fontSize: "var(--t-xs)", fontVariantNumeric: "tabular-nums" }}>
              <span>{it.n}/{it.total}</span><span className="font-semibold" style={{ color: "var(--info)" }}>{it.cta} →</span>
            </span>
          </>
        );
        const cls = "block rounded-[var(--r-md)] border hover:bg-surface";
        const sty = { borderColor: "var(--border)", padding: "10px 14px", minHeight: 44 };
        return it.to.startsWith("#")
          ? <a key={it.label} href={it.to} className={cls} style={sty} onClick={(e) => { e.preventDefault(); document.querySelector(it.to)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{body}</a>
          : <Link key={it.label} to={it.to} className={cls} style={sty}>{body}</Link>;
      })}
    </section>
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
          <WikiLink slug="ce-marking" />
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            개발 전에 어떤 제품인지 한 줄만 적어 주세요. 필요한 인증, 걸리는 기간, 판매하려면 언제까지 무엇을 시작해야 하는지 계산하고 개념 스케치를 그려요. 여기서 정한 제품 정보로 문서가 개발과 함께 써져요.
          </p>
        </header>

        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          <ConceptBox />

          <InputStatus />

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="plan-in-title">
            <h2 id="plan-in-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginBottom: "var(--s-3)" }}>어디서 팔고, 언제까지</h2>
            <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))" }}>
              {["markets", "qmsCerts"].map((p) => { const f = fieldByPath(p)!; return <div key={p}><SpecField def={f} value={getAt(raw, p)} onChange={(v) => setSpecField(p, v)} /></div>; })}
              <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
                <DateInput path="plan.startDate" label="개발 시작일" />
                <DateInput path="plan.launchDate" label="목표 판매일" />
              </div>
            </div>
            <Link to="/auto/market" className="inline-flex items-center gap-2 rounded-full font-bold" data-testid="market-cta"
              style={{ marginTop: "var(--s-4)", minHeight: 44, padding: "8px 18px", fontSize: "var(--t-sm)", background: "var(--text)", color: "var(--bg)" }}>
              💬 어때? 잘 팔릴 거 같아? <ArrowRight size={15} aria-hidden />
            </Link>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="plan-cert-title">
            <h2 id="plan-cert-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>필요한 인증</h2>
            {routes.length === 0 ? <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>위에서 팔 곳(인증)을 먼저 골라 주세요.</p> : (
              <ul className="flex flex-col" style={{ gap: 6, marginTop: "var(--s-3)" }}>
                {routes.map((r) => (
                  <li key={r.market} className="flex flex-wrap items-baseline" style={{ gap: 8, fontSize: "var(--t-sm)" }}>
                    <b className="text-text">{r.name}</b>
                    <span className="text-text-muted"><WithTerms text={r.headline} /></span>
                    {r.links[0] && <Link to={r.links[0].to} className="inline-flex items-center font-semibold hover:underline" style={{ color: "var(--info)", fontSize: "var(--t-xs)", minHeight: 40 }}>{r.links[0].label} →</Link>}
                  </li>
                ))}
                {(spec.qmsCerts ?? []).length === 0 && <li className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>품질 인증(ISO 13485·KGMP)이 아직 없으면, 일정에 준비 기간을 넣어 계산해요.</li>}
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
                {plan.verdict === "ok" ? `목표 판매일(${raw.plan?.launchDate})에 맞출 수 있어요. 늦어지더라도 여유가 있어요.`
                  : plan.verdict === "tight" ? `목표 판매일(${raw.plan?.launchDate})은 일이 빨리 풀려야 맞출 수 있어요. ★ 항목부터 시작해 주세요.`
                  : `목표 판매일(${raw.plan?.launchDate})까지 적어도 ${fmt(plan.shortage)}개월이 모자라요. 판매일·시장·범위를 다시 정해 주세요.`}
              </p>
            )}
            {!start && <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: 6 }}>개발 시작일을 넣으면 날짜로 보여 줘요. 목표 판매일을 넣으면 "늦어도 시작"할 날을 계산해요.</p>}

            <div className="overflow-x-auto" style={{ marginTop: "var(--s-4)" }}>
              <div style={{ minWidth: 760 }}>
                <div className="grid text-text-subtle" style={{ gridTemplateColumns: "230px 1fr 84px", fontSize: 11, padding: "0 0 4px" }}>
                  <span>할 일 · ★ 가장 오래 걸리는 줄</span>
                  <div className="relative" style={{ height: 14 }}>
                    {Array.from({ length: Math.ceil(span / 6) + 1 }, (_, k) => k * 6).filter((m) => m <= span).map((m) => <span key={m} className="absolute" style={{ left: pos(m), transform: "translateX(-50%)" }}>{m}개월</span>)}
                  </div>
                  <span style={{ textAlign: "right" }}>기간 직접 입력</span>
                </div>
                {lanes.filter((l) => l !== "prod" || rows.some((r) => r.lane === "prod")).map((lane) => (
                  <div key={lane} style={{ borderTop: "1px solid var(--border)", padding: "6px 0" }}>
                    <p className="font-bold" style={{ fontSize: "var(--t-xs)", color: LANE_COLOR[lane], marginBottom: 2 }}>{LANE_LABEL[lane]}</p>
                    {rows.filter((r) => r.lane === lane).map((it) => (
                      <div key={it.id} data-road={it.id} className="grid items-center" style={{ gridTemplateColumns: "230px 1fr 84px", gap: 0, minHeight: 46 }}>
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
              진한 막대는 가장 빠를 때, 연한 막대는 늦어질 때까지예요. 기간은 어림잡은 범위예요. 할 일 이름에 마우스를 올리면 근거가 보여요. 회사 계획이나 기관 안내가 있으면 "기간 직접 입력"에 개월 수를 넣어 주세요. 실시간 안정성 시험은 출시를 막지 않는다고 보고 계산했어요(가속 시험으로 임시 유효기간을 정함 — 기관별 확인 필요).
            </p>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="plan-sketch-title">
            <h2 id="plan-sketch-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginBottom: "var(--s-3)" }}>개념 스케치</h2>
            <ConceptSketch spec={spec} />
            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>제품 형태·결과 읽는 방식·검체·앱 여부를 보고 그린 개념 스케치예요. 치수·시간은 설계와 시험이 끝난 뒤 정해요. 실제 사진 같은 이미지는 AI 서버를 연결한 뒤에 지원할 예정이에요.</p>
          </section>

          <StorageNote />

          <Link to="/auto/overview" className="flex items-center justify-between rounded-[var(--r-lg)] font-bold self-end" style={{ padding: "var(--s-4) var(--s-6)", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)", gap: "var(--s-4)" }}>
            다음: 문서 자동작성 (결과 한눈에) <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </main>
    </div>
  );
}
