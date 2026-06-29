import { useState } from "react";
import { FlaskConical } from "lucide-react";

interface Row {
  conc: string;
  total: string;
  positive: string;
}

export function LodCalc() {
  const [rows, setRows] = useState<Row[]>([
    { conc: "", total: "20", positive: "" },
    { conc: "", total: "20", positive: "" },
    { conc: "", total: "20", positive: "" },
    { conc: "", total: "20", positive: "" },
    { conc: "", total: "20", positive: "" },
  ]);
  const [unit, setUnit] = useState("copies/mL");

  const updateRow = (i: number, field: keyof Row, value: string) => {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows((prev) => [...prev, { conc: "", total: "20", positive: "" }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const parsedRows = rows
    .map((r) => ({
      conc: parseFloat(r.conc),
      total: parseInt(r.total),
      positive: parseInt(r.positive),
    }))
    .filter((r) => !isNaN(r.conc) && !isNaN(r.total) && !isNaN(r.positive) && r.total > 0);

  const results = parsedRows.map((r) => ({
    ...r,
    rate: r.total > 0 ? (r.positive / r.total) * 100 : 0,
  }));

  // LoD: 가장 낮은 농도에서 ≥95% 검출율 달성 지점 (단순 임계값 방법)
  const sorted = [...results].sort((a, b) => a.conc - b.conc);
  const lod95 = sorted.find((r) => r.rate >= 95);
  const allBelow = sorted.length > 0 && sorted.every((r) => r.rate < 95);
  const allAbove = sorted.length > 0 && sorted.every((r) => r.rate >= 95);

  return (
    <div
      className="rounded-[var(--r-lg)] border"
      style={{ borderColor: "var(--border)", padding: "var(--s-5)", marginTop: "var(--s-6)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <FlaskConical size={20} style={{ color: "var(--p3)" }} aria-hidden />
        <h3 className="font-extrabold text-text" style={{ fontSize: "var(--t-lg)" }}>
          LoD 계산기 (≥95% 검출율)
        </h3>
      </div>

      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-4)", lineHeight: "var(--lh-base)" }}>
        각 농도별 총 검체 수와 양성 건수를 입력하면 ≥95% 검출율을 보이는 최저 농도(LoD)를 산출합니다.
      </p>

      {/* 단위 */}
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <label className="font-semibold text-text" style={{ fontSize: "var(--t-sm)", minWidth: 60 }}>단위</label>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-[var(--r-sm)] border bg-bg text-text"
          style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "6px 10px", width: 160 }}
        />
      </div>

      {/* 입력 테이블 */}
      <div className="overflow-x-auto" style={{ marginBottom: "var(--s-4)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--t-sm)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left font-bold text-text-muted" style={{ padding: "6px 8px" }}>농도 ({unit})</th>
              <th className="text-left font-bold text-text-muted" style={{ padding: "6px 8px" }}>총 검체 수</th>
              <th className="text-left font-bold text-text-muted" style={{ padding: "6px 8px" }}>양성 건수</th>
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                {(["conc", "total", "positive"] as const).map((field) => (
                  <td key={field} style={{ padding: "4px 8px" }}>
                    <input
                      type="number"
                      min={0}
                      value={r[field]}
                      onChange={(e) => updateRow(i, field, e.target.value)}
                      className="w-full rounded-[var(--r-sm)] border bg-bg text-text"
                      style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "5px 8px" }}
                    />
                  </td>
                ))}
                <td style={{ padding: "4px 4px" }}>
                  {rows.length > 2 && (
                    <button
                      onClick={() => removeRow(i)}
                      className="text-text-subtle hover:text-text"
                      style={{ fontSize: "var(--t-xs)", padding: "4px 6px" }}
                      aria-label="행 삭제"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="rounded-[var(--r-sm)] border font-semibold text-text hover:bg-surface"
        style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-sm)", padding: "6px 12px", marginBottom: "var(--s-5)" }}
      >
        + 농도 추가
      </button>

      {/* 결과 */}
      {results.length > 0 && (
        <>
          <div
            className="rounded-[var(--r-md)]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "var(--s-4)" }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--t-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <th className="text-left font-bold text-text" style={{ padding: "8px 12px" }}>농도 ({unit})</th>
                  <th className="text-left font-bold text-text" style={{ padding: "8px 12px" }}>양성 / 총수</th>
                  <th className="text-left font-bold text-text" style={{ padding: "8px 12px" }}>검출율</th>
                  <th className="text-left font-bold text-text" style={{ padding: "8px 12px" }}>판정</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => {
                  const pass = r.rate >= 95;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: pass ? "var(--success-bg)" : "transparent" }}>
                      <td style={{ padding: "7px 12px" }}>{r.conc}</td>
                      <td style={{ padding: "7px 12px" }}>{r.positive} / {r.total}</td>
                      <td style={{ padding: "7px 12px" }}>{r.rate.toFixed(1)}%</td>
                      <td style={{ padding: "7px 12px" }}>
                        <span style={{ color: pass ? "var(--success)" : "var(--text-subtle)", fontWeight: 600 }}>
                          {pass ? "✓ ≥95%" : "✕"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* LoD 결론 */}
          <div
            className="rounded-[var(--r-md)]"
            style={{
              background: lod95 ? "var(--success-bg)" : "var(--warning-bg)",
              borderLeft: `4px solid ${lod95 ? "var(--success)" : "var(--warning)"}`,
              padding: "var(--s-4)",
            }}
          >
            {lod95 ? (
              <>
                <p className="font-extrabold" style={{ color: "var(--success)", fontSize: "var(--t-lg)" }}>
                  LoD = {lod95.conc} {unit}
                </p>
                <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginTop: 4 }}>
                  이 농도에서 {lod95.rate.toFixed(1)}% 검출율(≥95% 기준 충족)
                </p>
              </>
            ) : allBelow ? (
              <p className="font-bold" style={{ color: "var(--warning)", fontSize: "var(--t-base)" }}>
                모든 농도에서 95% 미만 — 더 높은 농도 데이터가 필요합니다
              </p>
            ) : allAbove ? (
              <p className="font-bold" style={{ color: "var(--success)", fontSize: "var(--t-base)" }}>
                모든 농도에서 ≥95% — 더 낮은 농도에서 LoD를 재탐색할 수 있습니다
              </p>
            ) : (
              <p className="font-bold text-text" style={{ fontSize: "var(--t-base)" }}>
                농도를 오름차순으로 입력하면 LoD를 산출합니다
              </p>
            )}
          </div>

          <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)", lineHeight: "var(--lh-base)" }}>
            * 단순 임계값 방법(Threshold method). 공식 LoD 산출은 CLSI EP17 프로빗 분석을 권장합니다.
          </p>
        </>
      )}
    </div>
  );
}
