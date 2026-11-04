import { useCallback, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { StorageNote } from "../StorageNote";
import { AutoSteps } from "./AutoSteps";
import { AssumptionBanner, fieldHref } from "./AutoUi";
import { SpecField } from "./SpecField";
import { Minimi } from "./factoryArt";
import { marketSections } from "../../data/spec/fields";
import { getAt } from "../../data/spec/validate";
import type { Competitor } from "../../data/spec/types";
import { setSpecField, useSpec, useWorkingSpec } from "../../hooks/useSpecStore";
import { classify } from "../../lib/rules/classify";
import { buildRoadmap, schedule } from "../../lib/roadmap";
import { planStudies } from "../../lib/planner";
import { classifyKr } from "../../lib/kr";
import { classifyUs } from "../../lib/us";
import { marketCheck } from "../../lib/market";
import { MOOD_META } from "../../lib/difficulty";

const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" } as const;
const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
const EMPTY: Competitor = { name: "", company: "", price: null, cert: "", diff: "", source: "" };

function Competitors({ rows }: { rows: Competitor[] }) {
  const set = (next: Competitor[]) => setSpecField("market.competitors", next);
  const up = (i: number, patch: Partial<Competitor>) => set(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const cell = { border: "1.5px solid var(--border)", background: "var(--bg)", padding: "6px 8px", minHeight: 40, fontSize: "var(--t-xs)", width: "100%" } as const;
  const cols: { k: keyof Competitor; label: string; w: number; num?: boolean }[] = [
    { k: "name", label: "제품", w: 150 }, { k: "company", label: "회사", w: 110 }, { k: "price", label: "가격", w: 90, num: true },
    { k: "cert", label: "인증 (CE·식약처·FDA)", w: 140 }, { k: "diff", label: "특징·차별점", w: 180 }, { k: "source", label: "출처", w: 160 },
  ];
  return (
    <div id="field-market.competitors" className="flex flex-col" style={{ gap: "var(--s-3)" }}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 6, minWidth: 860 }}>
          <thead><tr>{cols.map((c) => <th key={c.k} className="text-left font-bold text-text-muted" style={{ fontSize: 11, width: c.w }}>{c.label}</th>)}<th aria-label="삭제" /></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c.k}>
                    <input aria-label={`${i + 1}번 ${c.label}`} type={c.num ? "number" : "text"} min={c.num ? 0 : undefined} className="rounded-[var(--r-sm)] text-text" style={cell}
                      value={c.num ? (r.price ?? "") : (r[c.k] as string)}
                      onChange={(e) => up(i, c.num ? { price: e.target.value === "" ? null : Number(e.target.value) } : { [c.k]: e.target.value })} />
                  </td>
                ))}
                <td><button type="button" aria-label={`${r.name || `${i + 1}번`} 삭제`} onClick={() => set(rows.filter((_, j) => j !== i))} className="inline-grid place-items-center rounded-[var(--r-sm)] hover:bg-surface" style={{ width: 40, height: 40, color: "var(--text-subtle)" }}><Trash2 size={16} aria-hidden /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>아직 적은 경쟁 제품이 없어요. 비슷한 자가검사 제품을 찾아 이름·가격·인증을 넣어 주세요.</p>}
      <button type="button" onClick={() => set([...rows, { ...EMPTY }])} className="inline-flex items-center gap-1 self-start rounded-[var(--r-md)] font-semibold" style={{ minHeight: 40, padding: "6px 14px", fontSize: "var(--t-sm)", border: "1px solid var(--border-strong)", color: "var(--text)" }}>
        <Plus size={15} aria-hidden /> 경쟁 제품 추가
      </button>
    </div>
  );
}

