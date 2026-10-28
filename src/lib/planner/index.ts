// =====================================================================
// src/lib/planner/index.ts
// 제품 스펙 → 필요한 실험 목록과 각 실험의 설계·시료·판정 기준·사람이 할 일.
// 원칙: 실험 수치를 지어내지 않는다.
//  - 스펙에서 계산되는 값(표본수, cut-off 주변 농도, 유효기간)은 계산해서 넣는다.
//  - 규격 원문에 있는 값(반복 수, 간섭 농도)은 "[EP12 원문 기준]"처럼 남긴다.
//  - 합격 수치를 정할 근거가 없으면 "[사양: … — 사람이 정함]"으로 남긴다.
// 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import type { ApplStatus } from "../rules/applicability";
import { minNForLowerBound } from "../stats";
import { CROSS_REACTANTS, INTERFERENTS } from "./crossReactants";

export type StudyCategory = "analytical" | "stability" | "clinical" | "usability" | "safety";

export interface StudyPlan {
  id: string;
  title: string;
  category: StudyCategory;
  /** 1 준비 → 2 분석 성능 → 3 사용적합성 → 4 임상 성능. 안정성은 2단계에서 시작해 가장 오래 걸린다. */
  phase: 1 | 2 | 3 | 4;
  status: ApplStatus;
  why: string;
  standards: string[];
  design: string[];
  samples: string[];
  acceptance: string[];
  humanTasks: string[];
  /** 결과가 들어갈 문서 (docTree 잎 id) */
  docs: string[];
  /** 판정·설계에 쓴 스펙 경로 — 비어 있으면 해당 입력칸으로 안내 */
  dependsOn: string[];
  duration: string | null;
}

export const PHASES: Record<StudyPlan["phase"], string> = {
  1: "준비 — 자재·검체·계약",
  2: "분석 성능 · 안정성 시작",
  3: "사용적합성",
  4: "임상(일반인) 성능",
};

const SPEC = (what: string) => `[사양: ${what} — 사람이 정함]`;

export interface SampleSizeRow { allowedMisses: number; n: number | null }

/** 목표 비율을 단측 신뢰하한으로 입증하는 최소 표본수 (허용 오판정 0~3건). */
export function sampleSizeTable(targetPct: number | null, confPct: number | null): SampleSizeRow[] | null {
  if (targetPct === null || confPct === null) return null;
  return [0, 1, 2, 3].map((f) => ({ allowedMisses: f, n: minNForLowerBound(targetPct / 100, confPct / 100, f) }));
}

function sizeText(label: string, targetPct: number | null, confPct: number | null): string {
  const t = sampleSizeTable(targetPct, confPct);
  if (!t) return `${label}: ${targetPct === null ? SPEC(`목표 ${label}`) : ""}${confPct === null ? SPEC("신뢰수준") : ""} — 목표가 정해지면 표본수를 계산합니다.`;
  return `${label} ${targetPct}%를 ${confPct}% 단측 신뢰하한으로 입증 (Clopper-Pearson): ${t.map((r) => `오판정 ${r.allowedMisses}건 허용 시 n=${r.n ?? "?"}`).join(", ")}`;
}

