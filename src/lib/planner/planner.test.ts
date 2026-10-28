import { describe, expect, it } from "vitest";
import { resolveDoc } from "../../data/documents";
import { emptySpec, exampleSpec } from "../../data/spec/validate";
import { buildTokenContext, fillDoc, TOKEN_LABEL } from "../tokens";
import { clopperPearsonLower, minNForLowerBound, wilsonInterval } from "../stats";
import { planHumanTasks, planStudies, plannerTokens, sampleSizeTable } from "./index";

describe("통계", () => {
  it("95%/95% 입증 표본수 — 알려진 값과 일치 (0·1·2건 허용 → 59·93·124)", () => {
    expect([0, 1, 2].map((f) => minNForLowerBound(0.95, 0.95, f))).toEqual([59, 93, 124]);
    expect(minNForLowerBound(0.9, 0.95, 0)).toBe(29);
  });
  it("Clopper-Pearson 하한", () => {
    expect(clopperPearsonLower(95, 100, 0.975)).toBeCloseTo(0.8872, 3);
    expect(clopperPearsonLower(59, 59, 0.95)).toBeGreaterThanOrEqual(0.95);
    expect(clopperPearsonLower(0, 10)).toBe(0);
  });
  it("Wilson 구간", () => {
    const [lo, hi] = wilsonInterval(95, 100);
    expect(lo).toBeCloseTo(0.8882, 3);
    expect(hi).toBeCloseTo(0.9785, 3);
  });
});

describe("실험계획 — 예시 스펙 (LH, 소변, 정성, 일반인)", () => {
  const s = exampleSpec();
  const plans = planStudies(s);
  const get = (id: string) => plans.find((p) => p.id === id);
  it("정성 검사는 EP12 cut-off 특성, cut-off 주변 농도 계산", () => {
    const c = get("cutoff-precision")!;
    expect(c.status).toBe("required");
    expect(c.standards).toContain("CLSI EP12");
    expect(c.design[0]).toContain("20 · 30 mIU/mL");
    expect(get("lod")).toBeUndefined();
  });
  it("LH 교차반응 후보에 hCG·FSH·TSH", () => {
    expect(get("cross-reactivity")!.design[0]).toMatch(/hCG.*FSH.*TSH/);
  });
  it("일반인 → 사용적합성 형성·총괄 필수", () => {
    expect(get("usability-formative")!.status).toBe("required");
    expect(get("usability-summative")!.status).toBe("required");
  });
  it("실시간 안정성 기간 = 유효기간, 개봉 후 60분", () => {
    expect(get("stability-realtime")!.duration).toContain("24개월");
    expect(get("stability-in-use")!.design[0]).toContain("60분");
  });
  it("임상 표본수: 민감도 95%/95% → 59, 특이도는 비어 있어 지어내지 않음", () => {
    const c = get("clinical-performance")!;
    expect(c.samples[0]).toContain("오판정 0건 허용 시 n=59");
    expect(c.samples[1]).toContain("[사양:");
    expect(c.acceptance[1]).toContain("[사양:");
    expect(sampleSizeTable(null, 95)).toBeNull();
  });
  it("소변 검체 → 생체적합성 실험 없음", () => {
    expect(get("biocompatibility")).toBeUndefined();
  });
  it("사람 할 일에 IRB와 표준물질 확보", () => {
    const t = planHumanTasks(plans).map((x) => x.task).join("\n");
    expect(t).toContain("IRB");
    expect(t).toContain("국제표준물질");
  });
});

describe("실험계획 — 분기", () => {
  it("결과 형태 미입력 → 확인 필요", () => {
    const s = exampleSpec();
    s.result.kind = null;
    expect(planStudies(s).find((p) => p.id === "cutoff-precision")!.status).toBe("unknown");
  });
  it("정량 → EP17·EP05·EP06·EP09", () => {
    const s = exampleSpec();
    s.result.kind = "quantitative";
    const ids = planStudies(s).map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(["lod", "precision", "linearity", "method-comparison"]));
  });
  it("hCG → 후크 효과 필수", () => {
    const s = exampleSpec();
    s.analyte.preset = "hCG";
    expect(planStudies(s).find((p) => p.id === "hook")!.status).toBe("required");
  });
  it("모세혈 → 생체적합성 필수", () => {
    const s = exampleSpec();
    s.specimen = "capillary-blood";
    expect(planStudies(s).find((p) => p.id === "biocompatibility")!.status).toBe("required");
  });
});

describe("실험계획 — 문서 연결", () => {
  const DOCS = ["analytical-performance", "clinical-performance", "stability-study", "performance-eval-plan"];
  it("문서의 모든 토큰이 정의되어 있고 채워진다", () => {
    const ctx = buildTokenContext(exampleSpec());
    for (const id of DOCS) {
      const doc = resolveDoc(id)!;
      for (const sec of doc.sections) for (const m of sec.placeholder.matchAll(/\{\{auto\.([a-zA-Z]+)\}\}/g)) {
        expect(m[1] in ctx, `${id}: ${m[1]}`).toBe(true);
        expect(TOKEN_LABEL[m[1]], `${id}: ${m[1]}`).toBeTruthy();
      }
      expect(fillDoc(doc, ctx).sections.map((x) => x.placeholder).join("\n")).not.toMatch(/\{\{auto\./);
    }
  });
  it("새 상세 템플릿은 섹션 1~4 제목이 기존 자동 생성 템플릿과 같은 자리", () => {
    for (const id of ["analytical-performance", "clinical-performance", "stability-study"]) {
      const h = resolveDoc(id)!.sections.map((x) => x.heading);
      expect(h[0]).toBe("1. 목적 · 적용 범위");
      expect(h[2]).toBe("3. 근거 · 참조");
      expect(h[3]).toBe("4. 검토 · 승인");
    }
  });
  it("임상 성능 문서에 표본수가 들어간다", () => {
    const all = fillDoc(resolveDoc("clinical-performance")!, buildTokenContext(exampleSpec())).sections.map((x) => x.placeholder).join("\n");
    expect(all).toContain("n=59");
  });
  it("빈 스펙에서도 토큰은 지어내지 않음", () => {
    const t = plannerTokens(emptySpec());
    expect(t.sampleSize).toContain("[사양:");
  });
});
