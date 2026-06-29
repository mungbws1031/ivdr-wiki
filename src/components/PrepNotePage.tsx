import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckSquare, ChevronDown, ChevronRight } from "lucide-react";

interface PrepTask {
  task: string;
  detail: string;
}

interface PrepSection {
  certId: string;
  certName: string;
  colorVar: string;
  tintVar: string;
  items: { category: string; tasks: PrepTask[] }[];
}

const prepSections: PrepSection[] = [
  {
    certId: "ivdr",
    certName: "IVDR (EU 2017/746)",
    colorVar: "--accent",
    tintVar: "--accent-weak",
    items: [
      {
        category: "규제 이해",
        tasks: [
          {
            task: "IVDR Art.5 및 Annex VIII 분류 규칙 숙지",
            detail:
              "IVDR Annex VIII의 Rule 1~7을 정확히 파악해야 합니다. IVDD 시절과 달리 '목록(List) 방식'이 폐지되고 위험 기반 규칙 분류로 전환되었으므로, 이전 분류 경험을 그대로 적용하면 오류가 생깁니다. 각 Rule이 어떤 기기에 적용되는지, 가장 높은 등급이 최종 등급임을 확인하세요.",
          },
          {
            task: "해당 제품의 분류(Class A/B/C/D) 사전 확인",
            detail:
              "Class B 이상은 NB(공인기관) 적합성 평가가 필수입니다. Class D는 EU RL(참고실험실) 의견까지 필요합니다. 가정용·자가검사 기기에는 추가적인 사용적합성 요건이 따르므로, 분류와 함께 사용 환경도 명확히 정의해야 합니다.",
          },
          {
            task: "적용 MDCG 가이던스 목록 수집",
            detail:
              "MDCG(Medical Device Coordination Group)는 IVDR 해석 지침을 지속 발행합니다. 분류, 성능평가, NB 제출 패키지 등 주요 주제별로 최신 가이던스 번호를 목록화하고, 특히 제품 유형에 맞는 가이던스를 우선 확인하세요.",
          },
          {
            task: "공인기관(NB) 지정 현황 확인 (NANDO)",
            detail:
              "EC NANDO 데이터베이스(nando.nessie.eui.eu)에서 현재 IVDR 지정 NB 목록과 각 NB의 심사 범위(Scope)를 확인합니다. NB 수가 제한되어 있어 계약 일정이 길어질 수 있으니 가능하면 조기에 복수 NB와 사전 접촉을 권장합니다.",
          },
          {
            task: "GSPR(Annex I) 항목 제품 적용 여부 매핑",
            detail:
              "GSPR(일반 안전성·성능 요구사항)은 기술문서의 척추입니다. Annex I Chapter I~III의 각 항목에 대해 '적용/미적용 + 충족 근거 문서'를 매핑한 체크리스트를 초기에 만들어 두어야, 문서 작성 과정에서 빠진 증거를 즉시 파악할 수 있습니다.",
          },
          {
            task: "PRRC(규정 준수 담당자) 지정 및 이력 확인",
            detail:
              "IVDR Art.15에 따라 제조사는 PRRC(Person Responsible for Regulatory Compliance)를 최소 1명 지정해야 합니다. PRRC는 적합성 선언 서명 등 법적 책임을 집니다. 지정인의 자격(경력·교육 이력)을 문서화해 두세요.",
          },
        ],
      },
      {
        category: "성능 데이터 사전 확보",
        tasks: [
          {
            task: "민감도·특이도·PPV/NPV 원시 데이터 보유 여부 확인",
            detail:
              "임상 성능 시험 결과의 핵심 지표입니다. 기존 데이터가 있다면 분석물(측정 항목)별로 결과를 분리하고, 샘플 특성(모집단, 검체 유형)이 EU 대상 집단과 일치하는지 검토합니다. EU 데이터가 부족한 경우 추가 임상 시험 계획을 세워야 합니다.",
          },
          {
            task: "기준물질(Reference Standard) 정보 확보",
            detail:
              "분석 성능 입증에는 인증된 기준물질(CRM 등) 또는 비교 방법(Reference Method)을 사용해야 합니다. EQA(외부 품질평가) 프로그램 참가 기관과의 비교 데이터도 과학적 타당성 근거로 활용됩니다.",
          },
          {
            task: "EQA(외부 품질평가) 참가 기록 수집",
            detail:
              "EQA는 분석 성능의 지속적 근거로서 PER(성능평가 보고서)와 PMPF(시판 후 성능 추적)에 활용됩니다. 최근 3년 이상의 참가 기록과 결과를 정리하고, 이탈값(outlier) 발생 시 원인 분석·개선 조치도 보존하세요.",
          },
          {
            task: "임상 사이트 협약서(CTA) 초안 준비",
            detail:
              "임상 성능 시험을 외부 기관과 수행하는 경우 CTA(Clinical Trial Agreement)가 필요합니다. 윤리위원회(IRB/EC) 승인, 개인정보 처리 동의, 검체 처리 방법 등 합의가 필요한 항목을 미리 정리하세요.",
          },
          {
            task: "LOD(최소 검출 한계) 및 직선성 데이터 정리",
            detail:
              "분석 성능 항목 중 LOD, LOQ, 직선성(Linearity), 간섭 물질(Interference) 데이터는 IVDR Annex XIII 성능평가 요건입니다. 기존 검증 데이터가 ISO 17511 등 인정된 기준에 맞게 수행되었는지 재확인하세요.",
          },
        ],
      },
      {
        category: "QMS / 기술문서 준비",
        tasks: [
          {
            task: "기존 ISO 13485 인증서 유효기간 확인",
            detail:
              "IVDR NB는 기술문서 외에 ISO 13485 기반 품질시스템도 심사합니다. 기존 ISO 13485 인증서의 유효기간과 범위(Scope)가 IVDR 신청 제품을 포괄하는지 확인하고, 필요 시 갱신이나 범위 확대 절차를 미리 시작하세요.",
          },
          {
            task: "설계·개발 이력 파일(DHF) 현황 파악",
            detail:
              "DHF는 설계 입력→출력→검증→확인(V&V)의 모든 산출물을 담은 파일입니다. 각 단계의 문서가 완비되었는지, 최신 설계 변경이 반영되었는지 확인합니다. DHF 공백(누락된 검증·확인 보고서)은 NB 심사에서 주요 지적사항입니다.",
          },
          {
            task: "위험관리 파일(RMF) 기존 문서 수집",
            detail:
              "ISO 14971:2019 기반의 RMP(위험관리계획), FMEA(고장모드 영향분석), RMR(위험관리 보고서)를 수집합니다. 특히 잔여위험 수용기준이 명확히 정의되었는지, 최신 시판 후 정보가 위험파일에 반영되었는지 점검하세요.",
          },
          {
            task: "공급업체 목록 최신화 여부 확인",
            detail:
              "ISO 13485 4.1조에 따라 핵심 부품·서비스 공급업체 평가 기록이 최신이어야 합니다. 공급업체 변경이 있었다면 변경 통제 기록도 있어야 하며, 이는 QMS 심사에서 반드시 확인됩니다.",
          },
          {
            task: "IFU(사용설명서) 및 라벨 Annex I Ch.III 요건 점검",
            detail:
              "라벨·IFU는 IVDR Annex I Chapter III와 EN ISO 18113 기준을 충족해야 합니다. 가정용 기기는 일반인 가독성, 기호 사용(EN ISO 15223), UDI 표기, 경고·한계 안내가 특히 중요합니다. 사용적합성 평가(IEC 62366) 전에 IFU를 최종화하면 안 됩니다.",
          },
          {
            task: "UDI(고유기기식별) 발급 계획 수립",
            detail:
              "UDI-DI(기기 식별자)와 UDI-PI(생산 식별자) 체계를 설계하고, 발급기관(GS1, HIBCC 등)을 선정합니다. EUDAMED 기기 등록의 핵심 키이므로 조기에 계획을 확정하세요.",
          },
        ],
      },
      {
        category: "시판 후·EUDAMED 준비",
        tasks: [
          {
            task: "EUDAMED 행위자 등록(SRN) 현황 확인",
            detail:
              "제조사는 EUDAMED에 행위자로 등록해 SRN(단일등록번호)을 받아야 합니다. 기존에 SRN이 없다면 등록을 시작하고, 있다면 정보 최신화 여부를 확인합니다.",
          },
          {
            task: "PMS(시판 후 감시) 계획 초안 작성",
            detail:
              "PMS는 출시와 동시에 의무가 발생합니다. PMS 계획(Annex III)에는 수집 채널·분석 주기·환류 절차를 명시해야 합니다. PMPF(성능 추적)도 PMS의 일환으로 계획해 두세요.",
          },
          {
            task: "Vigilance 보고 절차 SOP 확인",
            detail:
              "중대사고(Serious Incident)와 FSCA(현장안전조치) 보고는 법정 기한이 있습니다. 트리거 정의, 보고 양식, 담당자, 기한을 SOP로 명확히 정의하고, 담당자가 절차를 알고 있는지 확인하세요.",
          },
          {
            task: "PSUR/PMSR 작성 주기 계획",
            detail:
              "Class C/D는 PSUR(주기적 안전성 최신 보고서)가 필요합니다. 연간 또는 2년 주기로 작성해야 하므로, 책임자와 일정을 사전에 지정합니다.",
          },
        ],
      },
      {
        category: "프로젝트 관리",
        tasks: [
          {
            task: "인증 목표 일정 및 마일스톤 작성",
            detail:
              "NB 계약부터 CE 마킹까지 주요 마일스톤을 작성합니다. NB 계약→기술문서 제출→NB 심사→인증서 발급의 일반적 흐름은 12~24개월 이상 소요될 수 있습니다. 일정 플래너 도구를 활용해 모든 이해관계자와 공유하세요.",
          },
          {
            task: "담당자·책임자 지정 (PRRC 포함)",
            detail:
              "GSPR 항목별, 문서 유형별 작성 담당자를 배정합니다. PRRC는 법적 책임자이므로 역할과 연락처를 문서화하고, 내부 결재 라인도 미리 정합니다.",
          },
          {
            task: "예산 계획(NB 계약·외부 컨설턴트·시험기관)",
            detail:
              "NB 계약비, 임상 시험기관(CRO) 비용, 외부 컨설턴트, 번역·법률 검토 비용을 항목별로 계획합니다. 예산 부족으로 중간에 일정이 지연되는 것을 방지하세요.",
          },
          {
            task: "내부 결재·승인 프로세스 사전 확인",
            detail:
              "기술문서 서명, 위험수용기준 승인, NB 제출 승인 등 각 단계의 내부 결재선을 미리 확인합니다. 내부 승인 지연이 NB 제출 일정을 밀어내는 흔한 원인입니다.",
          },
        ],
      },
    ],
  },
  {
    certId: "iso13485",
    certName: "ISO 13485:2016",
    colorVar: "--p3",
    tintVar: "--p3-tint",
    items: [
      {
        category: "현황 파악",
        tasks: [
          {
            task: "현행 QMS 절차서 목록 최신화",
            detail:
              "ISO 13485:2016의 각 조항(4~8조)에 대응하는 절차서가 존재하는지, 최신 개정 버전인지 확인합니다. 절차서 목록(Master List)이 없다면 심사 전에 먼저 만들어야 합니다.",
          },
          {
            task: "이전 내부심사 결과 및 부적합 이력 수집",
            detail:
              "최근 2회 이상의 내부심사 보고서와 부적합 이력, CAPA 조치 결과를 수집합니다. 인증기관(CB) 심사원은 반복 부적합에 특히 주목하므로, 미결 사항이 있다면 심사 전에 해소해야 합니다.",
          },
          {
            task: "경영 검토 회의록 최근 2회치 보관 확인",
            detail:
              "ISO 13485 5.6조 경영 검토는 QMS 상위 거버넌스의 핵심입니다. 회의록에 QMS 성과, 고객 피드백, 자원 배분, 목표 달성도가 포함되어야 합니다. '회의를 했지만 기록이 없는 것'은 부적합 사항입니다.",
          },
          {
            task: "CAPA(시정 및 예방조치) 미결 건 현황 파악",
            detail:
              "CAPA는 8.5조에 따라 근본 원인 분석과 재발방지 대책이 문서화되어야 합니다. 심사 시점에 미결 CAPA가 많으면 QMS 실효성에 의문이 제기됩니다. 미결 건을 정리하거나 합리적 사유를 문서화하세요.",
          },
          {
            task: "설계관리 조항(7.3조) 산출물 현황 파악",
            detail:
              "ISO 13485 7.3조는 설계 입력, 출력, 검토, 검증, 확인, 변경 통제를 요구합니다. 각 단계의 기록이 실제로 존재하는지 DHF 현황과 함께 점검합니다.",
          },
        ],
      },
      {
        category: "자원 준비",
        tasks: [
          {
            task: "내부심사원 자격 기록 최신화",
            detail:
              "내부심사원은 훈련 이력과 자격 기록을 보유해야 합니다. 자격 만료, 교육 갱신이 필요한 심사원을 파악하고 심사 전에 보완하세요.",
          },
          {
            task: "측정장비 교정 증명서 유효기간 확인",
            detail:
              "7.6조 모니터링·측정 장비 관리에 따라 교정 상태가 최신이어야 합니다. 교정 주기, 교정 기관(KOLAS 등 인정 기관 권장), 허용 오차, 교정 결과 판정 기준을 정비하세요.",
          },
          {
            task: "교육훈련 기록 최근 1년치 정리",
            detail:
              "6.2조 인적 자원에 따라 업무 영향 인원의 역량, 교육 이력이 기록되어야 합니다. 신규 입사자, 직무 변경자의 교육 기록이 빠짐없이 있는지 확인하고, 역량 평가 결과도 보존하세요.",
          },
          {
            task: "공급자 평가 기록 최신화",
            detail:
              "7.4조 구매 프로세스에 따라 승인 공급자 목록(AVL)과 각 공급자 평가 기록을 갱신합니다. 핵심 원자재·부품 공급자의 평가 주기와 기준을 명확히 하고, 변경된 공급자에 대한 재평가 기록도 보유하세요.",
          },
          {
            task: "생산·공정 검증 기록(IQ/OQ/PQ) 현황",
            detail:
              "7.5.2조 청결도/오염 방지 및 7.5.6조 공정 검증 요건에 따라 주요 공정의 검증 기록(IQ·OQ·PQ)이 있어야 합니다. 특히 무균 공정, 멸균 공정이 있다면 검증 최신화 여부를 확인하세요.",
          },
        ],
      },
      {
        category: "심사 준비",
        tasks: [
          {
            task: "인증기관(CB)과 심사 일정 사전 협의",
            detail:
              "CB의 심사 가능 일정이 한정되어 있으므로 최소 3~6개월 전에 일정을 협의합니다. Stage 1(문서 심사)과 Stage 2(현장 심사) 일정을 함께 잡되, 문서 준비 완료 후 Stage 1을 진행하는 것이 효율적입니다.",
          },
          {
            task: "심사 대상 사이트 목록 확정",
            detail:
              "복수 사이트(설계, 제조, 유통 등)가 있다면 어느 사이트가 심사 범위에 포함되는지 CB와 미리 협의하고, 각 사이트별 연락 담당자를 지정해 두세요.",
          },
          {
            task: "심사 준비 내부 담당자 배정",
            detail:
              "심사 항목별 문서 담당자, 인터뷰 담당자를 미리 배정하고, 심사 당일 필요한 문서 목록을 작성합니다. 모의심사(Pre-assessment)를 통해 준비 상태를 사전 점검하는 것을 권장합니다.",
          },
          {
            task: "심사 공간·회의실 사전 예약",
            detail:
              "심사원을 위한 회의실, 문서 검토 공간을 예약하고, 필요한 IT 장비(프린터, 프로젝터)를 준비합니다. 심사 당일 혼선 없이 진행될 수 있도록 내부 공지도 병행하세요.",
          },
          {
            task: "문서 버전 정합성 최종 점검",
            detail:
              "심사 제출 문서의 버전 번호, 유효일, 승인자 서명이 모두 일치하는지 확인합니다. 구버전 절차서가 현장에 남아 있으면 부적합 사항이 됩니다.",
          },
        ],
      },
    ],
  },
  {
    certId: "ivdd",
    certName: "IVDD (98/79/EC)",
    colorVar: "--p2",
    tintVar: "--p2-tint",
    items: [
      {
        category: "분류 확인",
        tasks: [
          {
            task: "Annex II List A·B 해당 여부 확인",
            detail:
              "IVDD의 List A(자기적합선언 불가 · 고위험 품목: HIV, 혈액형, 간염 등)와 List B(NB 적합성 평가 또는 CE 마킹에 EU-공인 기준물질 필요)에 제품이 포함되는지 확인합니다. 목록 외 품목은 대부분 Annex III 자기선언 경로입니다.",
          },
          {
            task: "자가검사(self-testing) 해당 여부 결정",
            detail:
              "자가검사 기기는 Annex I 부가 요건(일반인 사용 적합성)과 Annex IV/V 적합성 평가 경로 고려가 필요합니다. 일반인이 사용하는 기기임을 IFU와 의도된 사용에 명확히 명시해야 합니다.",
          },
          {
            task: "의도된 목적(Intended Purpose) 초안 작성",
            detail:
              "IVDR과 마찬가지로 의도된 목적이 분류와 적합성 평가의 출발점입니다. 측정 분석물, 검체 유형, 사용자, 사용 환경, 임상적 목적을 포함한 초안을 작성하고 법무·RA와 검토하세요.",
          },
          {
            task: "적합성 절차 경로(Annex IV·V·VI·VII) 선택",
            detail:
              "IVDD는 기기 분류에 따라 적합성 평가 경로가 다릅니다. List A → Annex IV(QMS+기술문서) 또는 Annex V+VI, List B → Annex III+IV(QMS) 또는 III+V+VI, 기타 → Annex III 자기선언. 경로별 필요 서류가 다르므로 조기에 경로를 확정하세요.",
          },
        ],
      },
      {
        category: "기존 문서 수집",
        tasks: [
          {
            task: "98/79/EC 기기 파일(Technical File) 현황 확인",
            detail:
              "IVDD 기기 파일에는 제품 설명, 성능 평가, 제조 정보, 라벨·IFU, 적합성 선언이 포함됩니다. 파일의 완성도와 최신성을 점검하고, IVDR 전환 시 보강해야 할 항목을 목록화하세요.",
          },
          {
            task: "기존 성능 평가 자료 보유 여부 확인",
            detail:
              "IVDR 전환 시 기존 IVDD 성능 데이터를 활용할 수 있으나, IVDR의 3가지 성능 기둥(과학적 타당성·분석 성능·임상 성능)에 맞는 추가 데이터가 필요할 수 있습니다. 보유 데이터의 적용 가능성을 RA와 미리 검토하세요.",
          },
          {
            task: "현행 EC 적합성선언(DoC) 유효성 확인",
            detail:
              "현재 발행된 DoC의 적용 규정·버전·서명 권한이 유효한지 확인합니다. 설계 변경이 있었다면 DoC 갱신이 필요합니다.",
          },
          {
            task: "IVDR 전환 목표 일자 내부 합의",
            detail:
              "Class별 전환 마감 일정(Class D → 2025.5.26, Class C → 2026.5.26, Class B/A → 2027.5.26)을 기준으로 내부 전환 목표를 설정하고, 경영진 승인을 받아 일정을 공식화하세요.",
          },
        ],
      },
      {
        category: "IVDR 전환 준비",
        tasks: [
          {
            task: "IVDR 요건 대비 갭 분석(Gap Analysis) 수행",
            detail:
              "현재 IVDD 기기 파일을 IVDR의 Annex II/III 요건과 비교해 누락된 항목을 파악합니다. 특히 IVDR에서 강화된 성능평가(Annex XIII), 시판 후 감시(Annex III), UDI/EUDAMED 요건이 핵심 갭이 됩니다.",
          },
          {
            task: "IVDR NB 사전 접촉 및 제출 패키지 확인",
            detail:
              "IVDR NB 수가 제한적이므로 조기에 NB와 사전 접촉(Pre-submission Meeting)을 요청하여 제출 패키지 요건과 일정을 확인하세요. NB마다 요구 서류 양식·절차가 다를 수 있습니다.",
          },
          {
            task: "전환 예산 및 추가 시험 계획 수립",
            detail:
              "IVDR 전환에 필요한 추가 성능 시험, 임상 데이터 수집, NB 계약 비용을 예산에 반영합니다. 특히 임상 시험 기간이 길 수 있으므로 충분한 리드 타임을 고려하세요.",
          },
        ],
      },
    ],
  },
  {
    certId: "mdsap",
    certName: "MDSAP",
    colorVar: "--p4",
    tintVar: "--p4-tint",
    items: [
      {
        category: "목표 국가 결정",
        tasks: [
          {
            task: "목표 수출 국가(미국·캐나다·브라질·호주·일본) 확정",
            detail:
              "MDSAP는 미국 FDA, 캐나다 HC, 브라질 ANVISA, 호주 TGA, 일본 PMDA 5개국 요건을 하나의 심사로 충족합니다. 수출 대상 국가를 먼저 확정해야 심사 범위와 준비 서류가 결정됩니다.",
          },
          {
            task: "각국 규제 요건 사전 조사",
            detail:
              "각 참가국마다 MDSAP 외 추가 요건이 있을 수 있습니다. 예를 들어 브라질 ANVISA는 MDSAP 인증서 외 추가 등록이 필요하고, 일본 PMDA는 QMS적합성 조사 면제 신청 절차가 있습니다. 국가별 추가 요건을 목록화하세요.",
          },
          {
            task: "캐나다 MDEL 보유 여부 확인",
            detail:
              "캐나다 Health Canada에 수출하려면 MDEL(Medical Device Establishment License)이 필요합니다. MDEL 신청은 MDSAP 인증과 별도 절차이며, 사전에 취득 여부를 확인하고 필요 시 신청을 준비하세요.",
          },
          {
            task: "브라질 ANVISA 등록 현황 확인",
            detail:
              "브라질은 ANVISA 등록이 필요하며, MDSAP 인증이 등록 요건 중 하나입니다. 이미 등록된 제품이 있다면 MDSAP 인증 취득 후 갱신 여부를 확인하고, 신규 제품이라면 등록 일정을 미리 계획하세요.",
          },
        ],
      },
      {
        category: "QMS 준비",
        tasks: [
          {
            task: "ISO 13485:2016 인증 현황 확인",
            detail:
              "MDSAP는 ISO 13485:2016을 기반으로 합니다. 현재 ISO 13485 인증이 없다면 MDSAP 준비와 병행해 취득 계획을 세웁니다. 인증이 있다면 범위(Scope)가 MDSAP 신청 제품을 포괄하는지 확인하세요.",
          },
          {
            task: "MDSAP 7챕터 요건 대비 갭 분석 착수",
            detail:
              "MDSAP는 7개 챕터로 구성됩니다: Ch.1 경영책임, Ch.2 기기 마케팅 허가, Ch.3 측정·분석·개선, Ch.4 설계·개발, Ch.5 생산·서비스 통제, Ch.6 지원 프로세스(구매·설비·인적자원), Ch.7 시판 후 활동. 각 챕터별 현황을 자체 평가하고 미비점을 우선순위화하세요.",
          },
          {
            task: "심사기관(AO) 후보 목록 수집",
            detail:
              "MDSAP 심사는 IMDRF 인정 AO(Auditing Organization)만 수행할 수 있습니다. BSI, SGS, TÜV, Dekra 등 주요 AO의 MDSAP 경험, 국가별 전문성, 견적을 비교해 최소 2~3곳과 상담하세요.",
          },
          {
            task: "MDSAP 심사 예산·일정 계획 수립",
            detail:
              "MDSAP Stage 1(문서 심사)과 Stage 2(현장 심사) 비용을 AO로부터 견적받고 예산에 반영합니다. 일반적으로 초기 심사는 3~5일 소요됩니다. 연간 감시 심사와 재인증 심사 비용도 중장기 예산에 포함하세요.",
          },
        ],
      },
      {
        category: "챕터별 핵심 준비",
        tasks: [
          {
            task: "Ch.2 기기 마케팅 허가 — 각국 등록·허가 현황 문서화",
            detail:
              "MDSAP Ch.2는 제품이 각국 규제 기관에 적절히 허가/등록되었는지를 봅니다. FDA 510(k)/PMA, Health Canada 면허, ANVISA 등록 등 국가별 현황을 하나의 문서로 정리하세요.",
          },
          {
            task: "Ch.3 측정·분석·개선 — CAPA·내부심사 실적 정비",
            detail:
              "CAPA 시스템이 실효적으로 운영되고 있는지, 근본 원인 분석 방법론이 적용되고 있는지 확인합니다. 내부심사 결과와 경영 검토 기록도 Ch.3 증거로 사용됩니다.",
          },
          {
            task: "Ch.7 시판 후 활동 — 각국 보고 의무 절차 정의",
            detail:
              "국가마다 시판 후 보고(MDR/Vigilance) 절차와 기한이 다릅니다. 미국 MDR, 캐나다 Mandatory Problem Reporting, 브라질 Tecnovigilância 등 국가별 절차를 SOP에 반영하세요.",
          },
          {
            task: "모의심사(Pre-assessment) 수행 계획",
            detail:
              "본 심사 전에 내부 모의심사 또는 AO에 의한 사전 갭 점검을 받는 것이 권장됩니다. 심사원이 주로 보는 기록 유형과 인터뷰 질문을 미리 파악해 담당자를 훈련하세요.",
          },
        ],
      },
    ],
  },
];

