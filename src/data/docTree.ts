// =====================================================================
// src/data/docTree.ts
// 제출 기준 문서 트리 + 마스터 등록부.
// "써야 할 문서가 전부 무엇인가"를 제출 구조(Annex II/III·QMS·적합성·등록)로 보여주고,
// 각 잎을 정거장 문서 템플릿(/doc/:id) 또는 관련 정거장으로 연결한다.
// 콘텐츠는 documents.ts(템플릿)·stations.ts(정거장)와 stationId로 연결 — 중복 없음.
// =====================================================================

import type { TagTone } from "./stations";

export type DocRequirement = "required" | "conditional" | "ifApplicable";

export const requirementMeta: Record<
  DocRequirement,
  { label: string; tone: TagTone }
> = {
  required: { label: "필수", tone: "info" },
  conditional: { label: "조건부", tone: "warning" },
  ifApplicable: { label: "해당 시", tone: "neutral" },
};

export interface DocLeaf {
  title: string;
  refs: string[]; // IVDR 위치
  stationId: number; // 산출 정거장 (1..11)
  /** template: 전용 .md 템플릿 보유(/doc/:id) · reference: 관련 정거장 문서에 포함 */
  kind: "template" | "reference";
  requirement: DocRequirement;
  note?: string;
}

export interface DocGroup {
  id: string;
  title: string;
  refs: string[];
  items: DocLeaf[];
}

export const docTree: DocGroup[] = [
  {
    id: "annex-ii",
    title: "기술문서 (Annex II)",
    refs: ["IVDR Annex II"],
    items: [
      {
        title: "기기 설명 · 의도된 목적 정의서",
        refs: ["Annex II 1.1", "Art.2"],
        stationId: 1,
        kind: "template",
        requirement: "required",
      },
      {
        title: "분류 근거서",
        refs: ["Annex VIII", "Art.47"],
        stationId: 2,
        kind: "template",
        requirement: "required",
      },
      {
        title: "라벨 · 사용설명서(IFU)",
        refs: ["Annex I (정보 요구)", "Art.18"],
        stationId: 9,
        kind: "reference",
        requirement: "required",
        note: "적합성 선언·CE 단계(St9)에서 라벨링과 연동해 점검.",
      },
      {
        title: "설계 · 제조 정보",
        refs: ["Annex II 3"],
        stationId: 5,
        kind: "reference",
        requirement: "required",
        note: "기술문서(St5) 폴더 구조에 포함되는 항목.",
      },
      {
        title: "GSPR 체크리스트 (Annex I)",
        refs: ["Annex I"],
        stationId: 5,
        kind: "template",
        requirement: "required",
        note: "기술문서 템플릿(St5)에 GSPR 매핑 표 포함.",
      },
      {
        title: "성능평가 계획·보고서 (PEP / PER)",
        refs: ["Annex XIII", "Art.56"],
        stationId: 6,
        kind: "template",
        requirement: "required",
      },
      {
        title: "위험관리 파일 (ISO 14971)",
        refs: ["ISO 14971:2019", "Annex I"],
        stationId: 7,
        kind: "template",
        requirement: "required",
      },
    ],
  },
  {
    id: "annex-iii",
    title: "시판 후 기술문서 (Annex III)",
    refs: ["IVDR Annex III"],
    items: [
      {
        title: "시판 후 감시 계획 (PMS Plan)",
        refs: ["Art.79", "Annex III"],
        stationId: 11,
        kind: "template",
        requirement: "required",
      },
      {
        title: "정기 안전성 갱신 보고서 (PSUR)",
        refs: ["Art.81"],
        stationId: 11,
        kind: "reference",
        requirement: "conditional",
        note: "Class C·D는 매년 — PMS 계획(St11)에서 일정 관리.",
      },
      {
        title: "시판 후 성능 추적 (PMPF) 계획·보고서",
        refs: ["Annex XIII Part B"],
        stationId: 11,
        kind: "reference",
        requirement: "ifApplicable",
        note: "성능 추적이 필요한 경우 PMS 계획(St11)에 포함.",
      },
    ],
  },
  {
    id: "qms",
    title: "품질경영시스템 (QMS)",
    refs: ["Art.10(8)", "ISO 13485:2016"],
    items: [
      {
        title: "QMS ↔ IVDR 연계 매트릭스",
        refs: ["Art.10(8)", "ISO 13485:2016"],
        stationId: 4,
        kind: "template",
        requirement: "required",
      },
      {
        title: "적합성 평가 경로 계획 + 산출물 체크리스트",
        refs: ["Art.48", "Annex IX~XI"],
        stationId: 3,
        kind: "template",
        requirement: "required",
      },
    ],
  },
  {
    id: "conformity",
    title: "적합성 · 인증",
    refs: ["Art.17~18", "Art.38~46"],
    items: [
      {
        title: "NB 신청 패키지 · 선정 체크리스트",
        refs: ["Art.38~46"],
        stationId: 8,
        kind: "template",
        requirement: "conditional",
        note: "Class A 비멸균은 NB 심사 생략.",
      },
      {
        title: "적합성 선언서 (DoC, Annex IV)",
        refs: ["Annex IV", "Art.17"],
        stationId: 9,
        kind: "template",
        requirement: "required",
      },
      {
        title: "CE 마킹 (Annex V)",
        refs: ["Annex V", "Art.18"],
        stationId: 9,
        kind: "reference",
        requirement: "required",
        note: "DoC(St9) 작성 후 라벨에 부착.",
      },
    ],
  },
  {
    id: "registration",
    title: "등록 (EUDAMED / UDI)",
    refs: ["Art.24~28", "Annex VI"],
    items: [
      {
        title: "EUDAMED / UDI 등록 데이터 준비표",
        refs: ["Art.24~28", "Annex VI", "Decision (EU) 2025/2371"],
        stationId: 10,
        kind: "template",
        requirement: "required",
        note: "행위자 등록(SRN) → 기기 등록 → UDI-DI 체계.",
      },
    ],
  },
];

/** 전체 문서 수 / 템플릿 보유 수 — 요약 배지용. */
export function docTreeStats() {
  const all = docTree.flatMap((g) => g.items);
  return {
    total: all.length,
    withTemplate: all.filter((i) => i.kind === "template").length,
    groups: docTree.length,
  };
}

/** 마스터 등록부 .md — 담당·상태 빈 칸 포함(파일에서 관리). */
export function toRegisterMarkdown(): string {
  const lines: string[] = [];
  lines.push("# IVDR 제출 문서 마스터 등록부");
  lines.push("");
  lines.push(
    "> 써야 할 문서 전체 목록. 담당·상태 칸을 채워 진행 관리에 사용하세요.",
  );
  lines.push(
    "> 규제 위치는 2026.6 기준 확인값 — 실제 제출 전 최신 관보·NB 요건으로 재확인.",
  );
  lines.push("");
  for (const g of docTree) {
    lines.push(`## ${g.title}`);
    lines.push(`_근거: ${g.refs.join(" · ")}_`);
    lines.push("");
    lines.push("| 문서 | IVDR 위치 | 산출 정거장 | 유형 | 담당 | 상태 |");
    lines.push("|---|---|---|---|---|---|");
    for (const it of g.items) {
      const req = requirementMeta[it.requirement].label;
      lines.push(
        `| ${it.title} | ${it.refs.join(", ")} | St${it.stationId} | ${req} |  |  |`,
      );
    }
    lines.push("");
  }
  lines.push("---");
  lines.push(
    "_IVDR 여정 위키 생성 등록부. 정보 제공용이며 법적 자문이 아님._",
  );
  return lines.join("\n");
}
