import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../data/spec/validate";
import { classify } from "./rules/classify";
import { evaluateDocSet } from "./rules/applicability";
import { gsprChecklist, gsprTableMarkdown } from "./gspr";
import { buildTokenContext } from "./tokens";
import type { ProductSpec } from "../data/spec/types";

const run = (s: ProductSpec) => gsprChecklist(s, evaluateDocSet(s, classify(s)));
const at = (rows: ReturnType<typeof run>, no: number) => rows.find((r) => r.no === no)!;

describe("gsprChecklist", () => {
  it("Annex I 1~20 조항이 빠짐없이 있다", () => {
    expect(run(exampleSpec()).map((r) => r.no)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("예시 스펙(LH 일반인 스틱·정성)", () => {
    const rows = run(exampleSpec());
    for (const n of [14, 15, 16, 17]) expect(at(rows, n).verdict).toBe("na");
    expect(at(rows, 19).verdict).toBe("applies");
    expect(at(rows, 12).verdict).toBe("check");
    expect(at(rows, 16).evidence).toEqual([]);
  });

  it("리더기가 있으면 §16·§17 해당, §15 확인 필요", () => {
    const rows = run(setAt(exampleSpec(), "formFactor", "strip-reader"));
    expect(at(rows, 16).verdict).toBe("applies");
    expect(at(rows, 17).verdict).toBe("applies");
    expect(at(rows, 15).verdict).toBe("check");
  });

  it("정량이면 §14 해당", () => {
    expect(at(run(setAt(exampleSpec(), "result.kind", "quantitative")), 14).verdict).toBe("applies");
  });

  it("문서 세트에서 불필요인 문서는 근거에서 빠진다", () => {
    const rows = run(exampleSpec());
    expect(rows.flatMap((r) => r.evidence)).not.toContain("sterilization-validation");
  });

  it("gsprTable 토큰이 채워진다", () => {
    const ctx = buildTokenContext(exampleSpec());
    expect(ctx.gsprTable).toContain("| §20 |");
    expect(gsprTableMarkdown(run(exampleSpec()), (id) => id).split("\n").filter((l) => l.startsWith("| §")).length).toBe(20);
  });
});
