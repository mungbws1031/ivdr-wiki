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
import { buildFactory, type DocState } from "../../lib/factory";
import { STATE } from "./factoryArt";
import { Factory3D } from "./Factory3D";
import { FactoryRoom } from "./FactoryRoom";
import { FactoryTower } from "./FactoryTower";
import { GoalChecklist } from "./GoalChecklist";
import { buildGoals } from "../../lib/goals";
import { resultsProgress } from "../../lib/results";

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

/** /auto/factory — 문서 공장 건물: 층(부서)마다 문서가 일하는 모습과 진행률. */
export function FactoryPage() {
  useStoreVersion(); // 초안이 바뀌면 다시 계산
  const spec = useSpec();
  const results = useResults();
  const confirm = useClassConfirm();
  const [view, setViewState] = useState<ViewKind>(initialView);
  const setView = (v: ViewKind) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // 기억만 못 함
    }
  };
  const specFilled = completion(spec);
  const { filled } = specFilled;
  const cls = useMemo(() => classify(spec), [spec]);
  const docSet = useMemo(() => evaluateDocSet(spec, cls), [spec, cls]);
  const ctx = useMemo(() => buildTokenContext(spec, cls, results), [spec, cls, results]);
  const status = readStatus();
  const classConfirmed = !!confirm && confirm.specHash === specHash(spec) && confirm.value === cls.value;
  const factory = buildFactory({
    spec, cls, docSet, results,
    classConfirmed,
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
  const goals = buildGoals({ spec, specFilled, classConfirmed, results: resultsProgress(spec, results), tasksLeft: o.tasks, docs: { done: o.done, total: o.total } });
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
            <div style={{ marginBottom: "var(--s-4)" }}><GoalChecklist goals={goals} /></div>
            <div className="flex justify-end" style={{ marginBottom: "var(--s-3)" }}>
              <div className="inline-flex flex-wrap rounded-[var(--r-md)] border" style={{ borderColor: "var(--border)", padding: 2 }} role="group" aria-label="보기 방식">
                {([["room", "미니룸 (한눈에)", LayoutGrid], ["3d", "3D 건물", Box], ["2d", "건물 단면", Rows3]] as const).map(([k, label, Icon]) => (
                  <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)}
                    className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] font-semibold"
                    style={{ fontSize: "var(--t-sm)", padding: "6px 14px", minHeight: 36, background: view === k ? "var(--text)" : "transparent", color: view === k ? "var(--bg)" : "var(--text)" }}>
                    <Icon size={15} aria-hidden /> {label}
                  </button>
                ))}
              </div>
            </div>
            {view === "room" ? <FactoryRoom floors={factory.floors} overall={o} /> : view === "3d" ? <Factory3D floors={factory.floors} overall={o} /> : <FactoryTower floors={factory.floors} overall={o} />}

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
