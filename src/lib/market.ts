// =====================================================================
// src/lib/market.ts
// 시장성 점검 — "어때? 잘 팔릴 거 같아?"에 대한 답. 판매 예측이 아니다.
// 앱이 아는 것(등급·인증 일정·필수 실험·시장)으로 규제·출시 준비도를 판정하고,
// 시장 규모·경쟁·가격은 사람이 출처와 함께 넣은 값과 그 값으로 한 계산만 쓴다. 순수 함수.
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import type { ClassResult } from "./rules/classify";
import type { KrResult } from "./kr";
import type { UsResult } from "./us";
import type { Plan } from "./roadmap";
import type { StudyPlan } from "./planner";
import type { Mood } from "./difficulty";

export type DimId = "barrier" | "speed" | "evidence" | "reach" | "competition" | "price";
export interface MarketDim {
  id: DimId;
  label: string;
  /** 1(불리) ~ 5(유리). null = 입력 필요 */
  score: number | null;
  summary: string;
  reasons: string[];
  /** 입력이 필요하면 그 칸 경로 */
  needs: string[];
}
export interface MarketCheck {
  dims: MarketDim[];
  som: { value: number; units: number | null; currency: string } | null;
  mood: Mood;
  headline: string;
  evidence: { filled: number; total: number };
  gaps: { path: string; label: string }[];
}

const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });

const EU_SCORE: Record<string, number> = { A: 5, B: 4, C: 2, D: 1 };
const KR_SCORE: Record<string, number> = { "1": 5, "2": 4, "3": 2, "4": 1 };
const US_SCORE: Record<string, number> = { exempt: 5, "510k": 3, denovo: 2, pma: 1, bla: 1 };
const US_LABEL: Record<string, string> = { exempt: "510(k) 면제", "510k": "510(k)", denovo: "De Novo", pma: "PMA", bla: "BLA", check: "경로 확인 필요" };

function barrier(s: ProductSpec, cls: ClassResult, kr: KrResult | null, us: UsResult | null): MarketDim {
  const m = s.markets ?? [];
  const parts: { score: number; text: string }[] = [];
  const reasons: string[] = [];
  if (cls.value && (m.includes("EU") || m.length === 0)) {
    parts.push({ score: EU_SCORE[cls.value], text: `EU Class ${cls.value}` });
    reasons.push(`EU IVDR Class ${cls.value}${cls.value === "A" ? " — 자기선언으로 가능해요" : " — 인증기관(NB) 심사가 필요해요"}${m.length === 0 ? " (판매할 곳을 안 골라 참고로만 보여 줘요)" : ""}`);
  }
  if (m.includes("KR") && kr) {
    if (kr.grade) { parts.push({ score: KR_SCORE[kr.grade], text: `KR ${kr.grade}등급` }); reasons.push(`한국 ${kr.grade}등급 (${kr.route}) — 아직 잠정이에요`); }
    else reasons.push("한국 등급: 원문 확인 필요(추천할 등급이 없어요)");
  }
  if (m.includes("US") && us) {
    const sc = US_SCORE[us.pathway];
    if (sc) parts.push({ score: sc, text: `US ${US_LABEL[us.pathway]}` });
    reasons.push(`미국 ${us.deviceClass ? `Class ${us.deviceClass} · ` : ""}${US_LABEL[us.pathway] ?? us.pathway}`);
  }
  if (!parts.length) return { id: "barrier", label: "규제 장벽", score: null, summary: "등급이 아직 안 정해졌어요", reasons: reasons.length ? reasons : ["제품 유형·사용자를 적으면 판정해요."], needs: [] };
  const worst = parts.reduce((a, b) => (b.score < a.score ? b : a));
  return { id: "barrier", label: "규제 장벽", score: worst.score, summary: `${worst.score >= 4 ? "낮음" : worst.score === 3 ? "보통" : "높음"} — ${parts.map((p) => p.text).join(" · ")}`, reasons, needs: [] };
}

