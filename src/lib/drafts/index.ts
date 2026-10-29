// =====================================================================
// src/lib/drafts/index.ts
// P1 초안 — 기기 설명서·라벨·IFU·위험관리 계획의 본문 칸을 스펙으로 쓴다. 순수 함수.
// 수치(위험 P·S, 반응 시간, 검체 부피, 성능 값)는 지어내지 않고 [__]·[실험 후 입력]으로 남긴다.
// ISO 15223-1 심볼은 이름·용도만 쓴다 (그림·원문 복제 없음).
// =====================================================================

import type { ProductSpec } from "../../data/spec/types";
import type { ClassResult } from "../rules/classify";
import type { Applicability } from "../rules/applicability";
import { gsprChecklist } from "../gspr";
import { leafById } from "../../data/docTree";

const SPECIMEN: Record<string, string> = { urine: "소변", "capillary-blood": "손끝 혈액(모세혈)", "venous-blood": "정맥혈(혈청·혈장)", saliva: "타액", swab: "면봉 채취 검체", other: "검체" };

const isLay = (s: ProductSpec) => s.user === "lay" || s.user === "both";
const hasDevice = (s: ProductSpec) => s.formFactor !== null && s.formFactor !== "strip-only";
const hasSw = (s: ProductSpec) => !!s.software.hasApp || s.result.readout === "app" || s.result.readout === "reader" || hasDevice(s);
const method = (s: ProductSpec) => s.assay?.method ?? null;
const analyteName = (s: ProductSpec) => s.analyte.name ?? "[분석물 — 스펙 미입력]";
const specimenName = (s: ProductSpec) => (s.specimen ? SPECIMEN[s.specimen] : "[검체 — 스펙 미입력]");
/** 받침에 맞는 조사 — "황체형성호르몬(LH)" 처럼 괄호로 끝나면 괄호 앞 글자로 본다 */
export function josa(word: string, withBatchim: string, without: string): string {
  const base = word.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const ch = base.charCodeAt(base.length - 1);
  if (ch >= 0xac00 && ch <= 0xd7a3) return word + ((ch - 0xac00) % 28 ? withBatchim : without);
  return `${word}${withBatchim}(${without})`;
}
const bullets = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");
const esc = (t: string) => t.replace(/\|/g, "/");

// ── 작동 원리 ────────────────────────────────────────────────
export function principle(s: ProductSpec): string | null {
  const m = method(s);
  if (!m) return null;
  const a = analyteName(s);
  const sp = specimenName(s);
  const readBy = s.result.readout === "reader" ? "전용 리더기가 발색 강도를 읽어 결과를 표시한다" : s.result.readout === "app" ? "스마트폰 앱이 카메라로 발색을 읽어 결과를 표시한다" : "사용자가 눈으로 선의 유무를 판독한다";
  switch (m) {
    case "lateral-flow":
      return [
        `측방유동 면역크로마토그래피. ${josa(sp, "을", "를")} 검체 패드에 적용하면 모세관 현상으로 멤브레인을 따라 이동한다.`,
        `검체 속 ${josa(a, "이", "가")} 표지 항체(예: 금 나노입자 결합 항체 [표지 물질 — 확인 필요])와 결합하고, 시험선(T)의 포획 항체에 붙어 발색한다.`,
        `대조선(C)은 검체가 정상적으로 이동했는지 확인하는 절차 대조로, ${a} 유무와 관계없이 발색해야 한다.`,
        `${readBy}.`,
      ].join("\n");
    case "fluorescence":
      return `형광 면역분석. ${sp} 속 ${josa(a, "이", "가")} 형광 표지 항체와 결합해 포획 영역에 모이고, ${hasDevice(s) ? "기기" : "판독기"}가 여기광을 비춰 형광 세기를 측정한다. 형광 세기와 ${a} 농도의 관계(검량)는 [검량 방법 — 확인 필요]로 정한다.`;
    case "electrochemical":
      return `전기화학 바이오센서. 전극 위의 인식 물질(효소·항체 [확인 필요])이 ${sp} 속 ${josa(a, "과", "와")} 반응해 생긴 전류·전위 변화를 ${hasDevice(s) ? "기기" : "측정부"}가 측정해 결과로 환산한다.`;
    case "molecular":
      return `분자진단. ${sp}에서 핵산을 추출·증폭(PCR 또는 등온증폭 [방식 확인 필요])하고, 표적 서열 특이 프로브의 신호로 ${a}의 유무${s.result.kind === "quantitative" ? "·양" : ""}을 판정한다.`;
    default:
      return `[작동 원리 — 검사 방식이 '기타'라 직접 작성 필요] 검체: ${sp}, 분석물: ${a}`;
  }
}

