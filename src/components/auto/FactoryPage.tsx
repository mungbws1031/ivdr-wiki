import { useMemo, useState } from "react";
import { Box, LayoutGrid, Rows3 } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "../PageHeader";
import { AutoSteps } from "./AutoSteps";
import { resolveDoc } from "../../data/documents";
import { completion, specHash, unresolvedFields } from "../../data/spec/validate";
import { useSpec } from "../../hooks/useSpecStore";
import { useResults } from "../../hooks/useResultsStore";
import { useClassConfirm } from "../../hooks/useClassConfirm";
import { hasDraft, useStoreVersion } from "../../hooks/useDraftStore";
import { classify } from "../../lib/rules/classify";
import { evaluateDocSet } from "../../lib/rules/applicability";
import { buildTokenContext, docMissingTokens } from "../../lib/tokens";
import { buildFactory, type DocState, type FactoryFloor } from "../../lib/factory";
import { FloorDetail, pct, STATE, Worker } from "./factoryArt";
import { Factory3D } from "./Factory3D";
import { FactoryRoom } from "./FactoryRoom";

const VIEW_KEY = "ivdr-factory-view";
type ViewKind = "room" | "3d" | "2d";
function initialView(): ViewKind {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "room" || v === "3d" || v === "2d") return v;
  } catch {
    // 저장소 차단 — 기본값
  }
  return "room"; // 기본은 한눈에 보는 미니룸
}

function readStatus(): Record<string, "not_started" | "in_progress" | "done"> {
  try {
    return JSON.parse(localStorage.getItem("cert-progress-ivdr") ?? "{}");
  } catch {
    return {};
  }
}

