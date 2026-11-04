import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { wikiContent } from "./vite/wikiContent";

// https://vite.dev/config/
// 배포(빌드)는 GitHub Pages 하위 경로(/ivdr-wiki/)에, 로컬 개발은 루트(/)에서.
// wikiContent: content/wiki/*.md(옵시디언 노트) → 개념 위키 데이터. 깨진 링크가 있으면 빌드 중단.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ivdr-wiki/" : "/",
  plugins: [react(), tailwindcss(), wikiContent()],
}));
