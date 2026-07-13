import type { ComponentType } from "react";
import {
  Check,
  ChevronRight,
  CornerDownRight,
  Play,
  Circle,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import type { BlockStatus, TimelineBlock } from "../data";

interface StatusMeta {
  label: string;
  color: string; // 텍스트/아이콘/노드
  bg: string; // 배경 틴트
  Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

/** 색 + 아이콘 + 라벨을 항상 함께(색맹 배려, WCAG). 놓침·이월·패스는 회색 계열. */
const STATUS: Record<BlockStatus, StatusMeta> = {
  done: { label: "완료", color: "var(--e-done)", bg: "var(--e-done-bg)", Icon: Check },
  active: { label: "지금", color: "var(--e-active)", bg: "var(--e-active-bg)", Icon: Play },
  planned: { label: "예정", color: "var(--e-planned)", bg: "var(--e-planned-bg)", Icon: Circle },
  missed: { label: "놓침", color: "var(--e-missed)", bg: "var(--e-missed-bg)", Icon: RotateCcw },
  deferred: {
    label: "이월",
    color: "var(--e-deferred)",
    bg: "var(--e-deferred-bg)",
    Icon: CornerDownRight,
  },
  skipped: { label: "패스", color: "var(--e-deferred)", bg: "var(--e-deferred-bg)", Icon: X },
};

export function TodayTimeline({
  blocks,
  onRecover,
}: {
  blocks: TimelineBlock[];
  onRecover?: (block: TimelineBlock) => void;
}) {
  return (
    <section className="px-4" aria-label="오늘 타임라인">
      <SectionTitle title="오늘 하루" hint="흐름만 가볍게 훑어봐" />

      <ol className="relative mt-3">
        {blocks.map((b, i) => (
          <TimelineRow key={b.id} block={b} last={i === blocks.length - 1} onRecover={onRecover} />
        ))}
      </ol>
    </section>
  );
}

function TimelineRow({
  block,
  last,
  onRecover,
}: {
  block: TimelineBlock;
  last: boolean;
  onRecover?: (block: TimelineBlock) => void;
}) {
  const meta = STATUS[block.status];
  const active = block.status === "active";
  const dimmed =
    block.status === "missed" || block.status === "deferred" || block.status === "skipped";

  return (
    <li className="relative flex gap-3">
      {/* 좌측: 시각 라벨 */}
      <div className="w-11 shrink-0 pt-3 text-right">
        <span
          className="eddie-num text-[12px] font-bold"
          style={{ color: dimmed ? "var(--e-text-subtle)" : "var(--e-text-muted)" }}
        >
          {block.time}
        </span>
      </div>

      {/* 가운데: 노드 + 연결선 */}
      <div className="relative flex w-5 shrink-0 flex-col items-center">
        <span className="relative mt-3.5 flex h-4 w-4 items-center justify-center">
          {active && (
            <span
              className="eddie-now-dot absolute inset-0 rounded-full"
              style={{ background: meta.color, opacity: 0.35 }}
            />
          )}
          <span
            className="relative h-3 w-3 rounded-full border-2"
            style={{
              background: block.status === "planned" ? "var(--e-surface)" : meta.color,
              borderColor: meta.color,
            }}
          />
        </span>
        {!last && <span className="w-0.5 flex-1 bg-[var(--e-border)]" />}
      </div>

      {/* 우측: 블록 카드 */}
      <div className={`min-w-0 flex-1 ${last ? "pb-1" : "pb-3"}`}>
        <div
          className="rounded-[var(--e-r-md)] border px-3 py-2.5"
          style={{
            background: active ? meta.bg : "var(--e-surface)",
            borderColor: active ? meta.color : "var(--e-border)",
            opacity: dimmed ? 0.92 : 1,
          }}
        >
          <div className="flex items-center gap-2">
            <StatusPill meta={meta} />
            {block.status === "done" && block.recovered && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ background: "var(--e-primary-weak)", color: "var(--e-primary-deep)" }}
              >
                <Sparkles size={11} strokeWidth={2.6} aria-hidden />
                회복
              </span>
            )}
            {block.tag && (
              <span className="text-[11px] font-semibold text-[var(--e-text-subtle)]">
                {block.tag}
              </span>
            )}
            {block.span && (
              <span className="ml-auto text-[11px] font-semibold text-[var(--e-text-subtle)]">
                {block.span}
              </span>
            )}
          </div>
          <p
            className="mt-1 text-[15px] font-bold"
            style={{
              color: dimmed ? "var(--e-text-muted)" : "var(--e-text)",
              textDecoration: block.status === "done" ? "line-through" : "none",
              textDecorationColor: "var(--e-border-strong)",
            }}
          >
            {block.title}
          </p>

          {/* 놓침 → 자책 없는 회복 경로(Flow 4). 비난 문구 절대 없음. */}
          {block.status === "missed" && (
            <button
              type="button"
              onClick={() => onRecover?.(block)}
              className="mt-1.5 inline-flex min-h-[36px] items-center gap-1 rounded-[var(--e-r-sm)] bg-[var(--e-missed-bg)] px-2.5 text-[12px] font-bold text-[var(--e-text-muted)] active:opacity-80"
            >
              괜찮아 — 지금 할래? 옮길래?
              <ChevronRight size={14} strokeWidth={2.4} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function StatusPill({ meta }: { meta: StatusMeta }) {
  const { Icon } = meta;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{ background: meta.bg, color: meta.color }}
    >
      <Icon size={11} strokeWidth={2.8} aria-hidden />
      {meta.label}
    </span>
  );
}

export function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[17px] font-extrabold text-[var(--e-text)]">{title}</h2>
      {hint && <span className="text-[12px] text-[var(--e-text-subtle)]">{hint}</span>}
    </div>
  );
}
