import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import type { DocState, FactoryDoc, FactoryFloor, FloorId } from "../../lib/factory";

// 문서 공장 2D·3D 화면이 함께 쓰는 상태 색·캐릭터·층 상세.

export const STATE: Record<DocState, { label: string; color: string }> = {
  done: { label: "완료", color: "var(--success)" },
  writing: { label: "작성 중", color: "var(--info)" },
  blocked: { label: "사람 대기", color: "var(--warning)" },
  todo: { label: "시작 전", color: "var(--text-subtle)" },
};

export const pct = (v: number) => `${Math.round(v * 100)}%`;

// ── 캐릭터 — 동물 얼굴 직원 ───────────────────────────────
/** 문서 id로 정해지는 고정 난수 — 새로고침해도 같은 얼굴. */
export function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}


type Species = "bear" | "cat" | "rabbit" | "dog" | "fox" | "panda";
const SPECIES: Species[] = ["bear", "cat", "rabbit", "dog", "fox", "panda"];
const FUR: Record<Species, string[]> = {
  bear: ["#A67B5B", "#8C6239", "#C49A6C"],
  cat: ["#F2B36B", "#B8B8C2", "#F4EDE4", "#3F3D45"],
  rabbit: ["#F6F2EE", "#E8D9CC", "#CFC6C0"],
  dog: ["#D9A066", "#F1E1C8", "#B07A4A"],
  fox: ["#E8833A", "#D96A2B"],
  panda: ["#F7F7F5"],
};

/** 동물 머리 (머리 중심 15,9.6) — 귀·털색·주둥이가 종마다 다르다 */
function AnimalHead({ sp, fur }: { sp: Species; fur: string }) {
  const ink = "#3A2C26";
  const pink = "#F7A8B8";
  switch (sp) {
    case "bear":
      return (
        <g>
          <circle cx="9.6" cy="4.4" r="2.7" fill={fur} />
          <circle cx="20.4" cy="4.4" r="2.7" fill={fur} />
          <circle cx="9.6" cy="4.4" r="1.4" fill="#E8CDB0" />
          <circle cx="20.4" cy="4.4" r="1.4" fill="#E8CDB0" />
          <circle cx="15" cy="9.6" r="6.8" fill={fur} />
          <ellipse cx="15" cy="12.3" rx="3.2" ry="2.3" fill="#EBD3B8" />
          <ellipse cx="15" cy="11.2" rx="1.2" ry="0.8" fill={ink} />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M8.6 6.4 L9 0.8 L12.8 4 Z M21.4 6.4 L21 0.8 L17.2 4 Z" fill={fur} />
          <path d="M9.5 5 L9.7 2.4 L11.5 4 Z M20.5 5 L20.3 2.4 L18.5 4 Z" fill={pink} />
          <ellipse cx="15" cy="9.8" rx="7" ry="6.4" fill={fur} />
          <path d="M14.2 11 L15.8 11 L15 11.9 Z" fill={pink} />
          <g stroke={ink} strokeWidth="0.35" opacity="0.6">
            <path d="M8 11.2 L11 11.6 M8 12.6 L11 12.4 M22 11.2 L19 11.6 M22 12.6 L19 12.4" />
          </g>
        </g>
      );
    case "rabbit":
      return (
        <g>
          <ellipse cx="12.2" cy="1.6" rx="1.9" ry="4.6" fill={fur} transform="rotate(-8 12.2 1.6)" />
          <ellipse cx="17.8" cy="1.6" rx="1.9" ry="4.6" fill={fur} transform="rotate(8 17.8 1.6)" />
          <ellipse cx="12.2" cy="1.8" rx="0.9" ry="3.4" fill={pink} transform="rotate(-8 12.2 1.8)" />
          <ellipse cx="17.8" cy="1.8" rx="0.9" ry="3.4" fill={pink} transform="rotate(8 17.8 1.8)" />
          <circle cx="15" cy="9.8" r="6.6" fill={fur} stroke="#E3D8CF" strokeWidth="0.5" />
          <ellipse cx="15" cy="11.3" rx="0.9" ry="0.7" fill={pink} />
        </g>
      );
    case "dog":
      return (
        <g>
          <circle cx="15" cy="9.6" r="6.7" fill={fur} />
          <ellipse cx="8.4" cy="8.4" rx="2.1" ry="4" fill="#8A5A3B" transform="rotate(18 8.4 8.4)" />
          <ellipse cx="21.6" cy="8.4" rx="2.1" ry="4" fill="#8A5A3B" transform="rotate(-18 21.6 8.4)" />
          <ellipse cx="15" cy="12.4" rx="3.3" ry="2.4" fill="#F6E9D6" />
          <ellipse cx="15" cy="11.2" rx="1.3" ry="0.9" fill={ink} />
        </g>
      );
    case "fox":
      return (
        <g>
          <path d="M8.2 7 L8.4 0.6 L13 4 Z M21.8 7 L21.6 0.6 L17 4 Z" fill={fur} />
          <path d="M8.4 2.6 L8.4 0.6 L10 1.8 Z M21.6 2.6 L21.6 0.6 L20 1.8 Z" fill="#3A2C26" />
          <path d="M8 9.4 Q8.4 3 15 3 Q21.6 3 22 9.4 Q21 15.6 15 16.4 Q9 15.6 8 9.4 Z" fill={fur} />
          <path d="M8.6 10.6 Q12 11.4 15 16.2 Q18 11.4 21.4 10.6 Q20.4 15.2 15 16.4 Q9.6 15.2 8.6 10.6 Z" fill="#FFF4E8" />
          <ellipse cx="15" cy="11.6" rx="1" ry="0.7" fill={ink} />
        </g>
      );
    default: // panda
      return (
        <g>
          <circle cx="9.6" cy="4.4" r="2.6" fill="#2E2E33" />
          <circle cx="20.4" cy="4.4" r="2.6" fill="#2E2E33" />
          <circle cx="15" cy="9.6" r="6.8" fill={fur} stroke="#E6E6E2" strokeWidth="0.5" />
          <ellipse cx="12.3" cy="9.6" rx="1.9" ry="2.4" fill="#2E2E33" transform="rotate(20 12.3 9.6)" />
          <ellipse cx="17.7" cy="9.6" rx="1.9" ry="2.4" fill="#2E2E33" transform="rotate(-20 17.7 9.6)" />
          <ellipse cx="15" cy="11.3" rx="1.1" ry="0.75" fill="#2E2E33" />
        </g>
      );
  }
}

