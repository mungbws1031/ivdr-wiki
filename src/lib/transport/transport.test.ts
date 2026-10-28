import { describe, expect, it } from "vitest";
import { resolveDoc } from "../../data/documents";
import { emptySpec, exampleSpec, specHash, validateSpec } from "../../data/spec/validate";
import { buildTokenContext, docMissingTokens, fillDoc, TOKEN_LABEL } from "../tokens";
import { evaluateLeaf } from "../rules/applicability";
import { classify } from "../rules/classify";
import { leafById } from "../../data/docTree";
import { applicableStandards, packagingChecklist, transportProcess, transportTestPlan, transportTokens } from "./index";

const statusOf = (s: ReturnType<typeof exampleSpec>, id: string) => applicableStandards(s).find((x) => x.id === id)?.status;

describe("운송 — 예시 스펙 (EU, 택배+항공, 2–30℃, 비멸균, 위험물 아님)", () => {
  const s = exampleSpec();
  it("적용 규격 판정", () => {
    expect(statusOf(s, "ivdr-gspr7")).toBe("required");
    expect(statusOf(s, "en-iso-23640")).toBe("required");
    expect(statusOf(s, "ista-3a")).toBe("recommended");
    expect(statusOf(s, "ista-7e")).toBe("excluded");
    expect(statusOf(s, "iso-11607")).toBe("excluded");
    expect(statusOf(s, "iata-dgr")).toBe("excluded");
    expect(statusOf(s, "ppwr")).toBe("required");
    expect(applicableStandards(s).find((x) => x.id === "ppwr")?.verify).toBe(true);
  });
  it("항공이 있으면 저압 단계가 필수", () => {
    expect(transportTestPlan(s).steps.find((x) => x.id === "low-pressure")?.required).toBe(true);
    const noAir = exampleSpec();
    noAir.transport.modes = ["parcel"];
    expect(transportTestPlan(noAir).steps.find((x) => x.id === "low-pressure")?.required).toBe(false);
  });
  it("PPWR 예외는 1차 포장에만 — 2·3차는 예외 아님", () => {
    const ppwr = packagingChecklist(s).find((g) => g.id === "ppwr")!;
    const recyc = ppwr.items.find((i) => i.text.startsWith("재활용 가능 설계"))!;
    expect(recyc.text).toContain("1차 포장만 예외");
    expect(recyc.why).toContain("2·3차 포장은 예외가 아닙니다");
    expect(ppwr.items.every((i) => i.verify)).toBe(true);
  });
  it("시험 강도 수치를 지어내지 않는다", () => {
    const text = transportTestPlan(s).steps.map((x) => x.detail).join("\n");
    expect(text).toContain("ISTA 3A 원문");
    expect(text).not.toMatch(/\d+\s*(cm|mm|Hz|g²|Grms)\b/);
  });
  it("EU 수입자·유통자 의무가 운송 과정에 들어간다", () => {
    const p = transportProcess(s);
    expect(p.map((x) => x.id)).toEqual(["pack", "pickup", "air", "customs", "distribution", "receive"]);
    expect(p.find((x) => x.id === "customs")!.controls.join(" ")).toContain("IVDR Art.13");
  });
});

describe("운송 — 조건별 분기", () => {
  it("냉장(2–8℃)이면 ISTA 7E 필수, 데이터로거 포함", () => {
    const s = exampleSpec();
    s.storage.tempMaxC = 8;
    expect(statusOf(s, "ista-7e")).toBe("required");
    expect(transportProcess(s)[0].controls.join(" ")).toContain("데이터로거");
    expect(transportTestPlan(s).steps.find((x) => x.id === "thermal")?.method).toBe("ISTA 7E");
  });
  it("멸균이면 ISO 11607 필수", () => {
    const s = exampleSpec();
    s.sterile = true;
    expect(statusOf(s, "iso-11607")).toBe("required");
  });
  it("위험물 모름이면 IATA 확인 필요, 예이면 필수", () => {
    const s = exampleSpec();
    s.transport.dangerousGoods = null;
    expect(statusOf(s, "iata-dgr")).toBe("unknown");
    s.transport.dangerousGoods = true;
    expect(statusOf(s, "iata-dgr")).toBe("required");
  });
  it("80 kg이면 ISTA 3A 범위 밖 안내", () => {
    const s = exampleSpec();
    s.transport.grossWeightKg = 80;
    expect(statusOf(s, "ista-3a")).toBe("excluded");
    expect(transportTestPlan(s).outOfScope).toContain("70 kg");
  });
  it("EU가 아니면 PPWR 불필요, 체크리스트 해당 없음", () => {
    const s = exampleSpec();
    s.markets = ["KR"];
    s.transport.destinations = ["KR"];
    expect(statusOf(s, "ppwr")).toBe("excluded");
    expect(packagingChecklist(s).find((g) => g.id === "ppwr")!.items.every((i) => i.na)).toBe(true);
    expect(transportProcess(s).some((x) => x.id === "customs")).toBe(false);
  });
});

describe("운송 — 스펙·문서 연결", () => {
  it("운송 정보는 분류 확정 해시에 영향이 없다", () => {
    const a = exampleSpec();
    const b = exampleSpec();
    b.transport.grossWeightKg = 9;
    expect(specHash(a)).toBe(specHash(b));
  });
  it("예전 스펙(운송 키 없음)도 가져오기에서 빈 운송 정보로 보완", () => {
    const old = JSON.parse(JSON.stringify(exampleSpec()));
    delete old.transport;
    const r = validateSpec(old);
    expect(r.ok).toBe(true);
    expect(r.spec.transport.modes).toBeNull();
  });
  it("운송 입력이 없으면 토큰은 전부 미입력", () => {
    expect(Object.values(transportTokens(emptySpec())).every((v) => v === null)).toBe(true);
  });
  it("문서 세트: 운송 방식이 있으면 운송 밸리데이션 필수", () => {
    const s = exampleSpec();
    expect(evaluateLeaf(leafById("transport-validation")!, s, classify(s)).status).toBe("required");
    const e = emptySpec();
    expect(evaluateLeaf(leafById("transport-validation")!, e, classify(e)).status).toBe("recommended");
  });
  it("운송 밸리데이션 문서가 채워지고 모든 토큰이 정의되어 있다", () => {
    const doc = resolveDoc("transport-validation")!;
    expect(doc.sections.slice(0, 4).map((x) => x.heading)).toEqual(["1. 목적 · 적용 범위", "2. 운송 경로 · 조건 · 적용 규격", "3. 근거 · 참조", "4. 검토 · 승인"]);
    const ctx = buildTokenContext(exampleSpec());
    for (const sec of doc.sections) for (const m of sec.placeholder.matchAll(/\{\{auto\.([a-zA-Z]+)\}\}/g)) {
      expect(m[1] in ctx, m[1]).toBe(true);
      expect(TOKEN_LABEL[m[1]], m[1]).toBeTruthy();
    }
    const all = fillDoc(doc, ctx).sections.map((x) => x.placeholder).join("\n");
    expect(all).toContain("ISTA 3A");
    expect(all).toContain("택배·소포, 항공");
    expect(all).not.toMatch(/\{\{auto\./);
    expect(docMissingTokens(doc, ctx)).toEqual([]);
  });
});
