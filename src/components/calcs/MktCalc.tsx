import { useState } from "react";
import { Thermometer } from "lucide-react";

// 평균 동력학적 온도(MKT) — 운송/보관 온도 로그의 '실효 온도'.
// Tmkt(K) = (ΔH/R) / ( -ln[ (Σ e^(-ΔH/(R·Ti)) ) / n ] )
const R = 8.314; // J/(mol·K)

export function MktCalc() {
  const [raw, setRaw] = useState("");
  const [deltaHk, setDeltaHk] = useState("83.144"); // kJ/mol (USP 관용 기본값)
  const [labelMax, setLabelMax] = useState("8"); // 라벨 보관 상한 °C
  const [labelMin, setLabelMin] = useState("2"); // 라벨 보관 하한 °C

  // 쉼표·공백·줄바꿈·세미콜론으로 구분된 온도값 파싱
  const temps = raw
    .split(/[\s,;]+/)
    .map((s) => parseFloat(s))
    .filter((v) => !isNaN(v));

  const n = temps.length;
  const dH = parseFloat(deltaHk) * 1000; // J/mol

  let mkt: number | null = null;
  let mean: number | null = null;
  if (n > 0 && dH > 0) {
    mean = temps.reduce((a, b) => a + b, 0) / n;
    const sumExp = temps.reduce((acc, t) => acc + Math.exp(-dH / (R * (t + 273.15))), 0);
    const mktK = dH / R / -Math.log(sumExp / n);
    mkt = mktK - 273.15;
  }

  const min = n > 0 ? Math.min(...temps) : null;
  const max = n > 0 ? Math.max(...temps) : null;

  const hi = parseFloat(labelMax);
  const lo = parseFloat(labelMin);
  const hasRange = !isNaN(hi);
  // 판정: MKT가 라벨 범위 이내인가
  const mktPass =
    mkt !== null && hasRange && mkt <= hi && (isNaN(lo) || mkt >= lo);
  // 개별 이탈 건수 (라벨 범위를 벗어난 측정점)
  const excursions =
    hasRange && n > 0
      ? temps.filter((t) => t > hi || (!isNaN(lo) && t < lo)).length
      : 0;

  return (
    <div
      className="rounded-[var(--r-lg)] border"
      style={{ borderColor: "var(--border)", padding: "var(--s-5)", marginTop: "var(--s-6)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <Thermometer size={20} style={{ color: "var(--info)" }} aria-hidden />
        <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
          MKT 계산기 (평균 동력학적 온도)
        </h3>
      </div>

      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)", lineHeight: "var(--lh-base)" }}>
        운송·보관 중 기록한 온도(°C)를 붙여넣으면 실효 온도(MKT)를 산출해 라벨 보관조건 충족 여부를 판정합니다.
        단순 평균보다 고온 이탈에 더 민감합니다.
      </p>

      {/* 온도 로그 입력 */}
      <label className="block font-semibold text-text" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-2)" }}>
        온도 측정값 (°C) — 쉼표·공백·줄바꿈으로 구분
      </label>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="예: 5.2, 6.1, 4.8, 9.5, 7.0, 3.9, 12.4, 6.6"
        rows={3}
        className="w-full rounded-[var(--r-sm)] border bg-bg text-text outline-none resize-y"
        style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "8px 10px", lineHeight: "1.6", marginBottom: "var(--s-4)" }}
      />

      {/* 파라미터 */}
      <div className="flex flex-wrap gap-4" style={{ marginBottom: "var(--s-5)" }}>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>활성화 에너지 ΔH</label>
          <input
            type="number" min={0} step="0.1"
            value={deltaHk}
            onChange={(e) => setDeltaHk(e.target.value)}
            className="rounded-[var(--r-sm)] border bg-bg text-text"
            style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "6px 10px", width: 90 }}
          />
          <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>kJ/mol</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>라벨 보관</label>
          <input
            type="number" step="0.5"
            value={labelMin}
            onChange={(e) => setLabelMin(e.target.value)}
            className="rounded-[var(--r-sm)] border bg-bg text-text"
            style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "6px 10px", width: 64 }}
          />
          <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>~</span>
          <input
            type="number" step="0.5"
            value={labelMax}
            onChange={(e) => setLabelMax(e.target.value)}
            className="rounded-[var(--r-sm)] border bg-bg text-text"
            style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "6px 10px", width: 64 }}
          />
          <span className="text-text-subtle" style={{ fontSize: "var(--t-xs)" }}>°C</span>
        </div>
      </div>

      {/* 결과 */}
      {mkt !== null ? (
        <>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", marginBottom: "var(--s-4)" }}>
            {[
              { label: "측정 수 (n)", value: `${n}개` },
              { label: "산술 평균", value: `${mean!.toFixed(1)}°C` },
              { label: "최저 / 최고", value: `${min!.toFixed(1)} / ${max!.toFixed(1)}°C` },
              { label: "이탈 측정점", value: `${excursions}개` },
            ].map((s) => (
              <div key={s.label} className="rounded-[var(--r-md)]" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "10px 12px" }}>
                <div className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginBottom: 2 }}>{s.label}</div>
                <div className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* MKT 결론 */}
          <div
            className="rounded-[var(--r-md)]"
            style={{
              background: hasRange ? (mktPass ? "var(--success-bg)" : "var(--danger-bg)") : "var(--info-bg)",
              borderLeft: `4px solid ${hasRange ? (mktPass ? "var(--success)" : "var(--danger)") : "var(--info)"}`,
              padding: "var(--s-4)",
            }}
          >
            <p className="font-extrabold" style={{ color: hasRange ? (mktPass ? "var(--success)" : "var(--danger)") : "var(--info)", fontSize: "var(--t-lg)" }}>
              MKT = {mkt.toFixed(2)}°C
            </p>
            {hasRange && (
              <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4, lineHeight: "var(--lh-base)" }}>
                {mktPass
                  ? `라벨 보관조건(${labelMin}~${labelMax}°C) 충족 — 실효 온도가 범위 이내입니다.`
                  : `라벨 보관조건(${labelMin}~${labelMax}°C) 이탈 — MKT가 범위를 벗어났습니다. 시약 안정성 재평가가 필요합니다.`}
                {excursions > 0 && ` 개별 이탈 측정점 ${excursions}개는 별도로 안정성 영향(허용 이탈 시간/누적)을 평가하세요.`}
              </p>
            )}
          </div>

          <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)", lineHeight: "var(--lh-base)" }}>
            * MKT는 Haynes 식 기반(ΔH 기본 83.144 kJ/mol). 측정 간격이 균등하다고 가정합니다. MKT 충족과 별개로 개별 온도 이탈은
            안정성 데이터(허용 이탈 조건)로 별도 판정해야 합니다.
          </p>
        </>
      ) : (
        <p className="text-text-subtle" style={{ fontSize: "var(--t-sm)" }}>
          온도 측정값을 입력하면 MKT가 계산됩니다.
        </p>
      )}
    </div>
  );
}
