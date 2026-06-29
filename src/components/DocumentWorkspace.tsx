import { useState } from "react";
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
  Sparkles,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Copy,
  type LucideIcon,
} from "lucide-react";
import { loadSchedule, getScheduleForCert, CERT_META } from "../data/projectSchedule";
import { resolveDoc, toMarkdown } from "../data/documents";
import { isISO13485Doc } from "../data/schemes";
import { useProgress, STATUS_LABEL, STATUS_NEXT, STATUS_COLOR } from "../data/progress";
import { stations, phaseById, type Station } from "../data/stations";
import { iso13485Stations } from "../data/iso13485/stations";
import { ivddStations } from "../data/ivdd/stations";
import { mdsapStations } from "../data/mdsap/stations";
import { prereqKindLabel, leafById, colorForLeaf, type PrereqKind } from "../data/docTree";

function adaptISO13485Station(s: typeof iso13485Stations[0]): Station {
  return { ...s, phase: s.phase as any };
}
import { getIcon } from "../lib/icons";
import { PageHeader } from "./PageHeader";
import { DocxExport } from "./DocxExport";
import { ConceptChip } from "./ConceptChip";
import { LevelMeter } from "./LevelMeter";
import { EffortTimeline } from "./EffortTimeline";
import { SensSpecCalc } from "./calcs/SensSpecCalc";
import { SampleSizeCalc } from "./calcs/SampleSizeCalc";
import { RiskMatrixCalc } from "./calcs/RiskMatrixCalc";
import { LodCalc } from "./calcs/LodCalc";
import { InlineEditor } from "./InlineEditor";
import { SnippetLibrary } from "./SnippetLibrary";

const PREREQ_STYLE: Record<PrereqKind, { Icon: LucideIcon; color: string }> = {
  doc: { Icon: FileText, color: "var(--p3)" },
  data: { Icon: Database, color: "var(--p1)" },
  photo: { Icon: ImageIcon, color: "var(--p4)" },
  test: { Icon: FlaskConical, color: "var(--p2)" },
  other: { Icon: Paperclip, color: "var(--text-muted)" },
};

// ── 마크다운 복사 버튼 ──────────────────────────────────────────
function CopyMdButton({ markdown, filename }: { markdown: string; filename: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(markdown).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      title={`${filename} 복사`}
      className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] font-semibold hover:bg-surface transition-colors"
      style={{
        border: "1px solid var(--border)",
        fontSize: "var(--t-sm)",
        padding: "7px 14px",
        color: copied ? "var(--success)" : "var(--text-muted)",
      }}
    >
      <Copy size={14} aria-hidden />
      {copied ? "복사됨!" : "MD 복사"}
    </button>
  );
}

