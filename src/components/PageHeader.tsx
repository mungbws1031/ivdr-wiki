import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Map } from "lucide-react";

/** 전체 페이지 공용 헤더 — 지도로 돌아가기 + 브레드크럼. */
export function PageHeader({
  crumb,
  accentColor,
}: {
  crumb: string; // 현재 위치 (예: "문서 작성" / "개념 위키")
  accentColor?: string; // 페이즈/카테고리 색 (선택)
}) {
  // 자동작성 흐름 안에서는 흐름의 처음(제품 기획)으로, 기획 화면에서는 인증 홈으로 돌아간다 (U-9)
  const { pathname } = useLocation();
  const back = pathname === "/auto/start" ? { to: "/", label: "인증 홈" } : pathname.startsWith("/auto") ? { to: "/auto/start", label: "제품 기획(처음)" } : { to: "/", label: "인증 홈" };
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{ background: "rgba(255,255,255,0.88)", borderColor: "var(--border)" }}
    >
      <div
        className="mx-auto flex items-center gap-3"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-3) var(--margin)" }}
      >
        <Link
          to={back.to}
          className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] font-semibold text-text-muted hover:bg-surface"
          style={{ fontSize: "var(--t-sm)", padding: "6px 10px", minHeight: 36 }}
        >
          <ArrowLeft size={16} aria-hidden />
          {back.label}
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
