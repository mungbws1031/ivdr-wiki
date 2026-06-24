// =====================================================================
// src/lib/docx.ts
// 워드(.docx) 내보내기 — 전부 브라우저에서 처리(서버 업로드 없음).
//  · generateSampleDocx : 표시자({docTitle}, {#sections}...)가 든 샘플 .docx 생성
//  · fillUploadedDocx   : 업로드한 .docx 자동 판별
//       표시자 있으면 그 자리에 채움(docxtemplater),
//       없으면 문서 끝에 내용을 본문으로 덧붙임(XML 주입).
// =====================================================================

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import type { DocTemplate } from "../data/documents";
import { prereqKindLabel, difficultyLabel, importanceLabel, leafById } from "../data/docTree";

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type FillMode = "filled" | "appended";

/** docxtemplater 데이터 객체. 샘플 표시자와 키가 일치한다. */
function buildData(doc: DocTemplate) {
  return {
    docTitle: doc.docTitle,
    purpose: doc.purpose,
    rationale: doc.rationale ?? "",
    refsLine: doc.refs.join(" · "),
    difficulty: doc.difficulty ? difficultyLabel[doc.difficulty] : "",
    importance: doc.importance ? importanceLabel[doc.importance] : "",
    prepDocs: (doc.prepDocs ?? []).map((id) => ({
      title: leafById(id)?.title ?? id,
    })),
    knowledge: (doc.knowledge ?? []).map((k) => ({ item: k })),
    prerequisites: (doc.prerequisites ?? []).map((p) => ({
      kind: prereqKindLabel[p.kind],
      label: p.label,
    })),
    sections: doc.sections.map((s) => ({
      heading: s.heading,
      guidance: s.guidance,
      placeholder: s.placeholder,
    })),
    checklist: doc.checklist.map((item) => ({ item })),
  };
}

// ---- 표시자 없는 문서: 끝에 덧붙일 본문 XML 생성 ----
function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function paraXml(
  text: string,
  opts?: { bold?: boolean; size?: number },
): string {
  const runProps =
    opts && (opts.bold || opts.size)
      ? `<w:rPr>${opts.bold ? "<w:b/>" : ""}${
          opts.size ? `<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>` : ""
        }</w:rPr>`
      : "";
  return `<w:p><w:r>${runProps}<w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`;
}

function buildBodyXml(doc: DocTemplate): string {
  const parts: string[] = [];
  parts.push(paraXml(doc.docTitle, { bold: true, size: 32 }));
  parts.push(paraXml(`목적: ${doc.purpose}`));
  parts.push(paraXml(`근거: ${doc.refs.join(" · ")}`));
  if (doc.difficulty && doc.importance) {
    parts.push(
      paraXml(
        `난이도: ${difficultyLabel[doc.difficulty]} · 중요도: ${importanceLabel[doc.importance]}`,
      ),
    );
  }
  parts.push(paraXml(""));
  if (doc.rationale) {
    parts.push(paraXml("취지 — 왜 이 문서를 쓰는가", { bold: true, size: 26 }));
    parts.push(paraXml(doc.rationale));
    parts.push(paraXml(""));
  }
  if (doc.prepDocs && doc.prepDocs.length) {
    parts.push(paraXml("미리 만들어두면 좋은 문서", { bold: true, size: 26 }));
    for (const id of doc.prepDocs) parts.push(paraXml(`· ${leafById(id)?.title ?? id}`));
    parts.push(paraXml(""));
  }
  if (doc.knowledge && doc.knowledge.length) {
    parts.push(paraXml("작성 전 알아야 할 것", { bold: true, size: 26 }));
    for (const k of doc.knowledge) parts.push(paraXml(`☐ ${k}`));
    parts.push(paraXml(""));
  }
  if (doc.prerequisites && doc.prerequisites.length) {
    parts.push(paraXml("작성 전 준비물", { bold: true, size: 26 }));
    for (const p of doc.prerequisites) {
      parts.push(paraXml(`☐ (${prereqKindLabel[p.kind]}) ${p.label}`));
    }
    parts.push(paraXml(""));
  }
  for (const s of doc.sections) {
    parts.push(paraXml(s.heading, { bold: true, size: 26 }));
    parts.push(paraXml(`· ${s.guidance}`));
    for (const line of s.placeholder.split("\n")) parts.push(paraXml(line));
    parts.push(paraXml(""));
  }
  parts.push(paraXml("완료 체크리스트", { bold: true, size: 26 }));
  for (const c of doc.checklist) parts.push(paraXml(`☐ ${c}`));
  return parts.join("");
}

