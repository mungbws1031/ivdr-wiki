import { emitChange } from "./useDraftStore";

// 컨셉 한 줄과 그 문장에서 '추정'한 스펙 칸. 사람이 그 칸을 고치거나 '맞아요'를 누르면 추정에서 빠진다.
export const CONCEPT_KEY = "ivdr-concept-v1";

export interface ConceptState {
  text: string;
  estimated: string[];
}

export function getConcept(): ConceptState {
  try {
    const x = JSON.parse(localStorage.getItem(CONCEPT_KEY) ?? "null") as Partial<ConceptState> | null;
    return { text: typeof x?.text === "string" ? x.text : "", estimated: Array.isArray(x?.estimated) ? x!.estimated.filter((p) => typeof p === "string") : [] };
  } catch {
    return { text: "", estimated: [] };
  }
}

function save(c: ConceptState): void {
  try {
    localStorage.setItem(CONCEPT_KEY, JSON.stringify(c));
  } catch {
    // 저장 불가 — 무시
  }
  emitChange();
}

export function saveConcept(text: string, estimated: string[]): void {
  save({ text, estimated: [...new Set(estimated)] });
}

/** 추정에서 빼기 (사람이 확인함). paths 없으면 전부. */
export function confirmEstimated(paths?: string[]): void {
  const c = getConcept();
  if (!c.estimated.length) return;
  save({ ...c, estimated: paths ? c.estimated.filter((p) => !paths.includes(p)) : [] });
}