// ── 부서별 직업 캐릭터 (파스텔 클레이) ───────────────────
/** 부서마다 옷·소품이 다르다. 상태는 옷이 아니라 발밑 링·배지로 보여 준다. */
export const OUTFIT: Record<FloorId, { label: string; body: string; trim: string; prop: string }> = {
  "7F": { label: "정장·결재 도장", body: "#5B6BA8", trim: "#F4F1EA", prop: "stamp" },
  "6F": { label: "니트 조끼·서류철", body: "#A795D6", trim: "#FFFFFF", prop: "folder" },
  "5F": { label: "후드티·노트북", body: "#7EC4EC", trim: "#E3F3FC", prop: "laptop" },
  "4F": { label: "실험 가운·보안경", body: "#F7F8FA", trim: "#BFD8F2", prop: "tube" },
  "3F": { label: "작업복·안전모", body: "#F4A261", trim: "#FFD54F", prop: "wrench" },
  "2F": { label: "폴로 셔츠·돋보기", body: "#6CC9B0", trim: "#E4F7F1", prop: "magnifier" },
  "1F": { label: "카디건·헤드셋", body: "#F5A9C4", trim: "#FFF1F6", prop: "headset" },
};

const RING: Record<DocState, string> = { done: "#4CC38A", writing: "#5B9CF5", blocked: "#F2A23C", todo: "#C9CDD6" };

