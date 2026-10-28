import { emitChange } from "./useDraftStore";
import type { Snapshot } from "../lib/impact";

// 문서별 검토 기준 — 문서를 처음 열었을 때, 또는 '검토 완료'를 누를 때 그 시점의 값을 저장한다.
export const REVIEW_KEY = "ivdr-review-v1";

export interface ReviewBase {
  at: string;
  values: Snapshot;
}

function load(): Record<string, ReviewBase> {
  try {
    const x = JSON.parse(localStorage.getItem(REVIEW_KEY) ?? "{}");
    return x && typeof x === "object" ? (x as Record<string, ReviewBase>) : {};
  } catch {
    return {};
  }
}

export function getReview(docId: string): ReviewBase | null {
  const r = load()[docId];
  return r && typeof r === "object" && r.values && typeof r.values === "object" ? r : null;
}

export function saveReview(docId: string, values: Snapshot, notify = true): void {
  try {
    const all = load();
    all[docId] = { at: new Date().toISOString(), values };
    localStorage.setItem(REVIEW_KEY, JSON.stringify(all));
  } catch {
    // 저장 불가 — 이번 화면에서만 기준 없음
  }
  if (notify) emitChange();
}
