import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { AssumptionBanner, FieldLink, fieldHref } from "./AutoUi";
import { useWorkingSpec } from "../../hooks/useSpecStore";
import { classifyKr, krDocSet, KR_DOC_STATUS_LABEL, KR_RULES_REVIEWED, KR_SELF_TEST_ITEMS, KR_SOURCES, type KrDocStatus, type KrStatus } from "../../lib/kr";
import { leafById } from "../../data/docTree";
import { docById } from "../../data/documents";

const STATUS: Record<KrStatus, { label: string; fg: string; bg: string }> = {
  recommended: { label: "추천", fg: "var(--success)", bg: "var(--success-bg)" },
  provisional: { label: "잠정 추천 — 품목 분류로 확인", fg: "var(--warning)", bg: "var(--warning-bg)" },
  "needs-review": { label: "담당자 판단 필요", fg: "var(--danger)", bg: "var(--danger-bg)" },
  blocked: { label: "입력 부족", fg: "var(--danger)", bg: "var(--danger-bg)" },
};
const DOC_TONE: Record<KrDocStatus, { fg: string; bg: string }> = {
  required: { fg: "var(--text-on-color)", bg: "var(--text)" },
  conditional: { fg: "var(--info)", bg: "var(--info-bg, var(--surface))" },
  check: { fg: "var(--warning)", bg: "var(--warning-bg)" },
  excluded: { fg: "var(--text-muted)", bg: "var(--surface)" },
};
const SELF = {
  allowed: { label: "허용 품목", fg: "var(--success)", bg: "var(--success-bg)" },
  check: { label: "확인 필요", fg: "var(--warning)", bg: "var(--warning-bg)" },
  "not-applicable": { label: "해당 없음", fg: "var(--text-muted)", bg: "var(--surface)" },
} as const;

const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" } as const;
const titleOf = (id: string) => leafById(id)?.title ?? docById(id)?.docTitle ?? id;

