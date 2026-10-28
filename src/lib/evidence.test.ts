import { describe, expect, it } from "vitest";
import { emptySpec, exampleSpec } from "../data/spec/validate";
import { resolveDoc } from "../data/documents";
import { classify } from "./rules/classify";
import { buildTokenContext, fillDoc } from "./tokens";
import { applyAssumptions, docEvidence, markAssumed, tokenTag } from "./evidence";

describe("가정 모드", () => {
  it("빈 사용자·측정 목적은 보수적으로 가정 → 자가검사 Class C", () => {
    const s = emptySpec();
    s.productType = "reagent-kit";
    const { spec, assumed } = applyAssumptions(s);
    expect(assumed.map((a) => a.path)).toEqual(expect.arrayContaining(["user", "analyte.preset"]));
    expect(spec.user).toBe("lay");
    expect(classify(spec).value).toBe("C");
    expect(s.user).toBeNull(); // 원본은 그대로
  });
  it("입력된 값은 가정하지 않는다", () => {
    const { assumed } = applyAssumptions(exampleSpec());
    expect(assumed.map((a) => a.path)).not.toContain("user");
    expect(assumed.map((a) => a.path)).not.toContain("analyte.preset");
  });
  it("가정에 기댄 값에는 (가정) 표시", () => {
    const s = emptySpec();
    s.productType = "reagent-kit";
    const { spec, assumed } = applyAssumptions(s);
    const ctx = markAssumed(buildTokenContext(spec), assumed);
    expect(ctx.cls).toBe("C (가정)");
    expect(ctx.user).toContain("(가정)");
  });
});

describe("근거 원장", () => {
  it("예시 스펙: 입력·규칙이 대부분, 누락은 목표 특이도 등", () => {
    const s = exampleSpec();
    const ctx = buildTokenContext(s);
    const raw = resolveDoc("ifu")!;
    const ev = docEvidence(raw, fillDoc(raw, ctx), ctx, new Set());
    expect(ev.counts.input).toBeGreaterThan(0);
    expect(ev.tokens.find((t) => t.key === "targetSp")?.tag).toBe("missing");
    expect(ev.confirmed).toBeGreaterThan(0.2);
    expect(ev.gaps).toBeGreaterThan(0); // [____]·[실험 후 입력] 같은 빈칸
    expect(ev.confirmed).toBeLessThan(1);
  });
  it("사람이 쓴 섹션은 입력 1건으로 센다", () => {
    const ctx = buildTokenContext(exampleSpec());
    const raw = resolveDoc("intended-purpose")!;
    const ev = docEvidence(raw, fillDoc(raw, ctx), ctx, new Set(), () => true);
    expect(ev.counts).toEqual({ input: raw.sections.length, rule: 0, assumed: 0, missing: 0 });
    expect(ev.confirmed).toBe(1);
  });
  it("결과 칸은 실험 전이면 누락", () => {
    const ctx = buildTokenContext(exampleSpec());
    expect(tokenTag("clinicalResults", ctx, new Set())).toBe("missing");
    expect(tokenTag("productName", ctx, new Set())).toBe("input");
    expect(tokenTag("cls", ctx, new Set())).toBe("rule");
    expect(tokenTag("cls", ctx, new Set(["user"]))).toBe("assumed");
  });
});
