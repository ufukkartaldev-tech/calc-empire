/**
 * @file matrix.test.ts
 * @description Unit tests for matrix operations
 */

import { describe, it, expect } from 'vitest';
import {
  createEmptyMatrix,
  addMatrices,
  multiplyMatrices,
  transposeMatrix,
  calculateDeterminant,
  type Matrix,
} from '@/lib/formulas/mathematics';

describe('Matrix - Creation', () => {
  it('creates empty matrix with correct dimensions', () => {
    const matrix = createEmptyMatrix(3, 4);
    expect(matrix.length).toBe(3);
    expect(matrix[0].length).toBe(4);
    expect(matrix.every((row) => row.every((val) => val === 0))).toBe(true);
  });

  it('creates 1x1 matrix', () => {
    const matrix = createEmptyMatrix(1, 1);
    expect(matrix).toEqual([[0]]);
  });
});

describe('Matrix - Addition', () => {
  it('adds two matrices of same dimensions', () => {
    const a: Matrix = [
      [1, 2],
      [3, 4],
    ];
    const b: Matrix = [
      [5, 6],
      [7, 8],
    ];
    const result = addMatrices(a, b);
    expect(result).toEqual([
      [6, 8],
      [10, 12],
    ]);
  });

  it('adds matrices with decimal values', () => {
    const a: Matrix = [[1.5, 2.5]];
    const b: Matrix = [[0.5, 1.5]];
    const result = addMatrices(a, b);
    expect(result[0][0]).toBeCloseTo(2);
    expect(result[0][1]).toBeCloseTo(4);
  });

  it('handles 1x1 matrices', () => {
    const a: Matrix = [[5]];
    const b: Matrix = [[3]];
    const result = addMatrices(a, b);
    expect(result).toEqual([[8]]);
  });
});

describe('Matrix - Multiplication', () => {
  it('multiplies two compatible matrices', () => {
    const a: Matrix = [
      [1, 2],
      [3, 4],
    ];
    const b: Matrix = [
      [5, 6],
      [7, 8],
    ];
    const result = multiplyMatrices(a, b);
    expect(result).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  it('multiplies non-square matrices', () => {
    const a: Matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ]; // 2x3
    const b: Matrix = [
      [7, 8],
      [9, 10],
      [11, 12],
    ]; // 3x2
    const result = multiplyMatrices(a, b);
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(2);
    expect(result).toEqual([
      [58, 64],
      [139, 154],
    ]);
  });

  it('handles identity matrix multiplication', () => {
    const a: Matrix = [
      [1, 2],
      [3, 4],
    ];
    const identity: Matrix = [
      [1, 0],
      [0, 1],
    ];
    const result = multiplyMatrices(a, identity);
    expect(result).toEqual(a);
  });

  it('handles 1x1 matrix multiplication', () => {
    const a: Matrix = [[5]];
    const b: Matrix = [[3]];
    const result = multiplyMatrices(a, b);
    expect(result).toEqual([[15]]);
  });
});

describe('Matrix - Transposition', () => {
  it('transposes square matrix', () => {
    const a: Matrix = [
      [1, 2],
      [3, 4],
    ];
    const result = transposeMatrix(a);
    expect(result).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  it('transposes rectangular matrix', () => {
    const a: Matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ]; // 2x3
    const result = transposeMatrix(a);
    expect(result).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]); // 3x2
  });

  it('transposes 1xn matrix to nx1', () => {
    const a: Matrix = [[1, 2, 3, 4, 5]];
    const result = transposeMatrix(a);
    expect(result).toEqual([[1], [2], [3], [4], [5]]);
  });

  it('double transpose returns original matrix', () => {
    const a: Matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const result = transposeMatrix(transposeMatrix(a));
    expect(result).toEqual(a);
  });
});

describe('Matrix - Determinant', () => {
  it('calculates determinant of 1x1 matrix', () => {
    const a: Matrix = [[5]];
    expect(calculateDeterminant(a)).toBe(5);
  });

  it('calculates determinant of 2x2 matrix', () => {
    const a: Matrix = [
      [1, 2],
      [3, 4],
    ];
    // det = (1*4) - (2*3) = -2
    expect(calculateDeterminant(a)).toBeCloseTo(-2);
  });

  it('calculates determinant of 3x3 matrix', () => {
    const a: Matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    // det = 0 (singular matrix)
    expect(calculateDeterminant(a)).toBeCloseTo(0);
  });

  it('calculates determinant of non-singular 3x3 matrix', () => {
    const a: Matrix = [
      [2, -3, 1],
      [1, -1, -2],
      [4, 1, 3],
    ];
    expect(calculateDeterminant(a)).not.toBeCloseTo(0);
  });

  it('returns NaN for non-square matrix', () => {
    const a: Matrix = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(calculateDeterminant(a)).toBeNaN();
  });

  it('calculates determinant of identity matrix', () => {
    const identity: Matrix = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    expect(calculateDeterminant(identity)).toBeCloseTo(1);
  });
});
