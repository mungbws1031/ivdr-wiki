import { RefreshCw } from "lucide-react";
import type { DocImpact } from "../lib/impact";
import { diffValues } from "../lib/impact";
import { TOKEN_LABEL } from "../lib/tokens";

/** 변경 영향 — 마지막 검토 이후 바뀐 스펙·결과 값과, 다시 봐야 할 섹션 */
export function ImpactPanel({ impact, since, onReviewed }: { impact: DocImpact; since: string; onReviewed: () => void }) {
  if (!impact.changes.length) return null;
  const strong = impact.review > 0;
  const color = strong ? "var(--danger)" : "var(--info)";
  return (
    <section className="rounded-[var(--r-md)]" style={{ padding: "12px 14px", background: strong ? "var(--danger-bg, color-mix(in srgb, var(--danger) 8%, var(--bg)))" : "var(--info-bg)", border: `1.5px solid ${color}` }} aria-label="변경 영향">
      <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
        <span className="font-extrabold" style={{ fontSize: "var(--t-sm)", color }}>
          {strong ? `재검토 필요 — 직접 쓴 섹션 ${impact.review}개` : "검토 이후 값이 바뀌었습니다"}
        </span>
        <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>마지막 검토 {new Date(since).toLocaleString("ko-KR")}</span>
        <button type="button" onClick={onReviewed} className="ml-auto inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "5px 12px", fontSize: "var(--t-xs)", background: color, color: "var(--text-on-color)" }}>
          <RefreshCw size={13} aria-hidden /> 확인했어요 (지금 값으로 기준 갱신)
        </button>
      </div>
      <ul className="flex flex-col" style={{ gap: 3, marginTop: 8, fontSize: "var(--t-xs)" }}>
        {impact.changes.map((c) => {
          const [b, a] = diffValues(c.before, c.after);
          return (
            <li key={c.key} className="text-text">
              <b>{TOKEN_LABEL[c.key] ?? c.key}</b>: <span className="text-text-subtle line-through">{b}</span> → <span className="font-semibold">{a}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 6 }}>
        영향받는 섹션: {impact.sections.map((s) => `${s.index + 1}. ${s.heading.replace(/^\d+\.\s*/, "")}${s.drafted ? " (직접 쓴 글 — 재검토)" : " (자동 반영됨)"}`).join(", ")}
      </p>
    </section>
  );
}
