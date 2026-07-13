import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * 공용 바텀시트 — 회복 화면·할 일→블록 제안 등 모달 코어에 쓰는 껍데기.
 * (브리프: "회복 화면·저녁 회고·빠른 캡처 = 모달 / 나머지 코어는 풀스크린")
 *
 * 디바이스 프레임(390×844) 안에서만 오버레이되도록 absolute로 배치한다.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-end" role="dialog" aria-modal="true">
      {/* 딤 배경 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />

      {/* 시트 본체 */}
      <div className="eddie-sheet-rise relative w-full rounded-t-[28px] bg-[var(--e-surface)] pb-[env(safe-area-inset-bottom)] shadow-[var(--e-shadow-pop)]">
        {/* 그랩 핸들 */}
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-10 rounded-full bg-[var(--e-border-strong)]" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pt-3">
            <h2 className="text-[18px] font-extrabold text-[var(--e-text)]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--e-text-subtle)] active:bg-[var(--e-surface-2)]"
            >
              <X size={20} strokeWidth={2.4} />
            </button>
          </div>
        )}

        <div className="px-5 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
