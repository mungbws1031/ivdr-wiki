// =====================================================================
// src/lib/results.ts
// 실험 결과 — 사람이 입력한 값(판정·건수·날짜·원자료 번호)과 그로부터 계산한 지표.
// 숫자는 사람이 입력한 것만 쓴다. 입력이 없으면 "[실험 후 입력]"으로 남긴다.
// 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import { clopperPearsonLower, wilsonInterval } from "./stats";
import { planStudies, type StudyCategory, type StudyPlan } from "./planner";

export type Verdict = "pass" | "fail" | "in-progress";

export interface CutoffLevel {
  label: string;
  conc: number | null;
  n: number | null;
  positive: number | null;
}

export interface StudyResult {
  verdict: Verdict | null;
  date: string | null; // YYYY-MM-DD
  summary: string | null;
  rawRef: string | null; // 원자료·시험 보고서 번호
  /** 임상 성능 2×2 */
  tp?: number | null;
  fn?: number | null;
  tn?: number | null;
  fp?: number | null;
  invalid?: number | null;
  /** cut-off 특성 수준별 양성 비율 */
  levels?: CutoffLevel[];
  /** 실시간 안정성 — 입증된 기간(개월) */
  verifiedMonths?: number | null;
  updatedAt?: string | null;
}

export type ResultsMap = Record<string, StudyResult>;

export const emptyResult = (): StudyResult => ({ verdict: null, date: null, summary: null, rawRef: null });

export const VERDICT_KO: Record<Verdict, string> = { pass: "합격", fail: "불합격", "in-progress": "진행 중" };

/** 사람이 무엇이라도 입력했는지. */
export function hasResult(r: StudyResult | undefined): boolean {
  if (!r) return false;
  return !!(r.verdict || r.date || r.summary || r.rawRef || r.tp != null || r.tn != null || r.verifiedMonths != null || r.levels?.some((l) => l.n != null));
}

/** 결과 입력 방식 — 임상(2×2), cut-off(수준별), 실시간 안정성(입증 기간), 그 외(판정·요약). */
export function resultKind(studyId: string): "clinical" | "cutoff" | "stability" | "generic" {
  if (studyId === "clinical-performance") return "clinical";
  if (studyId === "cutoff-precision") return "cutoff";
  if (studyId === "stability-realtime") return "stability";
  return "generic";
}

/** 스펙 cut-off로 제안 수준을 만든다 (실험계획과 같은 수준). */
export function defaultCutoffLevels(s: ProductSpec): CutoffLevel[] {
  const c = s.analyte.cutoffValue;
  const r = (v: number) => Math.round(v * 100) / 100;
  const mk = (label: string, f: number | null): CutoffLevel => ({ label, conc: c !== null && f !== null ? r(c * f) : null, n: null, positive: null });
  return [mk("음성", 0), mk("−50%", 0.5), mk("−20%", 0.8), mk("Cut-off", 1), mk("+20%", 1.2), mk("+50%", 1.5)];
}

export interface ClinicalMetrics {
  se: number | null;
  sp: number | null;
  seLower: number | null;
  spLower: number | null;
  seCI: [number, number] | null;
  spCI: [number, number] | null;
  invalidRate: number | null;
  meetsSe: boolean | null;
  meetsSp: boolean | null;
  conf: number | null;
}

