import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import { docOrder, leafById, colorForLeaf } from "../data/docTree";

/**
 * 문서 작성 순서 — 의존성을 반영한 단계별 로드맵.
 * 위→아래로 진행하며, 각 단계의 문서 칩을 누르면 작성 페이지로.
 */
export function DocumentOrder() {
  return (
    <div className="flex flex-col" style={{ gap: 0 }}>
      {docOrder.map((s, i) => {
        const last = i === docOrder.length - 1;
        return (
          <div key={s.step} className="relative flex gap-4">
            {/* 좌측 번호 + 연결선 */}
            <div className="flex flex-col items-center" style={{ width: 40 }}>
              <span
                className="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-text-on-color"
                style={{ background: "var(--accent)", width: 40, height: 40, fontSize: "var(--t-lg)" }}
              >
                {s.step}
              </span>
              {!last && (
                <span
                  aria-hidden
                  style={{ flex: 1, width: 2, background: "var(--border-strong)", marginTop: 4, marginBottom: 4, minHeight: 24 }}
                />
              )}
            </div>

            {/* 단계 카드 */}
            <div className="min-w-0 flex-1" style={{ paddingBottom: last ? 0 : "var(--s-6)" }}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
                  {s.title}
                </h3>
                <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
                  {s.docIds.length}개
                </span>
              </div>
              <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2, marginBottom: "var(--s-3)" }}>
                {s.why}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.docIds.map((id) => {
                  const leaf = leafById(id);
                  if (!leaf) return null;
                  const color = `var(${colorForLeaf(id)})`;
                  return (
                    <Link
                      key={id}
                      to={`/doc/${id}`}
                      className="inline-flex items-center gap-2 rounded-[var(--r-full)] border bg-bg transition-colors hover:bg-surface"
                      style={{ borderColor: "var(--border)", padding: "5px 12px" }}
                    >
                      <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 8, height: 8, background: color }} />
                      <span className="whitespace-nowrap font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
                        {leaf.title}
                      </span>
                      {leaf.detailed && (
                        <span
                          aria-hidden
                          title="전용 템플릿"
                          className="inline-block shrink-0 rounded-full"
                          style={{ width: 6, height: 6, background: "var(--accent)" }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
              {!last && (
                <div className="flex items-center" style={{ marginTop: "var(--s-3)", color: "var(--text-subtle)" }}>
                  <ArrowDown size={16} aria-hidden />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
