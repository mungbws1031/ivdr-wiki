import { describe, expect, it } from "vitest";
import { reviewerFindings, type ReviewerCheckInput } from "./reviewerCheck";

const base = (patch: Partial<ReviewerCheckInput> = {}): ReviewerCheckInput => ({
  docId: "test-doc",
  sections: [{ heading: "섹션1", placeholder: "예시 문장" }],
  checklist: ["항목 1", "항목 2"],
  checkedIdx: [],
  draftedIdx: [0],
  ...patch,
});

describe("reviewerFindings", () => {
  it("체크리스트 2개 중 1개만 체크 → finding 1개(나머지 1개 미체크)", () => {
    const findings = reviewerFindings(base({ checkedIdx: [0] }));
    const checklistFindings = findings.filter((f) => f.message.includes("C-01"));
    expect(checklistFindings).toHaveLength(1);
    expect(checklistFindings[0].message).toContain("항목 2");
    expect(checklistFindings[0].severity).toBe("주요");
  });

  it("섹션에 [실험 후 입력]이 있으면 빈칸 finding(C-10)", () => {
    const findings = reviewerFindings(
      base({
        checkedIdx: [0, 1],
        sections: [{ heading: "섹션1", placeholder: "민감도 [실험 후 입력]" }],
      }),
    );
    const gapFindings = findings.filter((f) => f.message.includes("C-10"));
    expect(gapFindings).toHaveLength(1);
    expect(gapFindings[0].severity).toBe("주요");
    expect(gapFindings[0].message).toContain("1개");
  });

  it("체크리스트 모두 체크 + 섹션 모두 직접 작성 + 빈칸 없음 → 빈 배열", () => {
    const findings = reviewerFindings(
      base({
        checkedIdx: [0, 1],
        draftedIdx: [0],
        sections: [{ heading: "섹션1", placeholder: "사람이 직접 채운 완성 문장" }],
      }),
    );
    expect(findings).toEqual([]);
  });

  it("지적 메시지의 숫자가 실제 빈칸 개수와 일치한다", () => {
    const findings = reviewerFindings(
      base({
        checkedIdx: [0, 1],
        sections: [{ heading: "섹션1", placeholder: "cut-off [사양: 미정], 민감도 [실험 후 입력], 특이도 [__]" }],
      }),
    );
    const gapFindings = findings.filter((f) => f.message.includes("C-10"));
    expect(gapFindings).toHaveLength(1);
    expect(gapFindings[0].message).toContain("3개");
  });

  it("직접 쓰지 않았고 {{auto.*}} 토큰도 없는 순수 예시 섹션 → 경미(C-05)", () => {
    const findings = reviewerFindings(
      base({
        checkedIdx: [0, 1],
        draftedIdx: [],
        sections: [{ heading: "섹션1", placeholder: "예시 그대로 남은 문장" }],
      }),
    );
    const gapFindings = findings.filter((f) => f.message.includes("C-05"));
    expect(gapFindings).toHaveLength(1);
    expect(gapFindings[0].severity).toBe("경미");
  });

  it("직접 쓰지 않았지만 {{auto.*}} 토큰이 있으면 C-05 대상이 아님(자동 채움은 예시가 아님)", () => {
    const findings = reviewerFindings(
      base({
        checkedIdx: [0, 1],
        draftedIdx: [],
        sections: [{ heading: "섹션1", placeholder: "제품명: {{auto.productName}}" }],
      }),
    );
    expect(findings.filter((f) => f.message.includes("C-05"))).toHaveLength(0);
  });

  it("checklist가 빈 배열이면 C-01 finding이 없다", () => {
    const findings = reviewerFindings(
      base({
        checklist: [],
        checkedIdx: [],
        draftedIdx: [0],
        sections: [{ heading: "섹션1", placeholder: "사람이 직접 채운 완성 문장" }],
      }),
    );
    expect(findings.filter((f) => f.message.includes("C-01"))).toHaveLength(0);
    expect(findings).toEqual([]);
  });

  it("sections가 빈 배열이면 C-05/C-10 finding이 없다", () => {
    const findings = reviewerFindings(
      base({
        checkedIdx: [0, 1],
        sections: [],
      }),
    );
    expect(findings).toEqual([]);
  });

  it("체크리스트는 전부 체크했지만 섹션에 빈칸이 남아 있으면 C-10만 남는다(체크리스트는 통과)", () => {
    const findings = reviewerFindings(
      base({
        checkedIdx: [0, 1],
        draftedIdx: [0],
        sections: [{ heading: "섹션1", placeholder: "민감도 [실험 후 입력]" }],
      }),
    );
    expect(findings.filter((f) => f.message.includes("C-01"))).toHaveLength(0);
    const gapFindings = findings.filter((f) => f.message.includes("C-10"));
    expect(gapFindings).toHaveLength(1);
    expect(gapFindings[0].severity).toBe("주요");
  });
});
