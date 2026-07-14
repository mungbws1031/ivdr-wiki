import { useSyncExternalStore } from "react";

const PREFIX = "ivdr-draft";

// ── 변경 구독 (진척·체크 UI가 실시간 반영되도록) ──────────────────
const CHANGE_EVENT = "ivdr-store-change";
let storeVersion = 0;

function emitChange(): void {
  storeVersion++;
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // SSR/no-window — 무시
  }
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}

/** 초안/체크 스토어가 바뀔 때마다 리렌더를 유도한다. */
export function useStoreVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => storeVersion,
    () => storeVersion,
  );
}

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
  emitChange();
}

export function clearDraft(docId: string, sectionIdx: number): void {
  try {
    localStorage.removeItem(storageKey(docId, sectionIdx));
  } catch {}
  emitChange();
}

export function hasDraft(docId: string, sectionIdx: number): boolean {
  return getDraft(docId, sectionIdx) !== null;
}

export function clearAllDrafts(docId: string, sectionCount: number): void {
  for (let i = 0; i < sectionCount; i++) {
    clearDraft(docId, i);
  }
}

// ── 완료 체크리스트 상태 (사용자가 직접 체크) ──────────────────────
const CHECK_PREFIX = "ivdr-check";

function checkKey(docId: string, idx: number): string {
  return `${CHECK_PREFIX}-${docId}-${idx}`;
}

export function getCheck(docId: string, idx: number): boolean {
  try {
    return localStorage.getItem(checkKey(docId, idx)) === "1";
  } catch {
    return false;
  }
}

export function setCheck(docId: string, idx: number, checked: boolean): void {
  try {
    if (checked) localStorage.setItem(checkKey(docId, idx), "1");
    else localStorage.removeItem(checkKey(docId, idx));
  } catch {
    // storage full — ignore silently
  }
  emitChange();
}

export function countChecks(docId: string, total: number): number {
  let n = 0;
  for (let i = 0; i < total; i++) if (getCheck(docId, i)) n++;
  return n;
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
