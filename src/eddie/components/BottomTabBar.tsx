import type { ComponentType } from "react";
import { CalendarDays, Home, Sparkles, LayoutGrid } from "lucide-react";

type IconProps = { size?: number; strokeWidth?: number };
interface Tab {
  id: string;
  label: string;
  Icon: ComponentType<IconProps>;
}

/** 하단 4탭 — 오늘/캘린더/에디/더보기 (IA §1.1). 5탭 이상 금지. */
const TABS: Tab[] = [
  { id: "today", label: "오늘", Icon: Home },
  { id: "calendar", label: "캘린더", Icon: CalendarDays },
  { id: "eddie", label: "에디", Icon: Sparkles },
  { id: "more", label: "더보기", Icon: LayoutGrid },
];

export function BottomTabBar({ active = "today" }: { active?: string }) {
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-20 border-t border-[var(--e-border)] bg-[var(--e-surface)]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      aria-label="주요 탭"
    >
      <ul className="flex items-stretch">
        {TABS.map(({ id, label, Icon }) => {
          const on = id === active;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                aria-current={on ? "page" : undefined}
                className="flex min-h-[var(--e-touch)] w-full flex-col items-center justify-center gap-0.5 py-2"
                style={{ color: on ? "var(--e-primary-deep)" : "var(--e-text-subtle)" }}
              >
                <Icon size={22} strokeWidth={on ? 2.6 : 2} />
                <span className="text-[11px] font-bold">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
