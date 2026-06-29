import { useState, useMemo, useCallback } from "react";
import {
  Library,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  FolderOpen,
} from "lucide-react";
import { DriveImporter } from "./DriveImporter";
import {
  SNIPPETS,
  SNIPPET_CATEGORIES,
  loadCustomSnippets,
  saveCustomSnippets,
  type Snippet,
  type SnippetCategory,
  type SnippetCertType,
  type CustomSnippet,
} from "../data/snippets";

// ── 단일 스니펫 행 ────────────────────────────────────────────────────
function SnippetRow({
  label,
  text,
  colorVar,
  tintVar,
  onDelete,
}: {
  label: string;
  text: string;
  colorVar: string;
  tintVar: string;
  onDelete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).catch(() => {
      /* fallback: execCommand */
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <li className="flex flex-col" style={{ gap: 3 }}>
      <div className="flex items-start gap-1">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-start gap-1 flex-1 text-left group"
          style={{ minWidth: 0 }}
        >
          {expanded ? (
            <ChevronDown size={11} className="mt-0.5 shrink-0 text-text-subtle" aria-hidden />
          ) : (
            <ChevronRight
              size={11}
              className="mt-0.5 shrink-0 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden
            />
          )}
          <span
            className="flex-1 text-text leading-snug"
            style={{ fontSize: "var(--t-xs)" }}
          >
            {label}
          </span>
        </button>
        <div className="flex items-center shrink-0 gap-0.5">
          <button
            onClick={handleCopy}
            title="복사"
            className="rounded p-0.5 hover:bg-bg transition-colors"
            style={{ color: copied ? "var(--success)" : "var(--text-subtle)" }}
          >
            {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              title="삭제"
              className="rounded p-0.5 hover:bg-bg transition-colors"
              style={{ color: "var(--text-subtle)" }}
            >
              <Trash2 size={11} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <p
          className="text-text-muted"
          style={{
            fontSize: "var(--t-xs)",
            lineHeight: "1.65",
            marginLeft: 13,
            padding: "6px 9px",
            background: `var(${tintVar})`,
            borderLeft: `2px solid var(${colorVar})`,
            borderRadius: "0 var(--r-sm) var(--r-sm) 0",
          }}
        >
          {text}
        </p>
      )}
    </li>
  );
}