export function planStudies(s: ProductSpec): StudyPlan[] {
  const out: StudyPlan[] = [];
  const kind = s.result.kind;
  const qual = kind === "qualitative" || kind === "semi-quantitative";
  const lay = s.user === "lay" || s.user === "both";
  const lots = s.targets.lots !== null ? `${s.targets.lots}개 로트` : "[평가 로트 수 — 스펙 미입력]";
  const cut = s.analyte.cutoffValue;
  const unit = s.analyte.cutoffUnit ? ` ${s.analyte.cutoffUnit}` : "";
  const cutTxt = cut !== null ? `${cut}${unit}` : "[Cut-off — 스펙 미입력]";
  const specimen = s.specimen;
  const preset = s.analyte.preset;
  const analyticDocs = ["analytical-performance", "performance-eval-plan", "performance-eval-report"];
  const fmt = (v: number) => (Math.round(v * 100) / 100).toString();

  // ── 1. 분석 성능 ───────────────────────────────────────────
  if (kind === null) {
    out.push({
      id: "cutoff-precision", title: "Cut-off 특성·정밀도", category: "analytical", phase: 2, status: "unknown",
      why: "결과 형태(정성/정량)에 따라 설계가 달라집니다.", standards: ["CLSI EP12 / EP05·EP17"], design: [], samples: [], acceptance: [],
      humanTasks: [], docs: analyticDocs, dependsOn: ["result.kind"], duration: null,
    });
  } else if (qual) {
    const levels = cut !== null
      ? `제안 농도: cut-off ${cutTxt}, ±20% (${fmt(cut * 0.8)} · ${fmt(cut * 1.2)}${unit}), ±50% (${fmt(cut * 0.5)} · ${fmt(cut * 1.5)}${unit}), 음성 시료 — 수준과 반복 수는 EP12 원문으로 확정`
      : "cut-off 주변 농도 — Cut-off를 입력하면 제안 농도를 계산합니다";
    out.push({
      id: "cutoff-precision", title: "Cut-off 특성(C5–C95)·정밀도", category: "analytical", phase: 2, status: "required",
      why: "정성 검사의 핵심 성능입니다. cut-off 근처에서 양성 판정 비율이 어떻게 바뀌는지(C50, C5–C95 구간)와 반복·일간·로트 간 정밀도를 보여야 합니다.",
      standards: ["CLSI EP12", "IVDR Annex I §9.1", "IVDR Annex XIII 1.2.2"],
      design: [levels, `${lots} × 여러 날 × 판독자 2명 이상 반복 — 반복 수는 [EP12 원문 기준]`, lay ? "판독은 육안 판독 조건(조명·판독 시간)을 IFU와 같게 고정" : "판독 조건을 IFU와 같게 고정"],
      samples: [`표준물질로 농도를 맞춘 ${specimen === "urine" ? "소변" : "검체"} 기질 시료`, "음성 기질 (분석물 없는 시료)"],
      acceptance: [`cut-off 이상 +20%에서 양성 비율 ≥ ${SPEC("기준 %")}`, `cut-off 이하 −20%에서 음성 비율 ≥ ${SPEC("기준 %")}`, "로트 간 판정 차이 없음"],
      humanTasks: [`${s.analyte.name ?? "분석물"} 국제표준물질(WHO IS 등) 확보와 추적성 기록`, "음성 기질 확보"],
      docs: analyticDocs, dependsOn: ["analyte.cutoffValue", "targets.lots"], duration: null,
    });
  } else {
    const quant = [
      ["lod", "검출 한계 (LoB·LoD·LoQ)", "CLSI EP17"],
      ["precision", "정밀도 (반복성·재현성)", "CLSI EP05 / EP15"],
      ["linearity", "직선성·측정 범위", "CLSI EP06"],
      ["method-comparison", "방법 비교 (진실성)", "CLSI EP09"],
    ] as const;
    for (const [id, title, std] of quant) {
      out.push({
        id, title, category: "analytical", phase: 2, status: "required",
        why: "정량 검사는 측정값 자체의 정확성을 입증해야 합니다.", standards: [std, "IVDR Annex XIII 1.2.2"],
        design: [`${lots}에서 수행 — 설계·반복 수는 [${std} 원문 기준]`], samples: ["측정 범위를 덮는 시료"], acceptance: [SPEC("허용 오차")],
        humanTasks: ["교정물질·관리물질 지정값 추적성 확보"], docs: analyticDocs, dependsOn: ["targets.lots"], duration: null,
      });
    }
  }

  const xr = preset ? CROSS_REACTANTS[preset] : [];
  out.push({
    id: "cross-reactivity", title: "교차반응 (분석 특이성)", category: "analytical", phase: 2, status: preset === null ? "unknown" : "required",
    why: "구조가 비슷한 물질에 양성이 나오면 위양성이 됩니다.",
    standards: ["CLSI EP07", "IVDR Annex I §9.1"],
    design: [
      xr.length ? `후보 물질: ${xr.join(", ")} — 생리적 최고 농도 수준에서 시험 (농도는 문헌·[EP07 원문 기준])` : "후보 물질 목록 — 분석물에 맞게 직접 정하세요",
      "음성 시료와 cut-off 부근 양성 시료 양쪽에 첨가해 위양성·위음성 모두 확인",
    ],
    samples: ["교차반응 후보 물질 정제품", "음성 기질과 cut-off 부근 양성 시료"],
    acceptance: ["후보 물질 첨가로 판정이 바뀌지 않음 (위양성·위음성 0)"],
    humanTasks: ["후보 물질 목록 검토 — 자동 목록은 출발점이며 RA·개발 검토가 필요합니다", "후보 물질 정제품 구매"],
    docs: analyticDocs, dependsOn: ["analyte.preset"], duration: null,
  });

  const intf = specimen ? INTERFERENTS[specimen] ?? [] : [];
  out.push({
    id: "interference", title: "간섭 물질", category: "analytical", phase: 2, status: specimen === null ? "unknown" : "required",
    why: "검체 속 다른 성분·복용약이 결과를 바꾸면 안 됩니다.",
    standards: ["CLSI EP07", "CLSI EP37", "IVDR Annex I §9.1"],
    design: [
      intf.length ? `후보: ${intf.join(", ")}` : "후보 물질 목록 — 검체에 맞게 직접 정하세요",
      "시험 농도는 [EP37 원문 기준] (권장 시험 농도 표)",
      "음성 시료와 cut-off 부근 양성 시료 양쪽에 첨가",
    ],
    samples: ["간섭 후보 물질", "음성·cut-off 부근 양성 시료"],
    acceptance: ["간섭 물질 첨가로 판정이 바뀌지 않음"],
    humanTasks: ["간섭 후보 목록 검토 (검토 전 목록)", "간섭 물질 구매"],
    docs: analyticDocs, dependsOn: ["specimen"], duration: null,
  });

  if (qual) {
    out.push({
      id: "hook", title: "고농도 후크 효과", category: "analytical", phase: 2, status: preset === "hCG" ? "required" : "recommended",
      why: preset === "hCG" ? "임신 중 hCG는 매우 높아질 수 있어, 고농도에서 위음성(후크 효과)이 없음을 보여야 합니다." : "샌드위치 면역분석은 고농도에서 위음성이 날 수 있어 확인해 두는 것이 좋습니다.",
      standards: ["IVDR Annex I §9.1"],
      design: ["임상적으로 가능한 최고 농도까지 단계 희석 시료로 시험 — 최고 농도는 문헌으로 근거"],
      samples: ["고농도 시료 (표준물질 첨가)"], acceptance: ["최고 농도까지 양성 유지"],
      humanTasks: ["임상 최고 농도 문헌 근거 정리"], docs: analyticDocs, dependsOn: ["analyte.preset"], duration: null,
    });
  }

  out.push({
    id: "specimen-stability", title: "검체 안정성 (채취 후 보관)", category: "analytical", phase: 2, status: "recommended",
    why: specimen === "urine" ? "IFU에 '채취 후 몇 시간 안에 검사' 또는 '냉장 보관 가능'을 적으려면 근거가 필요합니다." : "IFU에 적을 검체 보관 시간의 근거가 필요합니다.",
    standards: ["IVDR Annex I §20.4 (IFU 검체 정보)"],
    design: ["채취 직후와 IFU에 적을 보관 시간·온도 후 결과 비교 — 시간·온도는 IFU 주장에 맞춰 정함"],
    samples: ["음성·cut-off 부근 양성 검체"], acceptance: ["보관 전후 판정 일치"],
    humanTasks: ["IFU에 적을 검체 보관 조건 결정"], docs: analyticDocs.concat("ifu"), dependsOn: ["specimen"], duration: null,
  });

  // ── 2. 안정성 ─────────────────────────────────────────────
  const st = s.storage;
  const range = st.tempMinC !== null && st.tempMaxC !== null ? `${st.tempMinC}℃와 ${st.tempMaxC}℃` : "[보관 온도 — 스펙 미입력]";
  const stabDocs = ["stability-study", "labelling-spec", "ifu"];
  out.push({
    id: "stability-realtime", title: "실시간 안정성 (유효기간)", category: "stability", phase: 2,
    status: "required",
    why: "표시 유효기간은 실시간 데이터로 입증해야 합니다. 가장 오래 걸리므로 설계 확정 로트로 가장 먼저 시작하세요.",
    standards: ["EN ISO 23640", "IVDR Annex II 6.2"],
    design: [
      `보관 범위 양 끝 온도(${range})에서 ${lots} 보관`,
      `시험 시점: 0개월, 중간 시점 ${SPEC("시점")}, 표시 유효기간${st.shelfLifeMonths !== null ? ` ${st.shelfLifeMonths}개월` : ""} 이후 ${SPEC("여유 기간")}`,
      "각 시점에 cut-off 특성 시료(음성·cut-off 부근·양성)로 판정 확인",
    ],
    samples: [`${lots} × 시점 수 × 온도 2조건 분량의 키트`],
    acceptance: ["모든 시점에서 cut-off 특성 시험 판정 기준 충족"],
    humanTasks: ["설계 확정 로트 생산", "안정성 챔버(온도 기록) 확보"],
    docs: stabDocs, dependsOn: ["storage.tempMinC", "storage.tempMaxC", "storage.shelfLifeMonths", "targets.lots"],
    duration: st.shelfLifeMonths !== null ? `${st.shelfLifeMonths}개월 이상 (표시 유효기간 + 여유)` : null,
  });
  out.push({
    id: "stability-accelerated", title: "가속 안정성 (잠정 유효기간)", category: "stability", phase: 2, status: "optional",
    why: "실시간 데이터가 쌓이기 전 출시를 위한 잠정 근거로 씁니다. 실시간 데이터로 확정해야 하며 대체할 수 없습니다.",
    standards: ["EN ISO 23640"],
    design: [`고온 조건 ${SPEC("온도·기간")}에서 ${lots} 보관 후 판정 확인 — 실시간 결과와 비교해 모델을 확인`],
    samples: ["로트별 키트"], acceptance: ["모든 시점에서 판정 기준 충족"],
    humanTasks: ["가속 조건 근거(아레니우스 가정 등) 검토"], docs: stabDocs, dependsOn: ["targets.lots"], duration: null,
  });
  out.push({
    id: "stability-in-use", title: "개봉 후 안정성", category: "stability", phase: 2,
    status: st.openedStabilityMin !== null ? "required" : "recommended",
    why: st.openedStabilityMin !== null ? `IFU에 '파우치 개봉 후 ${st.openedStabilityMin}분 이내 사용'을 적으므로 그 시간의 근거가 필요합니다.` : "IFU에 개봉 후 사용 시한을 적으려면 근거가 필요합니다.",
    standards: ["EN ISO 23640"],
    design: [st.openedStabilityMin !== null ? `파우치 개봉 후 ${st.openedStabilityMin}분 (+ 여유) 실온 노출 뒤 판정 확인 — 습도 조건 포함` : "개봉 후 사용 시한을 정한 뒤 그 시간 노출 후 판정 확인"],
    samples: ["로트별 키트"], acceptance: ["노출 후 판정 기준 충족"],
    humanTasks: [], docs: stabDocs, dependsOn: ["storage.openedStabilityMin"], duration: null,
  });
  out.push({
    id: "stability-transport", title: "운송 안정성", category: "stability", phase: 2,
    status: s.transport.modes?.length ? "required" : "recommended",
    why: "운송 중 충격·진동·온도 노출 뒤 성능이 유지됨을 보입니다. 설계와 시험 순서는 운송·포장 단계에서 정했습니다.",
    standards: ["EN ISO 23640", "ISTA 3A"],
    design: ["운송·포장 단계의 시험 순서를 따름 (/auto/transport)"], samples: ["출하 포장 상태 박스"], acceptance: ["운송·포장 단계의 판정 기준"],
    humanTasks: [], docs: ["transport-validation", "stability-study"], dependsOn: ["transport.modes"], duration: null,
  });

  // ── 3. 사용적합성 ─────────────────────────────────────────
  if (s.user === null) {
    out.push({
      id: "usability", title: "사용적합성 형성·총괄 평가", category: "usability", phase: 3, status: "unknown",
      why: "사용자가 정해지면 판정됩니다.", standards: ["IEC 62366-1"], design: [], samples: [], acceptance: [], humanTasks: [],
      docs: ["usability-file"], dependsOn: ["user"], duration: null,
    });
  } else {
    out.push({
      id: "usability-formative", title: "사용적합성 형성 평가", category: "usability", phase: 3, status: lay ? "required" : "recommended",
      why: "IFU·라벨·판독 창을 사용자가 실제로 이해하는지 초기에 확인해 설계를 고칩니다.",
      standards: ["IEC 62366-1"],
      design: ["대표 사용자 관찰·인지 워크스루로 위험 관련 사용 시나리오(검체 채취·판독 시간·결과 해석) 확인", "발견 사항 → IFU·라벨 수정"],
      samples: [`대표 사용자 ${SPEC("인원")}`], acceptance: ["발견 사항의 설계 반영 기록"],
      humanTasks: ["IFU·라벨 시제품 준비", "참가자 모집"], docs: ["usability-file", "ifu"], dependsOn: ["user"], duration: null,
    });
    out.push({
      id: "usability-summative", title: "사용적합성 총괄 평가 (IFU 이해도 포함)", category: "usability", phase: 3, status: lay ? "required" : "recommended",
      why: lay ? "일반인 자가검사는 사용 오류가 곧 임상 위험이라, 최종 설계로 위험 관련 사용 오류가 없음을 보여야 합니다 (IVDR Annex I §19)." : "최종 설계로 위험 관련 사용 오류가 없음을 확인합니다.",
      standards: ["IEC 62366-1", "IVDR Annex I §19"],
      design: ["최종 설계·최종 IFU로 도움 없이 수행", "결과 판독 이해도 문항(양성·음성·무효 판독) 포함"],
      samples: [`사용자군별 ${SPEC("인원")} — FDA 인적요인 가이드는 사용자군당 15명 이상을 관행으로 제시`],
      acceptance: ["위험 관련 사용 오류 없음, 남은 오류는 위험관리로 수용 근거 기록"],
      humanTasks: ["IRB 필요 여부 확인", "참가자 모집 (기존 사용 경험 없는 일반인 포함)"], docs: ["usability-file", "ifu"], dependsOn: ["user"], duration: null,
    });
  }

  // ── 4. 임상 성능 ─────────────────────────────────────────
  const conf = s.targets.confidence;
  out.push({
    id: "clinical-performance", title: lay ? "임상 성능 — 일반인 사용 연구" : "임상 성능 연구", category: "clinical", phase: 4, status: "required",
    why: lay ? "자가검사는 의도된 사용자(일반인)가 직접 검사·판독한 결과로 임상 성능을 보여야 합니다." : "의도된 사용 조건에서 기준 방법 대비 일치도를 보여야 합니다.",
    standards: ["IVDR Annex XIII 1.2.3", "MDCG 2025-5", "ISO 20916"],
    design: [
      `대상: ${s.intendedPurpose.targetPopulation ?? "[대상 집단 — 스펙 미입력]"}`,
      `기준 방법: ${s.referenceMethod.name ?? "[기준 방법 — 스펙 미입력]"}`,
      lay ? "참가자가 IFU만 보고 검사·판독 → 같은 검체를 기준 방법으로 측정, 전문가 판독과도 비교" : "같은 검체를 시험 제품과 기준 방법으로 측정",
      "판독자는 기준 방법 결과를 모르게 (맹검)",
    ],
    samples: [sizeText("민감도(양성 일치율)", s.targets.sensitivity, conf), sizeText("특이도(음성 일치율)", s.targets.specificity, conf)],
    acceptance: [
      s.targets.sensitivity !== null && conf !== null ? `민감도 ${conf}% 단측 신뢰하한 ≥ ${s.targets.sensitivity}%` : `민감도 기준 ${SPEC("목표·신뢰수준")}`,
      s.targets.specificity !== null && conf !== null ? `특이도 ${conf}% 단측 신뢰하한 ≥ ${s.targets.specificity}%` : `특이도 기준 ${SPEC("목표 특이도")}`,
      "무효 결과 비율 보고",
    ],
    humanTasks: ["윤리위원회(IRB) 승인", "참여 기관·기준 방법 시험기관 계약", "검체·참가자 모집", "통계 분석 계획 확정"],
    docs: ["clinical-performance", "performance-eval-plan", "performance-eval-report"],
    dependsOn: ["targets.sensitivity", "targets.specificity", "targets.confidence", "referenceMethod.name", "intendedPurpose.targetPopulation"],
    duration: null,
  });

  // ── 안전 ─────────────────────────────────────────────────
  if (specimen === "capillary-blood" || specimen === "swab") {
    out.push({
      id: "biocompatibility", title: "생체적합성", category: "safety", phase: 2, status: "required",
      why: specimen === "capillary-blood" ? "채혈기(란셋)가 피부에 닿습니다." : "면봉이 점막에 닿습니다.",
      standards: ["ISO 10993-1"], design: ["접촉 부위·시간으로 평가 항목 결정 (ISO 10993-1 표)"], samples: ["최종 부품"],
      acceptance: ["ISO 10993-1 평가 항목 충족"], humanTasks: ["공급사 시험 성적서 확보 또는 시험기관 의뢰"],
      docs: ["biocompatibility"], dependsOn: ["specimen"], duration: null,
    });
  }

  return out;
}

