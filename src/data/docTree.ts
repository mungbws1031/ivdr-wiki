// =====================================================================
// src/data/docTree.ts
// 제출 기준 문서 트리(마인드맵) — 실제 IVDR 문서 세트.
// 모든 잎은 고유 id 를 가지며 /doc/:id 로 열린다.
//   detailed=true  → 손으로 작성한 전용 템플릿(documents.ts)
//   detailed=false → 잎 정보로 일반 템플릿 자동 생성(resolveDoc)
// 각 잎에는 '작성 전 준비물'(자료·사진·시험·선행문서)을 기입한다.
// 규제 위치는 2026.6 기준 — 실제 제출 전 최신 관보·NB 요건으로 재확인.
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

/** 작성 전 준비물 종류 — 색+아이콘+라벨 3중 신호. */
export type PrereqKind = "doc" | "data" | "photo" | "test" | "other";

export const prereqKindLabel: Record<PrereqKind, string> = {
  doc: "선행 문서",
  data: "자료·데이터",
  photo: "사진·이미지",
  test: "시험·테스트",
  other: "기타",
};

export interface Prerequisite {
  kind: PrereqKind;
  label: string;
}

export interface DocLeaf {
  id: string; // 고유 슬러그 (/doc/:id)
  title: string;
  refs: string[];
  stationId: number; // 산출 정거장 (1..11)
  requirement: DocRequirement;
  detailed?: boolean; // 전용 템플릿 보유
  note?: string;
  prerequisites?: Prerequisite[]; // 작성 전 준비물
}

export interface DocGroup {
  id: string;
  title: string;
  refs: string[];
  colorVar: string; // 그룹 색 (--p1..--p5)
  items: DocLeaf[];
}

// 준비물 작성 헬퍼
const P = (kind: PrereqKind, label: string): Prerequisite => ({ kind, label });

