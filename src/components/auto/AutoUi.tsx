import { Link } from "react-router-dom";
import { fieldByPath } from "../../data/spec/fields";
import type { ApplStatus } from "../../lib/rules/applicability";

/** 자동작성 화면 공용 — 판정 상태 칩과 스펙 입력칸 링크. */
export const STATUS_META: Record<ApplStatus, { label: string; fg: string; bg: string }> = {
  required: { label: "필수", fg: "var(--text-on-color)", bg: "var(--text)" },
  recommended: { label: "권장", fg: "var(--info)", bg: "var(--info-bg)" },
  optional: { label: "선택", fg: "var(--text-muted)", bg: "var(--surface-2)" },
  excluded: { label: "불필요", fg: "var(--text-subtle)", bg: "var(--surface)" },
  unknown: { label: "확인 필요", fg: "var(--warning)", bg: "var(--warning-bg)" },
};

export function Chip({ s }: { s: ApplStatus }) {
  const m = STATUS_META[s];
  return (
    <span className="inline-flex items-center rounded-full font-bold shrink-0" style={{ fontSize: "var(--t-xs)", padding: "2px 10px", color: m.fg, background: m.bg }}>
      {m.label}
    </span>
  );
}

/** 운송 필드는 /auto/transport, 나머지는 /auto 의 해당 입력칸으로. */
export const fieldHref = (path: string) => `${path.startsWith("transport.") ? "/auto/transport" : "/auto"}#field-${path}`;

export function FieldLink({ path }: { path: string }) {
  const f = fieldByPath(path);
  return (
    <Link to={fieldHref(path)} className="font-semibold underline decoration-dotted underline-offset-2" style={{ color: "var(--info)" }}>
      {f?.label ?? path}
    </Link>
  );
}
