import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useSpec } from "../hooks/useSpecStore";
import { REGION_LABEL, REGION_ORDER, reuseVenn, type VennRegion } from "../lib/reuseVenn";

const COLOR = { E: "var(--p2)", K: "var(--p3)", U: "var(--p4)" } as const;

/** 영역 글자 위치 (viewBox 720×690) */
const POS: Record<VennRegion, { x: number; y: number }> = {
  EKU: { x: 360, y: 340 },
  EK: { x: 360, y: 190 },
  EU: { x: 238, y: 432 },
  KU: { x: 482, y: 432 },
  E: { x: 180, y: 240 },
  K: { x: 540, y: 240 },
  U: { x: 360, y: 560 },
};

const regionColor = (r: VennRegion) => (r.length === 1 ? COLOR[r as "E" | "K" | "U"] : r === "EKU" ? "var(--accent)" : "var(--text)");

/** 나라별(EU·한국·미국) 공통 재사용 문서 벤다이어그램 — 현재 제품 정보 기준. */
export function ReuseVenn() {
  const spec = useSpec();
  const v = useMemo(() => reuseVenn(spec), [spec]);
  const n = (r: VennRegion) => v.regions[r].length;

  return (
    <section style={{ marginTop: "var(--s-6)" }} aria-labelledby="reuse-venn-title">
      <h2 id="reuse-venn-title" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>나라별 공통 재사용 문서</h2>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4, maxWidth: 760, lineHeight: "var(--lh-base)" }}>
        한 번 만든 IVDR 문서를 한국·미국 제출 자료에 다시 쓸 수 있어요. 겹치는 칸이 많을수록 일이 줄어요.
        칸을 누르면 아래 목록으로 가요.
      </p>

      <div style={{ maxWidth: 560, margin: "var(--s-4) auto 0" }}>
        <svg viewBox="0 0 720 690" role="img" aria-label={`나라별 문서 재사용 벤다이어그램 — 세 나라 공통 ${n("EKU")}개`} style={{ width: "100%", height: "auto", display: "block" }}>
          <circle cx="270" cy="270" r="200" fill={COLOR.E} fillOpacity="0.14" stroke={COLOR.E} strokeWidth="3" />
          <circle cx="450" cy="270" r="200" fill={COLOR.K} fillOpacity="0.14" stroke={COLOR.K} strokeWidth="3" />
          <circle cx="360" cy="425" r="200" fill={COLOR.U} fillOpacity="0.14" stroke={COLOR.U} strokeWidth="3" />
          <text x="40" y="38" style={{ fontSize: 30, fontWeight: 900, fill: COLOR.E }}>EU (IVDR)</text>
          <text x="680" y="38" textAnchor="end" style={{ fontSize: 30, fontWeight: 900, fill: COLOR.K }}>한국 (식약처)</text>
          <text x="360" y="676" textAnchor="middle" style={{ fontSize: 30, fontWeight: 900, fill: COLOR.U }}>미국 (FDA)</text>
          {REGION_ORDER.map((r) => (
            <a key={r} href={`#venn-${r}`} aria-label={`${REGION_LABEL[r]} ${n(r)}개 목록으로`}>
              <text x={POS[r].x} y={POS[r].y} textAnchor="middle" style={{ fontSize: r === "EKU" ? 64 : 44, fontWeight: 900, fill: regionColor(r) }}>{n(r)}</text>
              <text x={POS[r].x} y={POS[r].y + (r === "EKU" ? 34 : 28)} textAnchor="middle" style={{ fontSize: r === "EKU" ? 24 : 20, fontWeight: 800, fill: "var(--text)" }}>{REGION_LABEL[r]}</text>
            </a>
          ))}
        </svg>
      </div>

      <div className="flex flex-col" style={{ gap: "var(--s-4)", marginTop: "var(--s-5)" }}>
        {REGION_ORDER.filter((r) => n(r) > 0).map((r) => {
          const chips = (
            <div className="flex flex-wrap" style={{ gap: 8, marginTop: 8 }}>
              {v.regions[r].map((i) =>
                i.docId ? (
                  <Link key={i.key} to={`/doc/${i.docId}`} className="inline-flex items-center rounded-full hover:bg-surface text-text font-semibold"
                    style={{ minHeight: 40, padding: "4px 14px", fontSize: "var(--t-xs)", border: `1.5px solid ${regionColor(r)}`, background: "var(--bg)" }}>
                    {i.title}
                  </Link>
                ) : (
                  <span key={i.key} className="inline-flex items-center rounded-full text-text-muted"
                    style={{ minHeight: 40, padding: "4px 14px", fontSize: "var(--t-xs)", border: `1.5px dashed ${regionColor(r)}` }}
                    title="이 나라에서만 하는 절차 — 앱에 따로 문서가 없어요">
                    {i.title}
                  </span>
                ),
              )}
            </div>
          );
          const head = (
            <span className="inline-flex items-center flex-wrap" style={{ gap: 8 }}>
              <span className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>{REGION_LABEL[r]}</span>
              <span className="rounded-full font-bold" style={{ fontSize: "var(--t-xs)", padding: "1px 9px", color: "var(--text-on-color)", background: regionColor(r) }}>{n(r)}</span>
              {r === "EKU" && <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>한 번 만들면 세 나라에 다시 써요</span>}
            </span>
          );
          return (
            <div key={r} id={`venn-${r}`} style={{ scrollMarginTop: 80 }}>
              {r === "E" ? (
                <details>
                  <summary className="cursor-pointer" style={{ minHeight: 40, display: "flex", alignItems: "center" }}>{head}<span className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginLeft: 8 }}>펼치기 ▾</span></summary>
                  {chips}
                </details>
              ) : (
                <>{head}{chips}</>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-4)", lineHeight: "var(--lh-base)" }}>
        현재 제품 정보 기준이에요(필요 없다고 본 문서는 빼고, 확인이 필요한 문서는 넣었어요). 앱의 한국·미국 제출 자료 연결로 셌어요.
        같은 문서라도 서식·언어·제출처는 나라별로 달라요. 점선은 앱에 따로 문서가 없는 그 나라만의 절차예요.
      </p>
    </section>
  );
}