// ── 카테고리 그룹 ─────────────────────────────────────────────────────
function CategoryGroup({
  category,
  snippets,
  colorVar,
  tintVar,
  onDeleteCustom,
}: {
  category: SnippetCategory | "나의 문구";
  snippets: (Snippet | CustomSnippet)[];
  colorVar: string;
  tintVar: string;
  onDeleteCustom?: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 text-left"
        style={{ paddingBottom: "var(--s-1)" }}
      >
        {open ? (
          <ChevronDown size={11} style={{ color: `var(${colorVar})`, flexShrink: 0 }} aria-hidden />
        ) : (
          <ChevronRight size={11} style={{ color: `var(${colorVar})`, flexShrink: 0 }} aria-hidden />
        )}
        <span className="font-bold flex-1" style={{ color: `var(${colorVar})`, fontSize: "var(--t-xs)" }}>
          {category}
        </span>
        <span
          className="rounded-full shrink-0 font-semibold"
          style={{
            background: `var(${tintVar})`,
            color: `var(${colorVar})`,
            fontSize: 10,
            padding: "0px 7px",
          }}
        >
          {snippets.length}
        </span>
      </button>

      {open && (
        <ul className="flex flex-col" style={{ gap: 5, paddingLeft: 4, paddingBottom: "var(--s-2)" }}>
          {snippets.map((s) => (
            <SnippetRow
              key={s.id}
              label={s.label}
              text={s.text}
              colorVar={colorVar}
              tintVar={tintVar}
              onDelete={onDeleteCustom ? () => onDeleteCustom(s.id) : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
export function SnippetLibrary({ certTypeKey }: { certTypeKey: SnippetCertType }) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [customSnippets, setCustomSnippets] = useState<CustomSnippet[]>(() =>
    loadCustomSnippets()
  );
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newText, setNewText] = useState("");
  const [showDrive, setShowDrive] = useState(false);

  const colorVar = certTypeKey === "iso13485"
    ? "--p3"
    : certTypeKey === "ivdd"
    ? "--p2"
    : certTypeKey === "mdsap"
    ? "--p4"
    : "--accent";

  const tintVar = certTypeKey === "iso13485"
    ? "--p3-tint"
    : certTypeKey === "ivdd"
    ? "--p2-tint"
    : certTypeKey === "mdsap"
    ? "--p4-tint"
    : "--accent-weak";

  const relevant = useMemo(() => {
    const base = SNIPPETS.filter(
      (s) => s.certTypes.includes("common") || s.certTypes.includes(certTypeKey)
    );
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(
      (s) => s.label.toLowerCase().includes(q) || s.text.toLowerCase().includes(q)
    );
  }, [certTypeKey, search]);

  const byCategory = useMemo(() => {
    const map = new Map<SnippetCategory, Snippet[]>();
    for (const cat of SNIPPET_CATEGORIES) {
      const items = relevant.filter((s) => s.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [relevant]);

  const filteredCustom = useMemo(() => {
    if (!search.trim()) return customSnippets;
    const q = search.toLowerCase();
    return customSnippets.filter(
      (s) => s.label.toLowerCase().includes(q) || s.text.toLowerCase().includes(q)
    );
  }, [customSnippets, search]);

  const totalCount = relevant.length + filteredCustom.length;

  const handleAddCustom = () => {
    if (!newLabel.trim() || !newText.trim()) return;
    const newSnippet: CustomSnippet = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim(),
      text: newText.trim(),
    };
    const updated = [...customSnippets, newSnippet];
    setCustomSnippets(updated);
    saveCustomSnippets(updated);
    setNewLabel("");
    setNewText("");
    setAdding(false);
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customSnippets.filter((s) => s.id !== id);
    setCustomSnippets(updated);
    saveCustomSnippets(updated);
  };

  return (
    <div
      className="rounded-[var(--r-md)] border"
      style={{ borderColor: `var(${colorVar})`, overflow: "hidden" }}
    >
      {/* 헤더 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left"
        style={{ background: `var(${tintVar})`, padding: "var(--s-3) var(--s-4)" }}
      >
        <Library size={15} style={{ color: `var(${colorVar})`, flexShrink: 0 }} aria-hidden />
        <span className="font-bold text-text flex-1" style={{ fontSize: "var(--t-sm)" }}>
          문구 라이브러리
        </span>
        <span
          className="rounded-full font-semibold shrink-0"
          style={{
            background: `var(${colorVar})`,
            color: "var(--text-on-color)",
            fontSize: 10,
            padding: "1px 8px",
          }}
        >
          {totalCount}
        </span>
        {open ? (
          <ChevronDown size={14} style={{ color: `var(${colorVar})`, flexShrink: 0 }} aria-hidden />
        ) : (
          <ChevronRight size={14} style={{ color: `var(${colorVar})`, flexShrink: 0 }} aria-hidden />
        )}
      </button>

      {open && (
        <div style={{ background: "var(--surface)", padding: "var(--s-3) var(--s-4)" }}>
          {/* 검색 */}
          <div
            className="flex items-center gap-2 rounded-[var(--r-sm)]"
            style={{
              border: "1px solid var(--border)",
              background: "var(--bg)",
              padding: "5px 9px",
              marginBottom: "var(--s-3)",
            }}
          >
            <Search size={12} style={{ color: "var(--text-subtle)", flexShrink: 0 }} aria-hidden />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="문구 검색..."
              className="flex-1 bg-transparent outline-none text-text placeholder:text-text-subtle"
              style={{ fontSize: "var(--t-xs)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "var(--text-subtle)" }}>
                <X size={11} aria-hidden />
              </button>
            )}
          </div>

          {/* 결과 없음 */}
          {totalCount === 0 && (
            <p className="text-text-subtle text-center" style={{ fontSize: "var(--t-xs)", padding: "var(--s-4) 0" }}>
              검색 결과가 없습니다
            </p>
          )}

          {/* 카테고리별 목록 */}
          <div className="flex flex-col" style={{ gap: "var(--s-1)" }}>
            {[...byCategory.entries()].map(([cat, items]) => (
              <CategoryGroup
                key={cat}
                category={cat}
                snippets={items}
                colorVar={colorVar}
                tintVar={tintVar}
              />
            ))}

            {/* 나의 문구 */}
            {(filteredCustom.length > 0 || customSnippets.length > 0) && (
              <CategoryGroup
                category="나의 문구"
                snippets={filteredCustom}
                colorVar="--p1"
                tintVar="--p1-tint"
                onDeleteCustom={handleDeleteCustom}
              />
            )}
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: "1px solid var(--border)", margin: "var(--s-3) 0" }} />

          {/* 내 문구 추가 */}
          {adding ? (
            <div className="flex flex-col" style={{ gap: "var(--s-2)" }}>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="문구 이름 (예: 성능평가 결론)"
                className="rounded-[var(--r-sm)] text-text outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  fontSize: "var(--t-xs)",
                  padding: "5px 9px",
                }}
                autoFocus
              />
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="문구 내용을 입력하세요..."
                rows={4}
                className="rounded-[var(--r-sm)] text-text outline-none resize-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  fontSize: "var(--t-xs)",
                  padding: "5px 9px",
                  lineHeight: "1.6",
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustom}
                  disabled={!newLabel.trim() || !newText.trim()}
                  className="flex-1 rounded-[var(--r-sm)] font-semibold disabled:opacity-40"
                  style={{
                    background: `var(${colorVar})`,
                    color: "var(--text-on-color)",
                    fontSize: "var(--t-xs)",
                    padding: "6px",
                  }}
                >
                  저장
                </button>
                <button
                  onClick={() => { setAdding(false); setNewLabel(""); setNewText(""); }}
                  className="rounded-[var(--r-sm)] text-text-muted hover:text-text"
                  style={{
                    border: "1px solid var(--border)",
                    fontSize: "var(--t-xs)",
                    padding: "6px 12px",
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] text-text-muted hover:text-text hover:bg-bg transition-colors"
              style={{
                border: "1px dashed var(--border)",
                fontSize: "var(--t-xs)",
                padding: "7px",
              }}
            >
              <Plus size={12} aria-hidden />
              내 문구 추가
            </button>
          )}

          {/* 드라이브에서 가져오기 */}
          <button
            onClick={() => setShowDrive(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] font-semibold text-text-muted hover:text-text hover:bg-bg transition-colors"
            style={{
              border: "1px dashed var(--border)",
              fontSize: "var(--t-xs)",
              padding: "7px",
              marginTop: "var(--s-1)",
            }}
          >
            <FolderOpen size={12} aria-hidden />
            구글 드라이브에서 가져오기
          </button>
        </div>
      )}

      {/* 드라이브 임포터 모달 */}
      {showDrive && (
        <DriveImporter
          onSave={(snippet) => {
            const newSnippet = { id: `custom-${Date.now()}`, ...snippet };
            const updated = [...customSnippets, newSnippet];
            setCustomSnippets(updated);
            saveCustomSnippets(updated);
          }}
          onClose={() => setShowDrive(false)}
        />
      )}
    </div>
  );
}
