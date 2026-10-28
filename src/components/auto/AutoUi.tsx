import { Link } from "react-router-dom";
import { fieldByPath } from "../../data/spec/fields";
import type { ApplStatus } from "../../lib/rules/applicability";
import { setAssumeMode } from "../../hooks/useSpecStore";
import { TAG_META, type Assumption, type EvidenceTag } from "../../lib/evidence";

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

/** 가정 모드 안내 — 어떤 빈 칸을 무엇으로 가정했는지, 입력하러 가기, 가정 끄기. */
export function AssumptionBanner({ assumed, assumeOn }: { assumed: Assumption[]; assumeOn: boolean }) {
  if (!assumeOn) {
    return (
      <div className="flex flex-wrap items-center rounded-[var(--r-md)]" style={{ gap: 8, padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "var(--t-xs)" }}>
        <span className="text-text-muted">가정 모드 꺼짐 — 비어 있는 칸은 "확인 필요"로 멈춥니다.</span>
        <button type="button" onClick={() => setAssumeMode(true)} className="font-bold underline" style={{ color: "var(--accent)" }}>가정으로 계속 진행하기</button>
      </div>
    );
  }
  if (!assumed.length) return null;
  return (
    <div className="rounded-[var(--r-md)]" style={{ padding: "10px 14px", background: "var(--warning-bg)", border: "1px solid var(--warning)" }} role="note">
      <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
        <span className="font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--warning)" }}>가정 {assumed.length}개로 진행 중</span>
        <span className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>비어 있는 칸을 요구사항이 더 많은 쪽으로 가정했습니다. 문서에는 "(가정)"이 붙고, 가정으로 나온 클래스는 확정할 수 없습니다.</span>
        <button type="button" onClick={() => setAssumeMode(false)} className="ml-auto font-semibold underline text-text-muted" style={{ fontSize: "var(--t-xs)" }}>가정 끄기</button>
      </div>
      <ul className="flex flex-col" style={{ gap: 2, marginTop: 6 }}>
        {assumed.map((a) => (
          <li key={a.path} style={{ fontSize: "var(--t-xs)" }}>
            <Link to={fieldHref(a.path)} className="font-bold underline decoration-dotted text-text">{a.label}</Link>
            <span className="text-text-muted"> — {a.why}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 근거 태그 막대 — 입력·규칙·가정·누락 비율 */
export function EvidenceBar({ counts, height = 8 }: { counts: Record<EvidenceTag, number>; height?: number }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!total) return null;
  return (
    <span className="flex w-full rounded-full overflow-hidden" style={{ height, background: "var(--border)" }} aria-hidden>
      {(Object.keys(TAG_META) as EvidenceTag[]).map((k) => counts[k] > 0 && <span key={k} style={{ width: `${(counts[k] / total) * 100}%`, background: TAG_META[k].color }} />)}
    </span>
  );
}
