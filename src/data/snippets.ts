// =====================================================================
// src/data/snippets.ts
// 규제 문서 작성용 표준 문구 라이브러리 (pre-loaded + 사용자 커스텀)
// =====================================================================

export type SnippetCertType = "common" | "ivdr" | "iso13485" | "ivdd" | "mdsap";

export type SnippetCategory =
  | "위험관리"
  | "임상증거"
  | "QMS·절차"
  | "라벨링·IFU"
  | "PMS·Vigilance"
  | "설계관리"
  | "분석·임상 성능"
  | "규정 근거"
  | "MDSAP";

export const SNIPPET_CATEGORIES: SnippetCategory[] = [
  "위험관리",
  "임상증거",
  "QMS·절차",
  "라벨링·IFU",
  "PMS·Vigilance",
  "설계관리",
  "분석·임상 성능",
  "규정 근거",
  "MDSAP",
];

export interface Snippet {
  id: string;
  label: string;
  text: string;
  certTypes: SnippetCertType[];
  category: SnippetCategory;
}

export const SNIPPETS: Snippet[] = [
  // ── 위험관리 ────────────────────────────────────────────────────────
  {
    id: "rm-001",
    label: "위험관리 수행 근거",
    category: "위험관리",
    certTypes: ["common"],
    text: "본 기기의 위험관리 활동은 ISO 14971:2019 및 ISO/TR 24971:2020에 따라 수행되었습니다. 위험관리 파일에는 위험분석, FMEA, 위험 통제 조치 및 잔류 위험 평가가 포함됩니다.",
  },
  {
    id: "rm-002",
    label: "ALARP 잔류 위험 허용 기준",
    category: "위험관리",
    certTypes: ["common"],
    text: "잔류 위험은 ISO 14971 부속서 C의 ALARP(As Low As Reasonably Practicable) 원칙에 따라 평가하였으며, 각 위험의 허용 가능 기준은 위험 정책서(Risk Policy)에 명시된 기준을 충족합니다.",
  },
  {
    id: "rm-003",
    label: "혜택-위험 비교 결론",
    category: "위험관리",
    certTypes: ["common"],
    text: "전반적인 잔류 위험과 기대되는 임상적 혜택을 비교한 결과, 기기의 의도된 사용 목적에 비추어 잔류 위험이 수용 가능하다고 판단하였습니다.",
  },
  {
    id: "rm-004",
    label: "사용 오류 위험 분석",
    category: "위험관리",
    certTypes: ["common"],
    text: "사용 오류(Use Error)로 인한 위험은 IEC 62366-1에 따른 사용성 공학 프로세스와 통합하여 분석하였으며, 위험 통제 조치의 우선순위는 ISO 14971 6항에 따라 설계 단계에서 적용하였습니다.",
  },

  // ── 임상증거 ─────────────────────────────────────────────────────────
  {
    id: "ce-001",
    label: "PMPF 계획 선언",
    category: "임상증거",
    certTypes: ["ivdr"],
    text: "본 기기에 대한 시판 후 임상 추적조사(PMPF)는 IVDR Annex XIV Part B에 따라 수행되며, PMPF 계획에 정의된 기간 및 방법에 따라 실시됩니다.",
  },
  {
    id: "ce-002",
    label: "문헌 검토 방법론",
    category: "임상증거",
    certTypes: ["ivdr"],
    text: "문헌 검토는 MEDLINE, EMBASE를 포함한 주요 데이터베이스를 대상으로 수행하였으며, PICO 프레임워크에 따라 관련성 기준을 설정하고 체계적으로 검색하였습니다.",
  },
  {
    id: "ce-003",
    label: "동등 기기 동등성 주장",
    category: "임상증거",
    certTypes: ["ivdr"],
    text: "동등 기기(Equivalent Device)와의 동등성 주장은 IVDR Article 61(5) 및 MDCG 2020-5 가이던스에 따라 기술적·생물학적·임상적 특성을 비교하여 입증하였습니다.",
  },
  {
    id: "ce-004",
    label: "임상증거 현황 요약",
    category: "임상증거",
    certTypes: ["ivdr"],
    text: "임상증거 평가 보고서(CER/PCER)는 IVDR Annex XIII 및 MDCG 2022-2 가이던스에 따라 작성되었으며, 유용성 평가, 안전성 평가 및 잔류 위험-혜택 분석을 포함합니다.",
  },

  // ── QMS·절차 ─────────────────────────────────────────────────────────
  {
    id: "qms-001",
    label: "QMS 적용 범위 선언",
    category: "QMS·절차",
    certTypes: ["iso13485", "common"],
    text: "당사의 품질경영시스템(QMS)은 ISO 13485:2016에 따라 구축·유지되며, [제품명]의 설계, 개발, 생산 및 서비스 활동에 적용됩니다.",
  },
  {
    id: "qms-002",
    label: "문서 관리 절차 참조",
    category: "QMS·절차",
    certTypes: ["common"],
    text: "본 문서는 품질경영시스템 문서 관리 절차서(QP-[번호])에 따라 작성, 검토, 승인 및 배포되었습니다.",
  },
  {
    id: "qms-003",
    label: "CAPA 개시 기준",
    category: "QMS·절차",
    certTypes: ["common"],
    text: "시정조치 및 예방조치(CAPA)는 내부심사 결과, 고객 불만, 부적합품 처리 또는 위험 평가 결과에 따라 개시되며, 근본 원인 분석(RCA)을 통해 효과성을 검증합니다.",
  },
  {
    id: "qms-004",
    label: "경영 검토 주기 선언",
    category: "QMS·절차",
    certTypes: ["iso13485"],
    text: "경영 검토는 연 1회 이상 정기적으로 실시하며, ISO 13485 5.6항에 명시된 검토 항목(감사 결과, 고객 피드백, 프로세스 성과, 제품 적합성 등)을 포함합니다.",
  },
  {
    id: "qms-005",
    label: "공급자 평가 기준",
    category: "QMS·절차",
    certTypes: ["iso13485"],
    text: "공급자는 ISO 13485 7.4항에 따라 제품 및 서비스에 미치는 영향을 기준으로 선정, 평가 및 재평가하며, 승인된 공급자 목록(ASL)을 유지합니다.",
  },
  {
    id: "qms-006",
    label: "내부심사 프로그램",
    category: "QMS·절차",
    certTypes: ["iso13485"],
    text: "내부심사는 ISO 13485 8.2.4항에 따라 연간 내부심사 계획에 따라 실시되며, 이전 심사 결과, 공정 중요도 및 변경 이력을 고려하여 심사 범위 및 빈도를 결정합니다.",
  },

  // ── 라벨링·IFU ───────────────────────────────────────────────────────
  {
    id: "lbl-001",
    label: "의도된 목적(IFU) 선언",
    category: "라벨링·IFU",
    certTypes: ["ivdr"],
    text: "본 기기의 의도된 목적(Intended Purpose)은 IVDR Article 2(12) 및 Annex I GSPR 20항에 따라 정의되며, 사용 설명서(IFU)에 명시되어 있습니다.",
  },
  {
    id: "lbl-002",
    label: "UDI 할당 및 EUDAMED 등록",
    category: "라벨링·IFU",
    certTypes: ["ivdr"],
    text: "본 기기에는 IVDR Article 24 및 Annex VI에 따른 고유기기식별자(UDI)가 부여되었으며, EUDAMED(유럽 의료기기 데이터베이스)에 등록되어 있습니다.",
  },
  {
    id: "lbl-003",
    label: "CE 마킹 요건",
    category: "라벨링·IFU",
    certTypes: ["ivdr"],
    text: "CE 마킹은 IVDR Article 18에 따라 부착되며, 공인기관(NB) 번호와 함께 표시됩니다. 라벨링은 IVDR Annex I GSPR 20.4항 및 EN ISO 18113 시리즈의 요건을 충족합니다.",
  },
  {
    id: "lbl-004",
    label: "다국어 라벨링 요건",
    category: "라벨링·IFU",
    certTypes: ["ivdr"],
    text: "IFU 및 라벨은 기기가 시판되는 각 EU 회원국의 공식 언어로 제공됩니다. IVDR Article 10(11) 및 Annex I GSPR 20.1항에 따라 언어 번역의 정확성이 검증되었습니다.",
  },

  // ── PMS·Vigilance ────────────────────────────────────────────────────
  {
    id: "pms-001",
    label: "PMS 계획 수립 근거",
    category: "PMS·Vigilance",
    certTypes: ["ivdr"],
    text: "시판 후 감시(PMS) 계획은 IVDR Article 78 및 Annex III에 따라 수립되었으며, 기기 수명주기 동안 지속적으로 업데이트됩니다.",
  },
  {
    id: "pms-002",
    label: "PSUR 작성 주기",
    category: "PMS·Vigilance",
    certTypes: ["ivdr"],
    text: "주기적 안전성 갱신 보고서(PSUR)는 IVDR Article 81에 따라 Class D 기기는 매년, Class B·C 기기는 2년마다 작성하여 EUDAMED에 업로드합니다.",
  },
  {
    id: "pms-003",
    label: "중대 사고 보고 기준",
    category: "PMS·Vigilance",
    certTypes: ["ivdr"],
    text: "중대한 사고(Serious Incident)는 IVDR Article 82에 따라 인지 후 즉시 또는 15일 이내에 관할 당국에 보고합니다. 안전 시정 조치(FSCA)는 MEDDEV 2.12/1 Rev 8 기준을 적용합니다.",
  },
  {
    id: "pms-004",
    label: "PMSR 작성 선언",
    category: "PMS·Vigilance",
    certTypes: ["ivdr"],
    text: "시판 후 감시 보고서(PMSR)는 IVDR Article 80에 따라 Class A·B 기기에 대해 필요 시 작성하며, PMS 계획에서 수집된 데이터의 분석 결과를 포함합니다.",
  },

  // ── 설계관리 ─────────────────────────────────────────────────────────
  {
    id: "dc-001",
    label: "설계 검증(Verification) 선언",
    category: "설계관리",
    certTypes: ["common"],
    text: "설계 검증(Design Verification)은 ISO 13485 7.3.6항에 따라 수행되었으며, 설계 입력 요건 각각에 대한 충족 여부를 검증 프로토콜 및 결과 보고서로 기록하였습니다.",
  },
  {
    id: "dc-002",
    label: "설계 확인(Validation) 선언",
    category: "설계관리",
    certTypes: ["common"],
    text: "설계 확인(Design Validation)은 ISO 13485 7.3.7항 및 IVDR Annex I GSPR에 따라 의도된 사용 환경에서 최종 제품 또는 대표 제품을 사용하여 실시하였습니다.",
  },
  {
    id: "dc-003",
    label: "DHF 구성 요소 선언",
    category: "설계관리",
    certTypes: ["common"],
    text: "설계 이력 파일(DHF)에는 설계 계획, 입력, 출력, 검토, 검증, 확인 및 이관 기록이 포함되며, ISO 13485 7.3항 및 IVDR Annex II의 기술문서 요건을 충족합니다.",
  },
  {
    id: "dc-004",
    label: "설계 검토 결론",
    category: "설계관리",
    certTypes: ["common"],
    text: "설계 검토(Design Review)는 ISO 13485 7.3.5항에 따라 각 설계 단계에서 수행되었으며, 관련 기능 부서 대표자가 참여하여 설계 입력 요건 충족 여부를 확인하였습니다.",
  },

  // ── 분석·임상 성능 ────────────────────────────────────────────────────
  {
    id: "perf-001",
    label: "분석적 성능 평가 항목",
    category: "분석·임상 성능",
    certTypes: ["ivdr"],
    text: "분석적 성능 평가는 IVDR Annex I GSPR 9항 및 CLSI 지침에 따라 정확도, 정밀도(반복성·재현성), 검출한계(LoD), 직선성, 간섭 및 교차반응성 항목을 포함하여 수행하였습니다.",
  },
  {
    id: "perf-002",
    label: "임상 성능 지표",
    category: "분석·임상 성능",
    certTypes: ["ivdr"],
    text: "임상 성능 평가는 IVDR Annex XIII에 따라 수행되었으며, 민감도(Sensitivity), 특이도(Specificity), 양성예측도(PPV) 및 음성예측도(NPV)를 포함한 진단 성능 지표를 산출하였습니다.",
  },
  {
    id: "perf-003",
    label: "참조 방법 및 기준 선택",
    category: "분석·임상 성능",
    certTypes: ["ivdr"],
    text: "기준 검사법(Reference Method) 및 비교 방법은 IVDR Annex XIII 1.2항 및 CLSI EP09 지침에 따라 선택하였으며, 선택 기준은 임상 성능 평가 계획서에 명시되어 있습니다.",
  },

  // ── 규정 근거 ────────────────────────────────────────────────────────
  {
    id: "reg-001",
    label: "GSPR 적합성 체크리스트 참조",
    category: "규정 근거",
    certTypes: ["ivdr"],
    text: "본 기기의 일반 안전 및 성능 요건(GSPR) 적합성은 IVDR Annex I에 따라 평가되었으며, 각 적용 가능한 GSPR 항목에 대한 적합성 수단 및 증거가 GSPR 체크리스트에 기재되어 있습니다.",
  },
  {
    id: "reg-002",
    label: "IVDR 분류 및 적용 근거",
    category: "규정 근거",
    certTypes: ["ivdr"],
    text: "본 기기는 Regulation (EU) 2017/746 Article 2(2)에 따른 체외진단기기(IVD)에 해당하며, IVDR Annex VIII에 따라 [Class A / B / C / D]로 분류됩니다.",
  },
  {
    id: "reg-003",
    label: "ISO 14971 참조 선언",
    category: "규정 근거",
    certTypes: ["common"],
    text: "위험관리는 ISO 14971:2019(의료기기 – 위험관리의 의료기기 적용) 및 ISO/TR 24971:2020(적용 지침)에 따라 수행하였습니다.",
  },
  {
    id: "reg-004",
    label: "IEC 62366 사용성 공학 참조",
    category: "규정 근거",
    certTypes: ["common"],
    text: "사용성 공학(Usability Engineering) 활동은 IEC 62366-1:2015+AMD1:2020에 따라 수행되었으며, 사용 오류 분석 및 사용 적합성 평가(SUM Study)를 포함합니다.",
  },
  {
    id: "reg-005",
    label: "IVDD DoC 도입부",
    category: "규정 근거",
    certTypes: ["ivdd"],
    text: "본 적합성 선언서(DoC)는 Directive 98/79/EC Article 7 및 Annex III에 따라 발행되며, [제조사명]이 단독 책임 하에 서명합니다. 본 선언은 아래 기기가 해당 지침의 필수 요건을 충족함을 확인합니다.",
  },
  {
    id: "reg-006",
    label: "IVDR 전환 기한 안내",
    category: "규정 근거",
    certTypes: ["ivdd"],
    text: "IVDR 전환 계획에 따라, Class D 기기는 2025년 12월 31일, Class C 기기는 2026년 12월 31일, Class B 및 Class A(자가검사) 기기는 2027년 12월 31일 이전에 IVDR 체계로의 전환을 완료할 예정입니다.",
  },

  // ── MDSAP ────────────────────────────────────────────────────────────
  {
    id: "mdsap-001",
    label: "다국적 규제 충족 선언",
    category: "MDSAP",
    certTypes: ["mdsap"],
    text: "본 QMS는 MDSAP(의료기기 단일 심사 프로그램)에 따라 심사를 받으며, 미국(FDA 21 CFR 820), 캐나다(SOR/98-282), 브라질(RDC 16/2013), 호주(TG(MD)R), 일본(JPAL) 규제 요건을 동시에 충족합니다.",
  },
  {
    id: "mdsap-002",
    label: "AO 심사 단계 구성",
    category: "MDSAP",
    certTypes: ["mdsap"],
    text: "MDSAP 심사는 IAF MLA 인정을 받은 심사기관(AO)이 수행하며, Stage 1(문서 심사)과 Stage 2(현장 심사)로 구성됩니다. 심사 결과는 참여국 규제기관과 공유됩니다.",
  },
  {
    id: "mdsap-003",
    label: "Ch.3 CAPA 운영 선언",
    category: "MDSAP",
    certTypes: ["mdsap"],
    text: "CAPA 시스템은 MDSAP Chapter 3(측정, 분석 및 개선)의 요건에 따라 운영되며, 근본 원인 분석(RCA), 효과성 검증 및 완료 검증 단계를 포함합니다.",
  },
  {
    id: "mdsap-004",
    label: "Ch.7 시판 후 보고 절차",
    category: "MDSAP",
    certTypes: ["mdsap"],
    text: "각국 시판 후 보고 절차는 MDSAP Chapter 7에 따라 정의되었습니다. FDA MDR, 캐나다 Mandatory Problem Reporting, 브라질 Tecnovigilância, 호주 TGA 보고 및 일본 PMDA 보고 절차를 SOP에 반영하였습니다.",
  },
];

// ── 커스텀 스니펫 저장소 ─────────────────────────────────────────────
export interface CustomSnippet {
  id: string;
  label: string;
  text: string;
}

const CUSTOM_KEY = "ivdr-wiki-snippets-custom";

export function loadCustomSnippets(): CustomSnippet[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? (JSON.parse(raw) as CustomSnippet[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomSnippets(snippets: CustomSnippet[]): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(snippets));
}
