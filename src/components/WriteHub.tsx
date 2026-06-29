import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PenLine,
  CheckCircle2,
  Circle,
  Clock3,
  ChevronRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { documents } from "../data/documents";
import { iso13485Documents } from "../data/iso13485/documents";
import { ivddDocuments } from "../data/ivdd/documents";
import { mdsapDocuments } from "../data/mdsap/documents";
import {
  useProgress,
  STATUS_LABEL,
  STATUS_COLOR,
  type DocStatus,
} from "../data/progress";
import { PageHeader } from "./PageHeader";
import type { Level } from "../data/docTree";

// ── 인증 설정 ──────────────────────────────────────────────────
type CertKey = "ivdr" | "iso13485" | "ivdd" | "mdsap";

const CERT_META: Record<CertKey, { label: string; colorVar: string; tintVar: string }> = {
  ivdr:     { label: "IVDR",      colorVar: "--accent", tintVar: "--accent-weak" },
  iso13485: { label: "ISO 13485", colorVar: "--p3",     tintVar: "--p3-tint" },
  ivdd:     { label: "IVDD",      colorVar: "--p2",     tintVar: "--p2-tint" },
  mdsap:    { label: "MDSAP",     colorVar: "--p4",     tintVar: "--p4-tint" },
};

// ── 전체 문서 목록 (인증별) ────────────────────────────────────
type DocEntry = {
  id: string;
  docTitle: string;
  purpose: string;
  difficulty?: Level;
  importance?: Level;
  certType: CertKey;
  progressKey: "ivdr" | "iso13485";
};

const ALL_DOCS: DocEntry[] = [
  ...documents.map((d): DocEntry => ({
    id: d.id, docTitle: d.docTitle, purpose: d.purpose,
    difficulty: d.difficulty, importance: d.importance,
    certType: "ivdr", progressKey: "ivdr",
  })),
  ...iso13485Documents.map((d): DocEntry => ({
    id: d.id, docTitle: d.docTitle, purpose: d.purpose,
    difficulty: d.difficulty, importance: d.importance,
    certType: "iso13485", progressKey: "iso13485",
  })),
  ...ivddDocuments.map((d): DocEntry => ({
    id: d.id, docTitle: d.docTitle, purpose: d.purpose,
    difficulty: d.difficulty, importance: d.importance,
    certType: "ivdd", progressKey: "ivdr",
  })),
  ...mdsapDocuments.map((d): DocEntry => ({
    id: d.id, docTitle: d.docTitle, purpose: d.purpose,
    difficulty: d.difficulty, importance: d.importance,
    certType: "mdsap", progressKey: "ivdr",
  })),
];

// 인증별 문서 id 목록
const IDS_BY_CERT: Record<CertKey, string[]> = {
  ivdr:     documents.map((d) => d.id),
  iso13485: iso13485Documents.map((d) => d.id),
  ivdd:     ivddDocuments.map((d) => d.id),
  mdsap:    mdsapDocuments.map((d) => d.id),
};

const DIFFICULTY_LABEL: Record<string, { text: string; bg: string; color: string }> = {
  low:  { text: "쉬움",   bg: "var(--success-bg)",  color: "var(--success)" },
  med:  { text: "보통",   bg: "var(--warning-bg)",  color: "var(--warning)" },
  high: { text: "어려움", bg: "var(--danger-bg, color-mix(in srgb,var(--text-on-color) 5%,transparent))",  color: "var(--danger, #e63)" },
};

