// =====================================================================
// src/data/projectSchedule.ts
// 프로젝트 일정 관리 — 인증별 마일스톤 날짜를 localStorage에 저장
// 저장 키: ivdr-wiki-schedule
// =====================================================================

export interface Milestone {
  key: string;
  label: string;
  hint: string;
  certType: "ivdr" | "iso13485" | "ivdd" | "mdsap";
}

export const MILESTONES: Milestone[] = [
  // IVDR
  { key: "ivdr_kickoff",       label: "IVDR 프로젝트 킥오프",       hint: "인증 준비를 공식으로 시작하는 날이에요",          certType: "ivdr" },
  { key: "ivdr_classify",      label: "제품 등급 확정",              hint: "Class A/B/C/D 중 등급을 정하는 날이에요",       certType: "ivdr" },
  { key: "ivdr_nb_contract",   label: "NB 계약 체결",                hint: "NB(인증기관)와 계약서에 서명하는 날이에요",           certType: "ivdr" },
  { key: "ivdr_tech_doc",      label: "기술문서 초안 완성",           hint: "Annex II/III 기술문서 초안을 마무리하는 날이에요",    certType: "ivdr" },
  { key: "ivdr_submission",    label: "NB 제출",                     hint: "기술문서를 NB에 공식으로 내는 날이에요",            certType: "ivdr" },
  { key: "ivdr_audit",         label: "NB 심사",                     hint: "NB가 현장 심사를 하러 오는 날이에요",     certType: "ivdr" },
  { key: "ivdr_cert",          label: "CE 인증 취득 목표",            hint: "CE 마킹 인증서를 받으려는 목표일이에요",         certType: "ivdr" },

  // ISO 13485
  { key: "iso_gap",            label: "갭 분석 완료",                hint: "지금 QMS(품질경영시스템)와 13485:2016의 차이를 살펴봐요",     certType: "iso13485" },
  { key: "iso_doc_complete",   label: "문서 정비 완료",               hint: "절차서·QM(품질 매뉴얼)을 새로 쓰거나 고치는 일을 마쳐요",           certType: "iso13485" },
  { key: "iso_internal_audit", label: "내부심사",                    hint: "ISO 13485 내부심사를 하는 날이에요",          certType: "iso13485" },
  { key: "iso_mgmt_review",    label: "경영 검토",                   hint: "인증 바로 전에 여는 경영 검토 회의예요",           certType: "iso13485" },
  { key: "iso_cert_audit",     label: "인증심사 (Stage 1/2)",         hint: "CB(인증기관)가 심사하러 오는 날이에요",           certType: "iso13485" },
  { key: "iso_cert",           label: "ISO 13485 인증 취득",          hint: "인증서를 받으려는 목표일이에요",                 certType: "iso13485" },

  // IVDD
  { key: "ivdd_doc_review",    label: "기존 기술문서 검토 완료",       hint: "98/79/EC 기기 파일이 지금 어떤 상태인지 살펴봐요",        certType: "ivdd" },
  { key: "ivdd_doc_update",    label: "기술문서 갱신 완료",            hint: "DoC(적합성 선언서)·기술문서를 최신으로 고쳐요",               certType: "ivdd" },
  { key: "ivdd_conformity",    label: "적합성 평가 완료",              hint: "Annex IV/V/VI/VII 절차를 마치는 날이에요",        certType: "ivdd" },
  { key: "ivdd_ivdr_target",   label: "IVDR 전환 목표일",             hint: "IVDR 체계로 옮기기를 마치려는 목표일이에요",         certType: "ivdd" },

  // MDSAP
  { key: "mdsap_gap",          label: "갭 분석 완료",                hint: "7개 챕터를 기준으로 차이를 살펴보는 일을 마쳐요",            certType: "mdsap" },
  { key: "mdsap_ao_select",    label: "AO 선정",                     hint: "AO(심사기관)를 최종으로 고르는 날이에요",             certType: "mdsap" },
  { key: "mdsap_ao_contract",  label: "AO 계약 체결",                hint: "AO(심사기관)와 계약서에 서명하는 날이에요",               certType: "mdsap" },
  { key: "mdsap_stage1",       label: "Stage 1 심사",                hint: "문서를 살펴보는 심사(Desk Review)예요",            certType: "mdsap" },
  { key: "mdsap_stage2",       label: "Stage 2 심사",                hint: "현장에 와서 하는 심사(On-site Audit)예요",          certType: "mdsap" },
  { key: "mdsap_cert",         label: "MDSAP 인증 취득",             hint: "MDSAP 인증서를 받으려는 목표일이에요",           certType: "mdsap" },
];

export const CERT_META: Record<string, { label: string; colorVar: string; tintVar: string }> = {
  ivdr:     { label: "IVDR",        colorVar: "--accent",  tintVar: "--accent-weak" },
  iso13485: { label: "ISO 13485",   colorVar: "--p3",      tintVar: "--p3-tint"    },
  ivdd:     { label: "IVDD",        colorVar: "--p2",      tintVar: "--p2-tint"    },
  mdsap:    { label: "MDSAP",       colorVar: "--p4",      tintVar: "--p4-tint"    },
};

export type ScheduleStore = Record<string, string>; // key → "YYYY-MM-DD"

const STORAGE_KEY = "ivdr-wiki-schedule";

export function loadSchedule(): ScheduleStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ScheduleStore;
  } catch {
    return {};
  }
}

export function saveSchedule(store: ScheduleStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getScheduleForCert(store: ScheduleStore, certType: string): Array<{ milestone: Milestone; date: string }> {
  return MILESTONES
    .filter((m) => m.certType === certType)
    .map((m) => ({ milestone: m, date: store[m.key] ?? "" }))
    .filter((item) => item.date !== "");
}

/**
 * "YYYY-MM-DD" 날짜 문자열을 로컬 자정 기준 Date로 파싱한다.
 * new Date("YYYY-MM-DD")는 UTC 자정으로 해석돼, 로컬 자정 today와 비교 시
 * 시간대(예: KST +9)에 따라 D-day가 하루 어긋날 수 있어 이를 방지한다.
 */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return new Date(NaN);
  return new Date(y, m - 1, d);
}