/** /auto/market — "어때? 잘 팔릴 거 같아?" 시장성 점검. 판매 예측이 아니라 규제·출시 준비도와 입력한 시장 근거를 보여 준다. */
export function MarketPage() {
  const raw = useSpec();
  const { spec, assumed, assumeOn } = useWorkingSpec();
  const cls = useMemo(() => classify(spec), [spec]);
  const check = useMemo(() => {
    const plan = schedule(buildRoadmap(spec, cls), spec.plan.startDate, spec.plan.launchDate);
    return marketCheck(spec, cls, plan, planStudies(spec), classifyKr(spec), classifyUs(spec));
  }, [spec, cls]);
  const onField = useCallback((path: string, v: unknown) => setSpecField(path, v), []);
  const mood = MOOD_META[check.mood];
  const cur = raw.market.currency ?? "";

  const { hash } = useLocation();
  useEffect(() => {
    if (!hash.startsWith("#field-")) { requestAnimationFrame(() => window.scrollTo(0, 0)); return; }
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    el?.scrollIntoView({ block: "center" });
    el?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
  }, [hash]);

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="시장성" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/market" />
          <AssumptionBanner assumed={assumed} assumeOn={assumeOn} />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>어때? 잘 팔릴 거 같아?</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            판매량을 예측하는 화면이 아니에요. 등급·인증 기간·꼭 해야 할 실험으로 <b className="text-text">인증·출시 준비가 얼마나 됐는지</b> 봐요. 시장 규모·경쟁·가격은 직접 넣은 근거로만 판단해요.
          </p>
        </header>

        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          {/* ① 답변 */}
          <section className="rounded-[var(--r-lg)] border" aria-labelledby="mk-answer" style={{ ...card, borderColor: mood.color, background: `color-mix(in srgb, ${mood.color} 5%, var(--bg))` }}>
            <div className="flex flex-wrap items-center" style={{ gap: "var(--s-4)" }}>
              <span className="inline-grid place-items-center rounded-full shrink-0" style={{ width: 84, height: 84, background: `color-mix(in srgb, ${mood.color} 14%, var(--bg))`, border: `2px solid ${mood.color}`, overflow: "hidden" }}>
                <span className={check.mood === "scream" ? "mood-shake" : undefined} style={{ transform: "scale(2.2) translateY(5px)" }}>
                  <Minimi seed={spec.identity.productName ?? "market"} state="todo" shirt={mood.color} walking={false} mood={check.mood} />
                </span>
              </span>
              <div className="min-w-0" style={{ flex: "1 1 280px" }}>
                <h2 id="mk-answer" className="font-extrabold" style={{ fontSize: "var(--t-lg)", color: mood.color }}>{mood.label === "쉬움" ? "괜찮은 출발이에요" : mood.label === "보통" ? "해볼 만해요" : mood.label === "어려움" ? "쉽지 않아요" : "각오가 필요해요"}</h2>
                <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", marginTop: 4 }}>{check.headline}</p>
                <p className="text-text-subtle" style={{ fontSize: 11, marginTop: 6 }}>판매 예측이 아니에요 · 시장 근거 {check.evidence.filled}/{check.evidence.total}개 입력 · 인증 판정은 RA 검토 전 참고용이에요</p>
              </div>
            </div>
            <ul className="grid" style={{ gap: "var(--s-3)", marginTop: "var(--s-5)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
              {check.dims.map((d) => (
                <li key={d.id} className="rounded-[var(--r-md)] border" style={{ borderColor: "var(--border)", padding: "12px 14px", background: "var(--bg)" }} data-dim={d.id}>
                  <div className="flex items-baseline justify-between" style={{ gap: 8 }}>
                    <b className="text-text" style={{ fontSize: "var(--t-sm)" }}>{d.label}</b>
                    <span className="font-bold" style={{ fontSize: "var(--t-xs)", color: d.score === null ? "var(--warning)" : "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{d.score === null ? "입력해 주세요" : `${d.score} / 5`}</span>
                  </div>
                  <span className="flex" style={{ gap: 3, margin: "6px 0" }} aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => <span key={n} className="flex-1 rounded-full" style={{ height: 6, background: d.score !== null && n <= d.score ? (d.score >= 4 ? "var(--success)" : d.score === 3 ? "var(--warning)" : "var(--danger)") : "var(--border)" }} />)}
                  </span>
                  <p className="font-semibold text-text" style={{ fontSize: "var(--t-xs)" }}>{d.summary}</p>
                  <ul style={{ marginTop: 4 }}>{d.reasons.map((r) => <li key={r} className="text-text-muted" style={{ fontSize: 11, lineHeight: "var(--lh-base)" }}>· {r}</li>)}</ul>
                  {d.needs.length > 0 && <p style={{ marginTop: 4 }}>{d.needs.map((p) => <Link key={p} to={fieldHref(p)} className="inline-flex items-center font-semibold underline decoration-dotted" style={{ fontSize: 11, color: "var(--info)", minHeight: 28, marginRight: 8 }}>입력하기 →</Link>)}</p>}
                </li>
              ))}
            </ul>
          </section>

          {/* ② 시장 규모 · SOM */}
          {marketSections.map((sec, si) => (
            <section key={sec.id} className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby={`mk-${sec.id}`}>
              <h2 id={`mk-${sec.id}`} className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>{sec.title}</h2>
              <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "2px 0 var(--s-4)" }}>{sec.desc}</p>
              <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
                {sec.fields.map((f) => (
                  <div key={f.path} style={{ gridColumn: f.kind === "multi" || f.kind === "textarea" || f.path.endsWith("Source") ? "1 / -1" : undefined }}>
                    <SpecField def={f} value={getAt(raw, f.path)} onChange={(v) => onField(f.path, v)} />
                  </div>
                ))}
              </div>
              {si === 0 && (
                <div className="rounded-[var(--r-md)]" role="status" style={{ marginTop: "var(--s-4)", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "var(--t-sm)" }}>
                  {check.som ? (
                    <>
                      <b className="text-text">수익 가능 시장(SOM) {fmt(check.som.value)} 백만 {check.som.currency}</b>
                      <span className="text-text-muted"> = 목표 시장 {fmt(raw.market.sam!)} × 점유율 {raw.market.sharePct}%</span>
                      {check.som.units !== null && <span className="block text-text-muted">→ 목표 가격 {fmt(raw.market.price!)} {cur} 기준 연간 약 {fmt(check.som.units)}개 — 넣은 값으로 한 계산일 뿐, 판매 예측이 아니에요.</span>}
                    </>
                  ) : <span className="text-text-muted">목표 시장(SAM)과 목표 점유율을 넣으면 SOM과 판매 수량을 계산해 줘요.</span>}
                </div>
              )}
            </section>
          ))}

          {/* ③ 경쟁 제품 */}
          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="mk-comp">
            <h2 id="mk-comp" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>경쟁 제품</h2>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "2px 0 var(--s-4)" }}>가격은 위에서 고른 통화로 넣어 주세요({cur || "통화를 아직 안 고름"}). 출처도 같이 적어 두면 나중에 검토하기 쉬워요.</p>
            <Competitors rows={raw.market.competitors} />
          </section>

          {/* ④ 근거가 빈 칸 */}
          {check.gaps.length > 0 && (
            <section className="rounded-[var(--r-lg)]" aria-label="근거가 비어 있는 칸" style={{ padding: "var(--s-4) var(--s-5)", background: "var(--warning-bg)" }}>
              <b style={{ fontSize: "var(--t-sm)", color: "var(--warning)" }}>시장 근거가 비어 있는 칸 {check.gaps.length}개</b>
              <p className="flex flex-wrap" style={{ gap: "4px 12px", marginTop: 4 }}>
                {check.gaps.map((g) => <Link key={g.path} to={fieldHref(g.path)} className="inline-flex items-center font-semibold underline decoration-dotted text-text" style={{ fontSize: "var(--t-sm)", minHeight: 40 }}>{g.label}</Link>)}
              </p>
            </section>
          )}

          <StorageNote />
          <Link to="/auto/start" className="inline-flex items-center gap-1 self-start font-bold hover:underline" style={{ fontSize: "var(--t-sm)", color: "var(--accent)", minHeight: 40 }}>
            ← 제품 기획으로 돌아가기
          </Link>
          <Link to="/auto/overview" className="flex items-center justify-between rounded-[var(--r-lg)] font-bold self-end" style={{ padding: "var(--s-4) var(--s-6)", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)", gap: "var(--s-4)" }}>
            다음: 문서 자동작성 (결과 한눈에) <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </main>
    </div>
  );
}
