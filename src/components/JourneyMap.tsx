import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Compass, FolderTree, Library } from "lucide-react";
import { phases, stations, type PhaseId } from "../data/stations";
import { PhaseBand } from "./PhaseBand";
import { PhaseNav } from "./PhaseNav";
import { DecisionFork } from "./DecisionFork";
import { TransitionTimeline } from "./TransitionTimeline";
import { StationDetail } from "./StationDetail";

/**
 * 랜딩 전체 지도 — 5 PhaseBand을 세로로. 한 화면에 전모.
 * 딥링크 /station/:id 로 상세 직접 진입. esc/overlay로 닫으면 / 로 복귀.
 */
export function JourneyMap() {
  const navigate = useNavigate();
  const { id } = useParams();

  const stationsByPhase = useMemo(() => {
    const map = {} as Record<PhaseId, typeof stations>;
    for (const p of phases) map[p.id] = stations.filter((s) => s.phase === p.id);
    return map;
  }, []);

  const fork = stations.find((s) => s.id === 2)?.forks ?? [];

  // 딥링크 → 열린 정거장
  const openId = id ? Number(id) : null;
  const activeStation =
    openId != null ? stations.find((s) => s.id === openId) ?? null : null;

  const openStation = useCallback(
    (sid: number) => navigate(`/station/${sid}`),
    [navigate],
  );
  const closeStation = useCallback(() => navigate("/"), [navigate]);

  // scroll-spy: 현재 화면의 페이즈 강조
  const [activePhase, setActivePhase] = useState<PhaseId | null>("p1");
  const bandRefs = useRef<Map<PhaseId, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const pid = (visible.target as HTMLElement).dataset.phase as PhaseId;
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
      <PhaseNav activePhase={activePhase} />

      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: `var(--s-12) var(--margin) var(--s-16)` }}
      >
        {/* ── Hero: 한 줄 목표 ── */}
        <header style={{ marginBottom: "var(--s-12)" }}>
          <span
            className="inline-flex items-center gap-2 rounded-full font-semibold"
            style={{
              background: "var(--accent-weak)",
              color: "var(--accent)",
              fontSize: "var(--t-sm)",
              padding: "5px 14px",
            }}
          >
            <Compass size={16} strokeWidth={2.5} aria-hidden />
            IVDR 인증 여정 · 5 페이즈 11 정거장
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
            글을 읽지 않고도 한눈에
            <br />
            <span style={{ color: "var(--accent)" }}>전체 여정 · 지금 위치 · 다음 할 일</span>
          </h1>
          <p
            className="text-text-muted"
            style={{ fontSize: "var(--t-lg)", marginTop: "var(--s-4)", maxWidth: 640 }}
          >
            11개 정거장을 5개 페이즈로 묶어 색으로 구분했다. 카드를 누르면 본문·지금 할 일·관련
            조항이 열린다. 개요는 늘 깨끗하게.
          </p>

          {/* 진입 버튼 */}
          <div className="flex flex-wrap gap-3" style={{ marginTop: "var(--s-6)" }}>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color"
              style={{ background: "var(--accent)", fontSize: "var(--t-sm)", padding: "11px 18px", minHeight: 44 }}
            >
              <FolderTree size={18} aria-hidden />
              써야 할 문서 전체 보기
            </Link>
            <Link
              to="/wiki"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-bold text-text hover:bg-surface"
              style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "11px 18px", minHeight: 44 }}
            >
              <Library size={18} style={{ color: "var(--info)" }} aria-hidden />
              개념 위키
            </Link>
          </div>
        </header>

        {/* ── 5 페이즈 밴드 (+ P2 뒤 결정 갈림길 히어로) ── */}
        <div className="flex flex-col" style={{ gap: "var(--s-8)" }}>
          {phases.map((p) => (
            <div key={p.id} className="flex flex-col" style={{ gap: "var(--s-8)" }}>
              <PhaseBand
                phase={p}
                stations={stationsByPhase[p.id]}
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
              {p.id === "p2" && fork.length > 0 && (
                <DecisionFork forks={fork} onOpenStation={openStation} />
              )}
            </div>
          ))}

          {/* ── 전환 기한 타임라인 ── */}
          <TransitionTimeline />
        </div>

        <footer
          className="text-text-subtle"
          style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-12)", lineHeight: "var(--lh-base)" }}
        >
          규제 날짜는 2026년 6월 기준 확인값입니다. 실제 인증 진행 시 최신 관보·인증기관 공지로
          반드시 재확인하세요. 본 가이드는 정보 제공용이며 법적 자문이 아닙니다.
        </footer>
      </main>

      <StationDetail station={activeStation} onClose={closeStation} />
    </div>
  );
}
