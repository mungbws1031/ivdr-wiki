// =====================================================================
// src/lib/googleDrive.ts
// Google Drive OAuth 2.0 (GIS Token Flow) + Drive REST API 유틸
// =====================================================================

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const API = "https://www.googleapis.com/drive/v3";

// ── GIS 타입 선언 ────────────────────────────────────────────────────
type GISTokenResponse = { access_token?: string; error?: string };
type GISTokenClient = { requestAccessToken: (opts?: { prompt?: string }) => void };

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (r: GISTokenResponse) => void;
          }) => GISTokenClient;
          revoke: (token: string, cb: () => void) => void;
        };
      };
    };
  }
}

// ── 상태 ─────────────────────────────────────────────────────────────
let _token: string | null = null;
let _client: GISTokenClient | null = null;

export const isConnected = () => _token !== null;

// ── GIS 스크립트 로드 ─────────────────────────────────────────────────
export function loadGIS(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("GIS 스크립트 로드 실패"));
    document.head.appendChild(s);
  });
}

// ── OAuth 연결 / 해제 ─────────────────────────────────────────────────
export async function connect(): Promise<string> {
  await loadGIS();
  return new Promise((resolve, reject) => {
    _client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (r) => {
        if (r.access_token) {
          _token = r.access_token;
          resolve(r.access_token);
        } else {
          reject(new Error(r.error ?? "인증 실패"));
        }
      },
    });
    _client.requestAccessToken({ prompt: "consent" });
  });
}

export function disconnect(): void {
  if (_token) {
    window.google?.accounts.oauth2.revoke(_token, () => {});
    _token = null;
  }
}

// ── Drive API 공통 fetch ──────────────────────────────────────────────
async function driveGet<T>(url: string): Promise<T> {
  if (!_token) throw new Error("NOT_AUTH");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${_token}` } });
  if (res.status === 401) {
    _token = null;
    throw new Error("TOKEN_EXPIRED");
  }
  if (!res.ok) throw new Error(`Drive API ${res.status}`);
  return res.json() as Promise<T>;
}

// ── 파일 검색 (Google Docs 전용) ──────────────────────────────────────
export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export async function searchDocs(q: string): Promise<DriveFile[]> {
  const filter = q.trim()
    ? `mimeType='application/vnd.google-apps.document' and name contains '${q.replace(/'/g, "\\'")}' and trashed=false`
    : `mimeType='application/vnd.google-apps.document' and trashed=false`;
  const url =
    `${API}/files?q=${encodeURIComponent(filter)}` +
    `&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=30`;
  const data = await driveGet<{ files: DriveFile[] }>(url);
  return data.files ?? [];
}

// ── Google Doc → 텍스트 내보내기 ──────────────────────────────────────
export async function exportDocText(fileId: string): Promise<string> {
  if (!_token) throw new Error("NOT_AUTH");
  const url = `${API}/files/${fileId}/export?mimeType=${encodeURIComponent("text/plain")}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${_token}` } });
  if (res.status === 401) { _token = null; throw new Error("TOKEN_EXPIRED"); }
  if (!res.ok) throw new Error(`내보내기 실패 ${res.status}`);
  return res.text();
}

// ── 텍스트 → 단락 파싱 ───────────────────────────────────────────────
export function parseChunks(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((c) => c.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter((c) => c.length >= 30 && c.length <= 1800);
}
