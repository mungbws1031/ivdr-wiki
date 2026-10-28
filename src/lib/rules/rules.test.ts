import { describe, expect, it } from "vitest";
import { allLeaves } from "../../data/docTree";
import { emptySpec, exampleSpec, setAt } from "../../data/spec/validate";
import type { ProductSpec } from "../../data/spec/types";
import { classify } from "./classify";
import { APPLICABILITY_RULES, evaluateDocSet } from "./applicability";

const withFields = (base: ProductSpec, patch: Record<string, unknown>): ProductSpec =>
  Object.entries(patch).reduce((s, [k, val]) => setAt(s, k, val), base);

describe("classify", () => {
  it("LH 일반인 자가검사 → B (Rule 4 예외), 추천", () => {
    const r = classify(exampleSpec());
    expect(r.value).toBe("B");
    expect(r.status).toBe("recommended");
    expect(r.rule).toContain("Rule 4(a) 예외");
    expect(r.route.some((x) => x.includes("5.1"))).toBe(true);
  });
  it("hCG 일반인 → B", () => {
    expect(classify(withFields(exampleSpec(), { "analyte.preset": "hCG" })).value).toBe("B");
  });
  it("기타 분석물 일반인 → C", () => {
    expect(classify(withFields(exampleSpec(), { "analyte.preset": "other" })).value).toBe("C");
  });
  it("감염병 → 확인 필요, 등급 없음", () => {
    const r = classify(withFields(exampleSpec(), { "rule1to3Flags.transmissibleAgent": true }));
    expect(r.status).toBe("needs-review");
    expect(r.value).toBeNull();
  });
  it("전문가용 LH → B (Rule 6)", () => {
    const r = classify(withFields(exampleSpec(), { user: "professional", environment: "lab" }));
    expect(r.value).toBe("B");
    expect(r.rule).toBe("Rule 6");
  });
  it("유전자 검사 전문가용 → C (Rule 3)", () => {
    const r = classify(withFields(exampleSpec(), { user: "professional", "rule1to3Flags.geneticTesting": true }));
    expect(r.value).toBe("C");
    expect(r.rule).toContain("Rule 3");
  });
  it("Rule 1~3 미답 → 잠정, 미답 질문 반환", () => {
    const r = classify(withFields(exampleSpec(), { "rule1to3Flags.cancerScreening": null }));
    expect(r.status).toBe("provisional");
    expect(r.value).toBe("B");
    expect(r.openQuestions).toContain("rule1to3Flags.cancerScreening");
  });
  it("사용자 미입력 → 입력 부족", () => {
    const r = classify(withFields(exampleSpec(), { user: null }));
    expect(r.status).toBe("blocked");
    expect(r.openQuestions[0]).toBe("user");
  });
  it("빈 스펙 → 입력 부족", () => {
    expect(classify(emptySpec()).status).toBe("blocked");
  });
});

describe("evaluateDocSet", () => {
  const set = evaluateDocSet(exampleSpec(), classify(exampleSpec()));
  const st = (id: string) => set.find((a) => a.leafId === id)?.status;

  it("예시 스펙: 필요한 문서", () => {
    ["usability-file", "pms-report", "authorised-rep-mandate", "nb-application", "importer-distributor", "pmpf-plan"].forEach((id) =>
      expect(st(id), id).toBe("required"),
    );
  });
  it("예시 스펙: 불필요한 문서", () => {
    ["sw-validation", "cybersecurity", "sterilization-validation", "packaging-validation", "ssp", "psur", "biocompatibility", "cs-compliance", "eurl-batch-verification", "cdx-consultation"].forEach((id) =>
      expect(st(id), id).toBe("excluded"),
    );
  });
  it("클래스 미정이면 클래스 의존 문서는 확인 필요", () => {
    const s = withFields(exampleSpec(), { user: null });
    const r = evaluateDocSet(s, classify(s));
    expect(r.find((a) => a.leafId === "ssp")?.status).toBe("unknown");
  });
  it("모든 조건부·해당시 문서에 판정 규칙이 있다", () => {
    const missing = allLeaves().filter((l) => l.requirement !== "required" && !APPLICABILITY_RULES[l.id]).map((l) => l.id);
    expect(missing).toEqual([]);
  });
  it("모든 문서가 한 번씩 판정된다", () => {
    expect(set.length).toBe(allLeaves().length);
  });
});
