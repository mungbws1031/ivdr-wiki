import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, ChevronDown, ChevronRight } from "lucide-react";
import {
  CERT_META,
  MILESTONES,
  type Milestone,
  type ScheduleStore,
  loadSchedule,
  saveSchedule,
} from "../data/projectSchedule";

// =====================================================================
// 섹션별 마일스톤
// =====================================================================
function useSections() {
  const certs = ["ivdr", "iso13485", "ivdd", "mdsap"] as const;
  return useMemo(
    () =>
      certs.map((cert) => ({
        cert,
        meta: CERT_META[cert],
        milestones: MILESTONES.filter((m) => m.certType === cert),
      })),
    [],
  );
}

// =====================================================================
// 타임라인 — 입력된 날짜들을 정렬해서 시각화
// =====================================================================
function Timeline({ store }: { store: ScheduleStore }) {
  const entries = useMemo(() => {
    const list: Array<{ milestone: Milestone; date: Date; dateStr: string }> = [];
    for (const m of MILESTONES) {
      const raw = store[m.key];
      if (!raw) continue;
      const d = new Date(raw);
      if (!isNaN(d.getTime())) list.push({ milestone: m, date: d, dateStr: raw });
    }
    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [store]);

  if (entries.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section
      className="rounded-[var(--r-lg)]"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--s-6)", marginBottom: "var(--s-8)" }}
    >
      <h2 className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)", marginBottom: "var(--s-5)" }}>
        📅 전체 일정 타임라인
      </h2>

      <div className="relative" style={{ paddingLeft: 24 }}>
        {/* vertical line */}
        <div
          className="absolute"
          style={{ left: 8, top: 6, bottom: 6, width: 2, background: "var(--border)" }}
        />

        <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
          {entries.map(({ milestone, date, dateStr }, idx) => {
            const isPast = date < today;
            const isToday = date.getTime() === today.getTime();
            const meta = CERT_META[milestone.certType];
            return (
              <div key={idx} className="relative flex items-start gap-3">
                {/* dot */}
                <div
                  className="absolute shrink-0 rounded-full"
                  style={{
                    left: -20,
                    top: 5,
                    width: 10,
                    height: 10,
                    background: isPast ? "var(--text-subtle)" : `var(${meta.colorVar})`,
                    border: isToday ? "2px solid var(--accent)" : "2px solid var(--surface)",
                    boxShadow: "0 0 0 2px var(--border)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="rounded-full font-semibold shrink-0"
                      style={{
                        background: `var(${meta.tintVar})`,
                        color: `var(${meta.colorVar})`,
                        fontSize: "var(--t-xs)",
                        padding: "1px 8px",
                      }}
                    >
                      {meta.label}
                    </span>
                    <span className={isPast ? "text-text-subtle" : "font-semibold text-text"} style={{ fontSize: "var(--t-sm)" }}>
                      {milestone.label}
                    </span>
                  </div>
                  <div className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>
                    {dateStr}
                    {isToday && <span className="ml-2 text-[var(--accent)] font-bold">D-Day</span>}
                    {!isPast && !isToday && (
                      <span className="ml-2">
                        (D-{Math.ceil((date.getTime() - today.getTime()) / 86400000)})
                      </span>
                    )}
                    {isPast && <span className="ml-2 text-text-subtle">(완료)</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// 인증별 입력 섹션
// =====================================================================
function CertSection({
  meta,
  milestones,
  store,
  onChange,
}: {
  cert?: string;
  meta: { label: string; colorVar: string; tintVar: string };
  milestones: Milestone[];
  store: ScheduleStore;
  onChange: (key: string, value: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const filled = milestones.filter((m) => store[m.key]).length;

  return (
    <section
      className="rounded-[var(--r-lg)]"
      style={{ border: `1.5px solid var(${meta.colorVar})`, overflow: "hidden" }}
    >
      {/* 헤더 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
        style={{ background: `var(${meta.tintVar})`, padding: "var(--s-4) var(--s-5)" }}
      >
        <CalendarDays size={20} style={{ color: `var(${meta.colorVar})`, flexShrink: 0 }} aria-hidden />
        <span className="font-extrabold text-text flex-1" style={{ fontSize: "var(--t-lg)" }}>
          {meta.label}
        </span>
        <span
          className="rounded-full font-semibold"
          style={{
            background: filled > 0 ? `var(${meta.colorVar})` : "var(--border)",
            color: filled > 0 ? "var(--text-on-color)" : "var(--text-muted)",
            fontSize: "var(--t-xs)",
            padding: "1px 10px",
          }}
        >
          {filled} / {milestones.length}
        </span>
        {open ? (
          <ChevronDown size={18} style={{ color: `var(${meta.colorVar})`, flexShrink: 0 }} aria-hidden />
        ) : (
          <ChevronRight size={18} style={{ color: `var(${meta.colorVar})`, flexShrink: 0 }} aria-hidden />
        )}
      </button>

      {/* 마일스톤 그리드 */}
      {open && (
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "var(--s-4)", padding: "var(--s-5)", background: "var(--surface)" }}
        >
          {milestones.map((m) => (
            <label key={m.key} className="flex flex-col" style={{ gap: 4 }}>
              <span className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
                {m.label}
              </span>
              <span className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>
                {m.hint}
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={store[m.key] ?? ""}
                  onChange={(e) => onChange(m.key, e.target.value)}
                  className="w-full rounded-[var(--r-sm)] text-text"
                  style={{
                    border: store[m.key]
                      ? `1.5px solid var(${meta.colorVar})`
                      : "1.5px solid var(--border)",
                    background: store[m.key] ? `var(${meta.tintVar})` : "var(--bg)",
                    fontSize: "var(--t-sm)",
                    padding: "8px 12px",
                    outline: "none",
                  }}
                />
                {store[m.key] && (
                  <Check
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: `var(${meta.colorVar})` }}
                    aria-hidden
                  />
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

// =====================================================================
// 메인 페이지
// =====================================================================
export function SchedulePlanner() {
  const [store, setStore] = useState<ScheduleStore>(() => loadSchedule());
  const [saved, setSaved] = useState(false);
  const sections = useSections();

  const handleChange = useCallback((key: string, value: string) => {
    setStore((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      saveSchedule(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleClear = useCallback(() => {
    if (!confirm("모든 일정 데이터를 초기화하시겠습니까?")) return;
    setStore({});
    saveSchedule({});
  }, []);

  const totalFilled = MILESTONES.filter((m) => store[m.key]).length;

  return (
    <div className="min-h-screen bg-bg">
      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-12) var(--margin) var(--s-16)" }}
      >
        {/* Header */}
        <header style={{ marginBottom: "var(--s-10)" }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text"
            style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}
          >
            <ArrowLeft size={16} aria-hidden />
            인증 허브
          </Link>

          <div className="flex items-start gap-3 flex-wrap" style={{ marginBottom: "var(--s-3)" }}>
            <CalendarDays size={32} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 4 }} aria-hidden />
            <div>
              <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-3xl)", lineHeight: "var(--lh-tight)" }}>
                프로젝트 일정 플래너
              </h1>
              <p className="text-text-muted" style={{ fontSize: "var(--t-lg)", marginTop: "var(--s-2)", maxWidth: 640 }}>
                인증별 마일스톤 날짜를 한 번 설정하면 문서 작성 전반에 자동 반영됩니다.
                데이터는 이 브라우저에만 저장됩니다.
              </p>
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: "var(--s-5)" }}>
            <div
              className="inline-flex items-center gap-2 rounded-[var(--r-md)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 16px" }}
            >
              <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
                {totalFilled} / {MILESTONES.length} 일정 입력됨
              </span>
            </div>
            {saved && (
              <span className="inline-flex items-center gap-1 text-[var(--success)]" style={{ fontSize: "var(--t-sm)" }}>
                <Check size={14} aria-hidden /> 저장됨
              </span>
            )}
            <button
              onClick={handleClear}
              className="text-text-subtle hover:text-text"
              style={{ fontSize: "var(--t-sm)" }}
            >
              전체 초기화
            </button>
          </div>
        </header>

        {/* 타임라인 */}
        <Timeline store={store} />

        {/* 인증별 섹션 */}
        <div className="flex flex-col" style={{ gap: "var(--s-6)" }}>
          {sections.map(({ cert, meta, milestones }) => (
            <CertSection
              key={cert}
              cert={cert}
              meta={meta}
              milestones={milestones}
              store={store}
              onChange={handleChange}
            />
          ))}
        </div>

        <footer
          className="text-text-subtle"
          style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-12)", lineHeight: "var(--lh-base)" }}
        >
          입력한 날짜는 브라우저 localStorage에만 저장됩니다. 서버에 전송되지 않습니다. 다른 기기에서 사용하려면 날짜를 다시 입력하세요.
        </footer>
      </main>
    </div>
  );
}
