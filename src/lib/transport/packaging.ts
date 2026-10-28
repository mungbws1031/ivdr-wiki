// =====================================================================
// src/lib/transport/packaging.ts
// 포장 설계 체크리스트 — 1차(파우치) / 2차(키트 상자) / 3차(출하 박스) / PPWR.
// PPWR 항목은 원문 대조 전이라 verify: true. 날짜가 자료마다 다르면 그 차이를 그대로 적는다.
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import { transportFacts, volumetricKg } from "./facts";

export interface PackItem {
  text: string;
  why?: string;
  verify?: boolean;
  /** 이 제품에서 해당 없음으로 판정된 항목 (이유와 함께 흐리게 표시) */
  na?: string;
}

export interface PackGroup {
  id: "primary" | "secondary" | "tertiary" | "ppwr";
  title: string;
  items: PackItem[];
}

export function packagingChecklist(s: ProductSpec): PackGroup[] {
  const f = transportFacts(s);
  const t = s.transport;

  const primary: PackItem[] = [
    { text: "방습 배리어 파우치와 건조제로 개봉 전 안정성 유지", why: "운송 중 습도·온도 변화가 스트립 성능에 직접 영향을 줍니다." },
    { text: "파우치 밀봉 강도·핀홀을 운송 시험 전후로 확인", why: "낙하·진동 뒤 밀봉이 풀리면 건조제가 무력해집니다." },
    f.liquid === true
      ? { text: "액체 시약 용기: 누액 방지 마개, 2차 밀봉(지퍼백 등), 흡수재", why: f.air ? "항공 구간의 저압에서 내압 차로 누액이 생기기 쉽습니다." : "낙하·진동 뒤 누액이 없어야 합니다." }
      : f.liquid === false
        ? { text: "액체 시약 용기 누액 대책", na: "액체 시약이 없습니다." }
        : { text: "액체 시약 용기 누액 대책 — 액체 시약 여부를 입력하면 판정됩니다", why: "완충액·대조액이 있으면 누액 시험이 필요합니다." },
    { text: "1차 라벨: 로트·유효기간·보관 온도 기호(ISO 15223-1)", why: "운송 뒤에도 라벨이 읽혀야 합니다(마모·습기)." },
  ];

  const secondary: PackItem[] = [
    { text: "키트 상자 안에서 구성품이 움직이지 않게 고정(인서트·칸막이)", why: "진동 중 파우치끼리 마찰·찢김을 막습니다." },
    { text: "IFU 동봉, 외부 라벨(보관 온도 기호, CE, UDI) 확인" },
    { text: "키트 상자 압축 강도 — 출하 박스 안 적층·운송 중 상단 하중을 고려", why: "시험 강도는 ISTA 3A 원문(상단 하중 진동 조건)을 따릅니다." },
  ];

  const vol = volumetricKg(f.volumeL);
  const tertiary: PackItem[] = [
    {
      text: `출하 박스 사양 확정${f.volumeL !== null ? ` — ${t.lengthCm}×${t.widthCm}×${t.heightCm} cm (${Math.round(f.volumeL * 10) / 10} L)` : ""}${f.weightKg !== null ? `, ${f.weightKg} kg` : ""}${t.kitsPerShipper !== null ? `, 키트 ${t.kitsPerShipper}개` : ""}`,
      why: vol ? `부피 무게 약 ${vol.iata} kg(계수 6000) / ${vol.express} kg(계수 5000) — 운임은 실제 무게와 부피 무게 중 큰 값으로 매겨지는 경우가 많습니다. 계수는 운송사에 확인하세요.` : "가로·세로·높이를 입력하면 부피 무게를 계산합니다.",
    },
    { text: "골판지 등급(강도) 선정 — 적층 압축과 낙하를 견디는지 운송 시험으로 확인" },
    { text: "완충재: 낙하 충격 흡수, 키트 상자와 박스 사이 빈 공간 최소화", why: "빈 공간이 크면 내용물이 움직여 손상되고, PPWR 빈 공간 상한에도 걸립니다." },
    f.cold === true
      ? { text: "단열 박스 + 냉매(겔팩 등): 냉매 사전 조건화와 포장 배치를 SOP로 고정", why: "ISTA 7E로 여름·겨울 프로파일에서 유지 시간을 검증합니다." }
      : f.cold === false
        ? { text: "단열 박스·냉매", na: `상온 보관 제품(${f.tempRange})입니다.` }
        : { text: "단열 포장 필요 여부 — 보관 온도를 입력하면 판정됩니다" },
    f.cold === true
      ? { text: "온도 데이터로거를 출하마다(또는 대표 출하에) 동봉하고 수령 시 판독", why: "콜드체인 이탈 여부를 기록으로 남깁니다." }
      : { text: `온도 지시계(선택)${f.hotDestination ? " — 고온 지역 목적지가 있어 권장" : ""}`, why: "상온 제품도 보관 상한(℃)을 넘는 노출을 감지할 수 있습니다." },
    { text: "취급 표시(ISO 780): 이 면 위로, 깨지기 쉬움, 습기 주의 + 보관 온도 범위" },
  ];

  const plasticOuter = t.outerMaterial === "plastic" || t.outerMaterial === "mixed";
  const ppwrNa = f.eu === false ? "EU 출시가 아닙니다." : undefined;
  const ppwr: PackItem[] = [
    { text: "포장 내 납·카드뮴·수은·6가 크롬 합계 100 mg/kg 이하 — 포장재 공급사 자료로 확인", why: "기존 EU 포장지침의 중금속 제한이 PPWR로 이어집니다.", verify: true, na: ppwrNa },
    {
      text: "재활용 가능 설계: 키트 상자·출하 박스는 재활용 가능해야 함. IVD의 접촉 민감 1차 포장만 예외",
      why: "예외는 1차 포장에만 해당하고 2·3차 포장은 예외가 아닙니다. 재활용 등급 기준은 2030년부터 단계 적용되며 세부는 시행법으로 정해집니다. 예외를 쓰려면 '접촉 민감 포장'인 이유를 기술문서에 남기세요(예외는 2035년 무렵 재검토 예정).",
      verify: true, na: ppwrNa,
    },
    {
      text: f.eu === false ? "플라스틱 포장 재생원료 함량" : `플라스틱 포장 재생원료 함량 의무(2030년~)${t.primaryPlastic === true ? " — 1차 플라스틱 포장은 IVD 접촉 민감 포장 예외" : ""}${plasticOuter ? " — 키트 상자·출하 박스에 플라스틱이 있어 예외가 아닙니다" : ""}`,
      why: t.outerMaterial === "corrugated" ? "키트 상자·출하 박스가 종이·골판지라 이 의무는 1차 포장(예외) 외에는 해당이 적습니다. 완충재·테이프 등 플라스틱 부자재는 따로 확인하세요." : "재생원료 의무는 플라스틱 포장에 적용됩니다.",
      verify: true, na: ppwrNa,
    },
    { text: "포장 최소화: 기능(보호·표시)을 해치지 않는 범위에서 무게·부피를 최소화하고 근거를 기록", why: "자료마다 적용 시점 표현이 다릅니다(2026-08-12 적용 개시, 2030년까지 EN 13428 기준 평가 등). 원문으로 확인하세요.", verify: true, na: ppwrNa },
    { text: "빈 공간 비율 50% 이하 — 묶음·운송·전자상거래 포장(출하 박스가 해당)", why: "자료에 따라 2030-01-01 또는 시행법 채택 이후로 적혀 있습니다. 키트 상자와 출하 박스 치수로 비율을 계산해 두세요.", verify: true, na: ppwrNa },
    { text: "분리배출 조화 라벨(재질 표시)", why: "2028년 무렵부터 적용되지만, 일부 자료(CONAI)는 의료기기·IVD의 즉시·외부 포장을 제외한다고 봅니다. 제외 범위를 원문으로 확인하세요.", verify: true, na: ppwrNa },
    { text: "포장 적합성 평가·기술문서·EU 적합성 선언 — 포장재 공급사 자료를 받아 묶어 두기", why: "포장을 자기 이름으로 출시하는 제조자의 의무입니다. 조문 번호는 원문으로 확인하세요.", verify: true, na: ppwrNa },
  ];

  return [
    { id: "primary", title: "1차 포장 — 파우치·용기", items: primary },
    { id: "secondary", title: "2차 포장 — 키트 상자", items: secondary },
    { id: "tertiary", title: "3차 포장 — 출하 박스", items: tertiary },
    { id: "ppwr", title: "PPWR — EU 포장규정 (2026-08-12 적용)", items: ppwr },
  ];
}

