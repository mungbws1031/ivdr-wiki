const PREFIX = "ivdr-draft";

function storageKey(docId: string, sectionIdx: number): string {
  return `${PREFIX}-${docId}-${sectionIdx}`;
}

export function getDraft(docId: string, sectionIdx: number): string | null {
  try {
    return localStorage.getItem(storageKey(docId, sectionIdx));
  } catch {
    return null;
  }
}

export function setDraft(docId: string, sectionIdx: number, text: string): void {
  try {
    localStorage.setItem(storageKey(docId, sectionIdx), text);
  } catch {
    // storage full — ignore silently
  }
}

export function clearDraft(docId: string, sectionIdx: number): void {
  try {
    localStorage.removeItem(storageKey(docId, sectionIdx));
  } catch {}
}

export function hasDraft(docId: string, sectionIdx: number): boolean {
  return getDraft(docId, sectionIdx) !== null;
}

export function clearAllDrafts(docId: string, sectionCount: number): void {
  for (let i = 0; i < sectionCount; i++) {
    clearDraft(docId, i);
  }
}
