// =====================================================================
// src/data/spec/validate.ts
// 스펙 생성·검증·진행률·의도된 목적 문장 조립. 순수 함수만 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "./types";
import { allSpecFields, everySpecField, type FieldDef } from "./fields";

export function emptySpec(): ProductSpec {
  return {
    schemaVersion: 1,
    identity: { productName: null, model: null, manufacturerName: null, manufacturerCountry: null, manufacturerIsEU: null, basicUdiDi: null },
    productType: null,
    formFactor: null,
    materials: null,
    analyte: { preset: null, name: null, cutoffValue: null, cutoffUnit: null },
    specimen: null,
    result: { kind: null, readout: null },
    assay: { method: null },
    user: null,
    environment: null,
    intendedPurpose: { clinicalDecision: null, targetPopulation: null, outOfScope: null },
    rule1to3Flags: {
      transmissibleAgent: null, bloodGrouping: null, tissueTyping: null, geneticTesting: null,
      cancerScreening: null, companionDiagnostic: null, congenitalScreening: null, lifeThreatening: null,
    },
    sterile: null,
    software: { hasApp: null, isMdsw: null },
    markets: null,
    qmsCerts: null,
    krGrade: null,
    usProductCode: null,
    storage: { tempMinC: null, tempMaxC: null, shelfLifeMonths: null, openedStabilityMin: null },
    kitComponents: [],
    referenceMethod: { name: null, ceMarked: null, lab: null },
    targets: { sensitivity: null, specificity: null, confidence: null, lots: null },
    transport: {
      destinations: null, modes: null, lengthCm: null, widthCm: null, heightCm: null, grossWeightKg: null,
      kitsPerShipper: null, liquidReagent: null, dangerousGoods: null, primaryPlastic: null, outerMaterial: null,
    },
    meta: { updatedAt: null },
  };
}

/** 예시 — LH 배란 자가검사 스트립. 목표 특이도만 일부러 비워둔다(미입력 처리 예시). */
export function exampleSpec(): ProductSpec {
  const s = emptySpec();
  s.identity = {
    productName: "Surearly LH 배란 테스트 (예시)", model: "SE-LH-01", manufacturerName: "(예시) 제조사",
    manufacturerCountry: "대한민국", manufacturerIsEU: false, basicUdiDi: null,
  };
  s.productType = "reagent-kit";
  s.formFactor = "strip-only";
  s.materials = ["plastic", "paper-membrane"];
  s.analyte = { preset: "LH", name: "황체형성호르몬(LH)", cutoffValue: 25, cutoffUnit: "mIU/mL" };
  s.specimen = "urine";
  s.result = { kind: "qualitative", readout: "visual" };
  s.assay = { method: "lateral-flow" };
  s.user = "lay";
  s.environment = "home";
  s.intendedPurpose = {
    clinicalDecision: "배란 시기를 예측해 임신 시도 시기를 정하는 데 도움을 준다",
    targetPopulation: "임신을 계획하는 가임기 여성",
    outOfScope: "피임 목적, 불임 진단",
  };
  s.rule1to3Flags = {
    transmissibleAgent: false, bloodGrouping: false, tissueTyping: false, geneticTesting: false,
    cancerScreening: false, companionDiagnostic: false, congenitalScreening: false, lifeThreatening: false,
  };
  s.sterile = false;
  s.software = { hasApp: false, isMdsw: false };
  s.markets = ["EU"];
  s.qmsCerts = ["ISO13485"];
  s.storage = { tempMinC: 2, tempMaxC: 30, shelfLifeMonths: 24, openedStabilityMin: 60 };
  s.kitComponents = [
    { name: "테스트 스트립 (개별 파우치, 건조제 포함)", qtyPerKit: 5, isReagent: true },
    { name: "사용설명서", qtyPerKit: 1, isReagent: false },
  ];
  s.referenceMethod = { name: "정량 LH 면역분석 (검사실)", ceMarked: true, lab: "(예시) 협력 검사기관" };
  s.targets = { sensitivity: 95, specificity: null, confidence: 95, lots: 3 };
  s.transport = {
    destinations: ["EU"], modes: ["parcel", "air"], lengthCm: 40, widthCm: 30, heightCm: 25, grossWeightKg: 4.5,
    kitsPerShipper: 50, liquidReagent: false, dangerousGoods: false, primaryPlastic: true, outerMaterial: "corrugated",
  };
  return s;
}

// ── 점 경로 접근 ──────────────────────────────────────────
export function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setAt<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const root = structuredClone(obj) as Record<string, unknown>;
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const next = cur[keys[i]];
    cur[keys[i]] = next && typeof next === "object" ? { ...(next as object) } : {};
    cur = cur[keys[i]] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return root as T;
}

// ── 진행률 ────────────────────────────────────────────────
export function isFilled(f: FieldDef, spec: ProductSpec): boolean {
  const v = getAt(spec, f.path);
  if (f.kind === "components") return Array.isArray(v) && v.some((c) => (c as { name?: string }).name?.trim());
  if (f.kind === "multi") return Array.isArray(v) && v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  return v !== null && v !== undefined;
}

export function unresolvedFields(spec: ProductSpec): FieldDef[] {
  return allSpecFields.filter((f) => !f.optional && !isFilled(f, spec));
}

export function completion(spec: ProductSpec): { filled: number; total: number } {
  const req = allSpecFields.filter((f) => !f.optional);
  return { filled: req.filter((f) => isFilled(f, spec)).length, total: req.length };
}

