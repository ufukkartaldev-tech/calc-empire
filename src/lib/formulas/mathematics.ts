/**
 * @file mathematics.ts
 * @description Mathematics formulas and calculus logic
 */

/**
 * Evaluates a mathematical function string at a given x.
 * Supports basic operations and Math functions.
 * Note: In a production environment, use a proper parser library like mathjs.
 */
export function evaluateFunction(expr: string, x: number): number {
  try {
    // Replace typical notation with Math.* functions
    let safeExpr = expr
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/log/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/abs/g, 'Math.abs');

    // Basic x replacement - be careful with words containing 'x'
    // This is a simple regex that replaces 'x' not preceded or followed by other letters
    safeExpr = safeExpr.replace(/(?<![a-z])x(?![a-z])/g, `(${x})`);

    // Use Function constructor for evaluation (restricted context)
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
  const f_plus = evaluateFunction(expr, x + h);
  const f_minus = evaluateFunction(expr, x - h);
  return (f_plus - f_minus) / (2 * h);
}

/**
 * Numerical integration using Simpson's Rule
 */
export function calculateIntegral(
  expr: string,
  a: number,
  b: number,
  n: number = 100
): number {
  if (n % 2 !== 0) n++; // Simpson's rule requires even number of intervals
  const h = (b - a) / n;
  let sum = evaluateFunction(expr, a) + evaluateFunction(expr, b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = evaluateFunction(expr, x);
    sum += i % 2 === 0 ? 2 * fx : 4 * fx;
  }

  return (h / 3) * sum;
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
      result[i][j] = a[i][j] + b[i][j];
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
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
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
  if (n === 2) return a[0][0] * a[1][1] - a[0][1] * a[1][0];
  
  let det = 0;
  for (let i = 0; i < n; i++) {
    const subMatrix = a.slice(1).map(row => row.filter((_, j) => j !== i));
    det += Math.pow(-1, i) * a[0][i] * calculateDeterminant(subMatrix);
  }
  return det;
}
