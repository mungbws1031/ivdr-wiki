import {
  Clock,
  FolderInput,
  Brain,
  PenLine,
  CheckCircle2,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import type { DocEffort } from "../data/docTree";

/** 예상 소요 기간 — 단계별 분해(자료확보·맥락이해·작성·검토) + RA 피드백 횟수. */
export function EffortTimeline({ effort }: { effort: DocEffort }) {
  const phases: { label: string; value: string; Icon: LucideIcon }[] = [
    { label: "자료 확보", value: effort.gather, Icon: FolderInput },
    { label: "맥락 이해", value: effort.context, Icon: Brain },
    { label: "작성", value: effort.draft, Icon: PenLine },
    { label: "검토", value: effort.review, Icon: CheckCircle2 },
  ];

  return (
    <section
      aria-labelledby="effort-heading"
      className="rounded-[var(--r-lg)] border"
      style={{ borderColor: "var(--border)", background: "var(--surface)", padding: "var(--s-5)" }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid shrink-0 place-items-center rounded-full" style={{ width: 36, height: 36, background: "var(--p4)" }}>
          <Clock size={19} style={{ color: "#fff" }} aria-hidden />
        </span>
        <h2 id="effort-heading" className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
          예상 소요 기간
        </h2>
        <span
          className="rounded-full font-extrabold text-text-on-color"
          style={{ background: "var(--p4)", fontSize: "var(--t-sm)", padding: "3px 14px" }}
        >
          {effort.total}
        </span>
        <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
          난이도 기반 추정 · 조직·인력에 따라 가변
        </span>
      </div>

      {/* 단계 분해 */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", marginTop: "var(--s-4)" }}
      >
        {phases.map((p, i) => (
          <div
            key={p.label}
            className="rounded-[var(--r-md)] bg-bg"
            style={{ border: "1px solid var(--border)", padding: "10px 12px" }}
          >
            <div className="flex items-center gap-1.5 text-text-muted">
              <span className="font-bold" style={{ color: "var(--p4)", fontSize: 10 }}>{i + 1}</span>
              <p.Icon size={14} style={{ color: "var(--p4)" }} aria-hidden />
              <span className="font-semibold" style={{ fontSize: "var(--t-xs)" }}>{p.label}</span>
            </div>
            <div className="font-extrabold text-text" style={{ fontSize: "var(--t-base)", marginTop: 4 }}>
              {p.value}
            </div>
          </div>
        ))}
      </div>

      {/* RA 피드백 */}
      <div className="flex items-center gap-2" style={{ marginTop: "var(--s-3)" }}>
        <span
          className="inline-flex items-center gap-1.5 rounded-full font-bold"
          style={{ background: "var(--p4-tint)", color: "var(--p4)", fontSize: "var(--t-sm)", padding: "5px 13px" }}
        >
          <MessagesSquare size={15} aria-hidden />
          RA 피드백 {effort.raRounds}회 반영
        </span>
        <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>
          검토·수정 반복 포함
        </span>
      </div>
    </section>
  );
}
