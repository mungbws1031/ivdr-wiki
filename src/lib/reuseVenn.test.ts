import { describe, expect, it } from "vitest";
import { exampleSpec } from "../data/spec/validate";
import { leafById } from "../data/docTree";
import { docById } from "../data/documents";
import { REGION_ORDER, reuseVenn } from "./reuseVenn";

const where = (v: ReturnType<typeof reuseVenn>, id: string) =>
  REGION_ORDER.find((r) => v.regions[r].some((i) => i.docId === id));

describe("나라별 공통 재사용 문서 (reuseVenn)", () => {
  const v = reuseVenn(exampleSpec());

  it("분석 성능·안정성·라벨·IFU·위험관리는 세 나라 공통", () => {
    for (const id of ["analytical-performance", "stability-study", "labelling-spec", "ifu", "risk-management-plan"]) {
      expect(where(v, id), id).toBe("EKU");
    }
  });

  it("한국 기술문서 초안은 EU 문서 세트 밖이라 한국 쪽에 있다", () => {
    expect(where(v, "kr-technical-doc")).toMatch(/^K/);
  });

  it("앱이 없으면 SW 검증은 미국 쪽에 없다", () => {
    const r = where(v, "sw-validation");
    expect(r === undefined || !r.includes("U")).toBe(true);
  });

  it("나라 고유 절차(문서 없음)는 한국만·미국만에 들어간다", () => {
    expect(v.regions.U.some((i) => !i.docId && i.title.includes("시설 등록"))).toBe(true);
  });

  it("모든 문서 id가 실제 문서이고, 영역끼리 겹치지 않는다", () => {
    const ids = REGION_ORDER.flatMap((r) => v.regions[r].map((i) => i.key));
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of REGION_ORDER) for (const i of v.regions[r]) {
      if (i.docId) expect(leafById(i.docId) ?? docById(i.docId), i.docId).toBeTruthy();
    }
  });
});
