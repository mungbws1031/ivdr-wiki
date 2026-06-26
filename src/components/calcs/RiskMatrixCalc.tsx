import { useState } from "react";
import { ShieldAlert } from "lucide-react";

const PROB_LABELS = [
  "P1 — 거의 불가능 (< 1/100,000)",
  "P2 — 극히 희박 (1/10,000)",
  "P3 — 가능 (1/1,000)",
  "P4 — 상당히 가능 (1/100)",
  "P5 — 빈번 (> 1/10)",
];

const SEV_LABELS = [
  "S1 — 무시 가능 (불편함)",
  "S2 — 경미 (가역적 손상)",
  "S3 — 중증 (비가역적 손상)",
  "S4 — 치명 (생명 위협)",
  "S5 — 사망",
];

type Level = 1 | 2 | 3 | 4 | 5;

function getRiskLevel(p: Level, s: Level): "acceptable" | "alarp" | "unacceptable" {
  const score = p * s;
  if (score <= 3) return "acceptable";
  if (score <= 12) return "alarp";
  return "unacceptable";
}

const RISK_CONFIG = {
  acceptable: { label: "수용 가능", color: "var(--success)", bg: "var(--success-bg)" },
  alarp: { label: "ALARP (합리적 감소 필요)", color: "var(--warning)", bg: "var(--warning-bg)" },
  unacceptable: { label: "수용 불가 (필수 통제)", color: "var(--danger)", bg: "var(--danger-bg)" },
};

export function RiskMatrixCalc() {
  const [prob, setProb] = useState<Level>(2);
  const [sev, setSev] = useState<Level>(3);

  const risk = getRiskLevel(prob, sev);
  const cfg = RISK_CONFIG[risk];

  const selectStyle = {
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "6px 10px",
    fontSize: "var(--t-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    width: "100%",
  };

  return (
    <div
      className="rounded-[var(--r-lg)]"
      style={{ border: "1px solid var(--border)", padding: "var(--s-5)", marginTop: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <ShieldAlert size={20} style={{ color: "var(--danger)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
          ISO 14971 위험 점수 계산기
        </h3>
        <span
          className="rounded-full font-bold"
          style={{ background: "var(--danger-bg)", color: "var(--danger)", fontSize: "var(--t-xs)", padding: "2px 10px" }}
        >
          ISO 14971:2019
        </span>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "var(--s-5)" }}>
        <div>
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", display: "block", marginBottom: "var(--s-1)" }}>
            발생 가능성 (P)
          </label>
          <select
            value={prob}
            onChange={(e) => setProb(parseInt(e.target.value, 10) as Level)}
            style={selectStyle}
          >
            {PROB_LABELS.map((l, i) => <option key={i} value={i + 1}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", display: "block", marginBottom: "var(--s-1)" }}>
            심각도 (S)
          </label>
          <select
            value={sev}
            onChange={(e) => setSev(parseInt(e.target.value, 10) as Level)}
            style={selectStyle}
          >
            {SEV_LABELS.map((l, i) => <option key={i} value={i + 1}>{l}</option>)}
          </select>
        </div>
      </div>

      <div
        className="rounded-[var(--r-md)] text-center"
        style={{ background: cfg.bg, border: `2px solid ${cfg.color}`, padding: "var(--s-5)", marginBottom: "var(--s-4)" }}
      >
        <div className="font-extrabold" style={{ fontSize: "var(--t-3xl)", color: cfg.color }}>
          {prob} × {sev} = {prob * sev}
        </div>
        <div className="font-bold" style={{ fontSize: "var(--t-xl)", color: cfg.color, marginTop: "var(--s-2)" }}>
          {cfg.label}
        </div>
        <div className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: "var(--s-1)" }}>
          위험 점수 (P × S)
        </div>
      </div>

      <p className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>
        위험 수용 기준 행렬 (P × S)
      </p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: "var(--t-xs)" }}>
          <thead>
            <tr>
              <th style={{ padding: "4px 8px", border: "1px solid var(--border)", background: "var(--surface)" }}>P↓ / S→</th>
              {[1, 2, 3, 4, 5].map((s) => (
                <th key={s} style={{ padding: "4px 8px", border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-mono)" }}>S{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([1, 2, 3, 4, 5] as Level[]).map((p) => (
              <tr key={p}>
                <td style={{ padding: "4px 8px", border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>P{p}</td>
                {([1, 2, 3, 4, 5] as Level[]).map((s) => {
                  const r = getRiskLevel(p, s);
                  const isSelected = p === prob && s === sev;
                  return (
                    <td
                      key={s}
                      style={{
                        padding: "4px 8px",
                        border: isSelected ? `2px solid ${RISK_CONFIG[r].color}` : "1px solid var(--border)",
                        background: RISK_CONFIG[r].bg,
                        color: RISK_CONFIG[r].color,
                        fontWeight: isSelected ? 900 : 600,
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {p * s}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-2)" }}>
        녹색(≤3): 수용 가능 · 노란색(4~12): ALARP · 빨간색(≥15): 수용 불가
      </p>
    </div>
  );
}
