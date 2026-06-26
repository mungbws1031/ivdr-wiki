// ivdr-wiki/src/data/iso13485/documents.ts
import type { DocTemplate } from "../documents";

export const iso13485Documents: DocTemplate[] = [
  {
    id: "iso-qms-scope",
    stationId: 1,
    docTitle: "QMS 적용 범위 문서",
    purpose: "ISO 13485:2016 인증의 적용 범위를 명확히 정의해 심사 범위를 고정한다.",
    sections: [
      {
        heading: "1. 조직 개요",
        guidance: "조직명·소재지·주요 활동을 적는다.",
        placeholder: "조직명: [____]\n소재지: [____]\n주요 의료기기 활동: [____]",
      },
      {
        heading: "2. QMS 적용 범위",
        guidance: "인증 범위에 포함되는 제품·서비스·사이트를 명확히 기술한다.",
        placeholder: "포함 제품/서비스: [____]\n포함 사이트/부서: [____]\n제외 사항 및 이유(해당 시): [____]",
      },
      {
        heading: "3. 설계·개발(7.3) 적용 여부",
        guidance: "설계·개발(Clause 7.3) 적용 여부 및 제외 근거를 기술한다.",
        placeholder: "설계·개발 적용: [ ] 예  [ ] 아니오\n제외 근거(아니오인 경우): [____]",
      },
    ],
    checklist: [
      "제품·서비스·사이트가 명확히 기술되어 있다",
      "7.3 제외 여부와 근거가 명시되어 있다",
      "QMS 문서(품질매뉴얼)와 일치한다",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 Clause 4.1", "ISO 13485:2016 Clause 4.2.2"],
  },
  {
    id: "iso-quality-policy",
    stationId: 2,
    docTitle: "품질방침",
    purpose: "조직의 품질에 대한 최고경영진의 의도와 방향을 공식 선언한다.",
    sections: [
      {
        heading: "1. 품질방침 선언문",
        guidance: "최고경영진이 서명한 품질 의지 선언. QMS 목적·지속적 개선·요구사항 충족 의지를 포함한다.",
        placeholder: "[조직명]은 의료기기의 안전·성능·법적 요구사항을 충족하고\n지속적으로 QMS를 개선하여 고객 만족을 실현한다.\n\n서명: _______________  일자: _______________",
      },
      {
        heading: "2. 품질목표와의 연계",
        guidance: "품질방침이 측정 가능한 품질목표(5.4.1)와 어떻게 연결되는지 기술한다.",
        placeholder: "방침 항목 → 관련 품질목표:\n- [방침 1] → [목표 1]\n- [방침 2] → [목표 2]",
      },
    ],
    checklist: [
      "최고경영진 서명이 있다",
      "QMS 목적·지속 개선·요구사항 충족 의지가 포함되어 있다",
      "품질목표와 연계가 명확하다",
      "전 직원에게 전달·이해·유지될 방법이 정해져 있다",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 Clause 5.3"],
  },
  {
    id: "iso-management-review",
    stationId: 2,
    docTitle: "경영 검토 기록",
    purpose: "최고경영진이 QMS의 적절성·효과성을 정기적으로 평가한 결과를 문서화한다.",
    sections: [
      {
        heading: "1. 검토 개요",
        guidance: "검토 일자, 참석자, 회의 목적을 기록한다.",
        placeholder: "검토 일자: [____]  주기: [ ] 연 1회  [ ] 반기\n참석자: [____]",
      },
      {
        heading: "2. 검토 입력",
        guidance: "ISO 13485 Clause 5.6.2의 필수 입력 항목을 모두 검토한다.",
        placeholder: "a) 이전 검토 후속 조치 결과: [____]\nb) 고객 피드백 요약: [____]\nc) 프로세스 성과·제품 적합성: [____]\nd) 시정·예방조치 현황: [____]\ne) 규제 요구사항 변경: [____]\nf) QMS 변경 계획: [____]\ng) 개선 권고사항: [____]",
      },
      {
        heading: "3. 검토 출력 및 결정사항",
        guidance: "QMS 효과성 개선, 제품 개선, 자원 필요성에 대한 결정을 기록한다.",
        placeholder: "결정 사항:\n1. [____]  담당: [____]  기한: [____]\n2. [____]  담당: [____]  기한: [____]",
      },
    ],
    checklist: [
      "Clause 5.6.2의 필수 입력 항목이 모두 포함되어 있다",
      "결정사항에 담당자·기한이 명시되어 있다",
      "다음 검토 시 후속 확인 계획이 있다",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 Clause 5.6"],
  },
  {
    id: "iso-approved-supplier-list",
    stationId: 6,
    docTitle: "승인공급자목록(ASL)",
    purpose: "품질에 영향을 주는 외부 공급자를 평가·선정·관리하는 승인 목록을 유지한다.",
    sections: [
      {
        heading: "1. 목록 개요",
        guidance: "작성일, 버전, 승인자를 기록한다.",
        placeholder: "작성일: [____]  버전: [____]  승인자: [____]",
      },
      {
        heading: "2. 공급자 목록",
        guidance: "각 공급자별 공급 품목, 평가 기준, 현재 상태, 재평가 기한을 기록한다.",
        placeholder: "| 공급자명 | 공급 품목/서비스 | 영향 등급(H/M/L) | 평가 방법 | 승인일 | 재평가 기한 |\n|---|---|---|---|---|---|\n| [____] | [____] | [____] | [____] | [____] | [____] |",
      },
      {
        heading: "3. 평가 기준",
        guidance: "공급자 선정·재평가에 사용하는 기준과 합격 기준을 명시한다.",
        placeholder: "평가 항목:\n- 품질 이력(불량률): 가중치 [_]%\n- 납기 준수율: 가중치 [_]%\n- 인증서 보유(ISO 9001 등): 가중치 [_]%\n합격 기준: [____]점 이상",
      },
    ],
    checklist: [
      "모든 품질 영향 공급자가 등록되어 있다",
      "재평가 기한이 모두 기재되어 있다",
      "최근 버전이 승인자 서명 또는 전자 결재로 승인되어 있다",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 Clause 7.4.1"],
  },
  {
    id: "iso-internal-audit-report",
    stationId: 9,
    docTitle: "내부심사 보고서",
    purpose: "QMS가 계획된 요건에 따라 실행·유지되는지 독립적으로 평가한 결과를 기록한다.",
    sections: [
      {
        heading: "1. 심사 개요",
        guidance: "심사 범위, 기준, 심사원, 일정을 기록한다.",
        placeholder: "심사 범위: [____]\n심사 기준: ISO 13485:2016 Clause [____]\n심사원: [____] (해당 부서와 독립)\n심사 일자: [____]",
      },
      {
        heading: "2. 심사 결과",
        guidance: "각 항목별 적합/부적합/관찰사항을 기록한다.",
        placeholder: "| 조항 | 심사 항목 | 결과 | 비고 |\n|---|---|---|---|\n| 4.2.4 | 의료기기 파일 유지 | [적합/부적합/관찰] | [____] |",
      },
      {
        heading: "3. 후속 조치 계획",
        guidance: "부적합 및 관찰사항에 대한 시정조치 계획과 기한을 기록한다.",
        placeholder: "No. | 발견사항 | 조치 계획 | 담당 | 완료 기한\n1 | [____] | [____] | [____] | [____]",
      },
    ],
    checklist: [
      "심사원이 심사 대상 부서와 독립되어 있다",
      "모든 부적합에 시정조치 계획이 있다",
      "다음 심사 일정이 수립되어 있다",
      "경영 검토 입력으로 이 보고서가 참조된다",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 Clause 8.2.2"],
  },
  {
    id: "iso-corrective-action",
    stationId: 10,
    docTitle: "시정조치(CA) 기록",
    purpose: "발생한 부적합의 근본 원인을 제거해 재발을 방지하는 시정조치를 기록한다.",
    sections: [
      {
        heading: "1. 이슈 설명",
        guidance: "발생한 부적합 또는 고객 컴플레인을 구체적으로 기술한다.",
        placeholder: "발생일: [____]  보고자: [____]\n이슈 설명: [____]\n영향 범위: [ ] 제품  [ ] 프로세스  [ ] 시스템",
      },
      {
        heading: "2. 근본 원인 분석",
        guidance: "5-Why, 특성요인도 등의 방법으로 근본 원인을 파악한다.",
        placeholder: "분석 방법: [5-Why / 특성요인도 / 기타]\nWhy 1: [____]\nWhy 2: [____]\nWhy 3: [____]\n근본 원인: [____]",
      },
      {
        heading: "3. 시정조치 계획 및 결과",
        guidance: "근본 원인을 제거하는 조치를 계획하고 완료 후 효과를 검증한다.",
        placeholder: "조치 내용: [____]\n담당: [____]  기한: [____]\n완료일: [____]\n효과 검증 방법: [____]\n검증 결과: [ ] 효과 있음  [ ] 추가 조치 필요",
      },
    ],
    checklist: [
      "근본 원인이 표면적 원인이 아닌 근본 수준까지 파악되어 있다",
      "조치 후 효과 검증 결과가 기록되어 있다",
      "유사 이슈에 대한 예방적 확산 적용 여부를 검토했다",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 Clause 8.5.2"],
  },
];

export const iso13485DocById = (id: string): DocTemplate | undefined =>
  iso13485Documents.find((d) => d.id === id);
