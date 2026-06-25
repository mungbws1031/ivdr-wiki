// =====================================================================
// src/data/schemes.ts
// 규제 스킴 간 문서 중복(재사용) 매핑.
// ISO 13485 = QMS 공통 기반. MDSAP = ISO 13485 + 5개국(AU·BR·CA·JP·US) 단일 심사.
// CE(IVDR)·FDA(US)는 그 위에 시장별 문서를 얹는다.
// 우리 문서셋(75)은 IVDR 중심이라 FDA 고유 제출문서는 보유하지 않음(참고로만 표시).
// =====================================================================

import { allLeaves } from "./docTree";

/** CE(IVDR) 전용 — EU 시장 고유 문서(우리 문서셋 내 id). 나머지는 공통 재사용. */
export const ceOnlyDocIds: string[] = [
  "qualification-statement",
  "classification-rationale",
  "conformity-route-plan",
  "tech-doc-toc-gspr",
  "qms-ivdr-matrix",
  "performance-eval-plan",
  "performance-eval-report",
  "clinical-performance-study-plan",
  "declaration-of-conformity",
  "ce-marking-application",
  "ssp",
  "nb-application",
  "prrc",
  "authorised-rep-mandate",
  "importer-distributor",
  "actor-registration",
  "device-registration",
  "udi-assignment",
  "cs-compliance",
  "eurl-batch-verification",
  "cdx-consultation",
  "psur",
  "pmpf-plan",
  "trend-reporting",
  "fsca-recall",
  "pms-report",
];

/** 공통 재사용 문서 = 전체 − CE 전용. (ISO 13485·MDSAP·CE·FDA에 두루 재사용) */
export function sharedDocIds(): string[] {
  const ce = new Set(ceOnlyDocIds);
  return allLeaves()
    .map((l) => l.id)
    .filter((id) => !ce.has(id));
}

/** 이 문서가 CE 외 다른 인증과 중복(재사용)되는가. */
export const isSharedDoc = (id: string): boolean => !ceOnlyDocIds.includes(id);

/** 공통 문서가 겹치는 다른 인증 라벨(CE는 IVDR 기본이라 제외). */
export const overlapSchemes = ["ISO 13485", "MDSAP", "FDA"];

/** FDA(US) 고유 제출문서 — 우리 IVDR 문서셋 밖. 참고 표시용(링크 없음). */
export const fdaOnlyItems: string[] = [
  "510(k) / De Novo / PMA 제출",
  "FDA 시설 등록 · 기기 목록",
  "GUDID (FDA UDI)",
  "US Agent 지정",
  "21 CFR 809·801 라벨링",
  "QMSR (21 CFR 820, ISO 13485 정합)",
];

export const mdsapMarkets = ["호주", "브라질", "캐나다", "일본", "미국(FDA)"];

/** 스킴 메타(라벨·색). */
export const schemes = [
  { id: "iso", name: "ISO 13485", sub: "QMS 국제표준 · 공통 기반", colorVar: "--p3" },
  { id: "mdsap", name: "MDSAP", sub: "ISO 13485 + 5개국 단일 심사", colorVar: "--p5" },
  { id: "ce", name: "CE / IVDR", sub: "EU 시장", colorVar: "--p2" },
  { id: "fda", name: "FDA", sub: "US 시장", colorVar: "--p4" },
];