/** 클레이 몸통·팔·다리·복장 (머리 아래, viewBox 30×40) */
function ClayBody({ dept, walking }: { dept: FloorId; walking: boolean }) {
  const o = OUTFIT[dept];
  const shade = "rgba(40,30,60,.14)";
  return (
    <g>
      {/* 다리 */}
      <g className={walking ? "factory-leg" : undefined} style={{ transformOrigin: "12.5px 30px" }}><rect x="10.6" y="29" width="3.8" height="8.6" rx="1.9" fill={dept === "3F" ? "#4E6E9E" : "#59607A"} /></g>
      <g className={walking ? "factory-leg factory-leg-r" : undefined} style={{ transformOrigin: "17.5px 30px" }}><rect x="15.6" y="29" width="3.8" height="8.6" rx="1.9" fill={dept === "3F" ? "#4E6E9E" : "#59607A"} /></g>
      {/* 팔 */}
      <ellipse cx="7.6" cy="23.8" rx="2.1" ry="3.6" fill={o.body} transform="rotate(14 7.6 23.8)" />
      <ellipse cx="22.4" cy="23.8" rx="2.1" ry="3.6" fill={o.body} transform="rotate(-14 22.4 23.8)" />
      {/* 몸통 — 둥근 클레이 */}
      <rect x="8.3" y="16.6" width="13.4" height="14.4" rx="6.2" fill={o.body} />
      <ellipse cx="15" cy="29.4" rx="6" ry="1.6" fill={shade} />
      <ellipse cx="12" cy="19.6" rx="2.6" ry="1.4" fill="#fff" opacity="0.38" />
      {/* 복장 디테일 */}
      {dept === "7F" && <><path d="M12.6 16.8 L15 21.6 L17.4 16.8 Z" fill={o.trim} /><path d="M14.4 18.4 L15.6 18.4 L16 23.4 L15 24.6 L14 23.4 Z" fill="#E25B6E" /></>}
      {dept === "6F" && <><path d="M12.4 16.8 L15 20.4 L17.6 16.8 Z" fill={o.trim} /><circle cx="15" cy="23" r="0.55" fill="#fff" opacity=".8" /><circle cx="15" cy="25.4" r="0.55" fill="#fff" opacity=".8" /></>}
      {dept === "5F" && <><path d="M10.4 17.4 Q15 21 19.6 17.4" stroke={o.trim} strokeWidth="1.4" fill="none" strokeLinecap="round" /><line x1="13.6" y1="19" x2="13.4" y2="22.4" stroke="#fff" strokeWidth="0.5" /><line x1="16.4" y1="19" x2="16.6" y2="22.4" stroke="#fff" strokeWidth="0.5" /><rect x="11.8" y="25" width="6.4" height="2.6" rx="1.2" fill={o.trim} opacity=".7" /></>}
      {dept === "4F" && <><path d="M12.2 16.8 L15 22.6 L17.8 16.8" stroke="#D5DBE6" strokeWidth="0.9" fill="none" /><line x1="15" y1="22.6" x2="15" y2="30.4" stroke="#D5DBE6" strokeWidth="0.6" /><rect x="16.6" y="23.4" width="2.6" height="1.8" rx="0.4" fill={o.trim} /></>}
      {dept === "3F" && <><rect x="10.6" y="16.8" width="1.4" height="7" rx="0.7" fill="#3E6B9E" opacity=".55" /><rect x="18" y="16.8" width="1.4" height="7" rx="0.7" fill="#3E6B9E" opacity=".55" /><rect x="12.2" y="21.4" width="5.6" height="3.2" rx="1" fill="#FFE08A" opacity=".85" /></>}
      {dept === "2F" && <><path d="M11.6 16.8 L15 19.2 L18.4 16.8 L17 18.8 L15 19.8 L13 18.8 Z" fill={o.trim} /><circle cx="15" cy="21.2" r="0.5" fill="#fff" /></>}
      {dept === "1F" && <><path d="M12.6 16.8 L15 20.6 L17.4 16.8 Z" fill={o.trim} />{[21.6, 23.8, 26].map((y) => <circle key={y} cx="15" cy={y} r="0.55" fill="#fff" />)}</>}
    </g>
  );
}

