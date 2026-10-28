// =====================================================================
// src/lib/transport/index.ts
// 운송·포장 판정 묶음 + 문서 토큰용 텍스트. 순수 함수 (DOM 의존 금지).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import { destLabel, modeLabel, transportFacts } from "./facts";
import { applicableStandards } from "./standards";
import { packagingChecklist } from "./packaging";
import { transportTestPlan } from "./testPlan";
import { transportProcess } from "./process";

export * from "./facts";
export * from "./standards";
export * from "./packaging";
export * from "./testPlan";
export * from "./process";

const STATUS_KO = { required: "필수", recommended: "권장", optional: "선택", excluded: "불필요", unknown: "확인 필요" } as const;

/** 운송 입력이 하나라도 있는지 — 없으면 토큰은 "스펙 미입력"으로 둔다. */
export function hasTransportInput(s: ProductSpec): boolean {
  return Object.values(s.transport).some((v) => v !== null);
}

/** 문서 토큰 값. 운송 입력이 없으면 전부 null. */
export function transportTokens(s: ProductSpec): Record<string, string | null> {
  const keys = ["transportRoute", "transportStandards", "packagingSpec", "transportTests", "transportAcceptance", "transportProcess"];
  if (!hasTransportInput(s)) return Object.fromEntries(keys.map((k) => [k, null]));
  const f = transportFacts(s);
  const t = s.transport;
  const plan = transportTestPlan(s);
  const na = "[미입력]";
  const route = [
    `목적지: ${t.destinations?.map(destLabel).join(", ") ?? na}`,
    `운송 방식: ${t.modes?.map(modeLabel).join(", ") ?? na}`,
    `출하 박스: ${t.lengthCm ?? "?"}×${t.widthCm ?? "?"}×${t.heightCm ?? "?"} cm, ${t.grossWeightKg !== null ? `${t.grossWeightKg} kg` : "무게 미입력"}, 키트 ${t.kitsPerShipper ?? "?"}개`,
    `보관 조건: ${f.tempRange ?? na} · 멸균: ${f.sterile === null ? na : f.sterile ? "예" : "아니오"} · 액체 시약: ${f.liquid === null ? na : f.liquid ? "있음" : "없음"} · 위험물: ${f.dangerous === null ? "확인 필요 (SDS 14항)" : f.dangerous ? "해당" : "해당 없음"}`,
    ...(plan.outOfScope ? [`주의: ${plan.outOfScope}`] : []),
  ].join("\n");
  const standards = applicableStandards(s)
    .filter((x) => x.status !== "excluded")
    .map((x) => `- [${STATUS_KO[x.status]}] ${x.name} — ${x.reason}${x.verify ? " (원문 확인 필요)" : ""}`)
    .join("\n");
  const pack = packagingChecklist(s)
    .map((g) => `${g.title}\n${g.items.filter((i) => !i.na).map((i) => `- ${i.text}${i.verify ? " (원문 확인 필요)" : ""}`).join("\n")}`)
    .join("\n\n");
  const tests = plan.steps
    .map((st, i) => `${i + 1}. ${st.title}${st.method ? ` [${st.method}]` : ""}${st.required ? "" : " (선택)"} — ${st.detail}`)
    .join("\n");
  const proc = transportProcess(s)
    .map((p, i) => `${i + 1}. ${p.title} (${p.who})\n   위험: ${p.risks.join(", ")}\n   관리: ${p.controls.join(", ")}\n   기록: ${p.records.join(", ")}`)
    .join("\n");
  return {
    transportRoute: route,
    transportStandards: standards,
    packagingSpec: pack,
    transportTests: tests,
    transportAcceptance: plan.acceptance.map((a) => `- ${a}`).join("\n"),
    transportProcess: proc,
  };
}
