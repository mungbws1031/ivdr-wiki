import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Award, ChevronRight, FileText, Library, X, FolderTree } from "lucide-react";
import {
  mdsapPhases,
  mdsapStations,
  type MDSAPPhaseId,
  type MDSAPStation,
} from "../data/mdsap/stations";
import { mdsapLeavesByStation, allMDSAPDocIds } from "../data/mdsap/docTree";
import { PhaseBand } from "./PhaseBand";
import { PhaseNav } from "./PhaseNav";
import { StatusChip } from "./StatusChip";
import type { Phase, Station, PhaseId } from "../data/stations";

function adaptPhase(p: typeof mdsapPhases[0]): Phase {
  return { ...p, id: p.id as unknown as PhaseId };
}

function adaptStation(s: MDSAPStation): Station {
  return { ...s, phase: s.phase as unknown as PhaseId };
}

function MDSAPStationPanel({
  station,
  onClose,
}: {
  station: MDSAPStation | null;
  onClose: () => void;
}) {
  if (!station) return null;
  const docs = mdsapLeavesByStation(station.id);

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
              <FileText size={16} style={{ color: "var(--p4)" }} aria-hidden />
              <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>
                이 단계에서 써야 할 문서
              </span>
              <span
                className="rounded-full font-bold text-text-on-color"
                style={{ background: "var(--p4)", fontSize: "var(--t-xs)", padding: "1px 8px" }}
              >
                {docs.length}
              </span>
            </div>
            <ul>
              {docs.map((d) => (
                <li key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Link to={`/doc/${d.id}`} className="flex items-center gap-2 hover:bg-bg" style={{ padding: "9px 12px" }}>
                    <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 8, height: 8, background: "var(--p4)" }} />
                    <span className="flex-1 font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
                      {d.title}
                    </span>
                    {d.requirement === "conditional" && (
                      <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>조건부</span>
                    )}
                    <ChevronRight size={14} style={{ color: "var(--text-subtle)" }} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 본문 */}
        <div className="flex flex-col" style={{ gap: "var(--s-3)", marginTop: "var(--s-5)" }}>
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
            background: "var(--p4-tint)",
            borderLeft: "4px solid var(--p4)",
            padding: "var(--s-4)",
            marginTop: "var(--s-5)",
          }}
        >
          <span className="font-bold" style={{ color: "var(--p4)", fontSize: "var(--t-sm)" }}>
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

