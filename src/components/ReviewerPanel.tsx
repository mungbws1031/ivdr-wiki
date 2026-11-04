import { useEffect, useRef } from "react";
import { X, Glasses, AlertTriangle } from "lucide-react";
import type { ReviewerFinding } from "../lib/reviewerCheck";

/**
 * "심사관에게 물어보기" 모달 — 결정적 규칙(체크리스트 미완료·빈칸 남음·섹션 미수정)만 보는
 * 내부 기계 점검이다. 실제 LLM 호출 없음, 등급·조항 추천은 다루지 않는다.
 * AI 서버(Vercel, 03·04 묶음) 연결 후 실제 LLM 기반 심사관 의견으로 고도화할 수 있다.
 * DocPreviewModal.tsx와 같은 모달 패턴(fixed overlay, role="dialog", Escape로 닫기, 포커스 이동).
 */
export function ReviewerPanel({
  docTitle,
  findings,
  onClose,
}: {
  docTitle: string;
  findings: ReviewerFinding[];
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

  const severityColor = (s: ReviewerFinding["severity"]) => (s === "주요" ? "var(--warning)" : "var(--text-muted)");
  const severityBg = (s: ReviewerFinding["severity"]) => (s === "주요" ? "var(--warning-bg)" : "var(--surface)");

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="reviewer-panel-title">
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
                   w-[min(560px,92vw)] max-h-[85vh] overflow-y-auto
                   rounded-[var(--r-lg)] bg-bg shadow-[var(--shadow-pop)] outline-none"
      >
        {/* 헤더 (고정) */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between bg-bg border-b"
          style={{ borderColor: "var(--border)", padding: "var(--s-4) var(--s-5)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              aria-hidden
              className="shrink-0 grid place-items-center rounded-full"
              style={{ width: 28, height: 28, background: "var(--accent-weak)", border: "1.5px solid var(--accent)" }}
            >
              <Glasses size={15} style={{ color: "var(--accent)" }} />
            </span>
            <h2 id="reviewer-panel-title" className="font-bold text-text truncate" style={{ fontSize: "var(--t-sm)" }}>
              심사관에게 물어보기 — {docTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="심사관 패널 닫기"
            className="shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div style={{ padding: "var(--s-5)" }}>
          <p
            className="flex items-start gap-2 rounded-[var(--r-md)] text-text"
            style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", padding: "var(--s-3) var(--s-4)", background: "var(--surface)", border: "1px solid var(--border)", marginBottom: "var(--s-4)" }}
          >
            <AlertTriangle size={14} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }} aria-hidden />
            이 지적은 내부 기계 점검용이며 실제 식약처 심사와 무관합니다. 체크리스트·빈칸·초안 작성 여부만 규칙으로 확인해요 — 등급·조항은 판단하지 않아요(사람·RA 검토는 별도).
          </p>

          {findings.length === 0 ? (
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
              지금까지는 기계적으로 확인되는 문제가 없어요. (사람·RA 검토는 별도)
            </p>
          ) : (
            <ul className="flex flex-col" style={{ gap: "var(--s-2)" }}>
              {findings.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-[var(--r-md)]"
                  style={{ padding: "var(--s-3) var(--s-4)", background: severityBg(f.severity), border: `1px solid ${severityColor(f.severity)}` }}
                >
                  <span
                    className="shrink-0 font-bold rounded-full"
                    style={{ fontSize: 11, padding: "1px 8px", color: severityColor(f.severity), border: `1px solid ${severityColor(f.severity)}` }}
                  >
                    {f.severity}
                  </span>
                  <span className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{f.message}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-4)", lineHeight: "var(--lh-base)" }}>
            AI 서버 연결 후 실제 심사관 의견으로 고도화 예정
          </p>
        </div>
      </div>
    </div>
  );
}
