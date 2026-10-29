import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../../data/spec/validate";
import { classifyKr, krDocSet, krTokens } from "./index";
import { leafById } from "../../data/docTree";
import { docById, resolveDoc } from "../../data/documents";
import { buildTokenContext } from "../tokens";
import type { ProductSpec } from "../../data/spec/types";

const kr = (s: ProductSpec) => classifyKr(s);
const base = () => setAt(exampleSpec(), "markets", ["EU", "KR"]);

describe("classifyKr", () => {
  it("예시 LH 일반인: 2등급 추천(잠정), 자가검사 허용 품목은 확인 필요, 인증 경로", () => {
    const r = kr(base());
    expect(r).toMatchObject({ grade: "2", status: "provisional" });
    expect(r.selfTest.status).toBe("check");
    expect(r.route).toContain("인증");
  });
  it("hCG 일반인: 2등급, 자가검사 허용", () => {
    let s = setAt(base(), "analyte.preset", "hCG");
    s = setAt(s, "analyte.name", "인간 융모성 생식선 자극호르몬(hCG)");
    const r = kr(s);
    expect(r.grade).toBe("2");
    expect(r.selfTest.status).toBe("allowed");
  });
  it("그 밖 일반인: 3등급, 확인 필요", () => {
    let s = setAt(base(), "analyte.preset", "other");
    s = setAt(s, "analyte.name", "비타민 D");
    s = setAt(s, "intendedPurpose.clinicalDecision", "결핍 여부 확인");
    const r = kr(s);
    expect(r.grade).toBe("3");
    expect(r.selfTest.status).toBe("check");
  });
  it("전문가용 그 밖: 2등급, 자가검사 해당 없음", () => {
    let s = setAt(base(), "user", "professional");
    s = setAt(s, "analyte.preset", "other");
    const r = kr(s);
    expect(r.grade).toBe("2");
    expect(r.selfTest.status).toBe("not-applicable");
  });
  it("유전자 검사 전문가용: 3등급", () => {
    let s = setAt(base(), "user", "professional");
    s = setAt(s, "rule1to3Flags.geneticTesting", true);
    expect(kr(s).grade).toBe("3");
  });
  it("감염병: needs-review, 등급 없음", () => {
    const r = kr(setAt(base(), "rule1to3Flags.transmissibleAgent", true));
    expect(r.status).toBe("needs-review");
    expect(r.grade).toBeNull();
  });
  it("확인 등급이 추천과 다르면 불일치, 경로는 확인 등급을 따른다", () => {
    const r = kr(setAt(base(), "krGrade", "3"));
    expect(r.confirmed).toEqual({ value: "3", matches: false });
    expect(r.route).toContain("허가");
  });
});

describe("krDocSet", () => {
  it("3등급이면 임상 자료 필수, 해외 제조면 수입업 필수", () => {
    let s = setAt(base(), "krGrade", "3");
    s = setAt(s, "identity.manufacturerCountry", "중국");
    const d = krDocSet(s, kr(s));
    expect(d.find((x) => x.id === "kr-clinical")!.status).toBe("required");
    expect(d.find((x) => x.id === "kr-import")!.status).toBe("required");
  });
  it("국내 제조면 수입업 불필요, 재사용 문서는 모두 열 수 있다", () => {
    const s = base();
    const d = krDocSet(s, kr(s));
    expect(d.find((x) => x.id === "kr-import")!.status).toBe("excluded");
    for (const id of d.flatMap((x) => x.reuse)) expect(leafById(id) ?? docById(id)).toBeTruthy();
  });
});

describe("한국 기술문서 템플릿", () => {
  it("토큰이 모두 채워지거나 정의되어 있다", () => {
    const doc = resolveDoc("kr-technical-doc")!;
    const ctx = buildTokenContext(base());
    const keys = [...doc.sections.map((x) => x.placeholder).join("\n").matchAll(/\{\{auto\.([a-zA-Z]+)\}\}/g)].map((m) => m[1]);
    for (const k of keys) expect(k in ctx).toBe(true);
    expect(ctx.krGrade).toContain("2등급");
  });
  it("한국을 고르지 않으면 한국 토큰은 비어 있다", () => {
    expect(krTokens(exampleSpec()).krGrade).toBeNull();
  });
});
