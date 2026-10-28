import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { docTree } from "../../data/docTree";
import { Chip, FieldLink, STATUS_META } from "./AutoUi";
import { completion, specHash } from "../../data/spec/validate";
import { useSpec } from "../../hooks/useSpecStore";
import { clearClassConfirm, confirmClass, useClassConfirm } from "../../hooks/useClassConfirm";
import { classify, RULES_REVIEWED, type ClassStatus } from "../../lib/rules/classify";
import { BASE_REQUIRED_REASON, countByStatus, evaluateDocSet, type Applicability, type ApplStatus } from "../../lib/rules/applicability";

const CLASS_STATUS: Record<ClassStatus, { label: string; fg: string; bg: string }> = {
  recommended: { label: "추천", fg: "var(--success)", bg: "var(--success-bg)" },
  provisional: { label: "잠정 추천", fg: "var(--warning)", bg: "var(--warning-bg)" },
  "needs-review": { label: "RA 판단 필요", fg: "var(--danger)", bg: "var(--danger-bg)" },
  blocked: { label: "입력 부족", fg: "var(--danger)", bg: "var(--danger-bg)" },
};

function DocRow({ a, title }: { a: Applicability; title: string }) {
  return (
    <li className="grid items-start" style={{ gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px var(--s-3)", padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
      <Link to={`/doc/${a.leafId}`} className="font-semibold text-text hover:underline min-w-0" style={{ fontSize: "var(--t-sm)" }}>
        {title}
      </Link>
      <Chip s={a.status} />
      {a.reason !== BASE_REQUIRED_REASON && <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", gridColumn: "1 / -1" }}>
        {a.reason}
        {a.status === "unknown" && a.dependsOn.length > 0 && (
          <> 입력: {a.dependsOn.map((p, i) => <span key={p}>{i > 0 && ", "}<FieldLink path={p} /></span>)}</>
        )}
      </p>}
    </li>
  );
}

/** /auto/docs — 클래스 추천 + 필요한 문서 세트 (자동작성 2단계). */
export function DocSetPage() {
  const spec = useSpec();
  const confirm = useClassConfirm();
  const [showExcluded, setShowExcluded] = useState(false);
  const cls = useMemo(() => classify(spec), [spec]);
  const set = useMemo(() => evaluateDocSet(spec, cls), [spec, cls]);
  const counts = countByStatus(set);
  const hash = specHash(spec);
  const { filled } = completion(spec);
  const stale = confirm && (confirm.specHash !== hash || confirm.value !== cls.value);
  const cs = CLASS_STATUS[cls.status];

  const titleOf = new Map(docTree.flatMap((g) => g.items.map((l) => [l.id, l.title] as const)));
  const unknowns = set.filter((a) => a.status === "unknown");
  const excluded = set.filter((a) => a.status === "excluded");

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="분류·문서 세트" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/docs" />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>분류·문서 세트</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 720 }}>
            제품 스펙으로 IVDR 클래스를 추천하고, 문서 {set.length}개 각각이 이 제품에 필요한지 이유와 함께 판정합니다.
            추천일 뿐이며 클래스는 담당자가 확정합니다.
          </p>
        </header>

        {filled === 0 ? (
          <div className="rounded-[var(--r-lg)] border text-center" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-12) var(--s-6)" }}>
            <p className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>먼저 제품 스펙을 입력하세요</p>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)" }}>제품 유형, 사용자, 분석물만 입력해도 클래스 추천이 나옵니다.</p>
            <Link to="/auto" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ marginTop: "var(--s-4)", padding: "10px 18px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
              제품 스펙 입력하기 <ChevronRight size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
            {/* 클래스 카드 */}
            <section className="rounded-[var(--r-lg)] border bg-bg" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" }} aria-labelledby="cls-title">
              <div className="flex flex-wrap items-start" style={{ gap: "var(--s-6)" }}>
                <div className="flex flex-col items-center justify-center rounded-[var(--r-lg)] shrink-0" style={{ width: 120, height: 120, background: cls.value ? "var(--accent-weak)" : "var(--surface)" }}>
                  <span className="text-text-muted font-bold" style={{ fontSize: "var(--t-xs)" }}>추천 클래스</span>
                  <span id="cls-title" className="font-extrabold" style={{ fontSize: 52, lineHeight: 1.1, color: cls.value ? "var(--accent)" : "var(--text-subtle)" }}>
                    {cls.value ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col" style={{ gap: "var(--s-3)", minWidth: 260 }}>
                  <div className="flex flex-wrap items-center" style={{ gap: "var(--s-2)" }}>
                    <span className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "3px 10px", color: cs.fg, background: cs.bg }}>{cs.label}</span>
                    <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>적용 규칙: {cls.rule}</span>
                  </div>
                  <ul className="flex flex-col" style={{ gap: 4, paddingLeft: 18, listStyle: "disc" }}>
                    {cls.rationale.map((r) => <li key={r} className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{r}</li>)}
                  </ul>
                  {cls.openQuestions.length > 0 && (
                    <p className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
                      답하지 않은 항목: {cls.openQuestions.map((p, i) => <span key={p}>{i > 0 && ", "}<FieldLink path={p} /></span>)}
                    </p>
                  )}
                  {cls.route.length > 0 && (
                    <div>
                      <h2 className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 4 }}>적합성 평가 경로</h2>
                      <ul className="flex flex-col" style={{ gap: 2, paddingLeft: 18, listStyle: "disc" }}>
                        {cls.route.map((r) => <li key={r} className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>근거: {cls.citations.join(" · ")}</p>

                  {/* 확정 */}
                  <div className="flex flex-wrap items-center rounded-[var(--r-md)]" style={{ gap: "var(--s-3)", padding: "var(--s-3) var(--s-4)", background: "var(--surface)", border: `1px solid ${stale ? "var(--warning)" : "var(--border)"}` }}>
                    {confirm && !stale ? (
                      <>
                        <CheckCircle2 size={18} style={{ color: "var(--success)" }} aria-hidden />
                        <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>Class {confirm.value} 확정됨</span>
                        <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{new Date(confirm.at).toLocaleString("ko-KR")}</span>
                        <button type="button" onClick={clearClassConfirm} className="ml-auto font-semibold text-text-muted hover:text-text" style={{ fontSize: "var(--t-xs)" }}>확정 취소</button>
                      </>
                    ) : (
                      <>
                        {stale && (
                          <span className="inline-flex items-center gap-1 font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--warning)" }}>
                            <AlertTriangle size={16} aria-hidden /> 확정 후 스펙이 바뀌었습니다 (확정: Class {confirm!.value}) — 다시 확인해 주세요
                          </span>
                        )}
                        {!stale && <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>아직 확정 전입니다. 확정하면 다음 단계(실험계획·문서 작성)가 이 클래스로 진행됩니다.</span>}
                        <button
                          type="button"
                          disabled={!cls.value || cls.status === "blocked" || cls.status === "needs-review"}
                          onClick={() => cls.value && confirmClass(cls.value, hash)}
                          className="ml-auto rounded-[var(--r-md)] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ fontSize: "var(--t-sm)", padding: "8px 16px", minHeight: 40, background: "var(--accent)", color: "var(--text-on-color)" }}
                        >
                          {cls.value ? `Class ${cls.value}로 확정` : "확정할 수 없음"}
                        </button>
                      </>
                    )}
                  </div>
                  {cls.status === "provisional" && cls.value && <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>잠정 추천도 확정할 수 있지만, 답하지 않은 항목을 먼저 채우는 것을 권합니다.</p>}
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-4)", paddingTop: "var(--s-3)", borderTop: "1px solid var(--border)" }}>
                <ShieldCheck size={14} aria-hidden />
                {RULES_REVIEWED.by ? `분류 규칙 검토: ${RULES_REVIEWED.by} · ${RULES_REVIEWED.date}` : "분류 규칙은 아직 RA 담당자 검토 전입니다. 참고용으로 쓰고, 실제 제출 전에는 최신 IVDR·MDCG 가이드로 확인하세요."}
              </p>
            </section>

            {/* 문서 세트 요약 */}
            <section aria-labelledby="set-title" className="flex flex-col" style={{ gap: "var(--s-4)" }}>
              <div className="flex flex-wrap items-baseline justify-between" style={{ gap: "var(--s-3)" }}>
                <div>
                  <h2 id="set-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>이 제품에 필요한 문서</h2>
                  <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>이유가 적히지 않은 필수 문서는 제품과 관계없이 모든 IVDR 제품에 필요한 문서입니다.</p>
                </div>
                <div className="flex flex-wrap" style={{ gap: 6 }}>
                  {(["required", "recommended", "optional", "unknown", "excluded"] as ApplStatus[]).map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "4px 10px", background: STATUS_META[s].bg, color: STATUS_META[s].fg, fontVariantNumeric: "tabular-nums" }}>
                      {STATUS_META[s].label} {counts[s]}
                    </span>
                  ))}
                </div>
              </div>

              {unknowns.length > 0 && (
                <div className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", padding: "var(--s-4) var(--s-6)" }}>
                  <h3 className="font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--warning)" }}>확인 필요 {unknowns.length}개 — 스펙을 채우거나 직접 판단해 주세요</h3>
                  <ul>{unknowns.map((a) => <DocRow key={a.leafId} a={a} title={titleOf.get(a.leafId) ?? a.leafId} />)}</ul>
                </div>
              )}

              <div className="grid" style={{ gap: "var(--s-4)", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))" }}>
                {docTree.map((g) => {
                  const rows = g.items
                    .map((l) => set.find((a) => a.leafId === l.id)!)
                    .filter((a) => a.status !== "excluded" && a.status !== "unknown");
                  if (!rows.length) return null;
                  return (
                    <section key={g.id} className="rounded-[var(--r-lg)] border bg-bg" style={{ borderColor: "var(--border)", borderTop: `4px solid var(${g.colorVar})`, padding: "var(--s-4) var(--s-6)" }}>
                      <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                        {g.title} <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{rows.length}</span>
                      </h3>
                      <ul>{rows.map((a) => <DocRow key={a.leafId} a={a} title={titleOf.get(a.leafId) ?? a.leafId} />)}</ul>
                    </section>
                  );
                })}
              </div>

              <div className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <button
                  type="button"
                  onClick={() => setShowExcluded((x) => !x)}
                  aria-expanded={showExcluded}
                  className="w-full flex items-center gap-2 text-left font-bold text-text"
                  style={{ padding: "var(--s-4) var(--s-6)", fontSize: "var(--t-sm)" }}
                >
                  {showExcluded ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
                  불필요로 판정된 문서 {excluded.length}개
                  <span className="font-normal text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>NB 심사 때 제외 사유로 그대로 쓸 수 있습니다</span>
                </button>
                {showExcluded && (
                  <ul style={{ padding: "0 var(--s-6) var(--s-4)" }}>
                    {excluded.map((a) => <DocRow key={a.leafId} a={a} title={titleOf.get(a.leafId) ?? a.leafId} />)}
                  </ul>
                )}
              </div>
            </section>

            <Link
              to="/auto/transport"
              className="flex items-center justify-between rounded-[var(--r-lg)] font-bold self-end"
              style={{ padding: "var(--s-4) var(--s-6)", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)", gap: "var(--s-4)" }}
            >
              다음: 운송·포장 <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
