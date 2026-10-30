import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../data/spec/validate";
import { classify } from "./rules/classify";
import { buildRoadmap, schedule, roadmapTable } from "./roadmap";
import type { ProductSpec } from "../data/spec/types";

const items = (s: ProductSpec) => buildRoadmap(s, classify(s));
const ids = (s: ProductSpec) => items(s).map((i) => i.id);

describe("buildRoadmap", () => {
  it("예시 스펙(EU, LH 스틱, Class B): NB 항목, 실시간 안정성 = 24개월, 출시는 시작 뒤", () => {
    const s = exampleSpec();
    expect(ids(s)).toEqual(expect.arrayContaining(["eu-nb", "eu-cert", "v-usability", "q-iso"].filter((x) => x !== "q-iso" || !s.qmsCerts?.includes("ISO13485"))));
    const real = items(s).find((i) => i.id === "v-stab-real")!;
    expect([real.min, real.max]).toEqual([24, 24]);
    const p = schedule(items(s), null, null);
    expect(p.launchMin).toBeGreaterThan(0);
    expect(p.launchMax).toBeGreaterThanOrEqual(p.launchMin);
    expect(p.verdict).toBe("unknown");
  });
  it("한국·미국을 더하면 레인이 생기고, hCG 미국은 510(k)", () => {
    let s = setAt(exampleSpec(), "markets", ["EU", "KR", "US"]);
    s = setAt(setAt(s, "analyte.preset", "hCG"), "analyte.name", "hCG");
    const it = items(s);
    expect(it.some((i) => i.lane === "kr")).toBe(true);
    expect(it.find((i) => i.id === "us-cert")!.title).toContain("510(k)");
  });
  it("앱 + 리더기면 전기안전·SW 항목", () => {
    let s = setAt(exampleSpec(), "formFactor", "strip-reader");
    s = setAt(s, "software.hasApp", true);
    expect(ids(s)).toEqual(expect.arrayContaining(["v-elec", "v-sw"]));
    expect(ids(exampleSpec())).not.toContain("v-elec");
  });
  it("이미 ISO 13485가 있으면 준비 항목이 빠진다", () => {
    expect(ids(setAt(exampleSpec(), "qmsCerts", ["ISO13485"]))).not.toContain("q-iso");
    expect(ids(setAt(exampleSpec(), "qmsCerts", []))).toContain("q-iso");
  });
  it("직접 입력한 기간이 우선한다", () => {
    const s = setAt(exampleSpec(), "plan.durations", { "eu-cert": 3 });
    const e = items(s).find((i) => i.id === "eu-cert")!;
    expect(e).toMatchObject({ min: 3, max: 3, overridden: true });
  });
});

describe("schedule", () => {
  it("목표일이 너무 이르면 불가능과 부족 개월 수", () => {
    const p = schedule(items(exampleSpec()), "2026-11-01", "2027-03-01");
    expect(p.verdict).toBe("impossible");
    expect(p.shortage).toBeGreaterThan(0);
    expect(p.items.find((i) => i.id === "launch")!.critical).toBe(true);
  });
  it("넉넉하면 ok, 늦어도 시작이 계산된다", () => {
    const p = schedule(items(exampleSpec()), "2026-11-01", "2032-01-01");
    expect(p.verdict).toBe("ok");
    expect(p.items.find((i) => i.id === "eu-nb")!.latestStart).not.toBeNull();
    expect(p.items.find((i) => i.id === "v-stab-real")!.latestStart).toBeNull();
  });
  it("로드맵 표 토큰", () => {
    const t = roadmapTable(setAt(exampleSpec(), "plan.startDate", "2026-11-01"), classify(exampleSpec()))!;
    expect(t).toContain("출시 가능 시점");
    expect(t).toContain("2026-");
  });
});