function Floor({ f, open, onToggle }: { f: FactoryFloor; open: boolean; onToggle: () => void }) {
  const desks = f.docs.filter((d) => d.state !== "blocked");
  const queue = f.docs.filter((d) => d.state === "blocked");
  return (
    <div style={{ borderTop: "3px solid var(--border-strong)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full grid items-stretch text-left"
        style={{ gridTemplateColumns: "minmax(78px, 110px) minmax(0,1fr)", background: open ? "var(--surface)" : "var(--bg)" }}
      >
        <span className="flex flex-col justify-center" style={{ padding: "10px 12px", borderRight: "2px solid var(--border)", background: `color-mix(in srgb, ${f.color} 10%, var(--bg))` }}>
          <span className="font-extrabold" style={{ fontSize: "var(--t-lg)", color: f.color, lineHeight: 1 }}>{f.id}</span>
          <span className="font-bold text-text" style={{ fontSize: "var(--t-xs)", marginTop: 4 }}>{f.name}</span>
          <span className="font-bold" style={{ fontSize: "var(--t-xs)", color: f.color, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{pct(f.progress)}</span>
          <span className="rounded-full overflow-hidden" style={{ height: 4, background: "var(--border)", marginTop: 3 }}>
            <span className="block h-full" style={{ width: pct(f.progress), background: f.color }} />
          </span>
        </span>
        <span className="flex flex-wrap items-end min-w-0" style={{ padding: "16px 12px 8px", gap: "14px 6px", minHeight: 76, backgroundImage: "linear-gradient(to top, var(--surface-2) 0, var(--surface-2) 6px, transparent 6px)" }}>
          {desks.map((d) => <Worker key={d.id} d={d} color={f.color} />)}
          {f.docs.length === 0 && f.tasks.length === 0 && <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>할 일 없음</span>}
          {(queue.length > 0 || f.tasks.length > 0) && (
            <span className="ml-auto flex flex-wrap items-end rounded-[var(--r-sm)]" style={{ gap: "10px 4px", padding: "4px 8px", maxWidth: "100%", background: "var(--warning-bg)", border: "1px dashed var(--warning)" }}>
              <span className="font-bold" style={{ fontSize: 11, color: "var(--warning)", alignSelf: "center", marginRight: 2, whiteSpace: "nowrap" }}>
                대기줄 {queue.length + f.tasks.length}
              </span>
              {queue.slice(0, 6).map((d) => <Worker key={d.id} d={d} color={f.color} />)}
              {f.tasks.slice(0, Math.max(0, 6 - queue.length)).map((t) => (
                <span key={t.id} title={`${t.title} — ${t.why}`} className="inline-grid place-items-center rounded-[4px] font-extrabold" style={{ width: 22, height: 28, background: "var(--bg)", border: "1.5px solid var(--warning)", color: "var(--warning)", fontSize: 11 }}>✋</span>
              ))}
              {queue.length + f.tasks.length > 6 && <span className="font-bold" style={{ fontSize: 11, color: "var(--warning)", alignSelf: "center" }}>+{queue.length + f.tasks.length - 6}</span>}
            </span>
          )}
        </span>
      </button>
      {open && <FloorDetail f={f} />}
    </div>
  );
}

/** /auto/factory — 문서 공장 건물: 층(부서)마다 문서가 일하는 모습과 진행률. */
export function FactoryPage() {
  useStoreVersion(); // 초안이 바뀌면 다시 계산
  const spec = useSpec();
  const results = useResults();
  const confirm = useClassConfirm();
  const [open, setOpen] = useState<string | null>(null);
  const [view, setViewState] = useState<ViewKind>(initialView);
  const setView = (v: ViewKind) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // 기억만 못 함
    }
  };
  const { filled } = completion(spec);
  const cls = useMemo(() => classify(spec), [spec]);
  const docSet = useMemo(() => evaluateDocSet(spec, cls), [spec, cls]);
  const ctx = useMemo(() => buildTokenContext(spec, cls, results), [spec, cls, results]);
  const status = readStatus();
  const factory = buildFactory({
    spec, cls, docSet, results,
    classConfirmed: !!confirm && confirm.specHash === specHash(spec) && confirm.value === cls.value,
    status: (id) => status[id] ?? "not_started",
    sections: (id) => {
      const d = resolveDoc(id);
      if (!d) return [0, 0];
      return [d.sections.filter((_, i) => hasDraft(id, i)).length, d.sections.length];
    },
    missingSpec: (id) => {
      const d = resolveDoc(id);
      return d ? docMissingTokens(d, ctx).length : 0;
    },
    specMissingCount: unresolvedFields(spec).length,
  });
  const o = factory.overall;
  const counts = factory.floors.flatMap((f) => f.docs).reduce((m, d) => ({ ...m, [d.state]: (m[d.state] ?? 0) + 1 }), {} as Partial<Record<DocState, number>>);

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader crumb="문서 공장" accentColor="var(--accent)" />
      <main className="mx-auto" style={{ maxWidth: "var(--max-w)", padding: "var(--s-8) var(--margin) var(--s-16)" }}>
        <header className="flex flex-col" style={{ gap: "var(--s-3)", marginBottom: "var(--s-6)" }}>
          <AutoSteps current="/auto/factory" />
          <h1 className="font-extrabold text-text" style={{ fontSize: "var(--t-2xl)", lineHeight: "var(--lh-tight)", marginTop: "var(--s-2)" }}>IVDR 문서 공장</h1>
          <p className="text-text-muted" style={{ fontSize: "var(--t-base)", maxWidth: 760 }}>
            문서 한 장이 직원 한 명입니다. 층은 부서이고, 사람의 결정·입력이 필요한 문서는 대기줄에 서 있습니다. 직원을 누르면 그 문서가 열리고, 층을 누르면 그 층의 할 일이 펼쳐집니다.
          </p>
        </header>

        {filled === 0 ? (
          <div className="rounded-[var(--r-lg)] border text-center" style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-12) var(--s-6)" }}>
            <p className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>아직 공장이 쉬고 있습니다</p>
            <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-2)" }}>제품 스펙을 넣으면 필요한 문서들이 각 층에 출근합니다.</p>
            <Link to="/auto" className="inline-flex items-center gap-1 rounded-[var(--r-md)] font-bold" style={{ marginTop: "var(--s-4)", padding: "10px 18px", background: "var(--accent)", color: "var(--text-on-color)", fontSize: "var(--t-sm)" }}>
              제품 스펙 입력하기 <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <div className="flex justify-end" style={{ marginBottom: "var(--s-3)" }}>
              <div className="inline-flex flex-wrap rounded-[var(--r-md)] border" style={{ borderColor: "var(--border)", padding: 2 }} role="group" aria-label="보기 방식">
                {([["room", "미니룸 (한눈에)", LayoutGrid], ["3d", "3D 건물", Box], ["2d", "2D 단면", Rows3]] as const).map(([k, label, Icon]) => (
                  <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)}
                    className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] font-semibold"
                    style={{ fontSize: "var(--t-sm)", padding: "6px 14px", minHeight: 36, background: view === k ? "var(--text)" : "transparent", color: view === k ? "var(--bg)" : "var(--text)" }}>
                    <Icon size={15} aria-hidden /> {label}
                  </button>
                ))}
              </div>
            </div>
            {view === "room" ? <FactoryRoom floors={factory.floors} overall={o} /> : view === "3d" ? <Factory3D floors={factory.floors} overall={o} /> : (
            <>
            {/* 지붕 + 간판 + 전체 진행률 */}
            <div aria-hidden style={{ height: 22, margin: "0 6%", background: "var(--border-strong)", clipPath: "polygon(4% 100%, 50% 0, 96% 100%)" }} />
            <div className="rounded-t-[var(--r-md)] flex flex-wrap items-center" style={{ gap: "var(--s-4)", padding: "var(--s-4) var(--s-6)", background: "var(--text)", color: "var(--bg)" }} role="status">
              <span className="font-extrabold" style={{ fontSize: "var(--t-lg)", letterSpacing: "var(--ls-snug)" }}>IVDR 문서 공장</span>
              <span className="flex-1 flex items-center" style={{ gap: "var(--s-3)", minWidth: 220 }}>
                <span className="flex-1 rounded-full overflow-hidden" style={{ height: 10, background: "color-mix(in srgb, var(--bg) 25%, transparent)" }}>
                  <span className="block h-full rounded-full" style={{ width: pct(o.progress), background: "var(--success)", transition: "width .4s" }} />
                </span>
                <span className="font-extrabold" style={{ fontSize: "var(--t-xl)", fontVariantNumeric: "tabular-nums" }}>{pct(o.progress)}</span>
              </span>
              <span style={{ fontSize: "var(--t-sm)", fontVariantNumeric: "tabular-nums" }}>완료 {o.done}/{o.total} · 사람 대기 {o.tasks + (counts.blocked ?? 0)}</span>
            </div>

            <div className="border-x-[3px]" style={{ borderColor: "var(--border-strong)" }}>
              {factory.floors.map((f) => <Floor key={f.id} f={f} open={open === f.id} onToggle={() => setOpen((x) => (x === f.id ? null : f.id))} />)}
            </div>
            {/* 땅 */}
            <div aria-hidden style={{ height: 10, background: "var(--border-strong)", borderRadius: "0 0 6px 6px", margin: "0 -8px" }} />
            </>
            )}

            <div className="flex flex-wrap items-center justify-between" style={{ gap: "var(--s-3)", marginTop: "var(--s-4)" }}>
              <div className="flex flex-wrap" style={{ gap: "var(--s-3)", fontSize: "var(--t-xs)" }}>
                {(Object.keys(STATE) as DocState[]).map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <span className="rounded-full" style={{ width: 10, height: 10, background: STATE[k].color }} />
                    <span className="text-text">{STATE[k].label} {counts[k] ?? 0}</span>
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5 text-text">✋ 사람이 할 일 {o.tasks}</span>
              </div>
              <Link to="/auto/overview" className="inline-flex items-center gap-1 font-bold hover:underline" style={{ fontSize: "var(--t-sm)", color: "var(--accent)" }}>
                결과 한눈에 보기 <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
            <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", lineHeight: "var(--lh-base)", marginTop: "var(--s-3)" }}>
              진행률 = 문서마다 (완료면 100%, 아니면 직접 쓴 섹션 비율)의 평균. 문서 화면에서 상태를 "완료"로 바꾸면 완료로 셉니다. 이 제품에 불필요한 문서는 출근하지 않습니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
