import { describe, expect, it } from "vitest";
import { GLOSSARY } from "./glossary";
import { conceptBySlug } from "./concepts";

describe("glossary", () => {
  it("slug는 모두 개념 위키에 있다", () => {
    for (const [k, g] of Object.entries(GLOSSARY)) if (g.slug) expect(conceptBySlug(g.slug), k).toBeTruthy();
  });
  it("풀이에 숫자 수치가 없다(조항 번호 제외)", () => {
    for (const g of Object.values(GLOSSARY)) expect(g.short).not.toMatch(/\d+\s*(%|일|개월|명)/);
  });
});