// ── 라벨 심볼·경고 ───────────────────────────────────────────
export function labelSymbols(s: ProductSpec, c: ClassResult): string {
  const rows: [string, string][] = [
    ["체외진단 의료기기 (IVD)", "체외진단용임을 표시"],
    ["제조자", "제조자 이름·주소와 함께"],
    ["배치 코드 (LOT)", "로트 번호"],
    ["카탈로그 번호 (REF)", "제품 번호"],
    ["사용 기한", "유효기간 날짜"],
    ["사용설명서 참조", "IFU를 읽으라는 표시"],
  ];
  if (s.storage.tempMinC !== null && s.storage.tempMaxC !== null) rows.push(["온도 제한", `보관 ${s.storage.tempMinC}–${s.storage.tempMaxC}℃`]);
  rows.push(["재사용 금지", "1회용 스트립·카세트"]);
  if (s.sterile) rows.push(["멸균 (방법별 기호)", "멸균 방법 [확인 필요]"]);
  rows.push(["검사 수 표시 (n개 검사용)", "키트당 검사 수"]);
  if (s.specimen === "capillary-blood") rows.push(["날카로운 물체 주의 / 생물학적 위험", "채혈침"]);
  if (s.identity.manufacturerIsEU === false) rows.push(["EU 대리인 (EC REP)", "EU 대리인 이름·주소와 함께"]);
  if (isLay(s)) rows.push(["자가검사용 표시", "일반인 자가검사 기기"]);
  if (s.markets?.includes("EU")) rows.push(["CE 마크", c.value && !(c.value === "A" && s.sterile !== true) ? "NB 식별번호 [____] 함께 표시" : "NB 번호 없음 (Class A 비멸균)"]);
  if (s.identity.basicUdiDi !== null || s.markets?.includes("EU")) rows.push(["UDI", "UDI 캐리어 (GS1 DataMatrix 등)"]);
  if (hasDevice(s)) rows.push(["전기·전자 폐기물 분리 배출 (WEEE)", "배터리·전자부품 포함 기기 [EU WEEE 확인 필요]"]);
  return [
    "| 심볼 (ISO 15223-1 — 기호 번호·도안은 원문 확인 필요) | 쓰는 이유 |",
    "|---|---|",
    ...rows.map(([a, b]) => `| ${a} | ${b} |`),
  ].join("\n");
}

function warnings(s: ProductSpec): string[] {
  const w = [
    "체외진단용으로만 사용하십시오.",
    "유효기간이 지난 제품은 사용하지 마십시오. 파우치가 손상되었으면 사용하지 마십시오.",
    "1회용입니다. 다시 사용하지 마십시오.",
    `사용한 ${s.specimen === "urine" ? "스트립·검체 용기" : "검사 구성품과 검체"}는 감염 위험이 있는 폐기물로 보고 지역 규정에 따라 버리십시오.`,
  ];
  if (s.storage.tempMinC !== null && s.storage.tempMaxC !== null) w.push(`${s.storage.tempMinC}–${s.storage.tempMaxC}℃에서 보관하고 얼리지 마십시오.`);
  if (s.storage.openedStabilityMin !== null) w.push(`파우치를 연 뒤 ${s.storage.openedStabilityMin}분 안에 사용하십시오.`);
  if (isLay(s)) w.push("어린이의 손이 닿지 않는 곳에 보관하십시오.", "검사 결과만으로 의학적 결정을 내리지 말고, 결과가 예상과 다르면 의사와 상담하십시오.");
  if (s.specimen === "capillary-blood") w.push("채혈침은 날카롭습니다. 한 번만 쓰고 뚜껑을 씌워 버리십시오.");
  if (hasDevice(s)) w.push("기기를 물에 담그거나 떨어뜨리지 마십시오. 지정된 배터리·전원만 사용하십시오.");
  if (s.software.hasApp || s.result.readout === "app") w.push("앱이 최신 버전인지 확인하십시오. 앱이 결과를 표시하지 못하면 검사를 반복하지 말고 사용설명서의 문제 해결 절차를 따르십시오.");
  return w;
}

