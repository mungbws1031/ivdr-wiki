// =====================================================================
// src/lib/gspr.ts
// GSPR(IVDR Annex I) 1차 판정 — 조항마다 해당·비해당·확인 필요와 이유, 근거 문서를 붙인다.
// 조항 제목은 요약이며 규정 원문과 대조하지 않았다 ("원문 확인 필요").
// 충족 방법·증거 위치는 사람이 채운다. 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import type { Applicability } from "./rules/applicability";

export type GsprVerdict = "applies" | "na" | "check";

export interface GsprRow {
  no: number;
  title: string;
  chapter: 1 | 2 | 3;
  verdict: GsprVerdict;
  reason: string;
  /** 근거 문서 id (문서 세트에서 '불필요'인 문서는 뺀다) */
  evidence: string[];
  /** 판정에 쓴 스펙 칸 */
  fields: string[];
}

export const GSPR_VERDICT_LABEL: Record<GsprVerdict, string> = { applies: "해당", na: "비해당", check: "확인 필요" };
export const GSPR_CHAPTERS: Record<1 | 2 | 3, string> = {
  1: "1장 일반 요구사항",
  2: "2장 성능·설계·제조 요구사항",
  3: "3장 기기와 함께 제공하는 정보",
};

interface Def {
  no: number;
  title: string;
  evidence: string[];
  judge: (s: ProductSpec) => { verdict: GsprVerdict; reason: string; fields?: string[]; extra?: string[] };
}

const always = (reason: string) => () => ({ verdict: "applies" as const, reason });

