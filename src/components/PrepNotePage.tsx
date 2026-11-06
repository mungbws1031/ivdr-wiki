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
            task: "IVDR Art.5와 Annex VIII 분류 규칙 익히기",
            detail:
              "IVDR Annex VIII의 Rule 1~7을 정확히 알아야 해요. IVDD 때 쓰던 '목록(List) 방식'은 없어졌어요. 이제는 위험을 기준으로 규칙에 따라 분류해요. 그래서 예전 분류 경험을 그대로 쓰면 틀릴 수 있어요. 각 Rule이 어떤 기기에 해당하는지 확인해 주세요. 가장 높은 등급이 최종 등급이라는 점도 확인해 주세요.",
          },
          {
            task: "내 제품 등급(Class A/B/C/D) 미리 확인",
            detail:
              "Class B 이상은 NB(인증기관)의 적합성 평가를 꼭 받아야 해요. Class D는 EU RL(참고실험실) 의견까지 필요해요. 가정용·자가검사 기기에는 사용적합성 요건이 더 붙어요. 그래서 등급과 함께 사용 환경도 분명하게 정해 두세요.",
          },
          {
            task: "적용할 MDCG 가이던스 목록 모으기",
            detail:
              "MDCG(Medical Device Coordination Group, 의료기기 조정 그룹)는 IVDR 해석 지침을 계속 내고 있어요. 분류, 성능평가, NB 제출 패키지 같은 주제별로 최신 가이던스 번호를 목록으로 만들어 두세요. 특히 내 제품 유형에 맞는 가이던스부터 확인해 주세요.",
          },
          {
            task: "NB(인증기관) 지정 현황 확인 (NANDO)",
            detail:
              "EC NANDO 데이터베이스(ec.europa.eu/growth/tools-databases/nando — 2차 자료 기준 주소, 원문 확인 필요)에서 IVDR 지정 NB 목록과 NB별 심사 범위(Scope)를 확인해요. NB 수가 적어서 계약까지 오래 걸릴 수 있어요. 되도록 일찍 여러 NB에 미리 연락해 보세요.",
          },
          {
            task: "GSPR(Annex I) 항목별 적용 여부 정리",
            detail:
              "GSPR(일반 안전성·성능 요구사항)은 기술문서의 뼈대예요. Annex I Chapter I~III의 항목마다 '적용/미적용 + 충족 근거 문서'를 짝지은 체크리스트를 일찍 만들어 두세요. 그러면 문서를 쓰는 동안 빠진 증거를 바로 찾을 수 있어요.",
          },
          {
            task: "PRRC(규정 준수 담당자) 지정과 이력 확인",
            detail:
              "IVDR Art.15에 따라 제조사는 PRRC(Person Responsible for Regulatory Compliance)를 최소 1명 정해야 해요. PRRC는 적합성 선언 서명 같은 법적 책임을 져요. 지정한 사람의 자격(경력·교육 이력)을 문서로 남겨 두세요.",
          },
        ],
      },
      {
        category: "성능 데이터 미리 확보",
        tasks: [
          {
            task: "민감도·특이도·PPV/NPV 원시 데이터가 있는지 확인",
            detail:
              "임상 성능 시험 결과의 핵심 지표예요. 기존 데이터가 있다면 분석물(측정 항목)별로 결과를 나눠 주세요. 샘플 특성(모집단, 검체 유형)이 EU 대상 집단과 맞는지도 살펴봐요. EU 데이터가 모자라면 추가 임상 시험 계획을 세워야 해요.",
          },
          {
            task: "기준물질(Reference Standard) 정보 챙기기",
            detail:
              "분석 성능을 입증하려면 인증된 기준물질(CRM 등)이나 비교 방법(Reference Method)을 써야 해요. EQA(외부 품질평가) 프로그램에 참가한 기관과 비교한 데이터도 과학적 타당성 근거로 쓸 수 있어요.",
          },
          {
            task: "EQA(외부 품질평가) 참가 기록 모으기",
            detail:
              "EQA는 분석 성능을 꾸준히 보여 주는 근거예요. PER(성능평가 보고서)와 PMPF(시판 후 성능 추적)에 쓰여요. 최근 3년 이상의 참가 기록과 결과를 정리해 주세요. 이탈값(outlier)이 나왔다면 원인 분석과 개선 조치 기록도 남겨 두세요.",
          },
          {
            task: "임상 사이트 협약서(CTA) 초안 준비",
            detail:
              "임상 성능 시험을 외부 기관과 함께 하면 CTA(Clinical Trial Agreement, 임상시험 계약)가 필요해요. 윤리위원회(IRB/EC) 승인, 개인정보 처리 동의, 검체 처리 방법처럼 서로 합의할 항목을 미리 정리해 두세요.",
          },
          {
            task: "LOD(최소 검출 한계)와 직선성 데이터 정리",
            detail:
              "분석 성능 항목 가운데 LOD, LOQ(정량 한계), 직선성(Linearity), 간섭 물질(Interference) 데이터는 IVDR Annex XIII 성능평가 요건이에요. 기존 검증 데이터가 ISO 17511 같은 인정된 기준에 맞게 수행됐는지 다시 확인해 주세요.",
          },
        ],
      },
      {
        category: "QMS / 기술문서 준비",
        tasks: [
          {
            task: "기존 ISO 13485 인증서 유효기간 확인",
            detail:
              "IVDR NB는 기술문서뿐 아니라 ISO 13485 기반 품질시스템도 심사해요. 기존 ISO 13485 인증서의 유효기간과 범위(Scope)가 IVDR 신청 제품을 포함하는지 확인해 주세요. 필요하면 갱신이나 범위 확대 절차를 미리 시작해 두세요.",
          },
          {
            task: "설계·개발 이력 파일(DHF) 현황 파악",
            detail:
              "DHF는 설계 입력→출력→검증→확인(V&V)의 모든 산출물을 담은 파일이에요. 단계마다 문서가 다 갖춰졌는지, 최신 설계 변경이 반영됐는지 확인해요. DHF 공백(빠진 검증·확인 보고서)은 NB 심사에서 주요 지적 사항이 돼요.",
          },
          {
            task: "위험관리 파일(RMF) 기존 문서 모으기",
            detail:
              "ISO 14971:2019 기반의 RMP(위험관리계획), FMEA(고장모드 영향분석), RMR(위험관리 보고서)를 모아요. 특히 잔여위험 수용기준이 분명히 정해져 있는지 점검해 주세요. 최신 시판 후 정보가 위험관리 파일에 반영됐는지도 함께 봐 주세요.",
          },
          {
            task: "공급업체 목록이 최신인지 확인",
            detail:
              "ISO 13485 4.1조에 따라 핵심 부품·서비스 공급업체의 평가 기록이 최신이어야 해요. 공급업체가 바뀌었다면 변경 통제 기록도 있어야 해요. 이 부분은 QMS(품질경영시스템) 심사에서 꼭 확인해요.",
          },
          {
            task: "IFU(사용설명서)와 라벨의 Annex I Ch.III 요건 점검",
            detail:
              "라벨·IFU는 IVDR Annex I Chapter III와 EN ISO 18113 기준을 충족해야 해요. 가정용 기기는 특히 일반인이 읽기 쉬운지, 기호 사용(EN ISO 15223), UDI 표기, 경고·한계 안내가 중요해요. 사용적합성 평가(IEC 62366)를 하기 전에 IFU를 최종 확정하면 안 돼요.",
          },
          {
            task: "UDI(고유기기식별) 발급 계획 세우기",
            detail:
              "UDI-DI(기기 식별자)와 UDI-PI(생산 식별자) 체계를 설계하고, 발급기관(GS1, HIBCC 등)을 골라요. UDI는 EUDAMED(EU 의료기기 데이터베이스) 기기 등록의 핵심 키예요. 그러니 일찍 계획을 확정해 주세요.",
          },
        ],
      },
      {
        category: "시판 후·EUDAMED 준비",
        tasks: [
          {
            task: "EUDAMED 행위자 등록(SRN) 현황 확인",
            detail:
              "제조사는 EUDAMED에 행위자로 등록하고 SRN(단일등록번호)을 받아야 해요. 아직 SRN이 없다면 등록을 시작해 주세요. 이미 있다면 정보가 최신인지 확인해요.",
          },
          {
            task: "PMS(시판 후 감시) 계획 초안 쓰기",
            detail:
              "PMS 의무는 출시와 동시에 생겨요. PMS 계획(Annex III)에는 수집 채널, 분석 주기, 환류(피드백) 절차를 적어야 해요. PMPF(성능 추적)도 PMS의 하나로 함께 계획해 두세요.",
          },
          {
            task: "Vigilance(이상사례 보고) 절차 SOP 확인",
            detail:
              "중대사고(Serious Incident)와 FSCA(현장안전조치) 보고에는 법으로 정한 기한이 있어요. 트리거 정의, 보고 양식, 담당자, 기한을 SOP(표준작업절차서)로 분명히 정해 두세요. 담당자가 이 절차를 알고 있는지도 확인해 주세요.",
          },
          {
            task: "PSUR/PMSR 작성 주기 계획",
            detail:
              "Class C/D는 PSUR(주기적 안전성 최신 보고서)를 적어도 1년에 한 번 고쳐 써야 해요(IVDR Art.81). Class A/B는 PSUR 대신 PMS 보고서를 필요할 때 고쳐 써요(IVDR Art.80). 책임자와 일정을 미리 정해 두세요. (EUR-Lex 원문 대조 2026-11-05)",
          },
        ],
      },
      {
        category: "프로젝트 관리",
        tasks: [
          {
            task: "인증 목표 일정과 마일스톤 정하기",
            detail:
              "NB 계약부터 CE 마킹까지 주요 마일스톤을 적어요. NB 계약→기술문서 제출→NB 심사→인증서 발급까지 보통 12~24개월 이상 걸릴 수 있어요. 일정 플래너 도구로 모든 관계자와 공유해 주세요.",
          },
          {
            task: "담당자·책임자 지정 (PRRC 포함)",
            detail:
              "GSPR 항목별, 문서 종류별로 작성 담당자를 정해요. PRRC는 법적 책임자라서 역할과 연락처를 문서로 남겨 두세요. 내부 결재 라인도 미리 정해 두세요.",
          },
          {
            task: "예산 계획(NB 계약·외부 컨설턴트·시험기관)",
            detail:
              "NB 계약비, 임상 시험기관(CRO) 비용, 외부 컨설턴트, 번역·법률 검토 비용을 항목별로 계획해요. 중간에 예산이 모자라 일정이 밀리지 않게 해 주세요.",
          },
          {
            task: "내부 결재·승인 절차 미리 확인",
            detail:
              "기술문서 서명, 위험수용기준 승인, NB 제출 승인처럼 단계마다 내부 결재선을 미리 확인해요. 내부 승인이 늦어져 NB 제출 일정이 밀리는 일이 흔해요.",
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
            task: "현행 QMS 절차서 목록 최신으로 정리",
            detail:
              "ISO 13485:2016의 각 조항(4~8조)에 맞는 절차서가 있는지, 최신 개정판인지 확인해요. 절차서 목록(Master List)이 없다면 심사 전에 먼저 만들어 주세요.",
          },
          {
            task: "이전 내부심사 결과와 부적합 이력 모으기",
            detail:
              "최근 2회 이상의 내부심사 보고서, 부적합 이력, CAPA(시정 및 예방조치) 결과를 모아요. 인증기관(CB) 심사원은 반복되는 부적합을 특히 눈여겨봐요. 아직 안 끝난 사항이 있다면 심사 전에 해결해 주세요.",
          },
          {
            task: "경영 검토 회의록 최근 2회치 보관 확인",
            detail:
              "ISO 13485 5.6조 경영 검토는 QMS를 위에서 이끄는 핵심 활동이에요. 회의록에는 QMS 성과, 고객 피드백, 자원 배분, 목표 달성도가 들어가야 해요. '회의는 했는데 기록이 없는 것'은 부적합 사항이에요.",
          },
          {
            task: "아직 안 끝난 CAPA(시정 및 예방조치) 현황 파악",
            detail:
              "8.5조에 따라 CAPA는 근본 원인 분석과 재발 방지 대책을 문서로 남겨야 해요. 심사 때 안 끝난 CAPA가 많으면 QMS가 제대로 돌아가는지 의심받아요. 미결 건을 정리하거나, 합리적인 사유를 문서로 남겨 두세요.",
          },
          {
            task: "설계관리 조항(7.3조) 산출물 현황 파악",
            detail:
              "ISO 13485 7.3조는 설계 입력, 출력, 검토, 검증, 확인, 변경 통제를 요구해요. 단계마다 기록이 실제로 있는지 DHF(설계 이력 파일) 현황과 함께 점검해요.",
          },
        ],
      },
      {
        category: "자원 준비",
        tasks: [
          {
            task: "내부심사원 자격 기록 최신으로 정리",
            detail:
              "내부심사원은 훈련 이력과 자격 기록을 갖고 있어야 해요. 자격이 만료됐거나 교육 갱신이 필요한 심사원을 찾아 심사 전에 보완해 주세요.",
          },
          {
            task: "측정장비 교정 증명서 유효기간 확인",
            detail:
              "7.6조 모니터링·측정 장비 관리에 따라 교정 상태가 최신이어야 해요. 교정 주기, 교정 기관(KOLAS 같은 인정 기관 권장), 허용 오차, 교정 결과 판정 기준을 정비해 주세요.",
          },
          {
            task: "교육훈련 기록 최근 1년치 정리",
            detail:
              "6.2조 인적 자원에 따라 업무에 영향을 주는 인원의 역량과 교육 이력을 기록해야 해요. 신규 입사자와 직무 변경자의 교육 기록이 빠짐없이 있는지 확인해 주세요. 역량 평가 결과도 남겨 두세요.",
          },
          {
            task: "공급자 평가 기록 최신으로 정리",
            detail:
              "7.4조 구매 프로세스에 따라 승인 공급자 목록(AVL)과 공급자별 평가 기록을 갱신해요. 핵심 원자재·부품 공급자의 평가 주기와 기준을 분명히 해 주세요. 바뀐 공급자에 대한 재평가 기록도 갖고 있어야 해요.",
          },
          {
            task: "생산·공정 검증 기록(IQ/OQ/PQ) 현황",
            detail:
              "7.5.2조 청결도/오염 방지와 7.5.6조 공정 검증 요건에 따라 주요 공정의 검증 기록(IQ·OQ·PQ: 설치·운전·성능 적격성)이 있어야 해요. 특히 무균 공정이나 멸균 공정이 있다면 검증이 최신인지 확인해 주세요.",
          },
        ],
      },
      {
        category: "심사 준비",
        tasks: [
          {
            task: "인증기관(CB)과 심사 일정 미리 협의",
            detail:
              "CB가 심사할 수 있는 일정은 한정돼 있어요. 최소 3~6개월 전에 일정을 협의해 주세요. Stage 1(문서 심사)과 Stage 2(현장 심사) 일정을 함께 잡되, 문서 준비를 마친 뒤 Stage 1을 하는 게 효율적이에요.",
          },
          {
            task: "심사 대상 사이트 목록 확정",
            detail:
              "사이트가 여러 곳(설계, 제조, 유통 등)이라면 어느 사이트가 심사 범위에 들어가는지 CB와 미리 협의해 주세요. 사이트마다 연락 담당자도 정해 두세요.",
          },
          {
            task: "심사 준비 내부 담당자 배정",
            detail:
              "심사 항목별 문서 담당자와 인터뷰 담당자를 미리 정하고, 심사 당일 필요한 문서 목록을 만들어요. 모의심사(Pre-assessment)로 준비 상태를 미리 점검해 보는 걸 권해요.",
          },
          {
            task: "심사 공간·회의실 미리 예약",
            detail:
              "심사원이 쓸 회의실과 문서 검토 공간을 예약하고, 필요한 IT 장비(프린터, 프로젝터)를 준비해요. 심사 당일 혼선이 없도록 내부 공지도 함께 해 주세요.",
          },
          {
            task: "문서 버전이 서로 맞는지 최종 점검",
            detail:
              "심사 제출 문서의 버전 번호, 유효일, 승인자 서명이 모두 맞는지 확인해요. 옛 버전 절차서가 현장에 남아 있으면 부적합 사항이 돼요.",
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
              "IVDD의 List A(자기적합선언 불가 · 고위험 품목: HIV, 혈액형, 간염 등)와 List B(NB 적합성 평가 또는 CE 마킹에 EU-공인 기준물질 필요)에 제품이 들어가는지 확인해요. 목록에 없는 품목은 대부분 Annex III 자기선언 경로예요.",
          },
          {
            task: "자가검사(self-testing) 해당 여부 결정",
            detail:
              "자가검사 기기는 Annex I 부가 요건(일반인 사용 적합성)과 Annex IV/V 적합성 평가 경로를 함께 고려해야 해요. 일반인이 쓰는 기기라는 점을 IFU와 의도된 사용에 분명히 적어 주세요.",
          },
          {
            task: "의도된 목적(Intended Purpose) 초안 쓰기",
            detail:
              "IVDR과 마찬가지로 의도된 목적이 분류와 적합성 평가의 출발점이에요. 측정 분석물, 검체 유형, 사용자, 사용 환경, 임상적 목적을 담아 초안을 쓰고, 법무·RA(인허가 담당)와 함께 검토해 주세요.",
          },
          {
            task: "적합성 절차 경로(Annex IV·V·VI·VII) 선택",
            detail:
              "IVDD는 기기 분류에 따라 적합성 평가 경로가 달라요. List A → Annex IV(QMS+기술문서) 또는 Annex V+VI, List B → Annex III+IV(QMS) 또는 III+V+VI, 기타 → Annex III 자기선언이에요. 경로마다 필요한 서류가 다르니 일찍 경로를 확정해 주세요.",
          },
        ],
      },
      {
        category: "기존 문서 모으기",
        tasks: [
          {
            task: "98/79/EC 기기 파일(Technical File) 현황 확인",
            detail:
              "IVDD 기기 파일에는 제품 설명, 성능 평가, 제조 정보, 라벨·IFU, 적합성 선언이 들어가요. 파일이 얼마나 완성됐고 최신인지 점검해 주세요. IVDR로 전환할 때 보강할 항목도 목록으로 만들어 두세요.",
          },
          {
            task: "기존 성능 평가 자료가 있는지 확인",
            detail:
              "IVDR로 전환할 때 기존 IVDD 성능 데이터를 쓸 수 있어요. 다만 IVDR의 3가지 성능 기둥(과학적 타당성·분석 성능·임상 성능)에 맞춘 추가 데이터가 필요할 수 있어요. 갖고 있는 데이터를 쓸 수 있는지 RA와 미리 검토해 주세요.",
          },
          {
            task: "현행 EC 적합성선언(DoC) 유효성 확인",
            detail:
              "지금 발행된 DoC의 적용 규정·버전·서명 권한이 유효한지 확인해요. 설계 변경이 있었다면 DoC도 갱신해야 해요.",
          },
          {
            task: "IVDR 전환 목표 일자 내부 합의",
            detail:
              "Regulation (EU) 2024/1860로 바뀐 일정을 기준으로 내부 전환 목표를 정해 주세요. 전환 종료일은 Class D 2027.12.31, Class C 2028.12.31, Class B·A 멸균 2029.12.31이에요. 이 연장을 받으려면 QMS를 2025.5.26까지 갖추고, NB 신청(Class D 2025.5.26, Class C 2026.5.26, Class B·A 멸균 2027.5.26)과 NB 서면 계약(각각 같은 해 9.26)을 기한 안에 마쳐야 해요. 단, IVDD NB 인증서가 이미 있는 기기는 등급과 상관없이 Class D 일정(신청 2025.5.26, 판매 2027.12.31)을 따라요. (IVDR Art.110(3a)~(3c) — EUR-Lex 원문 대조 2026-11-05) 경영진 승인을 받아 일정을 공식으로 정해 두세요.",
          },
        ],
      },
      {
        category: "IVDR 전환 준비",
        tasks: [
          {
            task: "IVDR 요건 대비 갭 분석(Gap Analysis) 하기",
            detail:
              "지금의 IVDD 기기 파일을 IVDR의 Annex II/III 요건과 비교해 빠진 항목을 찾아요. 특히 IVDR에서 강화된 성능평가(Annex XIII), 시판 후 감시(Annex III), UDI/EUDAMED 요건이 핵심 갭이 돼요.",
          },
          {
            task: "IVDR NB 사전 접촉과 제출 패키지 확인",
            detail:
              "IVDR NB 수가 적어서 일찍 NB에 사전 미팅(Pre-submission Meeting)을 요청하는 게 좋아요. 이때 제출 패키지 요건과 일정을 확인해 주세요. NB마다 요구 서류 양식·절차가 다를 수 있어요.",
          },
          {
            task: "전환 예산과 추가 시험 계획 세우기",
            detail:
              "IVDR 전환에 필요한 추가 성능 시험, 임상 데이터 수집, NB 계약 비용을 예산에 넣어요. 특히 임상 시험 기간이 길 수 있으니 리드 타임(준비 기간)을 넉넉히 잡아 주세요.",
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
        category: "목표 국가 정하기",
        tasks: [
          {
            task: "목표 수출 국가(미국·캐나다·브라질·호주·일본) 확정",
            detail:
              "MDSAP(의료기기 단일 심사 프로그램)는 미국 FDA, 캐나다 HC, 브라질 ANVISA, 호주 TGA, 일본 PMDA 5개국 요건을 한 번의 심사로 충족해요. 수출할 나라를 먼저 정해야 심사 범위와 준비 서류가 정해져요.",
          },
          {
            task: "나라별 규제 요건 미리 조사",
            detail:
              "참가국마다 MDSAP 말고도 추가 요건이 있을 수 있어요. 예를 들어 브라질 ANVISA는 MDSAP 인증서와 별도로 추가 등록이 필요해요. 일본 PMDA에는 QMS 적합성 조사 면제 신청 절차가 있어요. 나라별 추가 요건을 목록으로 만들어 두세요.",
          },
          {
            task: "캐나다 MDEL 보유 여부 확인",
            detail:
              "캐나다 Health Canada에 수출하려면 MDEL(Medical Device Establishment License)이 필요해요. MDEL 신청은 MDSAP 인증과 별개 절차예요. 이미 받았는지 미리 확인하고, 필요하면 신청을 준비해 주세요.",
          },
          {
            task: "브라질 ANVISA 등록 현황 확인",
            detail:
              "브라질은 ANVISA 등록이 필요하고, MDSAP 인증이 등록 요건 가운데 하나예요. 이미 등록된 제품이 있다면 MDSAP 인증을 받은 뒤 갱신이 필요한지 확인해 주세요. 새 제품이라면 등록 일정을 미리 계획해 두세요.",
          },
        ],
      },
      {
        category: "QMS 준비",
        tasks: [
          {
            task: "ISO 13485:2016 인증 현황 확인",
            detail:
              "MDSAP는 ISO 13485:2016을 바탕으로 해요. 아직 ISO 13485 인증이 없다면 MDSAP 준비와 함께 취득 계획을 세워요. 인증이 있다면 범위(Scope)가 MDSAP 신청 제품을 포함하는지 확인해 주세요.",
          },
          {
            task: "MDSAP 7챕터 요건 대비 갭 분석 시작",
            detail:
              "MDSAP는 7개 챕터로 이뤄져 있어요. Ch.1 경영책임, Ch.2 기기 마케팅 허가, Ch.3 측정·분석·개선, Ch.4 설계·개발, Ch.5 생산·서비스 통제, Ch.6 지원 프로세스(구매·설비·인적자원), Ch.7 시판 후 활동이에요. 챕터마다 현황을 스스로 평가하고, 부족한 점에 우선순위를 매겨 주세요.",
          },
          {
            task: "심사기관(AO) 후보 목록 모으기",
            detail:
              "MDSAP 심사는 IMDRF가 인정한 AO(Auditing Organization, 심사기관)만 할 수 있어요. BSI, SGS, TÜV, Dekra 같은 주요 AO의 MDSAP 경험, 나라별 전문성, 견적을 비교해 보세요. 최소 2~3곳과 상담해 주세요.",
          },
          {
            task: "MDSAP 심사 예산·일정 계획 세우기",
            detail:
              "MDSAP Stage 1(문서 심사)과 Stage 2(현장 심사) 비용을 AO에서 견적받아 예산에 넣어요. 초기 심사는 보통 3~5일 걸려요. 해마다 받는 감시 심사와 재인증 심사 비용도 중장기 예산에 넣어 주세요.",
          },
        ],
      },
      {
        category: "챕터별 핵심 준비",
        tasks: [
          {
            task: "Ch.2 기기 마케팅 허가 — 나라별 등록·허가 현황 문서화",
            detail:
              "MDSAP Ch.2는 제품이 나라별 규제 기관에 제대로 허가/등록됐는지 봐요. FDA 510(k)/PMA, Health Canada 면허, ANVISA 등록 등 나라별 현황을 문서 하나로 정리해 주세요.",
          },
          {
            task: "Ch.3 측정·분석·개선 — CAPA·내부심사 실적 정비",
            detail:
              "CAPA 시스템이 실제로 효과 있게 운영되는지, 근본 원인 분석 방법을 적용하고 있는지 확인해요. 내부심사 결과와 경영 검토 기록도 Ch.3 증거로 쓰여요.",
          },
          {
            task: "Ch.7 시판 후 활동 — 나라별 보고 의무 절차 정하기",
            detail:
              "나라마다 시판 후 보고(MDR/Vigilance) 절차와 기한이 달라요. 미국 MDR, 캐나다 Mandatory Problem Reporting, 브라질 Tecnovigilância 등 나라별 절차를 SOP에 반영해 주세요.",
          },
          {
            task: "모의심사(Pre-assessment) 계획",
            detail:
              "본 심사 전에 내부 모의심사를 하거나 AO에게 사전 갭 점검을 받는 걸 권해요. 심사원이 주로 보는 기록 유형과 인터뷰 질문을 미리 알아 두고 담당자를 훈련해 주세요.",
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
            인증 홈
          </Link>
          <div className="flex items-center gap-3" style={{ marginBottom: "var(--s-3)" }}>
            <CheckSquare size={28} style={{ color: "var(--info)" }} aria-hidden />
            <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-3xl)", lineHeight: "var(--lh-tight)" }}>
              업무 시작 전 준비 체크리스트
            </h1>
          </div>
          <p className="text-text-muted" style={{ fontSize: "var(--t-lg)", maxWidth: 640 }}>
            인증별 문서를 쓰기 전에 준비해 두면 좋은 자료·메모·확인할 것들이에요.
            항목을 누르면 자세한 설명이 펼쳐져요.
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
          이 체크리스트는 참고용이에요. 실제 인증 요건은 최신 규제 문서와 인증기관 요건을 먼저 따라 주세요.
        </footer>
      </main>
    </div>
  );
}