export const labelWarnings = (s: ProductSpec) => bullets(warnings(s)) + "\n(스펙으로 쓴 초안 — 위험관리 결과와 맞춰 검토 필요)";

// ── IFU ──────────────────────────────────────────────────────
export function ifuSteps(s: ProductSpec): string | null {
  if (!s.specimen && !s.formFactor) return null;
  const sp = specimenName(s);
  const collect: Record<string, string> = {
    urine: "깨끗한 용기에 소변을 받거나, 스트립 끝을 소변 줄기에 [__초] 대거나 용기의 소변에 [__초] 담급니다. 하루 중 검사 시간은 [권장 시간 — 확인 필요].",
    "capillary-blood": "손을 씻고 말린 뒤 채혈침으로 손끝을 찌르고, 첫 방울은 닦아 내고 다음 방울 [__µL]를 검체 홈에 떨어뜨립니다.",
    "venous-blood": "채혈한 혈청·혈장 [__µL]를 피펫으로 검체 홈에 떨어뜨립니다.",
    saliva: "[__분] 동안 먹거나 마시지 않은 뒤, 수집기에 타액을 [__µL / 표시선까지] 모읍니다.",
    swab: "면봉으로 [채취 부위 — 확인 필요]를 [__회] 문지르고, 추출 용액 튜브에 넣어 [__회] 돌린 뒤 [__방울] 떨어뜨립니다.",
  };
  const steps = [
    "준비: 검사 키트와 검체를 실온([__–__℃])에 [__분] 둡니다. 파우치를 열어 구성품을 확인합니다.",
    ...(hasDevice(s) ? [`기기 준비: 전원을 켜고 ${s.software.hasApp ? "앱과 연결한 뒤 " : ""}준비 완료 표시를 확인합니다.`] : []),
    `검체 채취·적용 (${sp}): ${s.specimen ? collect[s.specimen] ?? "[채취 방법 — 직접 작성]" : "[검체 — 스펙 미입력]"}`,
    `${s.formFactor === "strip-reader" ? "스트립을 리더기에 꽂고 " : ""}평평한 곳에 두고 [__분] 기다립니다. [__분]이 지난 뒤의 결과는 읽지 않습니다.`,
    `결과 판독: ${s.result.readout === "app" ? "앱 안내에 따라 결과를 확인합니다." : s.result.readout === "reader" || hasDevice(s) ? "기기 화면에 표시된 결과를 확인합니다." : "아래 결과 판독 기준에 따라 선을 확인합니다."}`,
    "사용한 구성품을 경고에 따라 버립니다.",
  ];
  return steps.map((x, i) => `${i + 1}. ${x}`).join("\n") + "\n(시간·부피는 분석 성능·사용적합성 시험 결과로 확정)";
}

