import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../data/spec/validate";
import type { ProductSpec } from "../data/spec/types";
import { classify } from "./rules/classify";
import { buildRoadmap, schedule } from "./roadmap";
import { planStudies } from "./planner";
import { classifyKr } from "./kr";
import { classifyUs } from "./us";
import { marketCheck, somOf } from "./market";
import { stepGroups } from "../components/auto/AutoSteps";

const run = (s: ProductSpec) => {
  const c = classify(s);
  return marketCheck(s, c, schedule(buildRoadmap(s, c), s.plan.startDate, s.plan.launchDate), planStudies(s), classifyKr(s), classifyUs(s));
};
const dim = (s: ProductSpec, id: string) => run(s).dims.find((d) => d.id === id)!;
const withMarket = (s: ProductSpec) => {
  let x = setAt(s, "market.currency", "KRW");
  x = setAt(x, "market.sam", 50000);
  x = setAt(x, "market.samSource", "예시 보고서");
  x = setAt(x, "market.sharePct", 2);
  x = setAt(x, "market.price", 20000);
  x = setAt(x, "market.competitors", [
    { name: "A", company: "a", price: 15000, cert: "CE", diff: "", source: "s" },
    { name: "B", company: "b", price: 25000, cert: "CE", diff: "", source: "s" },
  ]);
  return x;
};

describe("marketCheck", () => {
  it("예시 스펙: 규제·출시·증거는 점수, 경쟁·가격은 입력 필요", () => {
    const m = run(exampleSpec());
    expect(m.dims.find((d) => d.id === "barrier")!.score).not.toBeNull();
    expect(m.dims.find((d) => d.id === "speed")!.score).not.toBeNull();
    expect(m.dims.find((d) => d.id === "competition")!.score).toBeNull();
    expect(m.dims.find((d) => d.id === "price")!.score).toBeNull();
    expect(m.som).toBeNull();
    expect(m.headline).toMatch(/판단할 수 없/);
  });
  it("Class C는 B보다 규제 장벽 점수가 낮다", () => {
    const b = dim(exampleSpec(), "barrier").score!;
    const c = dim(setAt(exampleSpec(), "analyte.preset", "other"), "barrier").score!;
    expect(c).toBeLessThan(b);
  });
  it("SOM·수량은 입력값으로만 계산, 하나라도 비면 null", () => {
    const s = withMarket(exampleSpec());
    expect(somOf(s)).toEqual({ value: 1000, units: 50000, currency: "KRW" });
    expect(somOf(setAt(s, "market.sharePct", null))).toBeNull();
    expect(somOf(setAt(s, "market.price", null))!.units).toBeNull();
  });
  it("가격: 경쟁 중앙값 대비 비싸면 점수가 낮다", () => {
    const s = withMarket(exampleSpec());
    expect(dim(s, "price").summary).toContain("100%");
    expect(dim(setAt(s, "market.price", 40000), "price").score!).toBeLessThan(dim(s, "price").score!);
  });
  it("판정 문장에 판매량 숫자를 만들지 않는다", () => {
    expect(run(exampleSpec()).headline).not.toMatch(/\d+\s*(개|명|억|원)\s*팔/);
  });
  it("단계 탭 기획 묶음에 시장성이 있다", () => {
    expect(stepGroups(["EU"])[0].steps.map((x) => x.to)).toContain("/auto/market");
  });
});
