import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
// 배포(빌드)는 GitHub Pages 하위 경로(/ivdr-wiki/)에, 로컬 개발은 루트(/)에서.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ivdr-wiki/" : "/",
  plugins: [react(), tailwindcss()],
}));
