import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Lightbulb } from "lucide-react";
import { fieldByPath } from "../../data/spec/fields";
import { getAt, setAt } from "../../data/spec/validate";
import { getSpec, replaceSpec, setSpecField, useSpec } from "../../hooks/useSpecStore";
import { confirmEstimated, getConcept, saveConcept } from "../../hooks/useConceptStore";
import { applyConcept, openQuestions, parseConcept, presetHits, reapplyConcept, type ConceptConflict } from "../../lib/concept";

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
  const [conflicts, setConflicts] = useState<ConceptConflict[]>([]);
  const questions = openQuestions(spec);
  const unapplied = text.trim() !== "" && text.trim() !== concept.text.trim();

  const run = () => {
    const hits = parseConcept(text);
    const prevEst = getConcept().estimated;
    const r = reapplyConcept(getSpec(), hits, prevEst);
    if (r.applied.length || r.cleared.length) replaceSpec(r.spec);
    const est = [...prevEst.filter((p) => !r.cleared.includes(p)), ...r.applied.map((a) => a.path)];
    saveConcept(text, est);
    setConflicts(r.conflicts);
    const parts = [
      r.applied.length && `${r.applied.length}개 칸을 새 컨셉으로 채웠습니다`,
      r.cleared.length && `이전 컨셉 값 ${r.cleared.length}개를 비웠습니다`,
      r.conflicts.length && `직접 넣은 값 ${r.conflicts.length}개는 그대로 두었습니다 — 아래에서 바꿀 수 있습니다`,
    ].filter(Boolean);
    setNote(parts.length ? parts.join(" · ") + "." : hits.length ? "새 문장의 값이 지금 값과 같아 바뀐 것이 없습니다." : "문장에서 알아볼 수 있는 단어가 없었습니다. 검체·사용자·형태·검사 대상을 넣어 보세요.");
  };

  /** 충돌 칸을 새 컨셉 값으로 — 바꾼 칸은 추정으로 표시 */
  const takeNew = (list: ConceptConflict[]) => {
    let next = getSpec();
    for (const c of list) next = setAt(next, c.path, c.next);
    replaceSpec(next);
    saveConcept(getConcept().text, [...getConcept().estimated, ...list.map((c) => c.path)]);
    setConflicts((cur) => cur.filter((c) => !list.includes(c)));
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
      <div className="flex flex-wrap items-center" style={{ gap: 8, marginTop: 8, fontSize: "var(--t-xs)" }}>
        <span className="text-text-subtle">예시:</span>
        {EXAMPLES.map((ex) => <button key={ex} type="button" onClick={() => setText(ex)} className="rounded-full hover:bg-surface text-text-muted" style={{ padding: "6px 14px", minHeight: 40, border: "1px solid var(--border)" }}>{ex}</button>)}
      </div>
      {unapplied && <p className="font-semibold" style={{ fontSize: "var(--t-xs)", color: "var(--warning)", marginTop: 8 }}>문장을 바꿨습니다 — "컨셉으로 채우기"를 눌러야 반영됩니다.</p>}
      {note && <p role="status" className="font-semibold" style={{ fontSize: "var(--t-sm)", color: "var(--accent)", marginTop: 10 }}>{note}</p>}
      {conflicts.length > 0 && (
        <div className="rounded-[var(--r-md)]" style={{ marginTop: 10, padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--warning)" }} aria-label="직접 넣은 값과 다른 칸">
          <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
            <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>직접 넣은 값이라 바꾸지 않은 칸 {conflicts.length}개</span>
            <button type="button" onClick={() => takeNew(conflicts)} className="ml-auto rounded-[var(--r-md)] font-bold" style={{ minHeight: 40, padding: "4px 14px", fontSize: "var(--t-xs)", background: "var(--accent)", color: "var(--text-on-color)" }}>모두 새 컨셉으로</button>
          </div>
          <ul className="flex flex-col" style={{ gap: 4, marginTop: 6 }}>
            {conflicts.map((c) => (
              <li key={c.path} className="flex flex-wrap items-center" style={{ gap: 8, fontSize: "var(--t-xs)" }}>
                <b className="text-text">{fieldByPath(c.path)?.label ?? c.path}</b>
                <span className="text-text-muted">{showValue(c.path, c.current)} → <b className="text-text">{showValue(c.path, c.next)}</b></span>
                <button type="button" onClick={() => takeNew([c])} className="ml-auto rounded-[var(--r-md)] font-semibold" style={{ minHeight: 40, padding: "4px 12px", border: "1px solid var(--border-strong)", color: "var(--text)" }}>새 값으로</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {concept.estimated.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
            <span className="font-bold text-text" style={{ fontSize: "var(--t-sm)" }}>추정한 값 {concept.estimated.length}개</span>
            <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>문서에 "(추정)"이 붙습니다. 맞으면 확인을, 틀리면 아래 입력칸에서 고치세요.</span>
            <button type="button" onClick={() => confirmEstimated()} className="ml-auto inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "4px 14px", minHeight: 40, fontSize: "var(--t-xs)", border: "1.5px solid var(--success)", color: "var(--success)" }}>
              <Check size={13} aria-hidden /> 모두 맞아요
            </button>
          </div>
          <ul className="flex flex-wrap" style={{ gap: 8, marginTop: 6 }}>
            {concept.estimated.map((p) => (
              <li key={p} className="inline-flex items-center rounded-full" style={{ gap: 6, padding: "0 0 0 12px", minHeight: 40, fontSize: "var(--t-xs)", background: "color-mix(in srgb, #C9A227 14%, var(--bg))", border: "1px solid #C9A227" }}>
                <a href={`#field-${p}`} className="inline-flex items-center text-text" style={{ minHeight: 40 }}><b>{fieldByPath(p)?.label ?? p}</b>: {showValue(p, getAt(spec, p))}</a>
                <button type="button" onClick={() => confirmEstimated([p])} aria-label={`${fieldByPath(p)?.label ?? p} 확인`} className="inline-grid place-items-center rounded-full" style={{ width: 40, height: 40, color: "var(--success)" }}>
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
                <li key={p} className="flex flex-wrap items-center" style={{ gap: 8 }}>
                  <span className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", minWidth: 160 }}>{f.label}</span>
                  {f.options.filter((o) => !o.disabled).map((o) => {
                    const on = Array.isArray(cur) ? cur.includes(o.value) : String(cur) === o.value;
                    return (
                      <button key={o.value} type="button" onClick={() => answer(p, o.value)} aria-pressed={on} className="rounded-full font-semibold" style={{ padding: "6px 14px", minHeight: 40, fontSize: "var(--t-xs)", border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-weak)" : "var(--bg)", color: "var(--text)" }}>
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
          <Link to="/auto/overview" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "8px 14px", minHeight: 44, fontSize: "var(--t-sm)", background: "var(--text)", color: "var(--bg)" }}>
            이대로 문서 보기 (결과 한눈에) <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to="/auto/factory" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ padding: "8px 14px", minHeight: 44, fontSize: "var(--t-sm)", border: "1px solid var(--border-strong)", color: "var(--text)" }}>
            문서 공장 <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
