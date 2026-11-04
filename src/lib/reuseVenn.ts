import type { ProductSpec } from "../data/spec/types";
import { leafById } from "../data/docTree";
import { docById } from "../data/documents";
import { classify } from "./rules/classify";
import { evaluateDocSet } from "./rules/applicability";
import { classifyKr, krDocSet } from "./kr";
import { classifyUs, usDocSet } from "./us";

/** 벤다이어그램 영역 — E=EU(IVDR), K=한국, U=미국 */
export type VennRegion = "EKU" | "EK" | "EU" | "KU" | "E" | "K" | "U";

/** 영역 안의 항목. 문서가 있으면 docId, 문서 없이 나라 고유 절차면 docId 없음. */
export interface VennItem {
  key: string;
  title: string;
  docId?: string;
}

export interface ReuseVenn {
  regions: Record<VennRegion, VennItem[]>;
}

export const REGION_ORDER: VennRegion[] = ["EKU", "EK", "EU", "KU", "E", "K", "U"];

export const REGION_LABEL: Record<VennRegion, string> = {
  EKU: "세 나라 공통",
  EK: "EU · 한국",
  EU: "EU · 미국",
  KU: "한국 · 미국",
  E: "EU만",
  K: "한국만",
  U: "미국만",
};

const titleOf = (id: string) => leafById(id)?.title ?? docById(id)?.docTitle.replace(/^\[(한국|미국)\]\s*/, "") ?? id;

/**
 * 나라별(EU·한국·미국) 문서 재사용 벤다이어그램.
 * - EU: IVDR 문서 세트 중 '불필요'가 아닌 문서
 * - 한국·미국: 제출 자료 목록(krDocSet·usDocSet)의 재사용 문서. 재사용 문서가 없는 항목은 그 나라 고유 절차로 넣는다.
 * '확인 필요' 항목은 넓게 잡아 포함한다(빠뜨리지 않도록).
 */
export function reuseVenn(spec: ProductSpec): ReuseVenn {
  const eu = new Set(evaluateDocSet(spec, classify(spec)).filter((a) => a.status !== "excluded").map((a) => a.leafId));

  const kr = new Set<string>();
  const krOnly: VennItem[] = [];
  for (const d of krDocSet(spec, classifyKr(spec))) {
    if (d.status === "excluded") continue;
    if (d.reuse.length === 0) krOnly.push({ key: `kr:${d.id}`, title: d.title });
    for (const id of d.reuse) kr.add(id);
  }

  const us = new Set<string>();
  const usOnly: VennItem[] = [];
  for (const d of usDocSet(spec, classifyUs(spec))) {
    if (d.status === "excluded") continue;
    if (d.reuse.length === 0) usOnly.push({ key: `us:${d.id}`, title: d.title });
    for (const id of d.reuse) us.add(id);
  }

  const regions: Record<VennRegion, VennItem[]> = { EKU: [], EK: [], EU: [], KU: [], E: [], K: [], U: [] };
  const all = new Set([...eu, ...kr, ...us]);
  for (const id of all) {
    const code = `${eu.has(id) ? "E" : ""}${kr.has(id) ? "K" : ""}${us.has(id) ? "U" : ""}` as VennRegion;
    regions[code].push({ key: id, title: titleOf(id), docId: id });
  }
  regions.K.push(...krOnly);
  regions.U.push(...usOnly);
  for (const r of REGION_ORDER) regions[r].sort((a, b) => a.title.localeCompare(b.title, "ko"));
  return { regions };
}
