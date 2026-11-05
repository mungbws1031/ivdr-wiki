import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import { docOrder, leafById, colorForLeaf } from "../data/docTree";
import { easyFlow, easyFoundation, easyStageOf, type EasyStage } from "../data/easyFlow";

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥"];

/** 문서 칩 — 누르면 작성 페이지로. */
function DocChip({ id }: { id: string }) {
  const leaf = leafById(id);
  if (!leaf) return null;
  const color = `var(${colorForLeaf(id)})`;
  return (
    <Link
      to={`/doc/${id}`}
      className="inline-flex max-w-full items-center gap-2 rounded-[var(--r-lg)] border bg-bg transition-colors hover:bg-surface"
      style={{ borderColor: "var(--border)", padding: "5px 12px" }}
    >
      <span aria-hidden className="inline-block shrink-0 rounded-full" style={{ width: 8, height: 8, background: color }} />
      <span className="min-w-0 font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>
        {leaf.title}
      </span>
      {leaf.detailed && (
        <span
          aria-hidden
          title="전용 템플릿"
          className="inline-block shrink-0 rounded-full"
          style={{ width: 6, height: 6, background: "var(--accent)" }}
        />
      )}
    </Link>
  );
}

function StepNumber({ label, last }: { label: string | number; last: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ width: 40 }}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-text-on-color"
        style={{ background: "var(--accent)", width: 40, height: 40, fontSize: "var(--t-lg)" }}
      >
        {label}
      </span>
      {!last && (
        <span
          aria-hidden
          style={{ flex: 1, width: 2, background: "var(--border-strong)", marginTop: 4, marginBottom: 4, minHeight: 24 }}
        />
      )}
    </div>
  );
}

/**
 * 문서 작성 순서 — 쉬운 6단계 보기와 상세 11단계 보기를 고를 수 있다.
 */
export function DocumentOrder() {
  const [mode, setMode] = useState<"easy" | "detail">("easy");
  return (
    <div>
      <div role="group" aria-label="순서 보기 방식" className="inline-flex rounded-[var(--r-full)] border" style={{ borderColor: "var(--border)", padding: 3, marginBottom: "var(--s-4)" }}>
        {([
          { id: "easy", label: "쉬운 6단계" },
          { id: "detail", label: "상세 11단계" },
        ] as const).map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              onClick={() => setMode(m.id)}
              className="rounded-[var(--r-full)] font-bold"
              style={{
                fontSize: "var(--t-sm)",
                padding: "8px 16px",
                minHeight: 40,
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--text-on-color)" : "var(--text-muted)",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {mode === "easy" ? <EasyOrder onDetail={() => setMode("detail")} /> : <DetailedOrder />}
    </div>
  );
}

/** 쉬운 6단계 — 제품 정의 → 계획 → 시험 → 문서 정리 → 심사·출시 → 사후관리. */
function EasyOrder({ onDetail }: { onDetail: () => void }) {
  return (
    <div>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}>
        처음이라면 여기서 시작하세요. ①부터 아래로 진행하고, 같은 단계 안의 문서는 함께 써도 돼요.
        같은 문서가 처음 쓰는 단계와 최종본을 묶는 단계에 두 번 나올 수 있어요.
      </p>

      {/* QMS 바닥 */}
      <div
        className="rounded-[var(--r-lg)] border bg-surface"
        style={{ borderColor: "var(--border)", padding: "var(--s-4)", marginBottom: "var(--s-6)" }}
      >
        <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-base)" }}>{easyFoundation.title}</h3>
        <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2, marginBottom: "var(--s-3)" }}>
          {easyFoundation.why}
        </p>
        <div className="flex flex-wrap gap-2">
          {easyFoundation.docIds.map((id) => <DocChip key={id} id={id} />)}
        </div>
      </div>

      <div className="flex flex-col">
        {easyFlow.map((s, i) => (
          <EasyStageCard key={s.n} s={s} last={i === easyFlow.length - 1} onDetail={onDetail} />
        ))}
      </div>
    </div>
  );
}

