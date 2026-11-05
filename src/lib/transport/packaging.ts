// =====================================================================
// src/lib/transport/packaging.ts
// 포장 설계 체크리스트 — 1차(파우치) / 2차(키트 상자) / 3차(출하 박스) / PPWR.
// PPWR 항목은 Regulation (EU) 2025/40 관보(OJ L, 2025.1.22) 원문과 대조했다(2026-11-05).
// 원문만으로 판단이 갈리는 항목(IVD 접촉 민감 포장 예외 범위)만 verify: true.
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
    { text: "방습 배리어 파우치와 건조제로 개봉 전 안정성 유지", why: "운송 중 습도·온도가 바뀌면 스트립 성능이 바로 영향을 받아요." },
    { text: "파우치 밀봉 강도·핀홀을 운송 시험 전후로 확인", why: "떨어지거나 흔들린 뒤 밀봉이 풀리면 건조제가 제 역할을 못 해요." },
    f.liquid === true
      ? { text: "액체 시약 용기: 누액 방지 마개, 2차 밀봉(지퍼백 등), 흡수재", why: f.air ? "항공 구간은 기압이 낮아 용기 안팎 압력 차로 새기 쉬워요." : "떨어지거나 흔들린 뒤에도 새지 않아야 해요." }
      : f.liquid === false
        ? { text: "액체 시약 용기 누액 대책", na: "액체 시약이 없어요." }
        : { text: "액체 시약 용기 누액 대책 — 액체 시약 여부를 입력하면 판정됩니다", why: "완충액·대조액이 있으면 누액 시험이 필요해요." },
    { text: "1차 라벨: 로트·유효기간·보관 온도 기호(ISO 15223-1)", why: "운송 뒤에도 라벨이 읽혀야 해요(마모·습기)." },
  ];

  const secondary: PackItem[] = [
    { text: "키트 상자 안에서 구성품이 움직이지 않게 고정(인서트·칸막이)", why: "흔들릴 때 파우치끼리 쓸리거나 찢어지지 않게 해요." },
    { text: "IFU 동봉, 외부 라벨(보관 온도 기호, CE, UDI) 확인" },
    { text: "키트 상자 압축 강도 — 출하 박스 안 적층·운송 중 상단 하중을 고려", why: "시험 강도는 ISTA 3A 원문(상단 하중 진동 조건)을 따라요." },
  ];

  const vol = volumetricKg(f.volumeL);
  const tertiary: PackItem[] = [
    {
      text: `출하 박스 사양 확정${f.volumeL !== null ? ` — ${t.lengthCm}×${t.widthCm}×${t.heightCm} cm (${Math.round(f.volumeL * 10) / 10} L)` : ""}${f.weightKg !== null ? `, ${f.weightKg} kg` : ""}${t.kitsPerShipper !== null ? `, 키트 ${t.kitsPerShipper}개` : ""}`,
      why: vol ? `부피 무게 약 ${vol.iata} kg(계수 6000) / ${vol.express} kg(계수 5000) — 운임은 실제 무게와 부피 무게 중 큰 값으로 매기는 경우가 많아요. 계수는 운송사에 확인하세요.` : "가로·세로·높이를 적으면 부피 무게를 계산해 드려요.",
    },
    { text: "골판지 등급(강도) 선정 — 적층 압축과 낙하를 견디는지 운송 시험으로 확인" },
    { text: "완충재: 낙하 충격 흡수, 키트 상자와 박스 사이 빈 공간 최소화", why: "빈 공간이 크면 내용물이 움직여 망가져요. PPWR은 완충재가 채운 공간도 빈 공간으로 세니, 박스 크기를 줄이는 쪽이 먼저예요." },
    f.cold === true
      ? { text: "단열 박스 + 냉매(겔팩 등): 냉매 사전 조건화와 포장 배치를 SOP로 고정", why: "ISTA 7E로 여름·겨울 온도 조건에서 얼마나 버티는지 확인해요." }
      : f.cold === false
        ? { text: "단열 박스·냉매", na: `상온 보관 제품(${f.tempRange})이에요.` }
        : { text: "단열 포장 필요 여부 — 보관 온도를 입력하면 판정됩니다" },
    f.cold === true
      ? { text: "온도 데이터로거를 출하마다(또는 대표 출하에) 동봉하고 수령 시 기록 확인", why: "콜드체인을 벗어났는지 기록으로 남겨요." }
      : { text: `온도 지시계(선택)${f.hotDestination ? " — 고온 지역 목적지가 있어 권장" : ""}`, why: "상온 제품도 보관 상한(℃)보다 더운 곳에 놓였는지 알 수 있어요." },
    { text: "취급 표시(ISO 780): 이 면 위로, 깨지기 쉬움, 습기 주의 + 보관 온도 범위" },
  ];

  const plasticOuter = t.outerMaterial === "plastic" || t.outerMaterial === "mixed";
  const ppwrNa = f.eu === false ? "EU에 출시하지 않아요." : undefined;
  const ppwr: PackItem[] = [
    { text: "포장 내 납·카드뮴·수은·6가 크롬 농도 합계 100 mg/kg 이하 (제5조제4항) — 포장재 공급사 자료로 확인", why: "2026-08-12 적용일부터 바로 지켜야 해요.", na: ppwrNa },
    {
      text: "재활용 가능 설계 (제6조) — 2030-01-01(또는 위임법 발효 24개월 뒤 중 늦은 날)부터 재활용 등급 A·B·C, 2038-01-01부터 A·B. IVD의 접촉 민감 포장은 예외(제6조제11항 c호)",
      why: "원문 정의(제3조 제49호)는 접촉 민감 포장을 'IVDR 대상 제품에 쓰도록 한 포장'이라고만 해서, 1차 포장으로 한정하는 말이 없어요. 키트 상자·출하 박스까지 예외인지는 해석이 갈려요. 이 앱은 안전하게 2·3차 포장은 의무를 지킨다고 보고 안내해요. 예외를 쓰려면 근거를 기술문서에 남기세요. 예외는 2035-01-01까지 재검토돼요(제6조제12항).",
      verify: true, na: ppwrNa,
    },
    {
      text: f.eu === false ? "플라스틱 포장 재생원료 함량" : `플라스틱 포장 재생원료 최소 함량 (제7조) — 2030-01-01(또는 시행법 발효 3년 뒤 중 늦은 날)부터${t.primaryPlastic === true ? " — IVD의 접촉 민감 플라스틱 포장은 예외(제7조제4항 c호)" : ""}${plasticOuter ? " — 키트 상자·출하 박스에 플라스틱이 있어 확인 필요" : ""}`,
      why: t.outerMaterial === "corrugated" ? "키트 상자·출하 박스가 종이·골판지라 이 의무는 플라스틱 부분에만 해당해요. 완충재·테이프 같은 플라스틱 부자재는 따로 확인하세요." : "포장의 플라스틱 부분에 적용돼요. 최소 비율은 종류별로 달라요(예: 접촉 민감이 아닌 일반 플라스틱 포장 35%, 2040년부터 65%). 예외 범위는 위 재활용 항목과 같은 해석 문제가 있어요.",
      verify: true, na: ppwrNa,
    },
    { text: "포장 최소화 (제10조) — 2030-01-01까지 기능(보호·표시)을 해치지 않는 범위에서 무게·부피를 최소화", why: "부록 IV의 성능 기준으로 평가하고, 더 줄일 수 없는 이유와 시험·근거를 기술문서(부록 VII)에 남겨요(제10조제4항). 새 조화 표준이 나올 때까지 EN 13428:2004를 쓸 수 있어요(전문 60).", na: ppwrNa },
    { text: "빈 공간 비율 50% 이하 (제24조) — 묶음·운송·전자상거래 포장(출하 박스가 해당), 2030-01-01(또는 시행법 발효 3년 뒤 중 늦은 날)부터", why: "비율 = (출하 박스 부피 − 안에 든 키트 상자 부피) ÷ 출하 박스 부피예요. 완충재(에어캡·스펀지·종이 등)가 채운 공간도 빈 공간으로 셈해요(제24조제3항). 계산 방법 시행법은 2028-02-12까지 나와요.", na: ppwrNa },
    { text: "분리배출 조화 라벨(재질 표시) (제12조) — 2028-08-12(또는 시행법 발효 24개월 뒤 중 늦은 날)부터", why: "운송 포장(출하 박스)은 전자상거래 포장이 아니면 대상이 아니에요. IVD의 즉시·외부 포장은 IVDR 표시 사항 때문에 공간이 없을 때만 빠져요(제12조제11항). 공간이 있으면 라벨을 넣어야 해요.", na: ppwrNa },
    { text: "적합성 평가·기술문서·EU 적합성 선언 (제15조제2항) — 부록 VII 절차(제38조)로 평가하고, 선언서는 부록 VIII 양식(제39조)", why: "자기 이름·상표로 포장된 제품을 내는 자가 PPWR의 제조자예요(제3조 제13호). 일회용 포장은 출시 후 5년간 문서를 보관해요(제15조제3항). 포장재 공급사 자료를 받아 묶어 두세요.", na: ppwrNa },
  ];

  return [
    { id: "primary", title: "1차 포장 — 파우치·용기", items: primary },
    { id: "secondary", title: "2차 포장 — 키트 상자", items: secondary },
    { id: "tertiary", title: "3차 포장 — 출하 박스", items: tertiary },
    { id: "ppwr", title: "PPWR — EU 포장규정 (2026-08-12 적용)", items: ppwr },
  ];
}

