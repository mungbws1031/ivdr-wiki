// ivdr-wiki/src/components/ISO13485Map.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, FolderTree, Library } from "lucide-react";
import {
  iso13485Phases,
  iso13485Stations,
  type ISO13485PhaseId,
} from "../data/iso13485/stations";
import { PhaseBand } from "./PhaseBand";
import { PhaseNav } from "./PhaseNav";
import { StationDetail } from "./StationDetail";
import type { Phase, Station, PhaseId } from "../data/stations";

function adaptPhase(p: typeof iso13485Phases[0]): Phase {
  return { ...p, id: p.id as unknown as PhaseId };
}

function adaptStation(s: typeof iso13485Stations[0]): Station {
  return { ...s, phase: s.phase as unknown as PhaseId };
}

export function ISO13485Map() {
  const navigate = useNavigate();
  const { id } = useParams();

  const adaptedPhases = useMemo(() => iso13485Phases.map(adaptPhase), []);
  const adaptedStations = useMemo(() => iso13485Stations.map(adaptStation), []);

  const stationsByPhase = useMemo(() => {
    const map = {} as Record<string, Station[]>;
    for (const p of adaptedPhases) {
      map[p.id] = adaptedStations.filter((s) => s.phase === p.id);
    }
    return map;
  }, [adaptedPhases, adaptedStations]);

  const openId = id ? Number(id) : null;
  const activeStation =
    openId != null
      ? adaptedStations.find((s) => s.id === openId) ?? null
      : null;

  const openStation = useCallback(
    (sid: number) => navigate(`/iso13485/station/${sid}`),
    [navigate],
  );
  const closeStation = useCallback(() => navigate("/iso13485"), [navigate]);

  const [activePhase, setActivePhase] = useState<ISO13485PhaseId | null>("qms");
  const bandRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const pid = (visible.target as HTMLElement).dataset
            .phase as ISO13485PhaseId;
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
        <header style={{ marginBottom: "var(--s-12)" }}>
          <span
            className="inline-flex items-center gap-2 rounded-full font-semibold"
            style={{
              background: "var(--p3-tint)",
              color: "var(--p3)",
              fontSize: "var(--t-sm)",
              padding: "4px 12px",
            }}
          >
            <CheckCircle size={16} strokeWidth={2.5} aria-hidden />
            ISO 13485 인증 여정 · 4 페이즈 10 정거장
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
            <span style={{ color: "var(--p3)" }}>
              QMS 수립 · 심사 준비 · 지속 개선
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
            Clause 4–8을 4개 페이즈로 구분했다. 카드를 누르면 본문·지금 할
            일·관련 조항이 열린다.
          </p>

          <div className="flex flex-wrap gap-3" style={{ marginTop: "var(--s-6)" }}>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color"
              style={{
                background: "var(--p3)",
                fontSize: "var(--t-sm)",
                padding: "11px 18px",
                minHeight: 44,
              }}
            >
              <FolderTree size={18} aria-hidden />
              공통 문서 전체 보기
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
          ISO 13485:2016 내용은 2026년 6월 기준 확인값입니다. 실제 인증 진행 시
          최신 표준 원문·인증기관 요건으로 재확인하세요.
        </footer>
      </main>

      <StationDetail station={activeStation} onClose={closeStation} />
    </div>
  );
}
