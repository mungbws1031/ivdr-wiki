// =====================================================================
// src/lib/backup.ts
// 브라우저(localStorage)에만 있는 작업 데이터 전체 백업·복원.
// 대상: 초안·체크(ivdr-draft/ivdr-check), 제품 스펙(ivdr-spec-v1), 일정·사용자 스니펫(ivdr-wiki-*),
//       문서 진행 상태(cert-progress-*).
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import { validateSpec } from "../data/spec/validate";

const BACKUP_PREFIXES = ["ivdr-", "cert-progress-"];
const isBackupKey = (k: string) => BACKUP_PREFIXES.some((p) => k.startsWith(p));

export interface BackupFile {
  app: "ivdr-wiki";
  v: 1;
  kind: "all" | "spec";
  exportedAt: string;
  items: Record<string, string>;
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function download(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function collectAll(): Record<string, string> {
  const items: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isBackupKey(k)) items[k] = localStorage.getItem(k) ?? "";
    }
  } catch {
    // 접근 불가 — 빈 백업
  }
  return items;
}

/** 전체 작업 데이터를 JSON 파일로 내려받는다. 반환값: 포함된 항목 수. */
export function exportAll(): number {
  const items = collectAll();
  const file: BackupFile = { app: "ivdr-wiki", v: 1, kind: "all", exportedAt: new Date().toISOString(), items };
  download(`ivdr-wiki-backup-${stamp()}.json`, file);
  return Object.keys(items).length;
}

export function exportSpecOnly(spec: ProductSpec): void {
  const file: BackupFile = {
    app: "ivdr-wiki", v: 1, kind: "spec", exportedAt: new Date().toISOString(),
    items: { "ivdr-spec-v1": JSON.stringify(spec) },
  };
  const name = (spec.identity.productName ?? "spec").replace(/[^\p{L}\p{N}-]+/gu, "_").slice(0, 40);
  download(`ivdr-spec-${name}-${stamp()}.json`, file);
}

export interface ParsedBackup {
  file: BackupFile;
  keyCount: number;
  hasSpec: boolean;
}

/** 파일 내용을 검사만 한다(아직 쓰지 않음). 실패하면 사용자에게 보여줄 메시지를 던진다. */
export function parseBackup(text: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("JSON 파일이 아닙니다. 이 앱에서 내보낸 백업 파일을 선택해 주세요.");
  }
  const f = raw as Partial<BackupFile>;
  if (!f || f.app !== "ivdr-wiki") throw new Error("IVDR 위키 백업 파일이 아닙니다.");
  if (f.v !== 1) throw new Error(`지원하지 않는 백업 버전입니다 (v${String(f.v)}).`);
  if (!f.items || typeof f.items !== "object") throw new Error("백업 파일에 데이터가 없습니다.");
  const items: Record<string, string> = {};
  for (const [k, v] of Object.entries(f.items)) {
    if (isBackupKey(k) && typeof v === "string") items[k] = v;
  }
  if (items["ivdr-spec-v1"]) {
    let specRaw: unknown;
    try {
      specRaw = JSON.parse(items["ivdr-spec-v1"]);
    } catch {
      throw new Error("백업 안의 제품 스펙이 손상되었습니다.");
    }
    const r = validateSpec(specRaw);
    if (!r.ok) throw new Error(r.errors[0] ?? "제품 스펙 형식이 맞지 않습니다.");
    items["ivdr-spec-v1"] = JSON.stringify(r.spec);
  }
  return {
    file: { app: "ivdr-wiki", v: 1, kind: f.kind === "spec" ? "spec" : "all", exportedAt: String(f.exportedAt ?? ""), items },
    keyCount: Object.keys(items).length,
    hasSpec: !!items["ivdr-spec-v1"],
  };
}

/**
 * merge: 백업에 있는 항목만 덮어쓰고 나머지는 둔다.
 * overwrite: 기존 작업 데이터를 모두 지우고 백업으로 바꾼다.
 */
export function applyBackup(parsed: ParsedBackup, mode: "merge" | "overwrite"): void {
  if (mode === "overwrite") {
    const existing = Object.keys(collectAll());
    existing.forEach((k) => localStorage.removeItem(k));
  }
  for (const [k, v] of Object.entries(parsed.file.items)) localStorage.setItem(k, v);
}

/** 브라우저가 저장소를 임의로 비우지 않도록 요청한다. 한 번만. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
