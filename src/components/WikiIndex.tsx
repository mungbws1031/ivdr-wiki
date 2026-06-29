import { Link } from "react-router-dom";
import { Library, ChevronRight } from "lucide-react";
import {
  concepts,
  categoryLabel,
  type ConceptCategory,
} from "../data/concepts";
import { PageHeader } from "./PageHeader";

const ORDER: ConceptCategory[] = ["concept", "annex", "standard", "actor", "deliverable"];

/** /wiki — 개념 인덱스. 카테고리별 그룹. */
export function WikiIndex() {
  const grouped = ORDER.map((cat) => ({
    cat,
    items: concepts.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0);

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
          누르면 이 페이지로 연결됩니다.
        </p>

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
      </main>
    </div>
  );
}
