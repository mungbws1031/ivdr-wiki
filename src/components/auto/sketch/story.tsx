import type { ApplyKind, ReadKind, SketchModel } from "../../../lib/sketch";
import { INK, PAPER, RED, SCREEN, type Palette } from "./geom";

// 사용 순서 3컷 — 손그림 스토리보드. 각 칸 왼쪽에 그림, 오른쪽에 짧은 설명.
const S = { stroke: INK, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function ApplyArt({ k, pal }: { k: ApplyKind; pal: Palette }) {
  switch (k) {
    case "urine":
      return (
        <g>
          <g transform="rotate(-28 50 60)">
            <rect x={20} y={52} width={84} height={18} rx={9} fill={pal.base} {...S} />
            <path d="M29 52 H44 V70 H29 A9 9 0 0 1 20 61 A9 9 0 0 1 29 52Z" fill="#f4f1e8" {...S} />
          </g>
          {[[22, 20], [34, 8], [14, 6]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q5 8 0 11 q-5 -3 0 -11z`} fill="#f6e7a1" {...S} strokeWidth={1.2} />)}
        </g>
      );
    case "blood":
      return (
        <g>
          <path d="M18 8 v40 a16 16 0 0 0 32 0 v-40" fill="#f6dccd" {...S} />
          <path d="M24 46 a10 8 0 0 0 20 0" fill="none" {...S} strokeWidth={1} />
          <path d="M34 66 q7 10 0 14 q-7 -4 0 -14z" fill={RED} {...S} strokeWidth={1.2} />
          <rect x={14} y={88} width={84} height={20} rx={6} fill={pal.base} {...S} />
          <circle cx={30} cy={98} r={6} fill={PAPER} {...S} strokeWidth={1.2} />
        </g>
      );
    case "swab":
      return (
        <g>
          <path d="M58 30 h26 v62 a13 13 0 0 1 -26 0z" fill="#e8f1ff" {...S} />
          <line x1={28} y1={4} x2={70} y2={84} {...S} />
          <ellipse cx={70} cy={86} rx={5} ry={8} fill="#fff" {...S} transform="rotate(-28 70 86)" />
          <path d="M50 22 a14 14 0 0 1 20 -6" fill="none" {...S} strokeDasharray="3 3" />
        </g>
      );
    case "saliva":
      return (
        <g>
          <path d="M40 10 h40 l-10 22 v66 a10 10 0 0 1 -20 0 v-66z" fill="#e8f1ff" {...S} />
          <line x1={52} y1={70} x2={68} y2={70} {...S} strokeWidth={1} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M60 4 v50 l-6 16 h12 l-6 -16" fill="#fff" {...S} />
          <path d="M60 78 q6 9 0 12 q-6 -3 0 -12z" fill="#f2c14e" {...S} strokeWidth={1.2} />
          <rect x={14} y={92} width={84} height={18} rx={6} fill={pal.base} {...S} />
        </g>
      );
  }
}

function WaitArt() {
  return (
    <g>
      <circle cx={56} cy={56} r={38} fill="#fff" {...S} />
      <rect x={50} y={8} width={12} height={8} rx={2} fill={INK} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={56 + Math.sin(a) * 31} y1={56 - Math.cos(a) * 31} x2={56 + Math.sin(a) * 35} y2={56 - Math.cos(a) * 35} {...S} strokeWidth={1} />;
      })}
      <line x1={56} y1={56} x2={56} y2={30} {...S} strokeWidth={2.2} />
      <line x1={56} y1={56} x2={74} y2={64} {...S} strokeWidth={2.2} />
      <text x={56} y={110} fontSize={12} textAnchor="middle" fill={INK} fontWeight={700}>[__]분</text>
    </g>
  );
}

function ReadArt({ k, m, pal }: { k: ReadKind; m: SketchModel; pal: Palette }) {
  if (k === "app")
    return (
      <g>
        <rect x={10} y={70} width={84} height={22} rx={8} fill={pal.base} {...S} />
        <line x1={46} y1={76} x2={46} y2={86} stroke={RED} strokeWidth={2.4} />
        <line x1={58} y1={76} x2={58} y2={86} stroke={RED} strokeWidth={2.4} />
        <rect x={34} y={0} width={46} height={82} rx={9} fill="#2f333a" {...S} transform="rotate(12 57 41)" />
        <rect x={39} y={8} width={36} height={60} rx={5} fill={SCREEN} transform="rotate(12 57 41)" />
        <text x={58} y={44} fontSize={9} fontWeight={700} textAnchor="middle" fill={INK} transform="rotate(12 57 41)">{m.quantitative ? "측정값" : "양성"}</text>
      </g>
    );
  if (k === "reader")
    return (
      <g>
        <rect x={8} y={20} width={96} height={74} rx={18} fill={pal.base} {...S} />
        <rect x={20} y={32} width={72} height={34} rx={6} fill={SCREEN} {...S} />
        <text x={56} y={54} fontSize={10} fontWeight={700} textAnchor="middle" fill={INK}>{m.quantitative ? "측정값" : "양성 / 음성"}</text>
        <circle cx={56} cy={80} r={6} fill={pal.shade} {...S} strokeWidth={1.2} />
      </g>
    );
  // 눈으로 — C/T 판독 예
  const row = (y: number, t: boolean, c: boolean, label: string) => (
    <g key={label}>
      <rect x={6} y={y} width={58} height={22} rx={6} fill="#fff" {...S} strokeWidth={1.2} />
      {t && <line x1={26} y1={y + 5} x2={26} y2={y + 17} stroke={RED} strokeWidth={2.6} />}
      {c && <line x1={44} y1={y + 5} x2={44} y2={y + 17} stroke={RED} strokeWidth={2.6} />}
      <text x={72} y={y + 15} fontSize={11} fill={INK}>{label}</text>
    </g>
  );
  return <g>{row(10, false, true, "음성")}{row(42, true, true, "양성")}{row(74, true, false, "무효")}</g>;
}

/** 단어 단위 줄바꿈 (글자 수 기준) */
export function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}

export function Storyboard({ m, pal, x, y }: { m: SketchModel; pal: Palette; x: number; y: number }) {
  const W = 290, H = 132, gap = 15;
  return (
    <g transform={`translate(${x} ${y})`}>
      <text x={0} y={-10} fontSize={12} fontWeight={800} fill={INK} letterSpacing={1}>사용 순서</text>
      {m.story.map((st, i) => (
        <g key={i} transform={`translate(${i * (W + gap)} 0)`}>
          <rect width={W} height={H} rx={10} fill="#fff" stroke={INK} strokeWidth={1.2} strokeDasharray={i === 1 ? "0" : "0"} opacity={0.95} />
          <g transform="translate(10 12)">
            {i === 0 && <ApplyArt k={m.apply} pal={pal} />}
            {i === 1 && <WaitArt />}
            {i === 2 && <ReadArt k={m.read} m={m} pal={pal} />}
          </g>
          <circle cx={134} cy={24} r={11} fill={INK} />
          <text x={134} y={28} fontSize={12} fontWeight={800} textAnchor="middle" fill={PAPER}>{i + 1}</text>
          <text x={152} y={29} fontSize={13} fontWeight={800} fill={INK}>{st.title}</text>
          {wrap(st.text, 13).slice(0, 5).map((ln, j) => <text key={j} x={126} y={52 + j * 16} fontSize={11.5} fill={INK} opacity={0.85}>{ln}</text>)}
          {i < 2 && <path d={`M${W + 2} ${H / 2} l10 0 m-4 -4 l4 4 l-4 4`} fill="none" stroke={INK} strokeWidth={1.4} />}
        </g>
      ))}
    </g>
  );
}
