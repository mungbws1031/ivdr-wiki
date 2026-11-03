import { describe, expect, it } from "vitest";
import { emptySpec, exampleSpec } from "../data/spec/validate";
import { applyConcept, openQuestions, parseConcept, reapplyConcept } from "./concept";

const val = (text: string, path: string) => parseConcept(text).find((h) => h.path === path)?.value;

describe("컨셉 한 줄 → 스펙 추정", () => {
  it("집에서 쓰는 소변 호르몬 측정기, 스마트폰 연동", () => {
    const t = "집에서 쓰는 소변 호르몬 측정기, 스마트폰 연동";
    expect(val(t, "specimen")).toBe("urine");
    expect(val(t, "user")).toBe("lay");
    expect(val(t, "environment")).toBe("home");
    expect(val(t, "formFactor")).toBe("strip-reader");
    expect(val(t, "result.readout")).toBe("app");
    expect(val(t, "software.hasApp")).toBe(true);
    expect(val(t, "analyte.preset")).toBeUndefined(); // '호르몬'만으로는 목적을 모른다 → 질문
    const { spec } = applyConcept(emptySpec(), parseConcept(t));
    expect(openQuestions(spec)[0]).toBe("analyte.preset");
  });
  it("기기 없이 스틱만 파는 LH 배란 테스트, 유럽·한국", () => {
    const t = "기기 없이 스틱만 파는 LH 배란 테스트, 유럽·한국 출시";
    expect(val(t, "formFactor")).toBe("strip-only");
    expect(val(t, "analyte.preset")).toBe("LH");
    expect(val(t, "intendedPurpose.clinicalDecision")).toContain("배란");
    expect(val(t, "markets")).toEqual(["EU", "KR"]);
  });
  it("병원에 들어가는 대형 진단기기 → 대형 장비·전문가·검사실", () => {
    const t = "병원에 들어가는 대형 진단기기";
    expect(val(t, "formFactor")).toBe("lab-analyzer");
    expect(val(t, "user")).toBe("professional");
    expect(val(t, "environment")).toBe("lab");
  });
  it("사람이 넣은 값은 덮어쓰지 않는다", () => {
    const s = exampleSpec(); // user = lay, specimen = urine
    const { applied } = applyConcept(s, parseConcept("병원 전문가용 타액 검사"));
    expect(applied.map((a) => a.path)).not.toContain("user");
    expect(applied.map((a) => a.path)).not.toContain("specimen");
  });
});

describe("컨셉 바꿔서 다시 적용 (reapplyConcept)", () => {
  const LH = "집에서 쓰는 소변 LH 배란 스틱, 기기 없이 판매";
  const MENO = "내 소변만 받아서 측정하면 mz세대의 첫 갱년기 관리 시작하는 기기";
  const first = () => { const r = reapplyConcept(emptySpec(), parseConcept(LH), []); return { spec: r.spec, est: r.applied.map((a) => a.path) }; };

  it("갱년기 문장 → 분석물 기타(FSH), 일반인", () => {
    expect(val(MENO, "analyte.preset")).toBe("other");
    expect(val(MENO, "analyte.name")).toMatch(/FSH/);
    expect(val(MENO, "user")).toBe("lay");
    expect(val(MENO, "specimen")).toBe("urine");
  });
  it("이전 컨셉의 추정값은 새 문장으로 바뀌고, 새 문장에 없으면 비워진다", () => {
    const { spec, est } = first();
    expect(spec.analyte.preset).toBe("LH");
    const r = reapplyConcept(spec, parseConcept(MENO), est);
    expect(r.spec.analyte.preset).toBe("other");
    expect(r.spec.analyte.name).toMatch(/FSH/);
    expect(r.spec.formFactor).toBeNull(); // '스틱'은 새 문장에 없음
    expect(r.cleared).toContain("formFactor");
    expect(r.conflicts).toEqual([]);
  });
  it("사람이 넣은 값은 바꾸지 않고 충돌로 돌려준다", () => {
    const s = exampleSpec(); // 사람이 넣은 값(예시) — LH
    const r = reapplyConcept(s, parseConcept(MENO), []);
    expect(r.spec.analyte.preset).toBe(s.analyte.preset);
    expect(r.conflicts.map((c) => c.path)).toContain("analyte.preset");
  });
  it("빈 칸은 채운다, 같은 문장을 다시 적용하면 바뀌는 것 없음", () => {
    const { spec, est } = first();
    const r = reapplyConcept(spec, parseConcept(LH), est);
    expect(r.applied).toEqual([]);
    expect(r.cleared).toEqual([]);
  });
});
