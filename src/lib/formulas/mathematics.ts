import Big from 'big.js';

/**
 * @file mathematics.ts
 * @description Mathematics formulas and calculus logic
 */

/**
 * Evaluates a mathematical function string at a given x.
 * Supports basic operations and Math functions.
 */
export function evaluateFunction(expr: string, x: number): number {
  try {
    // Replace typical notation with Math.* functions
    let safeExpr = expr
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\^/g, '**')
      .replace(/\b(sin|cos|tan|exp|log|sqrt|abs)\b(?=\()/g, 'Math.$1')
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E');

    // Basic x replacement
    // This is a simple regex that replaces 'x' not preceded or followed by other letters
    safeExpr = safeExpr.replace(/(?<![a-z])x(?![a-z])/g, `(${x})`);

    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${safeExpr}`)();
    return typeof result === 'number' ? result : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Numerical differentiation at point x
 */
export function calculateDerivative(expr: string, x: number, h: number = 1e-7): number {
  const y1 = evaluateFunction(expr, x + h);
  const y2 = evaluateFunction(expr, x - h);

  if (isNaN(y1) || isNaN(y2)) return NaN;

  const f_plus = new Big(y1);
  const f_minus = new Big(y2);
  return f_plus
    .minus(f_minus)
    .div(2 * h)
    .toNumber();
}

/**
 * Numerical integration using Simpson's Rule
 */
export function calculateIntegral(expr: string, a: number, b: number, n: number = 100): number {
  if (n % 2 !== 0) n++; // Simpson's rule requires even number of intervals
  const h = (b - a) / n;
  const hBig = new Big(h);

  const fa = evaluateFunction(expr, a);
  const fb = evaluateFunction(expr, b);

  if (isNaN(fa) || isNaN(fb)) return NaN;

  let sum = new Big(fa).plus(fb);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fxVal = evaluateFunction(expr, x);
    if (isNaN(fxVal)) return NaN;

    const fx = new Big(fxVal);
    sum = sum.plus(i % 2 === 0 ? fx.times(2) : fx.times(4));
  }

  return hBig.div(3).times(sum).toNumber();
}

/**
 * Generates plot points for a function
 */
export function generatePlotPoints(
  expr: string,
  minX: number,
  maxX: number,
  n: number = 100
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const step = (maxX - minX) / n;

  for (let i = 0; i <= n; i++) {
    const x = minX + i * step;
    const y = evaluateFunction(expr, x);
    if (!isNaN(y) && isFinite(y)) {
      points.push({ x, y });
    }
  }

  return points;
}

/**
 * Matrix Types & Operations
 */
export type Matrix = number[][];

export function createEmptyMatrix(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function addMatrices(a: Matrix, b: Matrix): Matrix {
  const rows = a.length;
  const cols = a[0].length;
  const result = createEmptyMatrix(rows, cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = new Big(a[i][j]).plus(b[i][j]).toNumber();
    }
  }
  return result;
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
  const rowsA = a.length;
  const colsA = a[0].length;
  const colsB = b[0].length;
  const result = createEmptyMatrix(rowsA, colsB);
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = new Big(0);
      for (let k = 0; k < colsA; k++) {
        sum = sum.plus(new Big(a[i][k]).times(b[k][j]));
      }
      result[i][j] = sum.toNumber();
    }
  }
  return result;
}

export function transposeMatrix(a: Matrix): Matrix {
  const rows = a.length;
  const cols = a[0].length;
  const result = createEmptyMatrix(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = a[i][j];
    }
  }
  return result;
}

export function calculateDeterminant(a: Matrix): number {
  const n = a.length;
  if (n !== a[0].length) return NaN;
  if (n === 1) return a[0][0];
  if (n === 2) {
    return new Big(a[0][0]).times(a[1][1]).minus(new Big(a[0][1]).times(a[1][0])).toNumber();
  }

  let det = new Big(0);
  for (let i = 0; i < n; i++) {
    const subMatrix = a.slice(1).map((row) => row.filter((_, j) => j !== i));
    const term = new Big(Math.pow(-1, i)).times(a[0][i]).times(calculateDeterminant(subMatrix));
    det = det.plus(term);
  }
  return det.toNumber();
}
