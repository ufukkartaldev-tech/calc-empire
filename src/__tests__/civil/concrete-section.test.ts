import { describe, it, expect } from 'vitest';
import { concreteSectionCapacity } from '../../lib/formulas/civil';

describe('Concrete Section Analysis', () => {
  // Test case based on a standard 300x500 beams
  // bw=300, d=450, fck=25, fyk=420, As=1200
  // fcd = 25/1.5 = 16.67
  // fyd = 420/1.15 = 365.22
  // a = (1200 * 365.22) / (0.85 * 16.67 * 300) ≈ 438264 / 4250 ≈ 103.1 mm
  // Md = 1200 * 365.22 * (450 - 103.1/2) ≈ 438264 * 398.45 ≈ 174,630,000 Nmm = 174.6 kNm

  const params = {
    bw: 300,
    d: 450,
    fck: 25,
    fyk: 420,
    As: 1200,
  };

  it('calculates moment capacity correctly', () => {
    const result = concreteSectionCapacity(params);
    expect(result.Md).toBeCloseTo(174.6, 0);
  });

  it('calculates compression block depth correctly', () => {
    const result = concreteSectionCapacity(params);
    expect(result.a).toBeCloseTo(103.1, 0);
  });

  it('identifies ductile failure for moderate reinforcement', () => {
    const result = concreteSectionCapacity(params);
    expect(result.isDuctile).toBe(true);
    expect(result.epsS).toBeGreaterThan(0.005);
  });

  it('identifies over-reinforced section with high As', () => {
    // High As value to force brittle failure
    const result = concreteSectionCapacity({ ...params, As: 6000 });
    expect(result.isDuctile).toBe(false);
  });

  it('throws for negative dimensions', () => {
    expect(() => concreteSectionCapacity({ ...params, bw: -100 })).toThrow();
    expect(() => concreteSectionCapacity({ ...params, As: 0 })).toThrow();
  });

  it('throws for negative material strengths', () => {
    expect(() => concreteSectionCapacity({ ...params, fck: -25 })).toThrow();
  });
});
