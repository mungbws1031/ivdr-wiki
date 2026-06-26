import { useState, useRef, useCallback, useEffect } from "react";
import { getDraft, setDraft, clearDraft } from "../hooks/useDraftStore";

interface Props {
  docId: string;
  sectionIdx: number;
  originalPlaceholder: string;
  guidance: string;
}

export function InlineEditor({ docId, sectionIdx, originalPlaceholder, guidance }: Props) {
  const savedDraft = getDraft(docId, sectionIdx);
  const [value, setValue] = useState<string>(savedDraft ?? originalPlaceholder);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = value !== originalPlaceholder;
  const hasSavedContent = savedDraft !== null;

  const triggerSave = useCallback(
    (text: string) => {
      setSaveStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDraft(docId, sectionIdx, text);
        setSaveStatus("saved");
        timerRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
      }, 400);
    },
    [docId, sectionIdx]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    setValue(next);
    triggerSave(next);
  }

  function handleReset() {
    if (!window.confirm("초기 템플릿으로 되돌리겠습니까? 작성한 내용이 사라집니다.")) return;
    setValue(originalPlaceholder);
    clearDraft(docId, sectionIdx);
    setSaveStatus("idle");
  }

  const borderColor = isDirty ? "var(--info)" : "var(--border)";

  return (
    <div style={{ marginTop: "var(--s-3)" }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "var(--s-1)" }}
      >
        <span className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
          {guidance}
        </span>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
              저장 중…
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>
              ✓ 저장됨
            </span>
          )}
          {hasSavedContent && saveStatus === "idle" && (
            <span style={{ fontSize: "var(--t-xs)", color: "var(--info)" }}>
              초안 보존 중
            </span>
          )}
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-[var(--r-sm)] text-text-muted hover:text-danger"
              style={{
                fontSize: "var(--t-xs)",
                padding: "2px 8px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              초기화
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        rows={Math.max(4, value.split("\n").length + 1)}
        className="w-full rounded-[var(--r-sm)] text-text"
        style={{
          background: "var(--surface)",
          border: `1px solid ${borderColor}`,
          fontFamily: "var(--font-mono)",
          fontSize: "var(--t-sm)",
          lineHeight: "var(--lh-base)",
          padding: "var(--s-3)",
          resize: "vertical",
          outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--info)";
          e.currentTarget.style.boxShadow = "var(--focus-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isDirty ? "var(--info)" : "var(--border)";
          e.currentTarget.style.boxShadow = "none";
          setDraft(docId, sectionIdx, e.currentTarget.value);
        }}
      />
    </div>
  );
}
