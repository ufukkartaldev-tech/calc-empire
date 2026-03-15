import { describe, it, expect } from 'vitest';
import { solveKirchhoff2Loop } from '../../lib/formulas/electrical';

describe('Kirchhoff Circuit Analysis (2-Loop)', () => {
  // Standard 2-loop circuit:
  // Left loop has V1 and R1.
  // Right loop has V2 and R2.
  // Middle sharing branch has R3.
  // Standard clockwise I1, counter-clockwise I2. Both down through R3.
  // Eq1: I1(R1 + R3) + I2(R3) = V1
  // Eq2: I1(R3) + I2(R2 + R3) = V2

  it('solves a balanced symmetric circuit', () => {
    // V1=10, V2=10, R1=10, R2=10, R3=10
    // I1(20) + I2(10) = 10
    // I1(10) + I2(20) = 10
    // I1 = 10/30 = 0.333A
    // I2 = 0.333A
    // I3 = I1 + I2 = 0.666A
    const res = solveKirchhoff2Loop({ V1: 10, V2: 10, R1: 10, R2: 10, R3: 10 });
    expect(res.I1).toBeCloseTo(0.3333, 3);
    expect(res.I2).toBeCloseTo(0.3333, 3);
    expect(res.I3).toBeCloseTo(0.6667, 3);
  });

  it('solves an asymmetric circuit', () => {
    // V1=14, V2=10, R1=4, R2=2, R3=6
    // I1(10) + I2(6) = 14
    // I1(6) + I2(8) = 10
    // 10*I1 + 6*I2 = 14 => 5*I1 + 3*I2 = 7
    // 6*I1 + 8*I2 = 10 => 3*I1 + 4*I2 = 5
    // det = 20 - 9 = 11
    // I1 = (7*4 - 3*5) / 11 = 13/11 ≈ 1.1818A
    // I2 = (5*5 - 7*3) / 11 = 4/11 ≈ 0.3636A
    // I3 = 17/11 ≈ 1.5454A
    const res = solveKirchhoff2Loop({ V1: 14, V2: 10, R1: 4, R2: 2, R3: 6 });
    expect(res.I1).toBeCloseTo(1.1818, 3);
    expect(res.I2).toBeCloseTo(0.3636, 3);
    expect(res.I3).toBeCloseTo(1.5454, 3);
  });

  it('handles zero voltage sources correctly', () => {
    // V1=10, V2=0
    const res = solveKirchhoff2Loop({ V1: 10, V2: 0, R1: 10, R2: 10, R3: 10 });
    // I1(20) + I2(10) = 10
    // I1(10) + I2(20) = 0 => I2 = -0.5 * I1
    // I1(20) - I1(5) = 10 => 15 * I1 = 10 => I1 = 2/3 ≈ 0.667A
    // I2 = -1/3 ≈ -0.333A
    // I3 = I1 + I2 = 1/3 ≈ 0.333A
    expect(res.I1).toBeCloseTo(0.6667, 3);
    expect(res.I2).toBeCloseTo(-0.3333, 3);
    expect(res.I3).toBeCloseTo(0.3333, 3);
  });

  it('throws if any resistance is negative', () => {
    expect(() => solveKirchhoff2Loop({ V1: 10, V2: 10, R1: -10, R2: 10, R3: 10 })).toThrow(
      'Resistances cannot be negative'
    );
  });

  it('throws if determinant is zero (e.g. all resistors zero)', () => {
    expect(() => solveKirchhoff2Loop({ V1: 10, V2: 10, R1: 0, R2: 0, R3: 0 })).toThrow(
      'Circuit has no unique valid solution (determinant is zero)'
    );
  });
});
