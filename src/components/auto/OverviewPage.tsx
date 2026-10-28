import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, FileText, FlaskConical, Layers, ShieldCheck, Truck } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { fieldHref, STATUS_META } from "./AutoUi";
import { allLeaves } from "../../data/docTree";
import { resolveDoc } from "../../data/documents";
import { completion, specHash, unresolvedFields } from "../../data/spec/validate";
import { useSpec } from "../../hooks/useSpecStore";
import { useClassConfirm } from "../../hooks/useClassConfirm";
import { useResults } from "../../hooks/useResultsStore";
import { classify } from "../../lib/rules/classify";
import { countByStatus, evaluateDocSet, type ApplStatus } from "../../lib/rules/applicability";
import { planHumanTasks, planStudies } from "../../lib/planner";
import { applicableStandards, hasTransportInput } from "../../lib/transport";
import { resultsProgress } from "../../lib/results";
import { buildTokenContext, docMissingTokens, hasTokens } from "../../lib/tokens";

function Card({ icon: Icon, title, to, cta, children }: { icon: typeof Layers; title: string; to: string; cta: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--r-lg)] border bg-bg flex flex-col" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)", gap: "var(--s-3)" }}>
      <h2 className="flex items-center gap-2 font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
        <Icon size={20} style={{ color: "var(--accent)" }} aria-hidden /> {title}
      </h2>
      <div className="flex-1 flex flex-col" style={{ gap: "var(--s-2)" }}>{children}</div>
      <Link to={to} className="inline-flex items-center gap-1 self-start font-bold hover:underline" style={{ fontSize: "var(--t-sm)", color: "var(--accent)" }}>
        {cta} <ArrowRight size={15} aria-hidden />
      </Link>
    </section>
  );
}

const Big = ({ children }: { children: React.ReactNode }) => (
  <p className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)", fontVariantNumeric: "tabular-nums" }}>{children}</p>
);
const Muted = ({ children }: { children: React.ReactNode }) => (
  <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{children}</p>
);

function Counts({ c, keys }: { c: Partial<Record<ApplStatus, number>>; keys: ApplStatus[] }) {
  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {keys.filter((k) => c[k]).map((k) => (
        <span key={k} className="inline-flex rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "3px 10px", background: STATUS_META[k].bg, color: STATUS_META[k].fg, fontVariantNumeric: "tabular-nums" }}>
          {STATUS_META[k].label} {c[k]}
        </span>
      ))}
    </div>
  );
}

