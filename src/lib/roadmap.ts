// =====================================================================
// src/lib/roadmap.ts
// 제품 기획 로드맵 — 개발·검증·품질 인증·제품 인증·양산 항목과 기간(추정 범위), 의존 관계.
// 개발 시작일에서 가장 빠른 출시일을 계산하고, 목표 판매일에서 거꾸로 "늦어도 시작"을 계산한다.
// 기간은 추정이다 — 사람이 고친 값(spec.plan.durations)이 우선한다. 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../data/spec/types";
import type { ClassResult } from "./rules/classify";
import { classifyKr } from "./kr";
import { classifyUs } from "./us";

export type Lane = "dev" | "verify" | "quality" | "eu" | "kr" | "us" | "prod";
export const LANE_LABEL: Record<Lane, string> = {
  dev: "개발", verify: "검증·시험", quality: "품질 인증", eu: "EU 인증", kr: "한국 인증", us: "미국 인증", prod: "양산·출시",
};

export interface RoadItem {
  id: string;
  title: string;
  lane: Lane;
  /** 기간 (개월) — 추정 범위 */
  min: number;
  max: number;
  depends: string[];
  /** 기간 근거 */
  source: string;
  /** 사람이 고친 기간 */
  overridden?: boolean;
  /** 출시를 막지 않는 항목 (예: 실시간 안정성은 출시 후에도 계속) */
  nonBlocking?: boolean;
}

const EST = "추정 범위 — 회사 계획·기관 확인으로 바꾸세요";
const DESIGN: Record<string, [number, number]> = {
  "strip-only": [4, 9], "strip-reader": [9, 18], "personal-device": [12, 24], poct: [12, 24], "lab-analyzer": [18, 36],
};

