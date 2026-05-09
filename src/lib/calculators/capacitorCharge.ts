/**
 * @file capacitorCharge.ts
 * @description Capacitor transient analysis
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { capacitorTransient } from '@/lib/formulas/electrical';

export function solve(values: FieldValues): SolveResult {
  const v0 = values['v0']?.value || 0;
  const r = values['r']?.value || 0;
  const c = values['c']?.value || 0;
  const t = values['t']?.value || 0;
  const isCharging = values['mode']?.value === 1; // 1 for charging, 0 for discharging

  const vt = capacitorTransient({
    v0,
    r,
    c,
    t,
    mode: isCharging ? 'charging' : 'discharging',
  });

  return { vt };
}

export const capacitorChargeConfig: CalculatorConfig = {
  id: 'capacitor-transient',
  titleKey: 'CapacitorTransient.title',
  descriptionKey: 'CapacitorTransient.description',
  fields: [
    { key: 'v0', labelKey: 'CapacitorTransient.v0', units: [{ label: 'V', symbol: '' }] },
    {
      key: 'r',
      labelKey: 'CapacitorTransient.r',
      units: [
        { label: 'Ω', symbol: '' },
        { label: 'kΩ', symbol: 'k' },
      ],
    },
    {
      key: 'c',
      labelKey: 'CapacitorTransient.c',
      units: [
        { label: 'F', symbol: '' },
        { label: 'μF', symbol: 'u' },
      ],
    },
    {
      key: 't',
      labelKey: 'CapacitorTransient.t',
      units: [
        { label: 's', symbol: '' },
        { label: 'ms', symbol: 'm' },
      ],
    },
    {
      key: 'mode',
      labelKey: 'CapacitorTransient.mode',
      type: 'select',
      options: [
        { label: 'Charging', value: 1 },
        { label: 'Discharging', value: 0 },
      ],
      units: [],
    },
  ],
  solverKey: 'capacitorCharge',
};
