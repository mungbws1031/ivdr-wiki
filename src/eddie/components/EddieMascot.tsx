import type { EddieMood } from "../data";

/**
 * 에디 — 감정 표현이 풍부하되 과장 없는 마스코트.
 * 상태(기쁨/담담/응원/굿나잇) 최소 4종. 순수 SVG라 폰트·에셋 의존 없음.
 * 색은 스코프 토큰(--e-primary 등)을 상속받아 브랜드와 일관.
 */
export function EddieMascot({
  mood = "calm",
  size = 88,
  className = "",
}: {
  mood?: EddieMood;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label={MOOD_LABEL[mood]}
      className={className}
    >
      {/* 몸통 — 둥근 물방울 형태 */}
      <path
        d="M50 8c19 0 33 15 33 36 0 24-15 40-33 40S17 68 17 44 31 8 50 8Z"
        fill="var(--e-primary)"
      />
      {/* 배 하이라이트 */}
      <ellipse cx="50" cy="58" rx="20" ry="17" fill="#fff" opacity="0.22" />
      {/* 볼 홍조 */}
      <circle cx="31" cy="55" r="6" fill="#fff" opacity="0.28" />
      <circle cx="69" cy="55" r="6" fill="#fff" opacity="0.28" />

      {/* 표정 — mood별 눈/입 */}
      <Face mood={mood} />
    </svg>
  );
}

const MOOD_LABEL: Record<EddieMood, string> = {
  calm: "담담한 에디",
  happy: "기뻐하는 에디",
  cheer: "응원하는 에디",
  night: "잘 자라고 인사하는 에디",
};

function Face({ mood }: { mood: EddieMood }) {
  const ink = "#3A3A3A";
  switch (mood) {
    case "happy":
      return (
        <g stroke={ink} strokeWidth={3.2} strokeLinecap="round" fill="none">
          {/* 반달 눈 */}
          <path d="M34 44c1.6 2.6 5.4 2.6 7 0" />
          <path d="M59 44c1.6 2.6 5.4 2.6 7 0" />
          {/* 활짝 웃는 입 */}
          <path d="M42 55c2.8 4.4 13.2 4.4 16 0" />
        </g>
      );
    case "cheer":
      return (
        <g>
          <g stroke={ink} strokeWidth={3.2} strokeLinecap="round" fill="none">
            <path d="M34 44c1.6 2.6 5.4 2.6 7 0" />
            <path d="M59 44c1.6 2.6 5.4 2.6 7 0" />
            <path d="M43 55c2.5 3.8 11.5 3.8 14 0" />
          </g>
          {/* 응원 반짝임 */}
          <path
            d="M78 30l1.6 4 4 1.6-4 1.6L78 41l-1.6-3.8-4-1.6 4-1.6Z"
            fill="var(--e-accent)"
          />
        </g>
      );
    case "night":
      return (
        <g stroke={ink} strokeWidth={3.2} strokeLinecap="round" fill="none">
          {/* 감은 눈 */}
          <path d="M33 46h8" />
          <path d="M59 46h8" />
          {/* 옅은 미소 */}
          <path d="M44 56c2 2.4 10 2.4 12 0" />
          {/* Zzz */}
          <path d="M72 30h7l-7 8h7" strokeWidth={2.4} />
        </g>
      );
    case "calm":
    default:
      return (
        <g>
          {/* 동그란 눈 */}
          <circle cx="38" cy="45" r="3.4" fill={ink} />
          <circle cx="62" cy="45" r="3.4" fill={ink} />
          {/* 담담한 미소 */}
          <path
            d="M44 55c2.2 2.6 9.8 2.6 12 0"
            stroke={ink}
            strokeWidth={3.2}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );
  }
}
