import { emitChange, useStoreVersion } from "./useDraftStore";
import { applyAssumptions, type Assumption } from "../lib/evidence";
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

// ── 가정 모드 ──────────────────────────────────────────────
// 등급·문서 세트를 바꾸는 빈 칸을 보수적인 값으로 가정해 막힘 없이 진행한다 (기본 켜짐).
// 스펙 입력 화면은 원본(useSpec)을, 결과·문서 화면은 가정이 반영된 스펙(useWorkingSpec)을 쓴다.
export const ASSUME_KEY = "ivdr-assume-v1";

export function getAssumeMode(): boolean {
  try {
    return localStorage.getItem(ASSUME_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setAssumeMode(on: boolean): void {
  try {
    localStorage.setItem(ASSUME_KEY, on ? "on" : "off");
  } catch {
    // 저장 불가 — 이번 화면에서만 유지되지 않음
  }
  emitChange();
}

export interface WorkingSpec {
  /** 결과·문서에 쓰는 스펙 (가정 모드면 가정값 포함) */
  spec: ProductSpec;
  /** 사람이 입력한 원본 */
  raw: ProductSpec;
  assumed: Assumption[];
  assumeOn: boolean;
}

let working: { raw: ProductSpec; on: boolean; value: WorkingSpec } | null = null;

export function getWorkingSpec(): WorkingSpec {
  const raw = getSpec();
  const on = getAssumeMode();
  if (working && working.raw === raw && working.on === on) return working.value;
  const value: WorkingSpec = on ? { ...applyAssumptions(raw), raw, assumeOn: true } : { spec: raw, raw, assumed: [], assumeOn: false };
  working = { raw, on, value };
  return value;
}

export function useWorkingSpec(): WorkingSpec {
  useStoreVersion();
  return getWorkingSpec();
}
