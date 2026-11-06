// =====================================================================
// scripts/spa-routes.mjs
// 빌드 뒤에 실행해요. 주소를 바로 쳐서 들어와도(예: /ivdr-wiki/wiki)
// GitHub Pages가 404 대신 정상 페이지(200)를 돌려주도록,
// 고정 주소마다 dist/<주소>/index.html 사본을 만들어 둬요.
// - 고정 주소: src/App.tsx 의 <Route path="..."> 중 ":"이 없는 것
// - 개념 위키: content/wiki/*.md 파일 이름 → /wiki/<이름>
// 그 밖의 주소(/doc/:id 등)는 예전처럼 public/404.html 이 처리해요.
// =====================================================================
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const indexHtml = join(dist, "index.html");
if (!existsSync(indexHtml)) {
  console.error("dist/index.html 이 없어요. 먼저 vite build 를 실행하세요.");
  process.exit(1);
}
const html = readFileSync(indexHtml, "utf8");

const app = readFileSync("src/App.tsx", "utf8");
const fixed = [...app.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p !== "/" && !p.includes(":") && !p.includes("*"));

const wikiDir = "content/wiki";
const wiki = existsSync(wikiDir)
  ? readdirSync(wikiDir).filter((f) => f.endsWith(".md")).map((f) => `/wiki/${f.slice(0, -3)}`)
  : [];

const routes = [...new Set([...fixed, ...wiki])];
for (const r of routes) {
  const dir = join(dist, ...r.split("/").filter(Boolean));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}
console.log(`spa-routes: 주소 ${routes.length}개에 index.html 사본을 만들었어요.`);
