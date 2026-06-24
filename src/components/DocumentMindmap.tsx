import { Link } from "react-router-dom";
import { FolderTree, FolderOpen } from "lucide-react";
import { docTree, docTreeStats } from "../data/docTree";

/** 가로 연결선(엘보) — 스파인에서 노드 세로 중앙으로. */
function Tick({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="absolute"
      style={{
        left: -24,
        top: "50%",
        transform: "translateY(-50%)",
        width: 24,
        height: 0,
        borderTop: `2px solid ${color}`,
      }}
    />
  );
}

/**
 * 전체 문서 구조를 한 장의 가로형 마인드맵으로.
 * 루트 → 그룹 가지(색) → 문서 잎. 잎 클릭 시 작성 페이지로.
 */
export function DocumentMindmap() {
  const stats = docTreeStats();

  return (
    <div style={{ overflowX: "auto", paddingBottom: "var(--s-4)" }}>
      <div className="flex items-center" style={{ gap: 0, minWidth: 760, width: "max-content" }}>
        {/* 루트 */}
        <div
          className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-extrabold text-text-on-color"
          style={{ background: "var(--accent)", padding: "12px 18px", fontSize: "var(--t-base)" }}
        >
          <FolderTree size={20} aria-hidden />
          <span className="whitespace-nowrap">
            IVDR
            <br />제출 문서
          </span>
          <span
            className="rounded-full"
            style={{ background: "rgba(255,255,255,0.22)", fontSize: "var(--t-xs)", padding: "1px 8px" }}
          >
            {stats.total}
          </span>
        </div>

        {/* 그룹 스파인 */}
        <div
          className="relative flex flex-col"
          style={{
            marginLeft: 24,
            paddingLeft: 24,
            borderLeft: "2px solid var(--border-strong)",
            gap: "var(--s-3)",
          }}
        >
          {docTree.map((group) => {
            const gColor = `var(${group.colorVar})`;
            const gTint = `var(${group.colorVar}-tint)`;
            return (
              <div key={group.id} className="relative flex items-center">
                <Tick color="var(--border-strong)" />

                {/* 그룹 노드 */}
                <div
                  className="inline-flex shrink-0 items-center gap-2 rounded-[var(--r-md)] font-bold text-text"
                  style={{ background: gTint, borderLeft: `4px solid ${gColor}`, padding: "8px 12px", minWidth: 150 }}
                >
                  <FolderOpen size={15} style={{ color: gColor }} aria-hidden />
                  <span className="whitespace-nowrap" style={{ fontSize: "var(--t-sm)" }}>
                    {group.title}
                  </span>
                  <span
                    className="rounded-full font-bold text-text-on-color"
                    style={{ background: gColor, fontSize: 10, padding: "0px 7px" }}
                  >
                    {group.items.length}
                  </span>
                </div>

                {/* 잎 스파인 */}
                <div
                  className="relative flex flex-col"
                  style={{ marginLeft: 24, paddingLeft: 24, borderLeft: `2px solid ${gColor}`, gap: 6 }}
                >
                  {group.items.map((leaf) => (
                    <div key={leaf.id} className="relative">
                      <Tick color={gColor} />
                      <Link
                        to={`/doc/${leaf.id}`}
                        className="inline-flex items-center gap-2 rounded-[var(--r-full)] border bg-bg transition-colors hover:bg-surface"
                        style={{ borderColor: "var(--border)", padding: "5px 12px" }}
                      >
                        <span
                          aria-hidden
                          className="inline-block shrink-0 rounded-full"
                          style={{ width: 8, height: 8, background: gColor }}
                        />
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
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