export function clinicalMetrics(r: StudyResult | undefined, s: ProductSpec): ClinicalMetrics {
  const conf = s.targets.confidence;
  const tp = r?.tp ?? null, fn = r?.fn ?? null, tn = r?.tn ?? null, fp = r?.fp ?? null;
  const pos = tp !== null && fn !== null && tp + fn > 0 ? tp + fn : null;
  const neg = tn !== null && fp !== null && tn + fp > 0 ? tn + fp : null;
  const c = conf !== null ? conf / 100 : null;
  const seLower = pos !== null && c !== null ? clopperPearsonLower(tp!, pos, c) : null;
  const spLower = neg !== null && c !== null ? clopperPearsonLower(tn!, neg, c) : null;
  const total = (pos ?? 0) + (neg ?? 0) + (r?.invalid ?? 0);
  return {
    se: pos !== null ? tp! / pos : null,
    sp: neg !== null ? tn! / neg : null,
    seLower, spLower,
    seCI: pos !== null ? wilsonInterval(tp!, pos) : null,
    spCI: neg !== null ? wilsonInterval(tn!, neg) : null,
    invalidRate: r?.invalid != null && total > 0 ? r.invalid / total : null,
    meetsSe: seLower !== null && s.targets.sensitivity !== null ? seLower * 100 >= s.targets.sensitivity : null,
    meetsSp: spLower !== null && s.targets.specificity !== null ? spLower * 100 >= s.targets.specificity : null,
    conf,
  };
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const TBD = "[실험 후 입력]";

function headLine(p: StudyPlan, r: StudyResult | undefined): string {
  if (!hasResult(r)) return `■ ${p.title}: ${TBD}`;
  const v = r!.verdict ? VERDICT_KO[r!.verdict] : "[판정 미입력]";
  return `■ ${p.title}: ${v}${r!.date ? ` (${r!.date})` : ""}${r!.rawRef ? ` — 원자료 ${r!.rawRef}` : ""}`;
}

export function clinicalText(r: StudyResult | undefined, s: ProductSpec): string {
  if (!r || r.tp == null || r.fn == null || r.tn == null || r.fp == null) {
    return `양성 일치 a / (a+c): ${TBD}\n음성 일치 d / (b+d): ${TBD}\n신뢰하한: ${TBD}\n무효 결과: ${TBD}\n결론: ${TBD}`;
  }
  const m = clinicalMetrics(r, s);
  const lb = (v: number | null, meets: boolean | null, target: number | null) =>
    v === null ? "[신뢰수준 — 스펙 미입력]" : `${pct(v)}${target !== null ? ` (목표 ${target}% ${meets ? "충족" : "미충족"})` : " (목표 — 스펙 미입력)"}`;
  return [
    `2×2 표 (기준 방법 대비): 참양성 a=${r.tp}, 위양성 b=${r.fp}, 위음성 c=${r.fn}, 참음성 d=${r.tn}`,
    `민감도(양성 일치율) a/(a+c) = ${r.tp}/${r.tp + r.fn} = ${m.se !== null ? pct(m.se) : "—"} · Wilson 95% 구간 ${m.seCI ? `${pct(m.seCI[0])}–${pct(m.seCI[1])}` : "—"}`,
    `특이도(음성 일치율) d/(b+d) = ${r.tn}/${r.tn + r.fp} = ${m.sp !== null ? pct(m.sp) : "—"} · Wilson 95% 구간 ${m.spCI ? `${pct(m.spCI[0])}–${pct(m.spCI[1])}` : "—"}`,
    `${m.conf ?? "?"}% 단측 신뢰하한 (Clopper-Pearson): 민감도 ${lb(m.seLower, m.meetsSe, s.targets.sensitivity)}, 특이도 ${lb(m.spLower, m.meetsSp, s.targets.specificity)}`,
    `무효 결과: ${r.invalid != null ? `${r.invalid}건${m.invalidRate !== null ? ` (${pct(m.invalidRate)})` : ""}` : TBD}`,
    `결론: ${r.verdict ? VERDICT_KO[r.verdict] : "[판정 미입력]"}${r.summary ? ` — ${r.summary}` : ""}`,
  ].join("\n");
}

function cutoffText(r: StudyResult | undefined, unit: string): string[] {
  const rows = (r?.levels ?? []).filter((l) => l.n != null && l.positive != null && l.n > 0);
  return rows.map((l) => `   ${l.label}${l.conc !== null ? ` (${l.conc}${unit})` : ""}: 양성 ${l.positive}/${l.n} = ${pct(l.positive! / l.n!)}`);
}

/** 카테고리별 결과 요약 — 문서 토큰용. */
export function resultsText(s: ProductSpec, results: ResultsMap, cats: StudyCategory[], ids?: string[]): string {
  const unit = s.analyte.cutoffUnit ? ` ${s.analyte.cutoffUnit}` : "";
  return planStudies(s)
    .filter((p) => p.status !== "excluded" && (ids ? ids.includes(p.id) : cats.includes(p.category)))
    .map((p) => {
      const r = results[p.id];
      const lines = [headLine(p, r)];
      if (p.id === "cutoff-precision") lines.push(...cutoffText(r, unit));
      if (p.id === "stability-realtime" && r?.verifiedMonths != null) lines.push(`   입증 기간: ${r.verifiedMonths}개월`);
      if (p.id === "clinical-performance" && hasResult(r)) lines.push(...clinicalText(r, s).split("\n").slice(0, 4).map((x) => `   ${x}`));
      if (r?.summary && p.id !== "clinical-performance") lines.push(`   ${r.summary}`);
      return lines.join("\n");
    })
    .join("\n");
}

export function resultsTokens(s: ProductSpec, results: ResultsMap): Record<string, string> {
  const rt = results["stability-realtime"];
  const shelf = s.storage.shelfLifeMonths;
  const tr = results["stability-transport"];
  return {
    analyticalResults: resultsText(s, results, ["analytical"]),
    stabilityResults: resultsText(s, results, ["stability"]),
    clinicalResults: clinicalText(results["clinical-performance"], s),
    stabilityConclusion:
      rt?.verifiedMonths != null
        ? `입증된 유효기간: ${rt.verifiedMonths}개월 (실시간 안정성)${shelf !== null ? ` — 목표 ${shelf}개월 ${rt.verifiedMonths >= shelf ? "충족" : `미충족: 라벨 유효기간은 ${rt.verifiedMonths}개월 이하로 표시`}` : ""}`
        : `입증된 유효기간: ${TBD}`,
    transportResults: hasResult(tr)
      ? `${headLine({ title: "운송 안정성" } as StudyPlan, tr)}${tr!.summary ? `\n${tr!.summary}` : ""}`
      : `외관 검사 결과: ${TBD}\n운송 후 성능 확인 결과: ${TBD}\n판정 기준 충족 여부: ${TBD}\n결론: ${TBD}`,
  };
}

/** 결과 입력 진행률 (불필요 판정 실험 제외). */
export function resultsProgress(s: ProductSpec, results: ResultsMap): { done: number; entered: number; total: number } {
  const list = planStudies(s).filter((p) => p.status === "required" || p.status === "recommended");
  return {
    total: list.length,
    entered: list.filter((p) => hasResult(results[p.id])).length,
    done: list.filter((p) => results[p.id]?.verdict === "pass" || results[p.id]?.verdict === "fail").length,
  };
}
