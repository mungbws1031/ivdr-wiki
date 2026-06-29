import { useState, useRef, useCallback, useEffect } from "react";
import { getDraft, setDraft, clearDraft } from "../hooks/useDraftStore";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";

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
  // 처음 작성하는 경우 안내 박스 열려있게, 이미 초안 있으면 닫혀있게
  const [guidanceOpen, setGuidanceOpen] = useState(savedDraft === null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = value !== originalPlaceholder;
  const hasSavedContent = savedDraft !== null;
  const lineCount = value.split("\n").length;
  const charCount = value.replace(/\s/g, "").length;

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
    [docId, sectionIdx],
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>

      {/* ── 작성 안내 (눈에 띄는 접기 패널) ─────────────────── */}
      {guidance && (
        <div className="rounded-[var(--r-md)] overflow-hidden" style={{ border: "1px solid var(--info)" }}>
          <button
            onClick={() => setGuidanceOpen((v) => !v)}
            className="w-full flex items-center gap-2 text-left"
            style={{ background: "var(--info-bg)", padding: "var(--s-2) var(--s-3)", cursor: "pointer" }}
          >
            <BookOpen size={13} style={{ color: "var(--info)", flexShrink: 0 }} aria-hidden />
            <span className="font-semibold flex-1" style={{ fontSize: "var(--t-xs)", color: "var(--info)" }}>
              작성 안내
            </span>
            {guidanceOpen
              ? <ChevronDown size={13} style={{ color: "var(--info)", flexShrink: 0 }} aria-hidden />
              : <ChevronRight size={13} style={{ color: "var(--info)", flexShrink: 0 }} aria-hidden />}
          </button>
          {guidanceOpen && (
            <div
              style={{
                background: "var(--info-bg)",
                padding: "var(--s-2) var(--s-3) var(--s-3)",
                borderTop: "1px solid var(--info)",
              }}
            >
              <p
                className="text-text"
                style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", whiteSpace: "pre-line" }}
              >
                {guidance}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 에디터 ───────────────────────────────────────────── */}
      <textarea
        value={value}
        onChange={handleChange}
        rows={Math.max(5, value.split("\n").length + 1)}
        className="w-full rounded-[var(--r-sm)] text-text"
        style={{
          background: "var(--bg)",
          border: `1.5px solid ${isDirty ? "var(--info)" : "var(--border)"}`,
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

      {/* ── 하단 상태 바 ─────────────────────────────────────── */}
      <div className="flex items-center" style={{ gap: "var(--s-3)" }}>
        <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
          {lineCount}줄 · {charCount}자
        </span>
        <div className="flex-1" />
        {saveStatus === "saving" && (
          <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>저장 중…</span>
        )}
        {saveStatus === "saved" && (
          <span style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>✓ 저장됨</span>
        )}
        {hasSavedContent && saveStatus === "idle" && (
          <span style={{ fontSize: "var(--t-xs)", color: "var(--info)" }}>초안 보존 중</span>
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
  );
}
