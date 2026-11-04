import { useState } from "react";
import { HardDrive } from "lucide-react";
import { exportAll } from "../lib/backup";

/** "이 브라우저에만 저장" 안내 + 전체 백업 버튼 (U-10). */
export function StorageNote() {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center rounded-[var(--r-md)]" role="note" aria-label="저장 위치 안내"
      style={{ gap: "6px 12px", padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "var(--t-xs)" }}>
      <HardDrive size={15} className="text-text-muted" aria-hidden />
      <span className="text-text-muted" style={{ flex: "1 1 220px", lineHeight: "var(--lh-base)" }}>
        입력한 내용은 <b className="text-text">이 브라우저에만</b> 저장돼요. 다른 기기·브라우저에서는 보이지 않고, 브라우저 데이터를 지우면 사라져요.
      </span>
      <button type="button" onClick={() => { const n = exportAll(); setMsg(`백업 파일을 내려받았어요 (${n}개 항목)`); }}
        className="rounded-[var(--r-md)] font-bold" style={{ minHeight: 40, padding: "6px 14px", border: "1px solid var(--border-strong)", color: "var(--text)", background: "var(--bg)" }}>
        전체 백업
      </button>
      {msg && <span role="status" className="basis-full" style={{ color: "var(--success)" }}>{msg}</span>}
    </div>
  );
}
