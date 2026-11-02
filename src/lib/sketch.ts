// =====================================================================
// src/lib/sketch.ts
// 개념 스케치(산업디자인 스케치) 모델 — 스펙에서 제품 형태·부품 콜아웃·사용 순서 3컷을 정한다. 순수 함수.
// 치수·시간은 지어내지 않는다: [__] mm, [__]분 — 시험 후 확정.
// =====================================================================

import type { ProductSpec } from "../data/spec/types";

export type SketchKind = "midstream" | "cassette" | "reader" | "meter" | "poct" | "analyzer";
export type PartId =
  | "tip" | "cap" | "window" | "lines" | "grip" | "well"
  | "slot" | "screen" | "button" | "port" | "strip" | "drawer" | "touch" | "reagents" | "rack" | "phone";
export type ApplyKind = "urine" | "blood" | "swab" | "saliva" | "pipette";
export type ReadKind = "visual" | "reader" | "app";

export interface SketchModel {
  kind: SketchKind;
  phone: boolean;
  formMissing: boolean;
  title: string;
  subtitle: string;
  resultText: string;
  quantitative: boolean;
  callouts: { part: PartId; label: string }[];
  story: { title: string; text: string }[];
  apply: ApplyKind;
  read: ReadKind;
}

const KIND_LABEL: Record<SketchKind, string> = {
  midstream: "막대형 테스트 스틱 (소변 줄기에 대는 형태)",
  cassette: "테스트 카세트 (육안 판독)",
  reader: "리더기 + 테스트 카세트",
  meter: "손에 쥐는 측정기 + 스트립",
  poct: "탁상형 POCT 기기 + 카트리지",
  analyzer: "검사실 자동 분석 장비",
};

const CALLOUTS: Record<SketchKind, { part: PartId; label: string }[]> = {
  midstream: [
    { part: "tip", label: "흡수 심지 — 소변을 묻히는 곳" },
    { part: "window", label: "결과창" },
    { part: "lines", label: "C선(대조) · T선(시험)" },
    { part: "grip", label: "손잡이" },
    { part: "cap", label: "캡 — 검사 후 심지를 덮음" },
  ],
  cassette: [
    { part: "well", label: "검체창 (S)" },
    { part: "window", label: "결과창" },
    { part: "lines", label: "C선(대조) · T선(시험)" },
  ],
  reader: [
    { part: "screen", label: "결과 화면" },
    { part: "button", label: "전원·시작 버튼" },
    { part: "slot", label: "카세트 슬롯" },
    { part: "well", label: "검체창 (S)" },
  ],
  meter: [
    { part: "screen", label: "결과 화면" },
    { part: "button", label: "조작 버튼" },
    { part: "port", label: "스트립 포트" },
    { part: "strip", label: "검사 스트립 — 끝에 검체" },
  ],
  poct: [
    { part: "touch", label: "터치 화면" },
    { part: "drawer", label: "카트리지 서랍" },
    { part: "button", label: "전원 버튼" },
  ],
  analyzer: [
    { part: "screen", label: "조작 화면" },
    { part: "reagents", label: "시약 칸" },
    { part: "rack", label: "검체 랙" },
  ],
};

export function sketchKind(s: ProductSpec): SketchKind {
  switch (s.formFactor) {
    case "strip-reader": return "reader";
    case "personal-device": return "meter";
    case "poct": return "poct";
    case "lab-analyzer": return "analyzer";
    default: {
      const lay = s.user === "lay" || s.user === "both";
      return s.specimen === "urine" && lay ? "midstream" : "cassette";
    }
  }
}

const applyOf = (s: ProductSpec): ApplyKind =>
  s.specimen === "urine" ? "urine" : s.specimen === "capillary-blood" ? "blood" : s.specimen === "swab" ? "swab" : s.specimen === "saliva" ? "saliva" : "pipette";

const APPLY_TEXT: Record<ApplyKind, [string, string]> = {
  urine: ["소변 묻히기", "흡수 심지를 소변 줄기에 대거나 받은 소변에 담금 ([__]초)"],
  blood: ["손끝 혈액 한 방울", "채혈침으로 찌르고 다음 방울 [__]µL를 검체창에"],
  swab: ["면봉 채취 → 용액", "면봉을 추출 용액에 돌린 뒤 [__]방울 떨어뜨림"],
  saliva: ["타액 모으기", "수집기에 표시선까지 모아 검체창에"],
  pipette: ["검체 떨어뜨리기", "피펫으로 [__]µL를 검체창에"],
};

export function sketchModel(s: ProductSpec): SketchModel {
  const kind = sketchKind(s);
  const phone = !!s.software.hasApp || s.result.readout === "app";
  const quantitative = s.result.kind === "quantitative" || s.result.kind === "semi-quantitative";
  const resultText = quantitative ? `측정값 ${s.analyte.cutoffUnit ?? "[단위]"}` : "양성 / 음성";
  const device = kind === "reader" || kind === "meter" || kind === "poct" || kind === "analyzer";
  const read: ReadKind = s.result.readout === "app" ? "app" : device || s.result.readout === "reader" ? "reader" : "visual";
  const apply = applyOf(s);
  const callouts = [...CALLOUTS[kind], ...(phone ? [{ part: "phone" as PartId, label: "앱 — 결과 확인·기록" }] : [])];
  const readText: Record<ReadKind, [string, string]> = {
    visual: ["결과 보기", quantitative ? "색 비교표와 견줘 읽음" : "C선만 보이면 음성, T선도 보이면 양성, C선이 없으면 무효"],
    reader: ["결과 보기", `${kind === "meter" ? "측정기" : "기기"} 화면에 '${resultText}' 표시`],
    app: ["앱으로 확인", `앱 카메라로 결과창을 찍으면 '${resultText}' 표시`],
  };
  return {
    kind,
    phone,
    formMissing: !s.formFactor,
    title: s.identity.productName ?? "제품명 미입력",
    subtitle: [s.analyte.name, KIND_LABEL[kind] + (s.formFactor ? "" : " — 형태 미입력")].filter(Boolean).join(" · "),
    resultText,
    quantitative,
    callouts,
    apply,
    read,
    story: [
      { title: APPLY_TEXT[apply][0], text: APPLY_TEXT[apply][1] },
      { title: "기다리기", text: `${kind === "reader" ? "카세트를 리더기에 꽂고 " : ""}[__]분 — 시험 후 확정` },
      { title: readText[read][0], text: readText[read][1] },
    ],
  };
}
