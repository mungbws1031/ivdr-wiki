import { describe, expect, it } from "vitest";
import { docDifficulty, overallDifficulty } from "./difficulty";

const ev = (confirmed: number, missing = 0) => ({ confirmed, counts: { input: 0, estimated: 0, rule: 0, assumed: 0, missing } });

describe("난이도 표정", () => {
  it("쉬운 문서 + 근거 확정 95% → 쉬움", () => {
    expect(docDifficulty("conformity-route-plan", ev(0.95)).mood).toBe("easy"); // 작성 난이도 낮음
  });
  it("어려운 문서 + 근거 확정 15% → 비명", () => {
    const d = docDifficulty("tech-doc-toc-gspr", ev(0.15, 3)); // 작성 난이도 높음
    expect(d.mood).toBe("scream");
    expect(d.reasons.join(" ")).toContain("15%");
  });
  it("Class D는 비명, Class B는 보통 이상", () => {
    expect(overallDifficulty("D", []).mood).toBe("scream");
    expect(["normal", "hard", "scream"]).toContain(overallDifficulty("B", [docDifficulty("ifu", ev(0.5))]).mood);
  });
  it("어려운 문서가 많으면 한 단계 올라간다", () => {
    const hard = docDifficulty("tech-doc-toc-gspr", ev(0.5));
    expect(overallDifficulty("B", [hard, hard, hard]).mood).toBe("hard");
  });
});
