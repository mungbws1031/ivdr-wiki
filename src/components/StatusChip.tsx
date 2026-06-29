import {
  AlertTriangle,
  CircleDot,
  Info,
  ShieldCheck,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type { TagTone } from "../data/stations";

interface ToneStyle {
  bg: string;
  fg: string;
  Icon: LucideIcon;
}

// 색 + 아이콘 + 라벨 3중 신호 (IEC 62366). 색은 의미색이며 페이즈색/accent와 분리.
const TONES: Record<TagTone, ToneStyle> = {
  neutral: { bg: "var(--surface-2)", fg: "var(--text-muted)", Icon: CircleDot },
  info: { bg: "var(--info-bg)", fg: "var(--info)", Icon: Info },
  warning: { bg: "var(--warning-bg)", fg: "var(--warning)", Icon: Clock },
  danger: { bg: "var(--danger-bg)", fg: "var(--danger)", Icon: AlertTriangle },
  success: { bg: "var(--success-bg)", fg: "var(--success)", Icon: ShieldCheck },
};

export function StatusChip({
  label,
  tone,
  size = "sm",
}: {
  label: string;
  tone: TagTone;
  size?: "sm" | "md";
}) {
  const { bg, fg, Icon } = TONES[tone];
  const px = size === "md" ? 14 : 12;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap"
      style={{
        background: bg,
        color: fg,
        fontSize: size === "md" ? "var(--t-sm)" : "var(--t-xs)",
        padding: size === "md" ? "4px 12px" : "3px 10px",
      }}
    >
      <Icon size={px} strokeWidth={2.25} aria-hidden />
      {label}
    </span>
  );
}
