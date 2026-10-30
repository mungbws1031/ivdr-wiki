import { useRef } from "react";
import { Download } from "lucide-react";
import type { ProductSpec } from "../../data/spec/types";

// 개념 스케치 — 제품 형태·판독 방식·검체로 그린 단순 SVG. 디자인이 아니라 "이런 구성" 정도를 보여 준다.
// 내려받아도 색이 그대로 보이도록 SVG 안에서는 고정 색(밝은 바탕)을 쓴다.
const INK = "#2b2f36";
const SOFT = "#e9edf3";
const ACCENT = "#e5484d";
const LINE = "#9aa3af";

function Cassette({ x, y, w = 150, h = 54, lines = true }: { x: number; y: number; w?: number; h?: number; lines?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#fff" stroke={INK} strokeWidth={2} />
      <circle cx={x + 28} cy={y + h / 2} r={11} fill={SOFT} stroke={INK} strokeWidth={1.5} />
      <rect x={x + 58} y={y + h / 2 - 10} width={56} height={20} rx={4} fill={SOFT} stroke={INK} strokeWidth={1.5} />
      {lines && <>
        <line x1={x + 76} y1={y + h / 2 - 8} x2={x + 76} y2={y + h / 2 + 8} stroke={ACCENT} strokeWidth={3} />
        <line x1={x + 96} y1={y + h / 2 - 8} x2={x + 96} y2={y + h / 2 + 8} stroke={ACCENT} strokeWidth={3} />
        <text x={x + 71} y={y + h / 2 + 22} fontSize={9} fill={INK}>T</text>
        <text x={x + 92} y={y + h / 2 + 22} fontSize={9} fill={INK}>C</text>
      </>}
    </g>
  );
}

function Screen({ x, y, w, h, text }: { x: number; y: number; w: number; h: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#dff3ea" stroke={INK} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 4} fontSize={11} textAnchor="middle" fill={INK} fontWeight={700}>{text}</text>
    </g>
  );
}

function Specimen({ x, y, kind }: { x: number; y: number; kind: ProductSpec["specimen"] }) {
  if (kind === "urine") return (<g><path d={`M${x} ${y} h34 l-4 46 h-26 z`} fill="#fff6c9" stroke={INK} strokeWidth={1.5} /><text x={x + 17} y={y + 62} fontSize={10} textAnchor="middle" fill={INK}>소변</text></g>);
  if (kind === "capillary-blood" || kind === "venous-blood") return (<g><path d={`M${x + 17} ${y} C ${x + 34} ${y + 24}, ${x + 30} ${y + 44}, ${x + 17} ${y + 44} C ${x + 4} ${y + 44}, ${x} ${y + 24}, ${x + 17} ${y} z`} fill={ACCENT} opacity={0.85} /><text x={x + 17} y={y + 62} fontSize={10} textAnchor="middle" fill={INK}>{kind === "capillary-blood" ? "손끝 혈액" : "혈액"}</text></g>);
  if (kind === "swab") return (<g><line x1={x} y1={y + 44} x2={x + 34} y2={y + 4} stroke={INK} strokeWidth={2} /><ellipse cx={x + 34} cy={y + 4} rx={5} ry={8} fill="#fff" stroke={INK} /><text x={x + 17} y={y + 62} fontSize={10} textAnchor="middle" fill={INK}>면봉</text></g>);
  if (kind === "saliva") return (<g><rect x={x + 6} y={y} width={22} height={44} rx={6} fill="#e8f1ff" stroke={INK} strokeWidth={1.5} /><text x={x + 17} y={y + 62} fontSize={10} textAnchor="middle" fill={INK}>타액</text></g>);
  return (<g><rect x={x + 6} y={y} width={22} height={44} rx={6} fill={SOFT} stroke={INK} strokeWidth={1.5} /><text x={x + 17} y={y + 62} fontSize={10} textAnchor="middle" fill={INK}>검체</text></g>);
}

function Phone({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={62} height={116} rx={12} fill="#fff" stroke={INK} strokeWidth={2} />
      <Screen x={x + 6} y={y + 12} w={50} h={84} text={text} />
      <circle cx={x + 31} cy={y + 106} r={4} fill={LINE} />
      <text x={x + 31} y={y + 132} fontSize={10} textAnchor="middle" fill={INK}>앱</text>
    </g>
  );
}

