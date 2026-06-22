import { useParams, Link } from "react-router-dom";
import {
  FileText,
  ListChecks,
  BookMarked,
  ArrowUpRight,
  Compass,
  PackageCheck,
  Lightbulb,
  GraduationCap,
  Database,
  Image as ImageIcon,
  FlaskConical,
  Paperclip,
  type LucideIcon,
} from "lucide-react";
import { resolveDoc, toMarkdown } from "../data/documents";
import { stations, phaseById } from "../data/stations";
import { prereqKindLabel, type PrereqKind } from "../data/docTree";
import { getIcon } from "../lib/icons";
import { PageHeader } from "./PageHeader";
import { CopyMarkdownBar } from "./CopyMarkdownBar";
import { DocxExport } from "./DocxExport";
import { ConceptChip } from "./ConceptChip";

// 준비물 종류 → 아이콘·색
const PREREQ_STYLE: Record<PrereqKind, { Icon: LucideIcon; color: string }> = {
  doc: { Icon: FileText, color: "var(--p3)" },
  data: { Icon: Database, color: "var(--p1)" },
  photo: { Icon: ImageIcon, color: "var(--p4)" },
  test: { Icon: FlaskConical, color: "var(--p2)" },
  other: { Icon: Paperclip, color: "var(--text-muted)" },
};

