import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CertHub } from "./components/CertHub";
import { JourneyMap } from "./components/JourneyMap";
import { ISO13485Map } from "./components/ISO13485Map";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import { DocumentTree } from "./components/DocumentTree";
import { WriteHub } from "./components/WriteHub";
import { ConceptPage } from "./components/ConceptPage";
import { WikiIndex } from "./components/WikiIndex";
import { HistoryPage } from "./components/HistoryPage";
import { IVDDMap } from "./components/IVDDMap";
import { MDSAPMap } from "./components/MDSAPMap";
import { PrepNotePage } from "./components/PrepNotePage";
import { SchedulePlanner } from "./components/SchedulePlanner";

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <BrowserRouter basename={basename}>
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
    </BrowserRouter>
  );
}
