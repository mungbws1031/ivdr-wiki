import { useCallback, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckSquare, FileText, Info, Sparkles, Square } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { SpecField } from "./SpecField";
import { Chip, fieldHref, FieldLink } from "./AutoUi";
import { transportSections } from "../../data/spec/fields";
import { exampleSpec, getAt } from "../../data/spec/validate";
import { getSpec, replaceSpec, setSpecField, useSpec } from "../../hooks/useSpecStore";
import type { ApplStatus } from "../../lib/rules/applicability";
import {
  applicableStandards, hasTransportInput, packagingChecklist, PPWR_SOURCES, transportFacts, transportProcess, transportTestPlan,
} from "../../lib/transport";

const ORDER: ApplStatus[] = ["required", "recommended", "unknown", "optional", "excluded"];

const card = { borderColor: "var(--border)", padding: "var(--s-6)", boxShadow: "var(--shadow-card)" } as const;

function VerifyBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full font-bold shrink-0"
      style={{ fontSize: 11, padding: "1px 8px", color: "var(--warning)", background: "var(--warning-bg)" }}
      title="EUR-Lex 원문 대조 전 — 2차 자료 기준"
    >
      원문 확인 필요
    </span>
  );
}

function SectionTitle({ n, id, title, desc }: { n: string; id: string; title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: "var(--s-4)" }}>
      <div className="flex items-baseline" style={{ gap: "var(--s-2)" }}>
        <span className="font-bold text-text-subtle" style={{ fontSize: "var(--t-xs)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
        <h2 id={id} className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>{title}</h2>
      </div>
      {desc && <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>{desc}</p>}
    </div>
  );
}

