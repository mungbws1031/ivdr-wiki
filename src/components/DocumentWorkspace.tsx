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
import { hasDraft } from "../hooks/useDraftStore";

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
      style={{ border: "1px solid var(--border)" }}
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

// ── 처음 작성자 온보딩 가이드 ──────────────────────────────────
const GUIDE_KEY = "ivdr-first-guide-dismissed";

function FirstTimeGuide({ color }: { color: string }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(GUIDE_KEY) === "1"; } catch { return false; }
  });
  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(GUIDE_KEY, "1"); } catch {}
  }

  return (
    <div
      className="rounded-[var(--r-lg)] overflow-hidden"
      style={{ border: `1.5px solid ${color}`, marginBottom: "var(--s-4)" }}
    >
      <div
        className="flex items-center gap-3"
        style={{ background: "color-mix(in srgb, " + color + " 10%, transparent)", padding: "var(--s-3) var(--s-4)", borderBottom: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}
      >
        <Sparkles size={16} style={{ color, flexShrink: 0 }} aria-hidden />
        <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
          처음 쓰시나요? 3단계로 쉽게 작성할 수 있어요
        </span>
        <button
          onClick={dismiss}
          className="ml-auto text-text-subtle hover:text-text"
          style={{ fontSize: "var(--t-xs)", padding: "2px 6px", lineHeight: 1 }}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--s-3)", padding: "var(--s-4)" }}
      >
        {([
          { n: "1", title: "안내 읽기", desc: "각 섹션 상단 파란 박스에서 무엇을 써야 하는지 확인하세요" },
          { n: "2", title: "템플릿 편집", desc: "미리 채워진 내용을 우리 기기에 맞게 수정·보완하세요. 자동 저장돼요" },
          { n: "3", title: "완성 & 내보내기", desc: "우측 체크리스트를 모두 확인하면 MD 복사 또는 Word 내보내기로 완성하세요" },
        ] as const).map(({ n, title, desc }) => (
          <div key={n} className="flex gap-3 items-start">
            <span
              className="shrink-0 grid place-items-center rounded-full font-extrabold text-text-on-color"
              style={{ width: 26, height: 26, background: color, fontSize: 12 }}
              aria-hidden
            >
              {n}
            </span>
            <div>
              <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 2 }}>{title}</p>
              <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 문서 정보 패널 (사이드바용, 접을 수 있음) ──────────────────
function DocInfoPanel({ doc, color }: { doc: ReturnType<typeof resolveDoc> & object; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[var(--r-md)] overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left"
        style={{ padding: "var(--s-3) var(--s-4)" }}
      >
        <Lightbulb size={14} style={{ color }} aria-hidden />
        <span className="font-bold text-text flex-1" style={{ fontSize: "var(--t-sm)" }}>문서 정보</span>
        {open ? <ChevronDown size={15} aria-hidden /> : <ChevronRight size={15} aria-hidden />}
      </button>
      {open && (
        <div className="flex flex-col" style={{ gap: "var(--s-2)", padding: "0 var(--s-4) var(--s-4)", borderTop: "1px solid var(--border)" }}>
          {(doc.difficulty || doc.importance) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3">
              {doc.importance && <LevelMeter kind="importance" level={doc.importance} />}
              {doc.difficulty && <LevelMeter kind="difficulty" level={doc.difficulty} />}
            </div>
          )}
          {doc.rationale && (
            <div className="flex gap-2 rounded-[var(--r-sm)]" style={{ background: "var(--info-bg)", border: "1px solid var(--info)", padding: "var(--s-2) var(--s-3)", marginTop: "var(--s-2)" }}>
              <Lightbulb size={13} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} aria-hidden />
              <p className="text-text" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
                <span className="font-bold" style={{ color: "var(--info)" }}>왜 쓰는가</span> {doc.rationale}
              </p>
            </div>
          )}
          {doc.intent && (
            <div className="flex gap-2 rounded-[var(--r-sm)]" style={{ background: "var(--accent-weak)", border: "1px solid var(--accent)", padding: "var(--s-2) var(--s-3)" }}>
              <Sparkles size={13} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} aria-hidden />
              <p className="text-text" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
                <span className="font-bold" style={{ color: "var(--accent)" }}>기획 의도</span> {doc.intent}
              </p>
            </div>
          )}
          {doc.effort && <div style={{ marginTop: "var(--s-1)" }}><EffortTimeline effort={doc.effort} /></div>}
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
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-4) var(--margin) var(--s-16)" }}
      >
        {/* ── 미니 헤더: 1-2줄만 쓰고 바로 글쓰기 ─────────────── */}
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2" style={{ marginBottom: "var(--s-4)" }}>
          {/* 왼쪽: 배지 + 브레드크럼 + 제목 + 목적 */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5" style={{ marginBottom: "var(--s-1)" }}>
              <span
                className="inline-flex items-center rounded-full font-bold text-text-on-color"
                style={{ background: certBadgeColor, fontSize: 11, padding: "2px 9px" }}
              >
                {certBadgeLabel}
              </span>
              {showDualBadge && (
                <span
                  className="inline-flex items-center rounded-full font-bold text-text-on-color"
                  style={{ background: "var(--p3)", fontSize: 11, padding: "2px 9px" }}
                >
                  ISO 13485
                </span>
              )}
              <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }} aria-hidden>·</span>
              <Link to="/" className="text-text-subtle hover:text-text" style={{ fontSize: "var(--t-xs)" }}>인증 허브</Link>
              <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>/</span>
              <Link to={journeyPath} className="text-text-subtle hover:text-text" style={{ fontSize: "var(--t-xs)" }}>{journeyLabel}</Link>
              <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>/</span>
              <Link
                to={`${journeyPath}/station/${station.id}`}
                className="inline-flex items-center gap-1 font-semibold"
                style={{ color, fontSize: "var(--t-xs)" }}
              >
                <Icon size={11} aria-hidden />
                정거장 {station.id}
              </Link>
            </div>
            <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)" }}>
              {doc.docTitle}
            </h1>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", marginTop: 2, maxWidth: 560 }}>
              {doc.purpose}
            </p>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex flex-wrap items-center gap-2 shrink-0" style={{ paddingTop: "var(--s-1)" }}>
            <button
              type="button"
              onClick={() => setStatus(doc.id, nextStatus)}
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-semibold hover:bg-surface transition-colors"
              style={{ fontSize: "var(--t-sm)", padding: "6px 12px", borderColor: STATUS_COLOR[status], color: STATUS_COLOR[status] }}
            >
              <span aria-hidden className="inline-block rounded-full shrink-0" style={{ width: 7, height: 7, background: STATUS_COLOR[status] }} />
              {STATUS_LABEL[status]}
            </button>
            {nearestDday && (
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-semibold hover:bg-surface transition-colors"
                style={{ fontSize: "var(--t-xs)", padding: "6px 10px", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <CalendarDays size={13} aria-hidden />
                {nearestDday.diff === 0 ? "D-Day" : `D-${nearestDday.diff}`}
              </Link>
            )}
            <CopyMdButton markdown={markdown} filename={filename} />
            <DocxExport doc={doc} />
          </div>
        </div>

        {/* ── 2열 레이아웃: 작성(좌) + 사이드바(우) ──────────── */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] items-start">

          {/* 작성 영역 — 바로 시작 */}
          <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>

            {/* 계산 도구 (해당 있을 때만) */}
            {doc.calcTools && doc.calcTools.length > 0 && (
              <div style={{ marginBottom: "var(--s-2)" }}>
                <h2 className="font-bold text-text" style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-3)" }}>내장 계산 도구</h2>
                {doc.calcTools.includes("sens-spec") && <SensSpecCalc />}
                {doc.calcTools.includes("sample-size") && <SampleSizeCalc />}
                {doc.calcTools.includes("risk-matrix") && <RiskMatrixCalc />}
                {doc.calcTools.includes("lod-calc") && <LodCalc />}
              </div>
            )}

            {/* 온보딩 가이드 (처음 작성자용, 한 번만 표시) */}
            <FirstTimeGuide color={color} />

            {/* 섹션 카드들 */}
            {doc.sections.map((s, i) => {
              const sectionWritten = hasDraft(doc.id, i);
              return (
                <section
                  key={i}
                  className="rounded-[var(--r-lg)] bg-bg overflow-hidden"
                  style={{ border: `1.5px solid ${sectionWritten ? "var(--success)" : "var(--border)"}` }}
                >
                  <div
                    className="flex items-center gap-3"
                    style={{
                      padding: "var(--s-3) var(--s-4)",
                      borderBottom: `1px solid ${sectionWritten ? "color-mix(in srgb, var(--success) 25%, transparent)" : "var(--border)"}`,
                      background: sectionWritten ? "color-mix(in srgb, var(--success) 6%, var(--surface))" : "var(--surface)",
                    }}
                  >
                    <span
                      className="shrink-0 grid place-items-center rounded-full font-extrabold text-text-on-color"
                      style={{ width: 24, height: 24, background: sectionWritten ? "var(--success)" : color, fontSize: 11 }}
                      aria-hidden
                    >
                      {sectionWritten ? "✓" : i + 1}
                    </span>
                    <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>{s.heading}</h3>
                    {sectionWritten && (
                      <span className="ml-auto font-semibold" style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>
                        작성됨
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "var(--s-4)" }}>
                    <InlineEditor
                      docId={doc.id}
                      sectionIdx={i}
                      originalPlaceholder={s.placeholder}
                      guidance={s.guidance}
                    />
                  </div>
                </section>
              );
            })}

            {/* 작성 전 준비 확인 — 글쓰기 아래로 이동 */}
            <PrepSection doc={doc} color={color} />
          </div>

          {/* 사이드바 (sticky) */}
          <aside
            className="flex flex-col"
            style={{ gap: "var(--s-3)", position: "sticky", top: 72, maxHeight: "calc(100vh - 88px)", overflowY: "auto" }}
          >
            {/* 문서 정보 (접을 수 있음) */}
            {(doc.rationale || doc.intent || doc.effort || doc.difficulty) && (
              <DocInfoPanel doc={doc} color={color} />
            )}

            {/* 문구 라이브러리 */}
            <SnippetLibrary certTypeKey={certTypeKey} />

            {/* 완료 체크리스트 */}
            <div className="rounded-[var(--r-md)]" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--border)" }}>
                <ListChecks size={15} style={{ color: "var(--success)" }} aria-hidden />
                <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>완료 체크리스트</h3>
                <span className="ml-auto text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{doc.checklist.length}개</span>
              </div>
              <ul className="flex flex-col" style={{ gap: 4, padding: "var(--s-3) var(--s-4)" }}>
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
                <div className="rounded-[var(--r-md)]" style={{ border: `1px solid var(${meta.colorVar})`, background: `var(${meta.tintVar})` }}>
                  <div className="flex items-center gap-2" style={{ padding: "var(--s-3) var(--s-4)", borderBottom: `1px solid var(${meta.colorVar})` }}>
                    <CalendarDays size={15} style={{ color: `var(${meta.colorVar})` }} aria-hidden />
                    <h3 className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>{meta.label} 일정</h3>
                    <Link to="/schedule" className="ml-auto font-semibold" style={{ fontSize: "var(--t-xs)", color: `var(${meta.colorVar})` }}>편집 →</Link>
                  </div>
                  <ul className="flex flex-col" style={{ gap: 4, padding: "var(--s-3) var(--s-4)" }}>
                    {scheduleEntries.map(({ milestone, date }) => {
                      const d = new Date(date);
                      const isPast = d < today;
                      const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
                      return (
                        <li key={milestone.key} className="flex items-start gap-2">
                          <span className="shrink-0 rounded-full mt-1" style={{ width: 6, height: 6, background: isPast ? "var(--text-subtle)" : `var(${meta.colorVar})` }} aria-hidden />
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
                  <span key={r} className="rounded-[var(--r-sm)] font-mono text-text-muted" style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 11, padding: "3px 7px" }}>
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
