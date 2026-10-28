import { emitChange, useStoreVersion } from "./useDraftStore";
import type { ResultsMap, StudyResult } from "../lib/results";

/** 실험 결과 저장소 — 키가 ivdr- 로 시작해 전체 백업에 자동 포함된다. */
export const RESULTS_KEY = "ivdr-results-v1";

let cache: ResultsMap | null = null;

function load(): ResultsMap {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === "object" && !Array.isArray(v) ? (v as ResultsMap) : {};
  } catch {
    return {};
  }
}

export function getResults(): ResultsMap {
  if (!cache) cache = load();
  return cache;
}

export function setResult(studyId: string, r: StudyResult | null): void {
  const next = { ...getResults() };
  if (r) next[studyId] = { ...r, updatedAt: new Date().toISOString() };
  else delete next[studyId];
  cache = next;
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(next));
  } catch {
    // 저장 공간 부족·차단 — 메모리 상태는 유지
  }
  emitChange();
}

/** 백업 가져오기 등으로 localStorage가 바뀌었을 때 다시 읽는다. */
export function reloadResults(): void {
  cache = null;
  emitChange();
}

export function useResults(): ResultsMap {
  useStoreVersion();
  return getResults();
}