function speed(plan: Plan, launchDate: string | null): MarketDim {
  const mn = plan.launchMin, mx = plan.launchMax;
  let score = mn <= 12 ? 5 : mn <= 18 ? 4 : mn <= 24 ? 3 : mn <= 36 ? 2 : 1;
  const reasons = [`개발 시작부터 출시까지 ${fmt(mn)}~${fmt(mx)}개월로 추정해요 (로드맵 기준 추정 범위)`];
  if (plan.verdict === "impossible") { score = Math.min(score, 2); reasons.push(`목표 판매일(${launchDate})보다 최소 ${fmt(plan.shortage)}개월이 모자라요`); }
  else if (plan.verdict === "tight") reasons.push(`목표 판매일(${launchDate})은 빠르게 진행될 때만 맞출 수 있어요`);
  else if (plan.verdict === "ok") reasons.push(`목표 판매일(${launchDate})에 맞출 수 있어요`);
  return { id: "speed", label: "출시 속도", score, summary: `${fmt(mn)}~${fmt(mx)}개월`, reasons, needs: plan.verdict === "unknown" ? ["plan.launchDate"] : [] };
}

function evidence(plans: StudyPlan[]): MarketDim {
  const req = plans.filter((p) => p.status === "required");
  const clinical = req.some((p) => p.id === "clinical-performance");
  const score = clamp(5 - (req.length >= 8 ? 2 : req.length >= 5 ? 1 : 0) - (clinical ? 1 : 0));
  return {
    id: "evidence", label: "증거 부담", score, summary: `필수 실험 ${req.length}개${clinical ? " · 임상 성능 연구 포함" : ""}`,
    reasons: [`필수 실험: ${req.map((p) => p.title).join(", ") || "없음"}`, ...(clinical ? ["사람을 대상으로 하는 임상 성능 연구가 필요해 비용과 기간이 많이 들어요."] : [])],
    needs: [],
  };
}

const MARKET_KO: Record<string, string> = { EU: "EU", KR: "한국", US: "미국", MDSAP: "MDSAP 국가", JP: "일본", CN: "중국", OTHER: "기타" };
function reach(s: ProductSpec): MarketDim {
  const m = s.markets ?? [];
  if (!m.length) return { id: "reach", label: "판매 가능 지역", score: null, summary: "판매할 곳을 아직 안 골랐어요", reasons: ["기획 화면에서 판매할 곳(인증)을 골라 주세요."], needs: ["markets"] };
  const ch = s.market.channels ?? [];
  return {
    id: "reach", label: "판매 가능 지역", score: clamp(2 + m.length), summary: `${m.map((x) => MARKET_KO[x] ?? x).join(" · ")}${ch.length ? ` · 채널 ${ch.length}개` : ""}`,
    reasons: [`인증을 받는 시장 ${m.length}곳 — 시장이 많을수록 닿는 고객은 넓지만 인증 비용도 늘어나요.`, ...(ch.length ? [] : ["판매 채널을 적으면 함께 보여 줘요."])],
    needs: ch.length ? [] : ["market.channels"],
  };
}

function competition(s: ProductSpec): MarketDim {
  const c = s.market.competitors.filter((x) => x.name.trim());
  const d = !!s.market.differentiator?.trim();
  if (!c.length && !d) return { id: "competition", label: "경쟁·차별화", score: null, summary: "아직 안 적음", reasons: ["경쟁 제품과 우리 차별점을 적으면 판정해요."], needs: ["market.competitors", "market.differentiator"] };
  let score = 3 + (d ? 1 : -1) - (c.length >= 5 ? 1 : 0);
  const reasons = [
    c.length ? `경쟁 제품 ${c.length}개${c.length >= 5 ? " — 이미 붐비는 시장이에요" : ""}` : "경쟁 제품을 아직 안 적었어요 — 정말 없는지 조사해 보세요",
    d ? `차별점: ${s.market.differentiator!.trim()}` : "차별점이 비어 있어요",
  ];
  if (!c.length) score = Math.min(score, 3);
  return { id: "competition", label: "경쟁·차별화", score: clamp(score), summary: `경쟁 ${c.length}개 · 차별점 ${d ? "있음" : "없음"}`, reasons, needs: [...(c.length ? [] : ["market.competitors"]), ...(d ? [] : ["market.differentiator"])] };
}

