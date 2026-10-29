// =====================================================================
// src/lib/rules/certRoutes.ts
// 고른 제품 인증(출시 시장)별 인증 경로와 필요한 품질 인증.
// EU는 분류 엔진(classify) 결과를 쓴다. 한국은 등급을 사람이 품목 분류로 확인한다(추측하지 않음).
// 한국·기타 국가 내용은 원문 대조 전이라 verify: true. 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import type { ClassResult } from "./classify";
import { classifyKr, krRouteLabel, KR_SOURCES } from "../kr";

export interface CertRoute {
  market: string;
  name: string;
  /** 지금 앱이 자동작성까지 지원하는 수준 */
  support: "full" | "guide" | "planned";
  headline: string;
  steps: string[];
  qms: string[];
  /** 사람이 할 일 */
  todo: string[];
  links: { to: string; label: string }[];
  verify: boolean;
  source: string;
}

function krRoute(s: ProductSpec): CertRoute {
  const kr = classifyKr(s);
  const g = kr.confirmed.value;
  return {
    market: "KR",
    name: "한국 — 식약처(MFDS) 체외진단의료기기",
    support: "guide",
    headline: g ? krRouteLabel(g) : kr.grade ? `${krRouteLabel(kr.grade)} — 추천 (품목 분류로 확인)` : krRouteLabel(null),
    steps: kr.steps,
    qms: ["KGMP 적합인정 (필수)", "ISO 13485 인증이 있으면 KGMP 심사 준비에 활용 가능"],
    todo: [g === null ? "식약처 품목 분류로 등급 확인" : "등급 근거(품목 분류 코드) 기록", "KGMP 심사 일정 확인", "국내 대리인·수입업 허가(해외 제조 시) 확인"],
    links: [{ to: "/auto/kr", label: "한국(MFDS) 상세" }],
    verify: true,
    source: `${KR_SOURCES.law}, ${KR_SOURCES.notice}`,
  };
}

function euRoute(cls: ClassResult): CertRoute {
  return {
    market: "EU",
    name: "EU — IVDR (CE 마킹)",
    support: "full",
    headline: cls.value ? `Class ${cls.value} 추천 — ${cls.rule}` : "클래스 판정 보류 — 분류 질문을 확인하세요",
    steps: cls.route.length ? cls.route : ["클래스가 정해지면 적합성 평가 경로가 정해집니다."],
    qms: ["ISO 13485 (EN ISO 13485 — IVDR QMS 요구의 정합 규격)", ...(cls.value && cls.value !== "A" ? ["NB의 QMS 심사 (Annex IX)"] : [])],
    todo: ["클래스 확정", "NB 선정·계약", "EU 대리인 지정 (역외 제조자)"],
    links: [{ to: "/auto/docs", label: "분류·문서 세트" }, { to: "/ivdr", label: "IVDR 여정 지도" }],
    verify: false,
    source: "Regulation (EU) 2017/746",
  };
}

const OTHER: Record<string, { name: string; qms: string[]; note: string }> = {
  US: { name: "미국 — FDA", qms: ["QMSR (21 CFR 820, ISO 13485 기반 — 2026-02-02 시행)", "MDSAP 감사로 FDA 정기 실사 대체 가능"], note: "제품 코드·분류(510(k)·De Novo·면제)를 FDA 분류 데이터베이스로 확인합니다." },
  CA: { name: "캐나다 — Health Canada", qms: ["MDSAP 인증 (Class II 이상 면허에 필요)"], note: "등급(Class I–IV)에 따라 기기 면허(MDL)가 필요합니다." },
  AU: { name: "호주 — TGA", qms: ["ISO 13485 / MDSAP 활용 가능"], note: "ARTG 등재가 필요하며, EU CE 인증 근거를 활용할 수 있습니다." },
  JP: { name: "일본 — PMDA", qms: ["QMS 성령(ISO 13485 기반) / MDSAP 활용 가능"], note: "등급에 따라 신고·인증·승인 경로가 갈리고, 일본 내 제조판매업자가 필요합니다." },
  BR: { name: "브라질 — ANVISA", qms: ["BGMP / MDSAP 활용 가능"], note: "등급에 따라 notificação·registro 경로가 갈립니다." },
};

export function certRoutes(s: ProductSpec, cls: ClassResult): CertRoute[] {
  const markets = s.markets ?? [];
  return markets.map((m) => {
    if (m === "EU") return euRoute(cls);
    if (m === "KR") return krRoute(s);
    const o = OTHER[m];
    return {
      market: m,
      name: o?.name ?? m,
      support: "planned" as const,
      headline: "자동작성은 다음 단계에서 지원합니다.",
      steps: o ? [o.note] : [],
      qms: o?.qms ?? [],
      todo: ["현지 규제 담당·대리인 확인"],
      links: m === "US" || m === "CA" || m === "AU" || m === "JP" || m === "BR" ? [{ to: "/mdsap", label: "MDSAP 여정 지도" }] : [],
      verify: true,
      source: "각국 규제기관 원문",
    };
  });
}

/** 고른 제품 인증에 필요한데 아직 고르지 않은 품질 인증. */
export function missingQms(s: ProductSpec): { cert: string; why: string }[] {
  const m = s.markets ?? [];
  const have = s.qmsCerts ?? [];
  const out: { cert: string; why: string }[] = [];
  if (m.includes("KR") && !have.includes("KGMP")) out.push({ cert: "KGMP", why: "한국 식약처 신고·인증·허가에는 KGMP 적합인정이 필요합니다." });
  if (m.includes("EU") && !have.includes("ISO13485")) out.push({ cert: "ISO 13485", why: "IVDR 품질경영시스템 요구를 충족하는 정합 규격입니다." });
  if (m.includes("CA") && !have.includes("MDSAP")) out.push({ cert: "MDSAP", why: "캐나다 Class II 이상 기기 면허에는 MDSAP 인증이 필요합니다." });
  return out;
}
