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
  { key: "ivdr_kickoff",       label: "IVDR 프로젝트 킥오프",       hint: "인증 프로젝트 공식 시작일",          certType: "ivdr" },
  { key: "ivdr_classify",      label: "제품 분류 확정",              hint: "Class A/B/C/D 분류 결정 완료",       certType: "ivdr" },
  { key: "ivdr_nb_contract",   label: "NB 계약 체결",                hint: "공인기관(NB)과 계약 서명",           certType: "ivdr" },
  { key: "ivdr_tech_doc",      label: "기술문서 초안 완성",           hint: "Annex II/III 기술문서 초안 마감",    certType: "ivdr" },
  { key: "ivdr_submission",    label: "NB 제출",                     hint: "기술문서 공식 NB 제출일",            certType: "ivdr" },
  { key: "ivdr_audit",         label: "NB 심사",                     hint: "Notified Body 현장 심사 예정일",     certType: "ivdr" },
  { key: "ivdr_cert",          label: "CE 인증 취득 목표",            hint: "CE 마킹 인증서 발급 목표일",         certType: "ivdr" },

  // ISO 13485
  { key: "iso_gap",            label: "갭 분석 완료",                hint: "현재 QMS vs 13485:2016 갭 분석",     certType: "iso13485" },
  { key: "iso_doc_complete",   label: "문서 정비 완료",               hint: "절차서·QM 신규/개정 완료",           certType: "iso13485" },
  { key: "iso_internal_audit", label: "내부심사",                    hint: "ISO 13485 내부심사 수행일",          certType: "iso13485" },
  { key: "iso_mgmt_review",    label: "경영 검토",                   hint: "인증 직전 경영 검토 회의",           certType: "iso13485" },
  { key: "iso_cert_audit",     label: "인증심사 (Stage 1/2)",         hint: "인증기관(CB) 심사 예정일",           certType: "iso13485" },
  { key: "iso_cert",           label: "ISO 13485 인증 취득",          hint: "인증서 발급 목표일",                 certType: "iso13485" },

  // IVDD
  { key: "ivdd_doc_review",    label: "기존 기술문서 검토 완료",       hint: "98/79/EC 기기파일 현황 파악",        certType: "ivdd" },
  { key: "ivdd_doc_update",    label: "기술문서 갱신 완료",            hint: "DoC·기술문서 최신화",               certType: "ivdd" },
  { key: "ivdd_conformity",    label: "적합성 평가 완료",              hint: "Annex IV/V/VI/VII 절차 완료",        certType: "ivdd" },
  { key: "ivdd_ivdr_target",   label: "IVDR 전환 목표일",             hint: "IVDR 체계로 이전 완료 목표",         certType: "ivdd" },

  // MDSAP
  { key: "mdsap_gap",          label: "갭 분석 완료",                hint: "7챕터 기반 갭 분석 완료",            certType: "mdsap" },
  { key: "mdsap_ao_select",    label: "AO 선정",                     hint: "심사기관(AO) 최종 선정",             certType: "mdsap" },
  { key: "mdsap_ao_contract",  label: "AO 계약 체결",                hint: "심사기관과 계약 서명",               certType: "mdsap" },
  { key: "mdsap_stage1",       label: "Stage 1 심사",                hint: "문서 심사 (Desk Review)",            certType: "mdsap" },
  { key: "mdsap_stage2",       label: "Stage 2 심사",                hint: "현장 심사 (On-site Audit)",          certType: "mdsap" },
  { key: "mdsap_cert",         label: "MDSAP 인증 취득",             hint: "MDSAP 인증서 발급 목표일",           certType: "mdsap" },
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