export function buildRoadmap(s: ProductSpec, cls: ClassResult): RoadItem[] {
  const items: RoadItem[] = [];
  const add = (i: RoadItem) => items.push(i);
  const markets = s.markets ?? [];
  const have = s.qmsCerts ?? [];
  const lay = s.user === "lay" || s.user === "both";
  const device = s.formFactor !== null && s.formFactor !== "strip-only";
  const sw = !!s.software.hasApp || s.result.readout === "app" || s.result.readout === "reader" || device;

  // 개발
  add({ id: "dev-concept", title: "컨셉·설계 입력 정의", lane: "dev", min: 1, max: 3, depends: [], source: EST });
  const [d0, d1] = s.formFactor ? DESIGN[s.formFactor] : [6, 12];
  add({ id: "dev-design", title: `설계·시제품 (${s.formFactor ? { "strip-only": "스틱", "strip-reader": "스틱+리더기", "personal-device": "개인용 기기", poct: "POCT 기기", "lab-analyzer": "검사실 장비" }[s.formFactor] : "형태 미입력"})`, lane: "dev", min: d0, max: d1, depends: ["dev-concept"], source: `${EST} (제품 형태별)` });
  add({ id: "dev-freeze", title: "설계 동결", lane: "dev", min: 1, max: 2, depends: ["dev-design"], source: EST });

  // 검증
  add({ id: "v-analytical", title: "분석 성능 시험", lane: "verify", min: 3, max: 6, depends: ["dev-freeze"], source: EST });
  add({ id: "v-stab-accel", title: "가속 안정성 (잠정 유효기간)", lane: "verify", min: 2, max: 4, depends: ["dev-freeze"], source: `${EST} — 잠정 유효기간 인정 여부는 기관별 확인` });
  const shelf = s.storage.shelfLifeMonths;
  add({ id: "v-stab-real", title: `실시간 안정성 (${shelf !== null ? `${shelf}개월` : "유효기간 미입력"})`, lane: "verify", min: shelf ?? 12, max: shelf ?? 24, depends: ["dev-freeze"], source: shelf !== null ? "제품 스펙의 목표 유효기간" : EST, nonBlocking: true });
  if (lay || s.environment === "near-patient") add({ id: "v-usability", title: "사용적합성 평가 (IEC 62366-1)", lane: "verify", min: 2, max: 4, depends: ["dev-freeze"], source: EST });
  add({ id: "v-clinical", title: lay ? "임상 성능·일반인 사용 연구" : "임상 성능 연구", lane: "verify", min: 3, max: 9, depends: ["v-analytical"], source: EST });
  add({ id: "v-transport", title: "운송 시험", lane: "verify", min: 1, max: 2, depends: ["dev-freeze"], source: EST });
  if (device) add({ id: "v-elec", title: "전기안전·EMC 시험", lane: "verify", min: 3, max: 6, depends: ["dev-freeze"], source: EST });
  if (sw) add({ id: "v-sw", title: "소프트웨어 검증·밸리데이션", lane: "verify", min: 3, max: 6, depends: ["dev-freeze"], source: EST });

  const verifyIds = items.filter((i) => i.lane === "verify" && !i.nonBlocking).map((i) => i.id);

  // 품질 인증
  const needIso = (markets.includes("EU") || markets.includes("US") || markets.includes("CA") || markets.includes("AU") || markets.includes("JP")) && !have.includes("ISO13485");
  if (needIso) add({ id: "q-iso", title: "ISO 13485 인증", lane: "quality", min: 6, max: 12, depends: ["dev-concept"], source: EST });
  if (markets.includes("KR") && !have.includes("KGMP")) add({ id: "q-kgmp", title: "KGMP 적합인정", lane: "quality", min: 3, max: 6, depends: ["dev-freeze"], source: EST });
  const iso = needIso ? ["q-iso"] : [];

  const certIds: string[] = [];
  // EU
  if (markets.includes("EU")) {
    const selfCert = cls.value === "A" && s.sterile !== true;
    add({ id: "eu-tf", title: "기술문서·성능평가 보고서 완성", lane: "eu", min: 2, max: 4, depends: verifyIds, source: EST });
    if (selfCert) {
      add({ id: "eu-cert", title: "자기선언·EUDAMED 등록 (Class A)", lane: "eu", min: 1, max: 2, depends: ["eu-tf", ...iso], source: EST });
    } else {
      add({ id: "eu-nb", title: "인증기관(NB) 선정·계약", lane: "eu", min: 3, max: 6, depends: ["dev-concept"], source: `${EST} — NB 대기 기간이 길 수 있음` });
      const r: [number, number] = cls.value === "B" ? [6, 12] : cls.value === "C" ? [9, 18] : cls.value === "D" ? [12, 24] : [9, 18];
      add({ id: "eu-cert", title: `NB 심사·CE 인증서 (Class ${cls.value ?? "?"})`, lane: "eu", min: r[0], max: r[1], depends: ["eu-tf", "eu-nb", ...iso], source: `${EST} (클래스별)` });
    }
    certIds.push("eu-cert");
  }
  // 한국
  if (markets.includes("KR")) {
    const kr = classifyKr(s);
    const g = kr.confirmed.value ?? kr.grade;
    const r: [number, number] = g === "1" ? [0.5, 1] : g === "2" ? [2, 4] : g === "3" || g === "4" ? [4, 9] : [2, 9];
    add({ id: "kr-cert", title: `식약처 ${g === "1" ? "신고" : g === "2" ? "인증" : g ? "허가" : "신고·인증·허가"} (${g ? `${g}등급` : "등급 확인"})`, lane: "kr", min: r[0], max: r[1], depends: [...verifyIds, ...(markets.includes("KR") && !have.includes("KGMP") ? ["q-kgmp"] : [])], source: `${EST} (등급별)` });
    certIds.push("kr-cert");
  }
  // 미국
  if (markets.includes("US")) {
    const us = classifyUs(s);
    add({ id: "us-prep", title: "FDA 제출 자료 작성 (eSTAR)", lane: "us", min: 2, max: 3, depends: verifyIds, source: EST });
    const r: Record<string, [number, number, string]> = {
      exempt: [0.5, 1, "등록·리스팅"],
      "510k": [3, 6, "510(k) — FDA 심사 목표 90 FDA일 + 보완 요청 기간 (원문 확인 필요)"],
      denovo: [8, 12, "De Novo — 심사 목표 150 FDA일 + 보완 (원문 확인 필요)"],
      pma: [12, 24, "PMA — 심사 목표 180 FDA일 + 자문위원회 등 (원문 확인 필요)"],
      bla: [12, 24, "BLA·CBER 관할 가능성"],
      check: [3, 12, "경로 미정 — 제품 코드 확인 후 조정"],
    };
    const [a, b, src] = r[us.pathway];
    add({ id: "us-cert", title: `FDA ${us.pathway === "check" ? "인허가 (경로 확인)" : us.pathway === "510k" ? "510(k)" : us.pathway === "denovo" ? "De Novo" : us.pathway.toUpperCase()}`, lane: "us", min: a, max: b, depends: ["us-prep", ...iso], source: src });
    certIds.push("us-cert");
  }

  // 양산
  add({ id: "p-process", title: "공정 밸리데이션·양산 이전", lane: "prod", min: 2, max: 4, depends: ["dev-freeze"], source: EST });
  add({ id: "launch", title: "양산·판매 시작", lane: "prod", min: 0, max: 0, depends: [...certIds, "p-process", ...(certIds.length ? [] : verifyIds)], source: "모든 인증·양산 준비 완료" });

  // 사람이 고친 기간
  const o = s.plan?.durations ?? {};
  return items.map((i) => (typeof o[i.id] === "number" ? { ...i, min: o[i.id], max: o[i.id], overridden: true } : i));
}

export interface Scheduled extends RoadItem {
  /** 시작 후 개월 (가장 빠름 / 가장 늦음) */
  startMin: number; startMax: number; endMin: number; endMax: number;
  /** 목표 판매일에서 거꾸로 계산한 "늦어도 시작" (시작 후 개월, max 기간 기준) */
  latestStart: number | null;
  critical: boolean;
}

