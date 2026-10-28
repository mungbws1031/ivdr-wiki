import { describe, expect, it } from "vitest";
import { emptySpec, exampleSpec } from "../data/spec/validate";
import { buildGoals, goalDone } from "./goals";

const base = { specFilled: { filled: 0, total: 10 }, classConfirmed: false, results: { entered: 0, total: 5 }, tasksLeft: 3, docs: { done: 0, total: 20 } };

describe("목표 체크리스트", () => {
  it("빈 스펙이면 아무것도 완료 아님", () => {
    const g = buildGoals({ spec: emptySpec(), ...base });
    expect(g.map((x) => x.id)).toEqual(["cert", "spec", "class", "transport", "results", "tasks", "docs"]);
    expect(g.filter(goalDone)).toHaveLength(0);
  });
  it("예시 스펙 + 확정 + 할 일 0이면 인증·확정·할 일 완료", () => {
    const g = buildGoals({ spec: exampleSpec(), ...base, classConfirmed: true, tasksLeft: 0 });
    const done = g.filter(goalDone).map((x) => x.id);
    expect(done).toContain("cert");
    expect(done).toContain("class");
    expect(done).toContain("tasks");
    expect(done).not.toContain("docs");
  });
});
