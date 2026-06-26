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
    rationale: "ISO 13485:2016 §5.6은 최소 연 1회 QMS 전체 성과를 경영진이 검토해야 한다고 규정한다. NB는 경영 검토 회의록을 첫 인증 심사 필수 서류로 요구한다.",
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
    rationale: "ISO 13485 §7.4.1은 공급업체 평가·선정·재평가를 의무화한다. 공급업체 실패는 제품 결함의 주요 원인이다.",
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
    docTitle: "내부 심사 보고서 (ISO 13485 §8.2.4)",
    purpose: "QMS 내부 심사 계획·실시·결과·시정 조치 요청을 기록하는 문서",
    rationale: "ISO 13485:2016 §8.2.4는 QMS가 계획된 대로 실행·유지되는지 연 1회 이상 내부 심사를 요구한다. NB는 첫 인증 심사 시 내부 심사 이력과 CAR 처리 현황을 반드시 확인한다.",
    difficulty: "med",
    importance: "high",
    knowledge: [
      "ISO 13485:2016 §8.2.4 — 내부 심사 주기·범위·독립성 요건",
      "심사 기준: ISO 13485, 관련 규제 요건, SOP, IVDR 해당 조항",
      "시정 조치 요청(CAR) vs 개선 제안(OFI) 분류 기준",
      "심사원 독립성 원칙 — 자기 업무 심사 금지",
      "심사 프로그램 vs 개별 심사 계획 구분",
    ],
    prerequisites: [
      { kind: "doc", label: "QMS 매뉴얼 — 심사 범위 확인" },
      { kind: "doc", label: "내부 심사 SOP (연간 일정 포함)" },
      { kind: "data", label: "전년도 내부 심사 보고서 (비교 기준)" },
      { kind: "data", label: "시정 조치 대장 (CAR 현황)" },
    ],
    sections: [
      {
        heading: "1. 심사 계획 요약",
        guidance: "심사 목적·범위·기준·심사팀·일정을 기술한다.",
        placeholder: "심사 목적: [____]\n심사 범위(프로세스/부서): [____]\n심사 기준(ISO 13485 §+조항): [____]\n심사 팀/독립성 확인: [____]\n심사 일시: [____]",
      },
      {
        heading: "2. 심사 결과 요약",
        guidance: "적합·부적합·관찰 사항을 요약하고, 부적합은 CAR 번호를 부여한다.",
        placeholder: "| 조항 | 심사 항목 | 결과(적합/부적합/N/A) | CAR# | 비고 |\n|---|---|---|---|---|\n| §4.2.1 | 문서관리 | [____] | [____] | [____] |\n| §7.5.1 | 생산관리 | [____] | [____] | [____] |\n| §8.2.6 | 제품 모니터링 | [____] | [____] | [____] |",
      },
      {
        heading: "3. 시정 조치 요청 (CAR)",
        guidance: "부적합 사항에 대해 근본 원인 분석과 시정 계획을 수립한다. (ISO 13485 §8.5.2)",
        placeholder: "CAR#: [____]\n부적합 사항 기술: [____]\n근본 원인 분석 방법(5Why/Fishbone): [____]\n시정 조치 계획: [____]\n완료 예정일: [____]\n확인자: [____]",
      },
      {
        heading: "4. 심사 결론 및 후속 조치",
        guidance: "전반적 QMS 적합성 평가와 경영 검토 회의 보고 계획을 기술한다.",
        placeholder: "전반적 QMS 적합성 평가: [____]\n제기된 CAR 목록: [____]\n필요 시 후속 심사 일정: [____]\n경영 검토 회의 입력 자료 제출 계획: [____]",
      },
    ],
    checklist: [
      "심사원이 자기 업무를 심사하지 않았는가 (독립성 확인)",
      "ISO 13485:2016 §8.2.4 요건을 모두 포함하는가",
      "모든 부적합에 CAR 번호가 부여됐는가",
      "CAR 완료 예정일과 책임자가 지정됐는가",
      "심사 결과를 경영 검토 회의 입력 자료로 제출할 계획인가",
      "전년도 CAR 처리 현황이 포함됐는가",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 §8.2.4", "ISO 13485:2016 §8.5.2", "ISO 19011:2018"],
  },
  {
    id: "iso-corrective-action",
    stationId: 10,
    docTitle: "시정 조치 보고서 (CAPA)",
    purpose: "부적합 원인 제거 및 재발 방지를 위한 CAPA(Corrective and Preventive Action) 문서",
    rationale: "ISO 13485:2016 §8.5.2/8.5.3는 부적합 원인 분석 및 재발 방지 조치를 의무화한다. FDA 21 CFR 820.100과도 연계되며, NB 심사에서 CAPA 실효성은 핵심 평가 항목이다.",
    difficulty: "med",
    importance: "high",
    knowledge: [
      "ISO 13485:2016 §8.5.2 (시정 조치) vs §8.5.3 (예방 조치) 차이",
      "근본 원인 분석(RCA): 5Why, 피시본(Ishikawa), FTA",
      "CAPA 효과 검증 — 동일 문제 재발 여부 30~90일 후 확인",
      "시정 조치(CA)와 개선 조치(PA)의 문서화 요건",
      "CAPA 트렌드 분석 — 반복 유형별 예방 조치 연계",
    ],
    prerequisites: [
      { kind: "doc", label: "내부 심사 보고서 또는 불만 보고서 — 발원 문서" },
      { kind: "data", label: "관련 제품/프로세스 데이터 (불량률, 불만 이력)" },
      { kind: "doc", label: "해당 SOP — 위반 절차 확인" },
    ],
    sections: [
      {
        heading: "1. 부적합/문제 기술",
        guidance: "발견된 부적합 또는 잠재 위험을 객관적 사실 기반으로 기술한다.",
        placeholder: "CAPA#: [____]\n발원 유형(내부심사/고객불만/제품 불량/바이질런스): [____]\n발원 문서 번호: [____]\n발견 일자: [____]\n발견자/부서: [____]\n문제 기술(What/Where/When/How many): [____]",
      },
      {
        heading: "2. 즉각 조치 (Containment)",
        guidance: "문제의 확산을 막기 위한 즉각적 임시 조치를 기술한다.",
        placeholder: "격리/회수 조치 내용: [____]\n영향 범위 평가(제품/고객): [____]\n임시 조치 완료일: [____]\n책임자: [____]",
      },
      {
        heading: "3. 근본 원인 분석 (RCA)",
        guidance: "5Why 또는 피시본 다이어그램으로 근본 원인을 체계적으로 분석한다.",
        placeholder: "분석 방법: [5Why / Fishbone / FTA]\n문제: [____]\nWhy 1: [____]\nWhy 2: [____]\nWhy 3: [____]\nWhy 4: [____]\n근본 원인: [____]\n기여 요인 목록: [____]",
      },
      {
        heading: "4. 시정 조치 계획 및 효과 검증",
        guidance: "근본 원인을 제거하는 구체적 조치와 효과 검증 방법을 기술한다.",
        placeholder: "| 조치 내용 | 담당자 | 완료일 | 검증 방법 | 검증 완료일 |\n|---|---|---|---|---|\n| [____] | [____] | [____] | [____] | [____] |\n\n효과 검증 결과: [____]",
      },
    ],
    checklist: [
      "발원 유형과 참조 문서가 명확히 기재됐는가",
      "즉각 조치(격리/회수)가 완료됐는가",
      "근본 원인이 재발 방지 수준까지 분석됐는가 (표면 원인 X)",
      "시정 조치가 근본 원인을 직접 겨냥하는가",
      "효과 검증 일정과 담당자가 지정됐는가 (30~90일)",
      "유사 제품/프로세스에 대한 수평 전개(Lateral Spread) 검토가 포함됐는가",
      "CAPA 결과를 경영 검토에 보고할 계획인가",
    ],
    relatedConceptSlugs: ["iso-13485"],
    refs: ["ISO 13485:2016 §8.5.2", "ISO 13485:2016 §8.5.3", "FDA 21 CFR 820.100", "ISO 9001:2015 §10.2"],
  },
];

export const iso13485DocById = (id: string): DocTemplate | undefined =>
  iso13485Documents.find((d) => d.id === id);
