import { describe, expect, it } from "vitest";
import { exampleSpec } from "../data/spec/validate";
import { resolveDoc } from "../data/documents";
import { buildTokenContext } from "./tokens";
import { docImpact, snapshotOf } from "./impact";

describe("변경 영향", () => {
  const doc = resolveDoc("intended-purpose")!;
  const s1 = exampleSpec();
  const base = snapshotOf(doc, buildTokenContext(s1));

  it("값이 그대로면 영향 없음", () => {
    expect(docImpact(doc, base, buildTokenContext(s1)).changes).toHaveLength(0);
  });
  it("사용자를 바꾸면 바뀐 값과 섹션이 나오고, 직접 쓴 섹션은 재검토 필요", () => {
    const s2 = exampleSpec();
    s2.user = "professional";
    const im = docImpact(doc, base, buildTokenContext(s2), (i) => i === 1);
    expect(im.changes.map((c) => c.key)).toContain("user");
    expect(im.sections.length).toBeGreaterThan(0);
    const drafted = im.sections.find((s) => s.index === 1);
    if (drafted) expect(im.review).toBe(1);
  });
  it("기준이 없으면 (아직 검토 안 함) 영향 없음", () => {
    expect(docImpact(doc, null, buildTokenContext(s1)).changes).toHaveLength(0);
  });
});

describe("차이 표시", () => {
  it("긴 문장은 달라진 부분 주변만", async () => {
    const { diffValues } = await import("./impact");
    const [b, a] = diffValues("소변에서 황체형성호르몬을 검출해 일반인이 가정에서 배란을 예측", "소변에서 황체형성호르몬을 검출해 전문가가 검사실에서 배란을 예측");
    expect(b).toContain("일반인");
    expect(a).toContain("전문가");
  });
});
