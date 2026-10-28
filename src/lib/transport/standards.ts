// =====================================================================
// src/lib/transport/standards.ts
// 스펙 → 운송·포장에 적용되는 규정·규격과 그 이유.
// 시험 강도(낙하 높이·진동 PSD 등)는 유료 원문 표에 있어 수치를 넣지 않는다.
// PPWR 은 EUR-Lex 원문 대조 전이라 verify: true (2차 자료 기준).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import { ISTA_3A_MAX_KG, transportFacts, type TStatus } from "./facts";

export interface StandardItem {
  id: string;
  name: string;
  status: TStatus;
  reason: string;
  source: string;
  /** 원문 대조 전 — 2차 자료 기준 */
  verify?: boolean;
  dependsOn: string[];
}

const it = (id: string, name: string, status: TStatus, reason: string, source: string, dependsOn: string[] = [], verify = false): StandardItem =>
  ({ id, name, status, reason, source, dependsOn, ...(verify ? { verify } : {}) });

export const PPWR_SOURCES = "Regulation (EU) 2025/40 — 2차 자료: regsurance.com, mdlaw.eu, nsf.org, conai.org, eucerep.com";

export function applicableStandards(s: ProductSpec): StandardItem[] {
  const f = transportFacts(s);
  const out: StandardItem[] = [];

  out.push(
    f.eu === null ? it("ivdr-gspr7", "IVDR Annex I §7 (운송·보관 중 성능 유지)", "unknown", "출시 시장·목적지가 정해지면 판정됩니다.", "Regulation (EU) 2017/746", ["markets", "transport.destinations"])
    : f.eu ? it("ivdr-gspr7", "IVDR Annex I §7 (운송·보관 중 성능 유지)", "required", "EU 출시 제품은 제조자가 정한 운송·보관 조건에서 성능이 떨어지지 않도록 설계·포장해야 합니다. 이 문서가 그 근거입니다.", "Regulation (EU) 2017/746 Annex I", ["markets", "transport.destinations"])
    : it("ivdr-gspr7", "IVDR Annex I §7 (운송·보관 중 성능 유지)", "excluded", "EU 출시가 아닙니다. 목적지 국가의 규정(FDA·MFDS 등)으로 같은 내용을 확인하세요.", "Regulation (EU) 2017/746", ["markets", "transport.destinations"]),
  );

  out.push(it("iso13485-7511", "ISO 13485 7.5.11 제품 보존", "required", "가공·보관·취급·유통 중 제품 적합성을 지키는 절차가 QMS에 있어야 합니다. 운송 밸리데이션 결과가 이 절차의 근거가 됩니다.", "ISO 13485:2016"));

  out.push(
    f.reagent
      ? it("en-iso-23640", "EN ISO 23640 (IVD 시약 안정성 — 운송 시뮬레이션)", "required", "IVD 시약의 운송 안정성을 평가하는 정합 규격입니다. 운송 중 온도 이탈을 재현한 뒤 성능을 확인합니다.", "EN ISO 23640:2015", ["productType"])
      : it("en-iso-23640", "EN ISO 23640 (IVD 시약 안정성)", "excluded", "시약이 아닌 제품입니다.", "EN ISO 23640:2015", ["productType"]),
  );

  // ISTA 3A — 택배 단일 포장 시험
  const parcelLike = f.parcel === true || f.air === true;
  if (s.transport.modes === null) out.push(it("ista-3a", "ISTA 3A (택배 단일 포장 시험)", "unknown", "운송 방식이 정해지면 판정됩니다.", "ISTA 3A", ["transport.modes"]));
  else if (!parcelLike) out.push(it("ista-3a", "ISTA 3A (택배 단일 포장 시험)", "optional", "택배·항공 없이 육상 화물만 씁니다. 팔레트·혼적 화물은 ISTA 3E·3B 검토 대상이며 1차 지원 범위 밖입니다.", "ISTA 3 series", ["transport.modes"]));
  else if (f.overParcel === null) out.push(it("ista-3a", "ISTA 3A (택배 단일 포장 시험)", "unknown", `출하 박스 무게가 정해지면 판정됩니다 (ISTA 3A는 ${ISTA_3A_MAX_KG} kg 이하).`, "ISTA 3A", ["transport.grossWeightKg"]));
  else if (f.overParcel) out.push(it("ista-3a", "ISTA 3A (택배 단일 포장 시험)", "excluded", `${f.weightKg} kg은 ISTA 3A 범위(${ISTA_3A_MAX_KG} kg 이하)를 넘습니다. 팔레트 화물(ISTA 3E 또는 ASTM D4169)로 다뤄야 하며 1차 지원 범위 밖입니다.`, "ISTA 3A", ["transport.grossWeightKg"]));
  else out.push(it("ista-3a", "ISTA 3A (택배 단일 포장 시험)", "recommended", `택배망 단일 포장 운송의 업계 표준 시험입니다. 법적 의무는 아니지만 NB가 흔히 기대합니다. 시험 강도는 무게 ${f.weightKg} kg 기준으로 ISTA 3A 원문 표를 따릅니다.`, "ISTA 3A", ["transport.modes", "transport.grossWeightKg"]));

  out.push(it("astm-d4169", "ASTM D4169 (분배 주기 시험)", "optional", "ISTA 3A 대신 쓸 수 있는 대안입니다. 미국 고객이 요구하거나 시험 강도(보증 수준)를 직접 정해야 할 때 씁니다.", "ASTM D4169"));

  // 온도 관리
  if (f.cold === null) out.push(it("ista-7e", "ISTA 7E (택배용 단열 포장 시험)", "unknown", "보관 온도가 정해지면 판정됩니다.", "ISTA 7E", ["storage.tempMaxC"]));
  else if (f.cold) out.push(it("ista-7e", "ISTA 7E (택배용 단열 포장 시험)", "required", `보관 조건이 ${f.tempRange ?? "냉장"}이라 단열 박스·냉매로 온도를 지켜야 합니다. 여름·겨울 온도 프로파일에서 단열 포장이 유지 시간 동안 범위를 지키는지 검증합니다.`, "ISTA 7E", ["storage.tempMaxC"]));
  else out.push(it("ista-7e", "ISTA 7E (택배용 단열 포장 시험)", "excluded", `보관 조건이 ${f.tempRange ?? "상온"}이라 단열 포장이 필요 없습니다. 대신 EN ISO 23640 운송 시뮬레이션으로 극한 온도 노출 영향을 평가합니다${f.hotDestination ? " (고온 지역 목적지 포함 — 고온 노출 조건을 꼭 넣으세요)" : ""}.`, "ISTA 7E", ["storage.tempMaxC"]));

  out.push(
    f.sterile === null ? it("iso-11607", "ISO 11607 (멸균 배리어 포장)", "unknown", "멸균 여부가 정해지면 판정됩니다.", "ISO 11607-1/-2", ["sterile"])
    : f.sterile ? it("iso-11607", "ISO 11607 (멸균 배리어 포장)", "required", "멸균 제품은 운송 후에도 멸균 배리어가 유지됨을 보여야 합니다. 운송 시험 뒤 밀봉 강도·무결성 시험을 함께 합니다.", "ISO 11607-1/-2", ["sterile"])
    : it("iso-11607", "ISO 11607 (멸균 배리어 포장)", "excluded", "비멸균 제품입니다.", "ISO 11607-1/-2", ["sterile"]),
  );

  // 위험물
  const dgName = "IATA DGR (항공 위험물)";
  if (f.air === false) out.push(it("iata-dgr", dgName, "excluded", "항공 운송이 없습니다.", "IATA Dangerous Goods Regulations", ["transport.modes"]));
  else if (f.air === null) out.push(it("iata-dgr", dgName, "unknown", "운송 방식이 정해지면 판정됩니다.", "IATA Dangerous Goods Regulations", ["transport.modes"]));
  else if (f.dangerous === null) out.push(it("iata-dgr", dgName, "unknown", "SDS 14항(운송 정보)으로 위험물 해당 여부를 확인해 주세요. 보존제(아지드화나트륨 등)·용매가 있으면 특히 확인이 필요합니다.", "IATA Dangerous Goods Regulations", ["transport.dangerousGoods"]));
  else if (f.dangerous) out.push(it("iata-dgr", dgName, "required", "위험물을 항공으로 보냅니다. 분류·포장·표시·신고서(Shipper's Declaration)와 교육받은 담당자가 필요합니다.", "IATA Dangerous Goods Regulations", ["transport.dangerousGoods"]));
  else out.push(it("iata-dgr", dgName, "excluded", "SDS상 운송 위험물이 아닙니다. 판단 근거(SDS 14항)를 기록에 남겨 두세요.", "IATA Dangerous Goods Regulations", ["transport.dangerousGoods"]));

  if (f.road === true) {
    out.push(
      f.dangerous === null ? it("adr", "ADR (도로 위험물, 유럽)", "unknown", "SDS 14항으로 위험물 해당 여부를 확인해 주세요.", "ADR", ["transport.dangerousGoods"])
      : f.dangerous ? it("adr", "ADR (도로 위험물, 유럽)", "required", "위험물을 도로로 운송합니다.", "ADR", ["transport.dangerousGoods"])
      : it("adr", "ADR (도로 위험물, 유럽)", "excluded", "SDS상 운송 위험물이 아닙니다.", "ADR", ["transport.dangerousGoods"]),
    );
  }

  out.push(it("iso-780", "ISO 780 (취급 표시 그림기호)", "recommended", "출하 박스에 '이 면 위로', '깨지기 쉬움', '습기 주의' 같은 취급 표시를 붙입니다.", "ISO 780"));
  out.push(it("iso-15223", "ISO 15223-1 (라벨 기호 — 온도 한계 등)", "recommended", "키트 상자·출하 박스에 보관 온도 한계 기호를 표시해 운송·유통 중 조건이 지켜지게 합니다.", "EN ISO 15223-1"));

  out.push(
    f.eu === null ? it("ppwr", "PPWR — EU 포장·포장폐기물 규정", "unknown", "출시 시장·목적지가 정해지면 판정됩니다.", PPWR_SOURCES, ["markets", "transport.destinations"], true)
    : f.eu ? it("ppwr", "PPWR — EU 포장·포장폐기물 규정", "required", "2026-08-12부터 적용됩니다. EU에 출시하는 모든 포장이 대상이며, IVD의 접촉 민감 1차 포장만 재활용·재생원료 의무에서 예외입니다. 키트 상자·출하 박스는 예외가 아닙니다. 세부 의무는 포장 설계 체크리스트를 보세요.", PPWR_SOURCES, ["markets", "transport.destinations"], true)
    : it("ppwr", "PPWR — EU 포장·포장폐기물 규정", "excluded", "EU 출시가 아닙니다. 목적지의 포장 규정을 따로 확인하세요.", PPWR_SOURCES, ["markets", "transport.destinations"], true),
  );

  return out;
}
