import { useRef, useState } from "react";
import { FileType2, Upload, Download, FileDown, Eye, Loader2, Check, AlertCircle } from "lucide-react";
import type { DocTemplate } from "../data/documents";
import { docWithDrafts } from "../hooks/useDraftStore";
import { DocPreviewModal } from "./DocPreviewModal";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const safeName = doc.docTitle.replace(/[\\/:*?"<>|]/g, "_");

  const onFinished = async () => {
    setState({ kind: "busy", msg: "완성본 만드는 중…" });
    try {
      const { generateFinishedDocx, downloadBlob } = await loadDocx();
      const blob = await generateFinishedDocx(docWithDrafts(doc));
      downloadBlob(blob, `완성-${safeName}.docx`);
      setState({ kind: "done", msg: "지금까지 쓴 내용으로 완성본 .docx를 내려받았어요." });
    } catch (e) {
      setState({ kind: "error", msg: `만들지 못했어요: ${(e as Error).message}` });
    }
  };

  const onSample = async () => {
    setState({ kind: "busy", msg: "샘플 만드는 중…" });
    try {
      const { generateSampleDocx, downloadBlob } = await loadDocx();
      const blob = await generateSampleDocx(doc);
      downloadBlob(blob, `샘플-${safeName}.docx`);
      setState({ kind: "done", msg: "샘플 .docx를 내려받았어요. 채울 자리 표시는 남기고 서식·로고만 바꿔서 다시 올려 주세요." });
    } catch (e) {
      setState({ kind: "error", msg: `샘플을 만들지 못했어요: ${(e as Error).message}` });
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setState({ kind: "error", msg: ".docx 파일만 올릴 수 있어요 (.doc는 안 돼요)." });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setState({ kind: "busy", msg: `'${file.name}' 처리 중…` });
    try {
      const { fillUploadedDocx, downloadBlob } = await loadDocx();
      const buf = await file.arrayBuffer();
      // 저장된 초안(실제 작성 내용)을 반영해 채운다.
      const { blob, mode } = await fillUploadedDocx(buf, docWithDrafts(doc));
      downloadBlob(blob, `완성-${safeName}.docx`);
      setState({
        kind: "done",
        msg:
          mode === "filled"
            ? "채울 자리 표시를 찾아 내용을 넣었어요. 완성본을 내려받았어요."
            : "채울 자리 표시가 없어서 문서 끝에 내용을 붙였어요. 완성본을 내려받았어요.",
      });
    } catch (err) {
      setState({ kind: "error", msg: `처리하지 못했어요: ${(err as Error).message}` });
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
        지금까지 쓴 내용 그대로 완성본을 받거나, 우리 회사 서식에 맞춰 받을 수 있어요.
        파일은 이 브라우저 안에서만 처리돼요.
      </p>

      {/* 미리보기 — 받기 전에 화면에서 내용 확인 */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] border font-semibold text-text hover:bg-bg"
        style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "9px 14px", minHeight: 40, marginBottom: "var(--s-2)" }}
      >
        <Eye size={16} aria-hidden />
        미리보기
      </button>

      {/* 완성본 받기 — 서식 없이 바로, 실제 작성 내용 포함 */}
      <button
        type="button"
        onClick={onFinished}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color disabled:opacity-60"
        style={{ background: "var(--success)", fontSize: "var(--t-sm)", padding: "10px 14px", minHeight: 42 }}
      >
        <FileDown size={16} aria-hidden />
        완성본 .docx 받기
      </button>

      {previewOpen && <DocPreviewModal doc={docWithDrafts(doc)} onClose={() => setPreviewOpen(false)} />}

      {/* 회사 서식 사용 — 접이식 보조 옵션 */}
      <details style={{ marginTop: "var(--s-3)" }}>
        <summary
          className="cursor-pointer font-semibold text-text-muted hover:text-text"
          style={{ fontSize: "var(--t-xs)" }}
        >
          우리 회사 서식(로고·양식)에 맞춰 받고 싶다면
        </summary>
        <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--s-3)" }}>
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
        <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)", lineHeight: "var(--lh-base)" }}>
          샘플을 받아 채울 자리 표시({"{docTitle}"} 등)는 남기고 서식·로고만 고쳐서 다시 올리면, 그 자리에 내용을 넣어 드려요.
          채울 자리 표시가 없는 .docx를 올리면 문서 끝에 내용을 붙여요.
        </p>
      </details>

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
