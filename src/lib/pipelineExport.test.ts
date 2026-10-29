import { describe, expect, it } from "vitest";
import PizZip from "pizzip";
import { exampleSpec } from "../data/spec/validate";
import { resolveDoc } from "../data/documents";
import { buildTokenContext, fillDoc } from "./tokens";
import { docEvidence } from "./evidence";
import { assemblePipelineDocs, buildPipelineZip, P1_DOCS } from "./pipelineExport";

describe("sug-doc-pipeline 내보내기", () => {
  it("문서 4개 × (docx·state.json·input.json), state는 S5", async () => {
    const spec = exampleSpec();
    const ctx = buildTokenContext(spec);
    const docs = assemblePipelineDocs(P1_DOCS.map((d) => d.id), resolveDoc, (raw) => fillDoc(raw, ctx), (d) => d, (raw, filled) => docEvidence(raw, filled, ctx, new Set()));
    expect(docs).toHaveLength(4);
    const bytes = await buildPipelineZip(docs, spec, new Date(2026, 9, 29), async () => new Blob(["docx"]));
    const zip = new PizZip(bytes);
    const files = Object.keys(zip.files).filter((f) => !f.endsWith("/"));
    expect(files.filter((f) => f.endsWith(".docx"))).toHaveLength(4);
    const states = files.filter((f) => f.endsWith("state.json"));
    expect(states).toHaveLength(4);
    const st = JSON.parse(zip.file(states[0])!.asText());
    expect(st).toMatchObject({ current_phase: 1, current_step: "S5", latest_version: "v1.0" });
    expect(Array.isArray(st.pending)).toBe(true);
    expect(files.some((f) => /pipeline\/IFU_Surearly_LH_[^/]+\/IFU_Surearly_LH_[^/]+_v1\.0_20261029\.docx$/.test(f))).toBe(true);
    const input = JSON.parse(zip.file(files.find((f) => f.endsWith("input.json"))!)!.asText());
    expect(input.notes.join()).toContain("TPP");
  });
});
