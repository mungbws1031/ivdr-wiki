import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { hasDraft } from "../hooks/useDraftStore";
import { docEvidence, TAG_META, type EvidenceTag } from "../lib/evidence";
import { TOKEN_LABEL } from "../lib/tokens";
import { EvidenceBar } from "./auto/AutoUi";

type Doc = { sections: { placeholder: string }[] };

/** 근거 원장 — 이 문서의 값이 어디서 왔는지 (입력·규칙·가정·누락)와 근거 확정 비율. */
export function EvidencePanel({ raw, filled, ctx, assumedPaths, estimatedPaths, docId }: { raw: Doc; filled: Doc; ctx: Record<string, string | null>; assumedPaths: Set<string>; estimatedPaths: Set<string>; docId: string }) {
  const [open, setOpen] = useState(false);
  const ev = docEvidence(raw, filled, ctx, assumedPaths, (i) => hasDraft(docId, i), estimatedPaths);
  if (ev.confirmed === null) return null;
  const tags = Object.keys(TAG_META) as EvidenceTag[];
  return (
    <section className="rounded-[var(--r-md)] border" style={{ borderColor: "var(--border)", background: "var(--bg)" }} aria-label="근거 원장">
      <button type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open} className="w-full flex flex-wrap items-center text-left" style={{ gap: "6px 12px", padding: "10px 14px" }}>
        <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>근거 원장</span>
        <span className="font-extrabold" style={{ fontSize: "var(--t-sm)", color: ev.confirmed >= 0.8 ? "var(--success)" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>근거 확정 {Math.round(ev.confirmed * 100)}%</span>
        <span className="flex flex-wrap" style={{ gap: 8, fontSize: "var(--t-xs)" }}>
          {tags.map((k) => (
            <span key={k} className="inline-flex items-center" style={{ gap: 4 }}>
              <span className="rounded-full" style={{ width: 8, height: 8, background: TAG_META[k].color }} />
              {TAG_META[k].label} <b style={{ fontVariantNumeric: "tabular-nums" }}>{ev.counts[k]}</b>
            </span>
          ))}
        </span>
        <ChevronDown size={15} className="ml-auto text-text-subtle" style={{ transform: open ? "rotate(180deg)" : undefined }} aria-hidden />
        <span className="w-full"><EvidenceBar counts={ev.counts} /></span>
      </button>
      {open && (
        <div className="flex flex-col" style={{ gap: 8, padding: "0 14px 12px", fontSize: "var(--t-xs)" }}>
          {tags.map((k) => {
            const items = ev.tokens.filter((t) => t.tag === k);
            const extra = k === "input" && ev.drafted ? `직접 쓴 섹션 ${ev.drafted}개` : k === "missing" && ev.gaps ? `본문 빈칸 ${ev.gaps}개 ([실험 후 입력]·[사양: …]·[____] 등)` : null;
            if (!items.length && !extra) return null;
            return (
              <div key={k}>
                <p className="font-bold" style={{ color: TAG_META[k].color }}>{TAG_META[k].label} <span className="font-normal text-text-subtle">— {TAG_META[k].desc}</span></p>
                <p className="flex flex-wrap" style={{ gap: 4, marginTop: 3 }}>
                  {items.map((t) => (
                    <span key={t.key} className="rounded-full" style={{ padding: "1px 8px", border: `1px solid ${TAG_META[k].color}`, color: "var(--text)" }}>{TOKEN_LABEL[t.key] ?? t.key}</span>
                  ))}
                  {extra && <span className="text-text-muted" style={{ padding: "1px 4px" }}>{extra}</span>}
                </p>
              </div>
            );
          })}
          <p className="text-text-subtle">근거 확정 = (입력 + 규칙) ÷ 전체. 가정·누락이 남은 문서는 검토 전 초안입니다.</p>
        </div>
      )}
    </section>
  );
}
