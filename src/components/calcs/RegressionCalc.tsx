import { useMemo, useState } from "react";
import { TrendingUp, Plus, Trash2 } from "lucide-react";

interface Pair {
  x: number; // 기존(참조) 검사법 결과
  y: number; // 신규(평가 대상) 검사법 결과
}

const DEFAULT_PAIRS: Pair[] = [
  { x: 10, y: 10.5 },
  { x: 25, y: 24.8 },
  { x: 40, y: 41.2 },
  { x: 55, y: 54.6 },
  { x: 70, y: 71.3 },
  { x: 85, y: 84.9 },
];

/**
 * Deming 회귀 — 두 측정법 모두 오차가 있다고 보는 방법비교 표준 분석(CLSI EP09).
 * lambda = 오차분산비(Var(y-error)/Var(x-error)); 보통 반복 측정 분산이 비슷하면 1로 둔다.
 */
function demingRegression(pairs: Pair[], lambda = 1) {
  const n = pairs.length;
  if (n < 2) return null;
  const mx = pairs.reduce((s, p) => s + p.x, 0) / n;
  const my = pairs.reduce((s, p) => s + p.y, 0) / n;
  const sxx = pairs.reduce((s, p) => s + (p.x - mx) ** 2, 0) / (n - 1);
  const syy = pairs.reduce((s, p) => s + (p.y - my) ** 2, 0) / (n - 1);
  const sxy = pairs.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / (n - 1);

  if (sxy === 0) return null;
  const slope = (syy - lambda * sxx + Math.sqrt((syy - lambda * sxx) ** 2 + 4 * lambda * sxy * sxy)) / (2 * sxy);
  const intercept = my - slope * mx;

  // Pearson 상관계수 r
  const r = sxy / Math.sqrt(sxx * syy);

  // 잔차(수직 거리 아님 — Deming은 수직·수평 혼합이라 참고용으로 y-예측값 차이만 표시)
  const residuals = pairs.map((p) => p.y - (slope * p.x + intercept));
  const maxAbsResidual = Math.max(...residuals.map(Math.abs));

  return { slope, intercept, r, n, residuals, maxAbsResidual };
}

const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : "—");

