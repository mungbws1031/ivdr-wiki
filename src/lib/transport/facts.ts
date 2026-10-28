// =====================================================================
// src/lib/transport/facts.ts
// 스펙 → 운송 판정에 쓰는 사실값. 모르는 값은 null 로 두고 추측하지 않는다.
// 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import type { ApplStatus } from "../rules/applicability";

export type TStatus = ApplStatus;

export interface TransportFacts {
  /** EU 출시(IVDR·PPWR 적용). 시장·목적지 둘 다 비어 있으면 null. */
  eu: boolean | null;
  parcel: boolean | null;
  air: boolean | null;
  road: boolean | null;
  /** 냉장·냉동 보관(최고 온도 8℃ 이하) — 단열 포장·콜드체인 필요. */
  cold: boolean | null;
  weightKg: number | null;
  /** ISTA 3A 범위(택배 70 kg 이하) 초과. */
  overParcel: boolean | null;
  international: boolean | null;
  /** 여름철 고온 노출이 큰 목적지(중동·동남아·호주)가 포함됐는지. */
  hotDestination: boolean;
  volumeL: number | null;
  sterile: boolean | null;
  liquid: boolean | null;
  dangerous: boolean | null;
  reagent: boolean;
  lots: number | null;
  tempRange: string | null;
}

/** ISTA 3A 적용 상한 — ISTA 3A 개요(ista.org) 기준 70 kg(150 lb). */
export const ISTA_3A_MAX_KG = 70;
export const COLD_MAX_C = 8;

export function transportFacts(s: ProductSpec): TransportFacts {
  const t = s.transport;
  const dest = t.destinations;
  const modes = t.modes;
  const has = (m: string) => (modes === null ? null : modes.includes(m as never));
  const eu = dest?.includes("EU") || s.markets?.includes("EU") ? true : dest === null && s.markets === null ? null : false;
  const w = t.grossWeightKg;
  const dims = [t.lengthCm, t.widthCm, t.heightCm];
  return {
    eu,
    parcel: has("parcel"),
    air: has("air"),
    road: has("road"),
    cold: s.storage.tempMaxC === null ? null : s.storage.tempMaxC <= COLD_MAX_C,
    weightKg: w,
    overParcel: w === null ? null : w > ISTA_3A_MAX_KG,
    international: dest === null ? null : dest.some((d) => d !== "KR"),
    hotDestination: !!dest?.some((d) => d === "ME" || d === "SEA" || d === "AU"),
    volumeL: dims.every((d) => d !== null) ? (dims as number[]).reduce((a, b) => a * b, 1) / 1000 : null,
    sterile: s.sterile,
    liquid: t.liquidReagent,
    dangerous: t.dangerousGoods,
    reagent: s.productType === "reagent-kit" || s.productType === null,
    lots: s.targets.lots,
    tempRange: s.storage.tempMinC !== null && s.storage.tempMaxC !== null ? `${s.storage.tempMinC}–${s.storage.tempMaxC}℃` : null,
  };
}

const DEST_KO: Record<string, string> = { KR: "국내", EU: "EU", US: "미국", JP: "일본", SEA: "동남아", ME: "중동", AU: "호주", other: "기타" };
const MODE_KO: Record<string, string> = { parcel: "택배·소포", air: "항공", road: "육상 화물" };
export const destLabel = (d: string) => DEST_KO[d] ?? d;
export const modeLabel = (m: string) => MODE_KO[m] ?? m;

/** 부피 무게 — 운송사마다 계수가 달라 두 값을 함께 보여준다(항공 IATA 6000, 특송 다수 5000 cm³/kg). */
export function volumetricKg(volumeL: number | null): { iata: number; express: number } | null {
  if (volumeL === null) return null;
  const cm3 = volumeL * 1000;
  return { iata: Math.round((cm3 / 6000) * 10) / 10, express: Math.round((cm3 / 5000) * 10) / 10 };
}
