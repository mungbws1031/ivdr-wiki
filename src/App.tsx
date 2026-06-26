import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CertHub } from "./components/CertHub";
import { JourneyMap } from "./components/JourneyMap";
import { ISO13485Map } from "./components/ISO13485Map";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import { DocumentTree } from "./components/DocumentTree";
import { ConceptPage } from "./components/ConceptPage";
import { WikiIndex } from "./components/WikiIndex";

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
        {/* 공유: 문서 트리 + 작성 워크스페이스 */}
        <Route path="/documents" element={<DocumentTree />} />
        <Route path="/doc/:id" element={<DocumentWorkspace />} />
        {/* 공유: 개념 위키 */}
        <Route path="/wiki" element={<WikiIndex />} />
        <Route path="/wiki/:slug" element={<ConceptPage />} />
        <Route path="*" element={<CertHub />} />
      </Routes>
    </BrowserRouter>
  );
}
