import { emitChange, useStoreVersion } from "./useDraftStore";
import type { IvdClass } from "../lib/rules/classify";

export const CONFIRM_KEY = "ivdr-confirm-class";

export interface ClassConfirm {
  value: IvdClass;
  specHash: string; // 확정 당시 스펙 — 달라지면 재확인 필요
  at: string;
}

export function getClassConfirm(): ClassConfirm | null {
  try {
    const raw = localStorage.getItem(CONFIRM_KEY);
    if (!raw) return null;
    const x = JSON.parse(raw) as Partial<ClassConfirm>;
    if (!x.value || !["A", "B", "C", "D"].includes(x.value) || typeof x.specHash !== "string") return null;
    return { value: x.value, specHash: x.specHash, at: String(x.at ?? "") };
  } catch {
    return null;
  }
}

export function confirmClass(value: IvdClass, specHash: string): void {
  try {
    localStorage.setItem(CONFIRM_KEY, JSON.stringify({ value, specHash, at: new Date().toISOString() }));
  } catch {
    // 저장 불가 — 무시
  }
  emitChange();
}

export function clearClassConfirm(): void {
  try {
    localStorage.removeItem(CONFIRM_KEY);
  } catch {
    // 무시
  }
  emitChange();
}

export function useClassConfirm(): ClassConfirm | null {
  useStoreVersion();
  return getClassConfirm();
}
