// =====================================================================
// src/lib/translate.ts
// 문서 영문 번역 — Vercel 함수(server/api/translate.ts)를 부른다. 번역본은 브라우저에 저장.
// 원문(채운 초안 포함)의 해시를 같이 저장해, 원문이 바뀌면 "다시 번역" 안내를 띄운다.
// =====================================================================

import { emitChange } from "../hooks/useDraftStore";

export const AI_ENDPOINT = (import.meta.env.VITE_AI_ENDPOINT as string | undefined) ?? "https://ivdr-wiki-ai.vercel.app";

export interface TranslatedDoc {
  title: string;
  sections: { heading: string; body: string }[];
  sourceHash: string;
  model: string;
  at: string;
}

const key = (docId: string) => `ivdr-translation-en-${docId}`;

export function getTranslation(docId: string): TranslatedDoc | null {
  try {
    const raw = localStorage.getItem(key(docId));
    return raw ? (JSON.parse(raw) as TranslatedDoc) : null;
  } catch {
    return null;
  }
}

export function saveTranslation(docId: string, t: TranslatedDoc | null): void {
  try {
    if (t) localStorage.setItem(key(docId), JSON.stringify(t));
    else localStorage.removeItem(key(docId));
  } catch {
    // 저장 공간 부족 — 이번 화면에서만 유지
  }
  emitChange();
}

/** 원문 변경 감지용 해시 (FNV-1a). */
export function sourceHash(title: string, sections: { heading: string; body: string }[]): string {
  const str = JSON.stringify([title, sections]);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16);
}

export async function requestTranslation(title: string, sections: { heading: string; body: string }[]): Promise<TranslatedDoc> {
  let res: Response;
  try {
    res = await fetch(`${AI_ENDPOINT}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, sections }),
    });
  } catch {
    throw new Error("번역 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  const body = (await res.json().catch(() => null)) as { error?: string; title?: string; sections?: TranslatedDoc["sections"]; model?: string } | null;
  if (!res.ok || !body?.title || !body.sections) throw new Error(body?.error ?? `번역에 실패했습니다 (${res.status}).`);
  return { title: body.title, sections: body.sections, model: body.model ?? "", sourceHash: sourceHash(title, sections), at: new Date().toISOString() };
}

export function translationMarkdown(t: TranslatedDoc): string {
  return [`# ${t.title}`, ...t.sections.map((s) => `## ${s.heading}\n\n${s.body}`)].join("\n\n");
}
