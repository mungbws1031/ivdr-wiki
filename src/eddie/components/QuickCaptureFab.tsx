import { Plus } from "lucide-react";

/**
 * 빠른 캡처 FAB — 모든 화면 우하단 상시 노출(IA §1.1, FR-201).
 * 탭이 아니라 플로팅 버튼으로 어디서든 1탭 캡처를 연다.
 */
export function QuickCaptureFab({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="빠른 캡처 — 할 일 추가"
      className="absolute bottom-[76px] right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[var(--e-primary)] text-[var(--e-on-primary)] shadow-[var(--e-shadow-fab)] transition-transform active:scale-95"
    >
      <Plus size={26} strokeWidth={2.8} />
    </button>
  );
}
