import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../../data/spec/validate";
import { classify } from "./classify";
import { classifyKr } from "../kr";
import { classifyUs } from "../us";
import { hazards, ifuLimitations } from "../drafts";
import { parseConcept } from "../concept";

describe("Rule 4(a) 자가검사 예외 (1차 패널 T-01)", () => {
  for (const p of ["glucose", "cholesterol", "urine-cells"] as const) {
    it(`${p} 일반인 → B, 원문 확인 표시`, () => {
      const c = classify(setAt(exampleSpec(), "analyte.preset", p));
      expect(c.value).toBe("B");
      expect(c.rule).toBe("Rule 4(a) 예외");
      expect(c.rationale.join()).toContain("원문 확인 필요");
    });
  }
  it("LH는 원문 확인 표시 없이 B", () => {
    expect(classify(exampleSpec()).rationale.join()).not.toContain("예외 목록 원문 확인 필요");
  });
  it("기타 일반인은 여전히 C", () => {
    expect(classify(setAt(exampleSpec(), "analyte.preset", "other")).value).toBe("C");
  });
  it("혈당: 한국 등급은 확인 필요(null), 미국 Class II 확인, 위해 문구", () => {
    const s = setAt(setAt(exampleSpec(), "analyte.preset", "glucose"), "markets", ["EU", "KR", "US"]);
    expect(classifyKr(s).grade).toBeNull();
    expect(classifyKr(s).selfTest.status).toBe("allowed");
    expect(classifyUs(s)).toMatchObject({ deviceClass: "II", pathway: "check" });
    expect(hazards(s)[0].harm).toContain("저혈당");
    expect(ifuLimitations(s)).toContain("인슐린");
  });
  it("컨셉 문장에서 혈당을 알아본다", () => {
    expect(parseConcept("집에서 쓰는 혈당 측정기").find((h) => h.path === "analyte.preset")?.value).toBe("glucose");
  });
});

describe("감염 전파 위해 (1차 패널 Q-02)", () => {
  it("감염병이면 전파 위험 행과 위음성 위해", () => {
    const s = setAt(setAt(exampleSpec(), "analyte.preset", "other"), "rule1to3Flags.transmissibleAgent", true);
    const h = hazards(s);
    expect(h.some((x) => x.hazard.includes("감염 전파"))).toBe(true);
    expect(h.find((x) => x.hazard === "위음성 결과")!.harm).toContain("전파");
  });
  it("감염병이 아니면 없다", () => {
    expect(hazards(exampleSpec()).some((x) => x.hazard.includes("감염 전파"))).toBe(false);
  });
});
