import { Link } from "react-router-dom";
import { Compass, CheckCircle, Layers, Clock, Activity, Globe, CheckSquare, CalendarDays } from "lucide-react";
import { useProgress } from "../data/progress";
import { allLeaves } from "../data/docTree";
import { sharedDocIds } from "../data/schemes";
import { allISO13485DocIds } from "../data/iso13485/docTree";

export function CertHub() {
  const ivdrProgress = useProgress("ivdr");
  const isoProgress = useProgress("iso13485");

  const ivdrDocIds = allLeaves().map((l) => l.id);
  const isoSharedIds = sharedDocIds();
  const isoSpecificIds = allISO13485DocIds();
  const isoDocIds = [...isoSharedIds, ...isoSpecificIds];

  const ivdrCount = ivdrProgress.countByStatus(ivdrDocIds);
  const isoCount = isoProgress.countByStatus(isoDocIds);

  return (
    <div className="min-h-screen bg-bg">
      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-12) var(--margin) var(--s-16)" }}
      >
        {/* Hero */}
        <header style={{ marginBottom: "var(--s-12)", textAlign: "center" }}>
          <span
            className="inline-flex items-center gap-2 rounded-full font-semibold"
            style={{ background: "var(--accent-weak)", color: "var(--accent)", fontSize: "var(--t-sm)", padding: "4px 12px" }}
          >
            <Layers size={16} strokeWidth={2.5} aria-hidden />
            의료기기 인증 문서 작성 플랫폼
          </span>
          <h1
            className="font-extrabold text-text"
            style={{ fontSize: "var(--t-3xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-4)" }}
          >
            인증을 선택하세요
          </h1>
          <p
            className="text-text-muted"
            style={{ fontSize: "var(--t-lg)", marginTop: "var(--s-4)", maxWidth: 560, margin: "var(--s-4) auto 0" }}
          >
            공통 문서는 한 번 작성하면 양쪽 인증에 반영됩니다.
          </p>
        </header>

        {/* 인증 카드 */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "var(--s-6)", marginBottom: "var(--s-12)" }}
        >
          <Link
            to="/ivdr"
            className="rounded-[var(--r-lg)] border block hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            style={{ borderColor: "var(--accent)", background: "var(--surface)", padding: "var(--s-8)", transition: "box-shadow 0.15s" }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: "var(--s-4)" }}>
              <span
                className="inline-flex items-center justify-center rounded-full shrink-0"
                style={{ width: 48, height: 48, background: "var(--accent-weak)" }}
              >
                <Compass size={24} style={{ color: "var(--accent)" }} aria-hidden />
              </span>
              <div>
                <div className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>IVDR</div>
                <div className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>EU 체외진단기기 규정</div>
              </div>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)", marginBottom: "var(--s-6)" }}>
              5 페이즈 · 11 정거장 · 75개 문서<br />
              Regulation (EU) 2017/746 — CE 마킹 취득
            </p>
            <div className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginBottom: "var(--s-2)" }}>
              완료 {ivdrCount.done} / {ivdrCount.total}개
              {ivdrCount.inProgress > 0 && ` · 작성 중 ${ivdrCount.inProgress}개`}
            </div>
            <span className="font-bold" style={{ color: "var(--accent)", fontSize: "var(--t-sm)" }}>
              여정 시작 →
            </span>
          </Link>

          <Link
            to="/iso13485"
            className="rounded-[var(--r-lg)] border block hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p3)]"
            style={{ borderColor: "var(--p3)", background: "var(--surface)", padding: "var(--s-8)", transition: "box-shadow 0.15s" }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: "var(--s-4)" }}>
              <span
                className="inline-flex items-center justify-center rounded-full shrink-0"
                style={{ width: 48, height: 48, background: "var(--p3-tint)" }}
              >
                <CheckCircle size={24} style={{ color: "var(--p3)" }} aria-hidden />
              </span>
              <div>
                <div className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>ISO 13485</div>
                <div className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>의료기기 품질경영시스템</div>
              </div>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)", marginBottom: "var(--s-6)" }}>
              4 페이즈 · 10 정거장 · 전용 + 공통 문서<br />
              ISO 13485:2016 — QMS 인증 취득
            </p>
            <div className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginBottom: "var(--s-2)" }}>
              완료 {isoCount.done} / {isoCount.total}개
              {isoCount.inProgress > 0 && ` · 작성 중 ${isoCount.inProgress}개`}
            </div>
            <span className="font-bold" style={{ color: "var(--p3)", fontSize: "var(--t-sm)" }}>
              여정 시작 →
            </span>
          </Link>

          <Link
            to="/ivdd"
            className="rounded-[var(--r-lg)] border block hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p2)]"
            style={{ borderColor: "var(--p2)", background: "var(--surface)", padding: "var(--s-8)", transition: "box-shadow 0.15s" }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: "var(--s-4)" }}>
              <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 48, height: 48, background: "var(--p2-tint)" }}>
                <Activity size={24} style={{ color: "var(--p2)" }} aria-hidden />
              </span>
              <div>
                <div className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>IVDD</div>
                <div className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>98/79/EC 체외진단기기 지침</div>
              </div>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)", marginBottom: "var(--s-6)" }}>
              4 페이즈 · 7 정거장 · IVDR 전환 기한 대응<br />
              Class D→2025 · Class C→2026 · Class B→2027
            </p>
            <span className="font-bold" style={{ color: "var(--p2)", fontSize: "var(--t-sm)" }}>
              여정 시작 →
            </span>
          </Link>

          <Link
            to="/mdsap"
            className="rounded-[var(--r-lg)] border block hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p4)]"
            style={{ borderColor: "var(--p4)", background: "var(--surface)", padding: "var(--s-8)", transition: "box-shadow 0.15s" }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: "var(--s-4)" }}>
              <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 48, height: 48, background: "var(--p4-tint)" }}>
                <Globe size={24} style={{ color: "var(--p4)" }} aria-hidden />
              </span>
              <div>
                <div className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>MDSAP</div>
                <div className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>의료기기 단일 심사 프로그램</div>
              </div>
            </div>
            <p className="text-text-muted" style={{ fontSize: "var(--t-base)", lineHeight: "var(--lh-base)", marginBottom: "var(--s-6)" }}>
              4 페이즈 · 7 정거장 · 5개국 동시 인정<br />
              🇺🇸🇨🇦🇧🇷🇦🇺🇯🇵 FDA · Health Canada · ANVISA · TGA · PMDA
            </p>
            <span className="font-bold" style={{ color: "var(--p4)", fontSize: "var(--t-sm)" }}>
              여정 시작 →
            </span>
          </Link>
        </div>

        {/* 프로젝트 일정 플래너 */}
        <Link
          to="/schedule"
          className="block rounded-[var(--r-lg)] border hover:shadow-md"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            padding: "var(--s-5) var(--s-8)",
            marginBottom: "var(--s-6)",
            transition: "box-shadow 0.15s",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "var(--s-5)",
            alignItems: "center",
          }}
        >
          <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 44, height: 44, background: "var(--accent-weak)" }}>
            <CalendarDays size={20} style={{ color: "var(--accent)" }} aria-hidden />
          </span>
          <div>
            <div className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
              프로젝트 일정 플래너
            </div>
            <div className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
              인증별 마일스톤 날짜 설정 · 타임라인 시각화 · IVDR · ISO 13485 · IVDD · MDSAP
            </div>
          </div>
          <span className="font-bold shrink-0" style={{ color: "var(--accent)", fontSize: "var(--t-sm)" }}>
            설정 →
          </span>
        </Link>

        {/* 사전 준비 체크리스트 */}
        <Link
          to="/prep-notes"
          className="block rounded-[var(--r-lg)] border hover:shadow-md"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            padding: "var(--s-5) var(--s-8)",
            marginBottom: "var(--s-6)",
            transition: "box-shadow 0.15s",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "var(--s-5)",
            alignItems: "center",
          }}
        >
          <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 44, height: 44, background: "var(--success-bg)" }}>
            <CheckSquare size={20} style={{ color: "var(--success)" }} aria-hidden />
          </span>
          <div>
            <div className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
              업무 시작 전 사전 준비 체크리스트
            </div>
            <div className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
              인증별 문서 작성 전 미리 준비해 둘 자료·메모 목록 · IVDR · ISO 13485 · IVDD · MDSAP
            </div>
          </div>
          <span className="font-bold shrink-0" style={{ color: "var(--success)", fontSize: "var(--t-sm)" }}>
            보기 →
          </span>
        </Link>

        {/* 규제 역사 진입점 */}
        <Link
          to="/history"
          className="block rounded-[var(--r-lg)] border hover:shadow-md"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            padding: "var(--s-5) var(--s-8)",
            marginBottom: "var(--s-6)",
            transition: "box-shadow 0.15s",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "var(--s-5)",
            alignItems: "center",
          }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full shrink-0"
            style={{ width: 44, height: 44, background: "var(--info-bg)" }}
          >
            <Clock size={20} style={{ color: "var(--info)" }} aria-hidden />
          </span>
          <div>
            <div className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
              🇰🇷 규제 역사 60년 — 한국 × 해외 동시 비교 인포그래픽
            </div>
            <div className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
              약사법(1963)부터 EU IVDR 이중 의무(2025)까지 · 4개 시대 · 21개 사건
            </div>
          </div>
          <span className="font-bold shrink-0" style={{ color: "var(--info)", fontSize: "var(--t-sm)" }}>
            보기 →
          </span>
        </Link>

        {/* 공통 문서 강조 */}
        <section
          className="rounded-[var(--r-lg)] border text-center"
          style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-8)" }}
        >
          <div className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", marginBottom: "var(--s-2)" }}>
            공통 문서 <span style={{ color: "var(--accent)" }}>49개</span>
          </div>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-4)" }}>
            QMS · 설계관리 · 위험관리 · 기술/성능 증거 — 한 번 작성, 양쪽 인증에 반영
          </p>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-semibold text-text hover:bg-bg"
            style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "8px 16px" }}
          >
            문서 전체 보기
          </Link>
        </section>

        {/* Attribution */}
        <footer
          className="text-center"
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: "var(--s-12)",
            paddingTop: "var(--s-8)",
          }}
        >
          <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>
            작성/기획/아이디어: 연구개발본부 Self-Test 시스템팀 노미희<br />
            목적: IVDR 인증 여정별 산출물, 작성 가이드, 체크리스트, 선행문서를 한눈에 파악하기 위한 문서 시스템<br />
            기대효과: 신규 작성자 온보딩, 문서 누락 방지, 담당/기한 관리, 규제 요구사항-증거 연결
          </p>
        </footer>
      </main>
    </div>
  );
}

