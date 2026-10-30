// =====================================================================
// src/lib/evidence.ts
// 근거 원장 — 문서에 들어간 값마다 어디서 왔는지 태그를 단다.
//   입력: 사람이 스펙·결과에 넣은 값
//   규칙: 입력값에 규칙(분류·문서 세트·실험계획·운송)을 적용해 나온 값
//   가정: 비어 있어 보수적인 기본값으로 채운 값 — 확인 전까지 문서에 "(가정)" 표시
//   누락: 데이터가 없어 쓸 수 없는 칸 — 스펙 미입력, [실험 후 입력], [사양: …], [____], [… 원문 기준]
// 가정 모드: 등급·문서 세트를 바꾸는 빈 칸을 막지 않고 보수적으로 가정해 계속 진행한다.
// 순수 함수 (DOM·저장소 의존 없음).
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import { setAt } from "../data/spec/validate";

export type EvidenceTag = "input" | "estimated" | "rule" | "assumed" | "missing";

export const TAG_META: Record<EvidenceTag, { label: string; desc: string; color: string }> = {
  input: { label: "입력", desc: "사람이 스펙·결과에 넣은 값", color: "var(--success)" },
  estimated: { label: "추정", desc: "컨셉 문장에서 뽑은 값 — 사람이 확인하기 전", color: "#C9A227" },
  rule: { label: "규칙", desc: "입력값에 규칙(분류·실험계획·운송 판정)을 적용해 나온 값", color: "var(--info)" },
  assumed: { label: "가정", desc: "비어 있어 보수적인 기본값으로 채운 값 — 확인 필요", color: "var(--warning)" },
  missing: { label: "누락", desc: "데이터가 없어 비워 둔 칸 — 스펙·실험·사람 결정이 필요", color: "var(--danger)" },
};

// ── 가정 ─────────────────────────────────────────────────────
export interface Assumption {
  path: string;
  value: unknown;
  label: string;
  /** 왜 이 값으로 가정했나 (보수적인 이유) */
  why: string;
}

/** 등급·문서 세트·실험 범위를 바꾸는 칸만. 가정값은 요구사항이 더 많은(보수적인) 쪽. */
export const ASSUMPTIONS: Assumption[] = [
  { path: "user", value: "lay", label: "사용자 → 일반인(자가검사)", why: "일반인용이면 Rule 4(자가검사)·사용적합성·IFU 요구가 더 많다" },
  { path: "analyte.preset", value: "other", label: "측정 목적 → 임신·가임 외", why: "Rule 4(a) 예외(임신·가임 → B)를 적용하지 않아 자가검사면 Class C로 본다" },
  { path: "environment", value: "home", label: "사용 환경 → 가정", why: "가정 사용이면 사용 환경·보관·운송 조건 요구가 더 넓다" },
  { path: "result.kind", value: "quantitative", label: "결과 형태 → 정량", why: "정량이면 정확도·측정범위·직선성 등 성능평가 범위가 가장 넓다" },
  { path: "formFactor", value: "strip-reader", label: "제품 형태 → 스틱 + 리더기", why: "리더기가 있으면 전기안전·EMC·펌웨어(소프트웨어) 문서가 추가된다" },
  { path: "software.hasApp", value: true, label: "앱 → 있음", why: "앱이 있으면 소프트웨어 밸리데이션·사이버보안 문서가 추가된다" },
];

function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/** 비어 있는(null) 결정 칸을 가정값으로 채운 스펙 + 실제로 가정한 항목. */
export function applyAssumptions(s: ProductSpec): { spec: ProductSpec; assumed: Assumption[] } {
  let spec = s;
  const assumed: Assumption[] = [];
  for (const a of ASSUMPTIONS) {
    if (getAt(s, a.path) === null) {
      spec = setAt(spec, a.path, a.value);
      assumed.push(a);
    }
  }
  return { spec, assumed };
}

