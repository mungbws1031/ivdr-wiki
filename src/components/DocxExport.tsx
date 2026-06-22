import { useRef, useState } from "react";
import { FileType2, Upload, Download, Loader2, Check, AlertCircle } from "lucide-react";
import type { DocTemplate } from "../data/documents";

// 무거운 워드 라이브러리(docx/docxtemplater/pizzip)는 사용할 때만 동적 로드.
const loadDocx = () => import("../lib/docx");

type State =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "done"; msg: string }
  | { kind: "error"; msg: string };

/** 워드(.docx) 내보내기 — 샘플 받기 + 내 템플릿에 자동 채우기. */
export function DocxExport({ doc }: { doc: DocTemplate }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const fileRef = useRef<HTMLInputElement>(null);

  const safeName = doc.docTitle.replace(/[\\/:*?"<>|]/g, "_");

  const onSample = async () => {
    setState({ kind: "busy", msg: "샘플 생성 중…" });
    try {
      const { generateSampleDocx, downloadBlob } = await loadDocx();
      const blob = await generateSampleDocx(doc);
      downloadBlob(blob, `샘플-${safeName}.docx`);
      setState({ kind: "done", msg: "샘플 .docx를 내려받았습니다. 표시자 자리에 서식/로고를 넣어 다시 올리세요." });
    } catch (e) {
      setState({ kind: "error", msg: `샘플 생성 실패: ${(e as Error).message}` });
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setState({ kind: "error", msg: ".docx 파일만 지원합니다 (.doc는 안 됨)." });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setState({ kind: "busy", msg: `'${file.name}' 처리 중…` });
    try {
      const { fillUploadedDocx, downloadBlob } = await loadDocx();
      const buf = await file.arrayBuffer();
      const { blob, mode } = await fillUploadedDocx(buf, doc);
      downloadBlob(blob, `완성-${safeName}.docx`);
      setState({
        kind: "done",
        msg:
          mode === "filled"
            ? "표시자를 찾아 내용을 채웠습니다. 완성본을 내려받았습니다."
            : "표시자가 없어 문서 끝에 내용을 추가했습니다. 완성본을 내려받았습니다.",
      });
    } catch (err) {
      setState({ kind: "error", msg: `처리 실패: ${(err as Error).message}` });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const busy = state.kind === "busy";

  return (
    <div
      className="rounded-[var(--r-md)] border"
      style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2 text-text" style={{ marginBottom: "var(--s-1)" }}>
        <FileType2 size={18} style={{ color: "var(--info)" }} aria-hidden />
        <h3 className="font-bold" style={{ fontSize: "var(--t-sm)" }}>워드(.docx)로 내보내기</h3>
      </div>
      <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginBottom: "var(--s-3)" }}>
        내 워드 템플릿을 올리면 자동으로 채웁니다. 표시자({"{docTitle}"} 등)가 있으면 그 자리에,
        없으면 문서 끝에 내용을 추가합니다. 처리는 브라우저에서만 이뤄집니다.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSample}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-semibold text-text hover:bg-bg disabled:opacity-60"
          style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "9px 14px", minHeight: 40 }}
        >
          <Download size={16} aria-hidden />
          샘플 .docx 받기
        </button>

        <label
          className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color disabled:opacity-60"
          style={{ background: "var(--info)", fontSize: "var(--t-sm)", padding: "9px 14px", minHeight: 40, opacity: busy ? 0.6 : 1 }}
        >
          <Upload size={16} aria-hidden />
          내 워드 템플릿 올리기
          <input
            ref={fileRef}
            type="file"
            accept=".docx"
            onChange={onFile}
            disabled={busy}
            className="hidden"
          />
        </label>
      </div>

      {/* 상태 */}
      {state.kind !== "idle" && (
        <div
          className="mt-3 flex items-start gap-2 rounded-[var(--r-sm)]"
          style={{
            fontSize: "var(--t-sm)",
            padding: "8px 10px",
            background:
              state.kind === "error"
                ? "var(--danger-bg)"
                : state.kind === "done"
                  ? "var(--success-bg)"
                  : "var(--surface-2)",
            color:
              state.kind === "error"
                ? "var(--danger)"
                : state.kind === "done"
                  ? "var(--success)"
                  : "var(--text-muted)",
          }}
        >
          {state.kind === "busy" && <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin" aria-hidden />}
          {state.kind === "done" && <Check size={16} className="mt-0.5 shrink-0" aria-hidden />}
          {state.kind === "error" && <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />}
          <span>{state.msg}</span>
        </div>
      )}
    </div>
  );
}