/** 정거장을 하나씩 열지 않아도 전체 14개 문서를 한눈에 보는 목록. */
function MDSAPDocumentList() {
  const [open, setOpen] = useState(true);
  const total = allMDSAPDocIds().length;

  return (
    <section
      className="rounded-[var(--r-lg)] overflow-hidden"
      style={{ border: "1px solid var(--border)", marginBottom: "var(--s-10)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
        style={{ padding: "var(--s-4) var(--s-5)", background: "var(--surface)" }}
      >
        <span
          className="grid shrink-0 place-items-center rounded-full"
          style={{ width: 32, height: 32, background: "var(--p4)" }}
          aria-hidden
        >
          <FolderTree size={17} style={{ color: "#fff" }} />
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>
            써야 할 문서 전체 목록
          </span>
          <span className="ml-2 text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
            {total}개 · 정거장 순서대로
          </span>
        </div>
        <ChevronRight
          size={18}
          style={{ color: "var(--text-subtle)", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
          aria-hidden
        />
      </button>

      {open && (
        <div style={{ padding: "var(--s-5)", background: "var(--bg)" }}>
          <div className="flex flex-col" style={{ gap: "var(--s-4)" }}>
            {mdsapStations.map((station) => {
              const docs = mdsapLeavesByStation(station.id);
              if (docs.length === 0) return null;
              return (
                <div key={station.id}>
                  <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-2)" }}>
                    <span
                      className="grid shrink-0 place-items-center rounded-full font-extrabold text-text-on-color"
                      style={{ width: 22, height: 22, background: "var(--p4)", fontSize: 11 }}
                      aria-hidden
                    >
                      {station.id}
                    </span>
                    <Link
                      to={`/mdsap/station/${station.id}`}
                      className="font-bold text-text hover:underline"
                      style={{ fontSize: "var(--t-sm)" }}
                    >
                      {station.title}
                    </Link>
                    <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{docs.length}개</span>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 6, marginLeft: 30 }}>
                    {docs.map((d) => (
                      <Link
                        key={d.id}
                        to={`/doc/${d.id}`}
                        className="flex items-center gap-2 rounded-[var(--r-sm)] hover:bg-surface transition-colors"
                        style={{ border: "1px solid var(--border)", padding: "7px 10px" }}
                      >
                        <FileText size={13} style={{ color: "var(--p4)", flexShrink: 0 }} aria-hidden />
                        <span className="flex-1 min-w-0 text-text" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
                          {d.title}
                        </span>
                        {d.requirement === "conditional" && (
                          <span className="text-text-subtle shrink-0" style={{ fontSize: 10 }}>조건부</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function MDSAPMap() {
  const navigate = useNavigate();
  const { id } = useParams();

  const adaptedPhases = useMemo(() => mdsapPhases.map(adaptPhase), []);
  const adaptedStations = useMemo(() => mdsapStations.map(adaptStation), []);

  const stationsByPhase = useMemo(() => {
    const map = {} as Record<string, Station[]>;
    for (const p of adaptedPhases) {
      map[p.id] = adaptedStations.filter((s) => s.phase === p.id);
    }
    return map;
  }, [adaptedPhases, adaptedStations]);

  const openId = id ? Number(id) : null;
  const activeStation =
    openId != null ? mdsapStations.find((s) => s.id === openId) ?? null : null;

  const openStation = useCallback(
    (sid: number) => navigate(`/mdsap/station/${sid}`),
    [navigate],
  );
  const closeStation = useCallback(() => navigate("/mdsap"), [navigate]);

  const [activePhase, setActivePhase] = useState<MDSAPPhaseId | null>("mdsap-prep");
  const bandRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const pid = (visible.target as HTMLElement).dataset.phase as MDSAPPhaseId;
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
              background: "var(--p4-tint)",
              color: "var(--p4)",
              fontSize: "var(--t-sm)",
              padding: "4px 12px",
            }}
          >
            <Award size={16} strokeWidth={2.5} aria-hidden />
            MDSAP 인증 여정 · 4 페이즈 7 정거장
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
            <span style={{ color: "var(--p4)" }}>
              갭 분석 · QMS 구축 · NB 심사 · 인정 유지
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
            의료기기 단일 심사 프로그램 — 하나의 심사로 5개국 규제 요건을 동시 충족한다.
          </p>

          {/* 5개국 배지 */}
          <div className="flex flex-wrap items-center gap-3" style={{ marginTop: "var(--s-5)" }}>
            {[
              { flag: "🇺🇸", name: "미국 FDA" },
              { flag: "🇨🇦", name: "캐나다 HC" },
              { flag: "🇧🇷", name: "브라질 ANVISA" },
              { flag: "🇦🇺", name: "호주 TGA" },
              { flag: "🇯🇵", name: "일본 PMDA" },
            ].map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 rounded-full font-semibold text-text"
                style={{
                  background: "var(--p4-tint)",
                  border: "1px solid var(--p4)",
                  fontSize: "var(--t-xs)",
                  padding: "4px 10px",
                }}
              >
                {c.flag} {c.name}
              </span>
            ))}
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
              to="/iso13485"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-bold text-text hover:bg-surface"
              style={{
                borderColor: "var(--border-strong)",
                fontSize: "var(--t-sm)",
                padding: "11px 18px",
                minHeight: 44,
              }}
            >
              ISO 13485 여정 보기
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

        {/* 써야 할 문서 전체 목록 */}
        <MDSAPDocumentList />

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
          MDSAP 정보는 2026년 6월 기준입니다. 각국 규제 변경 사항은 최신 IMDRF·규제기관 공고를 참조하세요.
        </footer>
      </main>

      <MDSAPStationPanel station={activeStation} onClose={closeStation} />
    </div>
  );
}
