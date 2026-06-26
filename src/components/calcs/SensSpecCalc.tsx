import { useState } from "react";
import { FlaskConical } from "lucide-react";

interface Matrix {
  tp: number; fp: number; fn: number; tn: number;
}

function calcMetrics(m: Matrix) {
  const { tp, fp, fn, tn } = m;
  const n = tp + fp + fn + tn;
  const se = n ? tp / (tp + fn) : 0;
  const sp = n ? tn / (tn + fp) : 0;
  const ppv = (tp + fp) ? tp / (tp + fp) : 0;
  const npv = (fn + tn) ? tn / (fn + tn) : 0;
  const acc = n ? (tp + tn) / n : 0;
  const lr_pos = sp < 1 ? se / (1 - sp) : Infinity;
  return { se, sp, ppv, npv, acc, lr_pos, n };
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const ratio = (v: number) => isFinite(v) ? v.toFixed(2) : "∞";

export function SensSpecCalc() {
  const [matrix, setMatrix] = useState<Matrix>({ tp: 90, fp: 5, fn: 10, tn: 95 });

  function update(field: keyof Matrix, raw: string) {
    const v = Math.max(0, parseInt(raw, 10) || 0);
    setMatrix((m) => ({ ...m, [field]: v }));
  }

  const r = calcMetrics(matrix);

  const inputStyle = {
    width: "80px",
    textAlign: "center" as const,
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "4px 8px",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--t-sm)",
    background: "var(--bg)",
    color: "var(--text)",
  };

  const metricCard = (label: string, value: string, color: string, note: string) => (
    <div
      key={label}
      className="rounded-[var(--r-md)]"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--s-3)" }}
    >
      <div className="font-bold" style={{ fontSize: "var(--t-xl)", color }}>{value}</div>
      <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>{label}</div>
      <div className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>{note}</div>
    </div>
  );

  return (
    <div
      className="rounded-[var(--r-lg)]"
      style={{ border: "1px solid var(--border)", padding: "var(--s-5)", marginTop: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <FlaskConical size={20} style={{ color: "var(--p3)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
          민감도·특이도 계산기
        </h3>
        <span
          className="rounded-full font-bold"
          style={{ background: "var(--p3-tint)", color: "var(--p3)", fontSize: "var(--t-xs)", padding: "2px 10px" }}
        >
          IVDR Annex XIII
        </span>
      </div>

      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-3)" }}>
        2×2 혼동행렬 (Confusion Matrix) 입력
      </p>
      <table style={{ borderCollapse: "collapse", marginBottom: "var(--s-4)" }}>
        <thead>
          <tr>
            <th style={{ padding: "6px 12px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}></th>
            <th style={{ padding: "6px 12px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>실제 양성</th>
            <th style={{ padding: "6px 12px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>실제 음성</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "6px 12px", fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--text)" }}>검사 양성</td>
            <td style={{ padding: "6px 12px" }}>
              <div className="flex flex-col items-center gap-1">
                <input type="number" min={0} value={matrix.tp} onChange={(e) => update("tp", e.target.value)} style={inputStyle} />
                <span style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>TP</span>
              </div>
            </td>
            <td style={{ padding: "6px 12px" }}>
              <div className="flex flex-col items-center gap-1">
                <input type="number" min={0} value={matrix.fp} onChange={(e) => update("fp", e.target.value)} style={inputStyle} />
                <span style={{ fontSize: "var(--t-xs)", color: "var(--danger)" }}>FP (위양성)</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "6px 12px", fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--text)" }}>검사 음성</td>
            <td style={{ padding: "6px 12px" }}>
              <div className="flex flex-col items-center gap-1">
                <input type="number" min={0} value={matrix.fn} onChange={(e) => update("fn", e.target.value)} style={inputStyle} />
                <span style={{ fontSize: "var(--t-xs)", color: "var(--danger)" }}>FN (위음성)</span>
              </div>
            </td>
            <td style={{ padding: "6px 12px" }}>
              <div className="flex flex-col items-center gap-1">
                <input type="number" min={0} value={matrix.tn} onChange={(e) => update("tn", e.target.value)} style={inputStyle} />
                <span style={{ fontSize: "var(--t-xs)", color: "var(--success)" }}>TN</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginBottom: "var(--s-3)" }}>
        총 {r.n}명 검사
      </p>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        {metricCard("민감도 (Se)", pct(r.se), "var(--success)", "TP / (TP+FN)")}
        {metricCard("특이도 (Sp)", pct(r.sp), "var(--p4)", "TN / (TN+FP)")}
        {metricCard("양성예측도 (PPV)", pct(r.ppv), "var(--p2)", "TP / (TP+FP)")}
        {metricCard("음성예측도 (NPV)", pct(r.npv), "var(--p3)", "TN / (FN+TN)")}
        {metricCard("정확도", pct(r.acc), "var(--text)", "(TP+TN) / N")}
        {metricCard("양성 LR", ratio(r.lr_pos), "var(--info)", "Se / (1-Sp)")}
      </div>

      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)" }}>
        ※ 실제 PER에는 95% 신뢰구간(Wilson 방법 권장)을 함께 기재해야 합니다. (MDCG 2025-5)
      </p>
    </div>
  );
}
