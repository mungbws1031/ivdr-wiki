import { useState } from "react";
import { Check, Clipboard, Download } from "lucide-react";

/** 전체 복사 + .md 다운로드. accent(CTA)는 여기에만 허용. */
export function CopyMarkdownBar({
  markdown,
  filename,
}: {
  markdown: string;
  filename: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      // 폴백: 임시 textarea
      const ta = document.createElement("textarea");
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        aria-label="템플릿 전체 복사"
        className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color transition-colors"
        style={{
          background: copied ? "var(--success)" : "var(--accent)",
          fontSize: "var(--t-sm)",
          padding: "10px 16px",
          minHeight: 44,
        }}
      >
        {copied ? <Check size={18} aria-hidden /> : <Clipboard size={18} aria-hidden />}
        {copied ? "복사됨" : "전체 복사"}
      </button>
      <button
        type="button"
        onClick={download}
        aria-label="마크다운 파일로 다운로드"
        className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-bold text-text transition-colors hover:bg-surface"
        style={{
          borderColor: "var(--border-strong)",
          fontSize: "var(--t-sm)",
          padding: "10px 16px",
          minHeight: 44,
        }}
      >
        <Download size={18} aria-hidden />
        .md 다운로드
      </button>
    </div>
  );
}
