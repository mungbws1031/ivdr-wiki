// =====================================================================
// vite/wikiContent.ts
// 개념 위키 노트(content/wiki/*.md, 옵시디언에서 편집) → 사이트 데이터 변환기.
//
// - 빌드·개발 서버·테스트에서 `virtual:wiki-concepts` 모듈로 노트를 읽어 준다.
// - 노트의 [[slug|표시텍스트]] 링크를 사이트 형식 {{slug|표시텍스트}} 로 바꾼다.
// - 깨진 링크·빠진 필수 칸·잘못된 파일 이름이 있으면 빌드를 멈춘다(공개 사이트 보호).
// - status: draft 노트는 개발 서버에서만 보이고 배포 빌드에서는 빠진다.
// =====================================================================

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { parse as parseYaml } from "yaml";

export const VIRTUAL_ID = "virtual:wiki-concepts";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

export const CATEGORIES = ["annex", "standard", "concept", "actor", "deliverable"] as const;
export type Category = (typeof CATEGORIES)[number];

/** 사이트가 쓰는 개념 데이터 모양 (src/data/concepts.ts 의 WikiConcept 와 같음). */
export interface ConceptOut {
  slug: string;
  term: string;
  aka: string[];
  category: Category;
  summary: string;
  body: string[];
  refs: string[];
  relatedStationIds: number[];
  relatedConceptSlugs: string[];
}

interface NoteDraft extends ConceptOut {
  order: number;
  status: "published" | "draft";
  rawBody: string;
  rawRelated: string[];
}

export interface BuildResult {
  concepts: ConceptOut[];
  /** 빌드를 멈춰야 하는 문제 */
  errors: string[];
  /** 알려만 주는 문제 */
  warnings: string[];
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g;
const SITE_LINK_RE = /\{\{([^}|]+)\|([^}]+)\}\}/g;

/** 앞머리(--- ... ---)와 본문을 나눈다. BOM·윈도 줄바꿈(CRLF)도 처리. */
export function splitFrontmatter(src: string): { data: unknown; body: string } | null {
  const text = src.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/.exec(text);
  if (!m) return null;
  return { data: parseYaml(m[1]) ?? {}, body: m[2] };
}

/** 빈 줄로 문단을 나누고, 문단 안의 줄바꿈은 공백 하나로 합친다. */
export function splitParagraphs(body: string): string[] {
  return body
    .split(/\n[ \t]*\n/)
    .map((p) =>
      p
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean);
}

const asStringList = (v: unknown): string[] | null => {
  if (v === undefined || v === null) return [];
  if (typeof v === "string") return v.trim() ? [v.trim()] : [];
  if (Array.isArray(v) && v.every((x) => typeof x === "string" || typeof x === "number"))
    return v.map((x) => String(x).trim()).filter(Boolean);
  return null;
};

const asNumberList = (v: unknown): number[] | null => {
  if (v === undefined || v === null) return [];
  const arr = Array.isArray(v) ? v : [v];
  const out: number[] = [];
  for (const x of arr) {
    const n = typeof x === "number" ? x : typeof x === "string" && x.trim() !== "" ? Number(x) : NaN;
    if (!Number.isInteger(n)) return null;
    out.push(n);
  }
  return out;
};

const asText = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

