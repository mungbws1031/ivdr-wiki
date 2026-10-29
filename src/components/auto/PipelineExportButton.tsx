import { useState } from "react";
import { PackageOpen } from "lucide-react";
import { resolveDoc } from "../../data/documents";
import { docWithDrafts, hasDraft } from "../../hooks/useDraftStore";
import { getWorkingSpec } from "../../hooks/useSpecStore";
import { getResults } from "../../hooks/useResultsStore";
import { buildTokenContext, fillDoc } from "../../lib/tokens";
import { docEvidence, markAssumed } from "../../lib/evidence";
import { assemblePipelineDocs, buildPipelineZip, folderName, P1_DOCS, productSlug, ymd } from "../../lib/pipelineExport";

const loadDocx = () => import("../../lib/docx");

/** P1 초안(기기 설명서·라벨·IFU·위험관리 계획)을 sug-doc-pipeline 형식 zip으로 내보낸다. ids를 주면 그 문서만. */
export function PipelineExportButton({ ids = P1_DOCS.map((d) => d.id), label }: { ids?: string[]; label?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const run = async () => {
    setState("busy");
    try {
      const { spec, assumed, estimated } = getWorkingSpec();
      const ctx = buildTokenContext(spec, undefined, getResults());
      const marked = markAssumed(ctx, assumed, estimated);
      const assumedPaths = new Set(assumed.map((a) => a.path));
      const estPaths = new Set(estimated);
      const docs = assemblePipelineDocs(
        ids, resolveDoc, (raw) => fillDoc(raw, marked), docWithDrafts,
        (raw, filled) => docEvidence(raw, filled, ctx, assumedPaths, (i) => hasDraft(raw.id, i), estPaths),
      );
      const { generateFinishedDocx, downloadBlob } = await loadDocx();
      const now = new Date();
      const bytes = await buildPipelineZip(docs, spec, now, generateFinishedDocx);
      const base = ids.length === 1 ? folderName(ids[0], spec) : `ivdr-p1-drafts_${productSlug(spec)}`;
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/zip" }), `${base}_${ymd(now)}.zip`);
      setState("done");
    } catch {
      setState("error");
    }
  };
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <button
        type="button"
        onClick={run}
        disabled={state === "busy"}
        className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-bold border disabled:opacity-50"
        style={{ padding: "8px 14px", fontSize: "var(--t-sm)", borderColor: "var(--accent)", color: "var(--accent)", background: "var(--bg)", minHeight: 40 }}
      >
        <PackageOpen size={16} aria-hidden />
        {state === "busy" ? "묶는 중…" : label ?? "P1 초안 묶음 내보내기 (sug-doc-pipeline)"}
      </button>
      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }} role="status">
        {state === "done" ? "내려받았습니다 — 폴더마다 초안 docx·state.json(S5 REG 전)·input.json" : state === "error" ? "내보내지 못했습니다. 다시 시도해 주세요." : "검토 전 초안 · 빈칸은 그대로 남깁니다"}
      </p>
    </div>
  );
}
