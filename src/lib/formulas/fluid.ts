/**
 * @file fluid.ts
 * @description Implementations for fluid mechanics formulas.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Reynolds Number
// ─────────────────────────────────────────────────────────────────────────────

interface ReynoldsParams {
    density?: number;
    velocity: number;
    diameter: number;
    dynamicViscosity?: number;
    kinematicViscosity?: number;
}

export function reynoldsNumber({ density, velocity, diameter, dynamicViscosity, kinematicViscosity }: ReynoldsParams) {
    if (velocity <= 0) throw new Error("Velocity must be positive");
    if (diameter <= 0) throw new Error("Diameter must be positive");

    let Re = 0;

    if (kinematicViscosity) {
        Re = (velocity * diameter) / kinematicViscosity;
    } else if (density && dynamicViscosity) {
        Re = (density * velocity * diameter) / dynamicViscosity;
    } else {
        throw new Error("Missing parameters for calculating Reynolds Number");
    }

    let regime = "turbulent";
    if (Re < 2300) regime = "laminar";
    else if (Re <= 4000) regime = "transitional";

    return { Re, regime };
}

// ─────────────────────────────────────────────────────────────────────────────
// Darcy-Weisbach Pressure Loss
// ─────────────────────────────────────────────────────────────────────────────

interface DarcyWeisbachParams {
    f: number;
    L: number;
    D: number;
    rho: number;
    v: number;
}

export function darcyWeisbach({ f, L, D, rho, v }: DarcyWeisbachParams) {
    if (D <= 0) throw new Error("Diameter must be positive");
    if (f < 0) throw new Error("Friction factor cannot be negative");

    const pressureDropPa = f * (L / D) * (0.5 * rho * v * v);
    const headLossM = pressureDropPa / (rho * 9.80665);

    return { pressureDropPa, headLossM };
}
