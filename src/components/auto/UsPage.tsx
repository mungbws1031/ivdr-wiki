import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { AssumptionBanner, fieldHref } from "./AutoUi";
import { useWorkingSpec } from "../../hooks/useSpecStore";
import { classifyUs, PATHWAY_LABEL, US_DOC_STATUS_LABEL, US_KNOWN, US_RULES_REVIEWED, usDocSet, type UsDocStatus, type UsStatus } from "../../lib/us";
import { leafById } from "../../data/docTree";
import { docById } from "../../data/documents";

const STATUS: Record<UsStatus, { label: string; fg: string; bg: string }> = {
  provisional: { label: "잠정 추천 — 제품 코드로 확인", fg: "var(--warning)", bg: "var(--warning-bg)" },
  "needs-review": { label: "담당자 판단 필요", fg: "var(--danger)", bg: "var(--danger-bg)" },
  blocked: { label: "입력 부족", fg: "var(--danger)", bg: "var(--danger-bg)" },
};
const DOC_TONE: Record<UsDocStatus, { fg: string; bg: string }> = {
  required: { fg: "var(--text-on-color)", bg: "var(--text)" },
  conditional: { fg: "var(--info)", bg: "var(--surface)" },
  check: { fg: "var(--warning)", bg: "var(--warning-bg)" },
  excluded: { fg: "var(--text-muted)", bg: "var(--surface)" },
};
const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" } as const;
const titleOf = (id: string) => leafById(id)?.title ?? docById(id)?.docTitle ?? id;

