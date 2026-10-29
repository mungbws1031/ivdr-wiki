// =====================================================================
// src/lib/pipelineExport.ts
// P1 초안 묶음 → sug-doc-pipeline 형식 (PHASE 1 S4 초안까지 완료, 다음 단계 S5 REG).
//   pipeline/<문서명>/<문서명>_v1.0_<YYYYMMDD>.docx  — 채운 초안 (사람 초안 우선)
//   pipeline/<문서명>/state.json                    — 파이프라인 상태 파일
//   pipeline/<문서명>/input.json                    — S1 입력 (문서 유형·제품 정보·규정, 근거 원장)
// 회사 자산(TPP·사내 템플릿)은 넣지 않는다. docx 생성은 호출 쪽에서 넘긴다 (테스트 가능하게).
// =====================================================================

import PizZip from "pizzip";
import type { DocTemplate } from "../data/documents";
import type { ProductSpec } from "../data/spec/types";
import type { DocEvidence } from "./evidence";
import { TAG_META } from "./evidence";
import { TOKEN_LABEL } from "./tokens";

/** P1 대상 문서와 파이프라인 문서명 */
export const P1_DOCS: { id: string; name: string }[] = [
  { id: "device-description", name: "DeviceDescription" },
  { id: "labelling-spec", name: "Labelling" },
  { id: "ifu", name: "IFU" },
  { id: "risk-management-plan", name: "RiskManagementPlan" },
];

export interface PipelineDoc {
  id: string;
  /** 토큰을 채우고 사람 초안을 얹은 문서 */
  doc: DocTemplate;
  evidence: DocEvidence;
}

const safe = (t: string) => t.replace(/\(예시\)/g, "").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "product";
export const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);

export const productSlug = (spec: ProductSpec) => safe(spec.identity.productName ?? "product");

export function folderName(id: string, spec: ProductSpec): string {
  const name = P1_DOCS.find((d) => d.id === id)?.name ?? id;
  return `${name}_${productSlug(spec)}`;
}

/** 사람이 확인해야 할 항목 — 누락·가정·추정 토큰과 본문 빈칸 */
export function pendingItems(ev: DocEvidence): string[] {
  const out = ev.tokens.filter((t) => t.tag === "missing" || t.tag === "assumed" || t.tag === "estimated").map((t) => `${TOKEN_LABEL[t.key] ?? t.key} — ${TAG_META[t.tag].label}`);
  if (ev.gaps) out.push(`본문 빈칸 ${ev.gaps}개 ([____]·[실험 후 입력]·[확인 필요] 등)`);
  return out;
}

export function pipelineState(p: PipelineDoc, spec: ProductSpec, date: Date) {
  const folder = folderName(p.id, spec);
  return {
    document: folder,
    current_phase: 1,
    current_step: "S5",
    latest_version: "v1.0",
    doc_path: `${folder}_v1.0_${ymd(date)}.docx`,
    pending: pendingItems(p.evidence),
    history: [{ phase: 1, version: "v1.0", date: iso(date), status: "초안 완료 — S5 REG 검토 전 (ivdr-wiki 자동 초안)" }],
  };
}

export function pipelineInput(p: PipelineDoc, spec: ProductSpec) {
  const e = p.evidence;
  return {
    source: "ivdr-wiki P1 자동 초안",
    document_type: p.doc.docTitle,
    regulation: p.doc.refs,
    product: {
      name: spec.identity.productName, model: spec.identity.model, manufacturer: spec.identity.manufacturerName,
      productType: spec.productType, formFactor: spec.formFactor, assayMethod: spec.assay?.method ?? null,
      analyte: spec.analyte.name, specimen: spec.specimen, resultKind: spec.result.kind, readout: spec.result.readout,
      user: spec.user, environment: spec.environment, markets: spec.markets,
    },
    sections: p.doc.sections.map((s) => s.heading),
    evidence: { confirmed: pct(e.confirmed), counts: e.counts, gaps: e.gaps, drafted: e.drafted },
    notes: ["검토 전 초안 — 제출용 아님", "시험 수치·위험 P·S 점수는 만들지 않았다 (빈칸)", "회사 TPP·사내 템플릿 미포함"],
  };
}

/** docx 앞에 붙는 초안 표시 (목적 문단 앞) */
export function withDraftNotice(doc: DocTemplate, ev: DocEvidence): DocTemplate {
  return { ...doc, purpose: `[검토 전 초안 — 근거 확정 ${pct(ev.confirmed)}, 제품 스펙으로 자동 작성] ${doc.purpose}` };
}

export async function buildPipelineZip(
  docs: PipelineDoc[],
  spec: ProductSpec,
  date: Date,
  makeDocx: (doc: DocTemplate) => Promise<Blob>,
): Promise<Uint8Array> {
  const zip = new PizZip();
  for (const p of docs) {
    const folder = `pipeline/${folderName(p.id, spec)}`;
    const blob = await makeDocx(withDraftNotice(p.doc, p.evidence));
    zip.file(`${folder}/${folderName(p.id, spec)}_v1.0_${ymd(date)}.docx`, new Uint8Array(await blob.arrayBuffer()));
    zip.file(`${folder}/state.json`, JSON.stringify(pipelineState(p, spec, date), null, 2));
    zip.file(`${folder}/input.json`, JSON.stringify(pipelineInput(p, spec), null, 2));
  }
  zip.file("README.txt", [
    "ivdr-wiki P1 초안 묶음 (sug-doc-pipeline 형식)",
    "각 폴더는 PHASE 1 S4(초안)까지 끝난 상태입니다. 다음 단계: S5 REG 검토.",
    "모든 문서는 검토 전 초안입니다. 빈칸([____]·[실험 후 입력]·[__])은 사람이 채웁니다.",
  ].join("\n"));
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}

/** 화면에서 쓰는 조립 — 토큰 채움 + 사람 초안 + 근거 원장 */
export function assemblePipelineDocs(
  ids: string[],
  resolve: (id: string) => DocTemplate | undefined,
  fill: (raw: DocTemplate) => DocTemplate,
  withDrafts: (doc: DocTemplate) => DocTemplate,
  evidenceOf: (raw: DocTemplate, filled: DocTemplate) => DocEvidence,
): PipelineDoc[] {
  return ids.flatMap((id) => {
    const raw = resolve(id);
    if (!raw) return [];
    const filled = fill(raw);
    return [{ id, doc: withDrafts(filled), evidence: evidenceOf(raw, filled) }];
  });
}
