import { useState, useEffect, useCallback } from "react";
import {
  X,
  FolderOpen,
  Search,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  connect,
  disconnect,
  isConnected,
  searchDocs,
  exportDocText,
  parseChunks,
  type DriveFile,
} from "../lib/googleDrive";
import { type CustomSnippet } from "../data/snippets";

// ── 단락 행 ────────────────────────────────────────────────────────
function ChunkRow({
  text,
  saved,
  onSave,
}: {
  text: string;
  saved: boolean;
  onSave: (label: string) => void;
}) {
  const [labeling, setLabeling] = useState(false);
  const [label, setLabel] = useState("");

  if (saved) {
    return (
      <div
        className="flex items-start gap-2 rounded-[var(--r-sm)]"
        style={{
          background: "var(--success-bg)",
          border: "1px solid var(--success)",
          padding: "10px 12px",
        }}
      >
        <Check size={14} style={{ color: "var(--success)", flexShrink: 0, marginTop: 3 }} aria-hidden />
        <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "1.65" }}>
          {text}
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-[var(--r-sm)]"
      style={{ border: "1px solid var(--border)", background: "var(--bg)", padding: "10px 12px", gap: 8 }}
    >
      <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "1.65" }}>
        {text}
      </p>

      {labeling ? (
        <div className="flex gap-2 flex-wrap">
          <input
            autoFocus
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="스니펫 이름 (예: QMS 범위 선언)"
            className="flex-1 rounded-[var(--r-sm)] text-text outline-none min-w-0"
            style={{
              border: "1px solid var(--accent)",
              background: "var(--surface)",
              fontSize: "var(--t-sm)",
              padding: "6px 10px",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && label.trim()) onSave(label.trim());
              if (e.key === "Escape") setLabeling(false);
            }}
          />
          <button
            onClick={() => label.trim() && onSave(label.trim())}
            disabled={!label.trim()}
            className="rounded-[var(--r-sm)] font-semibold shrink-0 disabled:opacity-40"
            style={{
              background: "var(--accent)",
              color: "var(--text-on-color)",
              fontSize: "var(--t-sm)",
              padding: "6px 14px",
            }}
          >
            저장
          </button>
          <button
            onClick={() => { setLabeling(false); setLabel(""); }}
            className="shrink-0 text-text-muted hover:text-text"
            style={{ fontSize: "var(--t-sm)" }}
          >
            취소
          </button>
        </div>
      ) : (
        <button
          onClick={() => setLabeling(true)}
          className="self-start inline-flex items-center gap-1.5 rounded-[var(--r-sm)] text-text-muted hover:text-text transition-colors"
          style={{ border: "1px solid var(--border)", fontSize: "var(--t-xs)", padding: "4px 12px" }}
        >
          <Plus size={12} aria-hidden />
          스니펫으로 저장
        </button>
      )}
    </div>
  );
}

