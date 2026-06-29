import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { conceptBySlug } from "../data/concepts";

/** 개념으로 가는 블록 링크 칩 — 관련 개념 목록에 사용. */
export function ConceptChip({ slug }: { slug: string }) {
  const c = conceptBySlug(slug);
  if (!c) return null;
  return (
    <Link
      to={`/wiki/${c.slug}`}
      className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] border font-semibold text-text transition-colors hover:bg-surface"
      style={{
        borderColor: "var(--border-strong)",
        fontSize: "var(--t-sm)",
        padding: "5px 12px",
        minHeight: 32,
      }}
    >
      <BookOpen size={14} style={{ color: "var(--info)" }} aria-hidden />
      {c.term}
    </Link>
  );
}
