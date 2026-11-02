import { describe, expect, it } from "vitest";
import { sketchModel } from "./sketch";
import { exampleSpec, setAt } from "../data/spec/validate";
import type { ProductSpec } from "../data/spec/types";

const lh = (): ProductSpec => {
  let s = exampleSpec();
  s = setAt(s, "formFactor", "strip-only"); s = setAt(s, "specimen", "urine"); s = setAt(s, "user", "lay");
  s = setAt(s, "software.hasApp", false); s = setAt(s, "result.readout", "visual"); s = setAt(s, "result.kind", "qualitative");
  return s;
};
const texts = (m: ReturnType<typeof sketchModel>) => [...m.callouts.map((c) => c.label), ...m.story.flatMap((x) => [x.title, x.text]), m.resultText];

describe("sketchModel", () => {
  it("LH 소변 일반인 스틱 → 막대형", () => {
    const m = sketchModel(lh());
    expect(m.kind).toBe("midstream");
    expect(m.phone).toBe(false);
    expect(m.callouts.map((c) => c.part)).toEqual(expect.arrayContaining(["tip", "window", "lines"]));
    expect(m.story[2].text).toMatch(/C선만 보이면 음성/);
  });
  it("손끝 혈액 + 리더기 + 앱 → 리더기 + 폰", () => {
    let s = setAt(lh(), "formFactor", "strip-reader"); s = setAt(s, "specimen", "capillary-blood"); s = setAt(s, "software.hasApp", true);
    const m = sketchModel(s);
    expect(m.kind).toBe("reader");
    expect(m.phone).toBe(true);
    expect(m.story[0].title).toMatch(/손끝/);
    expect(m.story[2].text).toMatch(/화면/);
  });
  it("정량 → 측정값, 숫자 없음", () => {
    const m = sketchModel(setAt(setAt(lh(), "result.kind", "quantitative"), "formFactor", "personal-device"));
    expect(m.kind).toBe("meter");
    expect(m.resultText).toMatch(/^측정값/);
    expect(m.resultText).not.toMatch(/\d/);
  });
  it("지어낸 수치 없음 — 시간·부피·치수는 [__]", () => {
    for (const ff of ["strip-only", "strip-reader", "personal-device", "poct", "lab-analyzer", null]) {
      for (const sp of ["urine", "capillary-blood", "swab", "saliva", "venous-blood"]) {
        const m = sketchModel(setAt(setAt(lh(), "formFactor", ff), "specimen", sp));
        for (const t of texts(m)) expect(t, t).not.toMatch(/\d+\s*(분|초|µL|mm)/);
      }
    }
  });
  it("형태 미입력 → 카세트 + 표시", () => {
    const m = sketchModel(setAt(setAt(lh(), "formFactor", null), "user", "professional"));
    expect(m.kind).toBe("cassette");
    expect(m.formMissing).toBe(true);
    expect(m.subtitle).toMatch(/형태 미입력/);
  });
});
