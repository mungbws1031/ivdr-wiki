import { describe, expect, it } from "vitest";
import { resolveDoc } from "../data/documents";
import { exampleSpec } from "../data/spec/validate";
import { classify } from "./rules/classify";
import { buildTokenContext, fillDoc, TOKEN_LABEL } from "./tokens";
import { clinicalMetrics, defaultCutoffLevels, hasResult, resultsProgress, resultsTokens, type ResultsMap } from "./results";

const s = exampleSpec(); // 목표 민감도 95%, 신뢰 95%, 특이도 미입력, 유효기간 24개월

describe("실험 결과", () => {
  it("임상 2×2 → 민감도·신뢰하한·목표 충족 판정", () => {
    const m = clinicalMetrics({ verdict: null, date: null, summary: null, rawRef: null, tp: 59, fn: 0, tn: 100, fp: 2 }, s);
    expect(m.se).toBe(1);
    expect(m.seLower!).toBeGreaterThanOrEqual(0.95);
    expect(m.meetsSe).toBe(true);
    expect(m.sp).toBeCloseTo(100 / 102, 5);
    expect(m.meetsSp).toBeNull(); // 목표 특이도 미입력 → 판정하지 않음
    const low = clinicalMetrics({ verdict: null, date: null, summary: null, rawRef: null, tp: 50, fn: 2, tn: 0, fp: 0 }, s);
    expect(low.meetsSe).toBe(false);
  });
  it("결과가 없으면 문서에 [실험 후 입력]", () => {
    const t = resultsTokens(s, {});
    expect(t.clinicalResults).toContain("[실험 후 입력]");
    expect(t.stabilityConclusion).toBe("입증된 유효기간: [실험 후 입력]");
    expect(t.analyticalResults).toContain("Cut-off 특성(C5–C95)·정밀도: [실험 후 입력]");
  });
  it("입력한 결과가 문서에 들어간다", () => {
    const r: ResultsMap = {
      "clinical-performance": { verdict: "pass", date: "2026-10-01", summary: null, rawRef: "CR-01", tp: 59, fn: 0, tn: 98, fp: 2, invalid: 1 },
      "stability-realtime": { verdict: "in-progress", date: null, summary: null, rawRef: null, verifiedMonths: 12 },
      "cutoff-precision": { verdict: "pass", date: "2026-09-01", summary: null, rawRef: "AP-03", levels: [{ label: "+20%", conc: 30, n: 40, positive: 39 }] },
    };
    const clin = fillDoc(resolveDoc("clinical-performance")!, buildTokenContext(s, classify(s), r)).sections.map((x) => x.placeholder).join("\n");
    expect(clin).toContain("참양성 a=59");
    expect(clin).toContain("100.0%");
    expect(clin).toContain("목표 95% 충족");
    expect(clin).toContain("목표 — 스펙 미입력");
    const stab = fillDoc(resolveDoc("stability-study")!, buildTokenContext(s, classify(s), r)).sections.map((x) => x.placeholder).join("\n");
    expect(stab).toContain("입증된 유효기간: 12개월");
    expect(stab).toContain("미충족");
    const ana = resultsTokens(s, r).analyticalResults;
    expect(ana).toContain("합격 (2026-09-01) — 원자료 AP-03");
    expect(ana).toContain("+20% (30 mIU/mL): 양성 39/40 = 97.5%");
  });
  it("cut-off 제안 수준은 실험계획과 같다", () => {
    expect(defaultCutoffLevels(s).map((l) => l.conc)).toEqual([0, 12.5, 20, 25, 30, 37.5]);
  });
  it("진행률", () => {
    const p = resultsProgress(s, { "clinical-performance": { verdict: "pass", date: null, summary: null, rawRef: null } });
    expect(p.done).toBe(1);
    expect(p.total).toBeGreaterThan(5);
    expect(hasResult(undefined)).toBe(false);
  });
  it("결과 토큰은 모두 라벨이 있다", () => {
    for (const k of Object.keys(resultsTokens(s, {}))) expect(TOKEN_LABEL[k], k).toBeTruthy();
  });
});
