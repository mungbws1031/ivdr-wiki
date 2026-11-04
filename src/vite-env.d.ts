/// <reference types="vite/client" />

/** content/wiki/*.md 노트를 빌드할 때 읽어 온 개념 위키 데이터 (vite/wikiContent.ts). */
declare module "virtual:wiki-concepts" {
  import type { WikiConcept } from "./data/concepts";
  const concepts: WikiConcept[];
  export default concepts;
}