/** 노트 하나를 읽어 검사한다. slug 는 파일 이름(확장자 제외)이다. */
function readNote(slug: string, src: string, buildErrors: string[], warnings: string[]): NoteDraft | null {
  const where = `content/wiki/${slug}.md`;
  let parts: ReturnType<typeof splitFrontmatter>;
  try {
    parts = splitFrontmatter(src);
  } catch (e) {
    buildErrors.push(`${where}: 노트 맨 위 속성(---) 형식이 잘못됐습니다 — ${(e as Error).message.split("\n")[0]}`);
    return null;
  }
  if (!parts || typeof parts.data !== "object" || Array.isArray(parts.data)) {
    buildErrors.push(`${where}: 노트 맨 위에 속성(--- 로 감싼 term·category·summary 등)이 없습니다. 템플릿으로 새 노트를 만드세요.`);
    return null;
  }
  const d = parts.data as Record<string, unknown>;

  // 초안(draft)의 문제는 배포를 막지 않고 알림으로만 낸다(초안은 어차피 배포에서 빠짐).
  const isDraft = asText(d.status) === "draft";
  const errors: string[] = [];
  const done = (note: NoteDraft | null) => {
    if (isDraft) warnings.push(...errors.map((e) => `${e} (초안이라 배포는 막지 않음)`));
    else buildErrors.push(...errors);
    return errors.length && !isDraft ? null : note;
  };

  if (!SLUG_RE.test(slug)) {
    errors.push(`${where}: 파일 이름은 영문 소문자·숫자·하이픈(-)만 쓸 수 있습니다. 예: annex-viii.md (파일 이름이 사이트 주소가 됩니다)`);
    return done(null);
  }

  const term = asText(d.term);
  const summary = asText(d.summary);
  const category = asText(d.category) as Category;
  if (!term) errors.push(`${where}: term(제목)이 비어 있습니다.`);
  if (!summary) errors.push(`${where}: summary(한 줄 정의)가 비어 있습니다.`);
  if (!CATEGORIES.includes(category))
    errors.push(`${where}: category 는 ${CATEGORIES.join(" · ")} 중 하나여야 합니다. (지금: "${asText(d.category)}")`);

  const aka = asStringList(d.aliases);
  const refs = asStringList(d.refs);
  const related = asStringList(d.related);
  const stations = asNumberList(d.stations);
  if (!aka) errors.push(`${where}: aliases 는 글자 목록이어야 합니다.`);
  if (!refs) errors.push(`${where}: refs 는 글자 목록이어야 합니다.`);
  if (!related) errors.push(`${where}: related 는 개념 파일 이름 목록이어야 합니다.`);
  if (!stations) errors.push(`${where}: stations 는 정거장 번호(숫자) 목록이어야 합니다.`);

  const statusText = asText(d.status) || "published";
  if (statusText !== "published" && statusText !== "draft")
    errors.push(`${where}: status 는 published(공개) 또는 draft(초안)만 쓸 수 있습니다.`);

  const orderRaw = d.order;
  const order = typeof orderRaw === "number" ? orderRaw : Number.POSITIVE_INFINITY;
  if (orderRaw !== undefined && typeof orderRaw !== "number")
    warnings.push(`${where}: order 는 숫자여야 합니다. 목록 맨 뒤에 놓습니다.`);

  if (!parts.body.trim()) errors.push(`${where}: 본문이 비어 있습니다.`);
  if (/!\[\[/.test(parts.body)) warnings.push(`${where}: ![[...]] 삽입(이미지·노트)은 사이트에 표시되지 않습니다.`);
  for (const line of parts.body.split("\n")) {
    if (/^\s*(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|\|)/.test(line)) {
      warnings.push(`${where}: 제목(#)·목록(-)·인용(>)·표(|)는 사이트에서 서식 없이 글자로 보입니다 → "${line.trim().slice(0, 30)}"`);
      break;
    }
  }

  return done({
    slug,
    term,
    aka: aka ?? [],
    category,
    summary,
    body: [],
    refs: refs ?? [],
    relatedStationIds: stations ?? [],
    relatedConceptSlugs: [],
    order,
    status: statusText === "draft" ? "draft" : "published",
    rawBody: parts.body,
    rawRelated: related ?? [],
  });
}

/**
 * 노트 묶음 → 사이트 데이터.
 * includeDrafts=false(배포)면 draft 노트를 빼고, 초안으로 가는 링크는 글자만 남긴다.
 */
export function buildConcepts(
  files: { name: string; src: string }[],
  opts: { includeDrafts: boolean },
): BuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const all = files
    .filter((f) => f.name.endsWith(".md") && !f.name.startsWith("_"))
    .map((f) => readNote(f.name.slice(0, -3), f.src, errors, warnings))
    .filter((n): n is NoteDraft => n !== null);

  // 링크 대상 찾기: 파일 이름(slug) → 별칭·제목 순서 (옵시디언처럼)
  const bySlug = new Map(all.map((n) => [n.slug, n]));
  const byName = new Map<string, NoteDraft>();
  for (const n of all) {
    for (const name of [n.term, ...n.aka]) {
      const key = name.toLowerCase();
      const prev = byName.get(key);
      if (prev && prev.slug !== n.slug)
        warnings.push(`별칭 "${name}"이(가) ${prev.slug}.md 와 ${n.slug}.md 에 함께 있습니다. [[${name}]] 링크는 ${prev.slug} 로 연결됩니다.`);
      else byName.set(key, n);
    }
  }
  const findNote = (target: string) => bySlug.get(target.trim()) ?? byName.get(target.trim().toLowerCase());
  const visible = (n: NoteDraft) => opts.includeDrafts || n.status === "published";

  for (const n of all) {
    const where = `content/wiki/${n.slug}.md`;
    // 배포에 안 나가는 초안의 링크 문제는 알림으로만
    const problems = visible(n) && n.status === "published" ? errors : warnings;
    const rewrite = (p: string) =>
      p
        .replace(WIKILINK_RE, (whole, target: string, label?: string) => {
          const hit = findNote(target);
          if (!hit) {
            problems.push(`${where}: ${whole} — "${target.trim()}" 라는 개념 노트가 없습니다. 파일 이름을 확인하세요.`);
            return label ?? target;
          }
          const text = label ?? (hit.slug === target.trim() ? hit.term : target.trim());
          if (!visible(hit)) {
            if (visible(n)) warnings.push(`${where}: ${whole} — 초안(draft) 노트라 사이트에서는 링크 없이 글자만 보입니다.`);
            return text;
          }
          return `{{${hit.slug}|${text}}}`;
        })
        .replace(SITE_LINK_RE, (whole, target: string) => {
          if (!bySlug.has(target.trim())) problems.push(`${where}: ${whole} — "${target.trim()}" 개념이 없습니다.`);
          return whole;
        });
    n.body = splitParagraphs(n.rawBody).map(rewrite);

    n.relatedConceptSlugs = [];
    for (const r of n.rawRelated) {
      // "[[annex-viii]]" · "[[annex-viii|분류]]" · "annex-viii" 모두 허용 (옵시디언 그래프·이름 변경 추적용으로 [[ ]] 권장)
      const hit = findNote(/^\[\[([^\]|#]+)/.exec(r)?.[1] ?? r);
      if (!hit) problems.push(`${where}: related 의 "${r}" — 그런 개념 노트가 없습니다.`);
      else if (!visible(hit)) {
        if (visible(n)) warnings.push(`${where}: related 의 "${r}" — 초안 노트라 사이트 연결에서 뺍니다.`);
      } else if (!n.relatedConceptSlugs.includes(hit.slug)) n.relatedConceptSlugs.push(hit.slug);
    }
  }

  const concepts = all
    .filter(visible)
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
    .map(
      ({ slug, term, aka, category, summary, body, refs, relatedStationIds, relatedConceptSlugs }): ConceptOut => ({
        slug,
        term,
        aka,
        category,
        summary,
        body,
        refs,
        relatedStationIds,
        relatedConceptSlugs,
      }),
    );
  return { concepts, errors, warnings };
}

export function readWikiDir(dir: string): { name: string; src: string }[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => ({ name, src: readFileSync(join(dir, name), "utf8") }));
}

/** Vite 플러그인: import concepts from "virtual:wiki-concepts" */
export function wikiContent(options: { dir?: string } = {}): Plugin {
  let dir = "";
  let includeDrafts = false;
  return {
    name: "wiki-content",
    configResolved(config) {
      dir = resolve(config.root, options.dir ?? "content/wiki");
      includeDrafts = config.command === "serve";
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const files = readWikiDir(dir);
      for (const f of files) this.addWatchFile(join(dir, f.name));
      const { concepts, errors, warnings } = buildConcepts(files, { includeDrafts });
      for (const w of warnings) this.warn(w);
      if (errors.length)
        this.error(`위키 노트에 고칠 곳이 ${errors.length}개 있습니다:\n- ${errors.join("\n- ")}`);
      return `export default ${JSON.stringify(concepts)};`;
    },
    configureServer(server) {
      server.watcher.add(dir);
      const reload = (file: string) => {
        if (!file.startsWith(dir) || !file.endsWith(".md")) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", reload);
      server.watcher.on("change", reload);
      server.watcher.on("unlink", reload);
    },
  };
}
