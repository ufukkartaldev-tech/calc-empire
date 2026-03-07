/**
 * @file electrical.ts
 * @description Implementations for electrical engineering formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ohm's Law — Power Extension (P = V · I)
// ─────────────────────────────────────────────────────────────────────────────

interface OhmPowerParams {
    voltage?: number;
    current?: number;
    resistance?: number;
    power?: number;
}

export function ohmPower(params: OhmPowerParams): OhmPowerParams {
    let { voltage: V, current: I, resistance: R, power: P } = params;

    const definedValues = [V, I, R, P].filter(v => v !== undefined);
    const count = definedValues.length;
    if (count < 2) throw new Error("At least two parameters are required.");

    for (const v of definedValues) {
        if (typeof v !== 'number' || isNaN(v)) {
            throw new Error("Inputs must be valid numeric values.");
        }
    }

    if (R !== undefined && R < 0) throw new Error("Resistance (R) cannot be negative.");
    if (P !== undefined && P < 0) throw new Error("Power (P) cannot be negative in passive systems.");

    if (V !== undefined && I !== undefined) {
        R = V / I;
        P = V * I;
    } else if (V !== undefined && R !== undefined) {
        I = V / R;
        P = (V * V) / R;
    } else if (V !== undefined && P !== undefined) {
        I = P / V;
        R = (V * V) / P;
    } else if (I !== undefined && R !== undefined) {
        V = I * R;
        P = I * I * R;
    } else if (I !== undefined && P !== undefined) {
        V = P / I;
        R = P / (I * I);
    } else if (R !== undefined && P !== undefined) {
        V = Math.sqrt(P * R);
        I = Math.sqrt(P / R);
    }

    return { voltage: V, current: I, resistance: R, power: P };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resistor Color Codes
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_VALUES: Record<string, number> = {
    black: 0, brown: 1, red: 2, orange: 3, yellow: 4, green: 5, blue: 6, violet: 7, gray: 8, white: 9
};

const MULTIPLIERS: Record<string, number> = {
    ...COLOR_VALUES,
    gold: -1, silver: -2
};

const TOLERANCES: Record<string, number> = {
    brown: 1, red: 2, green: 0.5, blue: 0.25, violet: 0.1, gray: 0.05, gold: 5, silver: 10
};

const TEMP_COEFFS: Record<string, number> = {
    brown: 100, red: 50, orange: 15, yellow: 25, blue: 10, violet: 5
};

export function resistorColorCode(bands: string[]) {
    bands = bands.map(b => b.toLowerCase());

    // Validate bands
    for (const b of bands) {
        if (COLOR_VALUES[b] === undefined && MULTIPLIERS[b] === undefined && TOLERANCES[b] === undefined) {
            throw new Error(`Unknown color name: ${b}`);
        }
    }

    let resistance = 0;
    let tolerance = 20; // Default 20%
    let tempCoeff: number | undefined;

    if (bands.length === 4) {
        const value = COLOR_VALUES[bands[0]] * 10 + COLOR_VALUES[bands[1]];
        resistance = value * Math.pow(10, MULTIPLIERS[bands[2]] || 0);
        tolerance = TOLERANCES[bands[3]] || 20;
    } else if (bands.length === 5) {
        const value = COLOR_VALUES[bands[0]] * 100 + COLOR_VALUES[bands[1]] * 10 + COLOR_VALUES[bands[2]];
        resistance = value * Math.pow(10, MULTIPLIERS[bands[3]] || 0);
        tolerance = TOLERANCES[bands[4]] || 20;
    } else if (bands.length === 6) {
        const value = COLOR_VALUES[bands[0]] * 100 + COLOR_VALUES[bands[1]] * 10 + COLOR_VALUES[bands[2]];
        resistance = value * Math.pow(10, MULTIPLIERS[bands[3]] || 0);
        tolerance = TOLERANCES[bands[4]] || 20;
        tempCoeff = TEMP_COEFFS[bands[5]];
    } else {
        throw new Error("Invalid band count. Only 4, 5, or 6 bands are supported.");
    }

    return { resistance, tolerance, tempCoeff };
}

// ─────────────────────────────────────────────────────────────────────────────
// Series / Parallel
// ─────────────────────────────────────────────────────────────────────────────

export function seriesResistance(resistors: number[]): number {
    if (resistors.length === 0) throw new Error("Empty array");
    for (const r of resistors) if (r <= 0) throw new Error("Values must be > 0");
    return resistors.reduce((a, b) => a + b, 0);
}

export function parallelResistance(resistors: number[]): number {
    if (resistors.length === 0) throw new Error("Empty array");
    for (const r of resistors) if (r <= 0) throw new Error("Values must be > 0");
    const sum = resistors.reduce((a, b) => a + 1 / b, 0);
    return 1 / sum;
}

export function seriesCapacitance(capacitors: number[]): number {
    if (capacitors.length === 0) throw new Error("Empty array");
    for (const c of capacitors) if (c <= 0) throw new Error("Values must be > 0");
    const sum = capacitors.reduce((a, b) => a + 1 / b, 0);
    return 1 / sum;
}

export function parallelCapacitance(capacitors: number[]): number {
    if (capacitors.length === 0) throw new Error("Empty array");
    for (const c of capacitors) if (c <= 0) throw new Error("Values must be > 0");
    return capacitors.reduce((a, b) => a + b, 0);
}

export function seriesInductance(inductors: number[]): number {
    return seriesResistance(inductors);
}

export function parallelInductance(inductors: number[]): number {
    return parallelResistance(inductors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Time Constant τ = R·C
// ─────────────────────────────────────────────────────────────────────────────

export function timeConstantRC(R: number, C: number): number {
    if (R <= 0 || C <= 0) throw new Error("Resistance and capacitance must be positive");
    return R * C;
}

// ─────────────────────────────────────────────────────────────────────────────
// AC Power Analysis
// ─────────────────────────────────────────────────────────────────────────────

interface AcPowerParams {
    voltage: number;
    current: number;
    phiDeg: number;
}

export function acPower({ voltage, current, phiDeg }: AcPowerParams) {
    const apparentPower = voltage * current;
    const phiRad = (phiDeg * Math.PI) / 180;
    const powerFactor = Math.cos(phiRad);
    const activePower = apparentPower * powerFactor;
    const reactivePower = apparentPower * Math.sin(phiRad);

    return { apparentPower, activePower, reactivePower, powerFactor };
}

// ─────────────────────────────────────────────────────────────────────────────
// Voltage Divider
// ─────────────────────────────────────────────────────────────────────────────

export function voltageDivider({ Vin, R1, R2 }: { Vin: number, R1: number, R2: number }): number {
    if (R1 <= 0 || R2 <= 0) throw new Error("Resistances must be positive");
    return Vin * (R2 / (R1 + R2));
}

// ─────────────────────────────────────────────────────────────────────────────
// LED Series Resistor
// ─────────────────────────────────────────────────────────────────────────────

export function ledResistor({ Vsupply, Vled, IledA }: { Vsupply: number, Vled: number, IledA: number }): number {
    if (Vsupply <= Vled) throw new Error("Supply voltage must be > LED voltage");
    if (IledA <= 0) throw new Error("LED current must be > 0");
    return (Vsupply - Vled) / IledA;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bode Plot Calculation
// ─────────────────────────────────────────────────────────────────────────────

interface BodePlotParams {
    type: 'low-pass' | 'high-pass';
    R: number;
    C?: number;
    L?: number;
    points?: number;
}

export function calculateBodePlot({ type, R, C, L, points = 100 }: BodePlotParams) {
    if (R <= 0) throw new Error("Resistance must be positive");

    let fc = 0;
    if (C !== undefined && C > 0) {
        fc = 1 / (2 * Math.PI * R * C);
    } else if (L !== undefined && L > 0) {
        fc = R / (2 * Math.PI * L);
    } else {
        if (C !== undefined && C <= 0) throw new Error("Capacitance or Inductance must be positive");
        if (L !== undefined && L <= 0) throw new Error("Capacitance or Inductance must be positive");
        throw new Error("Either valid C or L must be provided");
    }

    const fMin = fc / 100;
    const fMax = fc * 100;

    const frequencies: number[] = [];
    const logMin = Math.log10(fMin);
    const logMax = Math.log10(fMax);
    const step = (logMax - logMin) / (points - 1 || 1);

    for (let i = 0; i < points; i++) {
        frequencies.push(Math.pow(10, logMin + i * step));
    }

    const magnitudes = frequencies.map(f => {
        const ratio = f / fc;
        if (type === 'low-pass') {
            return -10 * Math.log10(1 + ratio * ratio);
        } else {
            return 20 * Math.log10(ratio) - 10 * Math.log10(1 + ratio * ratio);
        }
    });

    const phases = frequencies.map(f => {
        const ratio = f / fc;
        if (type === 'low-pass') {
            return -(180 / Math.PI) * Math.atan(ratio);
        } else {
            return 90 - (180 / Math.PI) * Math.atan(ratio);
        }
    });

    return {
        fc,
        frequencies,
        magnitudes,
        phases
    };
}
