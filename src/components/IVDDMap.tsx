import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Activity, ChevronRight, FileText, Library, X } from "lucide-react";
import {
  ivddPhases,
  ivddStations,
  type IVDDPhaseId,
  type IVDDStation,
} from "../data/ivdd/stations";
import { ivddLeavesByStation } from "../data/ivdd/docTree";
import { PhaseBand } from "./PhaseBand";
import { PhaseNav } from "./PhaseNav";
import { StatusChip } from "./StatusChip";
import type { Phase, Station, PhaseId } from "../data/stations";

function adaptPhase(p: typeof ivddPhases[0]): Phase {
  return { ...p, id: p.id as unknown as PhaseId };
}

function adaptStation(s: IVDDStation): Station {
  return { ...s, phase: s.phase as unknown as PhaseId };
}

function IVDDStationPanel({
  station,
  onClose,
}: {
  station: IVDDStation | null;
  onClose: () => void;
}) {
  if (!station) return null;
  const docs = ivddLeavesByStation(station.id);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-[var(--r-lg)] shadow-lg"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        maxHeight: "70vh",
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-5) var(--margin) var(--s-8)" }}
      >
        {/* 헤더 */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>
              {station.title}
            </h2>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
              {station.oneLine}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="상세 닫기"
            className="grid shrink-0 place-items-center rounded-[var(--r-sm)] text-text-muted hover:bg-bg"
            style={{ width: 40, height: 40 }}
          >
            <X size={22} aria-hidden />
          </button>
        </div>

        <div style={{ marginTop: "var(--s-3)" }}>
          <StatusChip label={station.tag.label} tone={station.tag.tone} size="md" />
        </div>

        {/* 문서 목록 */}
        {docs.length > 0 && (
          <div
            className="overflow-hidden rounded-[var(--r-md)]"
            style={{ border: "1px solid var(--border)", marginTop: "var(--s-4)" }}
          >
            <div className="flex items-center gap-2" style={{ background: "var(--bg)", padding: "10px 12px" }}>
              <FileText size={16} style={{ color: "var(--p2)" }} aria-hidden />
              <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
                이 단계에서 써야 할 문서
              </span>
              <span
                className="rounded-full font-bold text-text-on-color"
                style={{ background: "var(--p2)", fontSize: "var(--t-xs)", padding: "1px 8px" }}
              >
                {docs.length}
              </span>
            </div>
            <ul>
              {docs.map((d) => (
                <li key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Link to={`/doc/${d.id}`} className="flex items-center gap-2 hover:bg-bg" style={{ padding: "9px 12px" }}>
                    <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 8, height: 8, background: "var(--p2)" }} />
                    <span className="flex-1 font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
                      {d.title}
                    </span>
                    {d.requirement === "conditional" && (
                      <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>조건부</span>
                    )}
                    {d.note && (
                      <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{d.note}</span>
                    )}
                    <ChevronRight size={14} style={{ color: "var(--text-subtle)" }} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 본문 */}
        <div className="flex flex-col" style={{ marginTop: "var(--s-5)", gap: "var(--s-3)" }}>
          {station.body.map((para, i) => (
            <p key={i} className="text-text" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)" }}>
              {para}
            </p>
          ))}
        </div>

        {/* 지금 할 일 */}
        <div
          className="rounded-[var(--r-md)]"
          style={{
            background: "var(--p2-tint)",
            borderLeft: "4px solid var(--p2)",
            padding: "var(--s-4)",
            marginTop: "var(--s-5)",
          }}
        >
          <span className="font-bold" style={{ color: "var(--p2)", fontSize: "var(--t-sm)" }}>
            🧭 지금 할 일
          </span>
          <p className="text-text" style={{ fontSize: "var(--t-base)", marginTop: 4 }}>
            {station.todo}
          </p>
        </div>

        {/* 관련 조항 */}
        {station.refs.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--s-4)" }}>
            {station.refs.map((r) => (
              <span
                key={r}
                className="rounded-full font-medium text-text-muted"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: "var(--t-xs)", padding: "3px 10px" }}
              >
                {r}
              </span>
            ))}
          </div>
        )}

        {station.note && (
          <p className="text-text-subtle" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-3)" }}>
            ⚠️ {station.note}
          </p>
        )}
      </div>
    </div>
  );
}

