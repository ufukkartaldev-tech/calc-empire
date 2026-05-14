/**
 * @file capacitorCharge.ts
 * @description Capacitor transient analysis
 */

import type { CalculatorConfig, FieldValues, SolveResult } from '@/types';
import { capacitorTransient } from '@/lib/formulas/electrical';
import { VOLTAGE_UNITS, RESISTANCE_UNITS, CAPACITANCE_UNITS, TIME_UNITS } from '@/constants';

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
  id: 'capacitorCharge',
  titleKey: 'CapacitorTransient.title',
  descriptionKey: 'CapacitorTransient.description',
  fields: [
    { key: 'v0', labelKey: 'CapacitorTransient.v0', units: VOLTAGE_UNITS },
    {
      key: 'r',
      labelKey: 'CapacitorTransient.r',
      units: RESISTANCE_UNITS,
    },
    {
      key: 'c',
      labelKey: 'CapacitorTransient.c',
      units: CAPACITANCE_UNITS,
    },
    {
      key: 't',
      labelKey: 'CapacitorTransient.t',
      units: TIME_UNITS,
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