export function ifuReading(s: ProductSpec): string | null {
  const k = s.result.kind;
  if (!k) return null;
  const a = analyteName(s);
  if (s.result.readout === "app" || s.result.readout === "reader") {
    return k === "qualitative"
      ? `${s.result.readout === "app" ? "앱이" : "리더기가"} '양성 / 음성 / 무효' 중 하나를 표시합니다.\n- 무효: 검체 부족·대조 신호 없음 등 — 새 검사로 다시 하십시오.\n판정 기준(cut-off ${s.analyte.cutoffValue ?? "[__]"} ${s.analyte.cutoffUnit ?? ""})과 무효 조건은 [소프트웨어 사양 문서] 참조`
      : `${s.result.readout === "app" ? "앱이" : "리더기가"} ${a} 측정값과 단위를 표시합니다.\n- 측정범위 [실험 후 입력] 밖이면 '범위 미만 / 초과'로 표시합니다.\n- 오류 코드와 조치: [오류 코드 표 — 소프트웨어 사양]`;
  }
  if (k === "qualitative" && method(s) === "lateral-flow") {
    return [
      `- 양성: 대조선(C)과 시험선(T)이 모두 보입니다. ${s.analyte.preset === "LH" ? "시험선이 대조선과 같거나 더 진하면 LH 급증으로 봅니다. [판정 기준 — 확인 필요]" : "시험선이 흐려도 양성입니다. [판정 기준 — 확인 필요]"}`,
      `- 음성: 대조선(C)만 보입니다.${s.analyte.preset === "LH" ? " 시험선이 대조선보다 흐린 경우도 음성입니다. [판정 기준 — 확인 필요]" : ""}`,
      "- 무효: 대조선(C)이 보이지 않습니다. 검체량 부족이나 절차 오류일 수 있으니 새 스트립으로 다시 하십시오.",
      `(Cut-off: ${s.analyte.cutoffValue ?? "[__]"} ${s.analyte.cutoffUnit ?? ""})`,
    ].join("\n");
  }
  if (k === "quantitative" || k === "semi-quantitative") return `측정값을 [단위]로 읽습니다. 측정범위 [실험 후 입력] 밖이면 '범위 밖'으로 보고합니다. ${k === "semi-quantitative" ? "등급 구간: [실험 후 입력]" : ""}`.trim();
  return "[결과 판독 기준 — 검사 방식에 맞게 직접 작성]";
}

export function ifuLimitations(s: ProductSpec): string {
  const l = [
    "이 검사 결과만으로 진단하지 마십시오. 증상과 다른 검사 결과를 함께 고려해야 합니다.",
    "간섭 물질·교차반응 물질: [분석 성능 시험 결과 참조]",
    "고농도에서 결과가 낮게 나올 수 있는지(hook 효과): [분석 성능 시험 결과 참조]",
  ];
  if (s.analyte.preset === "LH") l.push("LH 급증은 배란이 일어났음을 확인하지 않습니다. 배란 여부 확인이나 피임 목적으로 사용하지 마십시오. (검토 필요)", "다낭성 난소 증후군·폐경 전후·일부 약물(불임 치료제 등)은 결과에 영향을 줄 수 있습니다. (검토 필요)");
  if (s.analyte.preset === "hCG") l.push("임신 초기에는 hCG 농도가 낮아 음성이 나올 수 있습니다. 며칠 뒤 다시 검사하십시오. (검토 필요)", "hCG를 만드는 종양·최근 유산·hCG 주사는 양성을 낼 수 있습니다. (검토 필요)");
  if (s.intendedPurpose.outOfScope) l.push(`다음 용도로 사용하지 마십시오: ${s.intendedPurpose.outOfScope}`);
  return bullets(l);
}

export const ifuWarnings = (s: ProductSpec) => bullets(warnings(s));

// ── 위험관리 ─────────────────────────────────────────────────
export interface Hazard {
  id: string;
  hazard: string;
  situation: string;
  harm: string;
  controls: string;
  verify: string[];
  gspr: number[];
  useError?: boolean;
}

function decisionHarm(s: ProductSpec): { fp: string; fn: string } {
  if (s.analyte.preset === "LH") return { fp: "가임기를 잘못 알아 임신 시도 시기를 놓침 — 임신 지연·정서적 부담", fn: "LH 급증을 놓쳐 가임기를 놓침 — 임신 지연·정서적 부담" };
  if (s.analyte.preset === "hCG") return { fp: "임신으로 잘못 알고 불필요한 조치·진료 지연", fn: "임신을 모른 채 약물·음주·방사선 노출, 산전 관리 지연" };
  const d = s.intendedPurpose.clinicalDecision;
  return d
    ? { fp: `'${d}' 판단을 잘못 내림 — 위해 [검토 필요]`, fn: `'${d}' 판단을 놓침 — 위해 [검토 필요]` }
    : { fp: "[임상적 결정 — 스펙 미입력]", fn: "[임상적 결정 — 스펙 미입력]" };
}

