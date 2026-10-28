// =====================================================================
// src/lib/difficulty.ts
// 난이도 4단계 — 쉬움 / 보통 / 어려움 / 매우 어려움(비명). 결과 화면의 얼굴 표정에 쓴다.
// 문서: 작성 난이도(docMeta) + 근거 확정 비율·빈칸 수. 전체: 클래스 + 어려운 문서 비율.
// 순수 함수.
// =====================================================================

import { docMeta, levelRank } from "../data/docTree";
import type { DocEvidence } from "./evidence";
import type { IvdClass } from "./rules/classify";

export type Mood = "easy" | "normal" | "hard" | "scream";
export const MOODS: Mood[] = ["easy", "normal", "hard", "scream"];

export const MOOD_META: Record<Mood, { label: string; emoji: string; color: string }> = {
  easy: { label: "쉬움", emoji: "😊", color: "var(--success)" },
  normal: { label: "보통", emoji: "😐", color: "var(--info)" },
  hard: { label: "어려움", emoji: "😰", color: "var(--warning)" },
  scream: { label: "매우 어려움", emoji: "😱", color: "var(--danger)" },
};

export interface Difficulty {
  mood: Mood;
  /** 1~4 */
  score: number;
  reasons: string[];
}

const toMood = (score: number): Mood => MOODS[Math.min(4, Math.max(1, score)) - 1];
const LEVEL_KO = { low: "낮음", med: "보통", high: "높음" } as const;

/** 문서 하나의 난이도 */
export function docDifficulty(id: string, ev: Pick<DocEvidence, "confirmed" | "counts"> | null): Difficulty {
  const meta = docMeta[id];
  let score = meta ? levelRank[meta.difficulty] : 2;
  const reasons = [`작성 난이도 ${meta ? LEVEL_KO[meta.difficulty] : "보통"}`];
  if (ev && ev.confirmed !== null) {
    const pct = Math.round(ev.confirmed * 100);
    if (ev.confirmed < 0.4) { score++; reasons.push(`근거 확정 ${pct}%`); }
    else if (ev.confirmed >= 0.9) { score--; reasons.push(`근거 확정 ${pct}% — 거의 다 채워짐`); }
    if (ev.counts.missing >= 8) { score++; reasons.push(`빈칸 ${ev.counts.missing}개`); }
  }
  const s = Math.min(4, Math.max(1, score));
  return { mood: toMood(s), score: s, reasons };
}

const CLASS_SCORE: Record<IvdClass, number> = { A: 1, B: 2, C: 3, D: 4 };
const CLASS_WHY: Record<IvdClass, string> = {
  A: "Class A — 대부분 자기선언",
  B: "Class B — NB 심사(QMS + 대표 기술문서)",
  C: "Class C — NB 심사, 자가검사면 기술문서 추가 평가",
  D: "Class D — NB 전체 심사 + EURL 배치 검증",
};

/** 이 제품 인증 전체의 난이도 */
export function overallDifficulty(cls: IvdClass | null, docs: Difficulty[]): Difficulty {
  let score = cls ? CLASS_SCORE[cls] : 3;
  const reasons = [cls ? CLASS_WHY[cls] : "클래스 미정 — 보수적으로 어려움으로 봄"];
  const hard = docs.filter((d) => d.score >= 3).length;
  if (docs.length && hard / docs.length >= 0.3) { score++; reasons.push(`어려운 문서 ${hard}/${docs.length}개`); }
  else if (docs.length) reasons.push(`어려운 문서 ${hard}/${docs.length}개`);
  const s = Math.min(4, Math.max(1, score));
  return { mood: toMood(s), score: s, reasons };
}
