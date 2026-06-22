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

// ---------------------------------------------------------------------
// 문서별 '취지' — 이 문서를 왜 써야 하는가(근본 이유·규제 의도).
// 38개 잎 id 기준. (purpose=무엇을 충족하는가 / rationale=왜 존재하는가)
// ---------------------------------------------------------------------
export const docRationale: Record<string, string> = {
  "intended-purpose":
    "의도된 목적은 규제 적용 범위·분류·성능 요구의 '원점'이다. 여기서 한 단어가 틀어지면 이후 모든 증거가 잘못된 기준으로 만들어지므로, 가장 먼저 정확히 못 박아 재작업과 심사 거절을 막는다.",
  "qualification-statement":
    "내 제품이 애초에 IVDR 대상인지부터 확정해야 불필요하거나 누락된 규제 부담을 피한다. 적용 여부를 근거와 함께 남겨 당국·NB 질의에 즉시 답할 수 있게 한다.",
  "classification-rationale":
    "클래스는 NB 개입·평가 경로·전환 기한을 통째로 결정한다. 분류와 그 근거를 남기는 것은 '왜 이 경로인가'를 입증해 심사에서 가장 먼저 신뢰를 얻기 위함이다.",
  "conformity-route-plan":
    "경로를 먼저 확정해야 어떤 증거를 만들지가 정해진다. 계획 없이 착수하면 경로가 바뀔 때 증거 전체를 다시 만들게 되므로, 재작업과 일정 리스크를 줄인다.",
  "device-description":
    "심사자·당국이 '이 기기가 무엇인가'를 정확히 이해해야 나머지 증거를 평가할 수 있다. 기기를 명확·일관되게 기술해 오해와 추가 질의를 줄인다.",
  "design-manufacturing-info":
    "안전·성능이 설계·제조 과정에서 어떻게 보장되는지 추적 가능해야 한다. 재현 가능한 품질을 입증해 제품 일관성과 책임 소재를 명확히 한다.",
  "tech-doc-toc-gspr":
    "GSPR은 모든 IVD가 지켜야 할 안전·성능 요구의 목록이다. 각 요구에 증거를 매핑하는 것은 적합성을 빠짐없이·추적 가능하게 입증하는 뼈대를 만들기 위함이다.",
  "labelling-spec":
    "사용자는 라벨·IFU만 보고 기기를 쓴다. 정확한 정보 표기는 오용으로 인한 환자 위해를 막고 법적 정보 제공 의무를 충족하기 위함이다.",
  ifu: "특히 비전문가 사용 시 잘못된 사용은 곧 오진으로 이어진다. 명확한 사용설명은 사용 오류 위험을 통제하는 핵심 안전장치다.",
  "benefit-risk":
    "잔여 위험이 임상적 이익으로 정당화되는지 보여야 시판이 허용된다. '위험을 감수할 가치가 있는가'에 대한 규제적 답을 문서화한다.",
  "stability-study":
    "표시된 유효기간·보관조건에서 성능이 유지됨을 입증하지 못하면 사용 시점의 결과를 신뢰할 수 없다. 유통·사용 전 구간의 신뢰성을 보장한다.",
  "sw-validation":
    "소프트웨어 결함은 조용히 잘못된 결과를 낼 수 있다. 검증·사이버보안으로 SW가 의도대로·안전하게 동작함을 보증한다.",
  "performance-eval-plan":
    "성능 증거를 '어떻게 모을지' 먼저 설계해야 데이터가 목적에 부합한다. 계획 없는 수집은 재작업과 불충분한 증거로 이어진다.",
  "scientific-validity":
    "측정 대상이 정말 그 임상 상태와 연관되는지가 모든 성능의 전제다. 이 전제가 무너지면 분석·임상 성능 데이터도 무의미해진다.",
  "analytical-performance":
    "기기가 측정값을 정확·정밀하게 내는지 입증해야 결과를 신뢰할 수 있다. 검사 결과의 기술적 신뢰성의 근거다.",
  "clinical-performance":
    "정확한 측정값이 실제 임상 판단에서 유효한지(민감도·특이도)를 보여야 한다. 환자에게 실질적 가치가 있음을 입증한다.",
  "performance-eval-report":
    "흩어진 성능 증거를 하나의 결론으로 종합해 '이 기기는 의도된 목적에 충분하다'를 선언한다. NB 심사의 핵심 산출물이다.",
  "risk-management-plan":
    "위험은 한 번이 아니라 전 수명주기에 걸쳐 관리되어야 한다. 위험-요구-성능을 추적 연결해 빠진 위험이 없도록 체계를 세운다.",
  "risk-management-file":
    "계획대로 위험이 실제로 통제·검증되었는지 증거로 남겨야 한다. 잔여위험이 수용 가능함을 입증하는 책임 기록이다.",
  "usability-file":
    "사용 오류는 가장 흔한 위해 원인 중 하나다. 사용자가 실수 없이 쓸 수 있는지 검증해 현실의 사용 위험을 줄인다.",
  "qms-ivdr-matrix":
    "품질은 문서 한 장이 아니라 시스템으로 보장된다. ISO 13485에 IVDR 고유 요구를 연결해 일관된 품질과 규제 준수의 토대를 만든다.",
  "doc-record-control":
    "추적성과 버전 관리가 없으면 어떤 증거도 신뢰할 수 없다. 올바른 문서가 올바른 시점에 쓰이도록 보장한다.",
  "capa-sop":
    "문제를 발견하는 것보다 재발을 막는 것이 핵심이다. 근본 원인을 제거해 품질을 지속적으로 개선한다.",
  "supplier-control":
    "제품 품질은 공급자 품질에 좌우된다. 외부에서 들어오는 위험을 관리해 최종 제품의 신뢰성을 지킨다.",
  "complaint-handling":
    "현장의 불만은 가장 빠른 안전 신호다. 체계적 처리로 문제를 조기에 포착하고 시정으로 연결한다.",
  "vigilance-sop":
    "중대사고는 신속히 당국에 보고되어야 추가 피해를 막을 수 있다. 환자 안전을 위한 법적 보고 의무를 이행한다.",
  "nb-application":
    "Class A 비멸균 외에는 제3자 검증 없이 시장에 나갈 수 없다. 객관적 인증으로 적합성에 대한 신뢰를 확보한다. NB 슬롯 지연은 곧 시장 차단이므로 조기 준비가 핵심이다.",
  "declaration-of-conformity":
    "제조자가 법적 책임을 지고 'IVDR을 충족한다'고 선언하는 문서다. CE 부착의 법적 근거이자 책임 소재의 명문화다.",
  "ce-marking-application":
    "CE는 EU 시장 출시 자격의 표식이다. 올바른 부착으로 합법 유통과 사용자 신뢰를 확보한다.",
  "authorised-rep-mandate":
    "역외 제조자는 EU 내 책임 주체가 있어야 한다. 당국·사용자가 연락·책임을 물을 단일 창구를 보장한다.",
  "actor-registration":
    "누가 이 기기를 책임지는지 당국이 식별할 수 있어야 한다. SRN으로 시장 감시의 출발점을 만든다.",
  "device-registration":
    "EUDAMED 등록은 투명한 시장 감시의 전제다. 미등록은 곧 합법 출시 불가이므로 의무 기한 내 완료해야 한다.",
  "udi-assignment":
    "문제 발생 시 어떤 기기인지 전 세계적으로 즉시 식별·추적할 수 있어야 한다. 리콜·추적성의 핵심 인프라다.",
  "pms-plan":
    "출시 전 데이터는 한계가 있다. 시판 후 실사용 데이터로 안전·성능을 계속 확인하는 능동적 감시 체계를 세운다.",
  "pms-report":
    "수집한 PMS 데이터를 정기적으로 종합·결론지어 시판 후 안전을 입증한다.",
  psur:
    "고위험(C·D) 기기는 매년 안전·성능을 갱신 보고해 지속적 적합성을 입증한다. 시간이 지나도 안전함을 보증한다.",
  "pmpf-plan":
    "출시 후에도 성능이 유지되는지 능동적으로 추적해 성능평가를 살아있는 문서로 유지한다.",
  "trend-reporting":
    "사고가 통계적으로 유의하게 늘면 조기 경보가 필요하다. 잠재적 안전 문제를 신호로 포착한다.",
};

