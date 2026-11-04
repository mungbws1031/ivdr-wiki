// =====================================================================
// src/lib/reviewerCheck.ts
// "심사관에게 물어보기" — 결정적 규칙 기반 점검(체크리스트 미완료·빈칸 남음·섹션 미수정만 본다).
// 실제 LLM 호출 없음, 등급·조항 같은 판단성 항목은 다루지 않는다("지어내지 않는다" 원칙).
// 04/03(AI 서버) 완료 후 실제 LLM 기반 심사관 의견으로 고도화할 수 있다.
// 순수 함수 (DOM·localStorage 직접 호출 금지 — 호출 쪽에서 입력을 만들어 넘긴다).
// =====================================================================

export type ReviewerSeverity = "주요" | "경미";

export interface ReviewerFinding {
  severity: ReviewerSeverity;
  message: string;
}

export interface ReviewerCheckInput {
  docId: string;
  sections: { heading: string; placeholder: string }[];
  checklist: string[];
  /** 사용자가 체크한 완료 체크리스트 항목 인덱스 */
  checkedIdx: number[];
  /** 사람이 직접 고친(초안이 있는) 섹션 인덱스 */
  draftedIdx: number[];
}

/** C-10과 같은 빈칸 패턴 — 지어내지 않고 남겨 둔 자리. */
const GAP_PATTERNS = [
  /\[_+\]/g,
  /\[실험 후 입력\]/g,
  /\[사양:[^\]]*\]/g,
  /\[[^[\]]*원문 기준\]/g,
  /\[[^[\]]*확인 필요\]/g,
  /\[[^[\]]*답변 필요[^[\]]*\]/g,
];

function countGaps(text: string): number {
  return GAP_PATTERNS.reduce((n, re) => n + (text.match(re)?.length ?? 0), 0);
}

const AUTO_TOKEN_RE = /\{\{auto\.[^}]+\}\}/;

/**
 * 규칙 기반 점검. DOM/localStorage는 호출 쪽(컴포넌트)에서 읽어 input으로 넘긴다.
 * - 규칙1(C-01): 완료 체크리스트 중 체크 안 된 항목 → 주요
 * - 규칙2(C-05): 사람이 고치지 않았고 {{auto.*}} 토큰도 없는 순수 예시 텍스트 → 경미
 * - 규칙3(C-10): 섹션 안의 빈칸 패턴 개수 > 0 → 주요
 */
export function reviewerFindings(input: ReviewerCheckInput): ReviewerFinding[] {
  const findings: ReviewerFinding[] = [];
  const checked = new Set(input.checkedIdx);
  const drafted = new Set(input.draftedIdx);

  input.checklist.forEach((item, i) => {
    if (!checked.has(i)) {
      findings.push({ severity: "주요", message: `완료 체크리스트 '${item}'이 아직 안 됐어요 — C-01` });
    }
  });

  input.sections.forEach((s, i) => {
    if (!drafted.has(i) && !AUTO_TOKEN_RE.test(s.placeholder)) {
      findings.push({ severity: "경미", message: "이 섹션은 예시 그대로예요(C-05 사람 초안 보호 대상 아님)" });
    }
    const gaps = countGaps(s.placeholder);
    if (gaps > 0) {
      findings.push({ severity: "주요", message: `여기 빈칸이 ${gaps}개 남아 있어요 — C-10` });
    }
  });

  return findings;
}
