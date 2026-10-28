import { describe, expect, it } from "vitest";
import { exampleSpec } from "../../data/spec/validate";
import { classify } from "./classify";
import { evaluateDocSet } from "./applicability";

const statusOf = (s: ReturnType<typeof exampleSpec>, id: string) => evaluateDocSet(s, classify(s)).find((a) => a.leafId === id)?.status;

describe("제품 형태", () => {
  it("스틱만 팔면 전기안전·EMC 불필요", () => {
    const s = exampleSpec();
    s.formFactor = "strip-only";
    expect(statusOf(s, "electrical-safety-emc")).toBe("excluded");
  });
  it("리더기가 있으면 전기안전·EMC와 소프트웨어 검증이 필수", () => {
    const s = exampleSpec();
    s.formFactor = "strip-reader";
    expect(statusOf(s, "electrical-safety-emc")).toBe("required");
    expect(statusOf(s, "sw-validation")).toBe("required");
  });
  it("형태를 모르면 확인 필요", () => {
    const s = exampleSpec();
    s.formFactor = null;
    expect(statusOf(s, "electrical-safety-emc")).toBe("unknown");
  });
});