// ── 접을 수 있는 준비 섹션 ──────────────────────────────────────
function PrepSection({ doc, color }: { doc: any; color: string }) {
  const knowledgeCount = doc.knowledge?.length ?? 0;
  const prereqCount = doc.prerequisites?.length ?? 0;
  const expCount = doc.experiments?.length ?? 0;
  const certCount = doc.certTests?.length ?? 0;
  const dataCount = doc.requiredData?.length ?? 0;
  const prepDocCount = doc.prepDocs?.length ?? 0;
  const totalCount = knowledgeCount + prereqCount + expCount + certCount + dataCount + prepDocCount;

  const [open, setOpen] = useState(false);

  if (totalCount === 0) return null;

  return (
    <div
      className="rounded-[var(--r-lg)] overflow-hidden"
      style={{ border: "1px solid var(--border)", marginBottom: "var(--s-5)" }}
    >
      {/* 아코디언 헤더 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
        style={{ padding: "var(--s-4) var(--s-5)", background: "var(--surface)" }}
      >
        <span
          className="grid shrink-0 place-items-center rounded-full"
          style={{ width: 32, height: 32, background: color }}
          aria-hidden
        >
          <PackageCheck size={17} style={{ color: "#fff" }} />
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>
            작성 전 준비 확인
          </span>
          <span className="ml-2 text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
            지식 {knowledgeCount}
            {prereqCount > 0 && ` · 준비물 ${prereqCount}`}
            {(expCount + certCount + dataCount) > 0 && ` · 실험·테스트·자료 ${expCount + certCount + dataCount}`}
            {prepDocCount > 0 && ` · 선행문서 ${prepDocCount}`}
          </span>
        </div>
        <span className="text-text-subtle shrink-0">
          {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
        </span>
      </button>

      {open && (
        <div style={{ padding: "var(--s-5)", background: "var(--bg)" }} className="flex flex-col">
          <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
            {/* 사전 지식 */}
            {doc.knowledge && doc.knowledge.length > 0 && (
              <div
                className="rounded-[var(--r-md)] overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--info-bg)" }}
              >
                <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                  <GraduationCap size={16} style={{ color: "var(--info)" }} aria-hidden />
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>사전 지식</span>
                  <span className="ml-auto rounded-full font-semibold text-text-on-color" style={{ background: "var(--info)", fontSize: 11, padding: "1px 8px" }}>{doc.knowledge.length}</span>
                </div>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", padding: "var(--s-3) var(--s-4)" }}>
                  {doc.knowledge.map((k: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 rounded-[var(--r-sm)] bg-bg" style={{ padding: "8px 10px", border: "1px solid var(--border)" }}>
                      <span aria-hidden className="shrink-0 rounded-[3px] mt-0.5" style={{ width: 15, height: 15, border: "2px solid var(--info)", flexShrink: 0 }} />
                      <span className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 준비물 */}
            {doc.prerequisites && doc.prerequisites.length > 0 && (
              <div
                className="rounded-[var(--r-md)] overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--warning-bg)" }}
              >
                <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                  <PackageCheck size={16} style={{ color: "var(--warning)" }} aria-hidden />
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>준비물</span>
                  <span className="ml-auto rounded-full font-semibold text-text-on-color" style={{ background: "var(--warning)", fontSize: 11, padding: "1px 8px" }}>{doc.prerequisites.length}</span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", padding: "var(--s-3) var(--s-4)" }}>
                  {doc.prerequisites.map((p: any, i: number) => {
                    const st = PREREQ_STYLE[p.kind as PrereqKind];
                    return (
                      <div key={i} className="flex items-start gap-2 rounded-[var(--r-sm)] bg-bg" style={{ border: "1px solid var(--border)", padding: "8px 10px" }}>
                        <span className="grid shrink-0 place-items-center rounded-[var(--r-sm)]" style={{ width: 28, height: 28, background: "var(--surface)" }}>
                          <st.Icon size={15} style={{ color: st.color }} aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <span className="inline-block rounded-full font-bold" style={{ color: st.color, fontSize: 10, background: "var(--surface)", padding: "0px 6px" }}>{prereqKindLabel[p.kind as PrereqKind]}</span>
                          <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", marginTop: 2 }}>{p.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 필요한 실험 */}
            {doc.experiments && doc.experiments.length > 0 && (
              <div className="rounded-[var(--r-md)] overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--p1-tint)" }}>
                <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                  <FlaskConical size={16} style={{ color: "var(--p1)" }} aria-hidden />
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>선행 실험</span>
                  <span className="ml-auto rounded-full font-semibold text-text-on-color" style={{ background: "var(--p1)", fontSize: 11, padding: "1px 8px" }}>{doc.experiments.length}</span>
                </div>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", padding: "var(--s-3) var(--s-4)" }}>
                  {doc.experiments.map((e: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 rounded-[var(--r-sm)] bg-bg" style={{ padding: "8px 10px", border: "1px solid var(--border)" }}>
                      <span aria-hidden className="shrink-0 rounded-[3px] mt-0.5" style={{ width: 15, height: 15, border: "2px solid var(--p1)", flexShrink: 0 }} />
                      <span className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 인증·테스트 */}
            {doc.certTests && doc.certTests.length > 0 && (
              <div className="rounded-[var(--r-md)] overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--p3-tint)" }}>
                <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                  <ListChecks size={16} style={{ color: "var(--p3)" }} aria-hidden />
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>인증·테스트</span>
                  <span className="ml-auto rounded-full font-semibold text-text-on-color" style={{ background: "var(--p3)", fontSize: 11, padding: "1px 8px" }}>{doc.certTests.length}</span>
                </div>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", padding: "var(--s-3) var(--s-4)" }}>
                  {doc.certTests.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 rounded-[var(--r-sm)] bg-bg" style={{ padding: "8px 10px", border: "1px solid var(--border)" }}>
                      <span aria-hidden className="shrink-0 rounded-[3px] mt-0.5" style={{ width: 15, height: 15, border: "2px solid var(--p3)", flexShrink: 0 }} />
                      <span className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 확보 자료 */}
            {doc.requiredData && doc.requiredData.length > 0 && (
              <div className="rounded-[var(--r-md)] overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--p4-tint)" }}>
                <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                  <BookMarked size={16} style={{ color: "var(--p4)" }} aria-hidden />
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>확보 자료</span>
                  <span className="ml-auto rounded-full font-semibold text-text-on-color" style={{ background: "var(--p4)", fontSize: 11, padding: "1px 8px" }}>{doc.requiredData.length}</span>
                </div>
                <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", padding: "var(--s-3) var(--s-4)" }}>
                  {doc.requiredData.map((d: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 rounded-[var(--r-sm)] bg-bg" style={{ padding: "8px 10px", border: "1px solid var(--border)" }}>
                      <span aria-hidden className="shrink-0 rounded-[3px] mt-0.5" style={{ width: 15, height: 15, border: "2px solid var(--p4)", flexShrink: 0 }} />
                      <span className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 선행 문서 */}
            {doc.prepDocs && doc.prepDocs.length > 0 && (
              <div className="rounded-[var(--r-md)] overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--success-bg)" }}>
                <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                  <Files size={16} style={{ color: "var(--success)" }} aria-hidden />
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>먼저 만들면 좋은 문서</span>
                  <span className="ml-auto rounded-full font-semibold text-text-on-color" style={{ background: "var(--success)", fontSize: 11, padding: "1px 8px" }}>{doc.prepDocs.length}</span>
                </div>
                <div className="flex flex-wrap gap-2" style={{ padding: "var(--s-3) var(--s-4)" }}>
                  {doc.prepDocs.map((pid: string) => {
                    const l = leafById(pid);
                    if (!l) return null;
                    const c = `var(${colorForLeaf(pid)})`;
                    return (
                      <Link
                        key={pid}
                        to={`/doc/${pid}`}
                        className="inline-flex items-center gap-2 rounded-[var(--r-full)] bg-bg transition-colors hover:bg-surface"
                        style={{ border: "1px solid var(--border)", padding: "6px 12px" }}
                      >
                        <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 7, height: 7, background: c }} />
                        <span className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{l.title}</span>
                        <ArrowUpRight size={13} style={{ color: "var(--text-subtle)" }} aria-hidden />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** /doc/:id — 문서 작성 워크스페이스 */
export function DocumentWorkspace() {
  const { id } = useParams();
  const doc = id ? resolveDoc(id) : undefined;

  const isISODoc = (doc?.id ?? "").startsWith("iso-");
  const isIVDDDoc = (doc?.id ?? "").startsWith("ivdd-");
  const isMDSAPDoc = (doc?.id ?? "").startsWith("mdsap-");

  const ivdrProgress = useProgress("ivdr");
  const isoProgress = useProgress("iso13485");
  const { getStatus, setStatus } = isISODoc ? isoProgress : ivdrProgress;
  const status = doc ? getStatus(doc.id) : "not_started";
  const nextStatus = STATUS_NEXT[status];

  const certTypeKey = isISODoc ? "iso13485" : isIVDDDoc ? "ivdd" : isMDSAPDoc ? "mdsap" : "ivdr";
  const scheduleEntries = (() => {
    try {
      const store = loadSchedule();
      return getScheduleForCert(store, certTypeKey);
    } catch {
      return [];
    }
  })();

  const station = doc
    ? isISODoc
      ? adaptISO13485Station(iso13485Stations.find((s) => s.id === doc.stationId)!)
      : isIVDDDoc
      ? ({ ...ivddStations.find((s) => s.id === doc.stationId)!, phase: "p1" as any } as any)
      : isMDSAPDoc
      ? ({ ...mdsapStations.find((s) => s.id === doc.stationId)!, phase: "p1" as any } as any)
      : stations.find((s) => s.id === doc.stationId)
    : undefined;

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
  const color = isIVDDDoc ? "var(--p2)" : isMDSAPDoc ? "var(--p4)" : `var(${phase.colorVar})`;
  const Icon = getIcon(station.icon);
  const markdown = toMarkdown(doc);
  const certPrefix = isISODoc ? "ISO13485" : isIVDDDoc ? "IVDD" : isMDSAPDoc ? "MDSAP" : "IVDR";
  const filename = `${certPrefix}-${String(station.id).padStart(2, "0")}-${doc.docTitle}.md`;
  const journeyPath = isISODoc ? "/iso13485" : isIVDDDoc ? "/ivdd" : isMDSAPDoc ? "/mdsap" : "/ivdr";
  const journeyLabel = isISODoc ? "ISO 13485" : isIVDDDoc ? "IVDD" : isMDSAPDoc ? "MDSAP" : "IVDR";

  // 가장 가까운 D-day
  const nearestDday = (() => {
    if (!scheduleEntries.length) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const upcoming = scheduleEntries
      .map(({ milestone, date }) => {
        const d = new Date(date);
        return { label: milestone.label, diff: Math.ceil((d.getTime() - today.getTime()) / 86400000) };
      })
      .filter(x => x.diff >= 0)
      .sort((a, b) => a.diff - b.diff);
    return upcoming[0] ?? null;
  })();

  const certBadgeColor = isISODoc ? "var(--p3)" : isIVDDDoc ? "var(--p2)" : isMDSAPDoc ? "var(--p4)" : "var(--accent)";
  const certBadgeLabel = isISODoc ? "ISO 13485" : isIVDDDoc ? "IVDD" : isMDSAPDoc ? "MDSAP" : "IVDR";
  // 더블 배지 여부 (IVDR + ISO)
  const showDualBadge = isISO13485Doc(doc.id) && !isISODoc;

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="문서 작성" accentColor={color} />

      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-6) var(--margin) var(--s-16)" }}
      >
        {/* ── 압축 헤더 ──────────────────────────────────────── */}
        <div
          className="rounded-[var(--r-xl)]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "var(--s-5) var(--s-6)",
            marginBottom: "var(--s-5)",
          }}
        >
          {/* 브레드크럼 */}
          <div className="flex flex-wrap items-center gap-1.5" style={{ marginBottom: "var(--s-3)" }}>
            <Link to="/" className="text-text-subtle hover:text-text" style={{ fontSize: "var(--t-xs)" }}>인증 허브</Link>
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>/</span>
            <Link to={journeyPath} className="text-text-subtle hover:text-text" style={{ fontSize: "var(--t-xs)" }}>{journeyLabel} 여정</Link>
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>/</span>
            <Link
              to={`${journeyPath}/station/${station.id}`}
              className="inline-flex items-center gap-1 font-semibold"
              style={{ color, fontSize: "var(--t-xs)" }}
            >
              <Icon size={12} aria-hidden />
              정거장 {station.id}
            </Link>
          </div>

          {/* 제목 행 */}
          <div className="flex flex-wrap items-start gap-3" style={{ marginBottom: "var(--s-3)" }}>
            <div className="flex-1 min-w-0">
              {/* 인증 배지 */}
              <div className="flex flex-wrap gap-1.5" style={{ marginBottom: "var(--s-2)" }}>
                <span
                  className="inline-flex items-center rounded-full font-bold text-text-on-color"
                  style={{ background: certBadgeColor, fontSize: 11, padding: "2px 10px" }}
                >
                  {certBadgeLabel}
                </span>
                {showDualBadge && (
                  <span
                    className="inline-flex items-center rounded-full font-bold text-text-on-color"
                    style={{ background: "var(--p3)", fontSize: 11, padding: "2px 10px" }}
                  >
                    ISO 13485
                  </span>
                )}
              </div>
              <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)" }}>
                {doc.docTitle}
              </h1>
              <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-1)", maxWidth: 640, lineHeight: "var(--lh-base)" }}>
                {doc.purpose}
              </p>
            </div>
          </div>

          {/* 난이도·중요도 */}
          {doc.difficulty && doc.importance && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5" style={{ marginBottom: "var(--s-3)" }}>
              <LevelMeter kind="importance" level={doc.importance} />
              <LevelMeter kind="difficulty" level={doc.difficulty} />
            </div>
          )}

          {/* 왜 이 문서를 쓰는가 */}
          {(doc.rationale || doc.intent) && (
            <div className="flex flex-col" style={{ gap: "var(--s-2)", marginBottom: "var(--s-3)" }}>
              {doc.rationale && (
                <div className="flex gap-2 rounded-[var(--r-md)]" style={{ background: "var(--info-bg)", border: "1px solid var(--info)", padding: "var(--s-3)" }}>
                  <Lightbulb size={15} style={{ color: "var(--info)", flexShrink: 0, marginTop: 2 }} aria-hidden />
                  <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                    <span className="font-bold" style={{ color: "var(--info)" }}>왜 이 문서를 쓰는가</span>
                    {" "}{doc.rationale}
                  </p>
                </div>
              )}
              {doc.intent && (
                <div className="flex gap-2 rounded-[var(--r-md)]" style={{ background: "var(--accent-weak)", border: "1px solid var(--accent)", padding: "var(--s-3)" }}>
                  <Sparkles size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} aria-hidden />
                  <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                    <span className="font-bold" style={{ color: "var(--accent)" }}>기획 의도</span>
                    {" "}{doc.intent}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 작업 기간 */}
          {doc.effort && (
            <div style={{ marginBottom: "var(--s-3)" }}>
              <EffortTimeline effort={doc.effort} />
            </div>
          )}

          {/* 액션 바 */}
          <div className="flex flex-wrap items-center gap-2 pt-1" style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--s-3)", marginTop: "var(--s-1)" }}>
            {/* 상태 토글 */}
            <button
              type="button"
              onClick={() => setStatus(doc.id, nextStatus)}
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-semibold hover:bg-bg transition-colors"
              style={{ fontSize: "var(--t-sm)", padding: "7px 14px", borderColor: STATUS_COLOR[status], color: STATUS_COLOR[status] }}
            >
              <span aria-hidden className="inline-block rounded-full shrink-0" style={{ width: 8, height: 8, background: STATUS_COLOR[status] }} />
              {STATUS_LABEL[status]}
              <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>→ {STATUS_LABEL[nextStatus]}</span>
            </button>

            {/* D-day 뱃지 */}
            {nearestDday && (
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] font-semibold hover:bg-bg transition-colors"
                style={{ fontSize: "var(--t-sm)", padding: "7px 14px", border: `1px solid var(--border)`, color: "var(--text-muted)" }}
              >
                <CalendarDays size={14} aria-hidden />
                {nearestDday.diff === 0 ? "D-Day" : `D-${nearestDday.diff}`} · {nearestDday.label}
              </Link>
            )}

            <div className="flex-1" />

            {/* 내보내기 */}
            <CopyMdButton markdown={markdown} filename={filename} />
            <DocxExport doc={doc} />
          </div>
        </div>

        {/* ── 준비 확인 (접을 수 있음) ───────────────────────── */}
        <PrepSection doc={doc} color={color} />

        {/* ── 계산 도구 ────────────────────────────────────── */}
        {doc.calcTools && doc.calcTools.length > 0 && (
          <div style={{ marginBottom: "var(--s-5)" }}>
            <h2 className="font-bold text-text" style={{ fontSize: "var(--t-lg)", marginBottom: "var(--s-3)" }}>
              내장 계산 도구
            </h2>
            {doc.calcTools.includes("sens-spec") && <SensSpecCalc />}
            {doc.calcTools.includes("sample-size") && <SampleSizeCalc />}
            {doc.calcTools.includes("risk-matrix") && <RiskMatrixCalc />}
            {doc.calcTools.includes("lod-calc") && <LodCalc />}
          </div>
        )}

        {/* ── 2열 레이아웃: 작성 + 사이드바 ──────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">

          {/* 작성 영역 */}
          <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
            {/* 섹션 수 헤더 */}
            <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-1)" }}>
              <FileText size={16} style={{ color }} aria-hidden />
              <h2 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                문서 본문
              </h2>
              <span className="text-text-subtle" style={{ fontSize: "var(--t-sm)" }}>
                · {doc.sections.length}개 섹션
              </span>
            </div>

            {doc.sections.map((s, i) => (
              <section
                key={i}
                className="rounded-[var(--r-lg)] bg-bg overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* 섹션 헤딩 */}
                <div
                  className="flex items-center gap-3"
                  style={{
                    padding: "var(--s-3) var(--s-5)",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface)",
                  }}
                >
                  <span
                    className="shrink-0 grid place-items-center rounded-full font-extrabold text-text-on-color"
                    style={{
                      width: 26,
                      height: 26,
                      background: color,
                      fontSize: 12,
                    }}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                    {s.heading}
                  </h3>
                </div>

                {/* 인라인 에디터 */}
                <div style={{ padding: "var(--s-4) var(--s-5)" }}>
                  <InlineEditor
                    docId={doc.id}
                    sectionIdx={i}
                    originalPlaceholder={s.placeholder}
                    guidance={s.guidance}
                  />
                </div>
              </section>
            ))}
          </div>

          {/* 사이드바 (sticky) */}
          <aside
            className="flex flex-col"
            style={{ gap: "var(--s-3)", position: "sticky", top: 80, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}
          >
            {/* 문구 라이브러리 */}
            <SnippetLibrary certTypeKey={certTypeKey} />

            {/* 완료 체크리스트 */}
            <div
              className="rounded-[var(--r-md)]"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              <div
                className="flex items-center gap-2"
                style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}
              >
                <ListChecks size={15} style={{ color: "var(--success)" }} aria-hidden />
                <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>완료 체크리스트</h3>
                <span className="ml-auto text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{doc.checklist.length}개</span>
              </div>
              <ul className="flex flex-col" style={{ gap: 5, padding: "var(--s-3) var(--s-4)" }}>
                {doc.checklist.map((c, i) => (
                  <li key={i} className="flex gap-2 text-text" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
                    <span aria-hidden style={{ color: "var(--text-subtle)", flexShrink: 0 }}>☐</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 일정 패널 */}
            {scheduleEntries.length > 0 && (() => {
              const meta = CERT_META[certTypeKey];
              const today = new Date(); today.setHours(0, 0, 0, 0);
              return (
                <div
                  className="rounded-[var(--r-md)]"
                  style={{ border: `1px solid var(${meta.colorVar})`, background: `var(${meta.tintVar})` }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{ padding: "var(--s-3) var(--s-4)", borderBottom: `1px solid var(${meta.colorVar})` }}
                  >
                    <CalendarDays size={15} style={{ color: `var(${meta.colorVar})` }} aria-hidden />
                    <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>{meta.label} 일정</h3>
                    <Link to="/schedule" className="ml-auto font-semibold" style={{ fontSize: "var(--t-xs)", color: `var(${meta.colorVar})` }}>편집 →</Link>
                  </div>
                  <ul className="flex flex-col" style={{ gap: 5, padding: "var(--s-3) var(--s-4)" }}>
                    {scheduleEntries.map(({ milestone, date }) => {
                      const d = new Date(date);
                      const isPast = d < today;
                      const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
                      return (
                        <li key={milestone.key} className="flex items-start gap-2">
                          <span
                            className="shrink-0 rounded-full mt-1"
                            style={{ width: 6, height: 6, background: isPast ? "var(--text-subtle)" : `var(${meta.colorVar})`, flexShrink: 0 }}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-text truncate" style={{ fontSize: "var(--t-xs)" }}>{milestone.label}</div>
                            <div className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                              {date}
                              {!isPast && diffDays === 0 && <span className="ml-1 font-bold" style={{ color: `var(${meta.colorVar})` }}>D-Day</span>}
                              {!isPast && diffDays > 0 && <span className="ml-1 text-text-subtle">D-{diffDays}</span>}
                              {isPast && <span className="ml-1 text-text-subtle">(완료)</span>}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}

            {/* 관련 개념 */}
            {doc.relatedConceptSlugs.length > 0 && (
              <div className="rounded-[var(--r-md)]" style={{ border: "1px solid var(--border)" }}>
                <div style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                  <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>관련 개념</h3>
                </div>
                <div className="flex flex-wrap gap-1.5" style={{ padding: "var(--s-3) var(--s-4)" }}>
                  {doc.relatedConceptSlugs.map((slug) => (
                    <ConceptChip key={slug} slug={slug} />
                  ))}
                </div>
              </div>
            )}

            {/* 관련 조항 */}
            <div className="rounded-[var(--r-md)]" style={{ border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                <BookMarked size={14} style={{ color: "var(--text-muted)" }} aria-hidden />
                <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>관련 조항</h3>
              </div>
              <div className="flex flex-wrap gap-1.5" style={{ padding: "var(--s-3) var(--s-4)" }}>
                {doc.refs.map((r) => (
                  <span
                    key={r}
                    className="rounded-[var(--r-sm)] font-mono text-text-muted"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 11, padding: "3px 7px" }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* 정거장 링크 */}
            <Link
              to={`${journeyPath}/station/${station.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--r-md)] font-semibold text-text-muted hover:bg-surface transition-colors"
              style={{ fontSize: "var(--t-sm)", padding: "10px", border: "1px solid var(--border)" }}
            >
              <Compass size={15} aria-hidden />
              정거장 설명 보기
              <ArrowUpRight size={13} aria-hidden />
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
