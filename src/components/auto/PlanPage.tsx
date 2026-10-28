import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, ClipboardList, Clock, FileText, Sigma } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { Chip, FieldLink, fieldHref, STATUS_META } from "./AutoUi";
import { docTree } from "../../data/docTree";
import { completion } from "../../data/spec/validate";
import { useSpec } from "../../hooks/useSpecStore";
import type { ApplStatus } from "../../lib/rules/applicability";
import { CROSS_REACTANTS_REVIEWED } from "../../lib/planner/crossReactants";
import { PHASES, planHumanTasks, planStudies, sampleSizeTable, type StudyPlan } from "../../lib/planner";

const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)" } as const;

/** "[…]" 로 남겨 둔 칸(원문 기준·사양·미입력)을 눈에 띄게. */
function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") && p.endsWith("]") ? (
          <mark key={i} className="rounded-[4px]" style={{ background: "var(--warning-bg)", color: "var(--warning)", padding: "0 3px", fontWeight: 600 }}>{p}</mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Rows({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="font-bold text-text" style={{ fontSize: "var(--t-xs)", marginBottom: 2 }}>{label}</p>
      <ul className="flex flex-col" style={{ gap: 2, paddingLeft: 16, listStyle: "disc" }}>
        {items.map((x) => <li key={x} className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}><Marked text={x} /></li>)}
      </ul>
    </div>
  );
}

