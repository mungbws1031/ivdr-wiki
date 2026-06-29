// src/data/mdsap/docTree.ts
export interface MDSAPDocLeaf {
  id: string;
  title: string;
  refs: string[];
  stationId: number;
  requirement: "required" | "conditional" | "ifApplicable";
  note?: string;
}

export const mdsapDocTree: MDSAPDocLeaf[] = [
  // Station 1 — 개요
  { id: "mdsap-scope",         title: "MDSAP 목표 국가·범위 정의서",   refs: ["MDSAP AU P0002"],              stationId: 1, requirement: "required" },
  // Station 2 — 갭 분석
  { id: "mdsap-gap-analysis",  title: "갭 분석 보고서",                refs: ["MDSAP AU P0002 Ch.1-7"],       stationId: 2, requirement: "required" },
  { id: "mdsap-ao-contract",   title: "심사기관(AO) 계약서",           refs: ["IMDRF MDSAP"],                 stationId: 2, requirement: "required" },
  // Station 3 — QMS 구축
  { id: "mdsap-ch1-mgmt",      title: "경영 프로세스 절차서 (Ch.1)",   refs: ["MDSAP Ch.1"],                  stationId: 3, requirement: "required" },
  { id: "mdsap-ch3-measure",   title: "측정·분석·개선 절차서 (Ch.3)",  refs: ["MDSAP Ch.3", "21 CFR 820"],   stationId: 3, requirement: "required" },
  { id: "mdsap-ch4-design",    title: "설계·개발 통제 절차서 (Ch.4)",  refs: ["MDSAP Ch.4"],                  stationId: 3, requirement: "required" },
  { id: "mdsap-ch5-prod",      title: "제품·서비스 통제 절차서 (Ch.5)", refs: ["MDSAP Ch.5"],                 stationId: 3, requirement: "required" },
  { id: "mdsap-ch6-purchase",  title: "구매 절차서 (Ch.6)",            refs: ["MDSAP Ch.6"],                  stationId: 3, requirement: "required" },
  // Station 4 — 기록 관리
  { id: "mdsap-ch7-support",   title: "지원 프로세스 절차서 (Ch.7)",   refs: ["MDSAP Ch.7"],                  stationId: 4, requirement: "required" },
  { id: "mdsap-record-policy", title: "기록 보유 기간 정책",           refs: ["MDSAP Ch.7", "ISO 13485 4.2.5"], stationId: 4, requirement: "required" },
  // Station 5 — 심사
  { id: "mdsap-stage1-pkg",    title: "Stage 1 준비 패키지",           refs: ["MDSAP AU P0002"],              stationId: 5, requirement: "required" },
  // Station 6 — CAPA
  { id: "mdsap-capa",          title: "심사 CAPA 보고서",              refs: ["MDSAP AU P0002", "ISO 8.5.2"], stationId: 6, requirement: "required" },
  // Station 7 — 유지
  { id: "mdsap-surveillance",  title: "연간 감시 심사 일정 계획",      refs: ["MDSAP 감시 심사 절차"],        stationId: 7, requirement: "required" },
];

export const mdsapLeafById = (id: string): MDSAPDocLeaf | undefined => mdsapDocTree.find((l) => l.id === id);
export const mdsapLeavesByStation = (stationId: number): MDSAPDocLeaf[] => mdsapDocTree.filter((l) => l.stationId === stationId);
export const allMDSAPDocIds = (): string[] => mdsapDocTree.map((l) => l.id);
