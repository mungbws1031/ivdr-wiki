import { useState } from "react";
import { Sigma } from "lucide-react";

function minSamples(p: number, confidence: number, allowance: number): number {
  const z = confidence === 0.99 ? 2.576 : confidence === 0.95 ? 1.96 : 1.645;
  return Math.ceil((z * z * p * (1 - p)) / (allowance * allowance));
}

export function SampleSizeCalc() {
  const [se, setSe] = useState(0.90);
  const [sp, setSp] = useState(0.95);
  const [confidence, setConfidence] = useState(0.95);
  const [allowance, setAllowance] = useState(0.05);

  const nPos = minSamples(se, confidence, allowance);
  const nNeg = minSamples(sp, confidence, allowance);
  const nTotal = nPos + nNeg;

  const baseInput = {
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "4px 8px",
    fontSize: "var(--t-sm)",
    background: "var(--bg)",
    color: "var(--text)",
    width: "90px",
  };

  return (
    <div
      className="rounded-[var(--r-lg)]"
      style={{ border: "1px solid var(--border)", padding: "var(--s-5)", marginTop: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-3)" }}>
        <Sigma size={20} style={{ color: "var(--p4)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
          임상 최소 검체수 계산기
        </h3>
        <span
          className="rounded-full font-bold"
          style={{ background: "var(--p4-tint)", color: "var(--p4)", fontSize: "var(--t-xs)", padding: "2px 10px" }}
        >
          IVDR Annex XIII · MDCG 2025-5
        </span>
      </div>

      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)" }}>
        목표 민감도·특이도 달성을 위한 최소 검체수 (Wilson 근사: n = z²α × p(1−p) / d²)
      </p>

      <div className="flex flex-wrap gap-5" style={{ marginBottom: "var(--s-5)" }}>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>목표 민감도 (Se)</label>
          <div className="flex items-center gap-1">
            <input
              type="number" min={50} max={99} step={1}
              value={Math.round(se * 100)}
              onChange={(e) => setSe(Math.min(0.99, Math.max(0.5, parseInt(e.target.value, 10) / 100)))}
              style={baseInput}
            />
            <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>목표 특이도 (Sp)</label>
          <div className="flex items-center gap-1">
            <input
              type="number" min={50} max={99} step={1}
              value={Math.round(sp * 100)}
              onChange={(e) => setSp(Math.min(0.99, Math.max(0.5, parseInt(e.target.value, 10) / 100)))}
              style={baseInput}
            />
            <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>신뢰 수준</label>
          <select
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            style={{ ...baseInput, width: "100px" }}
          >
            <option value={0.90}>90%</option>
            <option value={0.95}>95%</option>
            <option value={0.99}>99%</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>허용 오차 (d)</label>
          <div className="flex items-center gap-1">
            <input
              type="number" min={1} max={20} step={1}
              value={Math.round(allowance * 100)}
              onChange={(e) => setAllowance(Math.min(0.2, Math.max(0.01, parseInt(e.target.value, 10) / 100)))}
              style={baseInput}
            />
            <span className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div
          className="rounded-[var(--r-md)] text-center"
          style={{ background: "var(--success-bg)", border: "1px solid var(--success)", padding: "var(--s-4)" }}
        >
          <div className="font-extrabold" style={{ fontSize: "var(--t-2xl)", color: "var(--success)" }}>{nPos}</div>
          <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>최소 양성 검체</div>
          <div className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>질환 확인 (참양성)</div>
        </div>
        <div
          className="rounded-[var(--r-md)] text-center"
          style={{ background: "var(--info-bg)", border: "1px solid var(--info)", padding: "var(--s-4)" }}
        >
          <div className="font-extrabold" style={{ fontSize: "var(--t-2xl)", color: "var(--info)" }}>{nNeg}</div>
          <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>최소 음성 검체</div>
          <div className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>질환 없음 (참음성)</div>
        </div>
        <div
          className="rounded-[var(--r-md)] text-center"
          style={{ background: "var(--surface)", border: "2px solid var(--border-strong)", padding: "var(--s-4)" }}
        >
          <div className="font-extrabold" style={{ fontSize: "var(--t-2xl)", color: "var(--text)" }}>{nTotal}</div>
          <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>최소 총 검체수</div>
          <div className="text-text-muted" style={{ fontSize: "var(--t-xs)" }}>양성 + 음성</div>
        </div>
      </div>

      <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)" }}>
        ※ 탈락율·계층화 보정을 추가로 고려하세요. Class C·D는 IVDR Annex XIII 2.2 임상적 성능 연구 요건 및 MDCG 2025-5를 확인하세요.
      </p>
    </div>
  );
}