/** /doc/:id — 문서 작성 워크스페이스 (복사용 템플릿 + 워드 내보내기). */
export function DocumentWorkspace() {
  const { id } = useParams();
  const doc = id ? resolveDoc(id) : undefined;
  const station = doc ? stations.find((s) => s.id === doc.stationId) : undefined;

  if (!doc || !station) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader crumb="문서 작성" />
        <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-12) var(--margin)" }}>
          <p className="text-text-muted">해당 문서를 찾을 수 없습니다. <Link to="/" className="underline">여정 지도로</Link></p>
        </main>
      </div>
    );
  }

  const phase = phaseById(station.phase);
  const color = `var(${phase.colorVar})`;
  const Icon = getIcon(station.icon);
  const markdown = toMarkdown(doc);
  const filename = `IVDR-${String(station.id).padStart(2, "0")}-${doc.docTitle}.md`;

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="문서 작성" accentColor={color} />

      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}
      >
        {/* 헤더 */}
        <div style={{ marginBottom: "var(--s-6)" }}>
          <Link
            to={`/station/${station.id}`}
            className="inline-flex items-center gap-2 font-semibold"
            style={{ color, fontSize: "var(--t-sm)" }}
          >
            <Icon size={16} aria-hidden />
            정거장 {station.id} · {phase.title}
          </Link>
          <h1
            className="flex items-center gap-3 font-extrabold text-text"
            style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}
          >
            <FileText size={28} style={{ color }} aria-hidden />
            {doc.docTitle}
          </h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", marginTop: "var(--s-2)", maxWidth: 720 }}>
            {doc.purpose}
          </p>

          {/* 취지 — 왜 이 문서를 쓰는가 */}
          {doc.rationale && (
            <div
              className="flex gap-3 rounded-[var(--r-md)]"
              style={{
                background: "var(--info-bg)",
                borderLeft: "4px solid var(--info)",
                padding: "var(--s-4)",
                marginTop: "var(--s-4)",
                maxWidth: 760,
              }}
            >
              <Lightbulb size={20} style={{ color: "var(--info)" }} className="mt-0.5 shrink-0" aria-hidden />
              <div>
                <span className="font-bold" style={{ color: "var(--info)", fontSize: "var(--t-sm)" }}>
                  왜 이 문서를 쓰는가 (취지)
                </span>
                <p className="text-text" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)", marginTop: 2 }}>
                  {doc.rationale}
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: "var(--s-4)" }}>
            <CopyMarkdownBar markdown={markdown} filename={filename} />
          </div>
          <div style={{ marginTop: "var(--s-3)" }}>
            <DocxExport doc={doc} />
          </div>
        </div>

        {/* 작성 전 알아야 할 것 (사전 지식 체크리스트) */}
        {doc.knowledge && doc.knowledge.length > 0 && (
          <section
            aria-labelledby="knowledge-heading"
            className="rounded-[var(--r-md)] border"
            style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-5)", marginBottom: "var(--s-4)" }}
          >
            <div className="flex items-center gap-2 text-text" style={{ marginBottom: "var(--s-1)" }}>
              <GraduationCap size={20} style={{ color: "var(--info)" }} aria-hidden />
              <h2 id="knowledge-heading" className="font-extrabold" style={{ fontSize: "var(--t-lg)" }}>
                작성 전 알아야 할 것
              </h2>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-3)" }}>
              이 문서를 쓰기 전에 아래 개념·결정을 먼저 이해하고 있어야 합니다.
            </p>
            <ul className="flex flex-col" style={{ gap: 8 }}>
              {doc.knowledge.map((k, i) => (
                <li key={i} className="flex items-start gap-2 text-text" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)" }}>
                  <span aria-hidden className="mt-0.5 shrink-0 font-bold" style={{ color: "var(--info)" }}>☐</span>
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 작성 전 준비물 */}
        {doc.prerequisites && doc.prerequisites.length > 0 && (
          <section
            aria-labelledby="prereq-heading"
            className="rounded-[var(--r-md)] border"
            style={{ borderColor: "var(--border)", background: "var(--p2-tint)", padding: "var(--s-5)", marginBottom: "var(--s-6)" }}
          >
            <div className="flex items-center gap-2 text-text" style={{ marginBottom: "var(--s-1)" }}>
              <PackageCheck size={20} style={{ color: "var(--warning)" }} aria-hidden />
              <h2 id="prereq-heading" className="font-extrabold" style={{ fontSize: "var(--t-lg)" }}>
                작성 전 준비물
              </h2>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}>
              이 문서를 쓰기 전에 아래 자료·사진·시험·선행문서를 먼저 확보하세요.
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {doc.prerequisites.map((p, i) => {
                const st = PREREQ_STYLE[p.kind];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-[var(--r-md)] bg-bg"
                    style={{ border: "1px solid var(--border)", padding: "var(--s-3)" }}
                  >
                    <span
                      className="grid shrink-0 place-items-center rounded-[var(--r-sm)]"
                      style={{ width: 32, height: 32, background: "var(--surface)" }}
                    >
                      <st.Icon size={18} style={{ color: st.color }} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold" style={{ color: st.color, fontSize: "var(--t-xs)" }}>
                        {prereqKindLabel[p.kind]}
                      </span>
                      <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                        {p.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 본문 2열 */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "minmax(0, 1fr)" }}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* 섹션 */}
            <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
              {doc.sections.map((s, i) => (
                <section
                  key={i}
                  className="rounded-[var(--r-md)] border bg-bg"
                  style={{ borderColor: "var(--border)", padding: "var(--s-5)" }}
                >
                  <h2 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
                    {s.heading}
                  </h2>
                  <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>
                    {s.guidance}
                  </p>
                  <pre
                    className="overflow-x-auto rounded-[var(--r-sm)] text-text"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--t-sm)",
                      lineHeight: "var(--lh-base)",
                      padding: "var(--s-3)",
                      marginTop: "var(--s-3)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {s.placeholder}
                  </pre>
                </section>
              ))}
            </div>

            {/* 사이드바 */}
            <aside className="flex flex-col" style={{ gap: "var(--s-4)" }}>
              {/* 체크리스트 */}
              <div
                className="rounded-[var(--r-md)] border"
                style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-4)" }}
              >
                <div className="flex items-center gap-2 text-text" style={{ marginBottom: "var(--s-2)" }}>
                  <ListChecks size={18} style={{ color: "var(--success)" }} aria-hidden />
                  <h3 className="font-bold" style={{ fontSize: "var(--t-sm)" }}>완료 체크리스트</h3>
                </div>
                <ul className="flex flex-col" style={{ gap: 6 }}>
                  {doc.checklist.map((c, i) => (
                    <li key={i} className="flex gap-2 text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                      <span aria-hidden style={{ color: "var(--text-subtle)" }}>☐</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 관련 개념 */}
              {doc.relatedConceptSlugs.length > 0 && (
                <div
                  className="rounded-[var(--r-md)] border"
                  style={{ borderColor: "var(--border)", padding: "var(--s-4)" }}
                >
                  <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-3)" }}>
                    관련 개념
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doc.relatedConceptSlugs.map((slug) => (
                      <ConceptChip key={slug} slug={slug} />
                    ))}
                  </div>
                </div>
              )}

              {/* 관련 조항 */}
              <div
                className="rounded-[var(--r-md)] border"
                style={{ borderColor: "var(--border)", padding: "var(--s-4)" }}
              >
                <div className="flex items-center gap-2 text-text-muted" style={{ marginBottom: "var(--s-2)" }}>
                  <BookMarked size={16} aria-hidden />
                  <h3 className="font-semibold" style={{ fontSize: "var(--t-sm)" }}>관련 조항</h3>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {doc.refs.map((r) => (
                    <li
                      key={r}
                      className="rounded-[var(--r-sm)] font-mono text-text-muted"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: "var(--t-xs)", padding: "4px 8px" }}
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 정거장 상세로 */}
              <Link
                to={`/station/${station.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--r-md)] font-semibold text-text-muted hover:bg-surface"
                style={{ fontSize: "var(--t-sm)", padding: "10px", border: "1px solid var(--border)" }}
              >
                <Compass size={16} aria-hidden />
                정거장 설명 다시 보기
                <ArrowUpRight size={14} aria-hidden />
              </Link>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
