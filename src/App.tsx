import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { CertHub } from "./components/CertHub"; // 랜딩 — 첫 화면이라 즉시 로딩

// 나머지 라우트는 지연 로딩해 첫 진입 번들을 줄인다 (named export → default 래핑).
const JourneyMap = lazy(() => import("./components/JourneyMap").then((m) => ({ default: m.JourneyMap })));
const ISO13485Map = lazy(() => import("./components/ISO13485Map").then((m) => ({ default: m.ISO13485Map })));
const DocumentWorkspace = lazy(() => import("./components/DocumentWorkspace").then((m) => ({ default: m.DocumentWorkspace })));
const DocumentTree = lazy(() => import("./components/DocumentTree").then((m) => ({ default: m.DocumentTree })));
const WriteHub = lazy(() => import("./components/WriteHub").then((m) => ({ default: m.WriteHub })));
const ConceptPage = lazy(() => import("./components/ConceptPage").then((m) => ({ default: m.ConceptPage })));
const WikiIndex = lazy(() => import("./components/WikiIndex").then((m) => ({ default: m.WikiIndex })));
const HistoryPage = lazy(() => import("./components/HistoryPage").then((m) => ({ default: m.HistoryPage })));
const IVDDMap = lazy(() => import("./components/IVDDMap").then((m) => ({ default: m.IVDDMap })));
const MDSAPMap = lazy(() => import("./components/MDSAPMap").then((m) => ({ default: m.MDSAPMap })));
const PrepNotePage = lazy(() => import("./components/PrepNotePage").then((m) => ({ default: m.PrepNotePage })));
const SchedulePlanner = lazy(() => import("./components/SchedulePlanner").then((m) => ({ default: m.SchedulePlanner })));
const SpecPage = lazy(() => import("./components/auto/SpecPage").then((m) => ({ default: m.SpecPage })));
const DocSetPage = lazy(() => import("./components/auto/DocSetPage").then((m) => ({ default: m.DocSetPage })));
const UsPage = lazy(() => import("./components/auto/UsPage").then((m) => ({ default: m.UsPage })));
const StartPage = lazy(() => import("./components/auto/StartPage").then((m) => ({ default: m.StartPage })));
const TracePage = lazy(() => import("./components/auto/TracePage").then((m) => ({ default: m.TracePage })));
const MarketPage = lazy(() => import("./components/auto/MarketPage").then((m) => ({ default: m.MarketPage })));
const KrPage = lazy(() => import("./components/auto/KrPage").then((m) => ({ default: m.KrPage })));
const OverviewPage = lazy(() => import("./components/auto/OverviewPage").then((m) => ({ default: m.OverviewPage })));
const ResultsPage = lazy(() => import("./components/auto/ResultsPage").then((m) => ({ default: m.ResultsPage })));
const FactoryPage = lazy(() => import("./components/auto/FactoryPage").then((m) => ({ default: m.FactoryPage })));
const PlanPage = lazy(() => import("./components/auto/PlanPage").then((m) => ({ default: m.PlanPage })));
const TransportPage = lazy(() => import("./components/auto/TransportPage").then((m) => ({ default: m.TransportPage })));

function RouteFallback() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <Loader2 size={26} className="animate-spin" style={{ color: "var(--text-subtle)" }} aria-label="불러오는 중" />
    </div>
  );
}

/**
 * 다른 페이지로 옮기면 맨 위에서 열리게 한다.
 * - 같은 지도 안에서 정거장만 바꿀 때(/ivdr/station/3 → /ivdr/station/4)는 그대로 둔다.
 * - #주소(앵커)가 있으면 그 페이지가 알아서 스크롤하니 건드리지 않는다.
 * - 뒤로 가기(POP)는 브라우저가 기억한 위치를 쓰게 둔다.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  const base = pathname.replace(/\/station\/[^/]+$/, "");
  const prev = useRef(base);
  useEffect(() => {
    if (prev.current === base) return;
    prev.current = base;
    if (!hash && navType !== "POP") window.scrollTo(0, 0);
  }, [base, hash, navType]);
  return null;
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* 인증 선택 허브 */}
          <Route path="/" element={<CertHub />} />
          {/* IVDR 여정 */}
          <Route path="/ivdr" element={<JourneyMap />} />
          <Route path="/ivdr/station/:id" element={<JourneyMap />} />
          {/* ISO 13485 여정 */}
          <Route path="/iso13485" element={<ISO13485Map />} />
          <Route path="/iso13485/station/:id" element={<ISO13485Map />} />
          {/* 문서 작성 허브 + 트리 + 워크스페이스 */}
          <Route path="/write" element={<WriteHub />} />
          <Route path="/documents" element={<DocumentTree />} />
          <Route path="/doc/:id" element={<DocumentWorkspace />} />
          {/* 공유: 개념 위키 */}
          <Route path="/wiki" element={<WikiIndex />} />
          <Route path="/wiki/:slug" element={<ConceptPage />} />
          {/* 규제 역사 인포그래픽 */}
          <Route path="/history" element={<HistoryPage />} />
          {/* IVDD 여정 */}
          <Route path="/ivdd" element={<IVDDMap />} />
          <Route path="/ivdd/station/:id" element={<IVDDMap />} />
          {/* MDSAP 여정 */}
          <Route path="/mdsap" element={<MDSAPMap />} />
          <Route path="/mdsap/station/:id" element={<MDSAPMap />} />
          {/* 사전 준비 체크리스트 */}
          <Route path="/prep-notes" element={<PrepNotePage />} />
          {/* 프로젝트 일정 플래너 */}
          <Route path="/schedule" element={<SchedulePlanner />} />
          {/* 자동작성: 제품 스펙 */}
          <Route path="/auto" element={<SpecPage />} />
          <Route path="/auto/start" element={<StartPage />} />
          <Route path="/auto/market" element={<MarketPage />} />
          <Route path="/auto/trace" element={<TracePage />} />
          <Route path="/auto/docs" element={<DocSetPage />} />
          <Route path="/auto/kr" element={<KrPage />} />
          <Route path="/auto/us" element={<UsPage />} />
          <Route path="/auto/transport" element={<TransportPage />} />
          <Route path="/auto/plan" element={<PlanPage />} />
          <Route path="/auto/overview" element={<OverviewPage />} />
          <Route path="/auto/results" element={<ResultsPage />} />
          <Route path="/auto/factory" element={<FactoryPage />} />
          <Route path="*" element={<CertHub />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
