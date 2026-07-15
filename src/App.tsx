import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
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

function RouteFallback() {
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <Loader2 size={26} className="animate-spin" style={{ color: "var(--text-subtle)" }} aria-label="불러오는 중" />
    </div>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <BrowserRouter basename={basename}>
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
          <Route path="*" element={<CertHub />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
