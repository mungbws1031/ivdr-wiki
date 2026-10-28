import { describe, expect, it } from "vitest";
import { parseOutput, toPrompt } from "./format";

describe("번역 형식", () => {
  it("요청 텍스트를 만들고 응답을 섹션별로 읽는다", () => {
    const p = toPrompt("의도된 목적", [{ heading: "1. 목적", body: "가\n나" }, { heading: "2. 범위", body: "다" }]);
    expect(p).toContain("<<<SECTION 2>>>\n2. 범위\n---\n다");
    const out = parseOutput("<<<TITLE>>>\nIntended purpose\n<<<SECTION 1>>>\n1. Purpose\n---\nA\nB\n<<<SECTION 2>>>\n2. Scope\n---\nC\n", 2);
    expect(out).toEqual({ title: "Intended purpose", sections: [{ heading: "1. Purpose", body: "A\nB" }, { heading: "2. Scope", body: "C" }] });
  });
  it("본문 안의 --- (표 구분선 등)는 유지", () => {
    const out = parseOutput("<<<TITLE>>>\nT\n<<<SECTION 1>>>\nH\n---\n| a | b |\n---\n| 1 | 2 |", 1);
    expect(out!.sections[0].body).toBe("| a | b |\n---\n| 1 | 2 |");
  });
  it("섹션이 빠지면 null", () => {
    expect(parseOutput("<<<TITLE>>>\nT\n<<<SECTION 1>>>\nH\n---\nA", 2)).toBeNull();
  });
});
