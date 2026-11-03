import { describe, expect, it } from "vitest";
import { stepGroups } from "../components/auto/AutoSteps";

const tabs = (m: string[] | null, cur?: string) => stepGroups(m, cur).flatMap((g) => g.steps.map((s) => s.to));

describe("stepGroups", () => {
  it("4단계", () => {
    expect(stepGroups(["EU"]).map((g) => g.label)).toEqual(["기획", "판정", "실험", "문서"]);
  });
  it("고르지 않은 시장의 국가 탭은 뺀다", () => {
    expect(tabs(["EU"])).not.toContain("/auto/kr");
    expect(tabs(["EU"])).not.toContain("/auto/us");
    expect(tabs(["EU", "KR"])).toContain("/auto/kr");
    expect(tabs(null)).toHaveLength(10);
  });
  it("지금 보고 있는 국가 화면은 남긴다", () => {
    expect(tabs(["EU"], "/auto/us")).toContain("/auto/us");
  });
});