// ── 토큰 → 의존 스펙 칸 ──────────────────────────────────────
const CLASS_DEPS = ["user", "analyte.preset"];
const PLAN_DEPS = ["result.kind", "user"];
/** 가정한 칸에 기대는 토큰을 찾기 위한 의존 관계 (가정 대상 칸만 적는다). */
const TOKEN_DEPS: Record<string, string[]> = {
  user: ["user"], environment: ["environment"], resultKind: ["result.kind"],
  intendedPurpose: ["user", "environment"],
  cls: CLASS_DEPS, rule: CLASS_DEPS, rationale: CLASS_DEPS, ruleTable: CLASS_DEPS, route: CLASS_DEPS, nb: CLASS_DEPS, nbScope: CLASS_DEPS,
  swScope: ["software.hasApp", "formFactor", ...CLASS_DEPS],
  formFactor: ["formFactor"],
  gsprTable: ["user", "environment", "formFactor", "result.kind", "software.hasApp", "specimen"],
  principle: ["assay.method", "result.readout", "formFactor"], labelSymbols: ["user", "formFactor", "specimen"], labelWarnings: ["user", "formFactor", "software.hasApp", "specimen"],
  ifuSteps: ["formFactor", "software.hasApp", "specimen"], ifuReading: ["result.kind", "assay.method", "analyte.preset"], ifuLimitations: ["analyte.preset"],
  ifuWarnings: ["user", "formFactor", "software.hasApp", "specimen"], hazardTable: ["user", "formFactor", "result.kind", "software.hasApp", "analyte.preset", "specimen"],
  riskGsprTrace: ["user", "environment", "formFactor", "result.kind", "software.hasApp", "specimen"], usabilityScope: ["user", "environment"],
  krGrade: ["user", "analyte.preset"], krSelfTest: ["user", "analyte.preset"],
  usClass: ["user", "analyte.preset"], usClia: ["user", "environment"],
  studyList: PLAN_DEPS, analyticalPlan: PLAN_DEPS, analyticalAcceptance: PLAN_DEPS, clinicalPlan: PLAN_DEPS,
  clinicalAcceptance: PLAN_DEPS, sampleSize: PLAN_DEPS, studySchedule: PLAN_DEPS, stabilityPlan: ["environment"],
};

/** 입력 토큰 → 스펙 칸 (컨셉에서 추정한 칸을 찾기 위해) */
const INPUT_FIELD: Record<string, string[]> = {
  productType: ["productType"], formFactor: ["formFactor"], materials: ["materials"], analyte: ["analyte.name"], specimen: ["specimen"],
  resultKind: ["result.kind"], readout: ["result.readout"], user: ["user"], environment: ["environment"],
  clinicalDecision: ["intendedPurpose.clinicalDecision"], markets: ["markets"], principle: ["assay.method"],
};
const depsOf = (key: string) => [...(TOKEN_DEPS[key] ?? []), ...(INPUT_FIELD[key] ?? [])];

/** 사람이 직접 넣은 값을 그대로 옮기는 토큰. 나머지는 규칙으로 만든 값. */
const INPUT_KEYS = new Set([
  "productName", "model", "manufacturer", "manufacturerCountry", "basicUdiDi", "productType", "formFactor", "materials", "analyte", "cutoff", "specimen",
  "resultKind", "readout", "user", "environment", "clinicalDecision", "targetPopulation", "outOfScope", "storage", "shelfLife",
  "openedStability", "components", "markets", "targetSe", "targetSp", "referenceMethod", "lots",
  "analyticalResults", "stabilityResults", "clinicalResults", "stabilityConclusion", "transportResults",
]);

/** 문서 안의 빈칸 표시 (데이터 없이는 쓸 수 없는 칸). "스펙 미입력"은 토큰으로 따로 센다. */
const GAP_RE = /\[(?:실험 후 입력|사양:[^\]]*|_{2,}|[^\]]*원문 기준|[^\]]*확인 필요|[^\]]*답변 필요[^\]]*)\]/g;

const isEmpty = (v: string | null | undefined) => v === null || v === undefined || v === "";

