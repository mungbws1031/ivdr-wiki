import { useState } from "react";
import { Check, Pill, Info } from "lucide-react";
import { SectionTitle } from "./TodayTimeline";
import type { Medication, MedStatus } from "../data";

/**
 * 복약 카드 (FR-302·303). 원탭 복용 확인.
 *  - 놓침도 자책 없이 "괜찮아, 지금 먹자"로 회복 경로 제시(R-02).
 *  - 비의료기기: '리마인더 · 진단·치료 아님' 면책을 카드에 병기.
 *  - 놓침은 빨강이 아니라 회색+아이콘(질책 인상 회피).
 */
export function MedicationCard({ meds }: { meds: Medication[] }) {
  const [status, setStatus] = useState<Record<string, MedStatus>>(
    () => Object.fromEntries(meds.map((m) => [m.id, m.status])),
  );

  const take = (id: string) => setStatus((s) => ({ ...s, [id]: "done" }));

  return (
    <section className="px-4">
      <SectionTitle title="복약" hint="원탭으로 확인만" />

      <div className="mt-3 overflow-hidden rounded-[var(--e-r-lg)] border border-[var(--e-border)] bg-[var(--e-surface)] shadow-[var(--e-shadow-card)]">
        <ul className="divide-y divide-[var(--e-border)]">
          {meds.map((m) => (
            <MedRow key={m.id} med={m} status={status[m.id]} onTake={() => take(m.id)} />
          ))}
        </ul>

        {/* 면책 문구 — 규제(비의료기기) */}
        <p className="flex items-start gap-1.5 bg-[var(--e-surface-2)] px-3.5 py-2.5 text-[11px] leading-relaxed text-[var(--e-text-subtle)]">
          <Info size={13} strokeWidth={2.2} className="mt-px shrink-0" aria-hidden />
          복약 리마인더예요. 진단·치료 기능은 없어요. 복약 결정은 전문가와 상의하세요.
        </p>
      </div>
    </section>
  );
}

function MedRow({
  med,
  status,
  onTake,
}: {
  med: Medication;
  status: MedStatus;
  onTake: () => void;
}) {
  const done = status === "done";
  const missed = status === "missed";

  return (
    <li className="flex items-center gap-3 px-3.5 py-3">
      {/* 알약 아이콘 배지 */}
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={{
          background: done
            ? "var(--e-done-bg)"
            : missed
              ? "var(--e-missed-bg)"
              : "var(--e-primary-weak)",
          color: done
            ? "var(--e-done)"
            : missed
              ? "var(--e-missed)"
              : "var(--e-primary-deep)",
        }}
      >
        <Pill size={17} strokeWidth={2.4} aria-hidden />
      </span>

      {/* 이름 · 용량 · 시각 */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[15px] font-bold"
          style={{
            color: done ? "var(--e-text-muted)" : "var(--e-text)",
            textDecoration: done ? "line-through" : "none",
            textDecorationColor: "var(--e-border-strong)",
          }}
        >
          {med.name} <span className="text-[13px] font-semibold text-[var(--e-text-subtle)]">{med.dose}</span>
        </p>
        <p className="mt-0.5 text-[12px] font-semibold text-[var(--e-text-subtle)]">
          {missed ? "지금 먹어도 괜찮아" : med.time}
        </p>
      </div>

      {/* 상태별 액션 */}
      {done ? (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold"
          style={{ background: "var(--e-done-bg)", color: "var(--e-done)" }}
        >
          <Check size={13} strokeWidth={3} aria-hidden />
          먹었어요
        </span>
      ) : (
        <button
          type="button"
          onClick={onTake}
          className="inline-flex min-h-[var(--e-touch)] shrink-0 items-center gap-1.5 rounded-[var(--e-r-md)] px-3.5 text-[13px] font-bold active:translate-y-px"
          style={
            missed
              ? { background: "var(--e-missed-bg)", color: "var(--e-text)" }
              : { background: "var(--e-primary)", color: "var(--e-on-primary)" }
          }
        >
          {missed ? "지금 먹자" : "먹었어요"}
        </button>
      )}
    </li>
  );
}