export function IVDDMap() {
  const navigate = useNavigate();
  const { id } = useParams();

  const adaptedPhases = useMemo(() => ivddPhases.map(adaptPhase), []);
  const adaptedStations = useMemo(() => ivddStations.map(adaptStation), []);

  const stationsByPhase = useMemo(() => {
    const map = {} as Record<string, Station[]>;
    for (const p of adaptedPhases) {
      map[p.id] = adaptedStations.filter((s) => s.phase === p.id);
    }
    return map;
  }, [adaptedPhases, adaptedStations]);

  const openId = id ? Number(id) : null;
  const activeStation =
    openId != null ? ivddStations.find((s) => s.id === openId) ?? null : null;

  const openStation = useCallback(
    (sid: number) => navigate(`/ivdd/station/${sid}`),
    [navigate],
  );
  const closeStation = useCallback(() => navigate("/ivdd"), [navigate]);

  const [activePhase, setActivePhase] = useState<IVDDPhaseId | null>("ivdd-classify");
  const bandRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const pid = (visible.target as HTMLElement).dataset.phase as IVDDPhaseId;
          if (pid) setActivePhase(pid);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    bandRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <PhaseNav
        activePhase={activePhase as unknown as PhaseId}
        overridePhases={adaptedPhases}
      />

      <main
        className="mx-auto"
        style={{
          maxWidth: "var(--max-w)",
          padding: "var(--s-12) var(--margin) var(--s-16)",
        }}
      >
        {/* Hero */}
        <header style={{ marginBottom: "var(--s-10)" }}>
          <span
            className="inline-flex items-center gap-2 rounded-full font-semibold"
            style={{
              background: "var(--p2-tint)",
              color: "var(--p2)",
              fontSize: "var(--t-sm)",
              padding: "4px 12px",
            }}
          >
            <Activity size={16} strokeWidth={2.5} aria-hidden />
            IVDD 98/79/EC 인증 여정 · 4 페이즈 7 정거장
          </span>
          <h1
            className="font-extrabold text-text"
            style={{
              fontSize: "var(--t-3xl)",
              lineHeight: "var(--lh-tight)",
              marginTop: "var(--s-4)",
              maxWidth: 760,
            }}
          >
            <span style={{ color: "var(--p2)" }}>
              분류 확인 · 기술문서 · 적합성 평가 · CE 마킹
            </span>
          </h1>
          <p
            className="text-text-muted"
            style={{
              fontSize: "var(--t-lg)",
              marginTop: "var(--s-4)",
              maxWidth: 640,
            }}
          >
            98/79/EC Directive 기반 체외진단기기 인증 여정. 카드를 누르면 단계별 할 일과 문서 목록이 열린다.
          </p>

          {/* IVDR 전환 배너 */}
          <div
            className="rounded-[var(--r-md)]"
            style={{
              background: "var(--warning-bg)",
              borderLeft: "4px solid var(--warning)",
              padding: "var(--s-4)",
              marginTop: "var(--s-5)",
              maxWidth: 640,
            }}
          >
            <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 4 }}>
              ⚠️ IVDR 전환 마감 일정
            </p>
            <ul className="text-text-muted" style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)" }}>
              <li>Class D (List A) → <strong>2025.5.26</strong> (경과)</li>
              <li>Class C (List B) → <strong>2026.5.26</strong></li>
              <li>Class B/A (일반+자가검사) → <strong>2027.5.26</strong></li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3" style={{ marginTop: "var(--s-6)" }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-bold text-text-muted hover:bg-surface"
              style={{
                borderColor: "var(--border)",
                fontSize: "var(--t-sm)",
                padding: "11px 18px",
                minHeight: 44,
              }}
            >
              ← 인증 허브
            </Link>
            <Link
              to="/ivdr"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-bold text-text hover:bg-surface"
              style={{
                borderColor: "var(--border-strong)",
                fontSize: "var(--t-sm)",
                padding: "11px 18px",
                minHeight: 44,
              }}
            >
              <ChevronRight size={18} aria-hidden />
              IVDR 여정 보기
            </Link>
            <Link
              to="/wiki"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-bold text-text hover:bg-surface"
              style={{
                borderColor: "var(--border-strong)",
                fontSize: "var(--t-sm)",
                padding: "11px 18px",
                minHeight: 44,
              }}
            >
              <Library size={18} style={{ color: "var(--info)" }} aria-hidden />
              개념 위키
            </Link>
          </div>
        </header>

        {/* 4 페이즈 밴드 */}
        <div className="flex flex-col" style={{ gap: "var(--s-8)" }}>
          {adaptedPhases.map((p) => (
            <PhaseBand
              key={p.id}
              phase={p}
              stations={stationsByPhase[p.id] ?? []}
              activeId={openId ?? undefined}
              onOpen={openStation}
              registerRef={(el) => {
                if (el) {
                  el.dataset.phase = p.id;
                  bandRefs.current.set(p.id, el);
                } else {
                  bandRefs.current.delete(p.id);
                }
              }}
            />
          ))}
        </div>

        <footer
          className="text-text-subtle"
          style={{
            fontSize: "var(--t-xs)",
            marginTop: "var(--s-12)",
            lineHeight: "var(--lh-base)",
          }}
        >
          98/79/EC 정보는 2026년 6월 기준입니다. IVDR 전환 일정·요건은 최신 EU 공식 문서로 확인하세요.
        </footer>
      </main>

      <IVDDStationPanel station={activeStation} onClose={closeStation} />
    </div>
  );
}