/** /auto/us — 미국 FDA 분류·인허가 경로·CLIA·제출 자료. */
export function UsPage() {
  const { spec, assumed, assumeOn } = useWorkingSpec();
  const us = useMemo(() => classifyUs(spec), [spec]);
  const docs = useMemo(() => usDocSet(spec, us), [spec, us]);
  const selected = spec.markets?.includes("US") ?? false;
  const st = STATUS[us.status];

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="미국(FDA)" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/us" />
          <AssumptionBanner assumed={assumed} assumeOn={assumeOn} />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>미국 FDA 인허가</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 720 }}>
            체외진단기기 등급(Class I~III)과 인허가 경로(면제·510(k)·De Novo·PMA), CLIA 분류, 제출 자료를 정리합니다. 등급은 FDA 분류 데이터베이스의 제품 코드로 최종 정해지므로 추천은 제품 코드를 찾는 출발점입니다.
          </p>
        </header>

        {!selected && (
          <div role="status" className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", padding: "var(--s-4) var(--s-6)", marginBottom: "var(--s-6)", fontSize: "var(--t-sm)", color: "var(--warning)" }}>
            제품 인증에서 '미국 (FDA)'을 고르지 않았습니다. 아래는 참고용입니다. <Link to={fieldHref("markets")} className="font-bold underline">인증 고르기</Link>
          </div>
        )}

        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="us-class-title">
            <div className="flex flex-wrap items-start" style={{ gap: "var(--s-6)" }}>
              <div className="flex flex-col items-center justify-center rounded-[var(--r-lg)] shrink-0" style={{ width: 120, height: 120, background: us.deviceClass ? "var(--accent-weak)" : "var(--surface)" }}>
                <span className="text-text-muted font-bold" style={{ fontSize: "var(--t-xs)" }}>추천 등급</span>
                <span id="us-class-title" className="font-extrabold whitespace-nowrap" style={{ fontSize: 30, lineHeight: 1.1, color: us.deviceClass ? "var(--accent)" : "var(--text-subtle)" }}>{us.deviceClass ? `Class ${us.deviceClass}` : "?"}</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col" style={{ gap: "var(--s-3)", minWidth: 260 }}>
                <div className="flex flex-wrap items-center" style={{ gap: "var(--s-2)" }}>
                  <span className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "3px 10px", color: st.fg, background: st.bg }}>{st.label}</span>
                  {us.otc !== null && <span className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "3px 10px", border: "1px solid var(--border)" }}>{us.otc ? "가정용 (OTC)" : "전문가용 (Rx)"}</span>}
                </div>
                <p data-pathway={us.pathway} className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>경로: {PATHWAY_LABEL[us.pathway]}</p>
                <p className="text-text" style={{ fontSize: "var(--t-sm)" }}>규정: {us.regulation ?? "제품 코드로 확인 필요"}{us.productCode ? ` · 제품 코드(추천): ${us.productCode}` : ""}</p>
                <ul className="flex flex-col" style={{ gap: 4, paddingLeft: 18, listStyle: "disc" }}>
                  {us.rationale.map((r) => <li key={r} className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{r}</li>)}
                </ul>
                <div className="rounded-[var(--r-md)] flex flex-wrap items-center" style={{ gap: "var(--s-3)", padding: "var(--s-3) var(--s-4)", background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <span className={us.confirmedCode ? "font-bold text-text" : "text-text-muted"} style={{ fontSize: "var(--t-sm)" }}>
                    {us.confirmedCode ? `담당자가 확인한 제품 코드: ${us.confirmedCode}` : "아직 FDA 분류 데이터베이스로 확인한 제품 코드가 없습니다."}
                  </span>
                  <Link to={fieldHref("usProductCode")} className="ml-auto font-bold hover:underline" style={{ fontSize: "var(--t-sm)", color: "var(--accent)" }}>제품 코드 입력 →</Link>
                </div>
                <div>
                  <h2 className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 4 }}>진행 순서</h2>
                  <ol className="flex flex-col" style={{ gap: 2, paddingLeft: 18, listStyle: "decimal" }}>
                    {us.steps.map((x) => <li key={x} className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>{x}</li>)}
                  </ol>
                </div>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-4)", paddingTop: "var(--s-3)", borderTop: "1px solid var(--border)" }}>
              <ShieldCheck size={14} aria-hidden />
              {US_RULES_REVIEWED.by ? `미국 규칙 검토: ${US_RULES_REVIEWED.by} · ${US_RULES_REVIEWED.date}` : `원문 확인 필요 — eCFR·FDA 제품 분류 데이터베이스. 확인한 품목: ${Object.entries(US_KNOWN).map(([k, v]) => `${k} ${v.regulation.split(" (")[0]} (${v.checked})`).join(", ")}. 담당자 검토 전 참고용입니다.`}
            </p>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="us-clia-title">
            <div className="flex flex-wrap items-center justify-between" style={{ gap: "var(--s-3)" }}>
              <h2 id="us-clia-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>CLIA 분류</h2>
              <span data-clia={us.clia.status} className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "4px 10px", background: "var(--surface)", border: "1px solid var(--border)" }}>{us.clia.label}</span>
            </div>
            <p className="text-text" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)", lineHeight: "var(--lh-base)" }}>{us.clia.reason}</p>
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="us-docs-title">
            <div className="flex flex-wrap items-baseline justify-between" style={{ gap: "var(--s-3)" }}>
              <h2 id="us-docs-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>제출 자료</h2>
              <Link to="/doc/us-510k-draft" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "8px 14px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
                510(k) 초안 열기 <ChevronRight size={16} aria-hidden />
              </Link>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>IVDR용으로 쓴 문서 중 다시 쓸 수 있는 것을 함께 보여 줍니다. FDA 제출은 영어로 하므로 번역이 필요합니다.</p>
            <ul style={{ marginTop: "var(--s-3)" }}>
              {docs.map((d) => (
                <li key={d.id} data-usdoc={d.id} data-status={d.status} className="grid items-start" style={{ gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px var(--s-3)", padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
                  <span className="font-semibold text-text min-w-0" style={{ fontSize: "var(--t-sm)" }}>{d.title}</span>
                  <span className="rounded-full font-bold whitespace-nowrap" style={{ fontSize: "var(--t-xs)", padding: "2px 9px", color: DOC_TONE[d.status].fg, background: DOC_TONE[d.status].bg }}>{US_DOC_STATUS_LABEL[d.status]}</span>
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
