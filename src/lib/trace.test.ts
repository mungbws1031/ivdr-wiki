import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../data/spec/validate";
import { buildTrace, emptyTraceStore, textHash, traceCsv, type TraceStore } from "./trace";
import { emptyResult, type ResultsMap } from "./results";

const run = (s = exampleSpec(), r: ResultsMap = {}, st: TraceStore = emptyTraceStore()) => buildTrace(s, r, st);
const row = (t: ReturnType<typeof run>, id: string) => t.rows.find((x) => x.req.id === id)!;

describe("추적성 매트릭스", () => {
  it("예시 스펙(LH 일반인 소변): 요구사항 목록과 연결", () => {
    const t = run();
    const ids = t.rows.map((r) => r.req.id);
    expect(ids).toEqual(expect.arrayContaining(["REQ-PERF-001", "REQ-PERF-002", "REQ-PERF-003", "REQ-STAB-001", "REQ-USE-001"]));
    expect(ids).not.toContain("REQ-BIO-001");
    expect(row(t, "REQ-PERF-001").vfy.map((v) => v.id)).toContain("VFY-clinical-performance");
  });
  it("특이도 목표 미입력 → 값 미입력 경고", () => {
    const t = run();
    expect(row(t, "REQ-PERF-002").req.missingValue).toBe(true);
    expect(t.gaps.some((g) => g.ref === "REQ-PERF-002" && g.level === "high")).toBe(true);
  });
  it("결과 미입력 → 증거 없음, PASS 넣으면 커버리지 상승, FAIL이면 경고", () => {
    const base = run();
    expect(base.gaps.some((g) => g.ref === "VFY-clinical-performance")).toBe(true);
    const all: ResultsMap = Object.fromEntries(base.vfys.map((v) => [v.studyId, { ...emptyResult(), verdict: "pass" as const }]));
    expect(run(exampleSpec(), all).coverage.reqVerified).toBeGreaterThan(base.coverage.reqVerified);
    const fail = run(exampleSpec(), { "clinical-performance": { ...emptyResult(), verdict: "fail" } });
    expect(fail.gaps.some((g) => g.ref === "REQ-PERF-001" && g.text.includes("FAIL"))).toBe(true);
  });
  it("위양성 위험은 분석·임상 성능 검증에 연결", () => {
    const rk = run().risks.find((r) => r.hazard === "위양성 결과")!;
    expect(rk.vfy).toContain("VFY-clinical-performance");
    expect(rk.reqs).toContain("REQ-PERF-001");
  });
  it("검토 뒤 스펙 목표가 바뀌면 의심 표시", () => {
    const s = exampleSpec();
    const st = { ...emptyTraceStore(), reviewed: { "REQ-PERF-001": textHash(row(run(s), "REQ-PERF-001").req.text) } };
    expect(row(run(s, {}, st), "REQ-PERF-001").reviewed).toBe(true);
    const r2 = row(run(setAt(s, "targets.sensitivity", 99), {}, st), "REQ-PERF-001");
    expect(r2.suspect).toBe(true);
    expect(r2.reviewed).toBe(false);
  });
  it("자동 연결 끄기·수동 추가", () => {
    const st = { ...emptyTraceStore(), removed: ["REQ-PERF-001|VFY-clinical-performance"], added: ["REQ-PERF-001|VFY-interference"] };
    expect(row(run(exampleSpec(), {}, st), "REQ-PERF-001").vfy.map((v) => v.id)).toEqual(["VFY-interference"]);
  });
  it("사용자 요구사항: 검증을 고르지 않으면 검증 없음", () => {
    const st = { ...emptyTraceStore(), custom: [{ id: "REQ-USR-001", category: "성능" as const, text: "결과는 10분 안에 판독" }] };
    const t = run(exampleSpec(), {}, st);
    expect(t.gaps.some((g) => g.ref === "REQ-USR-001" && g.text.includes("검증"))).toBe(true);
  });
  it("소변이 아닌 모세혈이면 생체적합성 요구사항", () => {
    expect(run(setAt(exampleSpec(), "specimen", "capillary-blood")).rows.map((r) => r.req.id)).toContain("REQ-BIO-001");
  });
  it("CSV는 BOM과 헤더로 시작", () => {
    expect(traceCsv(run()).startsWith("﻿\"REQ\"")).toBe(true);
  });
});

describe("위험 연결 근거", () => {
  it("사용설명서·라벨만 공유하는 위험은 시험에 연결하지 않는다 (문서로만)", () => {
    const rk = buildTrace(exampleSpec(), {}, emptyTraceStore()).risks.find((r) => r.hazard === "생물학적 위험")!;
    expect(rk.vfy).toEqual([]);
  });
  it("사용 오류 위험은 사용적합성 시험에 연결", () => {
    const rk = buildTrace(exampleSpec(), {}, emptyTraceStore()).risks.find((r) => r.hazard.startsWith("사용 오류"))!;
    expect(rk.vfy.some((v) => v.includes("usability"))).toBe(true);
  });
});
