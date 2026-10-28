// =====================================================================
// server/api/translate.ts — Vercel 함수: 한국어 규제 문서를 영어로 번역 (Claude API)
// 요청: POST { title, sections: [{ heading, body }] }
// 응답: { title, sections: [{ heading, body }], model }
// 보호: 이 사이트 출처(Origin)만 허용, 요청 크기·출력 길이 상한. 키는 ANTHROPIC_API_KEY 환경변수.
// =====================================================================

import Anthropic from "@anthropic-ai/sdk";
import { parseOutput, toPrompt, type Section } from "../lib/format.js";

const ALLOWED_ORIGINS = ["https://mungbws1031.github.io", "http://localhost:5173", "http://127.0.0.1:4199"];
const MAX_INPUT_CHARS = 60_000;
const MAX_SECTIONS = 40;
const MODEL = "claude-opus-5-5";

const SYSTEM = `You translate Korean regulatory documents for in vitro diagnostic medical devices (EU IVDR, ISO 13485, US FDA and other markets) into English for submission to notified bodies and regulators.

Rules:
- Translate faithfully and completely. Do not add, remove, summarize or invent content, numbers, references or claims.
- Use standard regulatory English terminology, for example: 의도된 목적 → intended purpose; 성능평가 → performance evaluation; 사용설명서 → instructions for use (IFU); 위해 → harm; 위험 → risk; 적합성 평가 → conformity assessment; 기술문서 → technical documentation; 시판 후 감시 → post-market surveillance; 민감도/특이도 → sensitivity/specificity; 자가검사 → self-testing.
- Keep regulation and standard identifiers, numbers, units, product names, model numbers and codes exactly as written.
- Keep square-bracket placeholders as placeholders and translate only the Korean words inside them: [실험 후 입력] → [To be entered after testing]; [____] stays [____]; [사양: 기준 % — 사람이 정함] → [Specification: criterion % — to be decided by a person].
- Keep the line structure, bullets, numbering and markdown tables.

Output format, and nothing else:
<<<TITLE>>>
translated document title
<<<SECTION 1>>>
translated heading
---
translated body
<<<SECTION 2>>>
...`;


const client = new Anthropic();

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

const json = (status: number, body: unknown, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });

export function OPTIONS(request: Request): Response {
  return new Response(null, { status: 204, headers: cors(request.headers.get("origin")) });
}

function parseInput(x: unknown): { title: string; sections: Section[] } | string {
  if (!x || typeof x !== "object") return "요청 형식이 맞지 않습니다.";
  const o = x as Record<string, unknown>;
  if (typeof o.title !== "string" || !Array.isArray(o.sections)) return "title·sections가 필요합니다.";
  if (o.sections.length === 0 || o.sections.length > MAX_SECTIONS) return `섹션은 1~${MAX_SECTIONS}개여야 합니다.`;
  const sections: Section[] = [];
  for (const s of o.sections) {
    if (!s || typeof s !== "object") return "섹션 형식이 맞지 않습니다.";
    const r = s as Record<string, unknown>;
    if (typeof r.heading !== "string" || typeof r.body !== "string") return "섹션에는 heading·body 문자열이 필요합니다.";
    sections.push({ heading: r.heading, body: r.body });
  }
  const size = o.title.length + sections.reduce((n, s) => n + s.heading.length + s.body.length, 0);
  if (size > MAX_INPUT_CHARS) return `문서가 너무 깁니다 (${size}자, 최대 ${MAX_INPUT_CHARS}자).`;
  return { title: o.title, sections };
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return json(403, { error: "허용되지 않은 출처입니다." }, origin);
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: "번역 서버에 API 키가 설정되지 않았습니다 (ANTHROPIC_API_KEY)." }, origin);

  let input: ReturnType<typeof parseInput>;
  try {
    input = parseInput(await request.json());
  } catch {
    return json(400, { error: "JSON이 아닙니다." }, origin);
  }
  if (typeof input === "string") return json(400, { error: input }, origin);

  try {
    const message = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: 32000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        system: SYSTEM,
        messages: [{ role: "user", content: toPrompt(input.title, input.sections) }],
      })
      .finalMessage();

    if (message.stop_reason === "refusal") return json(422, { error: "번역이 거절되었습니다. 문서 내용을 확인해 주세요." }, origin);
    if (message.stop_reason === "max_tokens") return json(413, { error: "번역 결과가 너무 길어 잘렸습니다. 문서를 나눠 번역해 주세요." }, origin);
    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const out = parseOutput(text, input.sections.length);
    if (!out) return json(502, { error: "번역 결과 형식을 읽지 못했습니다. 다시 시도해 주세요." }, origin);
    return json(200, { ...out, model: message.model }, origin);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json(429, { error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." }, origin);
    if (err instanceof Anthropic.AuthenticationError) return json(503, { error: "번역 서버의 API 키가 올바르지 않습니다." }, origin);
    if (err instanceof Anthropic.APIError) return json(502, { error: `번역 서버 오류 (${err.status ?? "?"})` }, origin);
    return json(500, { error: "번역 중 오류가 났습니다." }, origin);
  }
}