/** 실험별 사람 할 일을 모아 중복 제거. */
export function planHumanTasks(plans: StudyPlan[]): { task: string; studies: string[] }[] {
  const m = new Map<string, string[]>();
  for (const p of plans) if (p.status !== "excluded") for (const t of p.humanTasks) m.set(t, [...(m.get(t) ?? []), p.title]);
  return [...m].map(([task, studies]) => ({ task, studies }));
}

// ── 문서 토큰 ──────────────────────────────────────────────
const STATUS_KO: Record<ApplStatus, string> = { required: "필수", recommended: "권장", optional: "선택", excluded: "불필요", unknown: "확인 필요" };

function studyText(p: StudyPlan): string {
  const lines = [`■ ${p.title} [${STATUS_KO[p.status]}] — ${p.standards.join(", ")}`, `  목적: ${p.why}`];
  if (p.design.length) lines.push(`  설계: ${p.design.join(" / ")}`);
  if (p.samples.length) lines.push(`  시료: ${p.samples.join(" / ")}`);
  if (p.acceptance.length) lines.push(`  판정 기준: ${p.acceptance.join(" / ")}`);
  if (p.duration) lines.push(`  기간: ${p.duration}`);
  return lines.join("\n");
}

const RESULT = "[실험 후 입력]";

