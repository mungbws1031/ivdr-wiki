// =====================================================================
// src/lib/stats.ts
// 성능 연구용 이항 통계 — 정확(Clopper-Pearson) 신뢰하한과 표본수 역산.
// 순수 함수 (DOM 의존 금지).
// =====================================================================

function logGamma(z: number): number {
  // Lanczos 근사 (g=7, n=9)
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < 9; i++) x += c[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function logChoose(n: number, k: number): number {
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

/** P(X ≥ x), X ~ Binomial(n, p) */
export function binomUpperTail(x: number, n: number, p: number): number {
  if (x <= 0) return 1;
  if (x > n) return 0;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let s = 0;
  for (let k = x; k <= n; k++) s += Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  return Math.min(1, s);
}

/**
 * 정확(Clopper-Pearson) 단측 신뢰하한. x/n 관측 시 conf(예: 0.95) 수준의 하한.
 * 양측 95% 구간의 하한이 필요하면 conf = 0.975 를 넘긴다.
 */
export function clopperPearsonLower(x: number, n: number, conf = 0.95): number {
  if (x <= 0) return 0;
  const alpha = 1 - conf;
  if (x === n) return Math.pow(alpha, 1 / n);
  let lo = 0, hi = x / n;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (binomUpperTail(x, n, mid) < alpha) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Wilson 점수 구간 (양측). */
export function wilsonInterval(x: number, n: number, z = 1.959964): [number, number] {
  if (n === 0) return [0, 1];
  const p = x / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const h = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - h) / d, (c + h) / d];
}

const nCache = new Map<string, number | null>();

/**
 * 허용 실패(오판정) 수가 f일 때, 관측 하한이 target 이상이 되는 최소 표본수.
 * 예: target 0.95, conf 0.95, f=0 → 59. 범위를 넘으면 null.
 */
export function minNForLowerBound(target: number, conf = 0.95, allowedFailures = 0, maxN = 5000): number | null {
  if (!(target > 0 && target < 1)) return null;
  const key = `${target}|${conf}|${allowedFailures}|${maxN}`;
  if (nCache.has(key)) return nCache.get(key)!;
  let found: number | null = null;
  for (let n = allowedFailures + 1; n <= maxN; n++) {
    if (clopperPearsonLower(n - allowedFailures, n, conf) >= target) { found = n; break; }
  }
  nCache.set(key, found);
  return found;
}
