import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Lightbulb } from "lucide-react";
import { fieldByPath } from "../../data/spec/fields";
import { getAt } from "../../data/spec/validate";
import { getSpec, replaceSpec, setSpecField, useSpec } from "../../hooks/useSpecStore";
import { confirmEstimated, getConcept, saveConcept } from "../../hooks/useConceptStore";
import { applyConcept, openQuestions, parseConcept, presetHits } from "../../lib/concept";

const EXAMPLES = ["집에서 쓰는 소변 LH 배란 스틱, 기기 없이 판매, 유럽·한국 출시", "집에서 쓰는 소변 호르몬 측정기, 스마트폰 연동", "병원 검사실에 들어가는 대형 진단 장비"];

const showValue = (path: string, v: unknown): string => {
  const f = fieldByPath(path);
  if (Array.isArray(v)) return v.map((x) => f?.options?.find((o) => o.value === x)?.label ?? String(x)).join(", ");
  if (typeof v === "boolean") return v ? "예" : "아니오";
  return f?.options?.find((o) => o.value === v)?.label ?? String(v);
};

/** 컨셉 한 줄로 시작 — 문장에서 스펙을 추정하고, 등급을 바꾸는 빈 칸만 되묻는다. */
export function ConceptBox() {
  const spec = useSpec();
  const concept = getConcept();
  const [text, setText] = useState(concept.text);
  const [note, setNote] = useState<string | null>(null);
  const questions = openQuestions(spec);

  const run = () => {
    const hits = parseConcept(text);
    const { spec: next, applied } = applyConcept(getSpec(), hits);
    if (applied.length) replaceSpec(next);
    saveConcept(text, [...getConcept().estimated, ...applied.map((a) => a.path)]);
    setNote(applied.length ? `${applied.length}개 칸을 추정해서 채웠습니다. 이미 입력한 칸은 그대로 두었습니다.` : hits.length ? "뽑은 값이 모두 이미 입력되어 있어 바꾸지 않았습니다." : "문장에서 알아볼 수 있는 단어가 없었습니다. 검체·사용자·형태를 넣어 보세요.");
  };

  const answer = (path: string, value: unknown) => {
    const f = fieldByPath(path);
    if (f?.kind === "multi") {
      const cur = (getAt(getSpec(), path) as string[] | null) ?? [];
      setSpecField(path, cur.includes(value as string) ? cur.filter((x) => x !== value) : [...cur, value]);
    } else setSpecField(path, f?.kind === "tri" ? value === "true" : value);
    // LH·hCG를 고르면 정식 명칭·임상 판단도 비어 있을 때 채운다 (추정)
    if (path === "analyte.preset") {
      const { spec: next, applied } = applyConcept(getSpec(), presetHits(String(value)));
      if (applied.length) {
        replaceSpec(next);
        saveConcept(getConcept().text, [...getConcept().estimated, ...applied.map((a) => a.path)]);
      }
    }
  };

  return (
    <section className="rounded-[var(--r-lg)] border" style={{ borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 5%, var(--bg))", padding: "var(--s-4) var(--s-5)" }} aria-label="컨셉 한 줄로 시작">
      <div className="flex items-center" style={{ gap: 8 }}>
        <Lightbulb size={18} style={{ color: "var(--accent)" }} aria-hidden />
        <h2 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>컨셉 한 줄로 시작하기</h2>
      </div>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>
        대충 적어도 됩니다. 문장에서 검체·사용자·형태·판독 방식을 뽑아 <b>추정</b>으로 채우고, 등급을 바꾸는데 비어 있는 칸만 다시 묻습니다. 답하지 않은 칸은 보수적으로 가정해서 문서를 계속 씁니다.
      </p>
      <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="예: 집에서 쓰는 소변 호르몬 측정기, 스마트폰 연동"
          className="flex-1 rounded-[var(--r-md)] border text-text" style={{ minWidth: 240, padding: "10px 12px", fontSize: "var(--t-base)", borderColor: "var(--border-strong)", background: "var(--bg)", resize: "vertical" }} aria-label="제품 컨셉" />
        <button type="button" onClick={run} disabled={!text.trim()} className="self-start rounded-[var(--r-md)] font-bold disabled:opacity-40" style={{ padding: "10px 18px", minHeight: 44, background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
          컨셉으로 채우기
        </button>
      </div>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginTop: 8, fontSize: "var(--t-xs)" }}>
        <span className="text-text-subtle">예시:</span>
        {EXAMPLES.map((ex) => <button key={ex} type="button" onClick={() => setText(ex)} className="rounded-full hover:bg-surface text-text-muted" style={{ padding: "2px 10px", border: "1px solid var(--border)" }}>{ex}</button>)}
      </div>
      {note && <p role="status" className="font-semibold" style={{ fontSize: "var(--t-sm)", color: "var(--accent)", marginTop: 10 }}>{note}</p>}

      {concept.estimated.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
            <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>추정한 값 {concept.estimated.length}개</span>
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>문서에 "(추정)"이 붙습니다. 맞으면 확인을, 틀리면 아래 입력칸에서 고치세요.</span>
            <button type="button" onClick={() => confirmEstimated()} className="ml-auto inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "4px 12px", fontSize: "var(--t-xs)", border: "1.5px solid var(--success)", color: "var(--success)" }}>
              <Check size={13} aria-hidden /> 모두 맞아요
            </button>
          </div>
          <ul className="flex flex-wrap" style={{ gap: 6, marginTop: 6 }}>
            {concept.estimated.map((p) => (
              <li key={p} className="inline-flex items-center rounded-full" style={{ gap: 6, padding: "3px 4px 3px 10px", fontSize: "var(--t-xs)", background: "color-mix(in srgb, #C9A227 14%, var(--bg))", border: "1px solid #C9A227" }}>
                <a href={`#field-${p}`} className="text-text"><b>{fieldByPath(p)?.label ?? p}</b>: {showValue(p, getAt(spec, p))}</a>
                <button type="button" onClick={() => confirmEstimated([p])} aria-label={`${fieldByPath(p)?.label ?? p} 확인`} className="inline-grid place-items-center rounded-full" style={{ width: 20, height: 20, background: "var(--bg)", color: "var(--success)" }}>
                  <Check size={12} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {questions.length > 0 && (concept.text || concept.estimated.length > 0) && (
        <div style={{ marginTop: 14 }}>
          <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>등급·문서를 바꾸는 질문 {questions.length}개 <span className="font-normal text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>— 답하지 않으면 보수적으로 가정합니다</span></p>
          <ol className="flex flex-col" style={{ gap: 8, marginTop: 6 }}>
            {questions.map((p) => {
              const f = fieldByPath(p);
              if (!f?.options) return null;
              const cur = getAt(spec, p);
              return (
                <li key={p} className="flex flex-wrap items-center" style={{ gap: 6 }}>
                  <span className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", minWidth: 160 }}>{f.label}</span>
                  {f.options.filter((o) => !o.disabled).map((o) => {
                    const on = Array.isArray(cur) ? cur.includes(o.value) : String(cur) === o.value;
                    return (
                      <button key={o.value} type="button" onClick={() => answer(p, o.value)} aria-pressed={on} className="rounded-full font-semibold" style={{ padding: "3px 12px", fontSize: "var(--t-xs)", border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-weak)" : "var(--bg)", color: "var(--text)" }}>
                        {o.label}
                      </button>
                    );
                  })}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {(concept.text || concept.estimated.length > 0) && (
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 14 }}>
          <Link to="/auto/overview" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "8px 14px", fontSize: "var(--t-sm)", background: "var(--text)", color: "var(--bg)" }}>
            이대로 문서 보기 (결과 한눈에) <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to="/auto/factory" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "8px 14px", fontSize: "var(--t-sm)", border: "1px solid var(--border-strong)", color: "var(--text)" }}>
            문서 공장 <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