function EasyStageCard({ s, last, onDetail }: { s: EasyStage; last: boolean; onDetail: () => void }) {
  const loop = s.next.kind === "loop";
  return (
    <div className="relative flex gap-4">
      <StepNumber label={s.n} last={last} />
      <div className="min-w-0 flex-1" style={{ paddingBottom: last ? 0 : "var(--s-6)" }}>
        <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>{s.title}</h3>
        <p className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", marginTop: 2 }}>{s.question}</p>
        <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2, marginBottom: "var(--s-3)" }}>{s.why}</p>

        <div className="flex flex-wrap gap-2">
          {s.docIds.map((id) => <DocChip key={id} id={id} />)}
        </div>

        {s.ifApplicable && (
          <div style={{ marginTop: "var(--s-3)" }}>
            <p className="font-bold text-text-subtle" style={{ fontSize: "var(--t-xs)", marginBottom: 6 }}>{s.ifApplicable.label}</p>
            <div className="flex flex-wrap gap-2">
              {s.ifApplicable.docIds.map((id) => <DocChip key={id} id={id} />)}
            </div>
          </div>
        )}

        {s.pairs && (
          <div style={{ marginTop: "var(--s-3)" }}>
            <p className="font-bold text-text-subtle" style={{ fontSize: "var(--t-xs)", marginBottom: 6 }}>계획 → 짝이 되는 결과</p>
            <ul className="flex flex-col gap-1">
              {s.pairs.map((p) => {
                const at = easyStageOf(p.result, s.n + 1);
                return (
                  <li key={p.plan + p.result} className="flex flex-wrap items-center gap-2 text-text" style={{ fontSize: "var(--t-sm)" }}>
                    <span>{leafById(p.plan)?.title}</span>
                    <ArrowRight size={14} aria-label="다음" style={{ color: "var(--text-subtle)" }} />
                    <span className="font-semibold">{leafById(p.result)?.title}</span>
                    {at && <span className="text-text-subtle">({CIRCLED[at - 1]}에서)</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {s.note && (
          <p
            className="rounded-[var(--r-md)]"
            style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-3)", padding: "8px 12px", background: "var(--info-bg)", color: "var(--text)" }}
          >
            {s.note}
          </p>
        )}

        <div
          className="flex items-start gap-2 rounded-[var(--r-md)]"
          style={{
            marginTop: "var(--s-3)",
            padding: "8px 12px",
            fontSize: "var(--t-sm)",
            background: loop ? "var(--warning-bg)" : "transparent",
            color: loop ? "var(--warning)" : "var(--text-muted)",
          }}
        >
          {loop ? <RotateCcw size={16} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} /> : <ArrowDown size={16} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />}
          <span>
            {loop && <strong>{s.next.backTo ? `${CIRCLED[s.next.backTo - 1]}로` : "앞 단계로"} 돌아가기: </strong>}
            {s.next.text}
          </span>
        </div>

        <button
          type="button"
          onClick={onDetail}
          className="text-text-subtle underline"
          style={{ fontSize: "var(--t-xs)", marginTop: 6, minHeight: 32 }}
        >
          상세 단계 {s.detailSteps.join("·")}에서 더 보기
        </button>
      </div>
    </div>
  );
}

/** 상세 11단계 — 의존성을 반영한 단계별 로드맵. */
function DetailedOrder() {
  return (
    <div>
      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-6)" }}>
        의존성을 반영한 권장 작성 순서입니다. 위에서 아래로 진행하며, 같은 단계 안의 문서는
        병행 가능합니다. 칩을 누르면 작성 페이지로 이동합니다.
      </p>
      <div className="flex flex-col" style={{ gap: 0 }}>
        {docOrder.map((s, i) => {
          const last = i === docOrder.length - 1;
          return (
            <div key={s.step} className="relative flex gap-4">
              <StepNumber label={s.step} last={last} />
              <div className="min-w-0 flex-1" style={{ paddingBottom: last ? 0 : "var(--s-6)" }}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
                    {s.title}
                  </h3>
                  <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
                    {s.docIds.length}개
                  </span>
                </div>
                <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 2, marginBottom: "var(--s-3)" }}>
                  {s.why}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.docIds.map((id) => <DocChip key={id} id={id} />)}
                </div>
                {!last && (
                  <div className="flex items-center" style={{ marginTop: "var(--s-3)", color: "var(--text-subtle)" }}>
                    <ArrowDown size={16} aria-hidden />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
