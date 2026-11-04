import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Download, Info, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { StorageNote } from "../StorageNote";
import { AutoSteps } from "./AutoSteps";
import { AssumptionBanner, fieldHref, DraftNotice, WikiLink } from "./AutoUi";
import { DsoSection } from "./DsoSection";
import { useWorkingSpec } from "../../hooks/useSpecStore";
import { useResults } from "../../hooks/useResultsStore";
import { updateTraceStore, useTraceStore } from "../../hooks/useTraceStore";
import { buildTrace, textHash, traceCsv, type GapLevel, type ReqCategory, type TraceGap, type TraceRow, type TraceVfy } from "../../lib/trace";

const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" } as const;
const LEVEL: Record<GapLevel, { label: string; fg: string; bg: string }> = {
  high: { label: "빠짐", fg: "var(--danger)", bg: "color-mix(in srgb, var(--danger) 10%, var(--bg))" },
  mid: { label: "확인", fg: "var(--warning)", bg: "var(--warning-bg)" },
  info: { label: "참고", fg: "var(--text-muted)", bg: "var(--surface)" },
};
const CATS: ReqCategory[] = ["성능", "안정성", "사용적합성", "안전", "검체", "사용자 요구", "기타"];

const chip = (text: string, fg: string, bg: string, title?: string) => (
  <span title={title} className="inline-flex items-center rounded-full font-semibold" style={{ fontSize: 11, padding: "1px 8px", color: fg, background: bg, fontFamily: "var(--font-mono, ui-monospace, monospace)", whiteSpace: "nowrap" }}>{text}</span>
);
const vfyChip = (v: TraceVfy) => chip(v.id.replace("VFY-", "VFY·"), "var(--text)", "var(--surface-2)", v.title);
function evdChip(v: TraceVfy) {
  if (v.verdict === "pass") return chip("PASS", "var(--success)", "var(--success-bg)", `${v.title}${v.date ? ` · ${v.date}` : ""}${v.rawRef ? ` · ${v.rawRef}` : ""}`);
  if (v.verdict === "fail") return chip("FAIL", "var(--danger)", "color-mix(in srgb, var(--danger) 10%, var(--bg))", v.title);
  if (v.verdict === "in-progress") return chip("진행 중", "var(--info)", "var(--info-bg)", v.title);
  return chip("증거 없음", "var(--text-subtle)", "var(--surface)", v.title);
}

function gapLink(g: TraceGap) {
  if (g.fix.kind === "field" && g.fix.path) return fieldHref(g.fix.path);
  if (g.fix.kind === "results") return "/auto/results";
  return `#row-${g.ref}`;
}

