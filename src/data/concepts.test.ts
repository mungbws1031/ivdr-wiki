import { describe, expect, it } from "vitest";
import { concepts, conceptBySlug } from "./concepts";
import { documents } from "./documents";
import { iso13485Documents } from "./iso13485/documents";
import { mdsapDocuments } from "./mdsap/documents";

// 개념 원본은 content/wiki/*.md (옵시디언). 옵시디언에서 파일 이름을 바꾸면
// 노트끼리의 링크는 옵시디언이 고쳐 주지만, 코드 쪽 문서 템플릿의 연결은 여기서 잡는다.
describe("개념 위키 데이터 (content/wiki)", () => {
  it("노트를 읽어 왔다", () => {
    expect(concepts.length).toBeGreaterThanOrEqual(28);
    expect(new Set(concepts.map((c) => c.slug)).size).toBe(concepts.length);
  });

  it("문서 템플릿의 relatedConceptSlugs 가 모두 실제 개념을 가리킨다", () => {
    for (const d of [...documents, ...iso13485Documents, ...mdsapDocuments])
      for (const s of d.relatedConceptSlugs) expect(conceptBySlug(s), `${d.id} → ${s}`).toBeTruthy();
  });

  it("본문 링크·related 가 모두 실제 개념을 가리킨다", () => {
    for (const c of concepts) {
      for (const m of c.body.join(" ").matchAll(/\{\{([^}|]+)\|/g)) expect(conceptBySlug(m[1].trim()), `${c.slug} → ${m[1]}`).toBeTruthy();
      for (const s of c.relatedConceptSlugs) expect(conceptBySlug(s), `${c.slug} → ${s}`).toBeTruthy();
    }
  });
});
