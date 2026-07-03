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

/**
 * 내보내기(MD/Word)용 — 각 섹션의 placeholder를 사용자가 저장한 초안으로 치환한
 * 문서 사본을 만든다. 초안이 없는 섹션은 원본 placeholder를 유지한다.
 * (호출 시점의 localStorage를 읽으므로 편집 직후 최신 내용이 반영된다.)
 */
export function docWithDrafts<
  T extends { id: string; sections: { placeholder: string }[] },
>(doc: T): T {
  return {
    ...doc,
    sections: doc.sections.map((s, i) => ({
      ...s,
      placeholder: getDraft(doc.id, i) ?? s.placeholder,
    })),
  };
}