const DEFS: Def[] = [
  { no: 1, title: "의도된 성능 달성, 안전·효과", evidence: ["performance-eval-report", "risk-management-file", "benefit-risk"], judge: always("모든 IVD에 적용") },
  { no: 2, title: "위험을 가능한 한 줄임 (성능 저하 없이)", evidence: ["risk-management-file"], judge: always("모든 IVD에 적용") },
  { no: 3, title: "위험관리 시스템 수립·유지", evidence: ["risk-management-plan", "risk-management-file"], judge: always("모든 IVD에 적용 — ISO 14971") },
  { no: 4, title: "위험 통제 조치와 잔여 위험", evidence: ["risk-management-file", "fmea"], judge: always("모든 IVD에 적용") },
  { no: 5, title: "사용 오류 위험 감소 (사용자·사용 환경 고려)", evidence: ["usability-file", "risk-management-file"],
    judge: (s) => ({ verdict: "applies", reason: s.user === "lay" || s.user === "both" ? "모든 IVD에 적용 — 일반인 사용자라 사용적합성 근거가 핵심" : "모든 IVD에 적용", fields: ["user"] }) },
  { no: 6, title: "수명 기간 동안 특성·성능 유지", evidence: ["stability-study"], judge: always("모든 IVD에 적용 — 유효기간·개봉 후 안정성") },
  { no: 7, title: "운송·보관 중 특성·성능 유지", evidence: ["transport-validation", "stability-study", "packaging-validation"], judge: always("모든 IVD에 적용 — 운송·보관 조건") },
  { no: 8, title: "알려진 위험이 이익에 비해 수용 가능", evidence: ["benefit-risk", "risk-management-file"], judge: always("모든 IVD에 적용") },
  { no: 9, title: "성능 특성 (분석적·임상적 성능)", evidence: ["scientific-validity", "analytical-performance", "clinical-performance", "performance-eval-report"], judge: always("모든 IVD에 적용 — 성능평가") },
  { no: 10, title: "화학적·물리적·생물학적 특성", evidence: ["design-manufacturing-info", "device-description", "biocompatibility"],
    judge: (s) => ({ verdict: "applies", reason: s.specimen === "capillary-blood" || s.specimen === "swab" ? "적용 — 사용자 피부·점막에 닿는 구성품(채혈침·면봉)의 생체적합성 포함" : "적용 — 원자재·시약 성분과 검체·사용자 접촉", fields: ["specimen"] }) },
  { no: 11, title: "감염·미생물 오염", evidence: ["design-manufacturing-info", "risk-management-file", "sterilization-validation"],
    judge: (s) => ({ verdict: "applies", reason: s.sterile ? "적용 — 검체 취급 감염 위험 + 멸균 제품이라 멸균 밸리데이션 필요" : "적용 — 검체 취급·폐기 시 감염 위험, 미생물 오염 관리", fields: ["sterile", "specimen"] }) },
  { no: 12, title: "생물 유래 물질을 포함한 기기", evidence: ["design-manufacturing-info"],
    judge: () => ({ verdict: "check", reason: "원료(항체·항원·혈청 등)에 사람·동물·미생물 유래 물질이 있는지 스펙에 없음 — 원료 목록으로 판정" }) },
  { no: 13, title: "기기 구성과 환경 상호작용", evidence: ["device-description", "design-verification", "electrical-safety-emc"],
    judge: (s) => ({ verdict: "applies", reason: s.formFactor && s.formFactor !== "strip-only" ? "적용 — 기기·구성품 조합, 사용 환경, 다른 기기와의 간섭" : "적용 — 키트 구성품 조합과 사용 환경(온도·습도·조명)", fields: ["formFactor", "environment"] }) },
  { no: 14, title: "측정 기능이 있는 기기", evidence: ["metrological-traceability", "analytical-performance"],
    judge: (s) => {
      const k = s.result.kind;
      if (k === null) return { verdict: "check", reason: "결과 형태(정성·정량)가 입력되지 않음", fields: ["result.kind"] };
      if (k === "qualitative") return { verdict: "na", reason: "정성(양성/음성) 결과 — 측정값을 내지 않음", fields: ["result.kind"] };
      return { verdict: "applies", reason: `${k === "quantitative" ? "정량" : "반정량"} 결과 — 측정 정확도·단위·소급성`, fields: ["result.kind"] };
    } },
  { no: 15, title: "방사선 방호", evidence: ["electrical-safety-emc"],
    judge: (s) => {
      if (s.formFactor === null) return { verdict: "check", reason: "제품 형태가 입력되지 않음", fields: ["formFactor"] };
      if (s.formFactor === "strip-only") return { verdict: "na", reason: "기기 없는 스틱 — 방사선을 내지 않음", fields: ["formFactor"] };
      return { verdict: "check", reason: "기기의 광원(LED·레이저)·무선 통신 등 방사선 방출 여부 확인", fields: ["formFactor"] };
    } },
  { no: 16, title: "전자 프로그래머블 시스템·소프트웨어", evidence: ["sw-validation", "cybersecurity"],
    judge: (s) => {
      const device = s.formFactor !== null && s.formFactor !== "strip-only";
      const fields = ["software.hasApp", "result.readout", "formFactor"];
      if (s.software.hasApp || s.result.readout === "app" || s.result.readout === "reader" || device)
        return { verdict: "applies", reason: [s.software.hasApp || s.result.readout === "app" ? "스마트폰 앱" : "", s.result.readout === "reader" || device ? "기기 펌웨어" : ""].filter(Boolean).join(" + ") + " — SW 수명주기(IEC 62304)·사이버보안", fields };
      if (s.formFactor === "strip-only" && s.software.hasApp === false && s.result.readout !== null)
        return { verdict: "na", reason: "스틱만·육안 판독, 앱 없음 — 소프트웨어 없음", fields };
      return { verdict: "check", reason: "앱·판독 방식·제품 형태 중 입력되지 않은 칸이 있음", fields };
    } },
  { no: 17, title: "에너지원에 연결되거나 내장한 기기", evidence: ["electrical-safety-emc"],
    judge: (s) => {
      if (s.formFactor === null) return { verdict: "check", reason: "제품 형태가 입력되지 않음", fields: ["formFactor"] };
      if (s.formFactor === "strip-only") return { verdict: "na", reason: "기기 없는 스틱 — 전원·배터리 없음", fields: ["formFactor"] };
      return { verdict: "applies", reason: "전원·배터리가 있는 기기 — 전기안전(IEC 61010)·EMC", fields: ["formFactor"] };
    } },
  { no: 18, title: "기계적·열적 위험 방호", evidence: ["electrical-safety-emc", "risk-management-file"],
    judge: (s) => {
      const fields = ["formFactor", "specimen"];
      const device = s.formFactor !== null && s.formFactor !== "strip-only";
      if (device) return { verdict: "applies", reason: "기기의 움직이는 부품·발열·외함", fields };
      if (s.specimen === "capillary-blood") return { verdict: "applies", reason: "채혈침(란셋) 등 날카로운 구성품", fields };
      if (s.formFactor === null) return { verdict: "check", reason: "제품 형태가 입력되지 않음", fields };
      return { verdict: "na", reason: "기기·날카로운 구성품 없음", fields };
    } },
  { no: 19, title: "자가검사·근접검사 기기의 위험 방호", evidence: ["usability-file", "ifu", "clinical-performance"],
    judge: (s) => {
      const fields = ["user", "environment"];
      if (s.user === "lay" || s.user === "both") return { verdict: "applies", reason: "일반인 자가검사 — 사용 용이성·결과 해석·일반인 사용 성능", fields };
      if (s.environment === "near-patient") return { verdict: "applies", reason: "근접검사(약국·진료실) — 비검사실 사용자의 사용 용이성", fields };
      if (s.user === null) return { verdict: "check", reason: "사용자가 입력되지 않음", fields };
      return { verdict: "na", reason: "전문가가 검사실에서 사용", fields };
    } },
  { no: 20, title: "라벨과 사용설명서(IFU)", evidence: ["labelling-spec", "ifu"],
    judge: (s) => ({ verdict: "applies", reason: s.user === "lay" || s.user === "both" ? "모든 IVD에 적용 — 자가검사 추가 표시 항목 포함" : "모든 IVD에 적용", fields: ["user"] }) },
];