/** 소품 — 오른손(화면 오른쪽) */
function ClayProp({ dept }: { dept: FloorId }) {
  switch (dept) {
    case "7F": return (<g transform="translate(22.6 24.6)"><rect x="-1.4" y="-3.6" width="2.8" height="3.2" rx="1.2" fill="#C0392B" /><rect x="-2.2" y="-0.6" width="4.4" height="1.8" rx="0.6" fill="#E25B6E" /></g>);
    case "6F": return (<g transform="translate(23.2 24.4) rotate(-10)"><rect x="-2.6" y="-3.4" width="5.2" height="6.4" rx="0.8" fill="#F6C453" /><rect x="-1.8" y="-2.2" width="3.6" height="0.6" rx="0.3" fill="#fff" opacity=".85" /><rect x="-1.8" y="-0.9" width="3" height="0.6" rx="0.3" fill="#fff" opacity=".85" /></g>);
    case "5F": return (<g transform="translate(15 27.2)"><rect x="-5.4" y="-1" width="10.8" height="1.4" rx="0.6" fill="#B7BDC9" /><path d="M-4.4 -1 L-3.6 -5.4 L3.6 -5.4 L4.4 -1 Z" fill="#D7DCE5" /><circle cx="0" cy="-3.2" r="0.6" fill="#9AA3B2" /></g>);
    case "4F": return (<g transform="translate(23.4 23.6) rotate(12)"><rect x="-0.9" y="-4.2" width="1.8" height="6" rx="0.9" fill="#E9F2FB" stroke="#9FB8D3" strokeWidth="0.35" /><rect x="-0.9" y="-0.6" width="1.8" height="2.4" rx="0.9" fill="#F27BA6" /></g>);
    case "3F": return (<g transform="translate(23.4 24.2) rotate(-28)"><rect x="-0.6" y="-2.4" width="1.2" height="6" rx="0.6" fill="#9AA3B2" /><circle cx="0" cy="-3" r="1.6" fill="#9AA3B2" /><circle cx="0" cy="-3.6" r="0.8" fill="#F4A261" /></g>);
    case "2F": return (<g transform="translate(23.2 23.4)"><circle cx="0" cy="-1.4" r="2.2" fill="#E8F6FF" stroke="#7A8699" strokeWidth="0.8" /><rect x="0.9" y="0.3" width="1" height="3" rx="0.5" fill="#7A8699" transform="rotate(-35 1.4 1.8)" /></g>);
    default: return null;
  }
}

/** 머리 장식 — 안전모·보안경·헤드셋 (머리 위에 그린다) */
function HeadGear({ dept }: { dept: FloorId }) {
  if (dept === "3F") return (<g><path d="M7.6 8.2 Q8 1.6 15 1.4 Q22 1.6 22.4 8.2 Z" fill="#FFD54F" /><rect x="6.4" y="7.4" width="17.2" height="1.6" rx="0.8" fill="#F4C430" /><ellipse cx="12.4" cy="4" rx="2" ry="1" fill="#fff" opacity=".45" /></g>);
  if (dept === "4F") return (<g><rect x="7.6" y="5.4" width="14.8" height="1" rx="0.5" fill="#7FA9D6" /><rect x="10.4" y="4.6" width="3.8" height="2.6" rx="1.2" fill="#CFE6FA" stroke="#7FA9D6" strokeWidth="0.5" /><rect x="15.8" y="4.6" width="3.8" height="2.6" rx="1.2" fill="#CFE6FA" stroke="#7FA9D6" strokeWidth="0.5" /></g>);
  if (dept === "1F") return (<g fill="none"><path d="M7.8 9.6 Q8 2.2 15 2.2 Q22 2.2 22.2 9.6" stroke="#5B6070" strokeWidth="1" /><rect x="6.6" y="8.4" width="2.4" height="3.6" rx="1.1" fill="#F5A9C4" stroke="#5B6070" strokeWidth="0.5" /><path d="M7.8 12 Q8.4 15 11.6 14.4" stroke="#5B6070" strokeWidth="0.6" /><circle cx="11.8" cy="14.3" r="0.7" fill="#5B6070" /></g>);
  return null;
}

/** 동물 얼굴 직원 — 사원증 셔츠·두 다리, 표정은 상태(완료·작성 중·대기·시작 전)에 따라 바뀐다. */
/** mood가 있으면 문서 상태 대신 난이도 표정 (결과 화면) — 쉬움 미소 · 보통 · 어려움 땀 · 매우 어려움 비명 */
export type FaceMood = "easy" | "normal" | "hard" | "scream";

