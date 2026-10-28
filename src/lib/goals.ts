// =====================================================================
// src/lib/goals.ts
// 목표 체크리스트 — 스펙 → 분류 확정 → 운송 → 실험 결과 → 사람 할 일 → 문서 완료.
// 순수 함수: 필요한 값을 인자로 받는다.
// =====================================================================

import type { ProductSpec } from "../data/spec/types";

export interface Goal {
  id: string;
  title: string;
  hint: string;
  done: number;
  total: number;
  to: string;
}

export interface GoalInput {
  spec: ProductSpec;
  specFilled: { filled: number; total: number };
  classConfirmed: boolean;
  results: { entered: number; total: number };
  tasksLeft: number;
  /** 처음에 센 사람 할 일 수가 없으므로, 남은 할 일이 0이면 완료로 본다 */
  docs: { done: number; total: number };
}

export function buildGoals(g: GoalInput): Goal[] {
  const markets = g.spec.markets?.length ?? 0;
  const modes = g.spec.transport.modes?.length ?? 0;
  return [
    { id: "cert", title: "받아야 할 인증 고르기", hint: "어떤 인증을 받아야 하나요?", done: markets > 0 ? 1 : 0, total: 1, to: "/auto" },
    { id: "spec", title: "제품 스펙 입력", hint: "필수 항목", done: g.specFilled.filled, total: g.specFilled.total, to: "/auto" },
    { id: "class", title: "클래스 확정", hint: "추천 클래스를 사람이 확정", done: g.classConfirmed ? 1 : 0, total: 1, to: "/auto/docs" },
    { id: "transport", title: "운송·포장 정보", hint: "운송 방식 선택", done: modes > 0 ? 1 : 0, total: 1, to: "/auto/transport" },
    { id: "results", title: "실험 결과 입력", hint: "필수·권장 실험", done: g.results.entered, total: g.results.total, to: "/auto/results" },
    { id: "tasks", title: "사람 할 일 처리", hint: g.tasksLeft > 0 ? `남은 할 일 ${g.tasksLeft}건` : "남은 할 일 없음", done: g.tasksLeft === 0 ? 1 : 0, total: 1, to: "/auto/overview" },
    { id: "docs", title: "문서 완료", hint: "문서 화면에서 '완료'로 표시", done: g.docs.done, total: g.docs.total, to: "/auto/factory" },
  ];
}

export const goalDone = (x: Goal) => x.total > 0 && x.done >= x.total;
