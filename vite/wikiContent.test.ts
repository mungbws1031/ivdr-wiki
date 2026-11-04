import { describe, expect, it } from "vitest";
import { buildConcepts, splitFrontmatter, splitParagraphs } from "./wikiContent";

const note = (fm: string, body: string) => `---\n${fm}\n---\n\n${body}\n`;
const base = (extra = "") =>
  `term: 테스트 개념\ncategory: concept\nsummary: 한 줄 정의\n${extra}`.trim();

describe("splitFrontmatter", () => {
  it("BOM·윈도 줄바꿈도 읽는다", () => {
    const r = splitFrontmatter("﻿---\r\nterm: A\r\n---\r\n본문");
    expect(r?.data).toEqual({ term: "A" });
    expect(r?.body).toBe("본문");
  });
  it("앞머리가 없으면 null", () => {
    expect(splitFrontmatter("그냥 글")).toBeNull();
  });
});

describe("splitParagraphs", () => {
  it("빈 줄로 문단을 나누고 문단 안 줄바꿈은 공백으로 합친다", () => {
    expect(splitParagraphs("첫 줄\n이어짐\n\n\n둘째 문단  \n")).toEqual(["첫 줄 이어짐", "둘째 문단"]);
  });
});

describe("buildConcepts", () => {
  it("[[slug|표시]] 를 사이트 형식 {{slug|표시}} 로 바꾼다", () => {
    const r = buildConcepts(
      [
        { name: "a.md", src: note(base("aliases: [에이]"), "[[b|비 개념]]을 본다.") },
        { name: "b.md", src: note(base(), "끝.") },
      ],
      { includeDrafts: false },
    );
    expect(r.errors).toEqual([]);
    expect(r.concepts.find((c) => c.slug === "a")?.body).toEqual(["{{b|비 개념}}을 본다."]);
    expect(r.concepts.find((c) => c.slug === "a")?.aka).toEqual(["에이"]);
  });

  it("별칭으로 건 링크와 표시 글자가 없는 링크도 연결한다", () => {
    const r = buildConcepts(
      [
        { name: "a.md", src: note(base(), "[[사용목적]] 그리고 [[b]]") },
        { name: "b.md", src: note("term: 의도된 목적\ncategory: concept\nsummary: s\naliases:\n  - 사용목적", "끝.") },
      ],
      { includeDrafts: false },
    );
    expect(r.errors).toEqual([]);
    expect(r.concepts.find((c) => c.slug === "a")?.body).toEqual(["{{b|사용목적}} 그리고 {{b|의도된 목적}}"]);
  });

  it("related 는 [[링크]]·[[링크|표시]]·파일 이름 모두 받는다", () => {
    const r = buildConcepts(
      [
        { name: "a.md", src: note(base(`related:\n  - "[[b]]"\n  - "[[c|씨]]"\n  - b`), "x") },
        { name: "b.md", src: note("term: 비\ncategory: concept\nsummary: s", "x") },
        { name: "c.md", src: note("term: 씨\ncategory: concept\nsummary: s", "x") },
      ],
      { includeDrafts: false },
    );
    expect(r.errors).toEqual([]);
    expect(r.concepts.find((c) => c.slug === "a")?.relatedConceptSlugs).toEqual(["b", "c"]);
  });

  it("없는 노트로 가는 링크·related 는 오류로 빌드를 멈추게 한다", () => {
    const r = buildConcepts(
      [{ name: "a.md", src: note(base("related: [zzz]"), "[[없는개념|x]]") }],
      { includeDrafts: false },
    );
    expect(r.errors.length).toBe(2);
    expect(r.errors.join("\n")).toContain("없는개념");
    expect(r.errors.join("\n")).toContain("zzz");
  });

  it("필수 칸·category·파일 이름을 검사한다", () => {
    const r = buildConcepts(
      [
        { name: "a.md", src: note("term: ''\ncategory: 기타\nsummary: s", "본문") },
        { name: "새 개념.md", src: note(base(), "본문") },
        { name: "c.md", src: "속성 없는 노트" },
      ],
      { includeDrafts: false },
    );
    const all = r.errors.join("\n");
    expect(all).toContain("term");
    expect(all).toContain("category");
    expect(all).toContain("파일 이름");
    expect(all).toContain("속성");
  });

  it("draft 는 배포에서 빠지고, 초안으로 가는 링크는 글자만 남는다", () => {
    const files = [
      { name: "a.md", src: note(base("related: [b]"), "[[b|비]] 참고") },
      { name: "b.md", src: note("term: 비 개념\ncategory: concept\nsummary: s\nstatus: draft", "작성 중") },
    ];
    const pub = buildConcepts(files, { includeDrafts: false });
    expect(pub.errors).toEqual([]);
    expect(pub.concepts.map((c) => c.slug)).toEqual(["a"]);
    expect(pub.concepts[0].body).toEqual(["비 참고"]);
    expect(pub.concepts[0].relatedConceptSlugs).toEqual([]);
    expect(pub.warnings.length).toBe(2);

    const dev = buildConcepts(files, { includeDrafts: true });
    expect(dev.concepts.map((c) => c.slug)).toEqual(["a", "b"]);
    expect(dev.concepts[0].body).toEqual(["{{b|비}} 참고"]);
  });

  it("쓰다 만 초안(빈칸·깨진 링크)은 배포를 막지 않고 알림만 낸다", () => {
    const r = buildConcepts(
      [
        { name: "a.md", src: note(base(), "완성된 글") },
        { name: "b.md", src: note("term:\ncategory: concept\nsummary:\nstatus: draft", "[[아직없음|x]] 작성 중") },
      ],
      { includeDrafts: false },
    );
    expect(r.errors).toEqual([]);
    expect(r.concepts.map((c) => c.slug)).toEqual(["a"]);
    expect(r.warnings.join("\n")).toContain("초안");
  });

  it("order 순서로 정렬하고, 없으면 맨 뒤(파일 이름순)", () => {
    const r = buildConcepts(
      [
        { name: "z.md", src: note(base("order: 10"), "x") },
        { name: "b.md", src: note(base(), "x") },
        { name: "a.md", src: note(base(), "x") },
        { name: "m.md", src: note(base("order: 5"), "x") },
      ],
      { includeDrafts: false },
    );
    expect(r.concepts.map((c) => c.slug)).toEqual(["m", "z", "a", "b"]);
  });

  it("stations 는 숫자 목록이어야 하고, _ 로 시작하는 파일은 무시한다", () => {
    const r = buildConcepts(
      [
        { name: "a.md", src: note(base("stations: [1, '2']"), "x") },
        { name: "b.md", src: note(base("stations: [하나]"), "x") },
        { name: "_메모.md", src: "아무거나" },
      ],
      { includeDrafts: false },
    );
    expect(r.concepts.find((c) => c.slug === "a")?.relatedStationIds).toEqual([1, 2]);
    expect(r.errors.join("\n")).toContain("stations");
    expect(r.errors.length).toBe(1);
  });
});
