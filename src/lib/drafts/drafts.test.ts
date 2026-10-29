import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../../data/spec/validate";
import { classify } from "../rules/classify";
import { evaluateDocSet } from "../rules/applicability";
import { draftTokens, hazards } from "./index";
import type { ProductSpec } from "../../data/spec/types";

const tok = (s: ProductSpec) => { const c = classify(s); return draftTokens(s, c, evaluateDocSet(s, c)); };
const names = (s: ProductSpec) => hazards(s).map((h) => h.hazard);

describe("P1 초안 토큰", () => {
  it("예시 스펙(LH 일반인 측방유동 스틱, 소변)", () => {
    const s = exampleSpec();
    const t = tok(s);
    expect(t.principle).toMatch(/시험선/);
    expect(t.principle).toMatch(/대조선/);
    expect(t.labelSymbols).toContain("자가검사용");
    expect(t.labelSymbols).toContain("CE 마크");
    expect(t.labelSymbols).not.toContain("멸균");
    expect(t.labelWarnings).not.toContain("채혈침");
    expect(t.ifuLimitations).toContain("배란");
    expect(t.ifuReading).toContain("무효");
    const n = names(s);
    expect(n).toEqual(expect.arrayContaining(["위양성 결과", "위음성 결과", "사용 오류 — 판독 시간"]));
    expect(n.join()).not.toMatch(/전기|소프트웨어|사이버/);
    expect(t.usabilityScope).toContain("[x] 자가검사");
  });

  it("위험 P·S는 숫자를 지어내지 않는다", () => {
    const rows = tok(exampleSpec()).hazardTable!.split("\n").filter((l) => /^\| R-\d{3}/.test(l));
    expect(rows.length).toBeGreaterThan(5);
    for (const r of rows) {
      const cells = r.split("|").map((x) => x.trim());
      expect(cells[5]).toBe("[__]");
      expect(cells[6]).toBe("[__]");
    }
  });

  it("리더기 + 앱이면 전기·SW·사이버보안 위험과 WEEE 심볼", () => {
    let s = setAt(exampleSpec(), "formFactor", "strip-reader");
    s = setAt(s, "software.hasApp", true);
    s = setAt(s, "result.readout", "app");
    const n = names(s).join();
    expect(n).toMatch(/전기/);
    expect(n).toMatch(/소프트웨어/);
    expect(n).toMatch(/사이버/);
    expect(tok(s).labelSymbols).toContain("WEEE");
    expect(tok(s).ifuReading).toContain("앱");
  });

  it("모세혈이면 채혈침 위험·경고", () => {
    const s = setAt(exampleSpec(), "specimen", "capillary-blood");
    expect(names(s).join()).toMatch(/채혈침/);
    expect(tok(s).labelWarnings).toContain("채혈침");
  });

  it("정량이면 판독 규칙이 측정값형", () => {
    const t = tok(setAt(exampleSpec(), "result.kind", "quantitative"));
    expect(t.ifuReading).toMatch(/측정범위/);
  });

  it("검사 방식이 없으면 작동 원리는 미입력", () => {
    expect(tok(setAt(exampleSpec(), "assay.method", null)).principle).toBeNull();
  });

  it("GSPR↔위험 추적표는 비해당 조항을 뺀다", () => {
    const t = tok(exampleSpec()).riskGsprTrace!;
    expect(t).toContain("| §19 |");
    expect(t).not.toContain("| §16 |");
  });
});

describe("josa", () => {
  it("받침·괄호 처리", async () => {
    const { josa } = await import("./index");
    expect(josa("소변", "을", "를")).toBe("소변을");
    expect(josa("타액", "을", "를")).toBe("타액을");
    expect(josa("황체형성호르몬(LH)", "이", "가")).toBe("황체형성호르몬(LH)이");
    expect(josa("면봉 채취 검체", "을", "를")).toBe("면봉 채취 검체를");
    expect(josa("LH", "이", "가")).toBe("LH이(가)");
  });
});
