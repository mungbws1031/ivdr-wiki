import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Library, ChevronRight, Search, X } from "lucide-react";
import {
  concepts,
  categoryLabel,
  type ConceptCategory,
} from "../data/concepts";
import { PageHeader } from "./PageHeader";

const ORDER: ConceptCategory[] = ["concept", "annex", "standard", "actor", "deliverable"];

function matches(c: (typeof concepts)[number], q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [c.term, c.summary, categoryLabel[c.category], ...(c.aka ?? [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

/** /wiki — 개념 인덱스. 검색 + 카테고리 필터 + 카테고리별 그룹. */
export function WikiIndex() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<ConceptCategory | null>(null);

  const filtered = useMemo(
    () => concepts.filter((c) => matches(c, query) && (!activeCat || c.category === activeCat)),
    [query, activeCat],
  );

  const catCounts = useMemo(() => {
    const counts: Record<ConceptCategory, number> = {
      concept: 0, annex: 0, standard: 0, actor: 0, deliverable: 0,
    };
    for (const c of concepts) counts[c.category]++;
    return counts;
  }, []);

  const grouped = ORDER.map((cat) => ({
    cat,
    items: filtered.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0);

  const hasFilter = query.trim() !== "" || activeCat !== null;

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="개념 위키" accentColor="var(--info)" />

      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}
      >
        <h1
          className="flex items-center gap-3 font-extrabold text-text"
          style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)" }}
        >
          <Library size={28} style={{ color: "var(--info)" }} aria-hidden />
          개념 위키
        </h1>
        <p className="text-text-muted" style={{ fontSize: "var(--t-base)", marginTop: "var(--s-2)", maxWidth: 680 }}>
          IVDR 조항·부속서·표준·핵심 개념을 한곳에. 정거장 본문이나 문서 템플릿에서 용어를
          누르면 이 페이지로 연결됩니다. 총 {concepts.length}개 개념.
        </p>

        {/* 검색 */}
        <div
          className="relative"
          style={{ marginTop: "var(--s-6)", maxWidth: 480 }}
        >
          <Search
            size={18}
            style={{ color: "var(--text-subtle)", position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="용어 검색 (예: GSPR, PMS, UDI...)"
            aria-label="개념 검색"
            className="w-full rounded-[var(--r-md)] border bg-bg text-text"
            style={{
              borderColor: "var(--border-strong)",
              fontSize: "var(--t-base)",
              padding: "12px 44px",
              minHeight: "var(--touch-min)",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
              className="inline-flex items-center justify-center rounded-full hover:bg-surface"
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, color: "var(--text-subtle)" }}
            >
              <X size={16} aria-hidden />
            </button>
          )}
        </div>

        {/* 카테고리 필터 칩 */}
        <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--s-4)" }}>
          <button
            type="button"
            onClick={() => setActiveCat(null)}
            aria-pressed={activeCat === null}
            className="font-semibold rounded-full border transition-colors"
            style={{
              fontSize: "var(--t-sm)",
              padding: "6px 14px",
              minHeight: 36,
              borderColor: activeCat === null ? "var(--info)" : "var(--border-strong)",
              background: activeCat === null ? "var(--info-bg)" : "var(--bg)",
              color: activeCat === null ? "var(--info)" : "var(--text-muted)",
            }}
          >
            전체 {concepts.length}
          </button>
          {ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(activeCat === cat ? null : cat)}
              aria-pressed={activeCat === cat}
              className="font-semibold rounded-full border transition-colors"
              style={{
                fontSize: "var(--t-sm)",
                padding: "6px 14px",
                minHeight: 36,
                borderColor: activeCat === cat ? "var(--info)" : "var(--border-strong)",
                background: activeCat === cat ? "var(--info-bg)" : "var(--bg)",
                color: activeCat === cat ? "var(--info)" : "var(--text-muted)",
              }}
            >
              {categoryLabel[cat]} {catCounts[cat]}
            </button>
          ))}
        </div>

        {hasFilter && (
          <p className="text-text-subtle" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-3)" }}>
            검색 결과 {filtered.length}개
          </p>
        )}

        {filtered.length === 0 ? (
          <div
            className="rounded-[var(--r-md)] border text-center"
            style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-8)", marginTop: "var(--s-6)" }}
          >
            <p className="text-text-muted" style={{ fontSize: "var(--t-base)" }}>
              "{query}"에 해당하는 개념을 찾지 못했어요.
            </p>
          </div>
        ) : (
        <div className="flex flex-col" style={{ gap: "var(--s-8)", marginTop: "var(--s-8)" }}>
          {grouped.map(({ cat, items }) => (
            <section key={cat}>
              <h2
                className="font-bold text-text-muted"
                style={{ fontSize: "var(--t-sm)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "var(--s-3)" }}
              >
                {categoryLabel[cat]}
              </h2>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {items.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/wiki/${c.slug}`}
                    className="group flex items-start gap-3 rounded-[var(--r-md)] border bg-bg transition-[transform] hover:-translate-y-0.5"
                    style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-4)" }}
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                        {c.term}
                      </h3>
                      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
                        {c.summary}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: "var(--text-subtle)" }}
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        )}
      </main>
    </div>
  );
}