function price(s: ProductSpec): MarketDim {
  const p = s.market.price;
  const cp = s.market.competitors.map((x) => x.price).filter((x): x is number => typeof x === "number" && x > 0);
  if (p === null || !cp.length) return { id: "price", label: "가격 여지", score: null, summary: "아직 안 적음", reasons: ["목표 가격과 경쟁 제품 가격을 적으면 비교해요(같은 통화로)."], needs: [...(p === null ? ["market.price"] : []), ...(cp.length ? [] : ["market.competitors"])] };
  const med = median(cp);
  const r = p / med;
  const score = r <= 0.8 ? 5 : r <= 1.0 ? 4 : r <= 1.2 ? 3 : r <= 1.5 ? 2 : 1;
  const cur = s.market.currency ?? "";
  return {
    id: "price", label: "가격 여지", score, summary: `경쟁 중앙값의 ${Math.round(r * 100)}%`,
    reasons: [`목표 ${fmt(p)} ${cur} · 경쟁 ${cp.length}개 중앙값 ${fmt(med)} ${cur}`, r > 1.2 ? "경쟁보다 비싸면 차별점(앱 기록·정확도 등)이 가격을 설명해 줘야 해요." : r < 0.8 ? "경쟁보다 싸지만 원가·마진을 확인해 보세요." : "경쟁 가격대 안에 있어요."],
    needs: [],
  };
}

const EVIDENCE_FIELDS: { path: string; label: string; ok: (s: ProductSpec) => boolean }[] = [
  { path: "market.tam", label: "전체 시장(TAM)·출처", ok: (s) => s.market.tam !== null && !!s.market.tamSource?.trim() },
  { path: "market.sam", label: "목표 시장(SAM)·출처", ok: (s) => s.market.sam !== null && !!s.market.samSource?.trim() },
  { path: "market.sharePct", label: "목표 점유율", ok: (s) => s.market.sharePct !== null },
  { path: "market.price", label: "목표 가격", ok: (s) => s.market.price !== null },
  { path: "market.competitors", label: "경쟁 제품", ok: (s) => s.market.competitors.some((c) => c.name.trim()) },
  { path: "market.differentiator", label: "차별점", ok: (s) => !!s.market.differentiator?.trim() },
];

/** SOM = SAM × 점유율, 수량 = SOM ÷ 가격 — 입력값으로만 계산. 하나라도 비면 null. */
export function somOf(s: ProductSpec): MarketCheck["som"] {
  const { sam, sharePct, price: p, currency } = s.market;
  if (sam === null || sharePct === null) return null;
  const value = (sam * sharePct) / 100;
  return { value, units: p && p > 0 ? Math.round((value * 1_000_000) / p) : null, currency: currency ?? "" };
}

export function marketCheck(s: ProductSpec, cls: ClassResult, plan: Plan, plans: StudyPlan[], kr: KrResult | null, us: UsResult | null): MarketCheck {
  const dims = [barrier(s, cls, kr, us), speed(plan, s.plan.launchDate), evidence(plans), reach(s), competition(s), price(s)];
  const scored = dims.filter((d) => d.score !== null) as (MarketDim & { score: number })[];
  const avg = scored.length ? scored.reduce((n, d) => n + d.score, 0) / scored.length : 0;
  const filled = EVIDENCE_FIELDS.filter((f) => f.ok(s)).length;
  const mood: Mood = scored.length < 3 ? "normal" : avg >= 4 ? "easy" : avg >= 3 ? "normal" : avg >= 2 ? "hard" : "scream";
  const b = dims[0], sp = dims[1];
  const lead = mood === "easy" ? "규제·출시 쪽 길은 순탄한 편이에요." : mood === "normal" ? "해볼 만한데, 챙길 게 있어요." : mood === "hard" ? "솔직히 쉽지 않은 길이에요." : "각오가 필요해요.";
  const tail = filled < 3 ? `시장 근거는 ${filled}/6만 들어 있어 '잘 팔릴지'는 아직 판단할 수 없어요.` : `시장 근거는 ${filled}/6개 적었어요.`;
  const headline = `${lead} 규제 장벽 ${b.summary.split(" — ")[0]}${b.score !== null ? `(${b.summary.split(" — ")[1] ?? ""})` : ""} · 출시까지 ${sp.summary}. ${tail}`;
  return {
    dims, som: somOf(s), mood, headline, evidence: { filled, total: EVIDENCE_FIELDS.length },
    gaps: EVIDENCE_FIELDS.filter((f) => !f.ok(s)).map(({ path, label }) => ({ path, label })),
  };
}