export function Minimi({ seed, state, shirt, walking, mood, dept }: { seed: string; state: DocState; shirt: string; walking: boolean; mood?: FaceMood; dept?: FloorId }) {
  const n = seedOf(seed);
  const sp = SPECIES[n % SPECIES.length];
  const furs = FUR[sp];
  const fur = furs[(n >>> 4) % furs.length];
  const panda = sp === "panda";
  const ink = panda ? "#fff" : "#2B2321";
  const line = "#3A2C26";
  const moodFace = mood ? moodParts(mood, ink, line, panda) : null;
  const eyes = moodFace ? moodFace.eyes
    : state === "done" ? (
      <g stroke={ink} strokeWidth="0.85" fill="none" strokeLinecap="round">
        <path d="M11.6 9.9 Q12.5 8.9 13.4 9.9" />
        <path d="M16.6 9.9 Q17.5 8.9 18.4 9.9" />
      </g>
    ) : state === "writing" ? (
      <g stroke={ink} strokeWidth="0.85" strokeLinecap="round">
        <path d="M11.7 9.7 L13.3 9.7" />
        <path d="M16.7 9.7 L18.3 9.7" />
      </g>
    ) : (
      <g fill={ink}>
        <circle cx="12.5" cy="9.5" r="1" />
        <circle cx="17.5" cy="9.5" r="1" />
        {!panda && <circle cx="12.8" cy="9.2" r="0.32" fill="#fff" />}
        {!panda && <circle cx="17.8" cy="9.2" r="0.32" fill="#fff" />}
      </g>
    );
  const mouth = moodFace ? moodFace.mouth
    : state === "done" ? <path d="M13.6 13 Q15 14.7 16.4 13 Z" fill="#D9535F" />
    : state === "blocked" ? <path d="M13.8 14 Q15 13.1 16.2 14" stroke={line} strokeWidth="0.65" fill="none" strokeLinecap="round" />
    : <path d="M13.8 12.9 Q14.4 13.6 15 12.9 Q15.6 13.6 16.2 12.9" stroke={line} strokeWidth="0.6" fill="none" strokeLinecap="round" />;
  const face = (
    <>
      <AnimalHead sp={sp} fur={fur} />
      {dept && <ellipse cx="12.2" cy="6" rx="2.6" ry="1.5" fill="#fff" opacity="0.3" />}
      {eyes}
      <ellipse cx="10.9" cy="12" rx="1.1" ry="0.6" fill="#F59A9A" opacity="0.55" />
      <ellipse cx="19.1" cy="12" rx="1.1" ry="0.6" fill="#F59A9A" opacity="0.55" />
      {mouth}
      {!mood && state === "blocked" && <path d="M22 4.6 Q23.2 6.4 22 7.1 Q20.8 6.4 22 4.6 Z" fill="#7CC4F0" />}
      {moodFace?.extra}
    </>
  );
  if (dept) {
    // 파스텔 클레이 직업 캐릭터 — 발밑 링 색이 상태, 시작 전은 흐리게
    return (
      <svg width="30" height="40" viewBox="0 0 30 40" aria-hidden style={{ overflow: "visible", opacity: state === "todo" ? 0.72 : 1 }} data-dept={dept}>
        <ellipse cx="15" cy="38.4" rx="8.2" ry="2.6" fill="rgba(60,40,90,.12)" />
        <ellipse cx="15" cy="38.2" rx="7" ry="2" fill="none" stroke={RING[state]} strokeWidth="1.1" opacity="0.9" />
        <ClayBody dept={dept} walking={walking} />
        {face}
        <HeadGear dept={dept} />
        <ClayProp dept={dept} />
      </svg>
    );
  }
  return (
    <svg width="30" height="40" viewBox="0 0 30 40" aria-hidden style={{ overflow: "visible" }}>
      <ellipse cx="15" cy="38.6" rx="7.5" ry="2.4" fill="rgba(0,0,0,.14)" />
      {/* 다리 */}
      <g className={walking ? "factory-leg" : undefined} style={{ transformOrigin: "12px 30px" }}><rect x="10.2" y="29.5" width="3.6" height="9" rx="1.5" fill="#3B3F4A" /></g>
      <g className={walking ? "factory-leg factory-leg-r" : undefined} style={{ transformOrigin: "18px 30px" }}><rect x="16.2" y="29.5" width="3.6" height="9" rx="1.5" fill="#3B3F4A" /></g>
      {/* 셔츠 + 사원증 */}
      <rect x="8.5" y="16.5" width="13" height="15" rx="5" fill={shirt} />
      <rect x="12.1" y="20" width="5.8" height="7" rx="1.1" fill="#fff" opacity="0.92" />
      <rect x="13.2" y="21.3" width="3.6" height="1" rx="0.5" fill={shirt} opacity="0.7" />
      {face}
    </svg>
  );
}

const drop = (x: number, y: number, s = 1) => <path key={`${x}-${y}`} d={`M${x} ${y} q${1.2 * s} ${1.8 * s} 0 ${2.5 * s} q${-1.2 * s} ${-0.7 * s} 0 ${-2.5 * s} z`} fill="#7CC4F0" />;