/** /auto/transport — 운송·포장: 입력 → 적용 규격 · 포장 설계 · 시험 순서 · 운송 과정. */
export function TransportPage() {
  const spec = useSpec();
  const facts = useMemo(() => transportFacts(spec), [spec]);
  const standards = useMemo(() => [...applicableStandards(spec)].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)), [spec]);
  const packing = useMemo(() => packagingChecklist(spec), [spec]);
  const plan = useMemo(() => transportTestPlan(spec), [spec]);
  const process = useMemo(() => transportProcess(spec), [spec]);
  const started = hasTransportInput(spec);
  const onField = useCallback((path: string, v: unknown) => setSpecField(path, v), []);

  const { hash } = useLocation();
  useEffect(() => {
    if (!hash.startsWith("#field-")) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
  }, [hash]);

  const fillExample = () => replaceSpec({ ...getSpec(), transport: exampleSpec().transport });

  const fromSpec: { label: string; value: string | null; path: string }[] = [
    { label: "보관 온도", value: facts.tempRange, path: "storage.tempMaxC" },
    { label: "멸균", value: facts.sterile === null ? null : facts.sterile ? "멸균" : "비멸균", path: "sterile" },
    { label: "출시 시장", value: spec.markets?.length ? spec.markets.join(", ") : null, path: "markets" },
    { label: "평가 로트 수", value: facts.lots !== null ? `${facts.lots}로트` : null, path: "targets.lots" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="운송·포장" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/transport" />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>운송·포장</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 720 }}>
            어디로, 어떻게, 어떤 박스로 보내는지 입력하면 적용 규정·규격, 포장 설계 체크리스트(EU 포장규정 PPWR 포함), 운송 시험 순서, 실제 운송 과정 관리가 나옵니다.
            1차 지원 범위는 시약 키트를 택배·항공으로 보내는 경우입니다.
          </p>
          {!started && (
            <button
              type="button"
              onClick={fillExample}
              className="inline-flex items-center gap-1.5 self-start rounded-[var(--r-md)] font-semibold"
              style={{ fontSize: "var(--t-sm)", padding: "8px 14px", minHeight: 40, background: "var(--accent)", color: "var(--text-on-color)" }}
            >
              <Sparkles size={15} aria-hidden /> 예시 운송 정보로 채우기
            </button>
          )}
        </header>

        {/* 입력 */}
        <div className="grid items-start grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ gap: "var(--s-6)", marginBottom: "var(--s-8)" }}>
          <div className="flex flex-col min-w-0" style={{ gap: "var(--s-4)" }}>
            {transportSections.map((sec, i) => (
              <section key={sec.id} className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby={`sec-${sec.id}`}>
                <SectionTitle n={String(i + 1).padStart(2, "0")} id={`sec-${sec.id}`} title={sec.title} desc={sec.desc} />
                <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
                  {sec.fields.map((f) => (
                    <div key={f.path} style={{ gridColumn: f.kind === "multi" || f.kind === "tri" || f.kind === "select" ? "1 / -1" : undefined }}>
                      <SpecField def={f} value={getAt(spec, f.path)} onChange={(v) => onField(f.path, v)} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="flex flex-col min-w-0 lg:sticky lg:top-20" style={{ gap: "var(--s-4)" }}>
            <section className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-4)" }}>
              <h2 className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>제품 스펙에서 가져온 값</h2>
              <dl className="grid" style={{ gridTemplateColumns: "auto minmax(0,1fr)", gap: "6px var(--s-3)", fontSize: "var(--t-sm)" }}>
                {fromSpec.map((r) => (
                  <div key={r.label} className="contents">
                    <dt className="text-text-muted">{r.label}</dt>
                    <dd className="text-text font-semibold min-w-0">
                      {r.value ?? <Link to={fieldHref(r.path)} className="font-semibold underline decoration-dotted underline-offset-2" style={{ color: "var(--danger)" }}>미입력</Link>}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link to="/auto" className="inline-block font-semibold hover:underline" style={{ fontSize: "var(--t-xs)", color: "var(--info)", marginTop: "var(--s-3)" }}>제품 스펙에서 고치기 →</Link>
            </section>

            {plan.outOfScope && (
              <div role="status" className="flex rounded-[var(--r-lg)]" style={{ gap: "var(--s-2)", padding: "var(--s-4)", background: "var(--warning-bg)", color: "var(--warning)", fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                <AlertTriangle size={18} className="shrink-0" aria-hidden />
                <span className="font-semibold">{plan.outOfScope}</span>
              </div>
            )}

            <Link
              to="/doc/transport-validation"
              className="flex items-center justify-between rounded-[var(--r-lg)] font-bold"
              style={{ padding: "var(--s-4)", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)", gap: "var(--s-3)" }}
            >
              <span className="inline-flex items-center gap-1.5"><FileText size={16} aria-hidden /> 운송 밸리데이션 문서 열기</span>
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link to="/auto/plan" className="flex items-center justify-between rounded-[var(--r-lg)] border font-bold" style={{ padding: "var(--s-4)", borderColor: "var(--border-strong)", color: "var(--text)", fontSize: "var(--t-sm)" }}>
              다음: 실험계획 <ArrowRight size={16} aria-hidden />
            </Link>
            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
              아래 결과가 문서의 운송 경로·적용 규격·포장 구성·시험 순서·판정 기준·운송 과정 섹션에 자동으로 들어갑니다. 직접 쓴 초안은 덮어쓰지 않습니다.
            </p>
          </aside>
        </div>

        {/* 결과 */}
        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="res-standards">
            <SectionTitle n="①" id="res-standards" title="적용 규정·규격" desc="법적 요구와 업계 표준 시험법을 함께 보여줍니다. 시험 강도 수치는 각 규격 원문을 따릅니다." />
            <ul>
              {standards.map((x) => (
                <li
                  key={x.id}
                  className="grid items-start"
                  style={{ gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px var(--s-3)", padding: "10px 0", borderBottom: "1px dashed var(--border)", opacity: x.status === "excluded" ? 0.7 : 1 }}
                >
                  <span className="font-semibold text-text min-w-0 flex flex-wrap items-center" style={{ fontSize: "var(--t-sm)", gap: 6 }}>
                    {x.name} {x.verify && <VerifyBadge />}
                  </span>
                  <Chip s={x.status} />
                  <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", gridColumn: "1 / -1" }}>
                    {x.reason}
                    {x.status === "unknown" && x.dependsOn.length > 0 && (
                      <> 입력: {x.dependsOn.map((p, i) => <span key={p}>{i > 0 && ", "}<FieldLink path={p} /></span>)}</>
                    )}
                    <span className="text-text-subtle"> · 출처: {x.source}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="res-pack">
            <div className="rounded-[var(--r-lg)] border bg-bg" style={card}>
              <SectionTitle n="②" id="res-pack" title="포장 설계 체크리스트" desc="1차(파우치) → 2차(키트 상자) → 3차(출하 박스) 순서로 정하고, EU 출시면 PPWR 의무를 함께 확인합니다." />
              <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))" }}>
                {packing.map((g) => (
                  <div key={g.id} className="rounded-[var(--r-md)] border" style={{ borderColor: g.id === "ppwr" ? "var(--warning)" : "var(--border)", padding: "var(--s-4)", background: g.id === "ppwr" ? "var(--surface)" : "var(--bg)" }}>
                    <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-2)" }}>{g.title}</h3>
                    <ul className="flex flex-col" style={{ gap: "var(--s-3)" }}>
                      {g.items.map((item) => (
                        <li key={item.text} className="flex" style={{ gap: "var(--s-2)", opacity: item.na ? 0.6 : 1 }}>
                          {item.na ? <Square size={16} className="shrink-0" style={{ marginTop: 2, color: "var(--text-subtle)" }} aria-hidden /> : <CheckSquare size={16} className="shrink-0" style={{ marginTop: 2, color: "var(--accent)" }} aria-hidden />}
                          <div className="min-w-0">
                            <p className="text-text flex flex-wrap items-center" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", gap: 6 }}>
                              <span style={{ textDecoration: item.na ? "line-through" : undefined }}>{item.text}</span>
                              {item.verify && !item.na && <VerifyBadge />}
                            </p>
                            {(item.na || item.why) && (
                              <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginTop: 2 }}>
                                {item.na ? `해당 없음 — ${item.na}` : item.why}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {g.id === "ppwr" && (
                      <p className="flex text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginTop: "var(--s-3)", gap: 6 }}>
                        <Info size={14} className="shrink-0" style={{ marginTop: 2 }} aria-hidden />
                        <span>출처: {PPWR_SOURCES}. 이 내용은 EUR-Lex 원문과 대조하기 전입니다. 제출 전에 관보(OJ) 원문과 시행법으로 확인하세요.</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="res-tests">
            <SectionTitle n="③" id="res-tests" title="운송 시험 순서" desc="낙하 높이·진동 강도·박스 수는 ISTA 원문 표를 따릅니다. 이 화면은 순서와 이 제품에 맞는 단계만 정합니다." />
            <ol className="flex flex-col" style={{ gap: "var(--s-3)" }}>
              {plan.steps.map((st, i) => (
                <li key={st.id} className="flex" style={{ gap: "var(--s-3)", opacity: st.required ? 1 : 0.8 }}>
                  <span
                    aria-hidden
                    className="inline-grid place-items-center rounded-full font-bold shrink-0"
                    style={{ width: 28, height: 28, fontSize: "var(--t-xs)", background: st.required ? "var(--accent)" : "var(--surface-2)", color: st.required ? "var(--text-on-color)" : "var(--text-muted)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0" style={{ paddingTop: 3 }}>
                    <p className="font-bold text-text flex flex-wrap items-center" style={{ fontSize: "var(--t-sm)", gap: 6 }}>
                      {st.title}
                      {st.method && <span className="rounded-full font-semibold" style={{ fontSize: 11, padding: "1px 8px", background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{st.method}</span>}
                      {!st.required && <span className="font-semibold text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>선택</span>}
                    </p>
                    <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginTop: 2 }}>{st.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="rounded-[var(--r-md)]" style={{ marginTop: "var(--s-6)", padding: "var(--s-4)", background: "var(--surface)" }}>
              <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>판정 기준</h3>
              <ul className="flex flex-col" style={{ gap: 4, paddingLeft: 18, listStyle: "disc" }}>
                {plan.acceptance.map((a) => <li key={a} className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{a}</li>)}
              </ul>
              <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>[사양: …] 칸은 지어내지 않고 남겨 둔 값입니다. 위험관리·성능 목표에서 정해 문서에 적어 주세요.</p>
            </div>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="res-process">
            <SectionTitle n="④" id="res-process" title="운송 과정 관리" desc="출하부터 사용자 수령까지 단계별로 무엇이 위험하고, 어떻게 관리하고, 무엇을 기록으로 남기는지." />
            <ol className="grid" style={{ gap: "var(--s-3)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))" }}>
              {process.map((p, i) => (
                <li key={p.id} className="rounded-[var(--r-md)] border flex flex-col" style={{ borderColor: "var(--border)", borderTop: "4px solid var(--accent)", padding: "var(--s-4)", gap: "var(--s-2)" }}>
                  <div>
                    <p className="font-bold text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{i + 1}단계 · {p.who}</p>
                    <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>{p.title}</h3>
                  </div>
                  {([["위험", p.risks, "var(--danger)"], ["관리", p.controls, "var(--success)"], ["기록", p.records, "var(--info)"]] as const).map(([label, list, color]) => (
                    <div key={label}>
                      <p className="font-bold" style={{ fontSize: "var(--t-xs)", color }}>{label}</p>
                      <ul className="flex flex-col" style={{ gap: 2, paddingLeft: 16, listStyle: "disc" }}>
                        {list.map((x) => <li key={x} className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>{x}</li>)}
                      </ul>
                    </div>
                  ))}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