export const docTree: DocGroup[] = [
  {
    id: "scope",
    title: "범위·분류",
    refs: ["Art.2", "Annex VIII"],
    colorVar: "--p1",
    items: [
      {
        id: "intended-purpose",
        title: "의도된 목적 정의서",
        refs: ["Annex II 1.1", "Art.2"],
        stationId: 1,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("data", "측정 대상·검체·사용자·환경·임상 결정 정보"),
          P("doc", "제품 컨셉·마케팅 자료"),
          P("other", "경쟁·유사 제품 라벨/IFU 예시"),
        ],
      },
      {
        id: "qualification-statement",
        title: "제품 적격성(IVD 해당성) 판단서",
        refs: ["Art.2"],
        stationId: 1,
        requirement: "required",
        note: "IVDR 적용 대상인지 근거와 함께 판단.",
        prerequisites: [
          P("doc", "의도된 목적 정의서(초안)"),
          P("data", "제품 작동 원리·검출 메커니즘 설명"),
          P("other", "IVDR Art.2 정의 대조표"),
        ],
      },
      {
        id: "classification-rationale",
        title: "분류 근거서",
        refs: ["Annex VIII", "Art.47"],
        stationId: 2,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "의도된 목적 정의서"),
          P("data", "검출 대상의 임상적 위험(감염성·생명위협 여부)"),
          P("other", "Annex VIII Rule 1~7 체크 시트"),
        ],
      },
      {
        id: "conformity-route-plan",
        title: "적합성 평가 경로 계획 + 산출물 체크리스트",
        refs: ["Art.48", "Annex IX~XI"],
        stationId: 3,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "분류 근거서(클래스 확정)"),
          P("other", "클래스별 Annex IX~XI 경로 비교표"),
        ],
      },
    ],
  },
  {
    id: "annex-ii",
    title: "기술문서 (Annex II)",
    refs: ["Annex II"],
    colorVar: "--p3",
    items: [
      {
        id: "device-description",
        title: "기기 설명서·사양",
        refs: ["Annex II 1.1"],
        stationId: 5,
        requirement: "required",
        prerequisites: [
          P("photo", "제품 외관·구성품 사진"),
          P("data", "기술 사양(시약·하드웨어·SW 버전)"),
          P("doc", "부품/구성 목록(BOM)"),
        ],
      },
      {
        id: "design-manufacturing-info",
        title: "설계·제조 정보",
        refs: ["Annex II 3"],
        stationId: 5,
        requirement: "required",
        prerequisites: [
          P("doc", "설계 도면·공정 흐름도"),
          P("photo", "제조 공정·설비 사진"),
          P("data", "공정 파라미터·관리 기준값"),
        ],
      },
      {
        id: "tech-doc-toc-gspr",
        title: "기술문서 목차 + GSPR 체크리스트",
        refs: ["Annex II", "Annex I"],
        stationId: 5,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "위험관리 파일·성능평가 보고서"),
          P("data", "GSPR 각 항목 대응 증거 목록·위치"),
        ],
      },
      {
        id: "labelling-spec",
        title: "라벨 사양서",
        refs: ["Annex I (정보)", "Art.18"],
        stationId: 9,
        requirement: "required",
        note: "UDI 캐리어·CE·NB 번호 포함.",
        prerequisites: [
          P("photo", "현재 라벨 시안·목업"),
          P("data", "UDI-DI·제조자 정보·보관조건·유효기간"),
          P("doc", "심볼 표준(ISO 15223-1) 적용표"),
        ],
      },
      {
        id: "ifu",
        title: "사용설명서(IFU)",
        refs: ["Annex I (정보)"],
        stationId: 9,
        requirement: "required",
        note: "자가검사는 사용적합성 검증과 연계.",
        prerequisites: [
          P("doc", "사용 절차 초안·위험관리(사용오류)"),
          P("photo", "사용 단계별 일러스트/사진"),
          P("test", "사용적합성 검증 결과(자가검사 시)"),
        ],
      },
      {
        id: "benefit-risk",
        title: "이익-위험 분석서",
        refs: ["Annex I 1", "Annex II"],
        stationId: 7,
        requirement: "required",
        prerequisites: [
          P("doc", "위험관리 파일·성능평가 결과"),
          P("data", "임상적 이익 근거(문헌·데이터)"),
        ],
      },
      {
        id: "stability-study",
        title: "안정성 시험 계획·보고서",
        refs: ["Annex II 6.2", "Annex XIII"],
        stationId: 6,
        requirement: "required",
        note: "표시 유효기간·운송 안정성 입증.",
        prerequisites: [
          P("test", "실시간·가속 안정성 시험 데이터"),
          P("test", "운송(수송) 안정성 시험 결과"),
          P("data", "보관조건·유효기간 설정 근거"),
        ],
      },
      {
        id: "sw-validation",
        title: "소프트웨어 검증·밸리데이션",
        refs: ["Annex I 16", "IEC 62304"],
        stationId: 5,
        requirement: "ifApplicable",
        note: "소프트웨어 포함 기기에 한함.",
        prerequisites: [
          P("doc", "소프트웨어 요구사항·아키텍처"),
          P("test", "단위·통합·시스템 검증 결과"),
          P("data", "사이버보안 위험평가"),
        ],
      },
    ],
  },
  {
    id: "performance",
    title: "성능평가 (Annex XIII)",
    refs: ["Annex XIII", "Art.56"],
    colorVar: "--p2",
    items: [
      {
        id: "performance-eval-plan",
        title: "성능평가 계획 (PEP)",
        refs: ["Annex XIII", "Art.56"],
        stationId: 6,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "의도된 목적·분류"),
          P("data", "성능 목표(수용 기준)"),
          P("other", "관련 공통기술규격(CS)·가이드라인"),
        ],
      },
      {
        id: "scientific-validity",
        title: "과학적 타당성 보고서",
        refs: ["Annex XIII 1.2"],
        stationId: 6,
        requirement: "required",
        prerequisites: [
          P("doc", "문헌 검색 전략·결과"),
          P("data", "분석물질-임상상태 연관 근거"),
        ],
      },
      {
        id: "analytical-performance",
        title: "분석적 성능 보고서",
        refs: ["Annex XIII 1.2.2"],
        stationId: 6,
        requirement: "required",
        prerequisites: [
          P("test", "정밀도·정확도·검출한계·교차반응 시험 데이터"),
          P("data", "검체 패널 정보·출처"),
          P("photo", "시험 셋업·결과 이미지(해당 시)"),
        ],
      },
      {
        id: "clinical-performance",
        title: "임상적 성능 보고서",
        refs: ["Annex XIII 1.2.3"],
        stationId: 6,
        requirement: "required",
        prerequisites: [
          P("test", "임상 성능 연구 데이터(민감도·특이도)"),
          P("doc", "연구 계획서·윤리 승인"),
          P("data", "검체 출처·수·대상군"),
        ],
      },
      {
        id: "performance-eval-report",
        title: "성능평가 보고서 (PER)",
        refs: ["Annex XIII", "Art.56"],
        stationId: 6,
        requirement: "required",
        note: "PEP→데이터→PER로 종결.",
        prerequisites: [
          P("doc", "PEP·과학적타당성·분석·임상 보고서"),
          P("data", "종합 성능 결론·잔여 위험"),
        ],
      },
    ],
  },
  {
    id: "risk",
    title: "위험·사용적합성",
    refs: ["ISO 14971", "IEC 62366"],
    colorVar: "--p4",
    items: [
      {
        id: "risk-management-plan",
        title: "위험관리 계획 + GSPR↔위험 추적표",
        refs: ["ISO 14971:2019", "Annex I"],
        stationId: 7,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "의도된 목적·GSPR 목록"),
          P("data", "위해요인·위험 상황 목록(초안)"),
          P("other", "ISO 14971 위험 수용 기준"),
        ],
      },
      {
        id: "risk-management-file",
        title: "위험관리 파일·보고서",
        refs: ["ISO 14971:2019"],
        stationId: 7,
        requirement: "required",
        prerequisites: [
          P("doc", "위험관리 계획"),
          P("test", "통제수단 검증 데이터"),
          P("data", "잔여위험 평가 결과"),
        ],
      },
      {
        id: "usability-file",
        title: "사용적합성(IEC 62366) 계획·보고서",
        refs: ["IEC 62366-1", "Annex I"],
        stationId: 7,
        requirement: "conditional",
        note: "자가검사·근접검사 필수.",
        prerequisites: [
          P("doc", "사용 시나리오·사용자 프로파일"),
          P("test", "형성·총괄 사용적합성 평가 데이터"),
          P("photo", "UI·라벨·IFU 이미지"),
        ],
      },
    ],
  },
  {
    id: "qms",
    title: "품질경영시스템 (QMS)",
    refs: ["Art.10(8)", "ISO 13485"],
    colorVar: "--p5",
    items: [
      {
        id: "qms-ivdr-matrix",
        title: "QMS↔IVDR 연계 매트릭스",
        refs: ["Art.10(8)", "ISO 13485:2016"],
        stationId: 4,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "ISO 13485 절차서 목록·품질매뉴얼"),
          P("data", "IVDR 고유 프로세스 매핑표"),
        ],
      },
      {
        id: "doc-record-control",
        title: "문서·기록 관리 절차(SOP)",
        refs: ["ISO 13485 4.2"],
        stationId: 4,
        requirement: "required",
        prerequisites: [
          P("doc", "기존 문서관리 절차"),
          P("data", "문서 분류·보존 기간 정책"),
        ],
      },
      {
        id: "capa-sop",
        title: "시정·예방조치(CAPA) 절차",
        refs: ["ISO 13485 8.5"],
        stationId: 4,
        requirement: "required",
        prerequisites: [
          P("doc", "기존 CAPA·부적합 절차"),
          P("data", "불만·부적합 데이터 소스"),
        ],
      },
      {
        id: "supplier-control",
        title: "공급자·구매 관리 절차",
        refs: ["ISO 13485 7.4"],
        stationId: 4,
        requirement: "required",
        prerequisites: [
          P("doc", "공급자 목록·평가 기록"),
          P("data", "핵심 부품·외주 공정 목록"),
        ],
      },
      {
        id: "complaint-handling",
        title: "불만 처리 절차",
        refs: ["Art.10", "ISO 13485 8.2"],
        stationId: 11,
        requirement: "required",
        prerequisites: [
          P("doc", "불만 접수·처리 절차"),
          P("data", "불만 분류·중대성 판단 기준"),
        ],
      },
      {
        id: "vigilance-sop",
        title: "바이질런스·사고 보고 절차",
        refs: ["Art.82~85"],
        stationId: 11,
        requirement: "required",
        note: "중대사고·FSCA 보고 경로.",
        prerequisites: [
          P("doc", "사고 보고 절차"),
          P("data", "중대사고·FSCA 정의·보고 기한"),
          P("other", "EUDAMED·관할 당국 보고 경로"),
        ],
      },
    ],
  },
  {
    id: "conformity",
    title: "적합성·인증",
    refs: ["Art.17~18", "Art.38~46"],
    colorVar: "--p1",
    items: [
      {
        id: "nb-application",
        title: "NB 신청 패키지·선정 체크리스트",
        refs: ["Art.38~46"],
        stationId: 8,
        requirement: "conditional",
        detailed: true,
        note: "Class A 비멸균은 NB 생략.",
        prerequisites: [
          P("doc", "QMS·기술문서·PER·위험파일(준비 완료)"),
          P("data", "NANDO scope 조사 결과"),
          P("other", "NB 견적·서면 계약"),
        ],
      },
      {
        id: "declaration-of-conformity",
        title: "적합성 선언서 (DoC)",
        refs: ["Annex IV", "Art.17"],
        stationId: 9,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "기술문서 일체·NB 인증서(해당 시)"),
          P("data", "제조자·Basic UDI-DI·분류·적용 표준"),
        ],
      },
      {
        id: "ce-marking-application",
        title: "CE 마킹 적용 점검표",
        refs: ["Annex V", "Art.18"],
        stationId: 9,
        requirement: "required",
        prerequisites: [
          P("doc", "적합성 선언서(DoC)"),
          P("photo", "라벨·포장 CE 표기 시안"),
          P("data", "NB 식별번호(해당 시)"),
        ],
      },
      {
        id: "authorised-rep-mandate",
        title: "EU 대리인 위임 계약",
        refs: ["Art.11~12"],
        stationId: 10,
        requirement: "conditional",
        note: "역외(비EU) 제조자에 한함.",
        prerequisites: [
          P("doc", "대리인 후보·계약 초안"),
          P("data", "책임 범위·연락 정보"),
        ],
      },
    ],
  },
  {
    id: "registration",
    title: "등록·UDI (EUDAMED)",
    refs: ["Art.24~28", "Annex VI"],
    colorVar: "--p2",
    items: [
      {
        id: "actor-registration",
        title: "행위자 등록(SRN) 데이터",
        refs: ["Art.28", "Annex VI"],
        stationId: 10,
        requirement: "required",
        note: "기기 등록 전 선행.",
        prerequisites: [
          P("data", "제조자 법인 정보·주소·연락처"),
          P("doc", "권한 서명자·위임 정보"),
        ],
      },
      {
        id: "device-registration",
        title: "EUDAMED/UDI 등록 데이터 준비표",
        refs: ["Art.24~28", "Annex VI", "Decision (EU) 2025/2371"],
        stationId: 10,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("data", "Basic UDI-DI·UDI-DI·분류·인증서"),
          P("doc", "DoC·라벨"),
        ],
      },
      {
        id: "udi-assignment",
        title: "UDI 지정·라벨 적용표",
        refs: ["Art.24~27", "Annex VI Part C"],
        stationId: 10,
        requirement: "required",
        prerequisites: [
          P("data", "발행기관(GS1 등) 코드·모델 목록"),
          P("photo", "라벨 UDI 캐리어(바코드) 시안"),
          P("test", "바코드 판독 검증"),
        ],
      },
    ],
  },
  {
    id: "post-market",
    title: "시판 후 (Annex III)",
    refs: ["Art.78~81", "Annex III"],
    colorVar: "--p3",
    items: [
      {
        id: "pms-plan",
        title: "시판 후 감시 계획 (PMS Plan)",
        refs: ["Art.79", "Annex III"],
        stationId: 11,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "QMS 절차·위험·성능 파일"),
          P("data", "데이터 소스 목록·모니터링 지표"),
        ],
      },
      {
        id: "pms-report",
        title: "PMS 보고서",
        refs: ["Art.80"],
        stationId: 11,
        requirement: "conditional",
        note: "Class A·B (비-PSUR 등급).",
        prerequisites: [
          P("data", "수집된 PMS 데이터"),
          P("doc", "PMS 계획"),
        ],
      },
      {
        id: "psur",
        title: "정기 안전성 갱신 보고서 (PSUR)",
        refs: ["Art.81"],
        stationId: 11,
        requirement: "conditional",
        note: "Class C·D는 매년 갱신.",
        prerequisites: [
          P("data", "판매량·불만·사고·성능 데이터"),
          P("doc", "PMS 계획·이전 PSUR"),
        ],
      },
      {
        id: "pmpf-plan",
        title: "시판 후 성능 추적(PMPF) 계획·보고서",
        refs: ["Annex XIII Part B"],
        stationId: 11,
        requirement: "ifApplicable",
        prerequisites: [
          P("doc", "PEP/PER·PMS 계획"),
          P("data", "추적할 성능 지표"),
        ],
      },
      {
        id: "trend-reporting",
        title: "트렌드 보고",
        refs: ["Art.83"],
        stationId: 11,
        requirement: "ifApplicable",
        note: "통계적으로 유의한 증가 시.",
        prerequisites: [
          P("data", "사고 발생률 기준선·통계"),
          P("doc", "바이질런스 절차"),
        ],
      },
    ],
  },
];