export function RegressionCalc() {
  const [pairs, setPairs] = useState<Pair[]>(DEFAULT_PAIRS);

  const result = useMemo(() => demingRegression(pairs), [pairs]);

  function update(i: number, field: keyof Pair, raw: string) {
    const v = raw === "" ? 0 : Number(raw);
    setPairs((ps) => ps.map((p, idx) => (idx === i ? { ...p, [field]: Number.isFinite(v) ? v : p[field] } : p)));
  }

  function addRow() {
    setPairs((ps) => [...ps, { x: 0, y: 0 }]);
  }

  function removeRow(i: number) {
    setPairs((ps) => (ps.length > 2 ? ps.filter((_, idx) => idx !== i) : ps));
  }

  const inputStyle = {
    width: "90px",
    textAlign: "center" as const,
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "4px 8px",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--t-sm)",
    background: "var(--bg)",
    color: "var(--text)",
  };

  // CLSI EP09 식 가이드: 기울기 0.9~1.1, 절편이 임상적으로 무의미한 수준, r≥0.975 권장
  const slopeOk = result ? result.slope >= 0.9 && result.slope <= 1.1 : null;
  const rOk = result ? result.r >= 0.975 : null;

  return (
    <div
      className="rounded-[var(--r-lg)]"
      style={{ border: "1px solid var(--border)", padding: "var(--s-5)", marginTop: "var(--s-4)" }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: "var(--s-4)" }}>
        <TrendingUp size={20} style={{ color: "var(--p3)" }} aria-hidden />
        <h3 className="font-bold text-text" style={{ fontSize: "var(--t-lg)" }}>
          방법비교 회귀분석 (Deming)
        </h3>
        <span
          className="rounded-full font-bold"
          style={{ background: "var(--p3-tint)", color: "var(--p3)", fontSize: "var(--t-xs)", padding: "2px 10px" }}
        >
          CLSI EP09
        </span>
      </div>

      <p className="text-text-muted" style={{ fontSize: "var(--t-sm)", marginBottom: "var(--s-3)" }}>
        기존(참조) 검사법 결과(X)와 우리 제품 결과(Y)를 짝지어 입력하세요. 최소 2쌍 필요하며, 실제 검증에는 보통
        40쌍 이상을 씁니다.
      </p>

      <table style={{ borderCollapse: "collapse", marginBottom: "var(--s-3)" }}>
        <thead>
          <tr>
            <th style={{ padding: "4px 8px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>#</th>
            <th style={{ padding: "4px 8px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>X (기존법)</th>
            <th style={{ padding: "4px 8px", fontSize: "var(--t-xs)", color: "var(--text-muted)" }}>Y (우리 제품)</th>
            <th style={{ padding: "4px 8px" }}></th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p, i) => (
            <tr key={i}>
              <td style={{ padding: "4px 8px", fontSize: "var(--t-xs)", color: "var(--text-subtle)" }}>{i + 1}</td>
              <td style={{ padding: "4px 8px" }}>
                <input type="number" value={p.x} onChange={(e) => update(i, "x", e.target.value)} style={inputStyle} />
              </td>
              <td style={{ padding: "4px 8px" }}>
                <input type="number" value={p.y} onChange={(e) => update(i, "y", e.target.value)} style={inputStyle} />
              </td>
              <td style={{ padding: "4px 8px" }}>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={pairs.length <= 2}
                  aria-label={`${i + 1}번 행 삭제`}
                  className="rounded-[var(--r-sm)] disabled:opacity-30"
                  style={{ padding: 4, color: "var(--danger)" }}
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1 rounded-[var(--r-sm)] border font-semibold text-text hover:bg-bg"
        style={{ borderColor: "var(--border-strong)", fontSize: "var(--t-xs)", padding: "5px 10px", marginBottom: "var(--s-4)" }}
      >
        <Plus size={13} aria-hidden />
        쌍 추가
      </button>

      {result ? (
        <>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
            <div
              className="rounded-[var(--r-md)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--s-3)" }}
            >
              <div className="font-bold" style={{ fontSize: "var(--t-xl)", color: slopeOk ? "var(--success)" : "var(--warning)" }}>
                {fmt(result.slope)}
              </div>
              <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>기울기 (slope)</div>
              <div className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>권장 0.9 ~ 1.1</div>
            </div>
            <div
              className="rounded-[var(--r-md)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--s-3)" }}
            >
              <div className="font-bold" style={{ fontSize: "var(--t-xl)", color: "var(--text)" }}>{fmt(result.intercept)}</div>
              <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>절편 (intercept)</div>
              <div className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>임상적으로 무의미한 수준이어야 함</div>
            </div>
            <div
              className="rounded-[var(--r-md)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--s-3)" }}
            >
              <div className="font-bold" style={{ fontSize: "var(--t-xl)", color: rOk ? "var(--success)" : "var(--warning)" }}>
                {fmt(result.r)}
              </div>
              <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>상관계수 (r)</div>
              <div className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>권장 ≥ 0.975</div>
            </div>
            <div
              className="rounded-[var(--r-md)]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "var(--s-3)" }}
            >
              <div className="font-bold" style={{ fontSize: "var(--t-xl)", color: "var(--text)" }}>{fmt(result.maxAbsResidual)}</div>
              <div className="font-semibold text-text" style={{ fontSize: "var(--t-sm)" }}>최대 편차</div>
              <div className="text-text-muted" style={{ fontSize: "var(--t-xs)", marginTop: 2 }}>|Y − 예측값| 최댓값, n={result.n}</div>
            </div>
          </div>

          <p className="text-text-subtle" style={{ fontSize: "var(--t-xs)", marginTop: "var(--s-3)" }}>
            ※ 여기서는 오차분산비 λ=1(두 검사법의 반복 측정 오차가 비슷하다고 가정)로 계산합니다. 두 검사법의
            정밀도 차이가 크면 λ를 반복 측정 분산비로 보정해 별도 통계 도구로 재계산하세요. Bland-Altman 플롯도
            함께 제출하는 것을 권장합니다.
          </p>
        </>
      ) : (
        <p className="text-text-muted" style={{ fontSize: "var(--t-sm)" }}>
          데이터를 2쌍 이상 입력하면 자동으로 계산됩니다 (X 값이 모두 같으면 계산할 수 없습니다).
        </p>
      )}
    </div>
  );
}
