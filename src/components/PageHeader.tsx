import { Link } from "react-router-dom";
import { ArrowLeft, Map } from "lucide-react";

/** 전체 페이지 공용 헤더 — 지도로 돌아가기 + 브레드크럼. */
export function PageHeader({
  crumb,
  accentColor,
}: {
  crumb: string; // 현재 위치 (예: "문서 작성" / "개념 위키")
  accentColor?: string; // 페이즈/카테고리 색 (선택)
}) {
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{ background: "rgba(255,255,255,0.88)", borderColor: "var(--border)" }}
    >
      <div
        className="mx-auto flex items-center gap-3"
        style={{ maxWidth: "var(--max-w)", padding: "10px var(--margin)" }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] font-semibold text-text-muted hover:bg-surface"
          style={{ fontSize: "var(--t-sm)", padding: "6px 10px", minHeight: 36 }}
        >
          <ArrowLeft size={16} aria-hidden />
          여정 지도
        </Link>
        <span aria-hidden style={{ color: "var(--border-strong)" }}>
          /
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
          <Map size={15} style={{ color: accentColor ?? "var(--text-muted)" }} aria-hidden />
          {crumb}
        </span>
      </div>
    </header>
  );
}
