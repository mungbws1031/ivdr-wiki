import { Link } from "react-router-dom";
import { FieldLink } from "./AutoUi";
import { RULE_VERDICT_LABEL, type RuleRow, type RuleVerdict } from "../../lib/rules/justify";
import { GSPR_CHAPTERS, GSPR_VERDICT_LABEL, gsprCounts, type GsprRow, type GsprVerdict } from "../../lib/gspr";

const RULE_TONE: Record<RuleVerdict, { fg: string; bg: string }> = {
  applies: { fg: "var(--accent)", bg: "var(--accent-weak)" },
  not: { fg: "var(--text-muted)", bg: "var(--surface)" },
  unknown: { fg: "var(--warning)", bg: "var(--warning-bg)" },
};
const GSPR_TONE: Record<GsprVerdict, { fg: string; bg: string }> = {
  applies: { fg: "var(--success)", bg: "var(--success-bg)" },
  na: { fg: "var(--text-muted)", bg: "var(--surface)" },
  check: { fg: "var(--warning)", bg: "var(--warning-bg)" },
};

function Pill({ label, tone }: { label: string; tone: { fg: string; bg: string } }) {
  return (
    <span className="inline-block rounded-full font-bold whitespace-nowrap" style={{ fontSize: "var(--t-xs)", padding: "2px 9px", color: tone.fg, background: tone.bg, border: "1px solid var(--border)" }}>
      {label}
    </span>
  );
}

const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" } as const;
const th = "text-left font-bold text-text-muted";
const cell = { padding: "8px 10px", borderBottom: "1px solid var(--border)", verticalAlign: "top" } as const;

/** Rule 1~7 판정표 — 규칙마다 해당·비해당 이유. */
export function RuleTable({ rows, decided }: { rows: RuleRow[]; decided: string }) {
  return (
    <section id="rules" className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="rules-title">
      <h2 id="rules-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>Rule 1~7 판정표</h2>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
        모든 규칙을 순서대로 검토합니다. Rule 6은 Rule 1~5가 모두 비해당일 때만 적용합니다. 둘 이상 해당하면 높은 클래스를 씁니다. 결정 규칙: <b className="text-text">{decided}</b>
      </p>
      <div className="overflow-x-auto" style={{ marginTop: "var(--s-4)" }}>
        <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "var(--t-sm)", minWidth: 520 }}>
          <thead>
            <tr><th className={th} style={cell}>규칙</th><th className={th} style={cell}>해당 여부</th><th className={th} style={cell}>클래스</th><th className={th} style={cell}>이유</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rule} data-rule={r.rule} data-verdict={r.verdict}>
                <td className="font-bold text-text whitespace-nowrap" style={cell}>{r.rule}</td>
                <td style={cell}><Pill label={RULE_VERDICT_LABEL[r.verdict]} tone={RULE_TONE[r.verdict]} /></td>
                <td className="font-bold text-text" style={cell}>{r.cls ?? "—"}</td>
                <td className="text-text" style={{ ...cell, lineHeight: "var(--lh-base)" }}>
                  {r.reason}
                  {r.fields.length > 0 && (
                    <span className="block text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>
                      입력: {r.fields.map((p, i) => <span key={p}>{i > 0 && ", "}<FieldLink path={p} /></span>)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)" }}>
        이 표는 <Link to="/doc/classification-rationale" className="underline">분류 근거서</Link> 2절에 그대로 들어갑니다.
      </p>
    </section>
  );
}

/** GSPR(Annex I) 1차 판정 — 장별 표. */
export function GsprTable({ rows, title }: { rows: GsprRow[]; title: (id: string) => string }) {
  const c = gsprCounts(rows);
  return (
    <section id="gspr" className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="gspr-title">
      <div className="flex flex-wrap items-baseline justify-between" style={{ gap: "var(--s-3)" }}>
        <h2 id="gspr-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>GSPR 1차 판정 (Annex I)</h2>
        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {(["applies", "check", "na"] as GsprVerdict[]).map((v) => (
            <span key={v} className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "4px 10px", color: GSPR_TONE[v].fg, background: GSPR_TONE[v].bg, fontVariantNumeric: "tabular-nums" }}>
              {GSPR_VERDICT_LABEL[v]} {c[v]}
            </span>
          ))}
        </div>
      </div>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
        제품 스펙으로 조항마다 적용 여부를 먼저 정했습니다. 충족 방법과 증거 위치는 <Link to="/doc/tech-doc-toc-gspr" className="underline">기술문서 GSPR 체크리스트</Link>에서 채웁니다.
      </p>
      {([1, 2, 3] as const).map((ch) => (
        <div key={ch} style={{ marginTop: "var(--s-4)" }}>
          <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)", marginBottom: 4 }}>{GSPR_CHAPTERS[ch]}</h3>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "var(--t-sm)", minWidth: 620, tableLayout: "fixed" }}>
              <colgroup><col style={{ width: 56 }} /><col style={{ width: "24%" }} /><col style={{ width: 96 }} /><col /><col style={{ width: "24%" }} /></colgroup>
              <thead>
                <tr><th className={th} style={cell}>조항</th><th className={th} style={cell}>요구사항 (요약)</th><th className={th} style={cell}>판정</th><th className={th} style={cell}>이유</th><th className={th} style={cell}>근거 문서</th></tr>
              </thead>
              <tbody>
                {rows.filter((r) => r.chapter === ch).map((r) => (
                  <tr key={r.no} data-gspr={r.no} data-verdict={r.verdict}>
                    <td className="font-bold text-text" style={cell}>§{r.no}</td>
                    <td className="text-text" style={cell}>{r.title}</td>
                    <td style={cell}><Pill label={GSPR_VERDICT_LABEL[r.verdict]} tone={GSPR_TONE[r.verdict]} /></td>
                    <td className="text-text-muted" style={{ ...cell, lineHeight: "var(--lh-base)" }}>
                      {r.reason}
                      {r.verdict === "check" && r.fields.length > 0 && (
                        <span className="block" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>
                          입력: {r.fields.map((p, i) => <span key={p}>{i > 0 && ", "}<FieldLink path={p} /></span>)}
                        </span>
                      )}
                    </td>
                    <td style={cell}>
                      {r.verdict === "na" ? <span className="text-text-subtle">—</span> : r.evidence.length ? (
                        <span className="flex flex-col" style={{ gap: 2 }}>
                          {r.evidence.map((id) => <Link key={id} to={`/doc/${id}`} className="text-text hover:underline" style={{ fontSize: "var(--t-xs)" }}>{title(id)}</Link>)}
                        </span>
                      ) : <span style={{ color: "var(--warning)", fontSize: "var(--t-xs)" }}>근거 문서 지정 필요</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)" }}>
        원문 확인 필요 · 1차 판정 — 조항 제목은 요약이며 IVDR Annex I 원문과 대조하지 않았습니다. 확인 필요 조항은 담당자가 판정해 주세요.
      </p>
    </section>
  );
}
