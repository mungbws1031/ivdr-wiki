import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../../data/spec/validate";
import { classify } from "./classify";
import { ruleJustification, ruleTableMarkdown } from "./justify";

const v = (rows: ReturnType<typeof ruleJustification>, r: string) => rows.find((x) => x.rule === r)!;

describe("ruleJustification", () => {
  it("예시 스펙(LH 일반인 스틱): Rule 4 해당 B, 나머지 비해당", () => {
    const rows = ruleJustification(exampleSpec());
    expect(rows.map((r) => r.rule)).toEqual(["Rule 1", "Rule 2", "Rule 3", "Rule 4", "Rule 5", "Rule 6", "Rule 7"]);
    expect(v(rows, "Rule 4")).toMatchObject({ verdict: "applies", cls: "B" });
    for (const r of ["Rule 1", "Rule 2", "Rule 3", "Rule 5", "Rule 6", "Rule 7"]) expect(v(rows, r).verdict).toBe("not");
  });

  it("전문가용 기타 분석물: Rule 6 해당 B (Rule 1~5 비해당 기록 후)", () => {
    let s = setAt(exampleSpec(), "user", "professional");
    s = setAt(s, "analyte.preset", "other");
    s = setAt(s, "environment", "lab");
    const rows = ruleJustification(s);
    expect(rows.slice(0, 5).every((r) => r.verdict === "not")).toBe(true);
    expect(v(rows, "Rule 6")).toMatchObject({ verdict: "applies", cls: "B" });
    expect(classify(s).rule).toBe("Rule 6");
  });

  it("Rule 1~3 질문 미답이면 Rule 6도 답변 필요", () => {
    const s = setAt(exampleSpec(), "rule1to3Flags.geneticTesting", null);
    const rows = ruleJustification(s);
    expect(v(rows, "Rule 3")).toMatchObject({ verdict: "unknown", fields: ["rule1to3Flags.geneticTesting"] });
    expect(v(rows, "Rule 6").verdict).toBe("unknown");
  });

  it("마크다운 표로 분류 근거서에 들어간다", () => {
    const s = exampleSpec();
    const md = ruleTableMarkdown(ruleJustification(s), classify(s));
    expect(md).toContain("| 규칙 | 해당 여부 | 클래스 | 이유 |");
    expect(md.split("\n").filter((l) => l.startsWith("| Rule")).length).toBe(7);
  });
});
