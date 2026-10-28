import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronDown, ChevronRight, CircleDashed, FileText, Trash2, XCircle } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { docTree } from "../../data/docTree";
import { completion } from "../../data/spec/validate";
import { useSpec } from "../../hooks/useSpecStore";
import { setResult, useResults } from "../../hooks/useResultsStore";
import { PHASES, planStudies, type StudyPlan } from "../../lib/planner";
import {
  clinicalMetrics, defaultCutoffLevels, emptyResult, hasResult, resultKind, resultsProgress, VERDICT_KO,
  type CutoffLevel, type StudyResult, type Verdict,
} from "../../lib/results";
import type { ProductSpec } from "../../data/spec/types";

const input: React.CSSProperties = {
  border: "1.5px solid var(--border)", background: "var(--bg)", fontSize: "var(--t-sm)", padding: "6px 10px",
  minHeight: 38, borderRadius: "var(--r-sm)", width: "100%", color: "var(--text)",
};

/** 입력 중에는 로컬 상태, 멈추면 저장 (스펙 입력칸과 같은 방식). */
function Field({ label, value, onCommit, kind = "text", width, placeholder }: {
  label: string; value: string; onCommit: (v: string) => void; kind?: "text" | "number" | "date" | "textarea"; width?: number; placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onCommit(local), 400);
    return () => clearTimeout(t);
  }, [local, value, onCommit]);
  const common = { value: local, placeholder, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocal(e.target.value), onBlur: () => local !== value && onCommit(local), "aria-label": label };
  return (
    <label className="flex flex-col" style={{ gap: 4, width, minWidth: 0 }}>
      <span className="font-semibold text-text-muted" style={{ fontSize: "var(--t-xs)" }}>{label}</span>
      {kind === "textarea"
        ? <textarea {...common} rows={2} style={{ ...input, resize: "vertical", lineHeight: "var(--lh-base)" }} />
        : <input {...common} type={kind} inputMode={kind === "number" ? "numeric" : undefined} style={input} />}
    </label>
  );
}

const num = (v: string): number | null => (v.trim() === "" || !Number.isFinite(Number(v)) ? null : Math.max(0, Number(v)));
const str = (v: string): string | null => (v.trim() === "" ? null : v);
const show = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const VERDICT_STYLE: Record<Verdict, { fg: string; bg: string; Icon: typeof CheckCircle2 }> = {
  pass: { fg: "var(--success)", bg: "var(--success-bg)", Icon: CheckCircle2 },
  fail: { fg: "var(--danger)", bg: "var(--danger-bg)", Icon: XCircle },
  "in-progress": { fg: "var(--info)", bg: "var(--info-bg)", Icon: CircleDashed },
};

function StatusBadge({ r }: { r: StudyResult | undefined }) {
  if (!hasResult(r)) return <span className="rounded-full font-bold shrink-0" style={{ fontSize: "var(--t-xs)", padding: "2px 10px", background: "var(--surface-2)", color: "var(--text-muted)" }}>미입력</span>;
  if (!r!.verdict) return <span className="rounded-full font-bold shrink-0" style={{ fontSize: "var(--t-xs)", padding: "2px 10px", background: "var(--warning-bg)", color: "var(--warning)" }}>판정 미입력</span>;
  const st = VERDICT_STYLE[r!.verdict];
  return (
    <span className="inline-flex items-center gap-1 rounded-full font-bold shrink-0" style={{ fontSize: "var(--t-xs)", padding: "2px 10px", background: st.bg, color: st.fg }}>
      <st.Icon size={13} aria-hidden /> {VERDICT_KO[r!.verdict]}
    </span>
  );
}

function Meets({ ok, label }: { ok: boolean | null; label: string }) {
  if (ok === null) return <span className="text-text-subtle">{label}: 목표·신뢰수준 미입력</span>;
  return <span className="font-bold" style={{ color: ok ? "var(--success)" : "var(--danger)" }}>{label} 목표 {ok ? "충족" : "미충족"}</span>;
}

