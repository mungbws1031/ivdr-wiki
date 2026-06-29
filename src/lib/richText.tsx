import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { conceptBySlug } from "../data/concepts";

/**
 * 본문 인라인 렌더러.
 * 지원: **굵게**, {{slug|표시텍스트}} → /wiki/slug 개념 링크 (양방향 연결의 핵심).
 * 알 수 없는 slug 는 링크 없이 텍스트만 표시(깨지지 않게).
 */
const CONCEPT_RE = /\{\{([^}|]+)\|([^}]+)\}\}/g;

function renderBold(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-b${i}`} className="font-bold text-text">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={`${keyPrefix}-t${i}`}>{part}</Fragment>
    ),
  );
}

export function renderRich(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  CONCEPT_RE.lastIndex = 0;
  while ((m = CONCEPT_RE.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(...renderBold(text.slice(last, m.index), `seg${idx}`));
    }
    const slug = m[1].trim();
    const label = m[2];
    const exists = !!conceptBySlug(slug);
    if (exists) {
      nodes.push(
        <Link
          key={`lnk${idx}`}
          to={`/wiki/${slug}`}
          className="font-semibold underline decoration-dotted underline-offset-2 hover:decoration-solid"
          style={{ color: "var(--info)" }}
        >
          {label}
        </Link>,
      );
    } else {
      nodes.push(<Fragment key={`lnk${idx}`}>{label}</Fragment>);
    }
    last = m.index + m[0].length;
    idx++;
  }
  if (last < text.length) {
    nodes.push(...renderBold(text.slice(last), `seg${idx}`));
  }
  return nodes;
}
