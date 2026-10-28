// =====================================================================
// src/lib/factory.ts
// "문서 공장" 건물 — 층(부서)별 문서·실험·사람 할 일과 진행률.
// 저장소를 직접 읽지 않고 필요한 값을 인자로 받는다 (순수 함수, 테스트 가능).
// =====================================================================

import { docTree } from "../data/docTree";
import type { ProductSpec } from "../data/spec/types";
import type { Applicability } from "./rules/applicability";
import type { ClassResult } from "./rules/classify";
import { planHumanTasks, planStudies } from "./planner";
import { hasResult, type ResultsMap } from "./results";

export type FloorId = "7F" | "6F" | "5F" | "4F" | "3F" | "2F" | "1F";

export const FLOORS: { id: FloorId; name: string; color: string; desc: string; groups: string[] }[] = [
  { id: "7F", name: "결재실", color: "var(--accent)", desc: "사람만 할 수 있는 결정이 모이는 곳", groups: [] },
  { id: "6F", name: "RA 규제", color: "var(--p4)", desc: "범위·분류·적합성 평가·등록", groups: ["scope", "conformity", "registration"] },
  { id: "5F", name: "개발·설계", color: "var(--p2)", desc: "기술문서·설계·위험관리", groups: ["annex-ii", "design", "risk"] },
  { id: "4F", name: "성능평가 실험실", color: "var(--p3)", desc: "성능 문서와 실험", groups: ["performance"] },
  { id: "3F", name: "생산", color: "var(--info)", desc: "공정·포장·운송·제조 기록", groups: ["production"] },
  { id: "2F", name: "품질(QA)", color: "var(--p5)", desc: "QMS 절차·시판 후 감시", groups: ["qms", "post-market"] },
  { id: "1F", name: "접수", color: "var(--p1)", desc: "제품 스펙 접수·외부 업무", groups: [] },
];

export type DocState = "done" | "writing" | "blocked" | "todo";

export interface FactoryDoc {
  id: string;
  title: string;
  state: DocState;
  /** 0~1 — 완료면 1, 아니면 채운 섹션 비율 */
  progress: number;
  why?: string;
}

export interface FactoryTask {
  id: string;
  title: string;
  why: string;
  to: string;
}

export interface FactoryFloor {
  id: FloorId;
  name: string;
  color: string;
  desc: string;
  docs: FactoryDoc[];
  tasks: FactoryTask[];
  /** 0~1, 문서가 없는 층은 할 일 기준 */
  progress: number;
  counts: Record<DocState, number>;
}

export interface FactoryInput {
  spec: ProductSpec;
  cls: ClassResult;
  classConfirmed: boolean;
  docSet: Applicability[];
  results: ResultsMap;
  /** 문서 id → 수동 상태 (cert-progress-ivdr) */
  status: (id: string) => "not_started" | "in_progress" | "done";
  /** 문서 id → [채운 섹션 수, 전체 섹션 수] */
  sections: (id: string) => [number, number];
  /** 문서 id → 비어 있는 스펙 토큰 수 */
  missingSpec: (id: string) => number;
  specMissingCount: number;
}

/** 결과가 있어야 마무리되는 문서 → 그 결과를 내는 실험 id */
const RESULT_DOCS: Record<string, string[]> = {
  "analytical-performance": ["cutoff-precision", "cross-reactivity", "interference"],
  "clinical-performance": ["clinical-performance"],
  "stability-study": ["stability-realtime"],
  "transport-validation": ["stability-transport"],
  "usability-file": ["usability-summative"],
};

