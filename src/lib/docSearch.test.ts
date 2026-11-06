import { describe, expect, it } from "vitest";
import { searchDocs } from "./docSearch";

// 가상 사용자 리뷰: "포장", "운송"으로 검색하면 결과 0개였어요.
describe("문서 검색 (개념 위키 검색창)", () => {
  it("포장으로 찾으면 포장 관련 문서가 나온다", () => {
    const ids = searchDocs("포장").map((d) => d.id);
    expect(ids).toContain("product-preservation");
    expect(ids).toContain("packaging-validation");
  });
  it("운송으로 찾으면 운송 밸리데이션이 나온다", () => {
    expect(searchDocs("운송").map((d) => d.id)).toContain("transport-validation");
  });
  it("대소문자·앞뒤 공백을 가리지 않는다", () => {
    expect(searchDocs("  ista 3a ").map((d) => d.id)).toContain("transport-validation");
  });
  it("빈 검색어는 아무것도 돌려주지 않는다", () => {
    expect(searchDocs("   ")).toEqual([]);
  });
});
