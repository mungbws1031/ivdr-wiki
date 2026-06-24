import { useState } from "react";
import { Link } from "react-router-dom";
import { FolderTree, FolderOpen, FileText, Sparkles, List, Network, ListOrdered } from "lucide-react";
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
import { DocumentMindmap } from "./DocumentMindmap";
import { DocumentOrder } from "./DocumentOrder";

/** 연결선(엘보) — 스파인에서 노드로 뻗는 가로선. */
function Elbow({ color, top = 26 }: { color: string; top?: number }) {
  return (
    <span
      aria-hidden
      className="absolute"
      style={{ left: -28, top, width: 28, height: 0, borderTop: `2px solid ${color}` }}
    />
  );
}

/** /documents — 제출 문서 트리(마인드맵). 모든 잎은 문서로 열린다. */
export function DocumentTree() {
  const stats = docTreeStats();
  const register = toRegisterMarkdown();
  const [tab, setTab] = useState<"list" | "map" | "order">("list");

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
          제출 구조를 트리로 펼쳤습니다. 색은 문서 그룹을 구분하고, 모든 잎 노드를 누르면 작성
          템플릿이 열립니다(워드 내보내기 포함).
        </p>

        {/* 요약 + 등록부 내보내기 */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--r-md)] border"
          style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-4)", marginTop: "var(--s-4)" }}
        >
          <div className="flex items-center gap-4 text-text" style={{ fontSize: "var(--t-sm)" }}>
            <span className="font-bold">총 <span style={{ color: "var(--accent)" }}>{stats.total}</span>개 문서</span>
            <span className="text-text-muted">전용 템플릿 {stats.detailed}개 · 그룹 {stats.groups}개</span>
          </div>
          <CopyMarkdownBar markdown={register} filename="IVDR-문서-마스터-등록부.md" />
        </div>

        {/* 탭 */}
        <div
          role="tablist"
          aria-label="문서 보기 방식"
          className="flex items-center gap-1"
          style={{ marginTop: "var(--s-8)", borderBottom: "1px solid var(--border)" }}
        >
          {([
            { id: "list", label: "목록", Icon: List },
            { id: "map", label: "구조 파악하기", Icon: Network },
            { id: "order", label: "작성 순서", Icon: ListOrdered },
          ] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className="inline-flex items-center gap-2 font-bold"
                style={{
                  fontSize: "var(--t-sm)",
                  padding: "10px 14px",
                  minHeight: 44,
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                <t.Icon size={16} aria-hidden />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 구조 파악하기 (마인드맵) */}
        {tab === "map" && (
          <div style={{ marginTop: "var(--s-6)" }}>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}>
              전체 {stats.total}개 문서의 가지를 한눈에. 잎 노드를 누르면 작성 페이지로 이동합니다.
              <span className="inline-flex items-center gap-1" style={{ marginLeft: 8 }}>
                <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "var(--accent)" }} aria-hidden />
                = 전용 템플릿
              </span>
            </p>
            <DocumentMindmap />
          </div>
        )}

        {/* 작성 순서 (로드맵) */}
        {tab === "order" && (
          <div style={{ marginTop: "var(--s-6)" }}>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-6)" }}>
              의존성을 반영한 권장 작성 순서입니다. 위에서 아래로 진행하며, 같은 단계 안의 문서는
              병행 가능합니다. 칩을 누르면 작성 페이지로 이동합니다.
            </p>
            <DocumentOrder />
          </div>
        )}

        {/* 목록 (상세 트리) */}
        {tab === "list" && (
        <>
        <div style={{ marginTop: "var(--s-6)", overflowX: "auto" }}>
          <div style={{ minWidth: 320 }}>
            {/* 루트 */}
            <div
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-extrabold text-text-on-color"
              style={{ background: "var(--accent)", padding: "10px 18px", fontSize: "var(--t-lg)" }}
            >
              <FolderTree size={20} aria-hidden />
              IVDR 제출 문서
              <span
                className="rounded-full"
                style={{ background: "rgba(255,255,255,0.22)", fontSize: "var(--t-sm)", padding: "1px 9px" }}
              >
                {stats.total}
              </span>
            </div>

            {/* 그룹 스파인 */}
            <div
              className="relative"
              style={{ marginLeft: 18, paddingLeft: 28, borderLeft: "2px solid var(--border-strong)" }}
            >
              {docTree.map((group) => {
                const gColor = `var(${group.colorVar})`;
                const gTint = `var(${group.colorVar}-tint)`;
                return (
                  <div key={group.id} className="relative" style={{ paddingTop: "var(--s-6)" }}>
                    <Elbow color="var(--border-strong)" top={26 + 24} />

                    {/* 그룹 노드 */}
                    <div
                      className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--r-md)]"
                      style={{ background: gTint, borderLeft: `4px solid ${gColor}`, padding: "10px 16px" }}
                    >
                      <span className="inline-flex items-center gap-2 font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
                        <FolderOpen size={18} style={{ color: gColor }} aria-hidden />
                        {group.title}
                      </span>
                      <span className="font-mono text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                        {group.refs.join(" · ")}
                      </span>
                      <span
                        className="rounded-full font-bold text-text-on-color"
                        style={{ background: gColor, fontSize: "var(--t-xs)", padding: "1px 9px" }}
                      >
                        {group.items.length}
                      </span>
                    </div>

                    {/* 잎 스파인 */}
                    <div
                      className="relative"
                      style={{ marginLeft: 14, paddingLeft: 28, marginTop: "var(--s-3)", borderLeft: `2px solid ${gColor}` }}
                    >
                      {group.items.map((leaf) => {
                        const station = stations.find((s) => s.id === leaf.stationId)!;
                        const phase = phaseById(station.phase);
                        const sColor = `var(${phase.colorVar})`;
                        const Icon = getIcon(station.icon);
                        const req = requirementMeta[leaf.requirement];
                        return (
                          <div key={leaf.id} className="relative" style={{ marginBottom: "var(--s-2)" }}>
                            <Elbow color={gColor} top={26} />
                            <div
                              className="rounded-[var(--r-md)] border bg-bg"
                              style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-3)" }}
                            >
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <StatusChip label={req.label} tone={req.tone} />
                                {leaf.detailed && (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full font-semibold"
                                    style={{ background: "var(--accent-weak)", color: "var(--accent)", fontSize: "var(--t-xs)", padding: "2px 9px" }}
                                  >
                                    전용 템플릿
                                  </span>
                                )}
                                <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                                  {leaf.title}
                                </h3>

                                {/* 우측 액션 */}
                                <div className="ml-auto flex items-center gap-2">
                                  <Link
                                    to={`/station/${station.id}`}
                                    title={`정거장 ${station.id} · ${phase.title}`}
                                    className="inline-flex items-center gap-1 rounded-[var(--r-sm)] font-semibold text-text-muted hover:bg-surface"
                                    style={{ fontSize: "var(--t-xs)", padding: "4px 8px" }}
                                  >
                                    <span
                                      className="inline-flex items-center justify-center rounded-full text-text-on-color font-bold"
                                      style={{ background: sColor, width: 18, height: 18, fontSize: 10 }}
                                    >
                                      {station.id}
                                    </span>
                                    <Icon size={13} style={{ color: sColor }} aria-hidden />
                                  </Link>
                                  <Link
                                    to={`/doc/${leaf.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] font-bold text-text-on-color"
                                    style={{ background: "var(--accent)", fontSize: "var(--t-xs)", padding: "6px 11px", minHeight: 32 }}
                                  >
                                    <FileText size={14} aria-hidden />
                                    문서 열기
                                  </Link>
                                </div>
                              </div>

                              {/* 메타 */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ marginTop: 6 }}>
                                <span className="font-mono text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
                                  {leaf.refs.join(", ")}
                                </span>
                              </div>
                              {leaf.note && (
                                <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>
                                  {leaf.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[var(--r-md)] border"
          style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-3) var(--s-4)", marginTop: "var(--s-8)" }}
        >
          <span className="font-semibold text-text-muted" style={{ fontSize: "var(--t-xs)" }}>범례</span>
          <StatusChip label="필수" tone="info" />
          <StatusChip label="조건부" tone="warning" />
          <StatusChip label="해당 시" tone="neutral" />
          <span className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
            <span className="inline-flex items-center rounded-full font-semibold" style={{ background: "var(--accent-weak)", color: "var(--accent)", padding: "1px 8px" }}>전용 템플릿</span>
            = 손으로 작성한 상세 템플릿
          </span>
          <span className="flex items-center gap-1.5 text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
            <Sparkles size={13} style={{ color: "var(--info)" }} aria-hidden /> 나머지는 일반 템플릿 자동 생성
          </span>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