/** 난이도 표정 — 눈·입·덧붙임(땀·손·떨림) */
function moodParts(mood: FaceMood, ink: string, line: string, panda: boolean): { eyes: React.ReactNode; mouth: React.ReactNode; extra: React.ReactNode } {
  switch (mood) {
    case "easy":
      return {
        eyes: (
          <g stroke={ink} strokeWidth="0.95" fill="none" strokeLinecap="round">
            <path d="M11.4 10 Q12.5 8.6 13.6 10" />
            <path d="M16.4 10 Q17.5 8.6 18.6 10" />
          </g>
        ),
        mouth: <path d="M12.9 12.6 Q15 15.6 17.1 12.6 Z" fill="#D9535F" stroke={line} strokeWidth="0.4" strokeLinejoin="round" />,
        extra: (
          <g fill="#FF8F9E" opacity="0.6">
            <ellipse cx="10.6" cy="12.2" rx="1.5" ry="0.8" />
            <ellipse cx="19.4" cy="12.2" rx="1.5" ry="0.8" />
          </g>
        ),
      };
    case "normal":
      return {
        eyes: (
          <g fill={ink}>
            <circle cx="12.5" cy="9.5" r="1" />
            <circle cx="17.5" cy="9.5" r="1" />
          </g>
        ),
        mouth: <path d="M13.6 13.3 L16.4 13.3" stroke={line} strokeWidth="0.7" strokeLinecap="round" />,
        extra: null,
      };
    case "hard":
      return {
        eyes: (
          <g>
            <g stroke={line} strokeWidth="0.7" strokeLinecap="round">
              <path d="M11.2 7.6 L13.4 8.4" />
              <path d="M18.8 7.6 L16.6 8.4" />
            </g>
            <g fill={ink}>
              <circle cx="12.5" cy="9.8" r="0.95" />
              <circle cx="17.5" cy="9.8" r="0.95" />
            </g>
          </g>
        ),
        mouth: <path d="M13 13.6 Q13.8 12.8 14.5 13.6 Q15.2 14.4 16 13.6 Q16.6 12.9 17.2 13.5" stroke={line} strokeWidth="0.65" fill="none" strokeLinecap="round" />,
        extra: <g>{drop(21.6, 4.4)}{drop(7.8, 6, 0.8)}</g>,
      };
    default: // scream — 크게 뜬 눈, 세로로 벌린 입, 볼에 손, 땀, 떨림
      return {
        eyes: (
          <g>
            <circle cx="12.4" cy="9.3" r="1.7" fill="#fff" stroke={ink === "#fff" ? "#2E2E33" : line} strokeWidth="0.5" />
            <circle cx="17.6" cy="9.3" r="1.7" fill="#fff" stroke={ink === "#fff" ? "#2E2E33" : line} strokeWidth="0.5" />
            <circle cx="12.4" cy="9.3" r="0.55" fill={panda ? "#2E2E33" : ink} />
            <circle cx="17.6" cy="9.3" r="0.55" fill={panda ? "#2E2E33" : ink} />
          </g>
        ),
        mouth: (
          <g>
            <ellipse cx="15" cy="13.9" rx="1.6" ry="2.4" fill="#4A1F1F" stroke={line} strokeWidth="0.4" />
            <ellipse cx="15" cy="15.2" rx="0.9" ry="0.7" fill="#E25B6E" />
          </g>
        ),
        extra: (
          <g>
            {/* 볼을 감싼 두 손 + 들어 올린 팔 */}
            <path d="M9 18 Q6.6 15.6 7.6 12.4" stroke="#3B3F4A" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d="M21 18 Q23.4 15.6 22.4 12.4" stroke="#3B3F4A" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />
            <ellipse cx="8.1" cy="11.6" rx="1.6" ry="2.1" fill="#F3D2B8" stroke={line} strokeWidth="0.4" />
            <ellipse cx="21.9" cy="11.6" rx="1.6" ry="2.1" fill="#F3D2B8" stroke={line} strokeWidth="0.4" />
            {drop(23.6, 3.4)}{drop(5.6, 4.2, 0.9)}{drop(24.6, 8, 0.7)}
            <path d="M3.5 2.5 l1.2 1.4 M26.5 2.5 l-1.2 1.4 M15 -1.2 l0 1.6" stroke="#E25B6E" strokeWidth="0.7" strokeLinecap="round" />
          </g>
        ),
      };
  }
}

