/**
 * @file converters.ts
 * @description Implementations for general unit conversion formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Length Converter
// ─────────────────────────────────────────────────────────────────────────────

const lengthToMeters: Record<string, number> = {
    'm': 1,
    'cm': 0.01,
    'mm': 0.001,
    'km': 1000,
    'in': 0.0254,
    'ft': 0.3048,
    'yd': 0.9144,
    'mi': 1609.344
};

export function convertLength(value: number, from: string, to: string): number {
    if (!lengthToMeters[from] || !lengthToMeters[to]) throw new Error("Unknown unit");
    return value * (lengthToMeters[from] / lengthToMeters[to]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Area Converter
// ─────────────────────────────────────────────────────────────────────────────

const areaToSqMeters: Record<string, number> = {
    'm2': 1,
    'cm2': 0.0001,
    'mm2': 0.000001,
    'km2': 1000000,
    'ha': 10000,
    'acre': 4046.8564224,
    'ft2': 0.09290304,
    'in2': 0.00064516
};

export function convertArea(value: number, from: string, to: string): number {
    if (!areaToSqMeters[from] || !areaToSqMeters[to]) throw new Error("Unknown unit");
    return value * (areaToSqMeters[from] / areaToSqMeters[to]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Volume Converter
// ─────────────────────────────────────────────────────────────────────────────

const volumeToLiters: Record<string, number> = {
    'L': 1,
    'mL': 0.001,
    'm3': 1000,
    'cm3': 0.001,
    'ft3': 28.316846592,
    'in3': 0.016387064,
    'gal': 3.785411784, // US liquid
    'fl_oz': 0.0295735295625 // US fluid ounce
};

export function convertVolume(value: number, from: string, to: string): number {
    if (!volumeToLiters[from] || !volumeToLiters[to]) throw new Error("Unknown unit");
    return value * (volumeToLiters[from] / volumeToLiters[to]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pressure Converter
// ─────────────────────────────────────────────────────────────────────────────

const pressureToPa: Record<string, number> = {
    'Pa': 1,
    'kPa': 1000,
    'MPa': 1000000,
    'bar': 100000,
    'atm': 101325,
    'psi': 6894.75729,
    'mmHg': 133.322387415,
    'inHg': 3386.38815789
};

export function convertPressure(value: number, from: string, to: string): number {
    if (!pressureToPa[from] || !pressureToPa[to]) throw new Error("Unknown unit");
    return value * (pressureToPa[from] / pressureToPa[to]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Temperature Converter
// ─────────────────────────────────────────────────────────────────────────────

export function convertTemperature(value: number, from: string, to: string): number {
    if (from !== 'C' && from !== 'F' && from !== 'K') throw new Error("Unknown unit");
    if (to !== 'C' && to !== 'F' && to !== 'K') throw new Error("Unknown unit");

    // First convert everything to Celsius
    let celsius = 0;
    if (from === 'C') celsius = value;
    else if (from === 'F') celsius = (value - 32) * 5 / 9;
    else if (from === 'K') celsius = value - 273.15;

    // Check absolute zero
    if (celsius < -273.15) throw new Error("Below absolute zero");

    // Convert Celsius to Target
    if (to === 'C') return celsius;
    else if (to === 'F') return (celsius * 9 / 5) + 32;
    else return celsius + 273.15; // K
}

// ─────────────────────────────────────────────────────────────────────────────
// Energy Converter
// ─────────────────────────────────────────────────────────────────────────────

const energyToJoules: Record<string, number> = {
    'J': 1,
    'kJ': 1000,
    'MJ': 1000000,
    'cal': 4.184, // thermochemical
    'kcal': 4184, // thermochemical
    'BTU': 1055.05585262, // IT
    'kWh': 3600000,
    'Wh': 3600
};

export function convertEnergy(value: number, from: string, to: string): number {
    if (!energyToJoules[from] || !energyToJoules[to]) throw new Error("Unknown unit");
    return value * (energyToJoules[from] / energyToJoules[to]);
}