export function hazards(s: ProductSpec): Hazard[] {
  const h: Omit<Hazard, "id">[] = [];
  const harm = decisionHarm(s);
  h.push({ hazard: "위양성 결과", situation: `${josa(analyteName(s), "이", "가")} cut-off 미만인데 양성 표시`, harm: harm.fp, controls: "cut-off 근처 정밀도 확인, 교차반응 시험, IFU에 결과 한계 표시", verify: ["analytical-performance", "clinical-performance", "ifu"], gspr: [1, 9] });
  h.push({ hazard: "위음성 결과", situation: `${josa(analyteName(s), "이", "가")} cut-off 이상인데 음성 표시`, harm: harm.fn, controls: "검출한계·hook 효과 시험, 재검사 안내", verify: ["analytical-performance", "clinical-performance", "ifu"], gspr: [1, 9] });
  h.push({ hazard: "간섭·교차반응", situation: "약물·내인성 물질·유사 분석물이 결과를 바꿈", harm: "위양성·위음성과 같은 위해", controls: "간섭·교차반응 시험, IFU에 물질 목록 표시", verify: ["analytical-performance", "ifu"], gspr: [9] });
  if (s.result.kind === "qualitative") h.push({ hazard: "고농도 hook 효과", situation: "매우 높은 농도에서 신호가 약해짐", harm: "위음성과 같은 위해", controls: "고농도 시료 시험, 필요 시 IFU 한계 표시", verify: ["analytical-performance"], gspr: [9] });
  h.push({ hazard: "보관·운송 중 성능 저하", situation: "고온·습기·동결 노출 후 사용", harm: "위양성·위음성", controls: "안정성·운송 시험, 건조제 포장, 온도 표시", verify: ["stability-study", "transport-validation"], gspr: [6, 7] });
  h.push({ hazard: "유효기간 경과 사용", situation: "만료된 제품 사용", harm: "위양성·위음성", controls: "라벨 사용기한, IFU 경고", verify: ["labelling-spec", "stability-study"], gspr: [6, 20] });
  if (isLay(s)) {
    h.push({ hazard: "사용 오류 — 검체 채취·적용", situation: "검체량 부족·적용 시간 오류", harm: "무효·위음성", controls: "그림 위주 IFU, 사용적합성 시험", verify: ["usability-file", "ifu"], gspr: [5, 19], useError: true });
    h.push({ hazard: "사용 오류 — 판독 시간", situation: "정해진 시간 전·후에 판독", harm: "위양성·위음성", controls: "IFU 시간 강조, 타이머 안내", verify: ["usability-file", "ifu"], gspr: [5, 19], useError: true });
    h.push({ hazard: "사용 오류 — 결과 해석", situation: "흐린 선·무효 결과를 잘못 해석", harm: "잘못된 판단", controls: "판독 예시 그림, 이해도 평가", verify: ["usability-file", "ifu"], gspr: [5, 19, 20], useError: true });
  }
  if (s.specimen) h.push({ hazard: "생물학적 위험", situation: `${specimenName(s)} 취급·폐기`, harm: "감염", controls: "폐기 안내, 검체 접촉 최소화 설계", verify: ["ifu", "labelling-spec"], gspr: [11] });
  if (s.specimen === "capillary-blood") h.push({ hazard: "날카로운 구성품 (채혈침)", situation: "채혈·폐기 중 찔림", harm: "자상·감염", controls: "안전 채혈침, 1회용, 폐기 안내", verify: ["biocompatibility", "ifu"], gspr: [10, 18] });
  if (hasDevice(s)) h.push({ hazard: "전기·배터리·EMC", situation: "배터리 과열·전자파 간섭", harm: "화상·오작동", controls: "전기안전·EMC 시험", verify: ["electrical-safety-emc"], gspr: [13, 17, 18] });
  if (hasSw(s)) h.push({ hazard: "소프트웨어 오판정", situation: "판독 알고리즘·펌웨어 오류", harm: "잘못된 결과 표시", controls: "SW 수명주기 검증, 판독 알고리즘 밸리데이션", verify: ["sw-validation"], gspr: [16] });
  if (s.software.hasApp || s.result.readout === "app") h.push({ hazard: "사이버보안·개인정보", situation: "앱·통신 해킹, 결과 유출·변조", harm: "개인정보 침해·잘못된 결과", controls: "보안 위험 분석, 암호화, 업데이트 관리", verify: ["cybersecurity"], gspr: [16] });
  return h.map((x, i) => ({ ...x, id: `R-${String(i + 1).padStart(3, "0")}` }));
}