function StudyCard({ p, titleOf }: { p: StudyPlan; titleOf: Map<string, string> }) {
  const [open, setOpen] = useState(p.status === "required" || p.status === "unknown");
  return (
    <li className="rounded-[var(--r-lg)] border bg-bg" style={{ ...card, opacity: p.status === "optional" ? 0.9 : 1 }}>
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
        className="w-full grid items-start text-left"
        style={{ gridTemplateColumns: "auto minmax(0,1fr) auto", gap: "var(--s-2)", padding: "var(--s-4) var(--s-6)" }}
      >
        {open ? <ChevronDown size={18} style={{ marginTop: 2 }} aria-hidden /> : <ChevronRight size={18} style={{ marginTop: 2 }} aria-hidden />}
        <span className="min-w-0">
          <span className="block font-bold text-text" style={{ fontSize: "var(--t-base)" }}>{p.title}</span>
          <span className="block text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>
            {p.standards.join(" · ")}
            {p.duration && <> · <Clock size={12} className="inline" style={{ verticalAlign: -1 }} aria-hidden /> {p.duration}</>}
          </span>
        </span>
        <Chip s={p.status} />
      </button>
      {open && (
        <div className="flex flex-col" style={{ gap: "var(--s-3)", padding: "0 var(--s-6) var(--s-4)", paddingLeft: "calc(var(--s-6) + 26px)" }}>
          <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{p.why}</p>
          {p.status === "unknown" && p.dependsOn.length > 0 && (
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
              입력: {p.dependsOn.map((d, i) => <span key={d}>{i > 0 && ", "}<FieldLink path={d} /></span>)}
            </p>
          )}
          <Rows label="설계" items={p.design} />
          <Rows label="시료" items={p.samples} />
          <Rows label="판정 기준" items={p.acceptance} />
          {p.docs.length > 0 && (
            <p className="flex flex-wrap items-center text-text-subtle" style={{ fontSize: "var(--t-xs)", gap: 6 }}>
              <FileText size={13} aria-hidden /> 결과가 들어갈 문서:
              {p.docs.map((d) => (
                <Link key={d} to={`/doc/${d}`} className="font-semibold hover:underline" style={{ color: "var(--info)" }}>{titleOf.get(d) ?? d}</Link>
              ))}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function SizeTable({ label, target, conf, path }: { label: string; target: number | null; conf: number | null; path: string }) {
  const rows = sampleSizeTable(target, conf);
  return (
    <div>
      <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>{label}{target !== null && ` ${target}%`}</p>
      {rows ? (
        <table className="w-full" style={{ fontSize: "var(--t-sm)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
              <th className="text-left font-semibold">허용 오판정</th>
              <th className="text-right font-semibold">최소 n</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.allowedMisses} style={{ borderTop: "1px dashed var(--border)" }}>
                <td className="text-text-muted" style={{ padding: "3px 0" }}>{r.allowedMisses}건</td>
                <td className="text-right font-bold text-text">{r.n ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>
          {target === null ? <>목표가 비어 있습니다 — <Link to={fieldHref(path)} className="font-semibold underline decoration-dotted" style={{ color: "var(--danger)" }}>입력하기</Link></> : <>신뢰수준이 비어 있습니다 — <Link to={fieldHref("targets.confidence")} className="font-semibold underline decoration-dotted" style={{ color: "var(--danger)" }}>입력하기</Link></>}
        </p>
      )}
    </div>
  );
}

/** /auto/plan — 실험계획: 스펙 → 필요한 실험과 설계·시료·판정 기준·사람이 할 일. */
export function PlanPage() {
  const spec = useSpec();
  const plans = useMemo(() => planStudies(spec), [spec]);
  const tasks = useMemo(() => planHumanTasks(plans), [plans]);
  const { filled } = completion(spec);
  const counts = plans.reduce((m, p) => ({ ...m, [p.status]: (m[p.status] ?? 0) + 1 }), {} as Partial<Record<ApplStatus, number>>);
  const titleOf = new Map(docTree.flatMap((g) => g.items.map((l) => [l.id, l.title] as const)));
  const longest = plans.find((p) => p.id === "stability-realtime")?.duration;
  const [done, setDone] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="실험계획" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/plan" />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>실험계획</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            제품 스펙으로 필요한 실험과 각 실험의 설계·시료·판정 기준을 정하고, 사람이 직접 해야 할 일을 모읍니다.
            표본수처럼 계산되는 값은 계산하고, 규격 원문에 있는 값과 합격 수치는 지어내지 않고 <mark className="rounded-[4px]" style={{ background: "var(--warning-bg)", color: "var(--warning)", padding: "0 3px", fontWeight: 600 }}>[표시]</mark>로 남깁니다.
          </p>
        </header>

        {filled === 0 ? (
          <div className="rounded-[var(--r-lg)] border text-center" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-12) var(--s-6)" }}>
            <p className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>먼저 제품 스펙을 입력하세요</p>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)" }}>결과 형태·검체·분석물·목표 성능을 넣으면 실험계획이 나옵니다.</p>
            <Link to="/auto" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ marginTop: "var(--s-4)", padding: "10px 18px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
              제품 스펙 입력하기 <ChevronRight size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="grid items-start grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]" style={{ gap: "var(--s-6)" }}>
            <div className="flex flex-col min-w-0" style={{ gap: "var(--s-6)" }}>
              <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
                <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginRight: 4 }}>실험 {plans.length}개</span>
                {(["required", "recommended", "optional", "unknown"] as ApplStatus[]).filter((s) => counts[s]).map((s) => (
                  <span key={s} className="inline-flex items-center rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "4px 10px", background: STATUS_META[s].bg, color: STATUS_META[s].fg, fontVariantNumeric: "tabular-nums" }}>
                    {STATUS_META[s].label} {counts[s]}
                  </span>
                ))}
                {longest && (
                  <span className="inline-flex items-center gap-1 text-text-muted" style={{ fontSize: "var(--t-xs)", marginLeft: 4 }}>
                    <Clock size={13} aria-hidden /> 가장 긴 실험: 실시간 안정성 {longest}
                  </span>
                )}
              </div>

              {([2, 3, 4] as const).map((ph) => {
                const list = plans.filter((p) => p.phase === ph);
                if (!list.length) return null;
                return (
                  <section key={ph} aria-labelledby={`ph-${ph}`}>
                    <h2 id={`ph-${ph}`} className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)", marginBottom: "var(--s-3)" }}>
                      <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginRight: 6 }}>{ph}단계</span>
                      {PHASES[ph]}
                    </h2>
                    <ul className="flex flex-col" style={{ gap: "var(--s-3)" }}>
                      {list.map((p) => <StudyCard key={p.id} p={p} titleOf={titleOf} />)}
                    </ul>
                  </section>
                );
              })}
              {!CROSS_REACTANTS_REVIEWED && (
                <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
                  교차반응·간섭 후보 목록은 일반적인 출발점이며 아직 RA·개발 담당자 검토 전입니다. 실제 시험 전에 제품 원료·문헌으로 확정하세요.
                </p>
              )}
            </div>

            <aside className="flex flex-col min-w-0 lg:sticky lg:top-20" style={{ gap: "var(--s-4)" }}>
              <section className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--accent)", background: "var(--bg)", padding: "var(--s-4)" }} aria-labelledby="human-title">
                <h2 id="human-title" className="flex items-center gap-1.5 font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--accent)", marginBottom: "var(--s-2)" }}>
                  <ClipboardList size={15} aria-hidden /> 1단계 {PHASES[1]} — 사람이 할 일 {tasks.length}개
                </h2>
                <ul className="flex flex-col" style={{ gap: 6 }}>
                  {tasks.map((t) => (
                    <li key={t.task}>
                      <label className="flex items-start cursor-pointer" style={{ gap: 8, fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                        <input
                          type="checkbox"
                          checked={done.has(t.task)}
                          onChange={() => setDone((d) => { const n = new Set(d); if (n.has(t.task)) n.delete(t.task); else n.add(t.task); return n; })}
                          style={{ marginTop: 4 }}
                        />
                        <span>
                          <span className="text-text" style={{ textDecoration: done.has(t.task) ? "line-through" : undefined }}>{t.task}</span>
                          <span className="block text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{t.studies.join(", ")}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>체크는 이 화면에서만 유지됩니다. 저장되는 할 일 목록은 "사람이 할 일" 단계에서 지원합니다.</p>
              </section>

              <section className="rounded-[var(--r-lg)] border flex flex-col" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-4)", gap: "var(--s-3)" }} aria-labelledby="size-title">
                <h2 id="size-title" className="flex items-center gap-1.5 font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
                  <Sigma size={15} aria-hidden /> 임상 성능 표본수
                </h2>
                <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
                  목표값을 {spec.targets.confidence ?? "?"}% 단측 신뢰하한(Clopper-Pearson)으로 입증하는 데 필요한 최소 양성·음성 검체 수입니다. 오판정을 몇 건까지 허용할지는 사람이 정합니다.
                </p>
                <SizeTable label="민감도" target={spec.targets.sensitivity} conf={spec.targets.confidence} path="targets.sensitivity" />
                <SizeTable label="특이도" target={spec.targets.specificity} conf={spec.targets.confidence} path="targets.specificity" />
              </section>

              <Link to="/auto/results" className="flex items-center justify-between rounded-[var(--r-lg)] font-bold" style={{ padding: "var(--s-4)", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
                실험을 마쳤으면: 결과 입력 <span aria-hidden>→</span>
              </Link>
              <div className="flex flex-col" style={{ gap: 6 }}>
                {[["performance-eval-plan", "성능평가 계획 (PEP)"], ["analytical-performance", "분석적 성능 보고서"], ["clinical-performance", "임상적 성능 보고서"], ["stability-study", "안정성 시험 계획·보고서"]].map(([id, t]) => (
                  <Link key={id} to={`/doc/${id}`} className="flex items-center justify-between rounded-[var(--r-md)] border font-semibold hover:bg-surface" style={{ borderColor: "var(--border)", padding: "10px 14px", fontSize: "var(--t-sm)", color: "var(--text)" }}>
                    <span className="inline-flex items-center gap-1.5"><FileText size={15} aria-hidden /> {t}</span>
                    <span aria-hidden>→</span>
                  </Link>
                ))}
                <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>이 계획이 위 문서의 설계·판정 기준·일정 섹션에 자동으로 들어갑니다. 직접 쓴 초안은 덮어쓰지 않습니다.</p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
