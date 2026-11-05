import { describe, expect, it } from "vitest";
import { docOrder, leafById } from "./docTree";
import { easyFlow, easyFoundation, easyStageOf } from "./easyFlow";

const allIds = (s: (typeof easyFlow)[number]) => [...s.docIds, ...(s.ifApplicable?.docIds ?? [])];

describe("쉬운 6단계 순서", () => {
  it("6단계, 번호가 1부터 차례로", () => {
    expect(easyFlow.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("모든 문서 칩이 실제 문서 트리에 있다", () => {
    for (const id of [...easyFoundation.docIds, ...easyFlow.flatMap(allIds)]) expect(leafById(id), id).toBeTruthy();
  });

  it("상세 11단계의 문서가 하나도 빠지지 않는다", () => {
    const covered = new Set([...easyFoundation.docIds, ...easyFlow.flatMap(allIds)]);
    for (const id of docOrder.flatMap((s) => s.docIds)) expect(covered.has(id), id).toBe(true);
  });

  it("상세 단계 번호가 1~11 안에 있고, 11단계가 모두 어딘가에 연결된다", () => {
    const steps = new Set([...easyFoundation.detailSteps, ...easyFlow.flatMap((s) => s.detailSteps)]);
    for (const n of steps) expect(n >= 1 && n <= docOrder.length).toBe(true);
    expect(steps.size).toBe(docOrder.length);
  });

  it("계획 → 결과 짝: 결과 문서가 더 뒤 단계에 있다", () => {
    for (const s of easyFlow) for (const p of s.pairs ?? []) {
      expect(allIds(s), p.plan).toContain(p.plan);
      const at = easyStageOf(p.result, s.n + 1);
      expect(at, p.result).toBeGreaterThan(s.n);
    }
  });

  it("되돌아가는 고리는 앞 단계를 가리킨다", () => {
    const loops = easyFlow.filter((s) => s.next.kind === "loop");
    expect(loops.map((s) => s.n)).toEqual([3, 6]);
    for (const s of loops) if (s.next.backTo) expect(s.next.backTo).toBeLessThan(s.n);
    expect(easyFlow[2].next.backTo).toBe(2);
  });

  it("등급 갈림: Class A 비멸균도 기술문서가 필요하고, SSP는 C·D만", () => {
    const note = easyFlow.find((s) => s.n === 5)!.note!;
    expect(note).toContain("Class A 비멸균");
    expect(note).toContain("기술문서");
    expect(note).toContain("SSP는 Class C·D");
    expect(easyFlow.find((s) => s.n === 6)!.note).toContain("Class C·D는 PSUR");
  });

  it("회사 내부 양식 번호가 들어가지 않는다", () => {
    const text = JSON.stringify({ easyFlow, easyFoundation });
    expect(text).not.toMatch(/\bF\d{3}-\d{2}\b|SU-Q[PIF]/);
  });
});