export const rationaleFor = (id: string): string | undefined =>
  docRationale[id];

// ---------------------------------------------------------------------
// 문서별 '작성 전 알아야 할 것' — 사전 지식·이해·결정 체크리스트.
// (준비물=확보할 자료 / 지식=머릿속에 정리돼 있어야 할 개념·결정)
// ---------------------------------------------------------------------
export const docKnowledge: Record<string, string[]> = {
  "intended-purpose": [
    "내 제품이 검출/측정하는 정확한 대상과 그 임상적 의미",
    "타깃 사용자·사용 환경(전문가/자가검사, 실험실/가정)",
    "결과가 어떤 임상 결정을 보조하는지",
  ],
  "qualification-statement": [
    "IVDR Art.2의 IVD 정의 요건",
    "내 제품이 정의의 어느 요소에 해당/비해당하는지",
    "경계 사례(연구용·일반 제품)와의 구분 기준",
  ],
  "classification-rationale": [
    "Annex VIII Rule 1~7의 적용 순서와 우선순위",
    "자가검사/근접검사가 분류에 미치는 영향(Rule 4)",
    "둘 이상 해당 시 최고 등급 채택 원칙",
  ],
  "conformity-route-plan": [
    "클래스별 가능한 Annex 경로(IX/X/XI)의 차이",
    "각 경로에서 NB가 심사하는 범위",
    "경로별로 필요한 산출물",
  ],
  "device-description": [
    "기기 구성·작동 원리",
    "변형(variant)·모델 범위",
    "이전 세대·유사 기기와의 차이",
  ],
  "design-manufacturing-info": [
    "핵심 설계 입력·출력",
    "제조 공정의 중요 관리점(CTQ)",
    "외주 vs 자가 제조 구분",
  ],
  "tech-doc-toc-gspr": [
    "Annex I GSPR 각 항목의 의미",
    "내 기기에 적용/비적용되는 요구 구분",
    "충족 증거가 어디에 있는지(추적성)",
  ],
  "labelling-spec": [
    "IVDR이 요구하는 필수 라벨 정보 항목",
    "UDI 캐리어·CE·NB 번호 표기 규칙",
    "적용 심볼 표준(ISO 15223-1)",
  ],
  ifu: [
    "사용자 수준(전문가/비전문가)에 맞는 표현",
    "사용 단계별 위험과 경고",
    "언어·형식 요건",
  ],
  "benefit-risk": [
    "임상적 이익의 정량/정성 근거",
    "잔여 위험의 종류와 수준",
    "이익이 위험을 능가한다는 판단 논리",
  ],
  "stability-study": [
    "실시간 vs 가속 안정성의 차이와 한계",
    "유효기간·개봉 후 사용기간 설정 방법",
    "운송(수송) 조건 시험 요건",
  ],
  "sw-validation": [
    "소프트웨어 안전등급(IEC 62304)",
    "검증 수준(단위/통합/시스템)",
    "사이버보안 위협 모델",
  ],
  "performance-eval-plan": [
    "성능평가 3단(과학·분석·임상)의 관계",
    "각 성능의 수용 기준 설정 방법",
    "필요한 연구 유형",
  ],
  "scientific-validity": [
    "분석물질-임상상태 연관의 근거 수준",
    "문헌 검색·평가 방법",
    "기존 합의·가이드라인 존재 여부",
  ],
  "analytical-performance": [
    "정밀도·정확도·LoD·LoQ 등 지표의 정의",
    "교차반응·간섭 평가 방법",
    "참조 물질·방법",
  ],
  "clinical-performance": [
    "민감도·특이도·예측도의 의미",
    "적절한 대상군·검체 수",
    "연구 설계(전향/후향)와 윤리 요건",
  ],
  "performance-eval-report": [
    "PEP 대비 결과의 충족 여부 판단",
    "잔여 위험·한계의 기술 방법",
    "결론 도출 논리",
  ],
  "risk-management-plan": [
    "ISO 14971 위험관리 흐름",
    "위험 수용 기준 설정 방법",
    "위험-요구-성능 추적의 의미",
  ],
  "risk-management-file": [
    "위해요인→위험상황→위해 연결 방법",
    "통제수단 우선순위(설계>보호>정보)",
    "잔여위험 평가·공개",
  ],
  "usability-file": [
    "사용 시나리오·핵심 작업 도출",
    "형성평가 vs 총괄평가 차이",
    "사용 오류와 위험의 연결",
  ],
  "qms-ivdr-matrix": [
    "ISO 13485와 IVDR 요구의 차이",
    "IVDR 고유 프로세스 목록",
    "절차서-요구 매핑 방법",
  ],
  "doc-record-control": [
    "문서 vs 기록의 구분",
    "버전·승인·배포 통제 원칙",
    "보존 기간 요건",
  ],
  "capa-sop": [
    "시정 vs 예방 vs 수정의 차이",
    "근본원인 분석 기법",
    "유효성 검증 방법",
  ],
  "supplier-control": [
    "핵심/비핵심 공급자 구분",
    "공급자 평가·재평가 기준",
    "변경 통제 흐름",
  ],
  "complaint-handling": [
    "불만의 정의와 범위",
    "중대성·보고 대상 판단 기준",
    "조사·기록 요건",
  ],
  "vigilance-sop": [
    "중대사고·FSCA의 정의",
    "보고 기한과 대상 당국",
    "동향 보고와의 관계",
  ],
  "nb-application": [
    "내 클래스의 NB 개입 여부",
    "NB scope(NANDO)와 매칭",
    "심사 단계·소요 기간",
  ],
  "declaration-of-conformity": [
    "Annex IV 필수 기재 항목",
    "제조자 책임의 의미",
    "기술문서·라벨과의 일관성",
  ],
  "ce-marking-application": [
    "CE 부착 규칙과 크기·위치",
    "NB 번호 병기 조건",
    "오부착의 법적 위험",
  ],
  "authorised-rep-mandate": [
    "EU 대리인의 법적 책임 범위",
    "위임에 포함/제외되는 사항",
    "수입자·유통자와의 관계",
  ],
  "actor-registration": [
    "행위자 역할(제조자/대리인/수입자) 구분",
    "SRN 발급 절차",
    "기기 등록과의 선후 관계",
  ],
  "device-registration": [
    "Basic UDI-DI와 UDI-DI의 관계",
    "EUDAMED 모듈·의무 시점",
    "레거시 기기 등록 기한",
  ],
  "udi-assignment": [
    "UDI-DI/PI의 구성",
    "발행기관(GS1 등) 선택",
    "라벨 캐리어 형식·판독 요건",
  ],
  "pms-plan": [
    "능동 vs 수동 PMS 데이터",
    "지표·주기·임계값 설정",
    "PMS→성능→위험 환류 경로",
  ],
  "pms-report": [
    "PMS 보고 대상 등급",
    "데이터 종합·결론 방법",
    "PSUR과의 구분",
  ],
  psur: [
    "PSUR 주기(클래스별)",
    "포함해야 할 데이터",
    "NB·EUDAMED 제출 흐름",
  ],
  "pmpf-plan": [
    "PMPF가 필요한 경우 판단",
    "추적 지표·방법 설계",
    "PER 갱신과의 연계",
  ],
  "trend-reporting": [
    "트렌드 보고의 발동 기준(통계적 유의)",
    "기준선 설정 방법",
    "보고 경로",
  ],
};

export const knowledgeFor = (id: string): string[] | undefined =>
  docKnowledge[id];

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
