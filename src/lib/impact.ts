// =====================================================================
// src/lib/impact.ts
// 변경 영향 — 문서를 검토한 때의 값(기준)과 지금 값을 비교해, 바뀐 값과 영향받는 섹션을 찾는다.
//   자동 채움 섹션: 새 값으로 이미 바뀌었다 → 바뀐 내용만 확인
//   사람이 직접 쓴 섹션: 이전 값 기준으로 쓴 글이다 → 재검토 필요
// 순수 함수.
// =====================================================================

const TOKEN_RE = /\{\{auto\.([a-zA-Z]+)\}\}/g;

type Doc = { sections: { heading: string; placeholder: string }[] };
export type Snapshot = Record<string, string | null>;

export interface Change {
  key: string;
  before: string | null;
  after: string | null;
}

export interface SectionImpact {
  index: number;
  heading: string;
  /** 사람이 직접 쓴 섹션이면 재검토 필요 */
  drafted: boolean;
  keys: string[];
}

export interface DocImpact {
  changes: Change[];
  sections: SectionImpact[];
  /** 재검토가 필요한(직접 쓴) 섹션 수 */
  review: number;
}

/** 섹션별 토큰 키 */
export function sectionKeys(doc: Doc): string[][] {
  return doc.sections.map((s) => [...new Set([...s.placeholder.matchAll(TOKEN_RE)].map((m) => m[1]))]);
}

/** 이 문서가 쓰는 토큰의 현재 값 — 검토 기준으로 저장한다 */
export function snapshotOf(doc: Doc, ctx: Record<string, string | null>): Snapshot {
  const out: Snapshot = {};
  for (const k of sectionKeys(doc).flat()) out[k] = ctx[k] ?? null;
  return out;
}

const norm = (v: string | null | undefined) => (v === undefined || v === "" ? null : v);

/** 기준과 지금 값 비교. 기준에 없던 토큰(템플릿이 늘어난 경우)은 변경으로 보지 않는다. */
export function docImpact(doc: Doc, base: Snapshot | null, ctx: Record<string, string | null>, drafted: (i: number) => boolean = () => false): DocImpact {
  if (!base) return { changes: [], sections: [], review: 0 };
  const changes: Change[] = [];
  for (const [key, before] of Object.entries(base)) {
    const after = norm(ctx[key]);
    if (norm(before) !== after) changes.push({ key, before: norm(before), after });
  }
  const changed = new Set(changes.map((c) => c.key));
  const sections = sectionKeys(doc)
    .map((keys, index) => ({ index, heading: doc.sections[index].heading, drafted: drafted(index), keys: keys.filter((k) => changed.has(k)) }))
    .filter((s) => s.keys.length > 0);
  return { changes, sections, review: sections.filter((s) => s.drafted).length };
}

/** 화면용 짧은 값 — 여러 줄이면 첫 줄 + 줄 수 */
export function shortValue(v: string | null, max = 40): string {
  if (v === null) return "(비어 있음)";
  const lines = v.split("\n");
  const first = lines[0].length > max ? `${lines[0].slice(0, max)}…` : lines[0];
  return lines.length > 1 ? `${first} (외 ${lines.length - 1}줄)` : first;
}

/** 긴 두 값의 차이 부분만 — 공통 앞부분은 "…"로 줄인다 */
export function diffValues(before: string | null, after: string | null, max = 40): [string, string] {
  if (before === null || after === null) return [shortValue(before, max), shortValue(after, max)];
  let i = 0;
  while (i < before.length && i < after.length && before[i] === after[i]) i++;
  if (i < 12) return [shortValue(before, max), shortValue(after, max)];
  const from = Math.max(0, i - 8);
  return [`…${shortValue(before.slice(from), max)}`, `…${shortValue(after.slice(from), max)}`];
}
