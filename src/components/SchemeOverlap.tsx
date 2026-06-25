import { Link } from "react-router-dom";
import { ArrowUpRight, Layers, Globe } from "lucide-react";
import { leafById, colorForLeaf } from "../data/docTree";
import {
  ceOnlyDocIds,
  sharedDocIds,
  fdaOnlyItems,
  mdsapMarkets,
} from "../data/schemes";

function DocChip({ id, link = true }: { id: string; link?: boolean }) {
  const l = leafById(id);
  if (!l) return null;
  const c = `var(${colorForLeaf(id)})`;
  const inner = (
    <>
      <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 7, height: 7, background: c }} />
      <span className="font-semibold text-text" style={{ fontSize: "var(--t-xs)" }}>{l.title}</span>
      {link && <ArrowUpRight size={12} style={{ color: "var(--text-subtle)" }} aria-hidden />}
    </>
  );
  const style = { border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", padding: "4px 10px" } as const;
  return link ? (
    <Link to={`/doc/${id}`} className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] bg-bg hover:bg-surface" style={style}>
      {inner}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-[var(--r-full)] bg-bg" style={style}>{inner}</span>
  );
}

/** 규제 스킴 간 문서 중복(재사용) — 벤다이어그램 + 그룹별 문서. */
export function SchemeOverlap() {
  const shared = sharedDocIds();
  const nShared = shared.length;
  const nCe = ceOnlyDocIds.length;

  return (
    <div style={{ marginTop: "var(--s-6)" }}>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-5)", maxWidth: 760 }}>
        ISO 13485 QMS는 모든 스킴의 공통 기반이고, MDSAP는 그 QMS를 5개국 단일 심사로 묶습니다.
        CE(IVDR)·FDA는 같은 기반 위에 시장별 문서를 더합니다. <strong className="text-text">한 번 만들어 여러 스킴에 재사용</strong>되는 문서가 대부분입니다.
      </p>

      {/* ── 벤다이어그램 ── */}
      <div style={{ overflowX: "auto" }}>
        <svg viewBox="0 0 880 640" role="img" aria-label="규제 스킴별 문서 중복 벤다이어그램"
          style={{ width: "100%", minWidth: 600, height: "auto", display: "block" }}>
          {/* MDSAP 외곽 기반 (ISO 13485를 5개국 단일 심사로 감쌈) */}
          <rect x="34" y="352" width="812" height="262" rx="32" fill="var(--p5-tint)" stroke="var(--p5)" strokeWidth="2.5" />
          <text x="58" y="392" style={{ fontSize: 17, fontWeight: 800, fill: "var(--p5)" }}>MDSAP</text>
          <text x="440" y="590" textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "var(--p5)" }}>
            MDSAP — {mdsapMarkets.join(" · ")} 단일 심사
          </text>
          {/* ISO 13485 내부 기반 (MDSAP 안에 포함) */}
          <rect x="150" y="402" width="580" height="118" rx="22" fill="var(--p3-tint)" stroke="var(--p3)" strokeWidth="2" />
          <text x="440" y="452" textAnchor="middle" style={{ fontSize: 19, fontWeight: 800, fill: "var(--p3)" }}>ISO 13485</text>
          <text x="440" y="478" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "var(--text-muted)" }}>QMS 공통 기반</text>

          {/* CE / FDA 원 (반투명 → 겹침이 진해짐) */}
          <circle cx="330" cy="250" r="198" fill="var(--p2)" fillOpacity="0.16" stroke="var(--p2)" strokeWidth="2.5" />
          <circle cx="550" cy="250" r="198" fill="var(--p4)" fillOpacity="0.16" stroke="var(--p4)" strokeWidth="2.5" />

          {/* 제목 */}
          <text x="190" y="78" textAnchor="middle" style={{ fontSize: 20, fontWeight: 800, fill: "var(--p2)" }}>CE / IVDR</text>
          <text x="190" y="100" textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: "var(--text-muted)" }}>EU 시장</text>
          <text x="690" y="78" textAnchor="middle" style={{ fontSize: 20, fontWeight: 800, fill: "var(--p4)" }}>FDA</text>
          <text x="690" y="100" textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: "var(--text-muted)" }}>US 시장</text>

          {/* CE 전용 (왼쪽 초승달) */}
          <text x="205" y="210" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: "var(--p2)" }}>CE 전용 {nCe}</text>
          {["GSPR · 분류(Annex VIII)", "DoC · SSP · PER", "EUDAMED · UDI · PRRC", "NB · EU 대리인"].map((t, i) => (
            <text key={i} x="205" y={236 + i * 22} textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: "var(--text)" }}>{t}</text>
          ))}

          {/* FDA 전용 (오른쪽 초승달) */}
          <text x="678" y="210" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: "var(--p4)" }}>FDA 전용</text>
          {["510(k)/PMA", "QMSR · FDA 등록", "GUDID · US agent"].map((t, i) => (
            <text key={i} x="678" y={236 + i * 22} textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: "var(--text)" }}>{t}</text>
          ))}

          {/* 공통(겹침) */}
          <text x="440" y="206" textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: "var(--text)" }}>공통 재사용</text>
          <text x="440" y="246" textAnchor="middle" style={{ fontSize: 40, fontWeight: 900, fill: "var(--accent)" }}>{nShared}</text>
          {["QMS · 설계관리", "위험관리 · 공정", "기술 · 성능 증거"].map((t, i) => (
            <text key={i} x="440" y={278 + i * 20} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "var(--text-muted)" }}>{t}</text>
          ))}
        </svg>
      </div>

      {/* ── 그룹별 문서 ── */}
      <div className="flex flex-col" style={{ gap: "var(--s-5)", marginTop: "var(--s-6)" }}>
        {/* 공통 */}
        <section>
          <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-3)" }}>
            <Layers size={18} style={{ color: "var(--accent)" }} aria-hidden />
            <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>공통 재사용 문서</h3>
            <span className="rounded-full font-bold text-text-on-color" style={{ background: "var(--accent)", fontSize: "var(--t-xs)", padding: "1px 9px" }}>{nShared}</span>
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>ISO 13485 · MDSAP · CE · FDA 두루 재사용 (내용·서식은 시장별 상이)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {shared.map((id) => <DocChip key={id} id={id} />)}
          </div>
        </section>

        {/* CE 전용 */}
        <section>
          <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-3)" }}>
            <span className="inline-block rounded-full" style={{ width: 14, height: 14, background: "var(--p2)" }} aria-hidden />
            <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>CE / IVDR 전용</h3>
            <span className="rounded-full font-bold text-text-on-color" style={{ background: "var(--p2)", fontSize: "var(--t-xs)", padding: "1px 9px" }}>{nCe}</span>
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>EU 시장 고유</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ceOnlyDocIds.map((id) => <DocChip key={id} id={id} />)}
          </div>
        </section>

        {/* FDA 전용 (참고) */}
        <section>
          <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-3)" }}>
            <Globe size={18} style={{ color: "var(--p4)" }} aria-hidden />
            <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>FDA(US) 전용 — 참고</h3>
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>우리 IVDR 문서셋 밖 · 미국 진출 시 추가</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {fdaOnlyItems.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-[var(--r-full)]"
                style={{ border: "1px dashed var(--p4)", color: "var(--text)", fontSize: "var(--t-xs)", padding: "4px 10px" }}>
                <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 7, height: 7, background: "var(--p4)" }} />
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* 안내 */}
        <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
          분류 기준: 우리 문서셋(75) 중 EU 고유 문서를 CE 전용으로, 나머지(QMS·설계·위험·생산·기술/성능 증거)를 공통으로 보았습니다.
          MDSAP는 별도 고유 문서보다 ISO 13485 QMS + 국가별 규제 챕터를 단일 심사로 묶는 프로그램입니다. 동일 문서라도 서식·언어·제출처는 스킴별로 다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}