export interface Plan {
  items: Scheduled[];
  /** 출시까지 (개월) */
  launchMin: number;
  launchMax: number;
  /** 목표까지 가용 개월 (시작일·목표일이 있을 때) */
  available: number | null;
  verdict: "ok" | "tight" | "impossible" | "unknown";
  shortage: number;
}

export function monthsBetween(a: string, b: string): number {
  return (Date.parse(b) - Date.parse(a)) / (1000 * 60 * 60 * 24 * 30.44);
}
export function addMonths(date: string, m: number): string {
  return new Date(Date.parse(date) + m * 30.44 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function schedule(items: RoadItem[], startDate: string | null, launchDate: string | null): Plan {
  const byId = new Map(items.map((i) => [i.id, i]));
  const memo = new Map<string, { sMin: number; sMax: number }>();
  const startOf = (id: string): { sMin: number; sMax: number } => {
    const hit = memo.get(id);
    if (hit) return hit;
    const it = byId.get(id)!;
    let sMin = 0, sMax = 0;
    for (const d of it.depends) {
      const dep = byId.get(d);
      if (!dep) continue;
      const ds = startOf(d);
      sMin = Math.max(sMin, ds.sMin + dep.min);
      sMax = Math.max(sMax, ds.sMax + dep.max);
    }
    const r = { sMin, sMax };
    memo.set(id, r);
    return r;
  };
  // 출시까지 남은 가장 긴 경로 (max 기간) — 늦어도 시작 계산용
  const tail = new Map<string, number>();
  const tailOf = (id: string): number => {
    if (tail.has(id)) return tail.get(id)!;
    const it = byId.get(id)!;
    const next = items.filter((x) => x.depends.includes(id));
    const v = it.id === "launch" ? 0 : next.length ? Math.max(...next.map((n) => n.id === "launch" ? 0 : tailOf(n.id))) + it.max : it.nonBlocking ? Number.NaN : it.max;
    tail.set(id, v);
    return v;
  };
  const launch = startOf("launch");
  const available = startDate && launchDate ? monthsBetween(startDate, launchDate) : null;
  // 가장 긴 경로 표시 — max 기간 기준으로 끝이 출시 시작과 맞닿는 항목을 거꾸로 따라간다
  const crit = new Set<string>();
  const walk = (id: string) => {
    crit.add(id);
    const it = byId.get(id)!;
    const s = startOf(id).sMax;
    for (const d of it.depends) {
      const dep = byId.get(d);
      if (dep && Math.abs(startOf(d).sMax + dep.max - s) < 1e-9) walk(d);
    }
  };
  walk("launch");
  const out: Scheduled[] = items.map((i) => {
    const s = startOf(i.id);
    const t = tailOf(i.id);
    return {
      ...i, startMin: s.sMin, startMax: s.sMax, endMin: s.sMin + i.min, endMax: s.sMax + i.max,
      latestStart: available !== null && !Number.isNaN(t) ? available - t : null,
      critical: crit.has(i.id),
    };
  });
  let verdict: Plan["verdict"] = "unknown";
  let shortage = 0;
  if (available !== null) {
    if (available < launch.sMin) { verdict = "impossible"; shortage = launch.sMin - available; }
    else if (available < launch.sMax) verdict = "tight";
    else verdict = "ok";
  }
  return { items: out, launchMin: launch.sMin, launchMax: launch.sMax, available, verdict, shortage };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** 적합성 평가 경로 계획서에 넣는 로드맵 표 */
export function roadmapTable(s: ProductSpec, cls: ClassResult): string | null {
  if (!s.markets?.length) return null;
  const plan = schedule(buildRoadmap(s, cls), s.plan?.startDate ?? null, s.plan?.launchDate ?? null);
  const at = (m: number) => (s.plan?.startDate ? addMonths(s.plan.startDate, m) : `+${fmt(m)}개월`);
  const lines = [
    "| 구분 | 항목 | 기간 (개월) | 가장 빠른 시작 ~ 늦은 끝 | 근거 |",
    "|---|---|---|---|---|",
    ...plan.items.filter((i) => i.id !== "launch").map((i) => `| ${LANE_LABEL[i.lane]} | ${i.title}${i.critical ? " ★" : ""} | ${i.min === i.max ? fmt(i.min) : `${fmt(i.min)}~${fmt(i.max)}`}${i.overridden ? " (직접 입력)" : ""} | ${at(i.startMin)} ~ ${at(i.endMax)} | ${i.source.replace(/\|/g, "/")} |`),
    "",
    `출시 가능 시점: ${at(plan.launchMin)} ~ ${at(plan.launchMax)} (★ 가장 긴 경로)`,
  ];
  if (plan.verdict === "impossible") lines.push(`목표 판매일(${s.plan!.launchDate})보다 최소 ${fmt(plan.shortage)}개월 부족 — 일정·범위 조정 필요`);
  else if (plan.verdict === "tight") lines.push(`목표 판매일(${s.plan!.launchDate})은 빠른 경우에만 가능 — 빠듯함`);
  lines.push("기간은 추정 범위입니다. 회사 계획과 기관 안내로 바꾸세요.");
  return lines.join("\n");
}
