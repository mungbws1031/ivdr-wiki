import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GLOSSARY } from "../data/glossary";

/** 약어 풀이 — 누르면 한 줄 뜻과 개념 위키 링크가 열린다. Esc·바깥 클릭으로 닫힌다. */
export function Term({ k, children }: { k: string; children?: React.ReactNode }) {
  const g = GLOSSARY[k];
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);
  if (!g) return <>{children ?? k}</>;
  return (
    <span ref={ref} className="relative inline">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}
        className="font-[inherit] underline decoration-dotted underline-offset-2" style={{ color: "inherit", cursor: "help" }} title={g.short}>
        {children ?? k}
      </button>
      {open && (
        <span id={id} role="note" className="absolute left-0 z-40 block rounded-[var(--r-md)] border bg-bg text-left"
          style={{ top: "calc(100% + 4px)", width: "min(280px, 80vw)", padding: "10px 12px", borderColor: "var(--border-strong)", boxShadow: "var(--shadow-card)", fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", fontWeight: 400, color: "var(--text)" }}>
          <b className="block" style={{ marginBottom: 2 }}>{g.term}</b>
          {g.short}
          {g.slug && <Link to={`/wiki/${g.slug}`} className="block font-semibold" style={{ marginTop: 6, color: "var(--info)" }}>자세히 →</Link>}
        </span>
      )}
    </span>
  );
}

/** 문장 속 약어 첫 등장을 Term으로 감싼다 (문장 자체는 그대로). */
export function WithTerms({ text }: { text: string }) {
  const keys = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${keys.map(esc).join("|")})`, "g");
  const seen = new Set<string>();
  return (
    <>
      {text.split(re).map((part, i) => {
        if (GLOSSARY[part] && !seen.has(part)) { seen.add(part); return <Term key={i} k={part} />; }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
