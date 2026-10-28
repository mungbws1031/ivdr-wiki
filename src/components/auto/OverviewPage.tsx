import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Award, Building2, CheckCircle2, ClipboardList, FileText, FlaskConical, Layers, ShieldCheck, Truck } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { AssumptionBanner, EvidenceBar, fieldHref, STATUS_META } from "./AutoUi";
import { allLeaves } from "../../data/docTree";
import { resolveDoc } from "../../data/documents";
import { completion, specHash, unresolvedFields } from "../../data/spec/validate";
import { useWorkingSpec } from "../../hooks/useSpecStore";
import { useClassConfirm } from "../../hooks/useClassConfirm";
import { useResults } from "../../hooks/useResultsStore";
import { classify } from "../../lib/rules/classify";
import { gsprChecklist, gsprCounts } from "../../lib/gspr";
import { certRoutes, missingQms, type CertRoute } from "../../lib/rules/certRoutes";
import { countByStatus, evaluateDocSet, type ApplStatus } from "../../lib/rules/applicability";
import { planHumanTasks, planStudies } from "../../lib/planner";
import { applicableStandards, hasTransportInput } from "../../lib/transport";
import { resultsProgress } from "../../lib/results";
import { buildTokenContext, docMissingTokens, fillDoc, hasTokens } from "../../lib/tokens";
import { docEvidence, markAssumed } from "../../lib/evidence";
import { docDifficulty, MOOD_META, MOODS, overallDifficulty, type Difficulty } from "../../lib/difficulty";
import { Minimi } from "./factoryArt";
import { docImpact } from "../../lib/impact";
import { getReview } from "../../hooks/useReviewStore";
import { hasDraft } from "../../hooks/useDraftStore";

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

/** 난이도 얼굴 — 문서 공장의 동물 직원이 난이도 표정을 짓는다 */
function DifficultyFace({ seed, d, size = 1 }: { seed: string; d: Difficulty; size?: number }) {
  const m = MOOD_META[d.mood];
  return (
    <span className="inline-grid place-items-center rounded-full shrink-0" title={`${m.label} — ${d.reasons.join(" · ")}`}
      style={{ width: 44 * size, height: 44 * size, background: `color-mix(in srgb, ${m.color} 14%, var(--bg))`, border: `1.5px solid ${m.color}`, overflow: "hidden" }}>
      <span className={d.mood === "scream" ? "mood-shake" : undefined} style={{ transform: `scale(${1.25 * size}) translateY(${5}px)` }}>
        <Minimi seed={seed} state="todo" shirt={m.color} walking={false} mood={d.mood} />
      </span>
    </span>
  );
}

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

const SUPPORT: Record<CertRoute["support"], { label: string; fg: string; bg: string }> = {
  full: { label: "자동작성 지원", fg: "var(--success)", bg: "var(--success-bg)" },
  guide: { label: "경로 안내", fg: "var(--info)", bg: "var(--info-bg)" },
  planned: { label: "다음 단계 지원", fg: "var(--text-muted)", bg: "var(--surface-2)" },
};

