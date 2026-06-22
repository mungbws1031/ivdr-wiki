import { BrowserRouter, Route, Routes } from "react-router-dom";
import { JourneyMap } from "./components/JourneyMap";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 단일 랜딩 + 딥링크 상세 — 둘 다 JourneyMap이 처리(drawer) */}
        <Route path="/" element={<JourneyMap />} />
        <Route path="/station/:id" element={<JourneyMap />} />
        <Route path="*" element={<JourneyMap />} />
      </Routes>
    </BrowserRouter>
  );
}