const title = (id: string) => leafById(id)?.title ?? id;
const keep = (excluded: Set<string>) => (ids: string[]) => ids.filter((i) => !excluded.has(i));

export function hazardTable(s: ProductSpec, docSet: Applicability[]): string {
  const k = keep(new Set(docSet.filter((a) => a.status === "excluded").map((a) => a.leafId)));
  const lines = [
    "| ID | 위해요인 | 위험상황 | 위해 | P | S | 통제수단 (제안) | 검증 참조 |",
    "|---|---|---|---|---|---|---|---|",
    ...hazards(s).map((h) => `| ${h.id} | ${h.hazard} | ${esc(h.situation)} | ${esc(h.harm)} | [__] | [__] | ${esc(h.controls)} | ${k(h.verify).map(title).join(", ") || "[근거 문서 지정 필요]"} |`),
    "| [추가] | [____] | [____] | [____] | [__] | [__] | [____] | [____] |",
  ];
  lines.push("", "P(발생 가능성)·S(심각도)는 위험관리 팀이 회사 기준으로 매긴다. 스펙으로 고른 위해요인 초안 — 검토 필요.");
  return lines.join("\n");
}

export function riskGsprTrace(s: ProductSpec, docSet: Applicability[]): string {
  const hz = hazards(s);
  const rows = gsprChecklist(s, docSet).filter((r) => r.verdict !== "na");
  return [
    "| GSPR 조항 | 요구사항 요약 (원문 확인 필요) | 판정 | 관련 위험 | 근거 문서 |",
    "|---|---|---|---|---|",
    ...rows.map((r) => {
      const ids = hz.filter((h) => h.gspr.includes(r.no)).map((h) => h.id);
      const rel = [1, 2, 3, 4, 8].includes(r.no) ? "전체 위험 (R-001~)" : ids.join(", ") || "—";
      return `| §${r.no} | ${esc(r.title)} | ${r.verdict === "check" ? "[확인 필요]" : "해당"} | ${rel} | ${r.evidence.map(title).join(", ") || "[근거 문서 지정 필요]"} |`;
    }),
  ].join("\n");
}

export function usabilityScope(s: ProductSpec): string | null {
  if (s.user === null) return null;
  const lay = isLay(s);
  const near = s.environment === "near-patient";
  const box = (b: boolean) => (b ? "[x]" : "[ ]");
  const ue = hazards(s).filter((h) => h.useError);
  return [
    `적용 여부: ${box(lay)} 자가검사  ${box(near)} 근접검사  ${box(!lay && !near)} 해당 없음 (전문가용)`,
    "",
    ue.length ? "주요 사용 오류 위험 (위험 분석 표와 연결):" : "일반인 사용 오류 위험 없음 — 전문가용 사용 환경 기준으로만 평가",
    ...ue.map((h) => `- ${h.id} ${h.hazard}: ${h.situation} — 완화: ${h.controls}`),
    "",
    `IEC 62366-1 사용적합성 파일 참조: ${lay || near ? "[위치]" : "해당 시"}`,
  ].join("\n");
}

/** 문서 토큰 묶음 */
export function draftTokens(s: ProductSpec, c: ClassResult, docSet: Applicability[]): Record<string, string | null> {
  return {
    principle: principle(s),
    labelSymbols: labelSymbols(s, c),
    labelWarnings: labelWarnings(s),
    ifuSteps: ifuSteps(s),
    ifuReading: ifuReading(s),
    ifuLimitations: ifuLimitations(s),
    ifuWarnings: ifuWarnings(s),
    hazardTable: hazardTable(s, docSet),
    riskGsprTrace: riskGsprTrace(s, docSet),
    usabilityScope: usabilityScope(s),
  };
}
