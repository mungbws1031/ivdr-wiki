import { useState } from "react";
import { Link } from "react-router-dom";
import { fieldByPath } from "../../data/spec/fields";
import type { ApplStatus } from "../../lib/rules/applicability";
import { setAssumeMode } from "../../hooks/useSpecStore";
import { TAG_META, type Assumption, type EvidenceTag } from "../../lib/evidence";
import { conceptBySlug } from "../../data/concepts";

/** 자동 생성 문서 화면 공용 안내 — 초안이며 심사 제출 전 전문가 검토가 필요하다. */
export function DraftNotice() {
  return (
    <p role="note" className="rounded-[var(--r-md)] text-text" style={{ background: "var(--warning-bg)", borderLeft: "4px solid var(--warning)", padding: "8px 12px", fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", marginTop: "var(--s-3)" }}>
      <b>초안이며 심사 제출 전 전문가 검토 필요</b> — 자동으로 채운 내용이에요. 빈칸·가정·추정이 남아 있을 수 있으니 RA 담당자가 확인한 뒤에 써 주세요.
    </p>
  );
}

/** 개념 위키 바로가기 — 위키에 없는 slug면 아무것도 그리지 않는다. */
export function WikiLink({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const c = conceptBySlug(slug);
  if (!c) return null;
  return (
    <Link to={`/wiki/${slug}`} className="inline-flex items-center font-semibold underline decoration-dotted underline-offset-2" style={{ color: "var(--info)", fontSize: "var(--t-sm)", minHeight: 40, gap: 4 }}>
      📖 {children ?? c.term} — 위키에서 보기
    </Link>
  );
}

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
export const fieldHref = (path: string) => `${path.startsWith("transport.") ? "/auto/transport" : path.startsWith("market.") ? "/auto/market" : path.startsWith("plan.") ? "/auto/start" : "/auto"}#field-${path}`;

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
        <span className="text-text-muted">가정 모드가 꺼져 있어요. 비어 있는 칸은 "확인 필요"로 두고 멈춰요.</span>
        <button type="button" onClick={() => setAssumeMode(true)} className="font-bold underline" style={{ color: "var(--accent)", minHeight: 40 }}>빈칸을 가정하고 계속하기</button>
      </div>
    );
  }
  if (!assumed.length) return null;
  return <AssumptionDetails assumed={assumed} />;
}

const OPEN_KEY = "ivdr-ui-assume-open";
const readOpen = () => { try { return localStorage.getItem(OPEN_KEY) === "1"; } catch { return false; } };

/** 기본은 한 줄 — 펼치면 가정 목록(입력칸 링크·이유). 펼침 상태는 기억한다. */
function AssumptionDetails({ assumed }: { assumed: Assumption[] }) {
  const [open, setOpen] = useState(readOpen);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(OPEN_KEY, next ? "1" : "0"); } catch { /* 저장 불가 — 이번 화면에서만 */ }
  };
  return (
    <div className="rounded-[var(--r-md)]" style={{ padding: "6px 12px", background: "var(--warning-bg)", border: "1px solid var(--warning)" }} role="note">
      <div className="flex flex-wrap items-center" style={{ gap: 8, minHeight: 40 }}>
        <span className="font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--warning)" }}>빈칸 {assumed.length}개를 가정하고 진행 중이에요</span>
        <button type="button" onClick={toggle} aria-expanded={open} className="font-semibold underline" style={{ fontSize: "var(--t-xs)", color: "var(--text)", minHeight: 40, padding: "0 6px" }}>
          {open ? "접기 ▴" : "자세히 ▾"}
        </button>
        <button type="button" onClick={() => setAssumeMode(false)} className="ml-auto font-semibold underline text-text-muted" style={{ fontSize: "var(--t-xs)", minHeight: 40, padding: "0 6px" }}>가정 끄기</button>
      </div>
      {open && (
        <>
          <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 4 }}>비어 있는 칸은 더 엄격한 쪽(요구사항이 더 많은 쪽)으로 가정했어요. 문서에는 "(가정)"이 붙어요. 가정으로 나온 등급은 확정할 수 없어요.</p>
          <ul className="flex flex-col" style={{ gap: 2, marginTop: 6 }}>
            {assumed.map((a) => (
              <li key={a.path} style={{ fontSize: "var(--t-xs)" }}>
                <Link to={fieldHref(a.path)} className="inline-flex items-center font-bold underline decoration-dotted text-text" style={{ minHeight: 40 }}>{a.label}</Link>
                <span className="text-text-muted"> — {a.why}</span>
              </li>
            ))}
          </ul>
        </>
      )}
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
