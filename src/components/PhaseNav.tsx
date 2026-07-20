import { Link } from "react-router-dom";
import { Library, FolderTree, Home } from "lucide-react";
import { phases, type Phase, type PhaseId } from "../data/stations";

/**
 * 상단 sticky 페이즈 레일 — 현재 보고 있는 페이즈를 강조(현재 위치 신호).
 * 클릭 시 해당 밴드로 스크롤. PhaseFilter/ProgressRail 의 랜딩용 경량 버전.
 * overridePhases: IVDR 외 다른 여정(ISO 13485 등)에서 커스텀 페이즈 목록을 주입할 때 사용.
 */
export function PhaseNav({
  activePhase,
  overridePhases,
}: {
  activePhase: PhaseId | null;
  overridePhases?: Phase[];
}) {
  const displayPhases = overridePhases ?? phases;
  return (
    <nav
      aria-label="페이즈 빠른 이동"
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{
        background: "rgba(255,255,255,0.85)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="mx-auto flex items-center gap-2 overflow-x-auto"
        style={{ maxWidth: "var(--max-w)", padding: "10px var(--margin)" }}
      >
        <Link
          to="/"
          aria-label="첫 화면으로"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold text-text-muted hover:bg-surface"
          style={{ fontSize: "var(--t-sm)", padding: "5px 10px", minHeight: 32 }}
        >
          <Home size={14} aria-hidden />
          <span className="hidden sm:inline">첫 화면</span>
        </Link>
        <span aria-hidden style={{ color: "var(--border-strong)" }}>
          ·
        </span>
        <span className="shrink-0 font-extrabold text-text" style={{ fontSize: "var(--t-sm)" }}>
          {overridePhases ? "ISO 13485 여정" : "IVDR 여정"}
        </span>
        <span aria-hidden style={{ color: "var(--border-strong)" }}>
          ·
        </span>
        <ul className="flex items-center gap-1.5">
          {displayPhases.map((p) => {
            const color = `var(${p.colorVar})`;
            const active = activePhase === p.id;
            return (
              <li key={p.id}>
                <a
                  href={`#phase-${p.id}`}
                  aria-current={active ? "true" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors"
                  style={{
                    fontSize: "var(--t-sm)",
                    padding: "5px 12px",
                    minHeight: 32,
                    color: active ? "var(--text-on-color)" : "var(--text-muted)",
                    background: active ? color : "transparent",
                  }}
                >
                  <span
                    aria-hidden
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      background: active ? "var(--text-on-color)" : color,
                    }}
                  />
                  <span className="hidden sm:inline">{p.order}. {p.title}</span>
                  <span className="sm:hidden">{p.order}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            to="/documents"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold text-text-muted hover:bg-surface"
            style={{ fontSize: "var(--t-sm)", padding: "5px 12px", minHeight: 32, borderColor: "var(--border-strong)" }}
          >
            <FolderTree size={14} style={{ color: "var(--accent)" }} aria-hidden />
            <span className="hidden sm:inline">문서 목록</span>
            <span className="sm:hidden">문서</span>
          </Link>
          <Link
            to="/wiki"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold text-text-muted hover:bg-surface"
            style={{ fontSize: "var(--t-sm)", padding: "5px 12px", minHeight: 32, borderColor: "var(--border-strong)" }}
          >
            <Library size={14} style={{ color: "var(--info)" }} aria-hidden />
            <span className="hidden sm:inline">개념 위키</span>
            <span className="sm:hidden">위키</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