// ── 가져오기 검증 ─────────────────────────────────────────
export interface ValidateResult {
  ok: boolean;
  spec: ProductSpec;
  errors: string[];
}

/** 외부(JSON 가져오기) 입력을 빈 스펙 위에 얹어 모양을 맞추고, 타입이 어긋난 값은 버린다. */
export function validateSpec(x: unknown): ValidateResult {
  const errors: string[] = [];
  if (!x || typeof x !== "object") return { ok: false, spec: emptySpec(), errors: ["스펙 형식이 아닙니다."] };
  const src = x as Record<string, unknown>;
  if (src.schemaVersion !== 1) return { ok: false, spec: emptySpec(), errors: [`지원하지 않는 스펙 버전입니다 (${String(src.schemaVersion)}).`] };
  let spec = emptySpec();
  for (const f of everySpecField) {
    const v = getAt(src, f.path);
    if (v === undefined || v === null) continue;
    const okType =
      f.kind === "number" ? typeof v === "number" && Number.isFinite(v)
      : f.kind === "tri" ? typeof v === "boolean"
      : f.kind === "multi" ? Array.isArray(v) && v.every((m) => typeof m === "string" && (!f.options || f.options.some((o) => o.value === m)))
      : f.kind === "components" ? Array.isArray(v)
      : f.kind === "select" ? typeof v === "string" && !!f.options?.some((o) => o.value === v)
      : typeof v === "string";
    if (!okType) { errors.push(`${f.label}: 값 형식이 맞지 않아 비웠습니다.`); continue; }
    if (f.kind === "components") {
      const list = (v as unknown[]).filter((c): c is Record<string, unknown> => !!c && typeof c === "object").map((c) => ({
        name: typeof c.name === "string" ? c.name : "",
        qtyPerKit: typeof c.qtyPerKit === "number" ? c.qtyPerKit : null,
        isReagent: c.isReagent === true,
      }));
      spec = setAt(spec, f.path, list);
    } else spec = setAt(spec, f.path, v);
  }
  const meta = src.meta as Record<string, unknown> | undefined;
  spec.meta.updatedAt = typeof meta?.updatedAt === "string" ? meta.updatedAt : null;
  return { ok: true, spec, errors };
}

// ── 의도된 목적 문장 조립 (규칙 기반, AI 아님) ───────────────
const SPECIMEN_KO: Record<string, string> = { urine: "소변", "capillary-blood": "모세혈", "venous-blood": "정맥혈", saliva: "타액", swab: "면봉 채취 검체", other: "검체" };
const KIND_KO: Record<string, string> = { qualitative: "정성적으로 검출하는", "semi-quantitative": "반정량으로 측정하는", quantitative: "정량으로 측정하는" };
const USER_KO: Record<string, string> = { lay: "일반인 자가검사용", professional: "전문가용", both: "일반인·전문가용" };
const ENV_KO: Record<string, string> = { home: "가정", "near-patient": "근접검사 환경", lab: "검사실" };

/** 받침 유무로 조사 선택. 끝의 괄호 보충("(LH)", "(예시)")은 건너뛴다. 한글이 아니면 "은(는)" 형태로. */
function josa(word: string, withBatchim: string, without: string): string {
  let w = word.trim();
  while (/\s*[(（[][^()（）[\]]*[)）\]]$/.test(w)) w = w.replace(/\s*[(（[][^()（）[\]]*[)）\]]$/, "").trim();
  const ch = (w || word.trim()).slice(-1);
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return `${withBatchim}(${without})`;
  return code % 28 ? withBatchim : without;
}

export function composeIntendedPurpose(s: ProductSpec): string {
  const name = s.identity.productName?.trim() || "[제품명 미입력]";
  const analyte = s.analyte.name?.trim() || "[분석물 미입력]";
  const specimen = s.specimen ? SPECIMEN_KO[s.specimen] : "[검체 미입력]";
  const how = s.result.kind ? KIND_KO[s.result.kind] : "[결과 형태 미입력]";
  const user = s.user ? USER_KO[s.user] : "[사용자 미입력]";
  const env = s.environment ? ENV_KO[s.environment] : "[사용 환경 미입력]";
  const pop = s.intendedPurpose.targetPopulation?.trim() || "[대상 집단 미입력]";
  const decision = s.intendedPurpose.clinicalDecision?.trim() || "[결과로 내리는 판단 미입력]";
  let text =
    `${name}${josa(name, "은", "는")} ${specimen}에서 ${analyte}${josa(analyte, "을", "를")} ${how} ${user} 체외진단 시약이다. ` +
    `${pop}${josa(pop, "이", "가")} ${env}에서 사용하며, ${decision.replace(/[.。]\s*$/, "")}.`;
  const out = s.intendedPurpose.outOfScope?.trim();
  if (out) text += ` ${out.replace(/[.。]\s*$/, "")}에는 사용하지 않는다.`;
  return text;
}

// ── 변경 감지용 해시 (안정 직렬화 + FNV-1a) ──────────────────
function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).filter((k) => k !== "meta").sort().map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(",")}}`;
}

/** 분류 확정의 변경 감지용. 운송 정보는 클래스에 영향이 없어 뺀다. */
export function specHash(s: ProductSpec): string {
  const { transport: _transport, ...rest } = s;
  const str = stableStringify(rest);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