function ClinicalForm({ r, spec, save }: { r: StudyResult; spec: ProductSpec; save: (patch: Partial<StudyResult>) => void }) {
  const m = clinicalMetrics(r, spec);
  const cell = (label: string, key: "tp" | "fp" | "fn" | "tn" | "invalid", hint: string) => (
    <Field label={`${label} (${hint})`} kind="number" value={show(r[key])} onCommit={(v) => save({ [key]: num(v) })} />
  );
  return (
    <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
      <p className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>기준 방법 대비 2×2 표 — 시험 제품 결과(행) × 기준 방법 결과(열)</p>
      <div className="grid" style={{ gap: "var(--s-2)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))" }}>
        {cell("참양성 a", "tp", "둘 다 양성")}
        {cell("위양성 b", "fp", "제품만 양성")}
        {cell("위음성 c", "fn", "기준만 양성")}
        {cell("참음성 d", "tn", "둘 다 음성")}
        {cell("무효 결과", "invalid", "판독 불가")}
      </div>
      {(m.se !== null || m.sp !== null) && (
        <div className="rounded-[var(--r-md)] flex flex-col" style={{ background: "var(--surface)", padding: "var(--s-3) var(--s-4)", gap: 4, fontSize: "var(--t-sm)", fontVariantNumeric: "tabular-nums" }}>
          {m.se !== null && <p className="text-text">민감도 <b>{pct(m.se)}</b> · Wilson 95% {m.seCI && `${pct(m.seCI[0])}–${pct(m.seCI[1])}`} · {m.conf ?? "?"}% 단측 하한 {m.seLower !== null ? pct(m.seLower) : "—"} · <Meets ok={m.meetsSe} label="민감도" /></p>}
          {m.sp !== null && <p className="text-text">특이도 <b>{pct(m.sp)}</b> · Wilson 95% {m.spCI && `${pct(m.spCI[0])}–${pct(m.spCI[1])}`} · {m.conf ?? "?"}% 단측 하한 {m.spLower !== null ? pct(m.spLower) : "—"} · <Meets ok={m.meetsSp} label="특이도" /></p>}
          {m.invalidRate !== null && <p className="text-text-muted">무효 결과 비율 {pct(m.invalidRate)}</p>}
          <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>계산은 입력한 건수로만 합니다. 최종 판정은 아래에서 직접 고르세요.</p>
        </div>
      )}
    </div>
  );
}

