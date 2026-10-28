// 번역 요청·응답 텍스트 형식 — 섹션을 <<<SECTION n>>> 표시로 나눈다.

export interface Section { heading: string; body: string }

export function toPrompt(title: string, sections: Section[]): string {
  return [`<<<TITLE>>>\n${title}`, ...sections.map((s, i) => `<<<SECTION ${i + 1}>>>\n${s.heading}\n---\n${s.body}`)].join("\n");
}

export function parseOutput(text: string, n: number): { title: string; sections: Section[] } | null {
  const t = text.match(/<<<TITLE>>>\s*\n([\s\S]*?)(?=\n<<<SECTION 1>>>)/);
  const sections: Section[] = [];
  for (let i = 1; i <= n; i++) {
    const re = new RegExp(`<<<SECTION ${i}>>>\\s*\\n([\\s\\S]*?)(?=\\n<<<SECTION ${i + 1}>>>|$)`);
    const m = text.match(re);
    if (!m) return null;
    const [heading, ...rest] = m[1].split(/\n---\n?/);
    sections.push({ heading: heading.trim(), body: rest.join("\n---\n").replace(/\s+$/, "") });
  }
  return t ? { title: t[1].trim(), sections } : null;
}
