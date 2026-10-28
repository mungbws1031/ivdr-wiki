// =====================================================================
// src/lib/transport/testPlan.ts
// 운송 시험 순서 (ISTA 3A 경로) + 판정 기준.
// 낙하 높이·진동 강도·박스 수는 ISTA 원문 표를 따르도록만 쓰고 수치를 만들지 않는다.
// 합격 기준 수치(일치율 등)는 사람이 정한다 — [사양: …] 로 남긴다.
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import { transportFacts } from "./facts";

export interface TestStep {
  id: string;
  title: string;
  detail: string;
  method?: string;
  required: boolean;
  note?: string;
}

export function transportTestPlan(s: ProductSpec): { steps: TestStep[]; acceptance: string[]; outOfScope: string | null } {
  const f = transportFacts(s);
  const lots = f.lots !== null ? `${f.lots}개 로트` : "[평가 로트 수 — 스펙 미입력]";
  const outOfScope =
    f.overParcel === true ? `출하 박스 ${f.weightKg} kg은 ISTA 3A 범위(70 kg 이하)를 넘습니다 — 팔레트 시험(ISTA 3E 또는 ASTM D4169)으로 따로 계획하세요.`
    : s.transport.modes !== null && !s.transport.modes.some((m) => m === "parcel" || m === "air") ? "택배·항공 없이 육상 화물만 씁니다 — 1차 지원 범위(택배·항공) 밖이라 아래 순서는 참고용입니다."
    : null;

  const steps: TestStep[] = [
    {
      id: "samples", title: "시료 준비", required: true,
      detail: `실제 출하 상태로 포장한 출하 박스 [박스 수 — ISTA 3A 원문 기준]. 키트는 ${lots}에서 뽑고, 같은 로트의 비운송 대조 키트를 라벨 보관 조건${f.tempRange ? `(${f.tempRange})` : ""}에 둡니다.`,
    },
    {
      id: "conditioning", title: "대기 조건 전처리 · 온습도 조건화", required: true, method: "ISTA 3A",
      detail: `ISTA 3A 원문의 전처리·조건화 조건을 따릅니다. 선택 조건(고온·저온·고습)은 목적지 기후로 고르세요${f.hotDestination ? " — 고온 지역 목적지가 있어 고온·고습 조건 포함을 권합니다" : ""}.`,
    },
    {
      id: "drop", title: "충격 (낙하)", required: true, method: "ISTA 3A · ASTM D5276",
      detail: `낙하 순서·방향·높이는 무게 ${f.weightKg !== null ? `${f.weightKg} kg` : "[출하 박스 무게 — 미입력]"} 기준으로 ISTA 3A 원문 표를 따릅니다.`,
    },
    {
      id: "vibration", title: "랜덤 진동 (상단 하중 유·무)", required: true, method: "ISTA 3A · ASTM D4728",
      detail: "택배 차량 진동을 재현합니다. 진동 프로파일·시간·상단 하중은 ISTA 3A 원문을 따릅니다.",
    },
    {
      id: "low-pressure", title: "저압 (항공 고도) 진동", required: f.air === true, method: "ISTA 3A (선택 단계)",
      detail: f.air === true ? "항공 구간이 있어 이 단계를 넣습니다. 파우치 부풂·밀봉 손상·액체 누액을 확인합니다." : "항공 운송이 없으면 ISTA 3A에서 선택 단계입니다.",
    },
    {
      id: "final-drop", title: "최종 충격 (낙하)", required: true, method: "ISTA 3A",
      detail: "앞 단계를 거친 박스로 ISTA 3A 원문의 마지막 충격 시험을 합니다.",
    },
    f.cold === true
      ? {
          id: "thermal", title: "온도 노출 — 단열 포장 시험", required: true, method: "ISTA 7E",
          detail: "여름·겨울 프로파일로 단열 박스가 정한 유지 시간 동안 보관 범위를 지키는지 확인합니다. 박스 안 데이터로거로 기록합니다.",
        }
      : {
          id: "thermal", title: "온도 노출 — 운송 시뮬레이션", required: f.reagent, method: "EN ISO 23640",
          detail: `최악 운송 경로에서 생길 수 있는 고온·저온 노출을 재현한 뒤 성능을 확인합니다. 온도·기간은 경로 조사(계절·대기 시간)로 정하고 근거를 남깁니다${f.air === true ? " — 항공 화물칸·계류장 저온 노출 포함" : ""}${f.hotDestination ? " — 고온 지역 목적지 여름철 조건 포함" : ""}.`,
        },
    {
      id: "inspect", title: "외관 검사", required: true,
      detail: "출하 박스·키트 상자·파우치 손상, 누액, 밀봉 상태, 건조제 상태, 라벨 판독성을 확인합니다.",
    },
    {
      id: "performance", title: "운송 후 성능 확인", required: true, method: "EN ISO 23640",
      detail: `운송 시료와 비운송 대조를 같은 조건에서 시험합니다. Cut-off 근처 시료(음성 · cut-off 부근 · 양성)를 반복 시험해 판정이 같은지 봅니다${s.analyte.cutoffValue !== null ? ` (cut-off ${s.analyte.cutoffValue}${s.analyte.cutoffUnit ? ` ${s.analyte.cutoffUnit}` : ""})` : ""}.`,
    },
    {
      id: "real-ship", title: "실제 경로 시험 발송 (보완)", required: false,
      detail: `대표 경로로 데이터로거를 넣어 실제 발송해 시뮬레이션 조건이 충분한지 확인합니다${f.cold === true ? " — 콜드체인 제품은 권장" : ""}.`,
    },
  ];

  const acceptance = [
    "출하 박스·키트 상자: 내용물을 보호하지 못할 정도의 손상 없음",
    "파우치·용기: 밀봉 손상·핀홀·누액 0건",
    "라벨: 모든 필수 정보가 읽힘",
    `운송 후 성능: 비운송 대조와 판정 일치 — 허용 기준 [사양: 일치율·반복 수 — 사람이 정함]${s.targets.sensitivity !== null ? `, 표시 성능(목표 민감도 ${s.targets.sensitivity}%)을 유지` : ""}`,
    ...(f.cold === true ? ["온도 기록: 유지 시간 동안 보관 범위 이탈 없음 (데이터로거)"] : []),
  ];

  return { steps, acceptance, outOfScope };
}
