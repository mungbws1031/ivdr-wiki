import { BrowserRouter, Route, Routes } from "react-router-dom";
import { JourneyMap } from "./components/JourneyMap";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import { ConceptPage } from "./components/ConceptPage";
import { WikiIndex } from "./components/WikiIndex";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 랜딩 + 딥링크 상세(drawer) */}
        <Route path="/" element={<JourneyMap />} />
        <Route path="/station/:id" element={<JourneyMap />} />
        {/* 문서 작성 워크스페이스 */}
        <Route path="/doc/:id" element={<DocumentWorkspace />} />
        {/* 개념 위키 */}
        <Route path="/wiki" element={<WikiIndex />} />
        <Route path="/wiki/:slug" element={<ConceptPage />} />
        <Route path="*" element={<JourneyMap />} />
      </Routes>
    </BrowserRouter>
  );
}
