import Big from 'big.js';

interface OhmPowerParams {
    voltage?: number;
    current?: number;
    resistance?: number;
    power?: number;
}

export function ohmPower(params: OhmPowerParams): OhmPowerParams {
    let { voltage: vIn, current: iIn, resistance: rIn, power: pIn } = params;

    const v = vIn !== undefined ? new Big(vIn) : undefined;
    const i = iIn !== undefined ? new Big(iIn) : undefined;
    const r = rIn !== undefined ? new Big(rIn) : undefined;
    const p = pIn !== undefined ? new Big(pIn) : undefined;

    const count = [v, i, r, p].filter(val => val !== undefined).length;
    if (count < 2) throw new Error("At least two parameters are required.");

    let Vout: Big | undefined = v;
    let Iout: Big | undefined = i;
    let Rout: Big | undefined = r;
    let Pout: Big | undefined = p;

    if (r !== undefined && r.lt(0)) throw new Error("Resistance (R) cannot be negative.");
    if (p !== undefined && p.lt(0)) throw new Error("Power (P) cannot be negative in passive systems.");

    if (v !== undefined && i !== undefined) {
        Rout = v.div(i);
        Pout = v.times(i);
    } else if (v !== undefined && r !== undefined) {
        if (r.eq(0)) throw new Error("Resistance cannot be zero.");
        Iout = v.div(r);
        Pout = v.times(v).div(r);
    } else if (v !== undefined && p !== undefined) {
        if (v.eq(0)) throw new Error("Voltage cannot be zero.");
        Iout = p.div(v);
        Rout = v.times(v).div(p);
    } else if (i !== undefined && r !== undefined) {
        Vout = i.times(r);
        Pout = i.times(i).times(r);
    } else if (i !== undefined && p !== undefined) {
        if (i.eq(0)) throw new Error("Current cannot be zero.");
        Vout = p.div(i);
        Rout = p.div(i.times(i));
    } else if (r !== undefined && p !== undefined) {
        if (r.eq(0)) throw new Error("Resistance cannot be zero.");
        Vout = p.times(r).sqrt();
        Iout = p.div(r).sqrt();
    }

    return {
        voltage: Vout?.toNumber(),
        current: Iout?.toNumber(),
        resistance: Rout?.toNumber(),
        power: Pout?.toNumber()
    };
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

// ─────────────────────────────────────────────────────────────────────────────
// Kirchhoff's Laws (2-Loop Mesh Analysis)
// ─────────────────────────────────────────────────────────────────────────────

interface Kirchhoff2LoopParams {
    V1: number;
    V2: number;
    R1: number;
    R2: number;
    R3: number;
}

export function solveKirchhoff2Loop({ V1, V2, R1, R2, R3 }: Kirchhoff2LoopParams) {
    if (R1 < 0 || R2 < 0 || R3 < 0) {
        throw new Error("Resistances cannot be negative");
    }

    // Standard 2-mesh equations:
    // Mesh 1: I1(R1 + R3) + I2(R3) = V1
    // Mesh 2: I1(R3) + I2(R2 + R3) = V2
    // Matrix [a, b; c, d] [I1; I2] = [V1; V2]

    const a = R1 + R3;
    const b = R3;
    const c = R3;
    const d = R2 + R3;

    const det = (a * d) - (b * c);
    if (det === 0) {
        throw new Error("Circuit has no unique valid solution (determinant is zero)");
    }

    // Cramer's rule
    // I1 = det([V1, b ; V2, d]) / det
    // I2 = det([a, V1 ; c, V2]) / det
    const I1 = (V1 * d - b * V2) / det;
    const I2 = (a * V2 - V1 * c) / det;
    const I3 = I1 + I2; // Current down through the middle branch

    return { I1, I2, I3 };
}
