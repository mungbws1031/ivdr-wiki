import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, CheckCircle, Layers, Clock, Activity, Globe, CheckSquare, CalendarDays, PenLine, HelpCircle, ArrowRight, Library, Sparkles } from "lucide-react";
import { useProgress } from "../data/progress";
import { allLeaves } from "../data/docTree";
import { sharedDocIds } from "../data/schemes";
import { allISO13485DocIds } from "../data/iso13485/docTree";
import { concepts } from "../data/concepts";
import { getSpec } from "../hooks/useSpecStore";
import { completion } from "../data/spec/validate";
import { StorageNote } from "./StorageNote";

export function CertHub() {
  const ivdrProgress = useProgress("ivdr");
  const isoProgress = useProgress("iso13485");

  const ivdrDocIds = allLeaves().map((l) => l.id);
  const isoSharedIds = sharedDocIds();
  const isoSpecificIds = allISO13485DocIds();
  const isoDocIds = [...isoSharedIds, ...isoSpecificIds];

  const ivdrCount = ivdrProgress.countByStatus(ivdrDocIds);
  const isoCount = isoProgress.countByStatus(isoDocIds);
  // 자동작성에 이미 입력한 스펙이 있으면 "이어서" 링크를 보여 준다
  const specFilled = completion(getSpec()).filled;
  const navigate = useNavigate();
  const [concept, setConcept] = useState("");

  return (
    <div className="min-h-screen bg-bg">
      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-12) var(--margin) var(--s-16)" }}
      >
        {/* Hero — 정체성 한 문장 */}
        <header style={{ marginBottom: "var(--s-8)", textAlign: "center" }}>
          <span
            className="inline-flex items-center gap-2 rounded-full font-semibold"
            style={{ background: "var(--accent-weak)", color: "var(--accent)", fontSize: "var(--t-sm)", padding: "4px 12px" }}
          >
            <Layers size={16} strokeWidth={2.5} aria-hidden />
            IVDR 인증 허브
          </span>
          <h1
            className="font-extrabold text-text"
            style={{ fontSize: "var(--t-3xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-4)" }}
          >
            IVDR, 어디서 시작할까요?
          </h1>
          <p
            className="text-text-muted"
            style={{ fontSize: "var(--t-lg)", marginTop: "var(--s-4)", maxWidth: 680, margin: "var(--s-4) auto 0" }}
          >
            IVDR을 처음 접해도, 내 제품 한 줄 설명에서 시작해 인증 계획과 문서 초안까지 따라가며 배워요.
          </p>
        </header>

        {/* 입구는 둘만 — 처음이에요 / 내 제품이 있어요 */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--s-4)", marginBottom: "var(--s-6)" }}>
          <section aria-labelledby="entry-new" className="rounded-[var(--r-lg)] border flex flex-col" style={{ borderColor: "var(--border-strong)", background: "var(--bg)", padding: "var(--s-6)", gap: "var(--s-3)" }}>
            <div className="flex items-start" style={{ gap: "var(--s-4)" }}>
              <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 48, height: 48, background: "var(--surface)" }}>
                <Compass size={22} className="text-text" aria-hidden />
              </span>
              <span className="flex flex-col" style={{ gap: 4 }}>
                <h2 id="entry-new" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>IVDR이 처음이에요</h2>
                <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>인증이 무엇이고 어떤 순서로 가는지부터 봐요. 단계마다 우리 팀이 할 일이 먼저 나와요.</span>
              </span>
            </div>
            <div className="flex flex-wrap" style={{ gap: "var(--s-2)", marginLeft: 64 }}>
              <Link to="/ivdr" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold text-text-on-color" style={{ background: "var(--text)", fontSize: "var(--t-sm)", padding: "10px 16px", minHeight: 44 }}>
                IVDR 여정 지도 <ArrowRight size={15} aria-hidden />
              </Link>
              <Link to="/wiki" className="inline-flex items-center gap-1 rounded-[var(--r-md)] border font-bold text-text" style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "10px 16px", minHeight: 44 }}>
                <Library size={15} aria-hidden /> 개념 위키
              </Link>
            </div>
          </section>

          <section aria-labelledby="entry-product" className="rounded-[var(--r-lg)] border flex flex-col" style={{ borderColor: "var(--accent)", background: "var(--accent-weak)", padding: "var(--s-6)", gap: "var(--s-3)" }}>
            <div className="flex items-start" style={{ gap: "var(--s-4)" }}>
              <span className="inline-flex items-center justify-center rounded-full shrink-0" style={{ width: 48, height: 48, background: "var(--bg)" }}>
                <Sparkles size={22} style={{ color: "var(--accent)" }} aria-hidden />
              </span>
              <span className="flex flex-col" style={{ gap: 4 }}>
                <h2 id="entry-product" className="font-extrabold text-text" style={{ fontSize: "var(--t-xl)" }}>내 제품이 있어요</h2>
                <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>제품을 한 줄로 적으면 등급 → 일정 → 실험계획 → 문서 초안 → 추적성으로 이어져요.</span>
              </span>
            </div>
            <form
              className="flex flex-col sm:flex-row"
              style={{ gap: "var(--s-2)" }}
              onSubmit={(e) => {
                e.preventDefault();
                const t = concept.trim();
                navigate("/auto/start", t ? { state: { concept: t } } : undefined);
              }}
            >
              <label htmlFor="home-concept" className="sr-only">제품 한 줄 설명</label>
              <input
                id="home-concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="예: 집에서 쓰는 소변 LH 배란 스틱, 유럽·한국 출시"
                className="min-w-0 flex-1 rounded-[var(--r-md)] border bg-bg text-text"
                style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "10px 12px", minHeight: 44 }}
              />
              <button type="submit" className="inline-flex items-center justify-center gap-1 rounded-[var(--r-md)] font-bold text-text-on-color shrink-0" style={{ background: "var(--accent)", fontSize: "var(--t-sm)", padding: "10px 18px", minHeight: 44 }}>
                시작하기 <ArrowRight size={15} aria-hidden />
              </button>
            </form>
            {specFilled > 0 && (
              <Link to="/auto/overview" className="self-start font-semibold underline decoration-dotted text-text" style={{ fontSize: "var(--t-sm)" }}>
                이어서: 결과 한눈에 (제품 정보 {specFilled}칸 채움) →
              </Link>
            )}
          </section>
        </div>
        <div style={{ marginBottom: "var(--s-8)" }}><StorageNote /></div>

        {/* 나머지는 접어 둔다 — 인증 지도 4종·일정·준비 체크리스트·역사·위키·공통 문서 */}
        <details className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <summary className="cursor-pointer font-bold text-text" style={{ padding: "var(--s-4) var(--s-6)", minHeight: 44, fontSize: "var(--t-base)" }}>
            인증 지도(IVDR·ISO 13485·IVDD·MDSAP)와 다른 도구 모두 보기
          </summary>
          <div style={{ padding: "0 var(--s-6) var(--s-6)" }}>
        {/* 어느 인증인지 모르겠다면 — 상황별 추천 (규제 초심자를 위한 진입 가이드) */}
        <section
          className="rounded-[var(--r-lg)] border"
          style={{ borderColor: "var(--info)", background: "var(--info-bg)", padding: "var(--s-6) var(--s-8)", marginBottom: "var(--s-6)" }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
            <HelpCircle size={17} style={{ color: "var(--info)" }} aria-hidden />
            <span className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>어느 인증이 필요한지 모르겠다면?</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--s-4)" }}>
            {([
              {
                situation: "EU에 처음 출시하는 신제품이다",
                answer: "IVDR",
                detail: "CE 마킹을 받으려면 IVDR이 꼭 필요해요. 품질 시스템(QMS) 바탕이 되는 ISO 13485도 함께 준비해 주세요.",
                to: "/ivdr",
                color: "var(--accent)",
              },
              {
                situation: "이미 IVDD 인증이 있고, IVDR 전환 기한이 다가온다",
                answer: "IVDD → IVDR",
                detail: "먼저 IVDD 여정에서 내 등급(클래스)의 전환 기한을 확인한 뒤 IVDR로 넘어가세요.",
                to: "/ivdd",
                color: "var(--p2)",
              },
              {
                situation: "EU 외에 미국·캐나다·호주 등에도 동시 진출하고 싶다",
                answer: "MDSAP",
                detail: "ISO 13485 품질 시스템(QMS)을 바탕으로 5개국 규제를 한 번의 심사로 함께 맞출 수 있어요.",
                to: "/mdsap",
                color: "var(--p4)",
              },
            ] as const).map((r) => (
              <Link
                key={r.answer}
                to={r.to}
                className="flex flex-col rounded-[var(--r-md)] hover:shadow-sm transition-shadow"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "var(--s-4)" }}
              >
                <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginBottom: "var(--s-2)" }}>
                  "{r.situation}"
                </p>
                <div className="flex items-center gap-1.5 font-extrabold" style={{ color: r.color, fontSize: "var(--t-base)", marginBottom: 4 }}>
                  {r.answer}
                  <ArrowRight size={15} aria-hidden />
                </div>
                <p className="text-text-muted" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)" }}>{r.detail}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 인증 카드 */}
        <div
          id="certs"
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
              5 페이즈 · 11 정거장 · {ivdrDocIds.length}개 문서<br />
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
              IVDR 전환 일정·기한 확인
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
              약사법(1953)부터 EU IVDR 이중 의무(2025)까지 · 4개 시대 · 21개 사건
            </div>
          </div>
          <span className="font-bold shrink-0" style={{ color: "var(--info)", fontSize: "var(--t-sm)" }}>
            보기 →
          </span>
        </Link>

        {/* 개념 위키 진입점 */}
        <Link
          to="/wiki"
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
            <Library size={20} style={{ color: "var(--info)" }} aria-hidden />
          </span>
          <div>
            <div className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
              개념 위키 — 용어·부속서·표준 한눈에
            </div>
            <div className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>
              GSPR·UDI·NB 같은 낯선 용어를 검색·카테고리별로 정리 · 총 {concepts.length}개 개념
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
            공통 문서 <span style={{ color: "var(--accent)" }}>{isoSharedIds.length}개</span>
          </div>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-4)" }}>
            QMS · 설계관리 · 위험관리 · 기술/성능 증거 — 한 번 작성, 양쪽 인증에 반영
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/write"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] font-bold text-text-on-color"
              style={{ background: "var(--accent)", fontSize: "var(--t-sm)", padding: "10px 20px" }}
            >
              <PenLine size={15} aria-hidden />
              이제 문서를 써볼까?
            </Link>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border font-semibold text-text hover:bg-bg"
              style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "10px 16px" }}
            >
              문서 전체 보기
            </Link>
          </div>
        </section>

          </div>
        </details>

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

