import { describe, expect, it } from "vitest";
import { exampleSpec, unresolvedFields, validateSpec } from "../../data/spec/validate";
import { specSections } from "../../data/spec/fields";
import { classify } from "./classify";
import { certRoutes, missingQms } from "./certRoutes";

describe("인증 선택", () => {
  it("스펙 화면의 첫 질문은 받아야 할 인증", () => {
    expect(specSections[0].title).toBe("어떤 인증을 받아야 하나요?");
    expect(specSections[0].fields[0].options!.map((o) => o.value)).toEqual(expect.arrayContaining(["KR", "EU"]));
  });
  it("한국 — 등급을 모르면 추측하지 않고, 등급별 신고·인증·허가", () => {
    const s = exampleSpec();
    s.markets = ["KR"];
    const r = () => certRoutes(s, classify(s))[0];
    expect(r().headline).toContain("등급을 확인하면");
    s.krGrade = "1"; expect(r().headline).toContain("신고");
    s.krGrade = "2"; expect(r().headline).toContain("인증");
    s.krGrade = "3"; expect(r().headline).toContain("허가");
    expect(r().verify).toBe(true);
    expect(missingQms(s).map((m) => m.cert)).toContain("KGMP");
  });
  it("EU는 분류 엔진 결과를 쓴다", () => {
    const s = exampleSpec();
    const eu = certRoutes(s, classify(s)).find((r) => r.market === "EU")!;
    expect(eu.headline).toContain("Class B");
    expect(eu.support).toBe("full");
    expect(missingQms(s)).toEqual([]); // 예시: ISO 13485 보유
  });
  it("품질 인증·등급은 선택 항목 (미입력 목록에 안 들어감), 가져오기 검증 통과", () => {
    const s = exampleSpec();
    expect(unresolvedFields(s).map((f) => f.path)).not.toContain("qmsCerts");
    s.krGrade = "2";
    expect(validateSpec(JSON.parse(JSON.stringify(s))).spec.krGrade).toBe("2");
  });
});
