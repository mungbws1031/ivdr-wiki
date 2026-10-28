import { describe, expect, it } from "vitest";
import { exampleSpec } from "../data/spec/validate";
import { classify } from "./rules/classify";
import { evaluateDocSet } from "./rules/applicability";
import { buildFactory, FLOORS, type FactoryInput } from "./factory";

const s = exampleSpec();
const cls = classify(s);
const base = (over: Partial<FactoryInput> = {}): FactoryInput => ({
  spec: s, cls, classConfirmed: false, docSet: evaluateDocSet(s, cls), results: {},
  status: () => "not_started", sections: () => [0, 4], missingSpec: () => 0, specMissingCount: 1, ...over,
});

describe("문서 공장", () => {
  it("7개 층, 불필요 문서는 출근하지 않음", () => {
    const f = buildFactory(base());
    expect(f.floors.map((x) => x.id)).toEqual(FLOORS.map((x) => x.id));
    const ids = f.floors.flatMap((x) => x.docs.map((d) => d.id));
    expect(ids).not.toContain("sterilization-validation"); // 비멸균 → 불필요
    expect(ids).toContain("intended-purpose");
  });
  it("미확정 클래스는 7F 대기줄, 결과 없는 실험은 4F 대기줄", () => {
    const f = buildFactory(base());
    expect(f.floors.find((x) => x.id === "7F")!.tasks[0].title).toBe("Class B 확정");
    expect(f.floors.find((x) => x.id === "4F")!.tasks.some((t) => t.title.includes("임상 성능"))).toBe(true);
    expect(f.floors.find((x) => x.id === "4F")!.docs.find((d) => d.id === "clinical-performance")!.state).toBe("blocked");
  });
  it("진행률: 완료 1, 작성 중은 섹션 비율", () => {
    const f = buildFactory(base({
      status: (id) => (id === "intended-purpose" ? "done" : "not_started"),
      sections: (id) => (id === "classification-rationale" ? [2, 4] : [0, 4]),
    }));
    const d = f.floors.find((x) => x.id === "6F")!.docs;
    expect(d.find((x) => x.id === "intended-purpose")!).toMatchObject({ state: "done", progress: 1 });
    expect(d.find((x) => x.id === "classification-rationale")!).toMatchObject({ state: "writing", progress: 0.5 });
    expect(f.overall.done).toBe(1);
    expect(f.overall.progress).toBeGreaterThan(0);
  });
  it("확정하면 7F 대기줄에서 빠진다", () => {
    const f = buildFactory(base({ classConfirmed: true }));
    expect(f.floors.find((x) => x.id === "7F")!.tasks.some((t) => t.id === "confirm-class")).toBe(false);
  });
});
