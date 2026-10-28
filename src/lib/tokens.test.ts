import { describe, expect, it } from "vitest";
import { resolveDoc } from "../data/documents";
import { emptySpec, exampleSpec } from "../data/spec/validate";
import { buildTokenContext, docMissingTokens, fillDoc, fillTokens, TOKEN_LABEL } from "./tokens";

const CORE = ["intended-purpose", "classification-rationale", "conformity-route-plan", "device-description", "labelling-spec", "ifu", "usability-file", "performance-eval-plan", "risk-management-plan"];

describe("tokens", () => {
  it("예시 스펙으로 의도된 목적 문서가 채워진다", () => {
    const doc = fillDoc(resolveDoc("intended-purpose")!, buildTokenContext(exampleSpec()));
    const all = doc.sections.map((s) => s.placeholder).join("\n");
    expect(all).toContain("Surearly LH 배란 테스트");
    expect(all).toContain("소변");
    expect(all).not.toMatch(/\{\{auto\./);
  });
  it("분류 근거서에 Class B와 Rule 표가 들어간다", () => {
    const all = fillDoc(resolveDoc("classification-rationale")!, buildTokenContext(exampleSpec())).sections.map((s) => s.placeholder).join("\n");
    expect(all).toContain("최종 클래스: B");
    expect(all).toContain("| Rule 4 | 해당 | B |");
  });
  it("값이 없으면 지어내지 않고 미입력 표시", () => {
    expect(fillTokens("특이도 {{auto.targetSp}}", buildTokenContext(exampleSpec()))).toBe("특이도 [목표 특이도 — 스펙 미입력]");
    expect(docMissingTokens(resolveDoc("ifu")!, buildTokenContext(exampleSpec()))).toEqual(expect.arrayContaining(["targetSp", "basicUdiDi"]));
  });
  it("핵심 문서의 모든 토큰은 정의된 이름이다", () => {
    const ctx = buildTokenContext(emptySpec());
    for (const id of CORE) {
      const doc = resolveDoc(id)!;
      for (const s of doc.sections) for (const m of s.placeholder.matchAll(/\{\{auto\.([a-zA-Z]+)\}\}/g)) {
        expect(m[1] in ctx, `${id}: ${m[1]}`).toBe(true);
        expect(TOKEN_LABEL[m[1]], `${id}: ${m[1]} 라벨`).toBeTruthy();
      }
    }
  });
  it("토큰 없는 문서는 그대로 반환", () => {
    const d = resolveDoc("capa-sop")!;
    expect(fillDoc(d, buildTokenContext(exampleSpec()))).toBe(d);
  });
});
