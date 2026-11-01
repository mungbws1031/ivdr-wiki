import { describe, expect, it } from "vitest";
import { nextActions } from "./nextActions";
import { emptySpec, exampleSpec } from "../data/spec/validate";
import { classify } from "./rules/classify";

const run = (s = exampleSpec(), o: Partial<Parameters<typeof nextActions>[2]> = {}) =>
  nextActions(s, classify(s), { confirmed: false, classAssumed: false, resultsEntered: 0, resultsTotal: 5, ...o });

describe("nextActions", () => {
  it("빈 스펙이면 등급을 막는 칸(제품 유형)이 먼저", () => {
    const a = run(emptySpec());
    expect(a[0].field).toBe("productType");
    expect(a.length).toBe(3);
  });
  it("최대 3개, 많이 막는 칸이 먼저", () => {
    const a = run(emptySpec());
    const n = (x: { why: string }) => Number(x.why.match(/문서 (\d+)개/)?.[1] ?? 0);
    expect(n(a[1])).toBeGreaterThanOrEqual(n(a[2]));
  });
  it("예시 스펙 — 클래스 확정이 들어간다", () => {
    const a = run();
    expect(a.some((x) => x.to === "/auto/docs")).toBe(true);
  });
  it("가정으로 나온 등급은 확정 항목이 없다", () => {
    expect(run(exampleSpec(), { classAssumed: true }).some((x) => x.to === "/auto/docs")).toBe(false);
  });
  it("확정하고 결과도 있으면 확정·결과 항목이 없다", () => {
    const a = run(exampleSpec(), { confirmed: true, resultsEntered: 2 });
    expect(a.every((x) => x.to !== "/auto/docs" && x.to !== "/auto/results")).toBe(true);
  });
});
