import { useState } from "react";
import { AlertCircle, Check, Copy, FileDown, Languages, Loader2, RefreshCw, X } from "lucide-react";
import type { DocTemplate } from "../data/documents";
import { docWithDrafts, useStoreVersion } from "../hooks/useDraftStore";
import { getTranslation, requestTranslation, saveTranslation, sourceHash, translationMarkdown } from "../lib/translate";

const loadDocx = () => import("../lib/docx");

/** 해외 인증용 영문 번역 (AI). 원문은 그대로 두고 번역본을 따로 저장한다. */
export function TranslatePanel({ doc }: { doc: DocTemplate }) {
  useStoreVersion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const source = () => {
    const d = docWithDrafts(doc);
    return { title: d.docTitle, sections: d.sections.map((s) => ({ heading: s.heading, body: s.placeholder })) };
  };
  const t = getTranslation(doc.id);
  const src = source();
  const stale = !!t && t.sourceHash !== sourceHash(src.title, src.sections);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const out = await requestTranslation(src.title, src.sections);
      saveTranslation(doc.id, out);
      setOpen(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    if (!t) return;
    void navigator.clipboard.writeText(translationMarkdown(t));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const word = async () => {
    if (!t) return;
    const { generateTranslatedDocx, downloadBlob } = await loadDocx();
    downloadBlob(await generateTranslatedDocx(t), `EN-${doc.docTitle.replace(/[\\/:*?"<>|]/g, "_")}.docx`);
  };

  const btn = "inline-flex items-center gap-1.5 rounded-[var(--r-md)] font-semibold transition-colors";

  return (
    <div className="rounded-[var(--r-md)] border" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
      <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
        <Languages size={15} style={{ color: "var(--info)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>영문 번역 (AI) — 해외 인증용</h3>
      </div>
      <div className="flex flex-col" style={{ gap: "var(--s-3)", padding: "var(--s-4)" }}>
        <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
          지금 작성된 내용(직접 쓴 초안 포함)을 영어로 번역합니다. 원문은 바뀌지 않으며, 번역본은 검토 후 제출하세요.
        </p>
        {!t ? (
          <button type="button" onClick={run} disabled={busy} className={btn}
            style={{ fontSize: "var(--t-sm)", padding: "8px 14px", minHeight: 40, background: "var(--info)", color: "var(--text-on-color)", justifyContent: "center", opacity: busy ? 0.7 : 1 }}>
            {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Languages size={15} aria-hidden />}
            {busy ? "번역 중… (최대 1~2분)" : "영문으로 번역"}
          </button>
        ) : (
          <>
            <div className="flex flex-wrap items-center" style={{ gap: 6, fontSize: "var(--t-xs)" }}>
              <span className="inline-flex items-center gap-1 font-bold" style={{ color: stale ? "var(--warning)" : "var(--success)" }}>
                {stale ? <AlertCircle size={13} aria-hidden /> : <Check size={13} aria-hidden />}
                {stale ? "번역 후 원문이 바뀌었습니다" : "영문 번역본 있음"}
              </span>
              <span className="text-text-subtle">{new Date(t.at).toLocaleString("ko-KR")}</span>
            </div>
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              <button type="button" onClick={() => setOpen((x) => !x)} className={`${btn} hover:bg-surface`} style={{ fontSize: "var(--t-xs)", padding: "6px 10px", border: "1px solid var(--border-strong)", color: "var(--text)" }}>
                {open ? "닫기" : "영문 보기"}
              </button>
              <button type="button" onClick={copy} className={`${btn} hover:bg-surface`} style={{ fontSize: "var(--t-xs)", padding: "6px 10px", border: "1px solid var(--border-strong)", color: "var(--text)" }}>
                {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />} MD 복사
              </button>
              <button type="button" onClick={word} className={`${btn} hover:bg-surface`} style={{ fontSize: "var(--t-xs)", padding: "6px 10px", border: "1px solid var(--border-strong)", color: "var(--text)" }}>
                <FileDown size={13} aria-hidden /> 영문 .docx
              </button>
              <button type="button" onClick={run} disabled={busy} className={`${btn} hover:bg-surface`} style={{ fontSize: "var(--t-xs)", padding: "6px 10px", border: `1px solid ${stale ? "var(--warning)" : "var(--border-strong)"}`, color: stale ? "var(--warning)" : "var(--text)" }}>
                {busy ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <RefreshCw size={13} aria-hidden />} 다시 번역
              </button>
              <button type="button" onClick={() => saveTranslation(doc.id, null)} aria-label="번역본 지우기" className={`${btn} hover:bg-surface`} style={{ fontSize: "var(--t-xs)", padding: "6px 8px", color: "var(--text-subtle)" }}>
                <X size={13} aria-hidden />
              </button>
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="flex items-start gap-1.5" style={{ fontSize: "var(--t-xs)", color: "var(--danger)", lineHeight: "var(--lh-base)" }}>
            <AlertCircle size={13} className="shrink-0" style={{ marginTop: 2 }} aria-hidden /> {error}
          </p>
        )}
        {t && open && (
          <div lang="en" className="rounded-[var(--r-sm)] flex flex-col" style={{ gap: "var(--s-3)", padding: "var(--s-3)", background: "var(--surface)", maxHeight: 480, overflowY: "auto" }}>
            <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>{t.title}</p>
            {t.sections.map((s, i) => (
              <div key={i}>
                <p className="font-semibold text-text" style={{ fontSize: "var(--t-xs)" }}>{s.heading}</p>
                <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{s.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