function Device({ s, result }: { s: ProductSpec; result: string }) {
  switch (s.formFactor) {
    case "strip-reader":
      return (
        <g>
          <Cassette x={150} y={150} />
          <rect x={150} y={40} width={150} height={92} rx={18} fill="#fff" stroke={INK} strokeWidth={2} />
          <Screen x={170} y={56} w={110} h={40} text={result} />
          <rect x={190} y={112} width={70} height={10} rx={3} fill={SOFT} stroke={INK} />
          <text x={225} y={30} fontSize={10} textAnchor="middle" fill={INK}>리더기 (스틱을 꽂아 판독)</text>
        </g>
      );
    case "personal-device":
      return (
        <g>
          <rect x={160} y={40} width={110} height={170} rx={28} fill="#fff" stroke={INK} strokeWidth={2} />
          <Screen x={176} y={64} w={78} h={56} text={result} />
          <circle cx={215} cy={150} r={14} fill={SOFT} stroke={INK} />
          <rect x={196} y={186} width={38} height={10} rx={3} fill={SOFT} stroke={INK} />
          <text x={215} y={30} fontSize={10} textAnchor="middle" fill={INK}>개인용 일체형 기기</text>
        </g>
      );
    case "poct":
      return (
        <g>
          <rect x={130} y={50} width={200} height={140} rx={16} fill="#fff" stroke={INK} strokeWidth={2} />
          <Screen x={150} y={68} w={100} h={60} text={result} />
          <rect x={268} y={72} width={44} height={14} rx={3} fill={SOFT} stroke={INK} />
          <text x={290} y={100} fontSize={9} textAnchor="middle" fill={INK}>카트리지</text>
          <rect x={150} y={150} width={160} height={22} rx={4} fill={SOFT} stroke={INK} />
          <text x={230} y={40} fontSize={10} textAnchor="middle" fill={INK}>POCT 기기 (약국·진료실)</text>
        </g>
      );
    case "lab-analyzer":
      return (
        <g>
          <rect x={110} y={30} width={240} height={190} rx={10} fill="#fff" stroke={INK} strokeWidth={2} />
          <Screen x={130} y={46} w={90} h={52} text={result} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={240 + i * 20} y={50} width={12} height={44} rx={3} fill={SOFT} stroke={INK} />)}
          <rect x={130} y={120} width={200} height={80} rx={6} fill={SOFT} stroke={INK} />
          <text x={230} y={165} fontSize={10} textAnchor="middle" fill={INK}>시약·검체 처리부</text>
          <text x={230} y={22} fontSize={10} textAnchor="middle" fill={INK}>검사실 자동 분석 장비</text>
        </g>
      );
    default:
      return (
        <g>
          <Cassette x={140} y={100} w={180} h={64} />
          <text x={230} y={86} fontSize={10} textAnchor="middle" fill={INK}>{s.formFactor === "strip-only" ? "테스트 스틱 (육안 판독)" : "제품 형태 미입력 — 스틱으로 표시"}</text>
        </g>
      );
  }
}

/** 개념 스케치 (SVG). 내려받기: SVG·PNG. */
export function ConceptSketch({ spec }: { spec: ProductSpec }) {
  const ref = useRef<SVGSVGElement>(null);
  const quantitative = spec.result.kind === "quantitative" || spec.result.kind === "semi-quantitative";
  const result = quantitative ? `${spec.analyte.cutoffUnit ? `00 ${spec.analyte.cutoffUnit}` : "측정값"}` : "양성 / 음성";
  const app = !!spec.software.hasApp || spec.result.readout === "app";
  const name = spec.identity.productName ?? "제품명 미입력";
  const analyte = [spec.analyte.name, spec.analyte.cutoffValue !== null ? `cut-off ${spec.analyte.cutoffValue} ${spec.analyte.cutoffUnit ?? ""}` : null].filter(Boolean).join(" · ");

  const save = (kind: "svg" | "png") => {
    const svg = ref.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const file = `concept-sketch.${kind}`;
    const done = (href: string) => { const a = document.createElement("a"); a.href = href; a.download = file; document.body.appendChild(a); a.click(); a.remove(); };
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
    if (kind === "svg") { done(url); setTimeout(() => URL.revokeObjectURL(url), 1000); return; }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 960; c.height = 560;
      c.getContext("2d")!.drawImage(img, 0, 0, 960, 560);
      URL.revokeObjectURL(url);
      c.toBlob((b) => { if (b) { const u = URL.createObjectURL(b); done(u); setTimeout(() => URL.revokeObjectURL(u), 1000); } });
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col" style={{ gap: "var(--s-3)" }}>
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 280" role="img" aria-label={`개념 스케치: ${name}`} style={{ width: "100%", maxWidth: 560, height: "auto", borderRadius: 12, border: "1px solid var(--border)" }} fontFamily="Pretendard, system-ui, sans-serif">
        <rect width={480} height={280} fill="#fafbfc" />
        <text x={16} y={22} fontSize={13} fontWeight={800} fill={INK}>{name}</text>
        {analyte && <text x={16} y={38} fontSize={10} fill={INK}>{analyte}</text>}
        {spec.specimen && <Specimen x={40} y={120} kind={spec.specimen} />}
        <Device s={spec} result={result} />
        {app && <Phone x={392} y={70} text={result} />}
        <text x={16} y={270} fontSize={9} fill={LINE}>개념 스케치 — 디자인이 아니라 구성 확인용 (스펙으로 자동 생성)</text>
      </svg>
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {(["svg", "png"] as const).map((k) => (
          <button key={k} type="button" onClick={() => save(k)} className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] border font-semibold" style={{ padding: "6px 12px", fontSize: "var(--t-xs)", borderColor: "var(--border)", minHeight: 36 }}>
            <Download size={14} aria-hidden /> {k.toUpperCase()} 내려받기
          </button>
        ))}
      </div>
    </div>
  );
}
