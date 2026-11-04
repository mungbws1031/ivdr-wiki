import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { updateDsoStore, useDsoStore } from "../../hooks/useDsoStore";
import {
  DSO_KIND_LABEL, DSO_VERDICT_LABEL, buildDsoImpact, dsoChangeCsv, verdictKey,
  type Dso, type DsoKind, type DsoVerdict, type ImpactKind,
} from "../../lib/dso";
import type { Trace } from "../../lib/trace";

const card = { borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-6)" } as const;
const KINDS: DsoKind[] = ["bom", "part", "pcb", "firmware", "app", "drawing"];
const VERDICTS: DsoVerdict[] = ["impact", "no-impact", "retest", "review"];
const IMPACT_KIND_LABEL: Record<ImpactKind, string> = { req: "REQ", risk: "RSK", vfy: "VFY", doc: "문서" };

const chip = (text: string, fg: string, bg: string, title?: string) => (
  <span title={title} className="inline-flex items-center rounded-full font-semibold" style={{ fontSize: 11, padding: "1px 8px", color: fg, background: bg, fontFamily: "var(--font-mono, ui-monospace, monospace)", whiteSpace: "nowrap" }}>{text}</span>
);

function verdictColor(v: DsoVerdict | null): { fg: string; bg: string } {
  if (v === "impact") return { fg: "var(--danger)", bg: "color-mix(in srgb, var(--danger) 10%, var(--bg))" };
  if (v === "no-impact") return { fg: "var(--success)", bg: "var(--success-bg)" };
  if (v === "retest") return { fg: "var(--warning)", bg: "var(--warning-bg)" };
  if (v === "review") return { fg: "var(--info)", bg: "var(--info-bg)" };
  return { fg: "var(--text-subtle)", bg: "var(--surface)" };
}

const inputStyle = { minHeight: 44, padding: "8px 12px", border: "1.5px solid var(--border)", background: "var(--bg)" } as const;
const selectStyle = { minHeight: 44, padding: "4px 10px", border: "1.5px solid var(--border)", background: "var(--bg)" } as const;

