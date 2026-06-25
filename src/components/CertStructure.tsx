import { Fragment } from "react";
import { Layers, MapPin, FileText, Repeat2, CalendarClock, ArrowRight } from "lucide-react";
import { phases, stations, transitions } from "../data/stations";
import { allLeaves, leavesForStation } from "../data/docTree";
import { sharedDocIds } from "../data/schemes";

const shortLabel = (title: string) => title.split("—")[0].split("(")[0].trim();

/** IVDR 인증의 전체 구조 — 한 장 인포그래픽(통계 · 5페이즈 흐름 · 핵심 기한). */
export function CertStructure({ onOpen }: { onOpen: (id: number) => void }) {
  const totalDocs = allLeaves().length;
  const shared = sharedDocIds().length;

  const stats = [
    { n: phases.length, label: "페이즈", Icon: Layers, color: "--p1" },
    { n: stations.length, label: "정거장", Icon: MapPin, color: "--p3" },
    { n: totalDocs, label: "문서", Icon: FileText, color: "--p4" },
    { n: shared, label: "공통 재사용", Icon: Repeat2, color: "--p5" },
  ];

  const phaseStations = (pid: string) => stations.filter((s) => s.phase === pid);
  const phaseDocCount = (pid: string) =>
    phaseStations(pid).reduce((a, s) => a + leavesForStation(s.id).length, 0);

  return (
    <section
      aria-label="IVDR 인증의 전체 구조"
      className="rounded-[var(--r-lg)] border"
      style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-6)" }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-1)" }}>
        <span className="inline-flex items-center gap-1.5 rounded-full font-extrabold text-text-on-color" style={{ background: "var(--accent)", fontSize: "var(--t-xs)", padding: "4px 12px" }}>
          전체 구조
        </span>
      </div>
      <h2 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)" }}>
        IVDR 인증의 전체 구조
      </h2>
      <p className="text-text-muted" style={{ fontSize: "var(--t-base)", marginTop: 4, maxWidth: 720 }}>
        5개 페이즈 · 11개 정거장으로 진행하며, 단계마다 문서를 만든다. 아래는 인증 전체를 한 장에 담은 지도입니다.
      </p>

      {/* 통계 */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginTop: "var(--s-5)" }}>
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-[var(--r-md)] bg-bg" style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", padding: "var(--s-4)" }}>
            <span className="grid shrink-0 place-items-center rounded-[var(--r-md)]" style={{ width: 44, height: 44, background: `var(${s.color}-tint)` }}>
              <s.Icon size={22} style={{ color: `var(${s.color})` }} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: 1 }}>{s.n}</div>
              <div className="font-semibold text-text-muted" style={{ fontSize: "var(--t-xs)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 5 페이즈 흐름 */}
      <div className="flex flex-col lg:flex-row lg:items-stretch" style={{ gap: 6, marginTop: "var(--s-6)" }}>
        {phases.map((p, i) => {
          const color = `var(${p.colorVar})`;
          const tint = `var(${p.tintVar})`;
          const sts = phaseStations(p.id);
          return (
            <Fragment key={p.id}>
              <div className="flex-1 rounded-[var(--r-md)]" style={{ background: tint, borderTop: `4px solid ${color}`, padding: "var(--s-4)" }}>
                <div className="flex items-center gap-2">
                  <span className="grid shrink-0 place-items-center rounded-full text-text-on-color font-extrabold" style={{ width: 28, height: 28, background: color, fontSize: "var(--t-sm)" }}>{p.order}</span>
                  <span className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>{p.title}</span>
                </div>
                <div className="flex flex-wrap gap-1.5" style={{ marginTop: "var(--s-3)" }}>
                  {sts.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onOpen(s.id)}
                      className="inline-flex items-center gap-1 rounded-[var(--r-full)] bg-bg font-semibold text-text hover:bg-surface"
                      style={{ border: "1px solid var(--border)", fontSize: "var(--t-xs)", padding: "3px 9px" }}
                    >
                      <span className="grid place-items-center rounded-full text-text-on-color font-bold" style={{ width: 15, height: 15, background: color, fontSize: 9 }}>{s.id}</span>
                      {shortLabel(s.title)}
                    </button>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1 rounded-full font-bold" style={{ background: color, color: "var(--text-on-color)", fontSize: "var(--t-xs)", padding: "2px 9px", marginTop: "var(--s-3)" }}>
                  <FileText size={12} aria-hidden /> 문서 {phaseDocCount(p.id)}개
                </div>
              </div>
              {i < phases.length - 1 && (
                <div className="flex items-center justify-center" style={{ color: "var(--text-subtle)" }}>
                  <ArrowRight className="rotate-90 lg:rotate-0" size={18} aria-hidden />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* 핵심 기한 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--r-md)]" style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "var(--s-3) var(--s-4)", marginTop: "var(--s-6)" }}>
        <span className="inline-flex items-center gap-1.5 font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
          <CalendarClock size={16} style={{ color: "var(--text-muted)" }} aria-hidden /> 핵심 기한
        </span>
        {transitions.map((t) => (
          <span key={t.cls} className="inline-flex items-center gap-1.5" style={{ fontSize: "var(--t-xs)" }}>
            <span className="font-bold text-text">{t.cls}</span>
            <span className="font-mono font-bold" style={{ color: "var(--warning)" }}>{t.deadline}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5" style={{ fontSize: "var(--t-xs)" }}>
          <span className="font-bold text-text">EUDAMED 의무화</span>
          <span className="font-mono font-bold" style={{ color: "var(--warning)" }}>2026.5.28</span>
        </span>
      </div>
    </section>
  );
}
