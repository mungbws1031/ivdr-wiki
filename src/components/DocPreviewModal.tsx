import { useEffect, useRef } from "react";
import { X, FileText } from "lucide-react";
import type { DocTemplate } from "../data/documents";
import { prereqKindLabel, difficultyLabel, importanceLabel, leafById } from "../data/docTree";

/**
 * 문서 미리보기 — "완성본 .docx 받기"가 만들 내용을 내려받기 전에 화면에서 그대로 확인한다.
 * 내용 순서·문구는 lib/docx.ts의 generateFinishedDocx와 동일하게 맞춘다.
 */
export function DocPreviewModal({
  doc,
  onClose,
}: {
  doc: DocTemplate;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const h2Style: React.CSSProperties = {
    fontSize: "var(--t-base)",
    fontWeight: 700,
    marginTop: "var(--s-5)",
    marginBottom: "var(--s-2)",
    color: "var(--text)",
  };
  const pStyle: React.CSSProperties = {
    fontSize: "var(--t-sm)",
    lineHeight: "var(--lh-base)",
    color: "var(--text)",
    whiteSpace: "pre-wrap",
  };
  const bulletStyle: React.CSSProperties = {
    fontSize: "var(--t-sm)",
    lineHeight: "var(--lh-base)",
    color: "var(--text)",
    marginLeft: "var(--s-4)",
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="doc-preview-title">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(16,24,40,0.45)]"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[min(680px,92vw)] max-h-[85vh] overflow-y-auto
                   rounded-[var(--r-lg)] bg-bg shadow-[var(--shadow-pop)] outline-none"
      >
        {/* 헤더 (고정) */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between bg-bg border-b"
          style={{ borderColor: "var(--border)", padding: "var(--s-4) var(--s-5)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={18} style={{ color: "var(--info)" }} aria-hidden />
            <h2 id="doc-preview-title" className="font-bold text-text truncate" style={{ fontSize: "var(--t-sm)" }}>
              미리보기 — {doc.docTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="미리보기 닫기"
            className="shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {/* 본문 — generateFinishedDocx와 같은 순서 */}
        <div style={{ padding: "var(--s-5)" }}>
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginBottom: "var(--s-2)" }}>
            {doc.docTitle}
          </h1>
          <p style={pStyle}>목적: {doc.purpose}</p>
          <p style={pStyle}>근거: {doc.refs.join(" · ")}</p>
          {doc.difficulty && doc.importance && (
            <p style={pStyle}>
              난이도: {difficultyLabel[doc.difficulty]} · 중요도: {importanceLabel[doc.importance]}
            </p>
          )}
          {doc.effort && (
            <p style={pStyle}>
              예상 소요(추정): {doc.effort.total} — 자료확보 {doc.effort.gather} · 맥락이해 {doc.effort.context} ·
              작성 {doc.effort.draft} · 검토 {doc.effort.review} · RA 피드백 {doc.effort.raRounds}회
            </p>
          )}

          {doc.rationale && (
            <>
              <h2 style={h2Style}>취지 — 왜 이 문서를 쓰는가</h2>
              <p style={pStyle}>{doc.rationale}</p>
            </>
          )}

          {doc.prepDocs && doc.prepDocs.length > 0 && (
            <>
              <h2 style={h2Style}>미리 만들어두면 좋은 문서</h2>
              <ul>
                {doc.prepDocs.map((id) => (
                  <li key={id} style={bulletStyle}>
                    · {leafById(id)?.title ?? id}
                  </li>
                ))}
              </ul>
            </>
          )}

          {doc.knowledge && doc.knowledge.length > 0 && (
            <>
              <h2 style={h2Style}>작성 전 알아야 할 것</h2>
              <ul>
                {doc.knowledge.map((k, i) => (
                  <li key={i} style={bulletStyle}>
                    · {k}
                  </li>
                ))}
              </ul>
            </>
          )}

          {doc.prerequisites && doc.prerequisites.length > 0 && (
            <>
              <h2 style={h2Style}>작성 전 준비물</h2>
              <ul>
                {doc.prerequisites.map((pr, i) => (
                  <li key={i} style={bulletStyle}>
                    · ({prereqKindLabel[pr.kind]}) {pr.label}
                  </li>
                ))}
              </ul>
            </>
          )}

          {doc.sections.map((s, i) => (
            <div key={i}>
              <h2 style={h2Style}>{s.heading}</h2>
              <p style={pStyle}>{s.placeholder}</p>
            </div>
          ))}

          <h2 style={h2Style}>완료 체크리스트</h2>
          <ul>
            {doc.checklist.map((c, i) => (
              <li key={i} style={bulletStyle}>
                ☐ {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