export function allLeaves(): DocLeaf[] {
  return docTree.flatMap((g) => g.items);
}

export function leafById(id: string): DocLeaf | undefined {
  return allLeaves().find((l) => l.id === id);
}

/** 정거장의 대표 문서(전용 템플릿) id — drawer '문서 작성하기'용. */
export function primaryDocIdForStation(stationId: number): string {
  const detailed = allLeaves().find(
    (l) => l.stationId === stationId && l.detailed,
  );
  return detailed?.id ?? `station-${stationId}`;
}

export function docTreeStats() {
  const all = allLeaves();
  return {
    total: all.length,
    detailed: all.filter((l) => l.detailed).length,
    groups: docTree.length,
  };
}

/** 마스터 등록부 .md — 담당·상태 빈 칸 포함(파일에서 관리). */
export function toRegisterMarkdown(): string {
  const lines: string[] = [];
  lines.push("# IVDR 제출 문서 마스터 등록부");
  lines.push("");
  lines.push("> 써야 할 문서 전체 목록. 담당·상태 칸을 채워 진행 관리에 사용하세요.");
  lines.push("> 규제 위치는 2026.6 기준 — 실제 제출 전 최신 관보·NB 요건으로 재확인.");
  lines.push("");
  for (const g of docTree) {
    lines.push(`## ${g.title}`);
    lines.push(`_근거: ${g.refs.join(" · ")}_`);
    lines.push("");
    lines.push("| 문서 | IVDR 위치 | 산출 정거장 | 유형 | 담당 | 상태 |");
    lines.push("|---|---|---|---|---|---|");
    for (const it of g.items) {
      const req = requirementMeta[it.requirement].label;
      lines.push(`| ${it.title} | ${it.refs.join(", ")} | St${it.stationId} | ${req} |  |  |`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push("_IVDR 여정 위키 생성 등록부. 정보 제공용이며 법적 자문이 아님._");
  return lines.join("\n");
}
