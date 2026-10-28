import { describe, expect, it } from "vitest";
import { emptySpec, exampleSpec } from "../data/spec/validate";
import { applyConcept, openQuestions, parseConcept } from "./concept";

const val = (text: string, path: string) => parseConcept(text).find((h) => h.path === path)?.value;

describe("컨셉 한 줄 → 스펙 추정", () => {
  it("집에서 쓰는 소변 호르몬 측정기, 스마트폰 연동", () => {
    const t = "집에서 쓰는 소변 호르몬 측정기, 스마트폰 연동";
    expect(val(t, "specimen")).toBe("urine");
    expect(val(t, "user")).toBe("lay");
    expect(val(t, "environment")).toBe("home");
    expect(val(t, "formFactor")).toBe("strip-reader");
    expect(val(t, "result.readout")).toBe("app");
    expect(val(t, "software.hasApp")).toBe(true);
    expect(val(t, "analyte.preset")).toBeUndefined(); // '호르몬'만으로는 목적을 모른다 → 질문
    const { spec } = applyConcept(emptySpec(), parseConcept(t));
    expect(openQuestions(spec)[0]).toBe("analyte.preset");
  });
  it("기기 없이 스틱만 파는 LH 배란 테스트, 유럽·한국", () => {
    const t = "기기 없이 스틱만 파는 LH 배란 테스트, 유럽·한국 출시";
    expect(val(t, "formFactor")).toBe("strip-only");
    expect(val(t, "analyte.preset")).toBe("LH");
    expect(val(t, "intendedPurpose.clinicalDecision")).toContain("배란");
    expect(val(t, "markets")).toEqual(["EU", "KR"]);
  });
  it("병원에 들어가는 대형 진단기기 → 대형 장비·전문가·검사실", () => {
    const t = "병원에 들어가는 대형 진단기기";
    expect(val(t, "formFactor")).toBe("lab-analyzer");
    expect(val(t, "user")).toBe("professional");
    expect(val(t, "environment")).toBe("lab");
  });
  it("사람이 넣은 값은 덮어쓰지 않는다", () => {
    const s = exampleSpec(); // user = lay, specimen = urine
    const { applied } = applyConcept(s, parseConcept("병원 전문가용 타액 검사"));
    expect(applied.map((a) => a.path)).not.toContain("user");
    expect(applied.map((a) => a.path)).not.toContain("specimen");
  });
});
