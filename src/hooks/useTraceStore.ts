import { emitChange, useStoreVersion } from "./useDraftStore";
import { emptyTraceStore, type TraceStore } from "../lib/trace";

/** 추적성 사람 조작(검토·연결 편집·사용자 요구사항) — ivdr- 접두라 전체 백업에 포함된다. */
export const TRACE_KEY = "ivdr-trace-v1";

let cache: TraceStore | null = null;

function load(): TraceStore {
  try {
    const raw = localStorage.getItem(TRACE_KEY);
    const v = raw ? JSON.parse(raw) : null;
    if (!v || typeof v !== "object") return emptyTraceStore();
    const arr = (x: unknown) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === "string") : []);
    return {
      reviewed: v.reviewed && typeof v.reviewed === "object" ? v.reviewed : {},
      removed: arr(v.removed), added: arr(v.added),
      custom: Array.isArray(v.custom) ? v.custom.filter((c: unknown) => c && typeof c === "object" && typeof (c as { id?: unknown }).id === "string") : [],
    };
  } catch {
    return emptyTraceStore();
  }
}

export function getTraceStore(): TraceStore {
  if (!cache) cache = load();
  return cache;
}

export function updateTraceStore(fn: (s: TraceStore) => TraceStore): void {
  cache = fn(getTraceStore());
  try { localStorage.setItem(TRACE_KEY, JSON.stringify(cache)); } catch { /* 저장 불가 — 메모리 상태 유지 */ }
  emitChange();
}

export function useTraceStore(): TraceStore {
  useStoreVersion();
  return getTraceStore();
}
