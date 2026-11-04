import { describe, expect, it } from "vitest";
import { exampleSpec } from "../data/spec/validate";
import { emptyTraceStore, buildTrace } from "./trace";
import type { ResultsMap } from "./results";
import { buildDsoImpact, dsoChangeCsv, emptyDsoStore, verdictKey, type Dso, type DsoStore } from "./dso";

const trace = (r: ResultsMap = {}) => buildTrace(exampleSpec(), r, emptyTraceStore());

const dso = (over: Partial<Dso> = {}): Dso => ({ id: "DSO-001", kind: "bom", name: "메인 BOM", revision: "A", reqs: ["REQ-PERF-001"], revSeq: 0, ...over });

describe("DSO 영향 후보", () => {
  it("REQ 연결 → RSK·VFY·문서섹션 후보가 나온다", () => {
    const t = trace();
    const impacts = buildDsoImpact(dso(), t, emptyDsoStore());
    expect(impacts.some((x) => x.kind === "req" && x.ref === "REQ-PERF-001")).toBe(true);
    expect(impacts.some((x) => x.kind === "vfy" && x.ref === "VFY-clinical-performance")).toBe(true);
    const risk = impacts.find((x) => x.kind === "risk" && x.label === "위양성 결과");
    expect(risk).toBeTruthy();
    expect(impacts.some((x) => x.kind === "doc" && x.ref === "clinical-performance")).toBe(true);
  });

  it("판정이 저장되면 후보에 반영된다", () => {
    const t = trace();
    const d = dso();
    const store: DsoStore = { ...emptyDsoStore(), verdicts: { [verdictKey(d, "req", "REQ-PERF-001")]: "no-impact" } };
    const impacts = buildDsoImpact(d, t, store);
    expect(impacts.find((x) => x.kind === "req" && x.ref === "REQ-PERF-001")?.verdict).toBe("no-impact");
  });

  it("리비전이 바뀌면 이전 판정 키가 더 이상 매칭되지 않아 '판정 필요'로 돌아간다", () => {
    const t = trace();
    const d0 = dso({ revision: "A", revSeq: 0 });
    const store: DsoStore = { ...emptyDsoStore(), verdicts: { [verdictKey(d0, "req", "REQ-PERF-001")]: "no-impact" } };
    const impactsA = buildDsoImpact(d0, t, store);
    expect(impactsA.find((x) => x.kind === "req" && x.ref === "REQ-PERF-001")?.verdict).toBe("no-impact");

    const d1 = dso({ revision: "B", revSeq: 1 });
    const impactsB = buildDsoImpact(d1, t, store);
    expect(impactsB.find((x) => x.kind === "req" && x.ref === "REQ-PERF-001")?.verdict).toBeNull();
  });

  it("리비전을 A→B→A로 되돌려도 변경 사건(revSeq)이 달라 '판정 필요'로 돌아간다(과거 판정이 되살아나지 않는다)", () => {
    const t = trace();
    const atA = dso({ revision: "A", revSeq: 0 });
    const store: DsoStore = { ...emptyDsoStore(), verdicts: { [verdictKey(atA, "req", "REQ-PERF-001")]: "no-impact" } };

    // 리비전을 B로 바꿈(revSeq 1) → 아직 판정 안 함 → 다시 A로 되돌림(revSeq 2, 리비전 이름은 최초와 같음)
    const backToA = dso({ revision: "A", revSeq: 2 });
    const impacts = buildDsoImpact(backToA, t, store);
    expect(impacts.find((x) => x.kind === "req" && x.ref === "REQ-PERF-001")?.verdict).toBeNull();
  });

  it("연결된 REQ가 없으면 영향 후보가 빈 배열", () => {
    const t = trace();
    const impacts = buildDsoImpact(dso({ reqs: [] }), t, emptyDsoStore());
    expect(impacts).toEqual([]);
  });

  it("REQ는 있지만 연결된 RSK가 없으면 req 항목만 나오고 risk 항목은 없다", () => {
    // 수동으로 추가한 커스텀 REQ는 어떤 VFY·위해요인과도 자동으로 연결되지 않는다
    const store = { ...emptyTraceStore(), custom: [{ id: "REQ-CUSTOM-1", category: "기타" as const, text: "커스텀 요구사항" }] };
    const t = buildTrace(exampleSpec(), {}, store);
    const impacts = buildDsoImpact(dso({ reqs: ["REQ-CUSTOM-1"] }), t, emptyDsoStore());
    expect(impacts.some((x) => x.kind === "req" && x.ref === "REQ-CUSTOM-1")).toBe(true);
    expect(impacts.some((x) => x.kind === "risk")).toBe(false);
  });

  it("여러 REQ가 같은 RSK를 공유해도 중복 없이 한 번만 후보에 나온다", () => {
    const t = trace();
    const impacts = buildDsoImpact(dso({ reqs: ["REQ-PERF-001", "REQ-PERF-002"] }), t, emptyDsoStore());
    const riskHits = impacts.filter((x) => x.kind === "risk" && x.label === "위양성 결과");
    expect(riskHits.length).toBe(1);
  });

  it("DSO·변경이 하나도 없으면 CSV는 헤더 한 줄만 나온다", () => {
    const csv = dsoChangeCsv([], [], {});
    expect(csv.startsWith("﻿\"DSO\"")).toBe(true);
    expect(csv.split("\r\n").length).toBe(1);
  });

  it("CSV는 BOM과 헤더로 시작", () => {
    const d = dso();
    const changes = [{ id: "CHG-1", dsoId: d.id, revision: "B", seq: 1, reason: "부품 교체", author: "홍길동", date: "2026-11-04" }];
    const csv = dsoChangeCsv([d], changes, {});
    expect(csv.startsWith("﻿\"DSO\"")).toBe(true);
    expect(csv).toContain("부품 교체");
  });

  it("CSV 셀이 =,+,-,@로 시작하면 수식 인젝션 방어로 앞에 작은따옴표를 붙인다", () => {
    const d = dso({ name: "=SUM(A1:A9)" });
    const changes = [{ id: "CHG-1", dsoId: d.id, revision: "B", seq: 1, reason: "+1,0,0,-SYS(cmd)", author: "@admin", date: "2026-11-04" }];
    const csv = dsoChangeCsv([d], changes, {});
    expect(csv).toContain("\"'=SUM(A1:A9)\"");
    expect(csv).toContain("\"'+1,0,0,-SYS(cmd)\"");
    expect(csv).toContain("\"'@admin\"");
  });
});