// =====================================================================
// 단일 Task 행 (확장형 상세 설명)
// =====================================================================
function TaskRow({
  task,
  colorVar,
  tintVar,
}: {
  task: PrepTask;
  colorVar: string;
  tintVar: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="flex flex-col" style={{ gap: 2 }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-start gap-2 text-left w-full group"
        style={{ fontSize: "var(--t-sm)", lineHeight: "var(--lh-base)", color: "var(--text-muted)" }}
      >
        <span
          className="mt-1 inline-block shrink-0 rounded-sm"
          style={{
            width: 14,
            height: 14,
            border: `1.5px solid var(${colorVar})`,
            flexShrink: 0,
          }}
          aria-hidden
        />
        <span className="flex-1 group-hover:text-text transition-colors">{task.task}</span>
        {expanded ? (
          <ChevronDown size={14} className="mt-0.5 shrink-0 text-text-subtle" aria-hidden />
        ) : (
          <ChevronRight size={14} className="mt-0.5 shrink-0 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
        )}
      </button>
      {expanded && (
        <p
          className="text-text-muted"
          style={{
            fontSize: "var(--t-xs)",
            lineHeight: "var(--lh-base)",
            marginLeft: 22,
            padding: "var(--s-2) var(--s-3)",
            background: `var(${tintVar})`,
            borderLeft: `3px solid var(${colorVar})`,
            borderRadius: "0 var(--r-sm) var(--r-sm) 0",
          }}
        >
          {task.detail}
        </p>
      )}
    </li>
  );
}

// =====================================================================
// 메인 컴포넌트
// =====================================================================
export function PrepNotePage() {
  return (
    <div className="min-h-screen bg-bg">
      <main
        className="mx-auto"
        style={{ maxWidth: "var(--max-w)", padding: "var(--s-12) var(--margin) var(--s-16)" }}
      >
        {/* Header */}
        <header style={{ marginBottom: "var(--s-10)" }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text"
            style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}
          >
            <ArrowLeft size={16} aria-hidden />
            인증 허브
          </Link>
          <div className="flex items-center gap-3" style={{ marginBottom: "var(--s-3)" }}>
            <CheckSquare size={28} style={{ color: "var(--info)" }} aria-hidden />
            <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-3xl)", lineHeight: "var(--lh-tight)" }}>
              업무 시작 전 사전 준비 체크리스트
            </h1>
          </div>
          <p className="text-text-muted" style={{ fontSize: "var(--t-lg)", maxWidth: 640 }}>
            인증별 문서 작성을 시작하기 전에 준비해 두면 좋은 자료·메모·확인 사항 목록입니다.
            각 항목을 클릭하면 상세 설명이 펼쳐집니다.
          </p>
        </header>

        {/* Sections */}
        <div className="flex flex-col" style={{ gap: "var(--s-8)" }}>
          {prepSections.map((sec) => (
            <section
              key={sec.certId}
              className="rounded-[var(--r-lg)]"
              style={{ background: `var(${sec.tintVar})`, padding: "var(--s-6)" }}
            >
              <h2
                className="font-extrabold"
                style={{
                  color: `var(${sec.colorVar})`,
                  fontSize: "var(--t-xl)",
                  marginBottom: "var(--s-5)",
                }}
              >
                {sec.certName}
              </h2>

              <div
                className="grid grid-cols-1 md:grid-cols-2"
                style={{ gap: "var(--s-4)" }}
              >
                {sec.items.map((cat) => (
                  <div
                    key={cat.category}
                    className="rounded-[var(--r-md)]"
                    style={{ background: "var(--surface)", padding: "var(--s-4)" }}
                  >
                    <h3
                      className="font-bold text-text"
                      style={{ fontSize: "var(--t-base)", marginBottom: "var(--s-3)" }}
                    >
                      {cat.category}
                    </h3>
                    <ul className="flex flex-col" style={{ gap: "var(--s-2)" }}>
                      {cat.tasks.map((task, i) => (
                        <TaskRow key={i} task={task} colorVar={sec.colorVar} tintVar={sec.tintVar} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer
          className="text-text-subtle"
          style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-12)", lineHeight: "var(--lh-base)" }}
        >
          이 체크리스트는 참고용이며, 실제 인증 요건은 최신 규제 문서와 인증기관 요건을 우선합니다.
        </footer>
      </main>
    </div>
  );
}
