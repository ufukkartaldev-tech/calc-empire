import Big from 'big.js';

export type UnitValue = number | { value: number; unit: string };

export const unitMultipliers: Record<string, number> = {
  k: 1e3,
  M: 1e6,
  m: 1e-3,
  u: 1e-6,
  n: 1e-9,
};

export function normalizeValue(val: UnitValue): Big {
  if (typeof val === 'number') {
    return new Big(val);
  }

  const multiplier = unitMultipliers[val.unit] || 1;
  return new Big(val.value).times(multiplier);
}

export function validateAndNormalize(val?: UnitValue): Big {
  if (val === undefined) {
    throw new Error('Missing value');
  }

  const normalized = normalizeValue(val);

  if (normalized.lte(0)) {
    throw new Error('Invalid value: must be greater than 0');
  }

  return normalized;
}
