// =====================================================================
// src/lib/transport/process.ts
// 출하부터 사용자 수령까지 운송 과정 — 단계별 위험·관리·기록.
// 목적지·항공 구간·콜드체인 여부에 따라 단계와 문구가 바뀐다.
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import { destLabel, transportFacts } from "./facts";

export interface ProcessStage {
  id: string;
  title: string;
  who: string;
  risks: string[];
  controls: string[];
  records: string[];
}

export function transportProcess(s: ProductSpec): ProcessStage[] {
  const f = transportFacts(s);
  const dest = s.transport.destinations ?? [];
  const foreign = dest.filter((d) => d !== "KR").map(destLabel);
  const out: ProcessStage[] = [];

  out.push({
    id: "pack", title: "출하 포장", who: "제조자 (출하 담당)",
    risks: ["포장 구성 누락·오배치", ...(f.cold === true ? ["냉매 사전 조건화 부족 → 초기 온도 이탈"] : [])],
    controls: ["밸리데이션한 포장 사양 그대로 포장 (작업지시서·사진 기준)", "출하 검사", ...(f.cold === true ? ["냉매 조건화 시간·온도 확인", "데이터로거 시작"] : [])],
    records: ["출하 검사 기록 (로트·수량)", "포장 사양 버전", ...(f.cold === true ? ["냉매 조건화 기록", "데이터로거 번호"] : [])],
  });

  out.push({
    id: "pickup", title: "집하 · 허브 분류", who: "택배·특송사",
    risks: ["분류기·컨베이어 낙하·충격", "적재 압축", "차량 진동"],
    controls: ["ISTA 3A로 검증한 포장", "ISO 780 취급 표시", "운송사 서비스 수준 계약 (온도·취급 요건)"],
    records: ["운송장·추적 번호", "운송사 평가 기록"],
  });

  if (f.air === true) {
    out.push({
      id: "air", title: "항공 구간", who: "항공사·조업사",
      risks: ["화물칸 저압 → 파우치 부풂·누액", "계류장 대기 중 고온·저온 노출", "환적 지연"],
      controls: ["저압 시험 통과 포장", ...(f.dangerous === true ? ["IATA DGR 분류·포장·표시와 Shipper's Declaration"] : ["위험물 아님 판단 근거(SDS 14항) 보관"]), ...(f.cold === true ? ["단열 포장 유지 시간 > 예상 운송 시간 + 여유"] : [])],
      records: ["항공화물운송장(AWB)", ...(f.dangerous === true ? ["위험물 신고서"] : [])],
    });
  }

  if (foreign.length) {
    out.push({
      id: "customs", title: `통관 (${foreign.join("·")})`, who: dest.includes("EU") ? "EU 수입자 · 관세사" : "수입자 · 관세사",
      risks: ["서류 미비로 통관 지연 → 온도 노출 시간 증가"],
      controls: [
        "상업송장·HS 코드·원산지 서류 사전 준비",
        ...(dest.includes("EU") ? ["EU 수입자가 CE 표시·라벨·적합성 선언과 보관·운송 조건 유지를 확인 (IVDR Art.13)"] : []),
      ],
      records: ["수입 신고 서류", ...(dest.includes("EU") ? ["수입자 확인 기록"] : [])],
    });
  }

  out.push({
    id: "distribution", title: "유통 · 보관", who: dest.includes("EU") ? "유통자 (IVDR Art.14)" : "유통자",
    risks: ["창고 보관 온도 이탈", "선입선출 실패로 유효기간 초과"],
    controls: [`라벨 보관 조건${f.tempRange ? `(${f.tempRange})` : ""} 유지`, "유효기간 관리", ...(dest.includes("EU") ? ["유통자는 보관·운송 조건이 제조자 조건을 지키는지 확인 (IVDR Art.14)"] : [])],
    records: ["창고 온도 기록", "입·출고 기록 (로트 추적)"],
  });

  out.push({
    id: "receive", title: "사용자 수령", who: s.user === "lay" || s.user === "both" ? "일반 사용자 (가정 배송)" : "사용 기관",
    risks: [s.user === "lay" || s.user === "both" ? "문 앞 방치 중 고온·저온 노출" : "수령 후 보관 조건 미준수", "손상된 제품 사용"],
    controls: ["IFU에 보관 조건과 '포장이 손상되면 사용하지 말 것' 안내", ...(f.cold === true ? ["수령 시 데이터로거·온도 지시계 확인 방법 안내"] : [])],
    records: ["고객 불만·반품 기록 → PMS 입력"],
  });

  return out;
}