// ── 메인 모달 ────────────────────────────────────────────────────────
export function DriveImporter({
  onSave,
  onClose,
}: {
  onSave: (snippet: Omit<CustomSnippet, "id">) => void;
  onClose: () => void;
}) {
  const [connected, setConnected] = useState(isConnected());
  const [connecting, setConnecting] = useState(false);
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [savedIdxs, setSavedIdxs] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async (q: string) => {
    setFilesLoading(true);
    setError(null);
    try {
      setFiles(await searchDocs(q));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "TOKEN_EXPIRED") { setConnected(false); setError("인증이 만료되었습니다. 다시 연결해 주세요."); }
      else setError("파일 목록을 불러올 수 없습니다.");
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connected) loadFiles("");
  }, [connected, loadFiles]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      await connect();
      setConnected(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      setError("연결 실패: " + msg);
    } finally {
      setConnecting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(query);
  };

  const handleSelectFile = async (file: DriveFile) => {
    setSelectedFile(file);
    setChunks([]);
    setSavedIdxs(new Set());
    setError(null);
    setDocLoading(true);
    try {
      const text = await exportDocText(file.id);
      const parsed = parseChunks(text);
      if (parsed.length === 0) {
        setError("추출된 단락이 없습니다. 텍스트가 포함된 Google Docs 문서를 선택해 주세요.");
      }
      setChunks(parsed);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "TOKEN_EXPIRED") { setConnected(false); setError("인증이 만료되었습니다."); }
      else setError("문서를 읽을 수 없습니다: " + msg);
    } finally {
      setDocLoading(false);
    }
  };

  const handleSaveChunk = (idx: number, label: string) => {
    onSave({ label, text: chunks[idx] });
    setSavedIdxs((prev) => new Set([...prev, idx]));
  };

  const savedCount = savedIdxs.size;

  return (
    <>
      {/* 배경 딤 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden
      />

      {/* 모달 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="구글 드라이브 문서 가져오기"
        className="fixed z-50 flex flex-col bg-bg shadow-2xl"
        style={{
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(700px, 100vw)",
          maxHeight: "88vh",
          borderRadius: "var(--r-lg) var(--r-lg) 0 0",
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center gap-3 shrink-0"
          style={{ padding: "var(--s-5) var(--s-6)", borderBottom: "1px solid var(--border)" }}
        >
          <FolderOpen size={20} style={{ color: "var(--accent)" }} aria-hidden />
          <h2 className="font-extrabold text-text flex-1" style={{ fontSize: "var(--t-lg)" }}>
            {selectedFile ? (
              <span className="truncate">{selectedFile.name}</span>
            ) : (
              "구글 드라이브에서 가져오기"
            )}
          </h2>

          {selectedFile && (
            <button
              onClick={() => { setSelectedFile(null); setChunks([]); setError(null); }}
              className="inline-flex items-center gap-1 text-text-muted hover:text-text shrink-0"
              style={{ fontSize: "var(--t-sm)" }}
            >
              <ChevronLeft size={14} aria-hidden />
              목록
            </button>
          )}

          <button
            onClick={onClose}
            className="shrink-0 text-text-subtle hover:text-text ml-1"
            aria-label="닫기"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--s-6)" }}>

          {/* ── 미연결 ── */}
          {!connected && (
            <div
              className="flex flex-col items-center text-center"
              style={{ gap: "var(--s-5)", paddingTop: "var(--s-10)", paddingBottom: "var(--s-10)" }}
            >
              <span
                className="grid place-items-center rounded-full"
                style={{ width: 72, height: 72, background: "var(--accent-weak)" }}
              >
                <FolderOpen size={36} style={{ color: "var(--accent)" }} aria-hidden />
              </span>
              <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 400, lineHeight: "var(--lh-base)" }}>
                구글 드라이브에 연결하면 지침서·절차서의 내용을
                <br />문구 라이브러리로 바로 가져올 수 있습니다.
              </p>
              {error && (
                <div className="flex items-center gap-2" style={{ color: "var(--error)", fontSize: "var(--t-sm)" }}>
                  <AlertCircle size={14} aria-hidden /> {error}
                </div>
              )}
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-bold disabled:opacity-60"
                style={{
                  background: "var(--accent)",
                  color: "var(--text-on-color)",
                  fontSize: "var(--t-base)",
                  padding: "13px 28px",
                }}
              >
                {connecting
                  ? <Loader2 size={18} className="animate-spin" aria-hidden />
                  : <FolderOpen size={18} aria-hidden />}
                {connecting ? "연결 중..." : "구글 계정으로 연결"}
              </button>
            </div>
          )}

          {/* ── 연결됨 · 파일 목록 ── */}
          {connected && !selectedFile && (
            <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div
                  className="flex items-center gap-2 flex-1 rounded-[var(--r-sm)]"
                  style={{ border: "1px solid var(--border)", background: "var(--surface)", padding: "8px 12px" }}
                >
                  <Search size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }} aria-hidden />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="문서 이름 검색..."
                    className="flex-1 bg-transparent outline-none text-text placeholder:text-text-subtle"
                    style={{ fontSize: "var(--t-sm)" }}
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-[var(--r-sm)] font-semibold shrink-0"
                  style={{
                    background: "var(--accent)",
                    color: "var(--text-on-color)",
                    fontSize: "var(--t-sm)",
                    padding: "8px 18px",
                  }}
                >
                  검색
                </button>
              </form>

              {error && (
                <div className="flex items-center gap-2" style={{ color: "var(--error)", fontSize: "var(--t-sm)" }}>
                  <AlertCircle size={14} aria-hidden /> {error}
                </div>
              )}

              {filesLoading ? (
                <div
                  className="flex items-center justify-center gap-2 text-text-muted"
                  style={{ padding: "var(--s-10) 0" }}
                >
                  <Loader2 size={20} className="animate-spin" aria-hidden /> 불러오는 중...
                </div>
              ) : files.length === 0 ? (
                <p
                  className="text-text-subtle text-center"
                  style={{ padding: "var(--s-10) 0", fontSize: "var(--t-sm)" }}
                >
                  Google Docs 문서가 없습니다
                </p>
              ) : (
                <ul className="flex flex-col" style={{ gap: "var(--s-2)" }}>
                  {files.map((f) => (
                    <li key={f.id}>
                      <button
                        onClick={() => handleSelectFile(f)}
                        className="w-full flex items-center gap-3 rounded-[var(--r-md)] text-left hover:bg-surface transition-colors"
                        style={{ border: "1px solid var(--border)", padding: "var(--s-3) var(--s-4)" }}
                      >
                        <FileText size={18} style={{ color: "var(--accent)", flexShrink: 0 }} aria-hidden />
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-semibold text-text truncate"
                            style={{ fontSize: "var(--t-sm)" }}
                          >
                            {f.name}
                          </div>
                          <div className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>
                            수정: {new Date(f.modifiedTime).toLocaleDateString("ko-KR")}
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: "var(--text-subtle)", flexShrink: 0 }} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── 문서 뷰 ── */}
          {connected && selectedFile && (
            <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
              {docLoading ? (
                <div
                  className="flex items-center justify-center gap-2 text-text-muted"
                  style={{ padding: "var(--s-10) 0" }}
                >
                  <Loader2 size={20} className="animate-spin" aria-hidden /> 문서 읽는 중...
                </div>
              ) : error ? (
                <div className="flex items-center gap-2" style={{ color: "var(--error)", fontSize: "var(--t-sm)" }}>
                  <AlertCircle size={14} aria-hidden /> {error}
                </div>
              ) : (
                <>
                  <p className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                    {chunks.length}개 단락 추출됨
                    {savedCount > 0 && (
                      <span className="ml-2 font-bold" style={{ color: "var(--success)" }}>
                        ✓ {savedCount}개 저장됨
                      </span>
                    )}
                    <span className="ml-2">· [스니펫으로 저장]을 클릭해 문구 라이브러리에 추가하세요</span>
                  </p>
                  {chunks.map((chunk, i) => (
                    <ChunkRow
                      key={i}
                      text={chunk}
                      saved={savedIdxs.has(i)}
                      onSave={(label) => handleSaveChunk(i, label)}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        {connected && (
          <div
            className="shrink-0 flex items-center justify-between"
            style={{
              padding: "var(--s-3) var(--s-6)",
              borderTop: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
              ✓ 드라이브 연결됨 · Google Docs 파일만 지원
            </span>
            <button
              onClick={() => {
                disconnect();
                setConnected(false);
                setFiles([]);
                setSelectedFile(null);
                setChunks([]);
              }}
              className="text-text-subtle hover:text-text"
              style={{ fontSize: "var(--t-xs)" }}
            >
              연결 해제
            </button>
          </div>
        )}
      </div>
    </>
  );
}