/** DSO(BOM·부품·PCB·펌웨어/앱·도면) 등록, 리비전 변경, REQ 연결, 영향 후보 판정, CSV 내보내기 */
export function DsoSection({ trace }: { trace: Trace }) {
  const store = useDsoStore();
  const [openId, setOpenId] = useState<string | null>(null);

  // 새 DSO 등록
  const [newKind, setNewKind] = useState<DsoKind>("bom");
  const [newName, setNewName] = useState("");
  const [newRev, setNewRev] = useState("A");
  const [newReason, setNewReason] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const addDso = () => {
    if (!newName.trim() || !newRev.trim() || !newAuthor.trim()) return;
    updateDsoStore((s) => {
      const id = `DSO-${String(s.nextDsoNum).padStart(3, "0")}`;
      return {
        ...s,
        nextDsoNum: s.nextDsoNum + 1,
        dsos: [...s.dsos, { id, kind: newKind, name: newName.trim(), revision: newRev.trim(), reqs: [], revSeq: 0 }],
        changes: [...s.changes, { id: `CHG-${Date.now()}`, dsoId: id, revision: newRev.trim(), seq: 0, reason: newReason.trim() || "최초 등록", author: newAuthor.trim(), date: new Date().toISOString().slice(0, 10) }],
      };
    });
    setNewName(""); setNewRev("A"); setNewReason(""); setNewAuthor("");
  };

  const csv = () => {
    const url = URL.createObjectURL(new Blob([dsoChangeCsv(store.dsos, store.changes, store.verdicts)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "dso-change-log.csv"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
      <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="dso-add">
        <h2 id="dso-add" className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>설계 출력(DSO) 등록</h2>
        <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "2px 0 var(--s-3)" }}>BOM·부품·PCB 리비전·펌웨어/앱 버전·도면을 등록하고 요구사항(REQ)에 연결하세요.</p>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          <select aria-label="종류" value={newKind} onChange={(e) => setNewKind(e.target.value as DsoKind)} className="rounded text-text" style={selectStyle}>
            {KINDS.map((k) => <option key={k} value={k}>{DSO_KIND_LABEL[k]}</option>)}
          </select>
          <input aria-label="이름" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="예: 메인보드 BOM" className="rounded text-text" style={{ ...inputStyle, minWidth: 180 }} />
          <input aria-label="최초 리비전" value={newRev} onChange={(e) => setNewRev(e.target.value)} placeholder="리비전 (예: A)" className="rounded text-text" style={{ ...inputStyle, width: 120 }} />
          <input aria-label="등록 사유" value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="등록 사유(선택)" className="rounded text-text" style={{ ...inputStyle, minWidth: 180 }} />
          <input aria-label="작성자" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="작성자" className="rounded text-text" style={{ ...inputStyle, width: 140 }} />
          <button type="button" onClick={addDso} disabled={!newName.trim() || !newRev.trim() || !newAuthor.trim()} className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold disabled:opacity-40" style={{ minHeight: 44, padding: "8px 16px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}><Plus size={15} aria-hidden /> 등록</button>
        </div>
      </section>

      {store.dsos.length > 0 && (
        <section className="rounded-[var(--r-lg)] border bg-bg" style={card} aria-labelledby="dso-list">
          <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: "var(--s-4)" }}>
            <h2 id="dso-list" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginRight: "auto" }}>등록된 설계 출력</h2>
            <button type="button" onClick={csv} className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-semibold" style={{ minHeight: 40, padding: "4px 12px", fontSize: "var(--t-xs)", border: "1px solid var(--border-strong)", color: "var(--text)" }}><Download size={14} aria-hidden /> 변경 이력 CSV</button>
          </div>
          <ul className="flex flex-col" style={{ gap: 12 }}>
            {store.dsos.map((d) => (
              <li key={d.id} className="rounded-[var(--r-md)] border" style={{ borderColor: "var(--border)", padding: 12 }}>
                <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
                  <button type="button" onClick={() => setOpenId(openId === d.id ? null : d.id)} aria-expanded={openId === d.id} className="font-bold text-text underline decoration-dotted" style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, minHeight: 32 }}>{d.id}</button>
                  {chip(DSO_KIND_LABEL[d.kind], "var(--text)", "var(--surface-2)")}
                  <span className="text-text" style={{ fontWeight: 600 }}>{d.name}</span>
                  {chip(`리비전 ${d.revision}`, "var(--text)", "var(--accent-weak)")}
                  <button type="button" onClick={() => updateDsoStore((s) => {
                    const prefix = `${d.id}@`;
                    const verdicts = Object.fromEntries(Object.entries(s.verdicts).filter(([k]) => !k.startsWith(prefix)));
                    return { ...s, dsos: s.dsos.filter((x) => x.id !== d.id), changes: s.changes.filter((c) => c.dsoId !== d.id), verdicts };
                  })} aria-label={`${d.id} 삭제`} className="ml-auto inline-grid place-items-center rounded" style={{ width: 32, height: 32, color: "var(--text-subtle)" }}><Trash2 size={14} aria-hidden /></button>
                </div>
                {openId === d.id && <DsoDetail dso={d} trace={trace} />}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function DsoDetail({ dso, trace }: { dso: Dso; trace: Trace }) {
  const store = useDsoStore();
  const [pickReq, setPickReq] = useState("");
  const [newRev, setNewRev] = useState("");
  const [reason, setReason] = useState("");
  const [author, setAuthor] = useState("");

  const linkReq = () => {
    if (!pickReq) return;
    updateDsoStore((s) => ({ ...s, dsos: s.dsos.map((d) => (d.id === dso.id ? { ...d, reqs: [...d.reqs, pickReq] } : d)) }));
    setPickReq("");
  };
  const unlinkReq = (reqId: string) => updateDsoStore((s) => ({ ...s, dsos: s.dsos.map((d) => (d.id === dso.id ? { ...d, reqs: d.reqs.filter((r) => r !== reqId) } : d)) }));

  const addRevision = () => {
    if (!newRev.trim() || !reason.trim() || !author.trim()) return;
    updateDsoStore((s) => {
      const current = s.dsos.find((d) => d.id === dso.id);
      const seq = (current?.revSeq ?? dso.revSeq) + 1;
      return {
        ...s,
        dsos: s.dsos.map((d) => (d.id === dso.id ? { ...d, revision: newRev.trim(), revSeq: seq } : d)),
        changes: [...s.changes, { id: `CHG-${Date.now()}`, dsoId: dso.id, revision: newRev.trim(), seq, reason: reason.trim(), author: author.trim(), date: new Date().toISOString().slice(0, 10) }],
      };
    });
    setNewRev(""); setReason(""); setAuthor("");
  };

  const setVerdict = (kind: ImpactKind, ref: string, v: DsoVerdict) => updateDsoStore((s) => ({ ...s, verdicts: { ...s.verdicts, [verdictKey(dso, kind, ref)]: v } }));

  const reqOptions = trace.rows.filter((r) => !dso.reqs.includes(r.req.id));
  const impacts = buildDsoImpact(dso, trace, store);
  const history = store.changes.filter((c) => c.dsoId === dso.id).slice().reverse();

  return (
    <div className="flex flex-col" style={{ gap: 12, marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
      <div>
        <p className="text-text-muted" style={{ fontSize: 11, marginBottom: 4 }}>연결된 요구사항(REQ)</p>
        <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 6 }}>
          {dso.reqs.length ? dso.reqs.map((rid) => (
            <span key={rid} className="inline-flex items-center" style={{ gap: 4 }}>
              {chip(rid, "var(--text)", "var(--surface-2)", trace.rows.find((r) => r.req.id === rid)?.req.text)}
              <button type="button" onClick={() => unlinkReq(rid)} aria-label={`${rid} 연결 빼기`} className="inline-grid place-items-center rounded" style={{ width: 28, height: 28, color: "var(--text-subtle)" }}><Trash2 size={12} aria-hidden /></button>
            </span>
          )) : <span className="text-text-subtle" style={{ fontSize: 11 }}>연결 없음</span>}
        </div>
        <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
          <select aria-label={`${dso.id}에 REQ 추가`} value={pickReq} onChange={(e) => setPickReq(e.target.value)} className="rounded text-text" style={{ ...selectStyle, minHeight: 40, fontSize: "var(--t-xs)" }}>
            <option value="">요구사항(REQ) 고르기…</option>
            {reqOptions.map((r) => <option key={r.req.id} value={r.req.id}>{r.req.id} — {r.req.text.slice(0, 40)}</option>)}
          </select>
          <button type="button" onClick={linkReq} disabled={!pickReq} className="rounded font-semibold disabled:opacity-40" style={{ minHeight: 40, padding: "4px 12px", fontSize: "var(--t-xs)", border: "1px solid var(--border-strong)", color: "var(--text)" }}>연결 추가</button>
        </div>
      </div>

      <div>
        <p className="text-text-muted" style={{ fontSize: 11, marginBottom: 4 }}>영향 후보 — REQ·RSK·VFY·문서섹션 판정</p>
        {impacts.length === 0 ? <p className="text-text-subtle" style={{ fontSize: 11 }}>연결된 REQ가 없어 후보가 없습니다.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560, fontSize: "var(--t-sm)" }}>
              <thead><tr className="text-left text-text-muted" style={{ fontSize: 11 }}>
                {["구분", "항목", "판정"].map((h) => <th key={h} style={{ padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {impacts.map((x) => (
                  <tr key={`${x.kind}:${x.ref}`} style={{ borderBottom: "1px solid var(--border)", verticalAlign: "top" }}>
                    <td style={{ padding: 6 }}>{chip(IMPACT_KIND_LABEL[x.kind], "var(--text)", "var(--surface-2)")}</td>
                    <td style={{ padding: 6 }} className="text-text">
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, marginRight: 6 }}>{x.ref}</span>{x.label}
                    </td>
                    <td style={{ padding: 6 }}>
                      <div className="flex flex-wrap" style={{ gap: 4 }}>
                        {VERDICTS.map((v) => {
                          const active = x.verdict === v;
                          const c = verdictColor(v);
                          return (
                            <button key={v} type="button" onClick={() => setVerdict(x.kind, x.ref, v)} aria-pressed={active} className="rounded-full font-semibold" style={{ minHeight: 32, padding: "2px 10px", fontSize: 11, border: `1.5px solid ${active ? c.fg : "var(--border)"}`, background: active ? c.bg : "var(--bg)", color: active ? c.fg : "var(--text-muted)" }}>{DSO_VERDICT_LABEL[v]}</button>
                          );
                        })}
                        {!x.verdict && chip("판정 필요", "var(--warning)", "var(--warning-bg)")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <p className="text-text-muted" style={{ fontSize: 11, marginBottom: 4 }}>리비전 변경 등록</p>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          <input aria-label="새 리비전" value={newRev} onChange={(e) => setNewRev(e.target.value)} placeholder={`새 리비전 (현재 ${dso.revision})`} className="rounded text-text" style={{ ...inputStyle, minHeight: 40, width: 160 }} />
          <input aria-label="변경 사유" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="변경 사유" className="rounded text-text" style={{ ...inputStyle, minHeight: 40, minWidth: 200 }} />
          <input aria-label="작성자" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="작성자" className="rounded text-text" style={{ ...inputStyle, minHeight: 40, width: 140 }} />
          <button type="button" onClick={addRevision} disabled={!newRev.trim() || !reason.trim() || !author.trim()} className="rounded font-bold disabled:opacity-40" style={{ minHeight: 40, padding: "4px 14px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-xs)" }}>리비전 등록</button>
        </div>
        <p className="text-text-subtle" style={{ fontSize: 10, marginTop: 4 }}>리비전을 바꾸면 위 영향 후보의 판정은 "판정 필요"로 돌아갑니다 — 새로 판정하세요.</p>
      </div>

      {history.length > 0 && (
        <div>
          <p className="text-text-muted" style={{ fontSize: 11, marginBottom: 4 }}>리비전 이력 (읽기 전용)</p>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 480, fontSize: "var(--t-sm)" }}>
              <thead><tr className="text-left text-text-muted" style={{ fontSize: 11 }}>
                {["리비전", "사유", "작성자", "날짜"].map((h) => <th key={h} style={{ padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {history.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 6, fontFamily: "ui-monospace, monospace" }}>{c.revision}</td>
                    <td style={{ padding: 6 }} className="text-text">{c.reason}</td>
                    <td style={{ padding: 6 }} className="text-text-muted">{c.author}</td>
                    <td style={{ padding: 6 }} className="text-text-muted">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
