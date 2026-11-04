import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { wikiContent } from "./vite/wikiContent";

// https://vite.dev/config/
// 배포(빌드)는 GitHub Pages 하위 경로(/ivdr-wiki/)에, 로컬 개발은 루트(/)에서.
// wikiContent: content/wiki/*.md(옵시디언 노트) → 개념 위키 데이터. 깨진 링크가 있으면 빌드 중단.
//
// 09 화면 품질 작업에서 vendor(react/react-dom/react-router-dom/lucide-react)
// manualChunks 분리를 시도했으나, 초기 로딩 gzip 합계가 127.41KB → 133.82KB로
// 오히려 늘어서(react-dom 자체가 index 청크 안의 95KB 중 대부분을 차지하고,
// manualChunks로 쪼개면 gzip 사전 재사용 효율이 떨어짐 + 요청 수 3개로 증가)
// 되돌렸다. 번들 구성을 다시 보려면 devDependency로 남겨둔
// rollup-plugin-visualizer를 임시로 plugins에 추가해 `npm run build` 후
// 확인하면 된다.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ivdr-wiki/" : "/",
  plugins: [react(), tailwindcss(), wikiContent()],
}));