/** /auto/kr — 한국 식약처(MFDS) 등급 추천·자가검사 허용 품목·국내 제출 자료. */
export function KrPage() {
  const { spec, assumed, assumeOn } = useWorkingSpec();
  const kr = useMemo(() => classifyKr(spec), [spec]);
  const docs = useMemo(() => krDocSet(spec, kr), [spec, kr]);
  const selected = spec.markets?.includes("KR") ?? false;
  const st = STATUS[kr.status];
  const self = SELF[kr.selfTest.status];

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="한국(MFDS)" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/kr" />
          <AssumptionBanner assumed={assumed} assumeOn={assumeOn} />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>한국 식약처(MFDS) 인증</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 720 }}>
            체외진단의료기기 등급을 추천하고, 자가검사용 허용 품목인지와 국내 제출 자료를 정리합니다. 등급은 식약처 고시의 품목별 등급으로 최종 정해지므로 추천은 품목을 찾는 출발점입니다.
          </p>
        </header>

        {!selected && (
          <div role="status" className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", padding: "var(--s-4) var(--s-6)", marginBottom: "var(--s-6)", fontSize: "var(--t-sm)", color: "var(--warning)" }}>
            제품 인증에서 '한국 (MFDS)'을 고르지 않았습니다. 아래는 참고용입니다. <Link to={fieldHref("markets")} className="font-bold underline">인증 고르기</Link>
          </div>
        )}

        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          {/* 등급 카드 */}
          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="kr-grade-title">
            <div className="flex flex-wrap items-start" style={{ gap: "var(--s-6)" }}>
              <div className="flex flex-col items-center justify-center rounded-[var(--r-lg)] shrink-0" style={{ width: 120, height: 120, background: kr.grade ? "var(--accent-weak)" : "var(--surface)" }}>
                <span className="text-text-muted font-bold" style={{ fontSize: "var(--t-xs)" }}>추천 등급</span>
                <span id="kr-grade-title" className="font-extrabold" style={{ fontSize: 44, lineHeight: 1.1, color: kr.grade ? "var(--accent)" : "var(--text-subtle)" }}>{kr.grade ? `${kr.grade}등급` : "?"}</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col" style={{ gap: "var(--s-3)", minWidth: 260 }}>
                <div className="flex flex-wrap items-center" style={{ gap: "var(--s-2)" }}>
                  <span className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "3px 10px", color: st.fg, background: st.bg }}>{st.label}</span>
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>근거: {kr.rule}</span>
                </div>
                <p className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>경로: {kr.route}</p>
                <ul className="flex flex-col" style={{ gap: 4, paddingLeft: 18, listStyle: "disc" }}>
                  {kr.rationale.map((r) => <li key={r} className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{r}</li>)}
                </ul>
                {kr.openQuestions.length > 0 && (
                  <p className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
                    답하지 않은 항목: {kr.openQuestions.map((p, i) => <span key={p}>{i > 0 && ", "}<FieldLink path={p} /></span>)}
                  </p>
                )}
                <div className="rounded-[var(--r-md)] flex flex-wrap items-center" style={{ gap: "var(--s-3)", padding: "var(--s-3) var(--s-4)", background: "var(--surface)", border: `1px solid ${kr.confirmed.matches === false ? "var(--warning)" : "var(--border)"}` }}>
                  {kr.confirmed.value ? (
                    kr.confirmed.matches === false ? (
                      <span className="inline-flex items-center gap-1 font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--warning)" }}>
                        <AlertTriangle size={16} aria-hidden /> 확인한 등급({kr.confirmed.value}등급)이 추천({kr.grade}등급)과 다릅니다 — 품목 분류 근거를 기록하세요. 경로는 확인한 등급을 따릅니다.
                      </span>
                    ) : (
                      <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>담당자가 확인한 등급: {kr.confirmed.value}등급</span>
                    )
                  ) : (
                    <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>아직 품목 분류로 확인한 등급이 없습니다.</span>
                  )}
                  <Link to={fieldHref("krGrade")} className="ml-auto font-bold hover:underline" style={{ fontSize: "var(--t-sm)", color: "var(--accent)" }}>확인한 등급 입력 →</Link>
                </div>
                <div>
                  <h2 className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 4 }}>진행 순서</h2>
                  <ol className="flex flex-col" style={{ gap: 2, paddingLeft: 18, listStyle: "decimal" }}>
                    {kr.steps.map((x) => <li key={x} className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>{x}</li>)}
                  </ol>
                </div>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-4)", paddingTop: "var(--s-3)", borderTop: "1px solid var(--border)" }}>
              <ShieldCheck size={14} aria-hidden />
              {KR_RULES_REVIEWED.by ? `한국 규칙 검토: ${KR_RULES_REVIEWED.by} · ${KR_RULES_REVIEWED.date}` : `원문 확인 필요 — ${KR_SOURCES.law} / ${KR_SOURCES.notice}. 담당자 검토 전 참고용입니다.`}
            </p>
          </section>

          {/* 자가검사 허용 품목 */}
          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="kr-self-title">
            <div className="flex flex-wrap items-center justify-between" style={{ gap: "var(--s-3)" }}>
              <h2 id="kr-self-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>자가검사용 허용 품목</h2>
              <span data-selftest={kr.selfTest.status} className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "4px 10px", color: self.fg, background: self.bg }}>{self.label}</span>
            </div>
            <p className="text-text" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)", lineHeight: "var(--lh-base)" }}>{kr.selfTest.reason}</p>
            {kr.selfTest.labelling.length > 0 && (
              <ul className="flex flex-col" style={{ gap: 2, paddingLeft: 18, listStyle: "disc", marginTop: "var(--s-2)" }}>
                {kr.selfTest.labelling.map((x) => <li key={x} className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>표시: {x}</li>)}
              </ul>
            )}
            <details style={{ marginTop: "var(--s-3)" }}>
              <summary className="font-semibold text-text-muted cursor-pointer" style={{ fontSize: "var(--t-xs)" }}>앱이 알고 있는 허용 품목 {KR_SELF_TEST_ITEMS.length}개 (전체 목록 아님)</summary>
              <ul className="flex flex-col" style={{ gap: 2, paddingLeft: 18, listStyle: "disc", marginTop: 6 }}>
                {KR_SELF_TEST_ITEMS.map((i) => <li key={i.key} className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>{i.label} — {i.source} (확인 {i.checked})</li>)}
              </ul>
              <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: 4 }}>{KR_SOURCES.selfTest}. 기존 9개 품목 전체는 고시 원문으로 확인하세요.</p>
            </details>
          </section>

          {/* 국내 제출 자료 */}
          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="kr-docs-title">
            <div className="flex flex-wrap items-baseline justify-between" style={{ gap: "var(--s-3)" }}>
              <h2 id="kr-docs-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>국내 제출 자료</h2>
              <Link to="/doc/kr-technical-doc" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "8px 14px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
                한국 기술문서 초안 열기 <ChevronRight size={16} aria-hidden />
              </Link>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>IVDR용으로 쓴 문서 중 다시 쓸 수 있는 것을 함께 보여 줍니다.</p>
            <ul style={{ marginTop: "var(--s-3)" }}>
              {docs.map((d) => (
                <li key={d.id} data-krdoc={d.id} data-status={d.status} className="grid items-start" style={{ gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px var(--s-3)", padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
                  <span className="font-semibold text-text min-w-0" style={{ fontSize: "var(--t-sm)" }}>{d.title}</span>
                  <span className="rounded-full font-bold whitespace-nowrap" style={{ fontSize: "var(--t-xs)", padding: "2px 9px", color: DOC_TONE[d.status].fg, background: DOC_TONE[d.status].bg }}>{KR_DOC_STATUS_LABEL[d.status]}</span>
                  <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", gridColumn: "1 / -1" }}>
                    {d.reason}
                    {d.reuse.length > 0 && <> · 다시 쓸 문서: {d.reuse.map((id, i) => <span key={id}>{i > 0 && ", "}<Link to={`/doc/${id}`} className="underline decoration-dotted">{titleOf(id)}</Link></span>)}</>}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
