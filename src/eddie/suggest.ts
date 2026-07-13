import { formatHHMM } from "./useNow";

export interface SuggestedSlot {
  id: string;
  start: string;
  end: string;
  /** 짧은 부연 설명(선택) — "가장 빠른 빈 시간" 등 */
  note?: string;
}

/**
 * 오늘 빈 시간대에 후보 슬롯을 제안한다(FR-202). 자동 배치가 아니라
 * '제안'만 하고, 실제 배치는 사용자가 수락해야 일어난다(R-07).
 *
 * 간단한 휴리스틱: 지금부터 25분 뒤(5분 단위 반올림) / 그로부터 90분 뒤 /
 * 저녁 7시. 실제 앱에서는 캘린더 빈 시간 탐색으로 대체될 자리.
 */
export function suggestSlots(now: Date, estimateMin: number): SuggestedSlot[] {
  const round5 = (d: Date) => {
    const t = new Date(d);
    t.setSeconds(0, 0);
    const rem = t.getMinutes() % 5;
    if (rem) t.setMinutes(t.getMinutes() + (5 - rem));
    return t;
  };

  const s1 = round5(new Date(now.getTime() + 25 * 60_000));
  const e1 = new Date(s1.getTime() + estimateMin * 60_000);

  const s2 = new Date(s1.getTime() + 90 * 60_000);
  const e2 = new Date(s2.getTime() + estimateMin * 60_000);

  const s3 = new Date(now);
  s3.setHours(19, 0, 0, 0);
  if (s3.getTime() <= now.getTime()) s3.setTime(s3.getTime() + 24 * 60 * 60_000);
  const e3 = new Date(s3.getTime() + estimateMin * 60_000);

  return [
    { id: "slot-soon", start: formatHHMM(s1), end: formatHHMM(e1), note: "가장 빠른 빈 시간" },
    { id: "slot-later", start: formatHHMM(s2), end: formatHHMM(e2) },
    { id: "slot-evening", start: formatHHMM(s3), end: formatHHMM(e3), note: "저녁" },
  ];
}
