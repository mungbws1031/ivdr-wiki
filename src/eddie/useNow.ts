import { useEffect, useState } from "react";

/**
 * 현재 시각을 주기적으로 갱신해 반환. (에디 시계·출발 카운트다운의 '살아있는' 표시용)
 * @param intervalMs 갱신 주기(ms). 카운트다운은 1000, 시계는 15000 정도가 적당.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** 두 자리 0 패딩. */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Date → "H:MM" (24시간, 시는 패딩 없음 — 시계 큰 표시용). */
export function formatClock(d: Date): { hh: string; mm: string } {
  return { hh: String(d.getHours()), mm: pad2(d.getMinutes()) };
}

/** Date → "HH:MM" (라벨용). */
export function formatHHMM(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
