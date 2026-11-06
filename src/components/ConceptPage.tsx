import { useParams, Link } from "react-router-dom";
import { BookOpen, BookMarked, MapPin, Sparkles } from "lucide-react";
import { conceptBySlug, categoryLabel } from "../data/concepts";
import { stations, phaseById } from "../data/stations";
import { getIcon } from "../lib/icons";
import { renderRich } from "../lib/richText";
import { PageHeader } from "./PageHeader";
import { ConceptChip } from "./ConceptChip";

/** /wiki/:slug — 개념 심화 페이지. 정거장·개념과 양방향 연결. */
export function ConceptPage() {
  const { slug } = useParams();
  const c = slug ? conceptBySlug(slug) : undefined;

  if (!c) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader crumb="개념 위키" />
        <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-12) var(--margin)" }}>
          <p className="text-text-muted">
            이 개념을 찾지 못했어요. <Link to="/wiki" className="underline">개념 목록으로</Link>
          </p>
        </main>
      </div>
    );
  }

  const relatedStations = stations.filter((s) => c.relatedStationIds.includes(s.id));

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="개념 위키" accentColor="var(--info)" />

      <main
        className="mx-auto"
        style={{ maxWidth: 820, padding: "var(--s-8) var(--margin) var(--s-16)" }}
      >
        {/* 헤더 */}
        <Link to="/wiki" className="font-semibold" style={{ color: "var(--info)", fontSize: "var(--t-sm)" }}>
          ← 개념 목록
        </Link>
        <div className="flex items-center gap-2" style={{ marginTop: "var(--s-3)" }}>
          <span
            className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] font-semibold"
            style={{ background: "var(--info-bg)", color: "var(--info)", fontSize: "var(--t-xs)", padding: "3px 10px" }}
          >
            <BookOpen size={13} aria-hidden />
            {categoryLabel[c.category]}
          </span>
        </div>
        <h1
          className="font-extrabold text-text"
          style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}
        >
          {c.term}
        </h1>
        {c.aka && c.aka.length > 0 && (
          <p className="text-text-subtle" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>
            {c.aka.join(" · ")}
          </p>
        )}
        <p
          className="text-text"
          style={{ fontSize: "var(--t-lg)", marginTop: "var(--s-4)", lineHeight: "var(--lh-base)" }}
        >
          {c.summary}
        </p>

        {/* 그래서 우리 팀이 할 일 — 관련 정거장의 '지금 할 일'을 먼저 */}
        {relatedStations.length > 0 && (
          <section className="rounded-[var(--r-md)]" style={{ background: "var(--accent-weak)", borderLeft: "4px solid var(--accent)", padding: "var(--s-4)", marginTop: "var(--s-6)" }}>
            <h2 className="font-bold text-text" style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-2)" }}>그래서 우리 팀이 할 일</h2>
            <ul className="flex flex-col" style={{ gap: 6 }}>
              {relatedStations.map((s) => (
                <li key={s.id} className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                  <Link to={`/ivdr/station/${s.id}`} className="font-semibold underline decoration-dotted underline-offset-2">정거장 {s.id} · {s.title}</Link> — {s.todo}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 본문 */}
        <div style={{ marginTop: "var(--s-6)" }}>
          {c.body.map((p, i) => (
            <p
              key={i}
              className="text-text"
              style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)", marginBottom: "var(--s-4)" }}
            >
              {renderRich(p)}
            </p>
          ))}
        </div>

        {/* 이 개념을 쓰는 정거장 */}
        {relatedStations.length > 0 && (
          <section style={{ marginTop: "var(--s-8)" }}>
            <div className="flex items-center gap-2 text-text" style={{ marginBottom: "var(--s-3)" }}>
              <MapPin size={18} style={{ color: "var(--accent)" }} aria-hidden />
              <h2 className="font-bold" style={{ fontSize: "var(--t-base)" }}>이 개념이 쓰이는 정거장</h2>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {relatedStations.map((s) => {
                const phase = phaseById(s.phase);
                const color = `var(${phase.colorVar})`;
                const Icon = getIcon(s.icon);
                return (
                  <Link
                    key={s.id}
                    to={`/ivdr/station/${s.id}`}
                    className="flex items-center gap-3 rounded-[var(--r-md)] border bg-bg transition-[transform] hover:-translate-y-0.5"
                    style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-3)" }}
                  >
                    <span
                      className="inline-flex shrink-0 items-center justify-center rounded-full text-text-on-color font-bold"
                      style={{ background: color, width: 28, height: 28, fontSize: "var(--t-sm)" }}
                    >
                      {s.id}
                    </span>
                    <Icon size={16} style={{ color }} aria-hidden />
                    <span className="min-w-0 truncate font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
                      {s.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 관련 개념 */}
        {c.relatedConceptSlugs.length > 0 && (
          <section style={{ marginTop: "var(--s-8)" }}>
            <h2 className="font-bold text-text" style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-3)" }}>
              관련 개념
            </h2>
            <div className="flex flex-wrap gap-2">
              {c.relatedConceptSlugs.map((s) => (
                <ConceptChip key={s} slug={s} />
              ))}
            </div>
          </section>
        )}

        {/* 조항 — 근거는 접어 둔다 */}
        <details style={{ marginTop: "var(--s-8)" }}>
          <summary className="flex items-center gap-2 text-text-muted cursor-pointer" style={{ minHeight: 40 }}>
            <BookMarked size={16} aria-hidden />
            <span className="font-semibold" style={{ fontSize: "var(--t-sm)" }}>근거 조문 보기 ({c.refs.length})</span>
          </summary>
          <ul className="flex flex-wrap gap-2" style={{ marginTop: "var(--s-2)" }}>
            {c.refs.map((r) => (
              <li
                key={r}
                className="rounded-[var(--r-sm)] font-mono text-text-muted"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: "var(--t-xs)", padding: "4px 8px" }}
              >
                {r}
              </li>
            ))}
          </ul>
        </details>

        {/* 위키 → 도구 */}
        <Link
          to="/auto/start"
          className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color"
          style={{ background: "var(--accent)", fontSize: "var(--t-sm)", padding: "10px 18px", minHeight: 44, marginTop: "var(--s-8)" }}
        >
          <Sparkles size={16} aria-hidden />
          내 제품에 적용해 보기 →
        </Link>
      </main>
    </div>
  );
}
