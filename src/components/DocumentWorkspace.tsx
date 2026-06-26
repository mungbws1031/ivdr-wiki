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
  Files,
  Database,
  Image as ImageIcon,
  FlaskConical,
  Paperclip,
  type LucideIcon,
} from "lucide-react";
import { resolveDoc, toMarkdown } from "../data/documents";
import { useProgress, STATUS_LABEL, STATUS_NEXT, STATUS_COLOR } from "../data/progress";
import { stations, phaseById } from "../data/stations";
import { prereqKindLabel, leafById, colorForLeaf, type PrereqKind } from "../data/docTree";
import { getIcon } from "../lib/icons";
import { PageHeader } from "./PageHeader";
import { CopyMarkdownBar } from "./CopyMarkdownBar";
import { DocxExport } from "./DocxExport";
import { ConceptChip } from "./ConceptChip";
import { LevelMeter } from "./LevelMeter";
import { EffortTimeline } from "./EffortTimeline";

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

  // Hooks must be called before any conditional returns
  const { getStatus, setStatus } = useProgress("ivdr");
  const status = doc ? getStatus(doc.id) : "not_started";
  const nextStatus = STATUS_NEXT[status];

  if (!doc || !station) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader crumb="문서 작성" />
        <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-12) var(--margin)" }}>
          <p className="text-text-muted">해당 문서를 찾을 수 없습니다. <Link to="/ivdr" className="underline">IVDR 여정으로</Link></p>
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
          <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: "var(--s-2)" }}>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] font-semibold text-text-muted hover:text-text"
              style={{ fontSize: "var(--t-xs)", border: "1px solid var(--border)", padding: "3px 10px" }}
            >
              인증 허브
            </Link>
            <Link
              to="/ivdr"
              className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] font-semibold text-text-muted hover:text-text"
              style={{ fontSize: "var(--t-xs)", border: "1px solid var(--border)", padding: "3px 10px" }}
            >
              <Compass size={13} aria-hidden />
              IVDR 여정
            </Link>
            <Link
              to="/documents"
              className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] font-semibold text-text-muted hover:text-text"
              style={{ fontSize: "var(--t-xs)", border: "1px solid var(--border)", padding: "3px 10px" }}
            >
              <FileText size={13} aria-hidden />
              문서 목록
            </Link>
            <Link
              to={`/ivdr/station/${station.id}`}
              className="inline-flex items-center gap-1.5 font-semibold"
              style={{ color, fontSize: "var(--t-xs)" }}
            >
              <Icon size={13} aria-hidden />
              정거장 {station.id} · {phase.title}
            </Link>
          </div>
          {/* 진행 상태 토글 */}
          <div style={{ marginBottom: "var(--s-4)" }}>
            <button
              type="button"
              onClick={() => setStatus(doc.id, nextStatus)}
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-semibold hover:bg-surface"
              style={{
                fontSize: "var(--t-sm)",
                padding: "7px 14px",
                borderColor: STATUS_COLOR[status],
                color: STATUS_COLOR[status],
              }}
            >
              <span
                aria-hidden
                className="inline-block rounded-full shrink-0"
                style={{ width: 8, height: 8, background: STATUS_COLOR[status] }}
              />
              {STATUS_LABEL[status]}
              <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
                → {STATUS_LABEL[nextStatus]}
              </span>
            </button>
          </div>
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

          {doc.difficulty && doc.importance && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2" style={{ marginTop: "var(--s-3)" }}>
              <LevelMeter kind="importance" level={doc.importance} />
              <LevelMeter kind="difficulty" level={doc.difficulty} />
            </div>
          )}

          {doc.effort && (
            <div style={{ marginTop: "var(--s-4)" }}>
              <EffortTimeline effort={doc.effort} />
            </div>
          )}

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

        {/* ── 작성을 시작하기 전에 (강조 블록) ── */}
        {((doc.knowledge?.length ?? 0) > 0 || (doc.prerequisites?.length ?? 0) > 0) && (
          <div style={{ marginBottom: "var(--s-6)" }}>
            <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: "var(--s-3)" }}>
              <span
                className="inline-flex items-center gap-1.5 rounded-full font-extrabold text-text-on-color"
                style={{ background: "var(--accent)", fontSize: "var(--t-xs)", padding: "5px 13px", letterSpacing: "0.03em" }}
              >
                ✍️ 작성을 시작하기 전에
              </span>
              <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
                아래 두 가지를 먼저 확인하세요
              </span>
            </div>

            <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
              {/* STEP 1 · 알아야 할 것 */}
              {doc.knowledge && doc.knowledge.length > 0 && (
                <section
                  aria-labelledby="knowledge-heading"
                  className="overflow-hidden rounded-[var(--r-lg)]"
                  style={{ background: "var(--info-bg)", borderLeft: "6px solid var(--info)", boxShadow: "var(--shadow-card)", padding: "var(--s-5)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: 40, height: 40, background: "var(--info)" }}>
                      <GraduationCap size={22} style={{ color: "#fff" }} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold" style={{ color: "var(--info)", fontSize: "var(--t-xs)", letterSpacing: "0.05em" }}>
                        STEP 1 · 사전 지식
                      </div>
                      <h2 id="knowledge-heading" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)" }}>
                        작성 전 알아야 할 것
                      </h2>
                    </div>
                    <span className="rounded-full font-extrabold text-text-on-color" style={{ background: "var(--info)", fontSize: "var(--t-sm)", padding: "2px 12px" }}>
                      {doc.knowledge.length}
                    </span>
                  </div>
                  <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "var(--s-2) 0 var(--s-4)" }}>
                    이 문서를 쓰기 전에 아래 개념·결정을 먼저 이해하고 있어야 합니다.
                  </p>
                  <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                    {doc.knowledge.map((k, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-[var(--r-md)] bg-bg"
                        style={{ padding: "10px 12px", border: "1px solid var(--border)" }}
                      >
                        <span aria-hidden className="shrink-0 rounded-[4px]" style={{ width: 18, height: 18, border: "2px solid var(--info)", marginTop: 1 }} />
                        <span className="font-medium text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                          {k}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* STEP 2 · 준비물 */}
              {doc.prerequisites && doc.prerequisites.length > 0 && (
                <section
                  aria-labelledby="prereq-heading"
                  className="overflow-hidden rounded-[var(--r-lg)]"
                  style={{ background: "var(--warning-bg)", borderLeft: "6px solid var(--warning)", boxShadow: "var(--shadow-card)", padding: "var(--s-5)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: 40, height: 40, background: "var(--warning)" }}>
                      <PackageCheck size={22} style={{ color: "#fff" }} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold" style={{ color: "var(--warning)", fontSize: "var(--t-xs)", letterSpacing: "0.05em" }}>
                        STEP 2 · 준비물
                      </div>
                      <h2 id="prereq-heading" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)" }}>
                        작성 전 준비물
                      </h2>
                    </div>
                    <span className="rounded-full font-extrabold text-text-on-color" style={{ background: "var(--warning)", fontSize: "var(--t-sm)", padding: "2px 12px" }}>
                      {doc.prerequisites.length}
                    </span>
                  </div>
                  <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "var(--s-2) 0 var(--s-4)" }}>
                    아래 자료·사진·시험·선행문서를 먼저 확보하세요.
                  </p>
                  <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                    {doc.prerequisites.map((p, i) => {
                      const st = PREREQ_STYLE[p.kind];
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-[var(--r-md)] bg-bg"
                          style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-3)" }}
                        >
                          <span
                            className="grid shrink-0 place-items-center rounded-[var(--r-sm)]"
                            style={{ width: 34, height: 34, background: "var(--surface)" }}
                          >
                            <st.Icon size={19} style={{ color: st.color }} aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <span
                              className="inline-block rounded-full font-bold"
                              style={{ color: st.color, background: "var(--surface)", fontSize: 10, padding: "1px 8px" }}
                            >
                              {prereqKindLabel[p.kind]}
                            </span>
                            <p className="font-medium text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", marginTop: 3 }}>
                              {p.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* 미리 만들어두면 좋은 문서 (선행 문서) */}
        {doc.prepDocs && doc.prepDocs.length > 0 && (
          <section
            aria-labelledby="prep-docs-heading"
            className="overflow-hidden rounded-[var(--r-lg)]"
            style={{ background: "var(--success-bg)", borderLeft: "6px solid var(--success)", boxShadow: "var(--shadow-card)", padding: "var(--s-5)", marginBottom: "var(--s-6)" }}
          >
            <div className="flex items-center gap-3">
              <span className="grid shrink-0 place-items-center rounded-full" style={{ width: 40, height: 40, background: "var(--success)" }}>
                <Files size={20} style={{ color: "#fff" }} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-bold" style={{ color: "var(--success)", fontSize: "var(--t-xs)", letterSpacing: "0.05em" }}>
                  관련 문서
                </div>
                <h2 id="prep-docs-heading" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)" }}>
                  미리 만들어두면 좋은 문서
                </h2>
              </div>
              <span className="rounded-full font-extrabold text-text-on-color" style={{ background: "var(--success)", fontSize: "var(--t-sm)", padding: "2px 12px" }}>
                {doc.prepDocs.length}
              </span>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", margin: "var(--s-2) 0 var(--s-4)" }}>
              이 문서를 쓰기 전에 아래 문서를 먼저 준비해두면 수월합니다. (클릭하면 이동)
            </p>
            <div className="flex flex-wrap gap-2">
              {doc.prepDocs.map((pid) => {
                const l = leafById(pid);
                if (!l) return null;
                const c = `var(${colorForLeaf(pid)})`;
                return (
                  <Link
                    key={pid}
                    to={`/doc/${pid}`}
                    className="inline-flex items-center gap-2 rounded-[var(--r-full)] bg-bg transition-colors hover:bg-surface"
                    style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", padding: "7px 13px" }}
                  >
                    <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 8, height: 8, background: c }} />
                    <span className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
                      {l.title}
                    </span>
                    <ArrowUpRight size={14} style={{ color: "var(--text-subtle)" }} aria-hidden />
                  </Link>
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
                to={`/ivdr/station/${station.id}`}
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
