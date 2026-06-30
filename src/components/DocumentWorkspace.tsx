import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ListChecks,
  ArrowUpRight,
  Compass,
  Lightbulb,
  Sparkles,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Calculator,
} from "lucide-react";
import { loadSchedule, getScheduleForCert, CERT_META } from "../data/projectSchedule";
import { resolveDoc, toMarkdown } from "../data/documents";
import { isISO13485Doc } from "../data/schemes";
import { useProgress, STATUS_LABEL, STATUS_NEXT, STATUS_COLOR } from "../data/progress";
import { stations, phaseById, type Station } from "../data/stations";
import { iso13485Stations } from "../data/iso13485/stations";
import { ivddStations } from "../data/ivdd/stations";
import { mdsapStations } from "../data/mdsap/stations";

function adaptISO13485Station(s: typeof iso13485Stations[0]): Station {
  return { ...s, phase: s.phase as any };
}
import { getIcon } from "../lib/icons";
import { PageHeader } from "./PageHeader";
import { DocxExport } from "./DocxExport";
import { LevelMeter } from "./LevelMeter";
import { EffortTimeline } from "./EffortTimeline";
import { SensSpecCalc } from "./calcs/SensSpecCalc";
import { SampleSizeCalc } from "./calcs/SampleSizeCalc";
import { RiskMatrixCalc } from "./calcs/RiskMatrixCalc";
import { LodCalc } from "./calcs/LodCalc";
import { InlineEditor } from "./InlineEditor";
import { SnippetLibrary } from "./SnippetLibrary";
import { WritingKit } from "./WritingKit";
import { hasDraft } from "../hooks/useDraftStore";
import type { CalcToolType } from "../data/documents";

// 내장 계산기 한글 라벨 (헤더 배지·계산 영역에서 공용)
const CALC_LABEL: Record<CalcToolType, string> = {
  "sens-spec": "민감도·특이도",
  "sample-size": "검체수 산출",
  "lod-calc": "검출한계(LoD)",
  "risk-matrix": "위험 매트릭스",
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

            {/* 계산 필요 — 계산기를 개별 칩으로 가지런히 배열 (클릭 시 계산 영역으로 스크롤) */}
            {doc.calcTools && doc.calcTools.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5" style={{ marginTop: "var(--s-3)" }}>
                <span
                  className="inline-flex items-center gap-1 rounded-full font-bold text-text-on-color"
                  style={{ background: "var(--warning)", fontSize: 11, padding: "3px 10px" }}
                >
                  <Calculator size={12} aria-hidden />
                  계산 필요
                </span>
                {doc.calcTools.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => document.getElementById("calc-tools")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    title={`${CALC_LABEL[t]} 계산기로 이동`}
                    className="inline-flex items-center rounded-full font-semibold transition-[filter] hover:brightness-95"
                    style={{ background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning)", fontSize: 11, padding: "3px 10px" }}
                  >
                    {CALC_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
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

            {/* 문서 작성 패키지 — 가장 먼저 반갑게 맞이 (가이드·소스·지침서·참고문서) */}
            <WritingKit doc={doc} color={color} />

            {/* 계산 도구 (해당 있을 때만) */}
            {doc.calcTools && doc.calcTools.length > 0 && (
              <div id="calc-tools" style={{ scrollMarginTop: 80 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-3)", marginTop: "var(--s-2)" }}>
                  <Calculator size={16} style={{ color: "var(--warning)" }} aria-hidden />
                  <h2 className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>내장 계산 도구</h2>
                  <span className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                    {doc.calcTools.map((t) => CALC_LABEL[t]).join(" · ")}
                  </span>
                </div>
                {doc.calcTools.includes("sens-spec") && <SensSpecCalc />}
                {doc.calcTools.includes("sample-size") && <SampleSizeCalc />}
                {doc.calcTools.includes("risk-matrix") && <RiskMatrixCalc />}
                {doc.calcTools.includes("lod-calc") && <LodCalc />}
              </div>
            )}

            {/* 템플릿 — 실제 작성 영역 */}
            <div className="flex items-center gap-2" style={{ marginTop: "var(--s-2)" }}>
              <FileText size={16} style={{ color }} aria-hidden />
              <h2 className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>여기에 작성해요</h2>
              <span className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                예시를 우리 기기에 맞게 고치기만 하면 돼요 · 자동 저장
              </span>
              <span className="ml-auto text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
                {doc.sections.length}개 섹션
              </span>
            </div>

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