function CertRoutes({ routes, missing }: { routes: CertRoute[]; missing: { cert: string; why: string }[] }) {
  return (
    <section className="rounded-[var(--r-lg)] border bg-bg" style={{ borderColor: "var(--accent)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" }} aria-labelledby="cert-title">
      <h2 id="cert-title" className="flex items-center gap-2 font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
        <Award size={20} style={{ color: "var(--accent)" }} aria-hidden /> 받아야 할 인증 {routes.length}개
      </h2>
      {routes.length === 0 ? (
        <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>
          아직 고른 인증이 없습니다. <Link to={fieldHref("markets")} className="font-semibold underline decoration-dotted" style={{ color: "var(--danger)" }}>어떤 인증을 받아야 하는지 고르기</Link>
        </p>
      ) : (
        <div className="grid" style={{ gap: "var(--s-3)", marginTop: "var(--s-3)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))" }}>
          {routes.map((r) => (
            <div key={r.market} className="rounded-[var(--r-md)] border flex flex-col" style={{ borderColor: "var(--border)", padding: "var(--s-4)", gap: "var(--s-2)" }}>
              <div className="flex flex-wrap items-center justify-between" style={{ gap: 6 }}>
                <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>{r.name}</h3>
                <span className="rounded-full font-bold" style={{ fontSize: 11, padding: "2px 8px", color: SUPPORT[r.support].fg, background: SUPPORT[r.support].bg }}>{SUPPORT[r.support].label}</span>
              </div>
              <p className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{r.headline}</p>
              {r.steps.length > 0 && (
                <ol className="flex flex-col" style={{ gap: 2, paddingLeft: 18, listStyle: "decimal" }}>
                  {r.steps.map((x) => <li key={x} className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{x}</li>)}
                </ol>
              )}
              {r.qms.length > 0 && <p className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}><b className="text-text">품질 인증:</b> {r.qms.join(" · ")}</p>}
              {r.market === "KR" && <Link to={fieldHref("krGrade")} className="self-start font-semibold hover:underline" style={{ fontSize: "var(--t-xs)", color: "var(--info)" }}>식약처 등급 입력하기 →</Link>}
              {r.links.length > 0 && (
                <p className="flex flex-wrap" style={{ gap: "var(--s-3)", fontSize: "var(--t-xs)" }}>
                  {r.links.map((l) => <Link key={l.to} to={l.to} className="font-semibold hover:underline" style={{ color: "var(--info)" }}>{l.label} →</Link>)}
                </p>
              )}
              {r.verify && <p className="text-text-subtle" style={{ fontSize: 11, lineHeight: "var(--lh-base)" }}>원문 확인 필요 — {r.source}</p>}
            </div>
          ))}
        </div>
      )}
      {missing.length > 0 && (
        <div className="rounded-[var(--r-md)]" style={{ marginTop: "var(--s-3)", padding: "var(--s-3) var(--s-4)", background: "var(--warning-bg)" }}>
          {missing.map((m) => (
            <p key={m.cert} style={{ fontSize: "var(--t-sm)", color: "var(--warning)", lineHeight: "var(--lh-base)" }}>
              <b>{m.cert}</b>도 필요합니다 — {m.why} <Link to={fieldHref("qmsCerts")} className="font-semibold underline decoration-dotted">품질 인증 고르기</Link>
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

/** /auto/overview — 스펙을 넣으면 나오는 결과를 한 화면에. 각 카드는 상세 단계로 이어진다. */
export function OverviewPage() {
  const { spec, assumed, assumeOn, estimated } = useWorkingSpec();
  const results = useResults();
  const confirm = useClassConfirm();
  const { filled, total } = completion(spec);
  const missing = unresolvedFields(spec);
  const cls = useMemo(() => classify(spec), [spec]);
  const docSet = useMemo(() => evaluateDocSet(spec, cls), [spec, cls]);
  const gsprC = useMemo(() => gsprCounts(gsprChecklist(spec, docSet)), [spec, docSet]);
  const docCounts = countByStatus(docSet);
  const plans = useMemo(() => planStudies(spec), [spec]);
  const tasks = useMemo(() => planHumanTasks(plans), [plans]);
  const standards = useMemo(() => applicableStandards(spec), [spec]);
  const prog = resultsProgress(spec, results);
  const rawCtx = useMemo(() => buildTokenContext(spec, cls, results), [spec, cls, results]);
  const ctx = useMemo(() => markAssumed(rawCtx, assumed, estimated), [rawCtx, assumed, estimated]);
  const assumedPaths = useMemo(() => new Set(assumed.map((a) => a.path)), [assumed]);
  const estimatedPaths = useMemo(() => new Set(estimated), [estimated]);
  const filledDocs = useMemo(
    () => allLeaves()
      .map((l) => ({ leaf: l, doc: resolveDoc(l.id) }))
      .filter((x) => x.doc && x.doc.sections.some((s) => hasTokens(s.placeholder)))
      .map((x) => ({
        id: x.leaf.id, title: x.leaf.title, missing: docMissingTokens(x.doc!, ctx).length, status: docSet.find((a) => a.leafId === x.leaf.id)?.status,
        ev: docEvidence(x.doc!, fillDoc(x.doc!, ctx), ctx, assumedPaths, (i) => hasDraft(x.leaf.id, i), estimatedPaths),
      }))
      .map((x) => ({ ...x, diff: docDifficulty(x.id, x.ev), impact: docImpact(resolveDoc(x.id)!, getReview(x.id)?.values ?? null, rawCtx, (i) => hasDraft(x.id, i)) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, rawCtx, docSet, assumedPaths, estimatedPaths],
  );
  const confirmed = confirm && confirm.specHash === specHash(spec) && confirm.value === cls.value;
  const overall = overallDifficulty(cls.value, filledDocs.filter((d) => d.status !== "excluded").map((d) => d.diff));
  const studyCounts = plans.reduce((m, p) => ({ ...m, [p.status]: (m[p.status] ?? 0) + 1 }), {} as Partial<Record<ApplStatus, number>>);
  const clin = plans.find((p) => p.id === "clinical-performance");
  const realtime = plans.find((p) => p.id === "stability-realtime");
  const reqStd = standards.filter((x) => x.status === "required");
  const routes = useMemo(() => certRoutes(spec, cls), [spec, cls]);
  const qmsMissing = missingQms(spec);
  const euSelected = !!spec.markets?.includes("EU");

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="자동작성 결과" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/overview" />
          <AssumptionBanner assumed={assumed} assumeOn={assumeOn} />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>자동작성 결과</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            {spec.identity.productName ? <b className="text-text">{spec.identity.productName}</b> : "입력한 제품"}의 스펙으로 만든 결과입니다. 스펙을 고치면 이 화면과 모든 문서가 바로 바뀝니다. 카드를 눌러 자세히 보세요.
          </p>
          {filled > 0 && (
            <Link to="/auto/factory" className="inline-flex items-center gap-1.5 self-start rounded-[var(--r-md)] font-bold" style={{ fontSize: "var(--t-sm)", padding: "8px 16px", minHeight: 40, background: "var(--text)", color: "var(--bg)" }}>
              <Building2 size={16} aria-hidden /> 문서 공장 건물로 보기 · 진행률 <ArrowRight size={15} aria-hidden />
            </Link>
          )}
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

            <CertRoutes routes={routes} missing={qmsMissing} />

            <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}>
              <section className="rounded-[var(--r-lg)] border flex items-center" aria-label="인증 난이도"
                style={{ gap: "var(--s-4)", padding: "20px 24px", borderColor: MOOD_META[overall.mood].color, background: `color-mix(in srgb, ${MOOD_META[overall.mood].color} 6%, var(--bg))`, boxShadow: "var(--shadow-card)" }}>
                <DifficultyFace seed={spec.identity.productName ?? "product"} d={overall} size={1.8} />
                <div className="min-w-0">
                  <p className="font-bold text-text-muted" style={{ fontSize: "var(--t-xs)" }}>인증 난이도</p>
                  <p className="font-extrabold" style={{ fontSize: "var(--t-xl)", color: MOOD_META[overall.mood].color }}>{MOOD_META[overall.mood].label}</p>
                  {overall.reasons.map((r) => <p key={r} className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>{r}</p>)}
                  <p className="text-text-subtle" style={{ fontSize: 11, marginTop: 4 }}>{MOODS.map((m) => `${MOOD_META[m].emoji} ${MOOD_META[m].label}`).join(" · ")}</p>
                </div>
              </section>

              <Card icon={ShieldCheck} title={euSelected ? "IVDR 클래스" : "IVDR 클래스 (EU 미선택 — 참고용)"} to="/auto/docs" cta={confirmed ? "분류 근거 보기" : "확인하고 확정하기"}>
                <Big>{cls.value ? `Class ${cls.value}` : "판정 보류"}</Big>
                <Muted>{cls.value ? `${cls.rule} · ${confirmed ? "확정됨" : "추천 — 담당자 확정 전"}` : cls.rationale[0]}</Muted>
                {cls.route[0] && <Muted>적합성 평가: {cls.route[0]}</Muted>}
                <Link to="/auto/docs#gspr" className="font-semibold text-text underline decoration-dotted" style={{ fontSize: "var(--t-xs)" }}>
                  GSPR 해당 {gsprC.applies} · 확인 필요 {gsprC.check} · 비해당 {gsprC.na}
                </Link>
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
              {filledDocs.some((d) => d.impact.changes.length) && (
                <p role="status" className="rounded-[var(--r-md)] font-semibold" style={{ fontSize: "var(--t-sm)", padding: "8px 12px", marginBottom: "var(--s-3)", color: "var(--danger)", background: "color-mix(in srgb, var(--danger) 8%, var(--bg))", border: "1px solid var(--danger)" }}>
                  검토 이후 스펙·결과가 바뀐 문서 {filledDocs.filter((d) => d.impact.changes.length).length}개 — 직접 쓴 섹션 재검토 {filledDocs.reduce((n, d) => n + d.impact.review, 0)}개. 문서를 열어 바뀐 값을 확인하세요.
                </p>
              )}
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
                      <DifficultyFace seed={d.id} d={d.diff} />
                      <span className="min-w-0 flex-1">
                        <span className="inline-flex rounded-full font-bold" style={{ fontSize: 10, padding: "0 7px", marginBottom: 2, color: MOOD_META[d.diff.mood].color, border: `1px solid ${MOOD_META[d.diff.mood].color}` }}>{MOOD_META[d.diff.mood].label}</span>
                        {d.impact.changes.length > 0 && (
                          <span className="inline-flex rounded-full font-bold" style={{ fontSize: 10, padding: "0 7px", marginLeft: 4, color: "var(--text-on-color)", background: d.impact.review ? "var(--danger)" : "var(--info)" }}>
                            {d.impact.review ? `재검토 필요 ${d.impact.review}` : `값 바뀜 ${d.impact.changes.length}`}
                          </span>
                        )}
                        <span className="block font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{d.title}</span>
                        <span className="block" style={{ fontSize: "var(--t-xs)", color: d.missing ? "var(--warning)" : "var(--success)" }}>
                          {d.missing ? `스펙 미입력 항목 ${d.missing}개` : "스펙 항목 모두 채워짐"}
                          {d.status === "excluded" && <span className="text-text-subtle"> · 이 제품엔 불필요</span>}
                        </span>
                        {d.ev.confirmed !== null && (
                          <span className="flex items-center" style={{ gap: 6, marginTop: 4, fontSize: 11 }}>
                            <span style={{ width: 90 }}><EvidenceBar counts={d.ev.counts} height={5} /></span>
                            <span className="font-bold text-text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>근거 확정 {Math.round(d.ev.confirmed * 100)}%</span>
                            {d.ev.counts.assumed > 0 && <span style={{ color: "var(--warning)" }}>가정 {d.ev.counts.assumed}</span>}
                            {d.ev.counts.missing > 0 && <span style={{ color: "var(--danger)" }}>누락 {d.ev.counts.missing}</span>}
                          </span>
                        )}
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