export function plannerTokens(s: ProductSpec): Record<string, string | null> {
  const plans = planStudies(s).filter((p) => p.status !== "excluded");
  const by = (c: StudyCategory[]) => plans.filter((p) => c.includes(p.category));
  const block = (list: StudyPlan[]) => (list.length ? list.map(studyText).join("\n\n") : null);
  const resultLines = (list: StudyPlan[]) => list.map((p) => `${p.title}: ${RESULT}`).join("\n");
  return {
    studyList: plans.length ? plans.map((p) => `- [${STATUS_KO[p.status]}] ${p.title} (${p.standards[0]})`).join("\n") : null,
    analyticalPlan: block(by(["analytical"])),
    analyticalAcceptance: by(["analytical"]).flatMap((p) => p.acceptance.map((a) => `- ${p.title}: ${a}`)).join("\n") || null,
    analyticalResults: resultLines(by(["analytical"])),
    stabilityPlan: block(by(["stability"])),
    stabilityResults: resultLines(by(["stability"])),
    clinicalPlan: block(by(["clinical"])),
    clinicalAcceptance: by(["clinical"]).flatMap((p) => p.acceptance.map((a) => `- ${a}`)).join("\n") || null,
    sampleSize: by(["clinical"]).flatMap((p) => p.samples).join("\n") || null,
    studySchedule: ([1, 2, 3, 4] as const)
      .map((ph) => {
        const list = plans.filter((p) => p.phase === ph);
        const prep = ph === 1 ? planHumanTasks(plans).map((t) => t.task) : [];
        const items = ph === 1 ? prep : list.map((p) => `${p.title}${p.duration ? ` (${p.duration})` : ""}`);
        return items.length ? `${ph}단계 ${PHASES[ph]}: ${items.join(", ")} — 시작·완료일 [____]` : null;
      })
      .filter(Boolean)
      .join("\n"),
  };
}