function CutoffForm({ r, spec, save }: { r: StudyResult; spec: ProductSpec; save: (patch: Partial<StudyResult>) => void }) {
  const levels = r.levels?.length ? r.levels : defaultCutoffLevels(spec);
  const unit = spec.analyte.cutoffUnit ?? "";
  const upd = (i: number, patch: Partial<CutoffLevel>) => save({ levels: levels.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  return (
    <div className="flex flex-col" style={{ gap: "var(--s-2)" }}>
      <p className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>수준별 시험 횟수와 양성 판정 수 — 농도는 실험계획의 제안 수준이며 고칠 수 있습니다.</p>
      {levels.map((l, i) => (
        <div key={l.label} className="grid items-end" style={{ gap: "var(--s-2)", gridTemplateColumns: "72px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 64px" }}>
          <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)", paddingBottom: 9 }}>{l.label}</span>
          <Field label={`농도${unit ? ` (${unit})` : ""}`} kind="number" value={show(l.conc)} onCommit={(v) => upd(i, { conc: v.trim() === "" ? null : Number(v) })} />
          <Field label="시험 수" kind="number" value={show(l.n)} onCommit={(v) => upd(i, { n: num(v) })} />
          <Field label="양성 수" kind="number" value={show(l.positive)} onCommit={(v) => upd(i, { positive: num(v) })} />
          <span className="font-bold text-right text-text" style={{ fontSize: "var(--t-sm)", paddingBottom: 9, fontVariantNumeric: "tabular-nums" }}>
            {l.n && l.positive != null ? pct(l.positive / l.n) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function StudyCard({ p, r, spec, titleOf }: { p: StudyPlan; r: StudyResult | undefined; spec: ProductSpec; titleOf: Map<string, string> }) {
  const [open, setOpen] = useState(false);
  const cur = r ?? emptyResult();
  const save = (patch: Partial<StudyResult>) => setResult(p.id, { ...cur, ...patch });
  const kind = resultKind(p.id);
  return (
    <li className="rounded-[var(--r-lg)] border bg-bg" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
      <button type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open} className="w-full grid items-center text-left" style={{ gridTemplateColumns: "auto minmax(0,1fr) auto", gap: "var(--s-2)", padding: "var(--s-4) var(--s-6)" }}>
        {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
        <span className="min-w-0">
          <span className="block font-bold text-text" style={{ fontSize: "var(--t-base)" }}>{p.title}</span>
          <span className="block text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
            {p.standards[0]}{r?.date && ` · ${r.date}`}{r?.rawRef && ` · ${r.rawRef}`}
          </span>
        </span>
        <StatusBadge r={r} />
      </button>
      {open && (
        <div className="flex flex-col" style={{ gap: "var(--s-4)", padding: "0 var(--s-6) var(--s-6)" }}>
          {p.acceptance.length > 0 && (
            <div className="rounded-[var(--r-md)]" style={{ background: "var(--surface)", padding: "var(--s-3) var(--s-4)" }}>
              <p className="font-bold text-text" style={{ fontSize: "var(--t-xs)", marginBottom: 2 }}>판정 기준 (실험계획)</p>
              <ul style={{ paddingLeft: 16, listStyle: "disc" }}>
                {p.acceptance.map((a) => <li key={a} className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{a}</li>)}
              </ul>
            </div>
          )}
          {kind === "clinical" && <ClinicalForm r={cur} spec={spec} save={save} />}
          {kind === "cutoff" && <CutoffForm r={cur} spec={spec} save={save} />}
          {kind === "stability" && (
            <div style={{ maxWidth: 240 }}>
              <Field label={`입증된 기간 (개월)${spec.storage.shelfLifeMonths !== null ? ` — 목표 ${spec.storage.shelfLifeMonths}개월` : ""}`} kind="number" value={show(cur.verifiedMonths)} onCommit={(v) => save({ verifiedMonths: num(v) })} />
            </div>
          )}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <span className="font-semibold text-text-muted" style={{ fontSize: "var(--t-xs)" }}>판정</span>
            <div className="flex flex-wrap" style={{ gap: "var(--s-2)" }} role="group" aria-label={`${p.title} 판정`}>
              {(["pass", "fail", "in-progress"] as Verdict[]).map((v) => {
                const on = cur.verdict === v;
                const st = VERDICT_STYLE[v];
                return (
                  <button key={v} type="button" aria-pressed={on} onClick={() => save({ verdict: on ? null : v })}
                    className="inline-flex items-center gap-1.5 rounded-full font-semibold"
                    style={{ fontSize: "var(--t-sm)", padding: "6px 14px", minHeight: 36, border: `1.5px solid ${on ? st.fg : "var(--border)"}`, background: on ? st.bg : "var(--bg)", color: on ? st.fg : "var(--text)" }}>
                    <st.Icon size={15} aria-hidden /> {VERDICT_KO[v]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid" style={{ gap: "var(--s-3)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
            <Field label="완료일" kind="date" value={cur.date ?? ""} onCommit={(v) => save({ date: str(v) })} />
            <Field label="원자료·시험 보고서 번호" value={cur.rawRef ?? ""} placeholder="예: TR-2026-014" onCommit={(v) => save({ rawRef: str(v) })} />
          </div>
          <Field label="결과 요약 (문서에 그대로 들어갑니다)" kind="textarea" value={cur.summary ?? ""} onCommit={(v) => save({ summary: str(v) })} />
          <div className="flex flex-wrap items-center justify-between" style={{ gap: "var(--s-2)" }}>
            <p className="flex flex-wrap items-center text-text-subtle" style={{ fontSize: "var(--t-xs)", gap: 6 }}>
              <FileText size={13} aria-hidden /> 반영되는 문서:
              {p.docs.map((d) => <Link key={d} to={`/doc/${d}`} className="font-semibold hover:underline" style={{ color: "var(--info)" }}>{titleOf.get(d) ?? d}</Link>)}
            </p>
            {hasResult(r) && (
              <button type="button" onClick={() => setResult(p.id, null)} className="inline-flex items-center gap-1 font-semibold text-text-muted hover:text-text" style={{ fontSize: "var(--t-xs)" }}>
                <Trash2 size={13} aria-hidden /> 결과 지우기
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/** /auto/results — 실험 결과 입력. 입력한 값이 관련 문서의 결과 섹션에 자동으로 들어간다. */
export function ResultsPage() {
  const spec = useSpec();
  const results = useResults();
  const plans = useMemo(() => planStudies(spec).filter((p) => p.status !== "excluded" && p.status !== "unknown"), [spec]);
  const prog = resultsProgress(spec, results);
  const { filled } = completion(spec);
  const titleOf = new Map(docTree.flatMap((g) => g.items.map((l) => [l.id, l.title] as const)));
  const pctDone = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="결과 입력" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/results" />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>실험 결과 입력</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            실험을 마치면 건수·판정·원자료 번호를 입력하세요. 민감도·특이도·신뢰하한은 입력한 건수로 계산하고, 분석적 성능·임상적 성능·안정성·운송 문서의 결과 섹션에 자동으로 들어갑니다.
            값을 지어내지 않으며, 입력하지 않은 실험은 문서에 [실험 후 입력]으로 남습니다.
          </p>
          {filled > 0 && (
            <div className="flex items-center rounded-[var(--r-md)] self-start" role="status" style={{ gap: "var(--s-3)", padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", minWidth: 260 }}>
              <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)", fontVariantNumeric: "tabular-nums" }}>판정 완료 {prog.done} / {prog.total}</span>
              <span className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)", minWidth: 80 }}>
                <span className="block h-full rounded-full" style={{ width: `${pctDone}%`, background: pctDone === 100 ? "var(--success)" : "var(--accent)" }} />
              </span>
              <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>입력 {prog.entered}</span>
            </div>
          )}
        </header>

        {filled === 0 ? (
          <div className="rounded-[var(--r-lg)] border text-center" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-12) var(--s-6)" }}>
            <p className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>먼저 제품 스펙을 입력하세요</p>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)" }}>스펙으로 실험계획이 정해지면 실험별 결과 입력칸이 나옵니다.</p>
            <Link to="/auto" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ marginTop: "var(--s-4)", padding: "10px 18px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
              제품 스펙 입력하기 <ChevronRight size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
            {([2, 3, 4] as const).map((ph) => {
              const list = plans.filter((p) => p.phase === ph);
              if (!list.length) return null;
              return (
                <section key={ph} aria-labelledby={`rph-${ph}`}>
                  <h2 id={`rph-${ph}`} className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)", marginBottom: "var(--s-3)" }}>
                    <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginRight: 6 }}>{ph}단계</span>{PHASES[ph]}
                  </h2>
                  <ul className="flex flex-col" style={{ gap: "var(--s-3)" }}>
                    {list.map((p) => <StudyCard key={p.id} p={p} r={results[p.id]} spec={spec} titleOf={titleOf} />)}
                  </ul>
                </section>
              );
            })}
            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
              결과는 이 브라우저에 저장되며 제품 스펙 화면의 "전체 백업"에 함께 들어갑니다. 문서 섹션에 직접 쓴 초안이 있으면 그 초안이 우선합니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
