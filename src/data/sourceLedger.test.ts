import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SOURCE_LEDGER } from "./sourceLedger";

// 근거 원문 목록과 실제 코드·노트의 판 번호가 어긋나지 않는지 검사해요.
// 한쪽에서만 판 번호를 바꾸면 여기서 실패해요 → 목록과 파일을 함께 고치세요.
describe("근거 원문 목록 (sourceLedger)", () => {
  it("id 가 겹치지 않고, 확인 날짜는 YYYY-MM-DD", () => {
    expect(new Set(SOURCE_LEDGER.map((x) => x.id)).size).toBe(SOURCE_LEDGER.length);
    for (const x of SOURCE_LEDGER) expect(x.checked, x.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  for (const x of SOURCE_LEDGER) {
    it(`${x.id}: 쓰는 파일마다 "${x.cite}" 가 적혀 있다`, () => {
      expect(x.usedIn.length).toBeGreaterThan(0);
      for (const f of x.usedIn) {
        const p = resolve(process.cwd(), f);
        expect(existsSync(p), `${f} 파일이 없어요`).toBe(true);
        expect(readFileSync(p, "utf8").includes(x.cite), `${f} 에 "${x.cite}" 가 없어요`).toBe(true);
      }
    });
  }
});