export function tokenTag(key: string, ctx: Record<string, string | null>, assumedPaths: Set<string>, estimatedPaths: Set<string> = new Set()): EvidenceTag {
  const v = ctx[key];
  if (isEmpty(v)) return "missing";
  if ((TOKEN_DEPS[key] ?? []).some((p) => assumedPaths.has(p))) return "assumed";
  if (depsOf(key).some((p) => estimatedPaths.has(p))) return "estimated";
  if (INPUT_KEYS.has(key)) return /\[실험 후 입력\]/.test(v!) ? "missing" : "input";
  return "rule";
}

/** 가정에 기댄 토큰 값 뒤에 "(가정)"을 붙인 사본 — 문서·내보내기에 표시가 따라간다. */
export function markAssumed(ctx: Record<string, string | null>, assumed: Assumption[], estimated: string[] = []): Record<string, string | null> {
  if (!assumed.length && !estimated.length) return ctx;
  const paths = new Set(assumed.map((a) => a.path));
  const est = new Set(estimated);
  const out: Record<string, string | null> = { ...ctx };
  for (const [k, v] of Object.entries(ctx)) {
    if (isEmpty(v)) continue;
    if ((TOKEN_DEPS[k] ?? []).some((p) => paths.has(p)))
      out[k] = v!.includes("\n") ? `${v}\n(가정 포함 — 비어 있는 스펙 칸을 보수적으로 가정함, 확인 필요)` : `${v} (가정)`;
    else if (depsOf(k).some((p) => est.has(p)))
      out[k] = v!.includes("\n") ? `${v}\n(추정 포함 — 컨셉 문장에서 뽑은 값, 확인 필요)` : `${v} (추정)`;
  }
  return out;
}

// ── 문서 근거 원장 ───────────────────────────────────────────
const TOKEN_RE = /\{\{auto\.([a-zA-Z]+)\}\}/g;

export interface DocEvidence {
  counts: Record<EvidenceTag, number>;
  /** 토큰 키별 태그 (중복 제거) */
  tokens: { key: string; tag: EvidenceTag }[];
  /** 문서 본문에 남은 빈칸 표시 개수 ([실험 후 입력]·[사양: …]·[____] 등) — 누락에 포함 */
  gaps: number;
  /** 사람이 직접 쓴 섹션 수 — 입력에 포함 */
  drafted: number;
  /** 근거 확정 비율 (입력+규칙) / 전체, 0~1. 셀 것이 없으면 null */
  confirmed: number | null;
}

/**
 * raw: 토큰이 남아 있는 원본 템플릿, filled: 토큰을 채운 사본(같은 섹션 순서), drafted: 섹션별 사람 초안 여부.
 * 사람이 쓴 섹션은 "입력" 1건으로 세고 그 섹션의 토큰·빈칸은 세지 않는다.
 */
export function docEvidence(
  raw: { sections: { placeholder: string }[] },
  filled: { sections: { placeholder: string }[] },
  ctx: Record<string, string | null>,
  assumedPaths: Set<string>,
  drafted: (i: number) => boolean = () => false,
  estimatedPaths: Set<string> = new Set(),
): DocEvidence {
  const counts: Record<EvidenceTag, number> = { input: 0, estimated: 0, rule: 0, assumed: 0, missing: 0 };
  const seen = new Map<string, EvidenceTag>();
  let gaps = 0;
  let draftedN = 0;
  raw.sections.forEach((s, i) => {
    if (drafted(i)) {
      draftedN++;
      counts.input++;
      return;
    }
    for (const m of s.placeholder.matchAll(TOKEN_RE)) {
      const tag = tokenTag(m[1], ctx, assumedPaths, estimatedPaths);
      counts[tag]++;
      if (!seen.has(m[1])) seen.set(m[1], tag);
    }
    const text = filled.sections[i]?.placeholder ?? "";
    const g = text.match(GAP_RE)?.length ?? 0;
    gaps += g;
    counts.missing += g;
  });
  const total = counts.input + counts.estimated + counts.rule + counts.assumed + counts.missing;
  return {
    counts,
    tokens: [...seen].map(([key, tag]) => ({ key, tag })),
    gaps,
    drafted: draftedN,
    confirmed: total ? (counts.input + counts.rule) / total : null,
  };
}
