import { emitChange, useStoreVersion } from "./useDraftStore";
import type { ProductSpec } from "../data/spec/types";
import { emptySpec, setAt, validateSpec } from "../data/spec/validate";

export const SPEC_KEY = "ivdr-spec-v1";

let cache: ProductSpec | null = null;

function load(): ProductSpec {
  try {
    const raw = localStorage.getItem(SPEC_KEY);
    if (!raw) return emptySpec();
    const r = validateSpec(JSON.parse(raw));
    return r.ok ? r.spec : emptySpec();
  } catch {
    return emptySpec();
  }
}

function save(next: ProductSpec): void {
  cache = next;
  try {
    localStorage.setItem(SPEC_KEY, JSON.stringify(next));
  } catch {
    // 저장 공간 부족·차단 — 메모리 상태는 유지
  }
  emitChange();
}

export function getSpec(): ProductSpec {
  if (!cache) cache = load();
  return cache;
}

export function setSpecField(path: string, value: unknown): void {
  const next = setAt(getSpec(), path, value);
  next.meta = { updatedAt: new Date().toISOString() };
  save(next);
}

export function replaceSpec(spec: ProductSpec): void {
  save({ ...spec, meta: { updatedAt: new Date().toISOString() } });
}

export function resetSpec(): void {
  cache = emptySpec();
  try {
    localStorage.removeItem(SPEC_KEY);
  } catch {
    // 무시
  }
  emitChange();
}

/** 백업 가져오기 등으로 localStorage가 바뀌었을 때 다시 읽는다. */
export function reloadSpec(): void {
  cache = null;
  emitChange();
}

/** 스펙이 바뀔 때마다 리렌더. */
export function useSpec(): ProductSpec {
  useStoreVersion();
  return getSpec();
}