/** /auto/overview — 스펙을 넣으면 나오는 결과를 한 화면에. 각 카드는 상세 단계로 이어진다. */
export function OverviewPage() {
  const spec = useSpec();
  const results = useResults();
  const confirm = useClassConfirm();
  const { filled, total } = completion(spec);
  const missing = unresolvedFields(spec);
  const cls = useMemo(() => classify(spec), [spec]);
  const docSet = useMemo(() => evaluateDocSet(spec, cls), [spec, cls]);
  const docCounts = countByStatus(docSet);
  const plans = useMemo(() => planStudies(spec), [spec]);
  const tasks = useMemo(() => planHumanTasks(plans), [plans]);
  const standards = useMemo(() => applicableStandards(spec), [spec]);
  const prog = resultsProgress(spec, results);
  const ctx = useMemo(() => buildTokenContext(spec, cls, results), [spec, cls, results]);
  const filledDocs = useMemo(
    () => allLeaves()
      .map((l) => ({ leaf: l, doc: resolveDoc(l.id) }))
      .filter((x) => x.doc && x.doc.sections.some((s) => hasTokens(s.placeholder)))
      .map((x) => ({ id: x.leaf.id, title: x.leaf.title, missing: docMissingTokens(x.doc!, ctx).length, status: docSet.find((a) => a.leafId === x.leaf.id)?.status })),
    [ctx, docSet],
  );
  const confirmed = confirm && confirm.specHash === specHash(spec) && confirm.value === cls.value;
  const studyCounts = plans.reduce((m, p) => ({ ...m, [p.status]: (m[p.status] ?? 0) + 1 }), {} as Partial<Record<ApplStatus, number>>);
  const clin = plans.find((p) => p.id === "clinical-performance");
  const realtime = plans.find((p) => p.id === "stability-realtime");
  const reqStd = standards.filter((x) => x.status === "required");

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="자동작성 결과" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/overview" />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>자동작성 결과</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            {spec.identity.productName ? <b className="text-text">{spec.identity.productName}</b> : "입력한 제품"}의 스펙으로 만든 결과입니다. 스펙을 고치면 이 화면과 모든 문서가 바로 바뀝니다. 카드를 눌러 자세히 보세요.
          </p>
        </header>

        {filled === 0 ? (
          <div className="rounded-[var(--r-lg)] border text-center" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-12) var(--s-6)" }}>
            <p className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>아직 제품 스펙이 비어 있습니다</p>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)" }}>제품 스펙 화면에서 입력하거나 "예시로 채우기"를 눌러 보세요.</p>
            <Link to="/auto" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ marginTop: "var(--s-4)", padding: "10px 18px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
              제품 스펙 입력하기 <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
            {missing.length > 0 && (
              <div className="flex flex-wrap items-center rounded-[var(--r-lg)]" style={{ gap: "var(--s-2)", padding: "var(--s-3) var(--s-4)", background: "var(--warning-bg)", color: "var(--warning)", fontSize: "var(--t-sm)" }}>
                <AlertTriangle size={17} aria-hidden />
                <span className="font-bold">스펙 {filled}/{total} 입력 — 비어 있는 {missing.length}개는 결과에 [미입력]으로 남습니다:</span>
                {missing.slice(0, 6).map((f) => <Link key={f.path} to={fieldHref(f.path)} className="font-semibold underline decoration-dotted">{f.label}</Link>)}
                {missing.length > 6 && <span>외 {missing.length - 6}개</span>}
              </div>
            )}

            <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}>
              <Card icon={ShieldCheck} title="IVDR 클래스" to="/auto/docs" cta={confirmed ? "분류 근거 보기" : "확인하고 확정하기"}>
                <Big>{cls.value ? `Class ${cls.value}` : "판정 보류"}</Big>
                <Muted>{cls.value ? `${cls.rule} · ${confirmed ? "확정됨" : "추천 — 담당자 확정 전"}` : cls.rationale[0]}</Muted>
                {cls.route[0] && <Muted>적합성 평가: {cls.route[0]}</Muted>}
              </Card>

              <Card icon={Layers} title="필요한 문서" to="/auto/docs" cta="문서 세트 보기">
                <Big>{docCounts.required}개 필수</Big>
                <Counts c={docCounts} keys={["recommended", "optional", "unknown", "excluded"]} />
                <Muted>IVDR 문서 {docSet.length}개를 이 제품 기준으로 판정했습니다.</Muted>
              </Card>

              <Card icon={FlaskConical} title="실험계획" to="/auto/plan" cta="실험계획 보기">
                <Big>실험 {plans.length}개</Big>
                <Counts c={studyCounts} keys={["required", "recommended", "optional", "unknown"]} />
                {clin?.samples[0] && <Muted>{clin.samples[0].split(":")[0]}: {clin.samples[0].match(/n=\d+/)?.[0] ?? "목표 입력 필요"}부터</Muted>}
                {realtime?.duration && <Muted>가장 긴 실험: 실시간 안정성 {realtime.duration}</Muted>}
              </Card>

              <Card icon={Truck} title="운송·포장" to="/auto/transport" cta={hasTransportInput(spec) ? "운송·포장 보기" : "운송 정보 입력하기"}>
                {hasTransportInput(spec) ? (
                  <>
                    <Big>필수 규격 {reqStd.length}개</Big>
                    <Muted>{reqStd.map((x) => x.name.split(" (")[0].split(" —")[0]).join(", ")}</Muted>
                  </>
                ) : (
                  <Muted>목적지·운송 방식·박스 정보를 넣으면 적용 규정(ISTA·IATA·PPWR 등), 포장 설계, 운송 시험 순서가 나옵니다.</Muted>
                )}
              </Card>

              <Card icon={CheckCircle2} title="실험 결과" to="/auto/results" cta="결과 입력하기">
                <Big>판정 {prog.done} / {prog.total}</Big>
                <Muted>{prog.entered ? `${prog.entered}개 실험에 결과가 입력됐습니다.` : "아직 입력된 결과가 없습니다. 실험을 마치면 건수·판정을 넣으세요 — 문서의 결과 섹션이 채워집니다."}</Muted>
              </Card>

              <Card icon={ClipboardList} title="사람이 할 일" to="/auto/plan" cta="전체 보기">
                <ul className="flex flex-col" style={{ gap: 4, paddingLeft: 16, listStyle: "disc" }}>
                  {!confirmed && cls.value && <li className="text-text" style={{ fontSize: "var(--t-sm)" }}>Class {cls.value} 확정</li>}
                  {missing.length > 0 && <li className="text-text" style={{ fontSize: "var(--t-sm)" }}>비어 있는 스펙 {missing.length}개 채우기</li>}
                  {tasks.slice(0, 4).map((t) => <li key={t.task} className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{t.task}</li>)}
                </ul>
                {tasks.length > 4 && <Muted>외 {tasks.length - 4}개</Muted>}
              </Card>
            </div>

            <section className="rounded-[var(--r-lg)] border bg-bg" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" }} aria-labelledby="docs-title">
              <h2 id="docs-title" className="flex items-center gap-2 font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
                <FileText size={20} style={{ color: "var(--accent)" }} aria-hidden /> 자동으로 채워진 문서 {filledDocs.length}개
              </h2>
              <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "4px 0 var(--s-4)" }}>
                눌러서 열면 스펙·분류·실험계획·결과가 들어간 초안이 보입니다. 그대로 고쳐 쓰고 Word로 내보낼 수 있습니다.
              </p>
              <ul className="grid" style={{ gap: "var(--s-2)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
                {filledDocs.map((d) => (
                  <li key={d.id}>
                    <Link to={`/doc/${d.id}`} className="flex items-center justify-between rounded-[var(--r-md)] border hover:bg-surface" style={{ borderColor: "var(--border)", padding: "10px 14px", gap: "var(--s-2)" }}>
                      <span className="min-w-0">
                        <span className="block font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{d.title}</span>
                        <span className="block" style={{ fontSize: "var(--t-xs)", color: d.missing ? "var(--warning)" : "var(--success)" }}>
                          {d.missing ? `스펙 미입력 항목 ${d.missing}개` : "스펙 항목 모두 채워짐"}
                          {d.status === "excluded" && <span className="text-text-subtle"> · 이 제품엔 불필요</span>}
                        </span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-text-subtle" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
