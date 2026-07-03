import { useRef, useState } from "react";
import { FileType2, Upload, Download, FileDown, Loader2, Check, AlertCircle } from "lucide-react";
import type { DocTemplate } from "../data/documents";
import { docWithDrafts } from "../hooks/useDraftStore";

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

  const onFinished = async () => {
    setState({ kind: "busy", msg: "완성본 생성 중…" });
    try {
      const { generateFinishedDocx, downloadBlob } = await loadDocx();
      const blob = await generateFinishedDocx(docWithDrafts(doc));
      downloadBlob(blob, `완성-${safeName}.docx`);
      setState({ kind: "done", msg: "지금까지 작성한 내용으로 완성본 .docx를 내려받았습니다." });
    } catch (e) {
      setState({ kind: "error", msg: `생성 실패: ${(e as Error).message}` });
    }
  };

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
      // 저장된 초안(실제 작성 내용)을 반영해 채운다.
      const { blob, mode } = await fillUploadedDocx(buf, docWithDrafts(doc));
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
        지금까지 작성한 내용 그대로 완성본을 받거나, 우리 회사 서식에 맞춰 받을 수 있습니다.
        처리는 브라우저에서만 이뤄집니다.
      </p>

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
          샘플을 받아 표시자({"{docTitle}"} 등)를 남긴 채 서식·로고만 편집한 뒤 다시 올리면 그 자리에 채워 넣습니다.
          표시자가 없는 임의의 .docx를 올리면 문서 끝에 내용을 추가합니다.
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