export function buildFactory(inp: FactoryInput): { floors: FactoryFloor[]; overall: { progress: number; done: number; total: number; tasks: number } } {
  const appl = new Map(inp.docSet.map((a) => [a.leafId, a.status]));
  const plans = planStudies(inp.spec).filter((p) => p.status === "required" || p.status === "recommended");
  const pending = new Set(plans.filter((p) => !hasResult(inp.results[p.id])).map((p) => p.id));

  const docState = (id: string, title: string): FactoryDoc => {
    const [filled, total] = inp.sections(id);
    if (inp.status(id) === "done") return { id, title, state: "done", progress: 1 };
    const ratio = total ? filled / total : 0;
    const waitingStudies = (RESULT_DOCS[id] ?? []).filter((s) => pending.has(s));
    const missing = inp.missingSpec(id);
    if (waitingStudies.length || missing) {
      const why = [missing ? `스펙 미입력 ${missing}개` : "", waitingStudies.length ? `실험 결과 대기 ${waitingStudies.length}건` : ""].filter(Boolean).join(" · ");
      return { id, title, state: "blocked", progress: ratio, why };
    }
    if (filled > 0 || inp.status(id) === "in_progress") return { id, title, state: "writing", progress: ratio };
    return { id, title, state: "todo", progress: 0 };
  };

  const floors: FactoryFloor[] = FLOORS.map((f) => {
    const docs = docTree
      .filter((g) => f.groups.includes(g.id))
      .flatMap((g) => g.items)
      .filter((l) => appl.get(l.id) && appl.get(l.id) !== "excluded")
      .map((l) => docState(l.id, l.title));
    const tasks: FactoryTask[] = [];
    if (f.id === "7F") {
      if (inp.cls.value && !inp.classConfirmed) tasks.push({ id: "confirm-class", title: `Class ${inp.cls.value} 확정`, why: "분류 근거서·적합성 경로·NB 신청이 이 결정을 기다립니다", to: "/auto/docs" });
      const unknown = inp.docSet.filter((a) => a.status === "unknown").length;
      if (unknown) tasks.push({ id: "doc-unknown", title: `해당 여부 판단 ${unknown}건`, why: "스펙만으로 정할 수 없는 문서", to: "/auto/docs" });
    }
    if (f.id === "4F") {
      for (const p of plans.filter((x) => pending.has(x.id) && x.category !== "usability")) tasks.push({ id: `res-${p.id}`, title: `${p.title} 결과 입력`, why: "실험을 마치면 결과를 넣어 주세요", to: "/auto/results" });
      for (const p of plans.filter((x) => inp.results[x.id]?.verdict === "fail")) tasks.push({ id: `fail-${p.id}`, title: `${p.title} 불합격 — 원인 조사`, why: "설계 변경 또는 재시험", to: "/auto/results" });
    }
    if (f.id === "5F") for (const p of plans.filter((x) => x.category === "usability" && pending.has(x.id))) tasks.push({ id: `res-${p.id}`, title: `${p.title} 결과 입력`, why: "사용적합성 파일이 기다립니다", to: "/auto/results" });
    if (f.id === "1F") {
      if (inp.specMissingCount) tasks.push({ id: "spec", title: `제품 스펙 ${inp.specMissingCount}개 입력`, why: "비어 있으면 문서에 [미입력]으로 남습니다", to: "/auto" });
      for (const t of planHumanTasks(plans)) tasks.push({ id: `ext-${t.task}`, title: t.task, why: t.studies.join(", "), to: "/auto/plan" });
    }
    const counts: Record<DocState, number> = { done: 0, writing: 0, blocked: 0, todo: 0 };
    docs.forEach((d) => counts[d.state]++);
    const progress = docs.length ? docs.reduce((s, d) => s + d.progress, 0) / docs.length : tasks.length ? 0 : 1;
    return { ...f, docs, tasks, progress, counts };
  });

  const allDocs = floors.flatMap((f) => f.docs);
  return {
    floors,
    overall: {
      progress: allDocs.length ? allDocs.reduce((s, d) => s + d.progress, 0) / allDocs.length : 0,
      done: allDocs.filter((d) => d.state === "done").length,
      total: allDocs.length,
      tasks: floors.reduce((s, f) => s + f.tasks.length, 0),
    },
  };
}
