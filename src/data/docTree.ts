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
        detailed: true,
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
        detailed: true,
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
        detailed: true,
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
        detailed: true,
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
        id: "biocompatibility",
        title: "생체적합성 평가 (ISO 10993)",
        refs: ["ISO 10993", "Annex I"],
        stationId: 7,
        requirement: "ifApplicable",
        note: "환자·사용자 접촉부가 있을 때.",
        prerequisites: [
          P("doc", "접촉부·재질 목록"),
          P("test", "세포독성 등 생물학적 시험 데이터"),
          P("data", "화학적 특성평가"),
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
      {
        id: "cybersecurity",
        title: "사이버보안 문서 (MDCG 2019-16)",
        refs: ["MDCG 2019-16", "Annex I 16.2"],
        stationId: 5,
        requirement: "conditional",
        note: "소프트웨어·연결(앱 연동) 기기는 사실상 필수.",
        prerequisites: [
          P("doc", "SW 아키텍처·데이터 흐름도"),
          P("data", "위협 모델·자산 식별"),
          P("test", "보안 검증·침투 시험"),
        ],
      },
    ],
  },
  {
    id: "design",
    title: "설계관리 (Design Control)",
    refs: ["ISO 13485 7.3"],
    colorVar: "--p4",
    items: [
      { id: "dd-plan", title: "설계·개발 계획서", refs: ["ISO 13485 7.3.2"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "의도된 목적·요구사항"), P("data", "단계·일정·책임 배분"), P("other", "검토·검증·밸리데이션 시점 계획")] },
      { id: "design-inputs", title: "설계 입력 (Design Inputs)", refs: ["ISO 13485 7.3.3", "Annex I"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "의도된 목적·GSPR"), P("data", "사용자·성능·안전 요구"), P("other", "적용 규격 목록")] },
      { id: "design-outputs", title: "설계 출력 (Design Outputs)", refs: ["ISO 13485 7.3.4"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "설계 입력"), P("data", "사양·도면·BOM"), P("other", "수용 기준")] },
      { id: "design-review", title: "설계 검토 (Design Review)", refs: ["ISO 13485 7.3.5"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "단계별 산출물"), P("data", "검토 항목·참석자"), P("other", "미결 조치 추적")] },
      { id: "design-verification", title: "설계 검증 (Verification)", refs: ["ISO 13485 7.3.6"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "설계 입력·출력"), P("test", "검증 시험 데이터"), P("data", "입력-출력 대응 증거")] },
      { id: "design-validation", title: "설계 밸리데이션 (Validation)", refs: ["ISO 13485 7.3.7"], stationId: 6, requirement: "required",
        prerequisites: [P("doc", "의도된 목적·사용 시나리오"), P("test", "실사용 조건 밸리데이션 데이터"), P("other", "대표 제품·사용자")] },
      { id: "design-transfer", title: "설계 이관 (Design Transfer)", refs: ["ISO 13485 7.3.8"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "설계 출력·DMR"), P("data", "생산 사양 적합성"), P("other", "이관 체크리스트")] },
      { id: "design-changes", title: "설계 변경 관리", refs: ["ISO 13485 7.3.9"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "변경 요청·영향평가"), P("data", "위험·규제 영향"), P("other", "재검증 범위")] },
      { id: "dhf", title: "설계이력파일 (DHF)", refs: ["ISO 13485 7.3.10"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "전 설계 단계 기록"), P("data", "색인·추적 구조")] },
      { id: "traceability-matrix", title: "요구사항 추적성 매트릭스", refs: ["ISO 13485 7.3", "Annex I"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "GSPR·설계입력·검증·위험"), P("data", "요구-증거 매핑")] },
    ],
  },
  {
    id: "production",
    title: "생산·공정 (Production)",
    refs: ["ISO 13485 7.5"],
    colorVar: "--p2",
    items: [
      { id: "process-validation", title: "공정 밸리데이션 (IQ/OQ/PQ)", refs: ["ISO 13485 7.5.6"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "공정 흐름·관리점"), P("test", "IQ·OQ·PQ 데이터"), P("data", "공정 파라미터·수용 기준")] },
      { id: "sterilization-validation", title: "멸균 밸리데이션", refs: ["ISO 11135", "ISO 11137"], stationId: 5, requirement: "ifApplicable", note: "멸균 기기에 한함.",
        prerequisites: [P("test", "멸균 밸리데이션 데이터"), P("data", "SAL·잔류물 기준"), P("doc", "포장·무균보증")] },
      { id: "dmr", title: "기기 마스터 기록 (DMR)", refs: ["ISO 13485 4.2.3"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "사양·도면·BOM·작업지시"), P("data", "라벨·검사 기준")] },
      { id: "dhr", title: "기기 이력 기록 (DHR/배치기록)", refs: ["ISO 13485 7.5.1"], stationId: 5, requirement: "required",
        prerequisites: [P("data", "생산·검사·릴리스 기록"), P("doc", "배치 추적 구조")] },
      { id: "packaging-validation", title: "포장·멸균배리어 밸리데이션 (ISO 11607)", refs: ["ISO 11607-1", "ISO 11607-2"], stationId: 5, requirement: "ifApplicable", note: "멸균 기기 한정 — 멸균 밸리데이션과 별개.",
        prerequisites: [P("test", "밀봉·무결성·노화 시험"), P("data", "포장 사양·공정 파라미터"), P("doc", "운송 시뮬레이션")] },
      { id: "product-preservation", title: "취급·보관·포장·배송 관리", refs: ["ISO 13485 7.5.11"], stationId: 5, requirement: "required",
        prerequisites: [P("doc", "보관·취급 조건"), P("data", "콜드체인·유효기간 관리"), P("other", "배송 검증")] },
      { id: "transport-validation", title: "운송(수송) 밸리데이션 (ASTM D4169/ISTA)", refs: ["ISO 13485 7.5.11", "IVDR Annex I 9", "ASTM D4169", "ISTA 3A"], stationId: 5, requirement: "ifApplicable", note: "운송 중 온도 이탈·진동·낙하가 시약·기기 성능에 영향을 줄 때 (대부분의 IVD 시약 해당).",
        prerequisites: [P("test", "운송 시뮬레이션(진동·낙하·온도) 시험 데이터"), P("data", "콜드체인 온도 모니터링 로그"), P("doc", "포장 사양·안정성 시험 결과")] },
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
          P("doc", "의도된 목적 정의서 (intended-purpose)"),
          P("doc", "분류 근거서 — Class 확정 필요"),
          P("data", "분석물질-임상상태 연관 주요 문헌 3편 이상"),
          P("data", "경쟁 제품 성능 사양 벤치마크"),
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
        detailed: true,
        note: "PEP→데이터→PER로 종결.",
        prerequisites: [
          P("doc", "PEP·과학적타당성·분석·임상 보고서"),
          P("data", "종합 성능 결론·잔여 위험"),
        ],
      },
      {
        id: "metrological-traceability",
        title: "계측학적 추적성 (지정값)",
        refs: ["Annex I 9.4", "ISO 17511"],
        stationId: 6,
        requirement: "ifApplicable",
        note: "정량 검사 — 교정물질·관리물질 지정값에 적용.",
        prerequisites: [
          P("doc", "교정 계층·참조 물질"),
          P("test", "값 지정(value assignment) 데이터"),
          P("data", "측정 불확도 추정"),
        ],
      },
      {
        id: "clinical-performance-study-plan",
        title: "임상·성능 연구 계획서/신청 (CPSP)",
        refs: ["Annex XIII Part A", "Annex XIV", "Art.58"],
        stationId: 6,
        requirement: "conditional",
        note: "중재적 임상성능 연구 시 — 윤리 승인·EUDAMED 신청.",
        prerequisites: [
          P("doc", "연구 가설·의도된 목적"),
          P("data", "연구 설계·검체·통계"),
          P("other", "윤리위원회·당국 신청 양식"),
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
          P("doc", "의도된 목적 정의서 — 사용자·환경 확정 필요"),
          P("doc", "기기 설명서·사양 (Annex II 1.1)"),
          P("data", "FMEA 또는 FTA 분석 결과 (초안)"),
          P("data", "유사 기기 불만·바이질런스 데이터 (있을 경우)"),
        ],
      },
      {
        id: "risk-management-file",
        title: "위험관리 파일·보고서",
        refs: ["ISO 14971:2019"],
        stationId: 7,
        requirement: "required",
        detailed: true,
        prerequisites: [
          P("doc", "위험관리 계획"),
          P("test", "통제수단 검증 데이터"),
          P("data", "잔여위험 평가 결과"),
        ],
      },
      {
        id: "fmea",
        title: "FMEA (고장모드 영향분석)",
        refs: ["ISO 14971:2019", "IEC 60812"],
        stationId: 7,
        requirement: "ifApplicable",
        note: "ISO 14971 위험분석의 상향식 기법 — 설계(dFMEA)·공정(pFMEA)·사용(uFMEA)으로 적용. FMEA는 의무가 아니나 실무 표준.",
        prerequisites: [
          P("doc", "위험관리 계획·기기 기능/부품 목록"),
          P("data", "고장모드·원인·영향 후보 목록"),
          P("other", "심각도·발생도·검출도 평가 척도(RPN 기준)"),
        ],
      },
      {
        id: "usability-file",
        title: "사용적합성(IEC 62366) 계획·보고서",
        refs: ["IEC 62366-1", "Annex I"],
        stationId: 7,
        requirement: "conditional",
        detailed: true,
        note: "자가검사·근접검사 필수.",
        prerequisites: [
          P("doc", "사용 시나리오·사용자 프로파일"),
          P("test", "형성·총괄 사용적합성 평가 데이터"),
          P("photo", "UI·라벨·IFU 이미지"),
        ],
      },
      {
        id: "fta",
        title: "FTA (결함수 분석)",
        refs: ["IEC 61025", "ISO 14971"],
        stationId: 7,
        requirement: "ifApplicable",
        note: "하향식(top-down) 분석 — FMEA(상향식)를 보완.",
        prerequisites: [
          P("doc", "정의된 최상위 위해사건"),
          P("data", "고장 논리·확률"),
          P("other", "FMEA 결과 연계"),
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
      { id: "prrc", title: "규제준수책임자(PRRC) 지정", refs: ["Art.15"], stationId: 4, requirement: "required",
        prerequisites: [P("doc", "자격·경력 증빙"), P("data", "책임·권한 기술"), P("other", "조직도·위임")] },
      { id: "quality-manual", title: "품질매뉴얼", refs: ["ISO 13485 4.2.2"], stationId: 4, requirement: "required", detailed: true,
        prerequisites: [P("doc", "QMS 범위·프로세스 맵"), P("other", "절차 상호참조")] },
      { id: "management-review", title: "경영검토", refs: ["ISO 13485 5.6"], stationId: 4, requirement: "required",
        prerequisites: [P("data", "품질목표·KPI·심사·불만 데이터"), P("doc", "입력 자료"), P("other", "조치 추적")] },
      { id: "internal-audit", title: "내부심사", refs: ["ISO 13485 8.2.4"], stationId: 4, requirement: "required",
        prerequisites: [P("doc", "심사 계획·체크리스트"), P("data", "심사원 자격"), P("other", "부적합 추적")] },
      { id: "training-competence", title: "교육훈련·역량", refs: ["ISO 13485 6.2"], stationId: 4, requirement: "required",
        prerequisites: [P("doc", "직무별 역량 요건"), P("data", "교육 이력"), P("other", "효과성 평가 방법")] },
      { id: "calibration-maintenance", title: "교정·유지보수", refs: ["ISO 13485 6.3", "7.6"], stationId: 4, requirement: "required",
        prerequisites: [P("data", "장비 목록·교정 주기"), P("doc", "교정 성적서"), P("other", "국가표준 추적성")] },
      { id: "nonconforming-product", title: "부적합품 관리 (NCR)", refs: ["ISO 13485 8.3"], stationId: 4, requirement: "required",
        prerequisites: [P("doc", "부적합 처리 절차"), P("data", "식별·격리·처리 기준"), P("other", "CAPA 연계")] },
      { id: "quality-policy-org", title: "품질방침·조직 R&R", refs: ["ISO 13485 5.3", "5.5"], stationId: 4, requirement: "required",
        prerequisites: [P("doc", "품질방침문"), P("data", "조직도·책임권한"), P("other", "경영대리인 지정")] },
      { id: "qms-software-validation", title: "QMS 소프트웨어 밸리데이션 (CSV)", refs: ["ISO 13485 4.1.6"], stationId: 4, requirement: "conditional", note: "eQMS·ERP 등 QMS용 SW — 제품 SW검증과 별개.",
        prerequisites: [P("doc", "대상 SW·용도 목록"), P("data", "위험 기반 밸리데이션 범위"), P("test", "IQ/OQ·시나리오 테스트")] },
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
      { id: "ssp", title: "안전성·성능 요약 (SSP)", refs: ["Art.29"], stationId: 9, requirement: "conditional", note: "Class C·D 필수 — EUDAMED 공개.",
        prerequisites: [P("doc", "PER·위험·임상성능 요약"), P("data", "대상 사용자·잔여위험"), P("other", "일반인 가독 버전")] },
      { id: "importer-distributor", title: "수입자·유통자 의무 점검", refs: ["Art.13~14"], stationId: 10, requirement: "ifApplicable", note: "EU 내 수입자·유통자가 있을 때.",
        prerequisites: [P("doc", "공급망·계약"), P("data", "검증 항목(라벨·DoC·UDI)")] },
      { id: "cs-compliance", title: "공통기술규격(CS) 적합성", refs: ["Art.9"], stationId: 3, requirement: "ifApplicable", note: "Class D·CS 지정 품목 한정.",
        prerequisites: [P("doc", "적용 CS 목록"), P("data", "CS 요구 대비 충족 증거"), P("other", "미적용 시 동등 이상 정당화")] },
      { id: "eurl-batch-verification", title: "EU 기준검사실(EURL) 배치검증 대응", refs: ["Art.48", "Annex IX 4.12"], stationId: 8, requirement: "ifApplicable", note: "Class D 한정 — 출하 전 EURL 검증.",
        prerequisites: [P("doc", "배치 릴리스 절차"), P("data", "EURL 제출 시료·사양"), P("other", "EURL 지정 현황 확인")] },
      { id: "cdx-consultation", title: "동반진단 당국·EMA 협의", refs: ["Art.48(5)"], stationId: 3, requirement: "ifApplicable", note: "동반진단(CDx) 한정.",
        prerequisites: [P("doc", "연관 의약품·적응증"), P("data", "CDx 의도된 목적"), P("other", "EMA·당국 협의 기록")] },
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
          P("doc", "성능평가 보고서 (PER) — 기준점 성능 지표"),
          P("doc", "위험관리 파일 — 갱신 트리거 조건"),
          P("data", "고객 불만·바이질런스 수집 채널 (ERP/CRM)"),
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
      {
        id: "fsca-recall",
        title: "현장안전조치(FSCA)·리콜 절차",
        refs: ["Art.84"],
        stationId: 11,
        requirement: "required",
        prerequisites: [
          P("doc", "바이질런스 절차"),
          P("data", "트리거·범위 결정 기준"),
          P("other", "당국·고객 공지 경로"),
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
    "IVDR Annex XIII은 '증거 기반' 성능평가를 요구한다. PEP는 PER보다 먼저 작성해 NB·시험기관과 설계를 합의하는 청사진이다. MDCG 2025-5는 성능연구 유형과 절차를 명확히 하고 있다.",
  "scientific-validity":
    "측정 대상이 정말 그 임상 상태와 연관되는지가 모든 성능의 전제다. 이 전제가 무너지면 분석·임상 성능 데이터도 무의미해진다.",
  "analytical-performance":
    "기기가 측정값을 정확·정밀하게 내는지 입증해야 결과를 신뢰할 수 있다. 검사 결과의 기술적 신뢰성의 근거다.",
  "clinical-performance":
    "정확한 측정값이 실제 임상 판단에서 유효한지(민감도·특이도)를 보여야 한다. 환자에게 실질적 가치가 있음을 입증한다.",
  "performance-eval-report":
    "흩어진 성능 증거를 하나의 결론으로 종합해 '이 기기는 의도된 목적에 충분하다'를 선언한다. NB 심사의 핵심 산출물이다.",
  "risk-management-plan":
    "IVDR Annex I GSPR 8조는 위험관리가 제품 수명 전주기에 걸쳐 수행돼야 한다고 규정한다. 위험이 없다고 주장하는 것은 NB가 수용하지 않으며, 잔여위험의 수용 근거가 명확해야 한다.",
  "risk-management-file":
    "계획대로 위험이 실제로 통제·검증되었는지 증거로 남겨야 한다. 잔여위험이 수용 가능함을 입증하는 책임 기록이다.",
  fmea:
    "FMEA는 부품·공정·사용 단계의 잠재 고장이 어떤 위해로 이어지는지 짚는 상향식(bottom-up) 분석이다. '무엇이 어떻게 잘못될 수 있는가'를 빠짐없이 드러내 통제수단을 설계하고, ISO 14971 위험관리 파일을 구체적 근거로 뒷받침하기 위함이다.",
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
    "IVDR 인증은 출시 시점의 결과물이 아니라 지속적 의무다. MDCG 2025-10은 MDR/IVDR 통합 PMS 지침을 제공한다. Class C·D는 매년 PSUR을 제출해야 하며, SSCP도 의무다.",
  "pms-report":
    "수집한 PMS 데이터를 정기적으로 종합·결론지어 시판 후 안전을 입증한다.",
  psur:
    "고위험(C·D) 기기는 매년 안전·성능을 갱신 보고해 지속적 적합성을 입증한다. 시간이 지나도 안전함을 보증한다.",
  "pmpf-plan":
    "출시 후에도 성능이 유지되는지 능동적으로 추적해 성능평가를 살아있는 문서로 유지한다.",
  "trend-reporting":
    "사고가 통계적으로 유의하게 늘면 조기 경보가 필요하다. 잠재적 안전 문제를 신호로 포착한다.",
  ssp: "SSP는 기기의 안전·성능을 일반인이 볼 수 있게 공개 요약하는 IVDR 고유 문서다. 투명성으로 사용자 신뢰와 정보에 입각한 선택을 보장한다(Class C·D 필수).",
  prrc: "PRRC는 규제 준수를 책임지는 자격 있는 담당자를 명문화해, 적합성·바이질런스·기술문서 관리의 책임 소재를 분명히 한다.",
  "metrological-traceability":
    "정량 IVD 결과가 신뢰되려면 지정값이 상위 참조까지 추적 가능해야 한다. 검사실 간·시점 간 결과 일관성을 보장한다.",
  "dd-plan": "설계는 계획 없이 진행되면 누락·재작업이 발생한다. 단계·책임·검토 시점을 정의해 통제된 개발을 보장한다.",
  "design-inputs": "출발점인 요구사항이 불완전하면 이후 모든 산출물이 흔들린다. 무엇을 만들지 명확·검증 가능하게 정의한다.",
  "design-outputs": "설계 입력이 실제 제품 사양으로 정확히 번역되었는지 보장한다. 생산·검증의 기준이 된다.",
  "design-review": "각 단계에서 문제를 조기에 발견·해결해 후공정 결함과 비용을 줄인다.",
  "design-verification": "설계 출력이 입력 요구를 충족하는지(‘제대로 만들었는가’)를 객관적으로 입증한다.",
  "design-validation": "실사용 조건에서 의도된 목적을 달성하는지(‘맞는 것을 만들었는가’)를 입증한다.",
  "design-transfer": "설계가 일관된 양산으로 정확히 옮겨졌음을 보장해 제품 품질의 재현성을 확보한다.",
  "design-changes": "변경이 안전·성능·규제에 미치는 영향을 통제해 의도치 않은 위험 도입을 막는다.",
  dhf: "설계 전 과정의 증거를 한곳에 묶어 추적성과 심사 대응력을 확보한다.",
  "traceability-matrix":
    "요구-설계-검증-위험이 서로를 가리키게 해, 빠진 요구나 미검증 항목을 드러낸다.",
  "process-validation":
    "전수검사로 확인할 수 없는 공정이 일관된 결과를 내는지 입증해 품질의 재현성을 보장한다.",
  "sterilization-validation":
    "멸균이 표시된 무균보증수준(SAL)을 실제 달성하는지 입증해 감염 위험을 차단한다.",
  dmr: "기기를 만드는 데 필요한 모든 사양·절차를 한 세트로 정의해 일관된 생산을 보장한다.",
  dhr: "각 배치가 DMR대로 만들어졌음을 기록해 추적성과 리콜 대응을 가능케 한다.",
  "quality-manual":
    "QMS의 범위·구조·프로세스 상호관계를 한눈에 보여주는 최상위 문서로 품질체계의 일관성을 잡는다.",
  "management-review":
    "경영진이 QMS의 적절성·유효성을 정기 점검해 지속적 개선과 자원 배분을 보장한다.",
  "internal-audit":
    "스스로 QMS 준수를 점검해 외부 심사 전에 문제를 발견·시정한다.",
  "training-competence":
    "역량 없는 인력은 품질 위험이다. 직무별 역량을 확보·증빙해 작업 신뢰성을 보장한다.",
  "calibration-maintenance":
    "부정확한 장비는 잘못된 결과·제품을 만든다. 교정·유지보수로 측정·생산 신뢰성을 유지한다.",
  "nonconforming-product":
    "부적합품이 의도치 않게 출하되는 것을 막고, 식별·격리·처리를 통제한다.",
  "importer-distributor":
    "공급망의 각 주체가 의무를 지키는지 점검해 시장에 부적합 제품이 흘러가는 것을 막는다.",
  biocompatibility:
    "환자·사용자와 접촉하는 재질이 생물학적으로 안전한지 입증해 유해반응 위험을 차단한다.",
  fta: "정의된 위해사건이 어떤 고장 조합으로 발생하는지 하향식으로 분석해 FMEA의 상향식 분석을 보완한다.",
  "fsca-recall":
    "시장의 안전 문제에 신속·체계적으로 대응해 추가 피해를 막고 법적 보고 의무를 이행한다.",
  "clinical-performance-study-plan":
    "사람 대상으로 임상 증거를 새로 만들 때는 피험자 안전과 데이터 신뢰성을 위해 사전 계획·윤리 승인·당국 신청이 필수다. 무계획 연구의 데이터는 인정되지 않는다.",
  "cs-compliance":
    "공통기술규격(CS)이 있는 품목은 CS를 충족하거나 동등 이상임을 입증해야 한다. 규제 기대치의 기준선을 맞춰 심사 리스크를 줄인다.",
  "eurl-batch-verification":
    "Class D는 최고위험이라 제3자(EU 기준검사실)의 배치 검증으로 출하 전 안전을 한 번 더 거른다. 미대응 시 합법 출하가 막힌다.",
  "cdx-consultation":
    "동반진단은 특정 의약품 사용을 좌우하므로, 해당 의약품 당국(EMA 등)과 협의해 진단-치료의 임상적 정합성을 보장한다.",
  cybersecurity:
    "연결·소프트웨어 기기는 사이버 위협이 곧 환자 안전·데이터 위험이다. 보안 설계·검증을 문서화해 위협으로 인한 위해와 정보 유출을 막는다.",
  "packaging-validation":
    "멸균 기기는 사용 시점까지 무균이 유지돼야 한다. 멸균배리어(포장)가 유통·노화 후에도 무결함을 입증해 감염 위험을 막는다.",
  "qms-software-validation":
    "QMS를 돌리는 소프트웨어가 오작동하면 품질기록·추적성이 통째로 흔들린다. 사용 전 의도대로 동작함을 검증해 시스템 신뢰성을 확보한다.",
  "product-preservation":
    "유통 과정에서 제품이 손상·변질되면 사용 시점 성능을 보장할 수 없다. 보존 조건을 통제해 출하 후에도 품질을 유지한다.",
  "transport-validation":
    "IVD 시약·기기는 운송 중 온도 이탈·진동·충격을 겪는다. 실제 배송 스트레스를 재현해 도착 시점에도 성능·안정성이 유지됨을 입증, 유통 후 오작동과 오진단 위해를 막는다.",
  "quality-policy-org":
    "품질방침과 책임·권한이 명확해야 QMS가 실제로 작동한다. 누가 무엇을 책임지는지 못 박아 일관된 품질 운영의 토대를 만든다.",
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
    "IVDR Annex XIII — 과학적 타당성·분석적 성능·임상적 성능 3단 개념",
    "MDCG 2025-5 — 성능 연구 유형·절차 명확화 지침",
    "LoD(검출 한계)·LoQ(정량 한계)·정밀도(반복성·재현성) 차이",
    "민감도·특이도·PPV·NPV와 유병률의 관계",
    "참고 측정법(Reference Standard) 비교 연구 설계",
    "Class C·D는 임상 성능 연구가 필요 (Annex XIII Part B)",
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
    "ISO 14971:2019 — 위험관리 프로세스 전체 구조 (7단계)",
    "위해요인(Hazard) vs 위험상황(Hazardous Situation) vs 위해(Harm) 구분",
    "발생가능성(P) × 심각도(S) 위험 수용 기준 행렬 설계",
    "IVD 특유 위해요인: 위양성·위음성 결과가 치료 결정에 미치는 영향",
    "GSPR 8조~18조 각 조항과 위험의 연결 구조",
    "IEC 62366 (사용적합성) — 자가검사·근접검사 제품에 필수 연계",
  ],
  "risk-management-file": [
    "위해요인→위험상황→위해 연결 방법",
    "통제수단 우선순위(설계>보호>정보)",
    "잔여위험 평가·공개",
  ],
  fmea: [
    "dFMEA·pFMEA·uFMEA의 구분과 적용 범위",
    "심각도(S)·발생도(O)·검출도(D)와 RPN 산정 방법",
    "FMEA 결과를 ISO 14971 위험통제·추적표로 연결하는 방법",
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
    "IVDR Annex IV — DoC 필수 기재 항목 (제조자·기기식별·분류·규정·표준·NB·서명)",
    "Basic UDI-DI는 기기 등록 전에 발행기관(GS1 등)에서 발급받아야 함",
    "EU 대리인은 비EU 제조자에게만 해당",
    "Class A(자가측정 제외)만 자기 선언 가능 — B/C/D는 NB 번호 필수",
    "EUDAMED에 DoC 사본 업로드 의무 (2026.01부터 의무화 — EU 2024/1860)",
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
    "IVDR Art.78~81 — PMS·PMPF·PSUR·바이질런스 의무 체계",
    "MDCG 2025-10 — MDR/IVDR 통합 PMS 가이드 (2025.12 시행)",
    "PSUR (Periodic Safety Update Report) — Class C·D 연간, 기타 2년",
    "SSCP (Summary of Safety and Clinical Performance) — Class C·D 의무 공개",
    "PMPF (Post-Market Performance Follow-up) — Annex XIII Part B",
    "EUDAMED 사고 보고 의무 (심각한 사고는 15일 내)",
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
  ssp: ["SSP 의무 대상(Class C·D)", "포함 항목(잔여위험·성능 요약)", "일반인 가독성·언어 요건"],
  prrc: ["PRRC 자격 요건(Art.15)", "책임 범위", "소규모 기업 예외·외부 위임 규정"],
  "metrological-traceability": ["지정값 추적 계층(ISO 17511)", "참조 물질·방법의 등급", "측정 불확도 추정 방법"],
  "dd-plan": ["설계 단계·게이트 구성", "책임·자원 배분", "검토·검증·밸리데이션 시점 계획"],
  "design-inputs": ["요구사항의 검증가능성(measurable)", "GSPR·사용자·규제 입력 출처", "상충 요구의 해소"],
  "design-outputs": ["출력이 입력을 충족하는지 판단", "수용 기준 명시", "생산·검사에 필요한 정보 포함"],
  "design-review": ["검토 시점·참석자 구성", "독립성 요건", "조치사항 추적·종결"],
  "design-verification": ["검증 vs 밸리데이션의 차이", "입력-출력 대응 방법", "표본·통계적 근거"],
  "design-validation": ["실사용 조건·대표성 확보", "사용적합성과의 연계", "초기 생산 단위 사용"],
  "design-transfer": ["이관 기준·체크리스트", "생산 적합성 확인", "양산 초기 모니터링"],
  "design-changes": ["변경 영향평가 범위(안전·성능·규제)", "재검증·재밸리데이션 판단", "NB 통지 필요 여부"],
  dhf: ["DHF에 포함될 기록 범위", "색인·추적 구조", "DMR과의 구분"],
  "traceability-matrix": ["추적 대상(요구-설계-검증-위험)", "매핑 누락 식별 방법", "변경 시 갱신"],
  "process-validation": ["밸리데이션 필요 공정 식별", "IQ/OQ/PQ의 의미", "재밸리데이션 트리거"],
  "sterilization-validation": ["멸균 방식·SAL 개념", "잔류물·생물학적 지표", "재밸리데이션 주기"],
  dmr: ["DMR 구성 항목", "DHF와의 차이", "버전·변경 통제"],
  dhr: ["DHR 필수 기록 항목", "배치 추적성", "릴리스 승인 흐름"],
  "quality-manual": ["품질매뉴얼 필수 내용(4.2.2)", "프로세스 상호작용 표현", "제외(exclusion) 처리"],
  "management-review": ["경영검토 입력·출력 항목", "주기·기록 요건", "조치 추적"],
  "internal-audit": ["심사 프로그램·주기", "심사원 독립성·자격", "부적합·시정 연계"],
  "training-competence": ["직무별 역량 요건 정의", "효과성 평가 방법", "기록 보존"],
  "calibration-maintenance": ["측정장비 식별·주기", "추적성(국가표준)", "이탈 시 영향평가"],
  "nonconforming-product": ["부적합 식별·격리·처리 경로", "특채(concession) 규정", "CAPA·리콜 연계"],
  "importer-distributor": ["수입자·유통자 의무(Art.13~14)", "검증 항목(라벨·DoC·UDI)", "보관·운송 조건"],
  biocompatibility: ["접촉 분류·기간(ISO 10993-1)", "필요 시험 항목 선정", "화학적 특성평가 활용"],
  fta: ["FTA(top-down) vs FMEA(bottom-up)", "논리 게이트·최소 절단집합", "정성/정량 분석"],
  "fsca-recall": ["FSCA·리콜의 정의·구분", "당국 보고 기한·경로", "효과성 점검"],
  "clinical-performance-study-plan": ["중재적 vs 비중재적 성능연구 구분", "Annex XIV 신청·승인 절차", "윤리·동의·피험자 안전 요건"],
  "cs-compliance": ["내 품목에 적용되는 CS 존재 여부", "CS 충족 또는 동등성 입증 방법", "CS와 GSPR·성능의 관계"],
  "eurl-batch-verification": ["Class D EURL 검증 적용 범위", "시료·문서 제출 절차", "EURL 미지정 영역의 전환 규정"],
  "cdx-consultation": ["CDx 정의·해당 여부", "Art.48(5) 협의 절차", "의약품-진단 연계 임상 근거"],
  cybersecurity: ["MDCG 2019-16 보안 요구", "위협 모델링·자산 식별", "보안 위험과 ISO 14971 연계", "시판 후 보안 업데이트 관리"],
  "packaging-validation": ["ISO 11607-1(설계) vs -2(공정)", "밀봉 강도·무결성 시험", "노화·운송 시뮬레이션"],
  "qms-software-validation": ["4.1.6 QMS SW 밸리데이션 요구", "위험 기반 범위 설정", "변경·업그레이드 시 재밸리데이션"],
  "product-preservation": ["보관·취급 조건 정의", "콜드체인·모니터링", "배송 포장·검증"],
  "transport-validation": ["최악 조건 운송 경로·계절 온도 프로파일 정의", "ASTM D4169/ISTA 시험 시퀀스(진동·낙하·압력)", "콜드체인 온도 모니터링·수용 기준", "운송 후 성능·안정성 재확인 방법"],
  "quality-policy-org": ["품질방침·목표 수립", "책임·권한·경영대리인 지정", "조직 변경 관리"],
};

export const knowledgeFor = (id: string): string[] | undefined =>
  docKnowledge[id];

// ---------------------------------------------------------------------
// 문서 작성 순서 — 의존성을 반영한 권장 로드맵(단계별).
// 각 문서는 정확히 한 단계에 속한다.
// ---------------------------------------------------------------------
export interface OrderStep {
  step: number;
  title: string;
  why: string;
  docIds: string[];
}

export const docOrder: OrderStep[] = [
  {
    step: 1,
    title: "범위·분류 확정",
    why: "의도된 목적이 분류·경로·모든 증거의 기준 — 가장 먼저 못 박는다.",
    docIds: ["intended-purpose", "qualification-statement", "classification-rationale", "conformity-route-plan"],
  },
  {
    step: 2,
    title: "QMS 토대 구축",
    why: "QMS는 전체에 깔리는 바닥. 문서·인력·책임 체계를 먼저 세운다.",
    docIds: ["quality-manual", "quality-policy-org", "qms-ivdr-matrix", "prrc", "doc-record-control", "supplier-control", "training-competence", "calibration-maintenance", "qms-software-validation"],
  },
  {
    step: 3,
    title: "설계관리",
    why: "무엇을 만들지(설계)가 정해져야 검증·성능·위험의 대상이 생긴다.",
    docIds: ["dd-plan", "design-inputs", "design-outputs", "design-review", "design-verification", "design-validation", "design-transfer", "design-changes", "dhf", "traceability-matrix"],
  },
  {
    step: 4,
    title: "위험관리 (설계와 병행)",
    why: "설계와 나란히 위험을 식별·통제. 이후 성능·이익위험의 입력이 된다.",
    docIds: ["risk-management-plan", "fmea", "fta", "usability-file", "risk-management-file"],
  },
  {
    step: 5,
    title: "성능 증거",
    why: "성능은 계획(PEP) 먼저, 그 다음 데이터 → 보고서(PER).",
    docIds: ["performance-eval-plan", "scientific-validity", "analytical-performance", "clinical-performance", "clinical-performance-study-plan", "stability-study", "metrological-traceability", "performance-eval-report"],
  },
  {
    step: 6,
    title: "생산·공정 검증",
    why: "양산 공정이 일관된 결과를 내는지 검증한다.",
    docIds: ["process-validation", "sterilization-validation", "packaging-validation", "dmr", "dhr", "product-preservation", "transport-validation"],
  },
  {
    step: 7,
    title: "기기 정보·안전",
    why: "기기 설명·라벨·IFU와 안전 증거를 정리(이익-위험 포함).",
    docIds: ["device-description", "design-manufacturing-info", "sw-validation", "cybersecurity", "biocompatibility", "labelling-spec", "ifu", "benefit-risk"],
  },
  {
    step: 8,
    title: "기술문서 통합",
    why: "앞의 모든 증거를 GSPR 체크리스트로 묶어 기술문서를 완성한다.",
    docIds: ["tech-doc-toc-gspr"],
  },
  {
    step: 9,
    title: "적합성 평가·인증",
    why: "NB 심사 → 적합성 선언(DoC) → CE → SSP(Class C·D).",
    docIds: ["nb-application", "declaration-of-conformity", "ce-marking-application", "ssp", "cs-compliance", "eurl-batch-verification", "cdx-consultation"],
  },
  {
    step: 10,
    title: "등록·시장 진입",
    why: "EUDAMED 행위자·UDI·기기 등록으로 합법 출시.",
    docIds: ["actor-registration", "udi-assignment", "device-registration", "authorised-rep-mandate", "importer-distributor"],
  },
  {
    step: 11,
    title: "시판 후·지속 운영",
    why: "출시 후에도 PMS·바이질런스·CAPA·심사로 루프를 유지한다.",
    docIds: ["pms-plan", "pmpf-plan", "pms-report", "psur", "trend-reporting", "vigilance-sop", "complaint-handling", "capa-sop", "nonconforming-product", "fsca-recall", "internal-audit", "management-review"],
  },
];

/** 잎 id → 그룹 색 (작성순서 칩 색). */
export function colorForLeaf(id: string): string {
  for (const g of docTree) if (g.items.some((l) => l.id === id)) return g.colorVar;
  return "--text-muted";
}

// ---------------------------------------------------------------------
// 문서별 작성 난이도 / 중요도 (편집 판단 — 제품·조직에 따라 가변).
// difficulty: low 낮음 / med 보통 / high 높음
// importance: low 보통 / med 높음 / high 필수
// ---------------------------------------------------------------------
export type Level = "low" | "med" | "high";
export const difficultyLabel: Record<Level, string> = { low: "낮음", med: "보통", high: "높음" };
export const importanceLabel: Record<Level, string> = { low: "보통", med: "높음", high: "필수" };
export const levelRank: Record<Level, number> = { low: 1, med: 2, high: 3 };

export interface DocMeta {
  difficulty: Level;
  importance: Level;
}

export const docMeta: Record<string, DocMeta> = {
  "intended-purpose": { difficulty: "med", importance: "high" },
  "qualification-statement": { difficulty: "low", importance: "med" },
  "classification-rationale": { difficulty: "med", importance: "high" },
  "conformity-route-plan": { difficulty: "low", importance: "high" },
  "device-description": { difficulty: "low", importance: "med" },
  "design-manufacturing-info": { difficulty: "med", importance: "med" },
  "tech-doc-toc-gspr": { difficulty: "high", importance: "high" },
  "labelling-spec": { difficulty: "med", importance: "high" },
  ifu: { difficulty: "med", importance: "high" },
  "benefit-risk": { difficulty: "high", importance: "high" },
  "stability-study": { difficulty: "high", importance: "high" },
  "sw-validation": { difficulty: "high", importance: "med" },
  biocompatibility: { difficulty: "high", importance: "med" },
  "dd-plan": { difficulty: "low", importance: "med" },
  "design-inputs": { difficulty: "med", importance: "high" },
  "design-outputs": { difficulty: "med", importance: "high" },
  "design-review": { difficulty: "low", importance: "med" },
  "design-verification": { difficulty: "high", importance: "high" },
  "design-validation": { difficulty: "high", importance: "high" },
  "design-transfer": { difficulty: "med", importance: "med" },
  "design-changes": { difficulty: "med", importance: "med" },
  dhf: { difficulty: "low", importance: "med" },
  "traceability-matrix": { difficulty: "high", importance: "high" },
  "process-validation": { difficulty: "high", importance: "high" },
  "sterilization-validation": { difficulty: "high", importance: "med" },
  dmr: { difficulty: "med", importance: "med" },
  dhr: { difficulty: "low", importance: "med" },
  "performance-eval-plan": { difficulty: "high", importance: "high" }, // already highest level
  "scientific-validity": { difficulty: "med", importance: "high" },
  "analytical-performance": { difficulty: "high", importance: "high" },
  "clinical-performance": { difficulty: "high", importance: "high" },
  "performance-eval-report": { difficulty: "high", importance: "high" },
  "metrological-traceability": { difficulty: "high", importance: "med" },
  "risk-management-plan": { difficulty: "high", importance: "high" },
  "risk-management-file": { difficulty: "high", importance: "high" },
  fmea: { difficulty: "high", importance: "med" },
  fta: { difficulty: "med", importance: "low" },
  "usability-file": { difficulty: "high", importance: "med" },
  "qms-ivdr-matrix": { difficulty: "med", importance: "high" },
  "doc-record-control": { difficulty: "low", importance: "med" },
  "capa-sop": { difficulty: "med", importance: "high" },
  "supplier-control": { difficulty: "med", importance: "med" },
  "complaint-handling": { difficulty: "low", importance: "high" },
  "vigilance-sop": { difficulty: "med", importance: "high" },
  prrc: { difficulty: "low", importance: "high" },
  "quality-manual": { difficulty: "med", importance: "high" },
  "management-review": { difficulty: "low", importance: "med" },
  "internal-audit": { difficulty: "med", importance: "high" },
  "training-competence": { difficulty: "low", importance: "med" },
  "calibration-maintenance": { difficulty: "low", importance: "med" },
  "nonconforming-product": { difficulty: "low", importance: "med" },
  "nb-application": { difficulty: "high", importance: "high" },
  "declaration-of-conformity": { difficulty: "med", importance: "high" },
  "ce-marking-application": { difficulty: "low", importance: "high" },
  "authorised-rep-mandate": { difficulty: "low", importance: "med" },
  ssp: { difficulty: "med", importance: "high" },
  "importer-distributor": { difficulty: "low", importance: "med" },
  "actor-registration": { difficulty: "low", importance: "high" },
  "device-registration": { difficulty: "med", importance: "high" },
  "udi-assignment": { difficulty: "med", importance: "high" },
  "pms-plan": { difficulty: "med", importance: "high" },
  "pms-report": { difficulty: "med", importance: "med" },
  psur: { difficulty: "high", importance: "high" },
  "pmpf-plan": { difficulty: "med", importance: "med" },
  "trend-reporting": { difficulty: "low", importance: "low" },
  "fsca-recall": { difficulty: "med", importance: "high" },
  "clinical-performance-study-plan": { difficulty: "high", importance: "high" },
  "cs-compliance": { difficulty: "med", importance: "med" },
  "eurl-batch-verification": { difficulty: "med", importance: "high" },
  "cdx-consultation": { difficulty: "med", importance: "med" },
  cybersecurity: { difficulty: "high", importance: "high" },
  "packaging-validation": { difficulty: "high", importance: "med" },
  "qms-software-validation": { difficulty: "med", importance: "med" },
  "product-preservation": { difficulty: "low", importance: "med" },
  "transport-validation": { difficulty: "med", importance: "med" },
  "quality-policy-org": { difficulty: "low", importance: "med" },
};

export const metaFor = (id: string): DocMeta | undefined => docMeta[id];

// ---------------------------------------------------------------------
// 미리 만들어두면 좋은 문서 — 이 문서를 쓰기 전에 준비해두면 좋은 선행/관련 문서.
// 값은 다른 잎 id. 빈 배열이면 선행 문서 없음(여정 초입).
// ---------------------------------------------------------------------
export const docPrep: Record<string, string[]> = {
  "intended-purpose": [],
  "qualification-statement": ["intended-purpose"],
  "classification-rationale": ["intended-purpose", "qualification-statement"],
  "conformity-route-plan": ["classification-rationale"],
  "device-description": ["intended-purpose", "design-outputs"],
  "design-manufacturing-info": ["design-outputs", "dmr"],
  "tech-doc-toc-gspr": ["risk-management-file", "performance-eval-report", "design-verification"],
  "labelling-spec": ["intended-purpose", "udi-assignment", "ifu"],
  ifu: ["intended-purpose", "usability-file", "risk-management-file"],
  "benefit-risk": ["risk-management-file", "performance-eval-report"],
  "stability-study": ["device-description"],
  "sw-validation": ["design-inputs", "risk-management-plan"],
  biocompatibility: ["device-description"],
  cybersecurity: ["sw-validation", "risk-management-plan"],
  "dd-plan": ["intended-purpose", "qms-ivdr-matrix"],
  "design-inputs": ["intended-purpose", "dd-plan"],
  "design-outputs": ["design-inputs"],
  "design-review": ["dd-plan", "design-inputs", "design-outputs"],
  "design-verification": ["design-inputs", "design-outputs"],
  "design-validation": ["intended-purpose", "design-outputs", "usability-file"],
  "design-transfer": ["design-outputs", "dmr", "process-validation"],
  "design-changes": ["dhf", "risk-management-file"],
  dhf: ["dd-plan", "design-inputs", "design-outputs", "design-verification"],
  "traceability-matrix": ["design-inputs", "design-verification", "risk-management-file"],
  "process-validation": ["design-outputs", "dmr"],
  "sterilization-validation": ["dmr", "packaging-validation"],
  "packaging-validation": ["device-description", "stability-study"],
  dmr: ["design-outputs"],
  dhr: ["dmr", "process-validation"],
  "product-preservation": ["stability-study", "dmr"],
  "transport-validation": ["packaging-validation", "stability-study", "product-preservation"],
  "performance-eval-plan": ["intended-purpose", "classification-rationale"],
  "scientific-validity": ["performance-eval-plan"],
  "analytical-performance": ["performance-eval-plan"],
  "clinical-performance": ["performance-eval-plan", "clinical-performance-study-plan"],
  "clinical-performance-study-plan": ["performance-eval-plan", "intended-purpose"],
  "performance-eval-report": ["scientific-validity", "analytical-performance", "clinical-performance"],
  "metrological-traceability": ["analytical-performance"],
  "risk-management-plan": ["intended-purpose", "device-description"],
  "risk-management-file": ["risk-management-plan", "fmea", "fta", "usability-file"],
  fmea: ["risk-management-plan", "design-outputs"],
  fta: ["risk-management-plan", "fmea"],
  "usability-file": ["intended-purpose", "ifu", "risk-management-plan"],
  "qms-ivdr-matrix": ["quality-manual"],
  "quality-manual": ["quality-policy-org"],
  "quality-policy-org": [],
  "doc-record-control": ["quality-manual"],
  "capa-sop": ["quality-manual", "complaint-handling"],
  "supplier-control": ["quality-manual"],
  "complaint-handling": ["quality-manual"],
  "vigilance-sop": ["complaint-handling"],
  prrc: ["quality-policy-org"],
  "management-review": ["internal-audit", "capa-sop"],
  "internal-audit": ["quality-manual"],
  "training-competence": ["quality-policy-org"],
  "calibration-maintenance": ["quality-manual"],
  "nonconforming-product": ["quality-manual", "capa-sop"],
  "qms-software-validation": ["qms-ivdr-matrix"],
  "nb-application": ["qms-ivdr-matrix", "tech-doc-toc-gspr", "performance-eval-report", "risk-management-file"],
  "declaration-of-conformity": ["tech-doc-toc-gspr", "nb-application"],
  "ce-marking-application": ["declaration-of-conformity", "labelling-spec"],
  "authorised-rep-mandate": [],
  ssp: ["performance-eval-report", "risk-management-file", "benefit-risk"],
  "importer-distributor": ["declaration-of-conformity"],
  "cs-compliance": ["classification-rationale", "tech-doc-toc-gspr"],
  "eurl-batch-verification": ["nb-application", "dhr"],
  "cdx-consultation": ["intended-purpose"],
  "actor-registration": [],
  "device-registration": ["actor-registration", "udi-assignment", "declaration-of-conformity"],
  "udi-assignment": ["labelling-spec"],
  "pms-plan": ["qms-ivdr-matrix", "risk-management-file", "performance-eval-report", "performance-eval-plan"],
  "pms-report": ["pms-plan"],
  psur: ["pms-plan"],
  "pmpf-plan": ["performance-eval-report", "pms-plan"],
  "trend-reporting": ["vigilance-sop"],
  "fsca-recall": ["vigilance-sop"],
};

export const prepDocsFor = (id: string): string[] => docPrep[id] ?? [];

// ---------------------------------------------------------------------
// 예상 소요 기간 — 난이도 기반 추정 프로파일(제품·조직·인력에 따라 가변).
// 단계: 자료 확보 → 맥락 이해 → 작성 → 검토 + RA 피드백 횟수.
// ---------------------------------------------------------------------
export interface DocEffort {
  gather: string; // 자료 확보
  context: string; // 맥락 이해
  draft: string; // 작성
  review: string; // 검토
  raRounds: number; // RA 피드백 횟수
  total: string; // 총 예상 기간
}

export const effortByDifficulty: Record<Level, DocEffort> = {
  low: {
    gather: "2~3일",
    context: "1~2일",
    draft: "2~4일",
    review: "2~3일",
    raRounds: 1,
    total: "약 1~2주",
  },
  med: {
    gather: "1~2주",
    context: "3~5일",
    draft: "1~2주",
    review: "4~5일",
    raRounds: 2,
    total: "약 3~5주",
  },
  high: {
    gather: "3~6주",
    context: "1~2주",
    draft: "2~4주",
    review: "2~3주",
    raRounds: 3,
    total: "약 2~4개월",
  },
};

export const effortFor = (id: string): DocEffort =>
  effortByDifficulty[docMeta[id]?.difficulty ?? "med"];

export function allLeaves(): DocLeaf[] {
  return docTree.flatMap((g) => g.items);
}

export function leafById(id: string): DocLeaf | undefined {
  return allLeaves().find((l) => l.id === id);
}

/** 정거장에서 써야 할 문서 목록. */
export function leavesForStation(stationId: number): DocLeaf[] {
  return allLeaves().filter((l) => l.stationId === stationId);
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