function EditLinks({ row, all }: { row: TraceRow; all: TraceVfy[] }) {
  const [pick, setPick] = useState("");
  const rid = row.req.id;
  const remove = (vid: string) => updateTraceStore((s) => {
    const k = `${rid}|${vid}`;
    return s.added.includes(k) ? { ...s, added: s.added.filter((x) => x !== k) } : { ...s, removed: [...s.removed, k] };
  });
  const restore = (vid: string) => updateTraceStore((s) => ({ ...s, removed: s.removed.filter((x) => x !== `${rid}|${vid}`) }));
  const add = () => { if (!pick) return; updateTraceStore((s) => ({ ...s, added: [...s.added.filter((x) => x !== `${rid}|${pick}`), `${rid}|${pick}`], removed: s.removed.filter((x) => x !== `${rid}|${pick}`) })); setPick(""); };
  const options = all.filter((v) => !row.vfy.some((x) => x.id === v.id));
  return (
    <div className="flex flex-col" style={{ gap: 8, padding: "10px 12px", background: "var(--surface)", borderRadius: 8 }}>
      <p className="text-text-muted" style={{ fontSize: 11 }}>검증 연결 편집 — 자동 연결은 후보입니다. 맞지 않으면 빼고, 빠진 시험을 더하세요.</p>
      <div className="flex flex-wrap" style={{ gap: 6 }}>
        {row.vfy.map((v) => (
          <span key={v.id} className="inline-flex items-center" style={{ gap: 4 }}>
            {vfyChip(v)}<span className="text-text-muted" style={{ fontSize: 11 }}>{v.title}</span>
            <button type="button" onClick={() => remove(v.id)} aria-label={`${v.id} 연결 빼기`} className="inline-grid place-items-center rounded" style={{ width: 32, height: 32, color: "var(--text-subtle)" }}><Trash2 size={14} aria-hidden /></button>
          </span>
        ))}
        {row.removed.map((vid) => (
          <button key={vid} type="button" onClick={() => restore(vid)} className="rounded-full" style={{ fontSize: 11, padding: "4px 10px", minHeight: 32, border: "1px dashed var(--border-strong)", color: "var(--text-muted)" }}>뺀 연결 되돌리기: {vid}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
        <select aria-label={`${rid}에 검증 추가`} value={pick} onChange={(e) => setPick(e.target.value)} className="rounded text-text" style={{ minHeight: 40, padding: "4px 8px", fontSize: "var(--t-xs)", border: "1.5px solid var(--border)", background: "var(--bg)", maxWidth: "100%" }}>
          <option value="">검증(시험) 고르기…</option>
          {options.map((v) => <option key={v.id} value={v.id}>{v.id} — {v.title}</option>)}
        </select>
        <button type="button" onClick={add} disabled={!pick} className="rounded font-semibold disabled:opacity-40" style={{ minHeight: 40, padding: "4px 12px", fontSize: "var(--t-xs)", border: "1px solid var(--border-strong)", color: "var(--text)" }}>연결 추가</button>
        {row.req.custom && (
          <button type="button" onClick={() => updateTraceStore((s) => ({ ...s, custom: s.custom.filter((c) => c.id !== rid), added: s.added.filter((k) => !k.startsWith(`${rid}|`)) }))}
            className="ml-auto rounded font-semibold" style={{ minHeight: 40, padding: "4px 12px", fontSize: "var(--t-xs)", color: "var(--danger)" }}>이 요구사항 삭제</button>
        )}
      </div>
    </div>
  );
}

/** /auto/trace — 요구사항 ↔ 위험 ↔ 검증 ↔ 증거 추적성 매트릭스 */
export function TracePage() {
  const { spec, assumed, assumeOn } = useWorkingSpec();
  const results = useResults();
  const store = useTraceStore();
  const t = useMemo(() => buildTrace(spec, results, store), [spec, results, store]);
  const [onlyGaps, setOnlyGaps] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [view, setView] = useState<"req" | "risk" | "dso">("req");
  const [newText, setNewText] = useState("");
  const [newCat, setNewCat] = useState<ReqCategory>("성능");
  const gapRefs = new Set(t.gaps.filter((g) => g.level !== "info").map((g) => g.ref));
  const rows = onlyGaps ? t.rows.filter((r) => gapRefs.has(r.req.id)) : t.rows;

  const review = (r: TraceRow) => updateTraceStore((s) => {
    const next = { ...s.reviewed };
    if (r.reviewed) delete next[r.req.id]; else next[r.req.id] = textHash(r.req.text);
    return { ...s, reviewed: next };
  });
  const addCustom = () => {
    if (!newText.trim()) return;
    updateTraceStore((s) => {
      const n = s.custom.reduce((m, c) => Math.max(m, Number(c.id.split("-").pop()) || 0), 0) + 1;
      return { ...s, custom: [...s.custom, { id: `REQ-USR-${String(n).padStart(3, "0")}`, category: newCat, text: newText.trim() }] };
    });
    setNewText("");
  };
  const csv = () => {
    const url = URL.createObjectURL(new Blob([traceCsv(t)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "traceability-matrix.csv"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const tiles = [
    { label: "검증이 연결된 요구사항", v: t.coverage.reqWithVfy, sub: `요구사항 ${t.coverage.reqTotal}개` },
    { label: "PASS 증거까지 있는 요구사항", v: t.coverage.reqVerified, sub: "모든 연결 검증이 PASS" },
    { label: "검증 실험이 있는 위험", v: t.coverage.riskWithVfy, sub: `위험 ${t.coverage.riskTotal}개` },
    { label: "사람이 검토한 행", v: t.coverage.reviewed, sub: "자동 연결 확정" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="추적성" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/trace" />
          <AssumptionBanner assumed={assumed} assumeOn={assumeOn} />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>추적성 매트릭스</h1>
          <DraftNotice />
          <WikiLink slug="iso-14971" />
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            제품 스펙의 요구사항이 어떤 위험·검증 시험·증거(결과)로 이어지는지 ID로 연결합니다. 자동 연결은 <b className="text-text">후보</b>이고, 행마다 "검토함"을 눌러 확정하세요. 확정 뒤 요구사항이 바뀌면 재검토로 표시됩니다.
          </p>
        </header>

        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          <div className="grid" style={{ gap: "var(--s-3)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
            {tiles.map((x) => (
              <div key={x.label} className="rounded-[var(--r-lg)] border bg-bg" style={{ borderColor: "var(--border)", padding: "14px 16px" }}>
                <p className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>{x.label}</p>
                <p className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", fontVariantNumeric: "tabular-nums" }}>{x.v}%</p>
                <span className="block rounded-full overflow-hidden" style={{ height: 6, background: "var(--border)", margin: "4px 0" }} aria-hidden><span className="block h-full" style={{ width: `${x.v}%`, background: x.v >= 90 ? "var(--success)" : x.v >= 50 ? "var(--warning)" : "var(--danger)" }} /></span>
                <p className="text-text-subtle" style={{ fontSize: 11 }}>{x.sub}</p>
              </div>
            ))}
          </div>

          {t.gaps.length > 0 && (
            <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="tr-gaps">
              <h2 id="tr-gaps" className="flex items-center gap-2 font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}><AlertTriangle size={18} style={{ color: "var(--warning)" }} aria-hidden /> 빠진 연결 {t.gaps.filter((g) => g.level === "high").length} · 확인 {t.gaps.filter((g) => g.level === "mid").length} · 참고 {t.gaps.filter((g) => g.level === "info").length}</h2>
              <ul className="flex flex-col" style={{ gap: 4, marginTop: "var(--s-3)", maxHeight: 280, overflowY: "auto" }}>
                {t.gaps.map((g, i) => (
                  <li key={i} className="flex items-center" style={{ gap: 8, fontSize: "var(--t-sm)" }}>
                    {chip(LEVEL[g.level].label, LEVEL[g.level].fg, LEVEL[g.level].bg)}
                    {g.fix.kind === "trace"
                      ? <a href={gapLink(g)} onClick={(e) => { e.preventDefault(); setOpen(g.ref); document.getElementById(`row-${g.ref}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className="text-text underline decoration-dotted" style={{ minHeight: 32, display: "inline-flex", alignItems: "center" }}>{g.text}</a>
                      : <Link to={gapLink(g)} className="text-text underline decoration-dotted" style={{ minHeight: 32, display: "inline-flex", alignItems: "center" }}>{g.text}</Link>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="tr-matrix">
            <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: "var(--s-4)" }}>
              <h2 id="tr-matrix" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginRight: "auto" }}>{view === "req" ? "요구사항 기준" : view === "risk" ? "위험 기준" : "설계 출력(DSO)"}</h2>
              {(["req", "risk", "dso"] as const).map((k) => (
                <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)} className="rounded-full font-semibold" style={{ minHeight: 40, padding: "4px 14px", fontSize: "var(--t-xs)", border: `1.5px solid ${view === k ? "var(--accent)" : "var(--border)"}`, background: view === k ? "var(--accent-weak)" : "var(--bg)", color: "var(--text)" }}>{k === "req" ? "요구사항 → 검증" : k === "risk" ? "위험 → 통제 → 검증" : "설계 출력"}</button>
              ))}
              {view === "req" && <label className="inline-flex items-center gap-1.5 text-text" style={{ fontSize: "var(--t-xs)", minHeight: 40 }}><input type="checkbox" checked={onlyGaps} onChange={(e) => setOnlyGaps(e.target.checked)} style={{ width: 18, height: 18 }} /> 빠진 연결만</label>}
              {view !== "dso" && <button type="button" onClick={csv} className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-semibold" style={{ minHeight: 40, padding: "4px 12px", fontSize: "var(--t-xs)", border: "1px solid var(--border-strong)", color: "var(--text)" }}><Download size={14} aria-hidden /> CSV (엑셀)</button>}
            </div>

            {view === "dso" ? <DsoSection trace={t} /> : (
            <div className="overflow-x-auto">
              {view === "req" ? (
                <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 900, fontSize: "var(--t-sm)" }}>
                  <thead><tr className="text-left text-text-muted" style={{ fontSize: 11 }}>
                    {["REQ", "요구사항", "RSK", "VFY (검증)", "증거", "검토"].map((h) => <th key={h} style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {rows.map((r) => (
                      <Fragment key={r.req.id}>
                        <tr id={`row-${r.req.id}`} style={{ borderBottom: open === r.req.id ? "none" : "1px solid var(--border)", verticalAlign: "top", scrollMarginTop: 80 }}>
                          <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                            <button type="button" onClick={() => setOpen(open === r.req.id ? null : r.req.id)} aria-expanded={open === r.req.id} className="font-bold text-text underline decoration-dotted" style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, minHeight: 32 }}>{r.req.id}</button>
                            <span className="block text-text-subtle" style={{ fontSize: 10 }}>{r.req.category}{r.req.custom ? " · 직접 추가" : ""}</span>
                          </td>
                          <td style={{ padding: 8, maxWidth: 340 }}>
                            <span className="text-text" style={{ lineHeight: "var(--lh-base)" }}>{r.req.text}</span>
                            {r.req.missingValue && r.req.source && <Link to={fieldHref(r.req.source)} className="block font-semibold underline decoration-dotted" style={{ fontSize: 11, color: "var(--danger)" }}>값 입력하기 →</Link>}
                          </td>
                          <td style={{ padding: 8 }}><span className="flex flex-wrap" style={{ gap: 4 }}>{r.risks.length ? r.risks.map((x) => chip(x, "var(--text)", "var(--surface-2)", t.risks.find((k) => k.id === x)?.hazard)) : <span className="text-text-subtle" style={{ fontSize: 11 }}>—</span>}</span></td>
                          <td style={{ padding: 8 }}><span className="flex flex-wrap" style={{ gap: 4 }}>{r.vfy.length ? r.vfy.map((v) => <span key={v.id}>{vfyChip(v)}</span>) : chip("⚠ 검증 없음", "var(--danger)", "color-mix(in srgb, var(--danger) 10%, var(--bg))")}</span></td>
                          <td style={{ padding: 8 }}><span className="flex flex-wrap" style={{ gap: 4 }}>{r.vfy.map((v) => <span key={v.id}>{evdChip(v)}</span>)}</span></td>
                          <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                            <button type="button" onClick={() => review(r)} aria-pressed={r.reviewed} className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-semibold"
                              style={{ minHeight: 36, padding: "2px 10px", fontSize: 11, border: `1.5px solid ${r.suspect ? "var(--warning)" : r.reviewed ? "var(--success)" : "var(--border-strong)"}`, color: r.suspect ? "var(--warning)" : r.reviewed ? "var(--success)" : "var(--text)", background: "var(--bg)" }}>
                              {r.reviewed ? <><CheckCircle2 size={13} aria-hidden /> 검토함</> : r.suspect ? "재검토" : "검토함"}
                            </button>
                          </td>
                        </tr>
                        {open === r.req.id && <tr style={{ borderBottom: "1px solid var(--border)" }}><td colSpan={6} style={{ padding: "0 8px 10px" }}><EditLinks row={r} all={t.vfys} /></td></tr>}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 860, fontSize: "var(--t-sm)" }}>
                  <thead><tr className="text-left text-text-muted" style={{ fontSize: 11 }}>
                    {["RSK", "위해요인", "통제수단 (제안)", "VFY (검증)", "증거", "REQ"].map((h) => <th key={h} style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {t.risks.map((rk) => {
                      const vs = rk.vfy.map((id) => t.vfys.find((v) => v.id === id)!).filter(Boolean);
                      return (
                        <tr key={rk.id} style={{ borderBottom: "1px solid var(--border)", verticalAlign: "top" }}>
                          <td style={{ padding: 8, fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 700 }}>{rk.id}</td>
                          <td style={{ padding: 8 }} className="text-text">{rk.hazard}</td>
                          <td style={{ padding: 8, maxWidth: 260 }} className="text-text-muted">{rk.controls}</td>
                          <td style={{ padding: 8 }}><span className="flex flex-wrap" style={{ gap: 4 }}>{vs.length ? vs.map((v) => <span key={v.id}>{vfyChip(v)}</span>) : chip(`문서로만: ${rk.docs.join(", ")}`, "var(--warning)", "var(--warning-bg)")}</span></td>
                          <td style={{ padding: 8 }}><span className="flex flex-wrap" style={{ gap: 4 }}>{vs.map((v) => <span key={v.id}>{evdChip(v)}</span>)}</span></td>
                          <td style={{ padding: 8 }}><span className="flex flex-wrap" style={{ gap: 4 }}>{rk.reqs.map((x) => chip(x, "var(--text)", "var(--surface-2)"))}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            )}
            {view !== "dso" && (
              <p className="flex items-start gap-1.5 text-text-subtle" style={{ fontSize: 11, marginTop: "var(--s-3)", lineHeight: "var(--lh-base)" }}>
                <Info size={13} aria-hidden style={{ marginTop: 2, flexShrink: 0 }} />
                자동 연결은 규칙으로 만든 후보입니다(요구사항 → 해당 시험, 위험 → 같은 근거 문서를 쓰는 시험). 위험의 P·S와 수용 판단은 위험관리 계획에서 회사 기준으로 정합니다. 증거는 결과 입력 화면의 판정입니다.
              </p>
            )}
          </section>

          <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="tr-add">
            <h2 id="tr-add" className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>요구사항 직접 추가</h2>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "2px 0 var(--s-3)" }}>스펙에 없는 설계 요구사항(예: 판독 시간, 표시 형식)을 넣고, 행의 ID를 눌러 검증을 연결하세요.</p>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              <select aria-label="분류" value={newCat} onChange={(e) => setNewCat(e.target.value as ReqCategory)} className="rounded text-text" style={{ minHeight: 44, padding: "4px 10px", border: "1.5px solid var(--border)", background: "var(--bg)" }}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input aria-label="요구사항 문구" value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustom()} placeholder="예: 검사 결과는 10분 안에 판독할 수 있어야 한다 [시간 — 사양 확정]"
                className="flex-1 rounded text-text" style={{ minWidth: 240, minHeight: 44, padding: "8px 12px", border: "1.5px solid var(--border)", background: "var(--bg)" }} />
              <button type="button" onClick={addCustom} disabled={!newText.trim()} className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold disabled:opacity-40" style={{ minHeight: 44, padding: "8px 16px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}><Plus size={15} aria-hidden /> 추가</button>
            </div>
          </section>

          <StorageNote />
        </div>
      </main>
    </div>
  );
}
