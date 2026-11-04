import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../../data/spec/validate";
import { classifyKr, krDocSet, krPostMarket, krTokens } from "./index";
import { leafById } from "../../data/docTree";
import { docById, resolveDoc } from "../../data/documents";
import { buildTokenContext } from "../tokens";
import type { ProductSpec } from "../../data/spec/types";

const kr = (s: ProductSpec) => classifyKr(s);
const base = () => setAt(exampleSpec(), "markets", ["EU", "KR"]);

describe("classifyKr", () => {
  it("예시 LH 일반인: 개인용임신내분비물질검사지(J14030.01) 2등급, 잠정, 인증 경로", () => {
    const r = kr(base());
    expect(r).toMatchObject({ grade: "2", status: "provisional" });
    expect(r.rule).toContain("J14030.01");
    expect(r.selfTest.status).toBe("allowed");
    expect(r.route).toContain("인증");
    expect(r.route).toContain("본질적으로 동등하지 않으면 허가");
    expect(r.steps.join()).toContain("시행규칙 제5조");
  });
  it("혈당 자가검사: 별표 개인용혈당검사지 3등급, 허가 경로", () => {
    const r = kr(setAt(base(), "analyte.preset", "glucose"));
    expect(r.grade).toBe("3");
    expect(r.route).toContain("허가");
  });
  it("콜레스테롤 자가검사: 개인용단백질·지질검사지 2등급", () => {
    expect(kr(setAt(base(), "analyte.preset", "cholesterol")).grade).toBe("2");
  });
  it("HIV 자가검사는 별도 품목(4등급)이라 성매개감염 보류로 묶지 않는다", () => {
    let s = setAt(base(), "analyte.preset", "other");
    s = setAt(s, "analyte.name", "HIV 항체");
    const st = kr(s).selfTest;
    expect(st.status).toBe("allowed");
    expect(st.reason).toContain("K05060.01");
  });
  it("마약류 대사체 자가검사는 2028-06-30 시행 전이라 확인 필요", () => {
    let s = setAt(base(), "analyte.preset", "other");
    s = setAt(s, "analyte.name", "마약류 대사체");
    const st = kr(s).selfTest;
    expect(st.status).toBe("check");
    expect(st.reason).toContain("2028-06-30");
    expect(kr(s).grade).toBe("2");
  });
  it("코로나19·인플루엔자 자가검사: 자가검사용호흡기바이러스면역검사시약(K05070.01) 3등급", () => {
    let s = setAt(base(), "analyte.preset", "other");
    s = setAt(s, "analyte.name", "SARS-CoV-2 항원");
    s = setAt(s, "rule1to3Flags.transmissibleAgent", true);
    const r = kr(s);
    expect(r.selfTest.status).toBe("allowed");
    expect(r.grade).toBe("3");
    expect(r.rule).toContain("K05070.01");
    s = setAt(s, "analyte.name", "인플루엔자 A/B 항원");
    expect(kr(s).grade).toBe("3");
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
  it("허가 고시 제25조 자료가 모두 있고, 2등급은 면제 가능 자료를 '확인 필요'로 둔다", () => {
    const s = base();
    const d = krDocSet(s, kr(s));
    for (const id of ["kr-compare", "kr-origin", "kr-usage", "kr-analytical", "kr-clinical", "kr-qc", "kr-reference", "kr-handler", "kr-usability", "kr-stability"]) expect(d.find((x) => x.id === id)).toBeTruthy();
    expect(d.find((x) => x.id === "kr-clinical")!.status).toBe("check");
    expect(d.find((x) => x.id === "kr-clinical")!.reason).toContain("제26조");
    expect(d.find((x) => x.id === "kr-usability")!.status).toBe("conditional");
  });
  it("국내 제조면 수입업 불필요, 재사용 문서는 모두 열 수 있다", () => {
    const s = base();
    const d = krDocSet(s, kr(s));
    expect(d.find((x) => x.id === "kr-import")!.status).toBe("excluded");
    for (const id of d.flatMap((x) => x.reuse)) expect(leafById(id) ?? docById(id)).toBeTruthy();
  });
});

describe("krPostMarket", () => {
  it("의료기기법 조문 근거로 시판 후 할 일을 주고, 재사용 문서는 모두 열린다", () => {
    const s = base();
    const p = krPostMarket(s, kr(s));
    for (const id of ["kr-pm-adverse", "kr-pm-recall", "kr-pm-foreign", "kr-pm-supply", "kr-pm-pms", "kr-pm-renewal"]) expect(p.find((x) => x.id === id)).toBeTruthy();
    expect(p.find((x) => x.id === "kr-pm-adverse")!.reason).toContain("제31조제1항");
    expect(p.find((x) => x.id === "kr-pm-renewal")!.reason).toContain("5년");
    for (const id of p.flatMap((x) => x.reuse)) expect(leafById(id) ?? docById(id)).toBeTruthy();
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
  it("고시(제2026-58호) 항목 순서를 지키고, 새 섹션은 끝에만 붙는다", () => {
    const doc = resolveDoc("kr-technical-doc")!;
    const h = doc.sections.map((x) => x.heading);
    expect(h.slice(0, 11).map((x) => x.split(" ")[0])).toEqual(["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11."]);
    expect(h[11]).toContain("제조원");
    expect(h[12]).toContain("제25조");
    expect(doc.sections[9].placeholder.startsWith("체외진단용으로 사용해야 함")).toBe(true);
    expect(doc.sections[4].placeholder).toContain("제조원의 제조방법에 따른다");
    expect(doc.rationale).toContain("제2026-58호");
  });
  it("표시기재 초안: 토큰이 모두 정의되고, 법 제13조 '체외진단의료기기' 표시를 담는다", () => {
    const doc = resolveDoc("kr-labelling")!;
    const ctx = buildTokenContext(base());
    const keys = [...doc.sections.map((x) => x.placeholder).join("\n").matchAll(/\{\{auto\.([a-zA-Z]+)\}\}/g)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(5);
    for (const k of keys) expect(k in ctx).toBe(true);
    expect(doc.sections[0].placeholder).toContain("'체외진단의료기기' 표시");
    expect(doc.rationale).toContain("제13조");
  });
  it("한국을 고르지 않으면 한국 토큰은 비어 있다", () => {
    expect(krTokens(exampleSpec()).krGrade).toBeNull();
  });
});