const chapterOf = (no: number): 1 | 2 | 3 => (no <= 8 ? 1 : no <= 19 ? 2 : 3);

export function gsprChecklist(s: ProductSpec, docSet: Applicability[]): GsprRow[] {
  const excluded = new Set(docSet.filter((a) => a.status === "excluded").map((a) => a.leafId));
  return DEFS.map((d) => {
    const j = d.judge(s);
    // 비멸균이면 멸균 밸리데이션은 근거에서 뺀다 (문서 세트에서도 불필요)
    const evidence = d.evidence.filter((id) => !excluded.has(id) && !(id === "sterilization-validation" && !s.sterile));
    return { no: d.no, title: d.title, chapter: chapterOf(d.no), verdict: j.verdict, reason: j.reason, evidence: j.verdict === "na" ? [] : evidence, fields: j.fields ?? [] };
  });
}

export function gsprCounts(rows: GsprRow[]): Record<GsprVerdict, number> {
  const c: Record<GsprVerdict, number> = { applies: 0, na: 0, check: 0 };
  rows.forEach((r) => c[r.verdict]++);
  return c;
}

/** 기술문서 GSPR 체크리스트용 마크다운 표. 충족 방법·증거 위치는 사람이 채운다. */
export function gsprTableMarkdown(rows: GsprRow[], title: (id: string) => string): string {
  const esc = (t: string) => t.replace(/\|/g, "/");
  const lines = [
    "| GSPR 조항 | 요구사항 요약 (원문 확인 필요) | 적용 | 판정 이유 | 근거 문서 | 충족 방법 | 증거 위치 |",
    "|---|---|---|---|---|---|---|",
    ...rows.map((r) => {
      const ev = r.verdict === "na" ? "—" : r.evidence.length ? r.evidence.map(title).join(", ") : "[근거 문서 지정 필요]";
      const applies = r.verdict === "check" ? "[확인 필요]" : GSPR_VERDICT_LABEL[r.verdict];
      const fill = r.verdict === "na" ? "— | —" : "[____] | [____]";
      return `| §${r.no} | ${esc(r.title)} | ${applies} | ${esc(r.reason)} | ${esc(ev)} | ${fill} |`;
    }),
  ];
  const c = gsprCounts(rows);
  lines.push("", `1차 판정: 해당 ${c.applies} · 비해당 ${c.na} · 확인 필요 ${c.check} (IVDR Annex I 20개 조항, 규칙 기반 — 조항 문구는 원문과 대조 필요)`);
  return lines.join("\n");
}