const PLACEHOLDER_RE =
  /\{\s*(docTitle|purpose|refsLine|#\s*sections|#\s*checklist)\s*\}/;

/** 업로드한 .docx 자동 판별 → 채움 또는 덧붙임. */
export async function fillUploadedDocx(
  buf: ArrayBuffer,
  doc: DocTemplate,
): Promise<{ blob: Blob; mode: FillMode }> {
  let zip: PizZip;
  try {
    zip = new PizZip(buf);
  } catch {
    throw new Error("파일을 열 수 없습니다. .docx 형식인지 확인해 주세요.");
  }
  const docXml = zip.file("word/document.xml");
  if (!docXml) {
    throw new Error("올바른 .docx 가 아닙니다 (word/document.xml 없음).");
  }
  const xml = docXml.asText();

  if (PLACEHOLDER_RE.test(xml)) {
    // 표시자 채우기
    const dt = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    dt.render(buildData(doc));
    const blob = dt.getZip().generate({ type: "blob", mimeType: DOCX_MIME });
    return { blob, mode: "filled" };
  }

  // 끝에 덧붙이기
  const body = buildBodyXml(doc);
  let newXml: string;
  const sectIdx = xml.lastIndexOf("<w:sectPr");
  if (sectIdx !== -1) {
    newXml = xml.slice(0, sectIdx) + body + xml.slice(sectIdx);
  } else {
    newXml = xml.replace("</w:body>", body + "</w:body>");
  }
  zip.file("word/document.xml", newXml);
  const blob = zip.generate({ type: "blob", mimeType: DOCX_MIME });
  return { blob, mode: "appended" };
}

/** 표시자가 든 샘플 .docx 생성(사장님 서식/로고에 표시자만 넣으면 됨). */
export async function generateSampleDocx(doc: DocTemplate): Promise<Blob> {
  const line = (text: string, o?: { bold?: boolean; heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel] }) =>
    new Paragraph({
      heading: o?.heading,
      children: [new TextRun({ text, bold: o?.bold })],
    });

  const children: Paragraph[] = [
    line(`[샘플 템플릿] ${doc.docTitle} — 표시자는 그대로 두고 서식·로고만 편집하세요`, { bold: true }),
    line(""),
    line("{docTitle}", { heading: HeadingLevel.HEADING_1 }),
    line("목적: {purpose}"),
    line("근거: {refsLine}"),
    line("난이도: {difficulty} · 중요도: {importance}"),
    line(""),
    line("취지 — 왜 이 문서를 쓰는가", { heading: HeadingLevel.HEADING_2 }),
    line("{rationale}"),
    line(""),
    line("미리 만들어두면 좋은 문서", { heading: HeadingLevel.HEADING_2 }),
    line("{#prepDocs}"),
    line("· {title}"),
    line("{/prepDocs}"),
    line(""),
    line("작성 전 알아야 할 것", { heading: HeadingLevel.HEADING_2 }),
    line("{#knowledge}"),
    line("- {item}"),
    line("{/knowledge}"),
    line(""),
    line("작성 전 준비물", { heading: HeadingLevel.HEADING_2 }),
    line("{#prerequisites}"),
    line("- [{kind}] {label}"),
    line("{/prerequisites}"),
    line(""),
    line("[아래 sections 블록이 각 섹션마다 반복됩니다]"),
    line("{#sections}"),
    line("{heading}", { bold: true }),
    line("{guidance}"),
    line("{placeholder}"),
    line("{/sections}"),
    line(""),
    line("완료 체크리스트", { heading: HeadingLevel.HEADING_2 }),
    line("{#checklist}"),
    line("- {item}"),
    line("{/checklist}"),
  ];

  const document = new Document({ sections: [{ children }] });
  return Packer.toBlob(document);
}

/** Blob 다운로드 트리거. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
