import { Link } from "react-router-dom";
import { FolderTree, FileText, FileCheck, ArrowUpRight, BookMarked } from "lucide-react";
import {
  docTree,
  requirementMeta,
  docTreeStats,
  toRegisterMarkdown,
} from "../data/docTree";
import { stations, phaseById } from "../data/stations";
import { getIcon } from "../lib/icons";
import { PageHeader } from "./PageHeader";
import { CopyMarkdownBar } from "./CopyMarkdownBar";
import { StatusChip } from "./StatusChip";

/** /documents — 제출 기준 문서 트리 + 마스터 등록부. */
export function DocumentTree() {
  const stats = docTreeStats();
  const register = toRegisterMarkdown();

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="문서 목록" accentColor="var(--accent)" />

      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}
      >
        {/* 헤더 */}
        <h1
          className="flex items-center gap-3 font-extrabold text-text"
          style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)" }}
        >
          <FolderTree size={28} style={{ color: "var(--accent)" }} aria-hidden />
          써야 할 문서 — 제출 문서 트리
        </h1>
        <p className="text-text-muted" style={{ fontSize: "var(--t-base)", marginTop: "var(--s-2)", maxWidth: 720 }}>
          제출 구조(Annex II·III · QMS · 적합성 · 등록)로 본 전체 문서 목록입니다. 각 문서는
          만드는 정거장과 작성 템플릿으로 연결됩니다.
        </p>

        {/* 요약 + 등록부 내보내기 */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--r-md)] border"
          style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-4)", marginTop: "var(--s-4)" }}
        >
          <div className="flex items-center gap-4 text-text" style={{ fontSize: "var(--t-sm)" }}>
            <span className="font-bold">총 <span style={{ color: "var(--accent)" }}>{stats.total}</span>개 문서</span>
            <span className="text-text-muted">템플릿 {stats.withTemplate}개 · 그룹 {stats.groups}개</span>
          </div>
          <CopyMarkdownBar markdown={register} filename="IVDR-문서-마스터-등록부.md" />
        </div>

        {/* 트리 */}
        <div className="flex flex-col" style={{ gap: "var(--s-8)", marginTop: "var(--s-8)" }}>
          {docTree.map((group) => (
            <section key={group.id}>
              {/* 그룹 헤더 */}
              <div
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b"
                style={{ borderColor: "var(--border-strong)", paddingBottom: "var(--s-2)" }}
              >
                <h2 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
                  {group.title}
                </h2>
                <span className="font-mono text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
                  {group.refs.join(" · ")}
                </span>
                <span className="ml-auto text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
                  {group.items.length}개
                </span>
              </div>

              {/* 잎 문서 행 */}
              <ul className="flex flex-col" style={{ gap: "var(--s-2)", marginTop: "var(--s-3)" }}>
                {group.items.map((leaf) => {
                  const station = stations.find((s) => s.id === leaf.stationId)!;
                  const phase = phaseById(station.phase);
                  const color = `var(${phase.colorVar})`;
                  const Icon = getIcon(station.icon);
                  const req = requirementMeta[leaf.requirement];
                  return (
                    <li
                      key={leaf.title}
                      className="rounded-[var(--r-md)] border bg-bg"
                      style={{ borderColor: "var(--border)", padding: "var(--s-4)" }}
                    >
                      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                        {/* 좌: 문서명 + 메타 */}
                        <div className="min-w-0 flex-1" style={{ minWidth: 220 }}>
                          <div className="flex items-center gap-2">
                            <StatusChip label={req.label} tone={req.tone} />
                            {leaf.kind === "reference" && (
                              <span
                                className="rounded-full font-semibold text-text-subtle"
                                style={{ background: "var(--surface-2)", fontSize: "var(--t-xs)", padding: "3px 9px" }}
                              >
                                참조
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)", marginTop: 6 }}>
                            {leaf.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2" style={{ marginTop: 6 }}>
                            <span className="inline-flex items-center gap-1 font-mono text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                              <BookMarked size={12} aria-hidden />
                              {leaf.refs.join(", ")}
                            </span>
                          </div>
                          {leaf.note && (
                            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 6 }}>
                              {leaf.note}
                            </p>
                          )}
                        </div>

                        {/* 우: 정거장 + 템플릿 */}
                        <div className="flex shrink-0 flex-col items-stretch gap-2" style={{ minWidth: 180 }}>
                          <Link
                            to={`/station/${station.id}`}
                            className="inline-flex items-center gap-2 rounded-[var(--r-sm)] font-semibold text-text-muted hover:bg-surface"
                            style={{ fontSize: "var(--t-sm)", padding: "6px 10px" }}
                          >
                            <span
                              className="inline-flex shrink-0 items-center justify-center rounded-full text-text-on-color font-bold"
                              style={{ background: color, width: 22, height: 22, fontSize: "var(--t-xs)" }}
                            >
                              {station.id}
                            </span>
                            <Icon size={14} style={{ color }} aria-hidden />
                            <span className="truncate">{phase.title}</span>
                          </Link>

                          {leaf.kind === "template" ? (
                            <Link
                              to={`/doc/${station.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color"
                              style={{ background: "var(--accent)", fontSize: "var(--t-sm)", padding: "8px 12px", minHeight: 40 }}
                            >
                              <FileText size={16} aria-hidden />
                              템플릿 열기
                            </Link>
                          ) : (
                            <Link
                              to={`/station/${station.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-[var(--r-md)] border font-semibold text-text hover:bg-surface"
                              style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "8px 12px", minHeight: 40 }}
                            >
                              정거장에서 보기
                              <ArrowUpRight size={14} aria-hidden />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <p
          className="flex items-center gap-2 text-text-subtle"
          style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-12)" }}
        >
          <FileCheck size={14} aria-hidden />
          '참조'는 전용 템플릿 없이 관련 정거장 문서에 포함되는 항목입니다. 유형(필수/조건부/해당
          시)은 클래스·제품에 따라 달라질 수 있습니다.
        </p>
      </main>
    </div>
  );
}
