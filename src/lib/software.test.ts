import { describe, expect, it } from "vitest";
import { resolveDoc } from "../data/documents";
import { leafById } from "../data/docTree";
import { exampleSpec } from "../data/spec/validate";
import { classify } from "./rules/classify";
import { evaluateLeaf } from "./rules/applicability";
import { buildTokenContext, fillDoc, TOKEN_LABEL } from "./tokens";

const sw = (s: ReturnType<typeof exampleSpec>) => evaluateLeaf(leafById("sw-validation")!, s, classify(s));

describe("소프트웨어·펌웨어", () => {
  it("육안 판독·앱 없음 → SW 검증 불필요, 리더기 판독(펌웨어) → 필수", () => {
    const s = exampleSpec();
    expect(sw(s).status).toBe("excluded");
    s.result.readout = "reader";
    expect(sw(s).status).toBe("required");
    expect(sw(s).reason).toContain("펌웨어");
  });
  it("소프트웨어 범위 토큰 — 펌웨어·MDSW·분류 규칙", () => {
    const s = exampleSpec();
    s.result.readout = "app"; s.software = { hasApp: true, isMdsw: true };
    const v = buildTokenContext(s).swScope!;
    expect(v).toContain("MDSW");
    expect(v).toContain("Class B");
    expect(v).toContain("IVDR Annex VIII 1.4");
  });
  it("SW 검증·사이버보안 템플릿: 섹션 1~4 자리 유지, 토큰 정의, 채워짐", () => {
    const ctx = buildTokenContext(exampleSpec());
    for (const id of ["sw-validation", "cybersecurity"]) {
      const d = resolveDoc(id)!;
      expect(d.sections.length).toBeGreaterThan(4);
      expect(d.sections[2].heading).toBe("3. 근거 · 참조");
      expect(d.sections[3].heading).toBe("4. 검토 · 승인");
      for (const sec of d.sections) for (const m of sec.placeholder.matchAll(/\{\{auto\.([a-zA-Z]+)\}\}/g)) expect(TOKEN_LABEL[m[1]], m[1]).toBeTruthy();
      expect(fillDoc(d, ctx).sections.map((x) => x.placeholder).join("\n")).not.toMatch(/\{\{auto\./);
    }
  });
});
