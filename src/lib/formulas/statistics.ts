/**
 * @file statistics.ts
 * @description Implementations for statistical analysis formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Basic Descriptive Statistics
// ─────────────────────────────────────────────────────────────────────────────

export function mean(arr: number[]): number {
  if (arr.length === 0) throw new Error('Empty array');
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

export function median(arr: number[]): number {
  if (arr.length === 0) throw new Error('Empty array');
  const sorted = [...arr].sort((a, b) => a - b); // non-mutating sort
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function mode(arr: number[]): number[] {
  if (arr.length === 0) throw new Error('Empty array');
  const counts = new Map<number, number>();
  let maxFreq = 0;

  for (const val of arr) {
    const count = (counts.get(val) || 0) + 1;
    counts.set(val, count);
    if (count > maxFreq) maxFreq = count;
  }

  const modes: number[] = [];
  for (const [val, count] of counts.entries()) {
    if (count === maxFreq) modes.push(val);
  }
  return modes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variance and Standard Deviation
// ─────────────────────────────────────────────────────────────────────────────

type StatType = 'population' | 'sample';

export function variance(arr: number[], type: StatType = 'sample'): number {
  if (arr.length === 0) throw new Error('Empty array');
  if (type === 'sample' && arr.length === 1) throw new Error('Sample variance requires n > 1');

  const m = mean(arr);
  const sumSquares = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0);
  const n = type === 'sample' ? arr.length - 1 : arr.length;

  return sumSquares / n;
}

export function standardDeviation(arr: number[], type: StatType = 'sample'): number {
  return Math.sqrt(variance(arr, type));
}

// ─────────────────────────────────────────────────────────────────────────────
// Normal Distribution
// ─────────────────────────────────────────────────────────────────────────────

export function normalPdf(x: number, m: number, stdDev: number): number {
  if (stdDev <= 0) throw new Error('Standard deviation must be positive');
  const coeff = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - m, 2) / (2 * stdDev * stdDev);
  return coeff * Math.exp(exponent);
}

// Normal CDF approximation (using Error Function approximation)
export function normalCdf(x: number, m: number, stdDev: number): number {
  if (stdDev <= 0) throw new Error('Standard deviation must be positive');
  const z = (x - m) / stdDev;
  // Approximating the error function (erf)
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.sqrt(2);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + 0.3275911 * absZ);
  const y =
    1.0 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-absZ * absZ);
  const erf = sign * y;

  return 0.5 * (1.0 + erf);
}

// ─────────────────────────────────────────────────────────────────────────────
// Z-Score
// ─────────────────────────────────────────────────────────────────────────────

interface ZScoreParams {
  x: number;
  mean: number;
  stdDev: number;
}

export function zScore({ x, mean, stdDev }: ZScoreParams): number {
  if (stdDev === 0) throw new Error('Standard deviation cannot be zero');
  return (x - mean) / stdDev;
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence Interval (Known σ)
// ─────────────────────────────────────────────────────────────────────────────

interface ConfidenceIntervalParams {
  mean: number;
  stdDev: number;
  n: number;
  confidence: number;
}

function probit(p: number): number {
  // Inverse normal approximation (Beasley-Springer-Moro)
  let a1 = 2.50662823884,
    a2 = -18.61500062529,
    a3 = 41.39119773534,
    a4 = -25.44106049637;
  let b1 = -8.4735109309,
    b2 = 23.08336743743,
    b3 = -21.06224101826,
    b4 = 3.13082909833;
  let c1 = 0.3374754822726147,
    c2 = 0.9761690190917186,
    c3 = 0.1607979714918209;
  let c4 = 0.0276438810333863,
    c5 = 0.0038405729373609,
    c6 = 0.0003951896511919;
  let c7 = 0.0000321767881768,
    c8 = 0.0000002888167364,
    c9 = 0.0000003960315187;

  let y = p - 0.5;
  if (Math.abs(y) < 0.42) {
    let r = y * y;
    return (
      (y * (((a4 * r + a3) * r + a2) * r + a1)) / ((((b4 * r + b3) * r + b2) * r + b1) * r + 1)
    );
  } else {
    let r = p;
    if (y > 0) r = 1 - p;
    r = Math.log(-Math.log(r));
    y = c1 + r * (c2 + r * (c3 + r * (c4 + r * (c5 + r * (c6 + r * (c7 + r * (c8 + r * c9)))))));
    return p < 0.5 ? -y : y;
  }
}

export function confidenceInterval({ mean, stdDev, n, confidence }: ConfidenceIntervalParams) {
  if (n < 1) throw new Error('Sample size n must be >= 1');
  if (confidence <= 0 || confidence >= 1) throw new Error('Confidence must be between 0 and 1');

  // z-score for two-tailed interval
  const alpha = 1 - confidence;
  const zStar = Math.abs(probit(1 - alpha / 2));

  const marginOfError = zStar * (stdDev / Math.sqrt(n));

  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    marginOfError,
  };
}
// ─────────────────────────────────────────────────────────────────────────────
// Discrete Distributions
// ─────────────────────────────────────────────────────────────────────────────

export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
}

export function binomialPdf(k: number, n: number, p: number): number {
  if (k < 0 || k > n || p < 0 || p > 1) return 0;
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function poissonPdf(k: number, lambda: number): number {
  if (k < 0 || lambda <= 0) return 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}
// ─────────────────────────────────────────────────────────────────────────────
// Visualization Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function generateHistogram(data: number[], binCount: number = 10): { binLabel: string; count: number }[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  // If all values are the same, just one bin
  if (range === 0) {
    return [{ binLabel: `${min.toFixed(1)}`, count: data.length }];
  }

  const binSize = range / binCount;
  const bins = new Array(binCount).fill(0);
  
  for (const val of data) {
    let binIndex = Math.floor((val - min) / binSize);
    if (binIndex >= binCount) binIndex = binCount - 1; 
    bins[binIndex]++;
  }
  
  return bins.map((count, i) => {
    const start = min + i * binSize;
    const end = start + binSize;
    return {
      binLabel: `${start.toFixed(1)}-${end.toFixed(1)}`,
      count
    };
  });
}
