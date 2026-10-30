import { describe, expect, it } from "vitest";
import { exampleSpec, setAt } from "../../data/spec/validate";
import { classifyUs, usDocSet, usTokens } from "./index";
import { leafById } from "../../data/docTree";
import { docById, resolveDoc } from "../../data/documents";
import { buildTokenContext } from "../tokens";
import { certRoutes } from "../rules/certRoutes";
import { classify } from "../rules/classify";
import type { ProductSpec } from "../../data/spec/types";

const base = () => setAt(exampleSpec(), "markets", ["EU", "US"]);
const hcg = (s: ProductSpec) => setAt(setAt(s, "analyte.preset", "hCG"), "analyte.name", "hCG");
const doc = (s: ProductSpec, id: string) => usDocSet(s, classifyUs(s)).find((d) => d.id === id)!;

describe("classifyUs", () => {
  it("hCG 가정용: Class II, 510(k), 862.1155, CLIA 면제", () => {
    const r = classifyUs(hcg(base()));
    expect(r).toMatchObject({ deviceClass: "II", pathway: "510k", otc: true });
    expect(r.regulation).toContain("862.1155");
    expect(r.clia.status).toBe("waived-otc");
  });
  it("LH 가정용: Class I, 경로 확인 필요, 862.1485", () => {
    const r = classifyUs(base());
    expect(r).toMatchObject({ deviceClass: "I", pathway: "check", status: "provisional" });
    expect(r.regulation).toContain("862.1485");
  });
  it("동반진단: Class III·PMA", () => {
    expect(classifyUs(setAt(base(), "rule1to3Flags.companionDiagnostic", true))).toMatchObject({ deviceClass: "III", pathway: "pma" });
  });
  it("감염병: 담당자 판단", () => {
    expect(classifyUs(setAt(base(), "rule1to3Flags.transmissibleAgent", true)).status).toBe("needs-review");
  });
  it("전문가 근접검사: CLIA waiver 신청", () => {
    const s = setAt(setAt(base(), "user", "professional"), "environment", "near-patient");
    expect(classifyUs(s).clia.status).toBe("waiver-application");
  });
  it("제품 코드를 입력하면 그 값이 쓰인다", () => {
    const s = setAt(hcg(base()), "usProductCode", "LCX");
    expect(classifyUs(s).confirmedCode).toBe("LCX");
    expect(usTokens(s).usClass).toContain("LCX (담당자 확인)");
    expect(certRoutes(s, classify(s)).find((r) => r.market === "US")!.headline).toContain("LCX");
  });
});

describe("usDocSet", () => {
  it("앱이 있으면 사이버보안 필수, 해외 제조면 US Agent 필수, 가정용이면 일반인 연구 필수", () => {
    const s = setAt(base(), "software.hasApp", true);
    expect(doc(s, "us-cyber").status).toBe("required");
    expect(doc(s, "us-agent").status).toBe("required");
    expect(doc(s, "us-clinical").status).toBe("required");
    expect(doc(base(), "us-cyber").status).toBe("excluded");
  });
  it("재사용 문서는 모두 열 수 있다", () => {
    for (const id of usDocSet(base(), classifyUs(base())).flatMap((d) => d.reuse)) expect(leafById(id) ?? docById(id)).toBeTruthy();
  });
});

describe("510(k) 초안 템플릿", () => {
  it("토큰이 모두 정의되어 있고 분류가 채워진다", () => {
    const d = resolveDoc("us-510k-draft")!;
    const ctx = buildTokenContext(hcg(base()));
    for (const m of d.sections.map((x) => x.placeholder).join("\n").matchAll(/\{\{auto\.([a-zA-Z]+)\}\}/g)) expect(m[1] in ctx).toBe(true);
    expect(ctx.usClass).toContain("Class II");
  });
  it("미국을 고르지 않으면 비어 있다", () => {
    expect(usTokens(exampleSpec()).usClass).toBeNull();
  });
});
