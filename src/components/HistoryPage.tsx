import { Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "./PageHeader";

type EraId = 1 | 2 | 3 | 4;
type Tier = "major" | "med";

interface TLEvent {
  year: number;
  side: "kr" | "world";
  label: string;
  detail: string;
  trigger: string;
  tier: Tier;
  era: EraId;
}

const ERA_META: Record<EraId, { label: string; years: string; color: string; tint: string; desc: string }> = {
  1: { label: "규제 공백기", years: "1963–2002", color: "var(--p1)", tint: "var(--p1-tint)", desc: "약사법 하에 의료기기 별도 법체계 없음. 수출 기업이 글로벌 기준과 처음 조우." },
  2: { label: "법체계 구축기", years: "2003–2012", color: "var(--p2)", tint: "var(--p2-tint)", desc: "의료기기법 독립 제정·GMP 의무화. '문서로 증명해야 팔 수 있다'는 패러다임 정착." },
  3: { label: "글로벌 정렬기", years: "2013–2019", color: "var(--p3)", tint: "var(--p3-tint)", desc: "MFDS 격상, 위험관리·PMS 명문화. EU MDR/IVDR 발표에 한국 즉각 연동." },
  4: { label: "이중 의무 심화기", years: "2020–현재", color: "var(--p4)", tint: "var(--p4-tint)", desc: "AI·체외진단기기법 독립. EU IVDR 전면 시행으로 이중 문서 관리 시대 도래." },
};

const EVENTS: TLEvent[] = [
  // ── Era 1 ─────────────────────────────────────────────────────────
  {
    year: 1963, side: "kr", era: 1, tier: "major",
    label: "약사법 제정",
    detail: "의료기기를 의약품과 함께 규율 시작. 별도 문서 체계 없음.",
    trigger: "해방 후 무규제 혼란 — 불량 의약품·기기 유통 방지 필요",
  },
  {
    year: 1976, side: "world", era: 1, tier: "major",
    label: "미국 FDA 의료기기법 개정",
    detail: "Medical Device Amendments — 510(k)/PMA 제도 탄생.",
    trigger: "달콘 실드(IUD) 사고: 수천 명 감염·사산 — 기기 안전 입법 요구 폭발",
  },
  {
    year: 1990, side: "world", era: 1, tier: "major",
    label: "EU 의료기기 지침 MDD",
    detail: "93/42/EEC 발효 — CE 마킹 제도 시작.",
    trigger: "유럽 단일시장 통합(1993) 준비 — 회원국 간 이중 인증 혼란 해소",
  },
  {
    year: 1994, side: "kr", era: 1, tier: "med",
    label: "WTO 가입",
    detail: "수출 기업이 FDA·CE 요건과 처음 맞닥뜨림.",
    trigger: "수출 확대 전략 — 글로벌 기준 없이는 시장 진입 불가",
  },
  {
    year: 1996, side: "world", era: 1, tier: "major",
    label: "ISO 13485 초판",
    detail: "의료기기 QMS 국제 표준 첫 발표.",
    trigger: "ISO 9001의 의료기기 한계 노출 — 멸균·추적성 등 특수 요건 미반영",
  },
  {
    year: 1998, side: "world", era: 1, tier: "major",
    label: "EU IVDD 발표",
    detail: "체외진단기기 전용 지침 (98/79/EC) 발효.",
    trigger: "HIV·B형간염 진단 오류 사고 — IVD 기기 독립 규제 필요성 대두",
  },
  // ── Era 2 ─────────────────────────────────────────────────────────
  {
    year: 2003, side: "kr", era: 2, tier: "major",
    label: "의료기기법 독립",
    detail: "1~4등급 분류·기술문서 제출 법적 의무화.",
    trigger: "2001년 인공유방 파동·치과기기 불량 사고 + 의료기기 시장 급성장",
  },
  {
    year: 2003, side: "world", era: 2, tier: "med",
    label: "ISO 13485:2003",
    detail: "ISO 9001과 분리, 의료기기 특화 개정.",
    trigger: "ISO 9001:2000 대개정 — 의료기기 전용 표준 재정립 필요",
  },
  {
    year: 2007, side: "kr", era: 2, tier: "major",
    label: "GMP 의무화",
    detail: "DHF·SOP·내부심사 — 프로세스 문서화 시대 개막.",
    trigger: "수출 기업 FDA·CE 인증 취득 요건 + 국내 불량 기기 단속 강화 요구",
  },
  {
    year: 2008, side: "kr", era: 2, tier: "med",
    label: "ISO 13485 KS 채택",
    detail: "한국 GMP와 국제 표준 사실상 동일화.",
    trigger: "국내외 이중 인증 부담 해소 — 기업 수출 원가 절감 필요",
  },
  {
    year: 2011, side: "world", era: 2, tier: "med",
    label: "PIP 보형물 스캔들",
    detail: "유럽 전역 임상근거 없는 기기 불신 확산.",
    trigger: "프랑스 PIP사 — 산업용 실리콘 불법 사용 보형물 30만개 유통 발각",
  },
  {
    year: 2012, side: "kr", era: 2, tier: "major",
    label: "임상근거 의무화",
    detail: "3·4등급 신규 품목 임상시험·문헌 근거 제출 필수.",
    trigger: "고위험 기기 허가 남발 우려 + PIP 사태 교훈 수용",
  },
  // ── Era 3 ─────────────────────────────────────────────────────────
  {
    year: 2013, side: "kr", era: 3, tier: "med",
    label: "MFDS 격상",
    detail: "차관급 청 → 장관급 처. 예산·인력 확대, 규제 강화 가속.",
    trigger: "2011~12년 가습기 살균제 사건 → 식품·의약품 안전 강화 범국민 요구",
  },
  {
    year: 2016, side: "world", era: 3, tier: "major",
    label: "ISO 13485:2016",
    detail: "위험관리·공급망·규제 요건 대폭 강화.",
    trigger: "PIP 사태 교훈 — 공급망 관리 부실이 대규모 피해 원인임을 확인",
  },
  {
    year: 2017, side: "kr", era: 3, tier: "major",
    label: "의료기기법 전부개정",
    detail: "ISO 14971·PMS·UDI 로드맵 법제화. 2019년 시행.",
    trigger: "EU MDR·IVDR 발표에 즉각 연동 — 선제 대응 없이는 수출 장벽 우려",
  },
  {
    year: 2017, side: "world", era: 3, tier: "major",
    label: "EU MDR·IVDR 발표",
    detail: "2017/745·746 — 유럽 의료기기 규제 근본 개혁.",
    trigger: "PIP 스캔들 후 5년 검토 완료 — 임상근거·공급망·EUDAMED 전면 강화",
  },
  // ── Era 4 ─────────────────────────────────────────────────────────
  {
    year: 2020, side: "kr", era: 4, tier: "med",
    label: "AI 의료기기 가이드라인",
    detail: "알고리즘 검증·데이터셋 편향 분석 요건 최초 도입.",
    trigger: "IBM Watson 오진 논란 + 국내 AI 의료기기 허가 급증 — 근거 기준 부재",
  },
  {
    year: 2021, side: "kr", era: 4, tier: "major",
    label: "체외진단기기법 독립",
    detail: "성능평가 3단 구조 (과학적·분석적·임상적) 법제화.",
    trigger: "COVID-19 팬데믹 — PCR·신속항원검사 폭증, IVD 전용 법 체계 긴급 필요",
  },
  {
    year: 2021, side: "world", era: 4, tier: "major",
    label: "EU MDR 전면 시행",
    detail: "의료기기 MDR 의무화. IVDR은 전환 유예.",
    trigger: "2017년 발표 후 4년 전환기 종료 (COVID-19로 1년 연기 포함)",
  },
  {
    year: 2025, side: "kr", era: 4, tier: "major",
    label: "이중 문서 관리 시대",
    detail: "한국 허가 + EUDAMED + MDCG 가이드 동시 관리 필수.",
    trigger: "EU IVDR 전면 시행 — 수출 기업이 양국 규제를 동시에 준수해야 하는 현실",
  },
  {
    year: 2025, side: "world", era: 4, tier: "major",
    label: "EU IVDR 전면 시행",
    detail: "체외진단기기 완전 의무화 원년. EUDAMED 4개 모듈 의무화.",
    trigger: "COVID-19로 진단기기 중요성 재인식 + IVD 전환기 최종 종료",
  },
];

const allYears = [...new Set(EVENTS.map((e) => e.year))].sort((a, b) => a - b);
const byYear = allYears.map((year) => ({
  year,
  kr: EVENTS.filter((e) => e.year === year && e.side === "kr"),
  world: EVENTS.filter((e) => e.year === year && e.side === "world"),
  era: (EVENTS.find((e) => e.year === year)?.era ?? 1) as EraId,
}));

function EventCard({ event }: { event: TLEvent }) {
  const meta = ERA_META[event.era];
  return (
    <div
      style={{
        background: event.tier === "major" ? meta.tint : "var(--bg)",
        border: `1px solid ${event.tier === "major" ? meta.color + "60" : "var(--border)"}`,
        borderRadius: "var(--r-md)",
        padding: "var(--s-3) var(--s-4)",
      }}
    >
      {event.tier === "major" && (
        <div style={{ color: meta.color, fontSize: "var(--t-xs)", fontWeight: 700, marginBottom: 2 }}>★ 핵심</div>
      )}
      <div style={{ fontWeight: 700, fontSize: "var(--t-sm)", color: "var(--text)", lineHeight: 1.4 }}>
        {event.label}
      </div>
      <div style={{ fontSize: "var(--t-xs)", color: "var(--text-muted)", marginTop: 3, lineHeight: "var(--lh-base)" }}>
        {event.detail}
      </div>
      {/* 변화 계기 */}
      <div
        style={{
          marginTop: "var(--s-2)",
          paddingTop: "var(--s-2)",
          borderTop: `1px dashed ${event.tier === "major" ? meta.color + "40" : "var(--border)"}`,
          display: "flex",
          gap: 5,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 10, lineHeight: 1.6, flexShrink: 0, opacity: 0.7 }}>⚡</span>
        <span style={{ fontSize: "var(--t-xs)", color: event.tier === "major" ? meta.color : "var(--text-subtle)", lineHeight: "var(--lh-base)", fontStyle: "italic" }}>
          {event.trigger}
        </span>
      </div>
    </div>
  );
}

const DRIVERS = [
  { icon: "🌐", title: "수출 필요성", body: "FDA·CE 요건이 최대 동력 — 해외 기준이 국내로 역수입됨." },
  { icon: "⚠️", title: "국내 부작용 사고", body: "불량 기기 사고가 국회 압박으로 이어져 독립법·GMP 제정." },
  { icon: "🇪🇺", title: "EU 규제 연동", body: "MDR/IVDR 발표 때마다 한국 법령이 즉각 연동 개정." },
  { icon: "🤖", title: "AI·디지털헬스", body: "알고리즘 검증·RWE 등 새 문서 유형 지속 추가." },
];

export function HistoryPage() {
  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="규제 역사" accentColor="var(--info)" />

      <main style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "var(--s-8) var(--margin) var(--s-16)" }}>

        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: "var(--s-10)" }}>
          <h1 style={{ fontWeight: 800, fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", color: "var(--text)" }}>
            60년의 기록
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--t-base)", marginTop: "var(--s-2)" }}>
            약사법(1963)부터 EU IVDR 이중 의무(2025)까지 — 한국 의료기기 규제 역사
          </p>
          <p style={{ color: "var(--text-subtle)", fontSize: "var(--t-sm)", marginTop: "var(--s-1)" }}>
            ⚡ 각 사건 아래 이탤릭체는 <strong style={{ color: "var(--text-muted)" }}>변화를 촉발한 계기</strong>입니다
          </p>
        </header>

        {/* Stats */}
        <div style={{ display: "flex", gap: "var(--s-4)", justifyContent: "center", flexWrap: "wrap", marginBottom: "var(--s-10)" }}>
          {[
            { num: "1963", label: "규제 시작" },
            { num: "4단계", label: "법체계 전환" },
            { num: "2025", label: "이중 의무 도래" },
            { num: "글로벌 동시", label: "정렬 완성" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "var(--s-3) var(--s-6)", textAlign: "center", minWidth: 90 }}
            >
              <div style={{ fontWeight: 800, fontSize: "var(--t-xl)", color: "var(--info)" }}>{s.num}</div>
              <div style={{ fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 72px 1fr", gap: "var(--s-4)", marginBottom: "var(--s-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--accent-weak)", borderRadius: "var(--r-md)", padding: "var(--s-3) var(--s-4)" }}>
            <span>🇰🇷</span>
            <span style={{ fontWeight: 700, fontSize: "var(--t-sm)", color: "var(--accent)" }}>한국 동향</span>
          </div>
          <div />
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--info-bg)", borderRadius: "var(--r-md)", padding: "var(--s-3) var(--s-4)" }}>
            <Globe size={14} style={{ color: "var(--info)" }} />
            <span style={{ fontWeight: 700, fontSize: "var(--t-sm)", color: "var(--info)" }}>해외 동향</span>
          </div>
        </div>

        {/* Timeline */}
        {([1, 2, 3, 4] as EraId[]).map((era) => {
          const meta = ERA_META[era];
          const eraYears = byYear.filter((y) => y.era === era);
          return (
            <section key={era} style={{ marginBottom: "var(--s-10)" }}>
              {/* Era band */}
              <div
                style={{
                  background: meta.tint,
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: "var(--r-md)",
                  padding: "var(--s-3) var(--s-6)",
                  marginBottom: "var(--s-5)",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "var(--s-3)",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: 800, fontSize: "var(--t-lg)", color: meta.color }}>{meta.label}</span>
                <span style={{ fontSize: "var(--t-sm)", fontWeight: 600, color: meta.color, opacity: 0.7 }}>{meta.years}</span>
                <span style={{ fontSize: "var(--t-sm)", color: "var(--text-muted)", flex: 1, minWidth: 180 }}>— {meta.desc}</span>
              </div>

              {/* Year rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
                {eraYears.map(({ year, kr, world }) => (
                  <div key={year} style={{ display: "grid", gridTemplateColumns: "1fr 72px 1fr", gap: "var(--s-4)", alignItems: "start" }}>
                    {/* Korean side */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                      {kr.length > 0
                        ? kr.map((e) => <EventCard key={e.label} event={e} />)
                        : <div style={{ minHeight: 16 }} />}
                    </div>

                    {/* Center spine */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div
                        style={{
                          background: meta.color,
                          color: "#fff",
                          borderRadius: "var(--r-full)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 7px",
                          whiteSpace: "nowrap",
                          lineHeight: 1.4,
                        }}
                      >
                        {year}
                      </div>
                      <div style={{ width: 2, flex: 1, minHeight: 20, background: meta.color, opacity: 0.2, borderRadius: 1 }} />
                    </div>

                    {/* World side */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                      {world.length > 0
                        ? world.map((e) => <EventCard key={e.label} event={e} />)
                        : <div style={{ minHeight: 16 }} />}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Driver cards */}
        <section
          style={{
            background: "var(--surface)",
            borderRadius: "var(--r-lg)",
            border: "1px solid var(--border)",
            padding: "var(--s-8)",
            marginTop: "var(--s-6)",
          }}
        >
          <h2 style={{ fontWeight: 800, fontSize: "var(--t-xl)", color: "var(--text)", marginBottom: "var(--s-6)" }}>
            왜 이렇게 강화됐나 — 4가지 드라이버
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "var(--s-4)" }}>
            {DRIVERS.map((d) => (
              <div
                key={d.title}
                style={{ background: "var(--bg)", borderRadius: "var(--r-md)", border: "1px solid var(--border)", padding: "var(--s-4)" }}
              >
                <div style={{ fontSize: 28, marginBottom: "var(--s-2)" }}>{d.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "var(--t-sm)", color: "var(--text)", marginBottom: 4 }}>{d.title}</div>
                <div style={{ fontSize: "var(--t-xs)", color: "var(--text-muted)", lineHeight: "var(--lh-base)" }}>{d.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: "var(--s-12)" }}>
          <Link to="/" style={{ color: "var(--text-muted)", fontSize: "var(--t-sm)", textDecoration: "none" }}>
            ← 홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}