// ── 문서 카드 ──────────────────────────────────────────────────
function DocCard({
  doc,
  status,
  highlight = false,
}: {
  doc: DocEntry;
  status: DocStatus;
  highlight?: boolean;
}) {
  const meta = CERT_META[doc.certType];
  const color = `var(${meta.colorVar})`;
  const tint  = `var(${meta.tintVar})`;

  const StatusIcon =
    status === "done" ? CheckCircle2 : status === "in_progress" ? Clock3 : Circle;

  const btnLabel =
    status === "not_started" ? "작성 시작" : status === "in_progress" ? "이어서 작성" : "다시 보기";

  const diff = doc.difficulty ? DIFFICULTY_LABEL[doc.difficulty] : null;

  const borderColor =
    status === "done" ? "var(--success)" :
    status === "in_progress" ? "var(--warning)" :
    highlight ? color : "var(--border)";

  return (
    <div
      className="flex flex-col rounded-[var(--r-lg)] bg-bg overflow-hidden"
      style={{ border: `1.5px solid ${borderColor}`, boxShadow: "var(--shadow-card)" }}
    >
      {/* 상단: 인증 + 상태 */}
      <div
        className="flex items-center gap-2"
        style={{ padding: "var(--s-2) var(--s-4)", background: tint, borderBottom: `1px solid var(--border)` }}
      >
        <span className="rounded-full font-bold text-text-on-color" style={{ background: color, fontSize: 11, padding: "2px 9px" }}>
          {meta.label}
        </span>
        {diff && (
          <span className="rounded-full font-semibold" style={{ background: diff.bg, color: diff.color, fontSize: 11, padding: "2px 9px" }}>
            {diff.text}
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto" style={{ color: STATUS_COLOR[status], fontSize: "var(--t-xs)" }}>
          <StatusIcon size={13} aria-hidden />
          <span className="font-semibold">{STATUS_LABEL[status]}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 flex flex-col" style={{ padding: "var(--s-3) var(--s-4)" }}>
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-tight)", marginBottom: "var(--s-1)" }}>
          {doc.docTitle}
        </h3>
        <p className="text-text-muted flex-1" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
          {doc.purpose}
        </p>
      </div>

      {/* 하단: 작성 버튼 */}
      <div style={{ padding: "var(--s-3) var(--s-4)", borderTop: "1px solid var(--border)" }}>
        <Link
          to={`/doc/${doc.id}`}
          className="flex items-center justify-between rounded-[var(--r-md)] font-bold text-text-on-color w-full"
          style={{ background: color, fontSize: "var(--t-sm)", padding: "9px 14px" }}
        >
          {btnLabel}
          <ChevronRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

// ── 인증 진행도 카드 ──────────────────────────────────────────
function CertProgressCard({
  certKey,
  done,
  inProgress,
  total,
  active,
  onClick,
}: {
  certKey: CertKey;
  done: number;
  inProgress: number;
  total: number;
  active: boolean;
  onClick: () => void;
}) {
  const meta = CERT_META[certKey];
  const color = `var(${meta.colorVar})`;
  const tint  = `var(${meta.tintVar})`;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="text-left rounded-[var(--r-lg)] transition-all"
      style={{
        border: active ? `2px solid ${color}` : "2px solid var(--border)",
        background: active ? tint : "var(--bg)",
        padding: "var(--s-4)",
        boxShadow: active ? "var(--shadow-pop)" : "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-2)" }}>
        <span
          className="rounded-full font-extrabold text-text-on-color"
          style={{ background: color, fontSize: 11, padding: "2px 9px" }}
        >
          {meta.label}
        </span>
        <span className="ml-auto font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
          {done}<span className="text-text-subtle font-normal">/{total}</span>
        </span>
      </div>
      {/* 진행 바 */}
      <div className="rounded-full overflow-hidden" style={{ height: 5, background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex items-center gap-3 text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-1)" }}>
        <span style={{ color: "var(--success)" }}>✓ 완료 {done}</span>
        {inProgress > 0 && <span style={{ color: "var(--warning)" }}>● 작성중 {inProgress}</span>}
        <span>총 {total}개</span>
      </div>
    </button>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────
type FilterCert   = "all" | CertKey;
type FilterStatus = "all" | DocStatus;

export function WriteHub() {
  const [certFilter, setCertFilter]     = useState<FilterCert>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const ivdrP = useProgress("ivdr");
  const isoP  = useProgress("iso13485");

  const getStatus = (doc: DocEntry): DocStatus =>
    doc.progressKey === "iso13485" ? isoP.getStatus(doc.id) : ivdrP.getStatus(doc.id);

  // 인증별 진행도
  const certStats = useMemo(() => ({
    ivdr:     ivdrP.countByStatus(IDS_BY_CERT.ivdr),
    iso13485: isoP.countByStatus(IDS_BY_CERT.iso13485),
    ivdd:     ivdrP.countByStatus(IDS_BY_CERT.ivdd),
    mdsap:    ivdrP.countByStatus(IDS_BY_CERT.mdsap),
  }), [ivdrP, isoP]);

  const totalDone  = Object.values(certStats).reduce((s, c) => s + c.done, 0);
  const totalDocs  = ALL_DOCS.length;

  // 추천 시작 문서: 중요도 높고 난이도 낮은 미작성 문서 (최대 4개)
  const recommended = useMemo(() =>
    ALL_DOCS
      .filter((d) => getStatus(d) === "not_started" && d.importance === "high" && d.difficulty === "low")
      .slice(0, 4),
    [ivdrP, isoP],
  );

  // 필터링
  const filtered = useMemo(() =>
    ALL_DOCS.filter((d) => {
      if (certFilter !== "all" && d.certType !== certFilter) return false;
      if (statusFilter !== "all" && getStatus(d) !== statusFilter) return false;
      return true;
    }),
    [certFilter, statusFilter, ivdrP, isoP],
  );

  const STATUS_FILTERS: { key: FilterStatus; label: string }[] = [
    { key: "all",          label: "전체" },
    { key: "not_started",  label: "미작성" },
    { key: "in_progress",  label: "작성 중" },
    { key: "done",         label: "완료" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="문서 작성" />

      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}
      >
        {/* ── 히어로 ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "var(--s-8)" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: "var(--s-3)" }}>
            <span
              className="grid place-items-center rounded-[var(--r-md)]"
              style={{ width: 44, height: 44, background: "var(--accent)", flexShrink: 0 }}
              aria-hidden
            >
              <PenLine size={24} style={{ color: "#fff" }} />
            </span>
            <h1
              className="font-extrabold text-text"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: "var(--lh-tight)" }}
            >
              이제 문서를 써볼까?
            </h1>
          </div>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 600, lineHeight: "var(--lh-base)" }}>
            인증에 필요한 문서를 아래서 골라 바로 작성을 시작하세요.
            각 카드를 누르면 템플릿·가이드·문구 라이브러리가 함께 열립니다.
          </p>

          {/* 전체 진행 요약 */}
          <div
            className="inline-flex items-center gap-2 rounded-[var(--r-full)] font-semibold"
            style={{
              marginTop: "var(--s-4)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "8px 18px",
              fontSize: "var(--t-sm)",
            }}
          >
            <FileText size={15} style={{ color: "var(--accent)" }} aria-hidden />
            <span className="text-text-muted">전체</span>
            <span className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>
              {totalDone}
            </span>
            <span className="text-text-subtle">/ {totalDocs}개 완료</span>
            <span
              className="rounded-full font-bold text-text-on-color"
              style={{ background: "var(--accent)", fontSize: 11, padding: "2px 10px" }}
            >
              {Math.round((totalDone / totalDocs) * 100)}%
            </span>
          </div>
        </div>

        {/* ── 인증별 진행도 카드 ──────────────────────────────── */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", marginBottom: "var(--s-8)" }}
        >
          {(["ivdr", "iso13485", "ivdd", "mdsap"] as CertKey[]).map((ck) => (
            <CertProgressCard
              key={ck}
              certKey={ck}
              done={certStats[ck].done}
              inProgress={certStats[ck].inProgress}
              total={certStats[ck].total}
              active={certFilter === ck}
              onClick={() => setCertFilter((prev) => prev === ck ? "all" : ck)}
            />
          ))}
        </div>

        {/* ── 추천 시작 문서 ─────────────────────────────────── */}
        {recommended.length > 0 && certFilter === "all" && statusFilter === "all" && (
          <div style={{ marginBottom: "var(--s-8)" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-3)" }}>
              <Sparkles size={16} style={{ color: "var(--accent)" }} aria-hidden />
              <h2 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                여기서 시작하세요
              </h2>
              <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
                — 중요도 높고 쉬운 문서 먼저 써보세요
              </span>
            </div>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
            >
              {recommended.map((doc) => (
                <DocCard key={doc.id} doc={doc} status={getStatus(doc)} highlight />
              ))}
            </div>
            <div style={{ borderBottom: "1px solid var(--border)", marginTop: "var(--s-6)" }} />
          </div>
        )}

        {/* ── 필터 바 ────────────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-2"
          style={{ marginBottom: "var(--s-5)" }}
        >
          {/* 상태 필터 */}
          <div className="flex items-center gap-1 rounded-[var(--r-full)]" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "4px" }}>
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className="rounded-[var(--r-full)] font-semibold transition-all"
                  style={{
                    fontSize: "var(--t-xs)",
                    padding: "5px 12px",
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "var(--text-on-color)" : "var(--text-muted)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <span className="text-text-subtle" style={{ fontSize: "var(--t-sm)" }}>
            {filtered.length}개 표시
          </span>
        </div>

        {/* ── 문서 카드 그리드 ────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center text-center"
            style={{ padding: "var(--s-16) 0", gap: "var(--s-3)" }}
          >
            <CheckCircle2 size={48} style={{ color: "var(--success)" }} aria-hidden />
            <p className="font-bold text-text" style={{ fontSize: "var(--t-xl)" }}>이 조건의 문서가 없습니다</p>
            <p className="text-text-muted" style={{ fontSize: "var(--t-base)" }}>필터를 바꿔보세요</p>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {filtered.map((doc) => (
              <DocCard key={doc.id} doc={doc} status={getStatus(doc)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
