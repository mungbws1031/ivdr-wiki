// 개념 위키 검색창에서 문서 템플릿도 함께 찾는다.
// "포장", "운송"처럼 개념 이름이 아닌 말로 찾는 사람을 위해 제목·메모·그룹·근거 조항·작성 이유를 본다.
import { docTree, rationaleFor } from "../data/docTree";

export interface DocHit {
  id: string;
  title: string;
  group: string;
}

const DOC_INDEX = docTree.flatMap((g) =>
  g.items.map((l) => ({
    id: l.id,
    title: l.title,
    group: g.title,
    haystack: [l.title, l.note ?? "", g.title, ...l.refs, rationaleFor(l.id) ?? ""].join(" ").toLowerCase(),
  })),
);

export function searchDocs(q: string): DocHit[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return DOC_INDEX.filter((d) => d.haystack.includes(needle)).map(({ id, title, group }) => ({ id, title, group }));
}
