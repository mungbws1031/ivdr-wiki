import { emitChange, useStoreVersion } from "./useDraftStore";
import { emptyDsoStore, type Dso, type DsoChange, type DsoStore, type DsoVerdict } from "../lib/dso";

/** 설계 출력(BOM·부품·PCB·펌웨어/앱·도면) 사람 등록·판정 — ivdr- 접두라 전체 백업에 포함된다. */
export const DSO_KEY = "ivdr-dso-v1";

let cache: DsoStore | null = null;

const DSO_KINDS = new Set(["bom", "part", "pcb", "firmware", "app", "drawing"]);
const VERDICTS = new Set<DsoVerdict>(["impact", "no-impact", "retest", "review"]);

function isDso(x: unknown): x is Omit<Dso, "revSeq"> & { revSeq?: unknown } {
  if (!x || typeof x !== "object") return false;
  const d = x as Record<string, unknown>;
  return typeof d.id === "string" && typeof d.kind === "string" && DSO_KINDS.has(d.kind) && typeof d.name === "string"
    && typeof d.revision === "string" && Array.isArray(d.reqs) && d.reqs.every((r) => typeof r === "string");
}

function isDsoChange(x: unknown): x is Omit<DsoChange, "seq"> & { seq?: unknown } {
  if (!x || typeof x !== "object") return false;
  const c = x as Record<string, unknown>;
  return typeof c.id === "string" && typeof c.dsoId === "string" && typeof c.revision === "string"
    && typeof c.reason === "string" && typeof c.author === "string" && typeof c.date === "string";
}

/** "DSO-001" → 1. 숫자를 못 찾으면 0 */
function dsoNum(id: string): number {
  const m = /(\d+)\s*$/.exec(id);
  return m ? parseInt(m[1], 10) : 0;
}

function load(): DsoStore {
  try {
    const raw = localStorage.getItem(DSO_KEY);
    const v = raw ? JSON.parse(raw) : null;
    if (!v || typeof v !== "object") return emptyDsoStore();
    const verdicts: Record<string, DsoVerdict> = {};
    if (v.verdicts && typeof v.verdicts === "object") {
      for (const [k, val] of Object.entries(v.verdicts as Record<string, unknown>)) if (typeof val === "string" && VERDICTS.has(val as DsoVerdict)) verdicts[k] = val as DsoVerdict;
    }
    const rawDsos: unknown[] = Array.isArray(v.dsos) ? v.dsos : [];
    const rawChanges: unknown[] = Array.isArray(v.changes) ? v.changes : [];
    const dsos: Dso[] = rawDsos.filter(isDso).map((d) => ({ ...d, revSeq: typeof d.revSeq === "number" ? d.revSeq : 0 }));
    const changes: DsoChange[] = rawChanges.filter(isDsoChange).map((c) => ({ ...c, seq: typeof c.seq === "number" ? c.seq : 0 }));
    const maxExisting = dsos.reduce((max, d) => Math.max(max, dsoNum(d.id)), 0);
    const nextDsoNum = typeof v.nextDsoNum === "number" && v.nextDsoNum > maxExisting ? v.nextDsoNum : maxExisting + 1;
    return { dsos, changes, verdicts, nextDsoNum };
  } catch {
    return emptyDsoStore();
  }
}

export function getDsoStore(): DsoStore {
  if (!cache) cache = load();
  return cache;
}

export function updateDsoStore(fn: (s: DsoStore) => DsoStore): void {
  cache = fn(getDsoStore());
  try { localStorage.setItem(DSO_KEY, JSON.stringify(cache)); } catch { /* 저장 불가 — 메모리 상태 유지 */ }
  emitChange();
}

export function useDsoStore(): DsoStore {
  useStoreVersion();
  return getDsoStore();
}