/** 문서 한 장 = 직원 한 명. 상태에 따라 자리·색·동작이 바뀐다. */
export function Worker({ d, color, walking = false, dept }: { d: FactoryDoc; color: string; walking?: boolean; dept?: FloorId }) {
  const st = STATE[d.state];
  const body = d.state === "todo" ? "var(--border-strong)" : d.state === "done" ? "var(--success)" : d.state === "blocked" ? "var(--warning)" : color;
  return (
    <Link
      to={`/doc/${d.id}`}
      title={`${d.title} — ${st.label}${d.why ? ` (${d.why})` : ""} · ${pct(d.progress)}`}
      aria-label={`${d.title}, ${st.label}, ${pct(d.progress)}`}
      className="relative inline-flex flex-col items-center shrink-0"
      style={{ width: 34, animation: d.state === "blocked" ? "factory-bob 1.6s ease-in-out infinite" : undefined }}
    >
      {d.state === "writing" && (
        <span aria-hidden className="absolute flex" style={{ top: -9, gap: 2 }}>
          {[0, 1, 2].map((i) => <span key={i} className="rounded-full" style={{ width: 3, height: 3, background: color, animation: `factory-dot 1.2s ${i * 0.15}s infinite` }} />)}
        </span>
      )}
      <Minimi seed={d.id} state={d.state} shirt={body} walking={walking} dept={dept} />
      {d.state === "done" && (
        <span aria-hidden className="absolute inline-grid place-items-center rounded-full" style={{ top: -4, right: 0, width: 13, height: 13, background: "var(--success)", color: "var(--text-on-color)" }}>
          <Check size={9} strokeWidth={3.5} />
        </span>
      )}
      {d.state === "blocked" && (
        <span aria-hidden className="absolute inline-grid place-items-center rounded-full font-extrabold" style={{ top: -4, right: 0, width: 13, height: 13, fontSize: 9, background: "var(--warning)", color: "var(--text-on-color)" }}>!</span>
      )}
      {/* 책상 (걸을 때는 다리가 보이도록 비움) */}
      {!walking && <span aria-hidden style={{ width: 32, height: 4, marginTop: -2, borderRadius: 2, background: d.state === "blocked" ? "transparent" : "var(--room-desk, var(--border))" }} />}
    </Link>
  );
}

/** 층을 골랐을 때 보이는 문서·할 일 목록 (2D·3D 공용). */
export function FloorDetail({ f }: { f: FactoryFloor }) {
  return (
    <div className="grid" style={{ gap: "var(--s-4)", padding: "var(--s-4)", background: "var(--surface)", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", borderTop: "1px dashed var(--border)" }}>
      {f.tasks.length > 0 && (
        <div>
          <p className="font-bold" style={{ fontSize: "var(--t-sm)", color: "var(--warning)", marginBottom: 4 }}>사람이 할 일 {f.tasks.length}</p>
          <ul className="flex flex-col" style={{ gap: 4 }}>
            {f.tasks.map((t) => (
              <li key={t.id}>
                <Link to={t.to} className="block rounded-[var(--r-sm)] hover:bg-bg" style={{ padding: "4px 8px" }}>
                  <span className="block font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{t.title}</span>
                  <span className="block text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>{t.why}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {f.docs.length > 0 && (
        <div>
          <p className="font-bold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: 4 }}>문서 {f.docs.length} — {f.desc}</p>
          <ul className="flex flex-col" style={{ gap: 2 }}>
            {f.docs.map((d) => (
              <li key={d.id}>
                <Link to={`/doc/${d.id}`} className="grid items-center rounded-[var(--r-sm)] hover:bg-bg" style={{ gridTemplateColumns: "minmax(0,1fr) auto 44px", gap: 8, padding: "4px 8px" }}>
                  <span className="min-w-0">
                    <span className="block text-text" style={{ fontSize: "var(--t-sm)" }}>{d.title}</span>
                    {d.why && <span className="block" style={{ fontSize: "var(--t-xs)", color: "var(--warning)" }}>{d.why}</span>}
                  </span>
                  <span className="font-bold" style={{ fontSize: "var(--t-xs)", color: STATE[d.state].color }}>{STATE[d.state].label}</span>
                  <span className="text-right text-text-muted" style={{ fontSize: "var(--t-xs)", fontVariantNumeric: "tabular-nums" }}>{pct(d.progress)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
