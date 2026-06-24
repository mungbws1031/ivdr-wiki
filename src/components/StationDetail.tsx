import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Compass, X, BookMarked, AlertCircle, FileText, BookOpen, ChevronRight } from "lucide-react";
import { phaseById, type Station } from "../data/stations";
import { concepts } from "../data/concepts";
import { leavesForStation, metaFor, colorForLeaf } from "../data/docTree";
import { getIcon } from "../lib/icons";
import { renderRich } from "../lib/richText";
import { StatusChip } from "./StatusChip";
import { ConceptChip } from "./ConceptChip";
import { LevelMeter } from "./LevelMeter";

/**
 * 정거장 상세 — 본문은 여기서만 (개요 오염 X).
 * 데스크톱 우측 480px drawer / 모바일 하단 풀시트. esc 닫기.
 */
export function StationDetail({
  station,
  onClose,
}: {
  station: Station | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const open = station !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // 열릴 때 패널로 포커스 이동 (키보드/스크린리더)
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, station, onClose]);

  if (!station) return null;

  const phase = phaseById(station.phase);
  const color = `var(${phase.colorVar})`;
  const Icon = getIcon(station.icon);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      {/* overlay */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(16,24,40,0.45)]"
      />

      {/* 패널: 데스크톱 우측 / 모바일 하단 풀시트 */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute bg-bg shadow-[var(--shadow-pop)] outline-none
                   inset-x-0 bottom-0 max-h-[88vh] rounded-t-[var(--r-lg)]
                   sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[480px] sm:rounded-none sm:rounded-l-[var(--r-lg)]
                   overflow-y-auto"
        style={{ animation: "ivdr-slide 180ms ease-out" }}
      >
        {/* 상단 페이즈 색 띠 */}
        <div style={{ height: 4, background: color }} aria-hidden />

        <div style={{ padding: "var(--s-6)" }}>
          {/* 헤더 */}
          <div className="flex items-start gap-3">
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-full text-text-on-color font-bold"
              style={{ background: color, width: 36, height: 36, fontSize: "var(--t-base)" }}
            >
              {station.id}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Icon size={18} style={{ color }} aria-hidden />
                <span className="font-semibold" style={{ color, fontSize: "var(--t-sm)" }}>
                  Phase {phase.order} · {phase.title}
                </span>
              </div>
              <h2
                id="detail-title"
                className="font-extrabold text-text"
                style={{ fontSize: "var(--t-xl)", lineHeight: "var(--lh-tight)", marginTop: 4 }}
              >
                {station.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="상세 닫기"
              className="grid shrink-0 place-items-center rounded-[var(--r-sm)] text-text-muted hover:bg-surface"
              style={{ width: 40, height: 40 }}
            >
              <X size={22} aria-hidden />
            </button>
          </div>

          <div style={{ marginTop: "var(--s-3)" }}>
            <StatusChip label={station.tag.label} tone={station.tag.tone} size="md" />
          </div>

          {/* 📄 이 단계에서 써야 할 문서 (전체 리스트) */}
          {(() => {
            const docsForStation = leavesForStation(station.id);
            return (
              <div
                className="mt-4 overflow-hidden rounded-[var(--r-md)]"
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2" style={{ background: "var(--surface)", padding: "10px 12px" }}>
                  <FileText size={16} style={{ color: "var(--accent)" }} aria-hidden />
                  <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
                    이 단계에서 써야 할 문서
                  </span>
                  <span
                    className="rounded-full font-bold text-text-on-color"
                    style={{ background: "var(--accent)", fontSize: "var(--t-xs)", padding: "1px 8px" }}
                  >
                    {docsForStation.length}
                  </span>
                </div>
                <ul>
                  {docsForStation.map((l) => {
                    const m = metaFor(l.id);
                    const c = `var(${colorForLeaf(l.id)})`;
                    return (
                      <li key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <Link
                          to={`/doc/${l.id}`}
                          className="flex items-center gap-2 hover:bg-surface"
                          style={{ padding: "9px 12px" }}
                        >
                          <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 8, height: 8, background: c }} />
                          <span className="min-w-0 flex-1 font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
                            {l.title}
                          </span>
                          {m && <LevelMeter kind="importance" level={m.importance} showLabel={false} />}
                          <ChevronRight size={15} style={{ color: "var(--text-subtle)" }} className="shrink-0" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}

          {/* 🧭 지금 할 일 — accent 아님, 페이즈색 카드 */}
          <div
            className="rounded-[var(--r-md)]"
            style={{
              background: `var(${phase.tintVar})`,
              borderLeft: `4px solid ${color}`,
              padding: "var(--s-4)",
              marginTop: "var(--s-6)",
            }}
          >
            <div className="flex items-center gap-2" style={{ color }}>
              <Compass size={18} strokeWidth={2.25} aria-hidden />
              <span className="font-bold" style={{ fontSize: "var(--t-sm)" }}>
                지금 할 일
              </span>
            </div>
            <p className="text-text" style={{ fontSize: "var(--t-base)", marginTop: 6, fontWeight: 600 }}>
              {station.todo}
            </p>
          </div>

          {/* 본문 */}
          <div style={{ marginTop: "var(--s-6)" }}>
            {station.body.map((p, i) => (
              <p
                key={i}
                className="text-text"
                style={{
                  fontSize: "var(--t-base)",
                  lineHeight: "var(--lh-base)",
                  marginBottom: "var(--s-4)",
                }}
              >
                {renderRich(p)}
              </p>
            ))}
          </div>

          {/* 갈림길 (St2) */}
          {station.forks && (
            <div style={{ marginTop: "var(--s-2)" }}>
              <h3 className="font-bold text-text" style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-3)" }}>
                갈림길 — 3갈래 경로
              </h3>
              <div className="flex flex-col gap-2">
                {station.forks.map((f) => (
                  <div
                    key={f.label}
                    className="rounded-[var(--r-md)] border"
                    style={{ borderColor: "var(--border)", padding: "var(--s-3)" }}
                  >
                    <div className="flex items-center gap-2">
                      <StatusChip label={f.label} tone={f.tone} />
                    </div>
                    <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 6 }}>
                      {f.desc} <span className="text-text">→ {f.route}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 비고 */}
          {station.note && (
            <div
              className="flex gap-2 rounded-[var(--r-md)]"
              style={{ background: "var(--warning-bg)", padding: "var(--s-3)", marginTop: "var(--s-4)" }}
            >
              <AlertCircle size={18} style={{ color: "var(--warning)" }} className="mt-0.5 shrink-0" aria-hidden />
              <p className="text-text" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
                {renderRich(station.note)}
              </p>
            </div>
          )}

          {/* 관련 개념 (양방향 연결) */}
          {(() => {
            const related = concepts.filter((c) => c.relatedStationIds.includes(station.id));
            if (related.length === 0) return null;
            return (
              <div style={{ marginTop: "var(--s-6)" }}>
                <div className="flex items-center gap-2 text-text-muted" style={{ marginBottom: "var(--s-2)" }}>
                  <BookOpen size={16} aria-hidden />
                  <span className="font-semibold" style={{ fontSize: "var(--t-sm)" }}>
                    관련 개념
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {related.map((c) => (
                    <ConceptChip key={c.slug} slug={c.slug} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 관련 조항 */}
          <div style={{ marginTop: "var(--s-6)" }}>
            <div className="flex items-center gap-2 text-text-muted" style={{ marginBottom: "var(--s-2)" }}>
              <BookMarked size={16} aria-hidden />
              <span className="font-semibold" style={{ fontSize: "var(--t-sm)" }}>
                관련 조항
              </span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {station.refs.map((r) => (
                <li
                  key={r}
                  className="rounded-[var(--r-sm)] font-mono text-text-muted"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    fontSize: "var(--t-xs)",
                    padding: "4px 8px",
                  }}
                >
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
