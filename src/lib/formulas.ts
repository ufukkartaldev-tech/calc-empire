type UnitValue = number | { value: number; unit: string };

interface OhmParams {
    voltage?: UnitValue;
    current?: UnitValue;
    resistance?: UnitValue;
}

interface OhmResult {
    voltage?: number;
    current?: number;
    resistance?: number;
}

const unitMultipliers: Record<string, number> = {
    'k': 1e3,
    'M': 1e6,
    'm': 1e-3,
    'u': 1e-6,
    'n': 1e-9
};

function normalizeValue(val: UnitValue): number {
    if (typeof val === 'number') {
        return val;
    }

    const multiplier = unitMultipliers[val.unit] || 1;
    return val.value * multiplier;
}

function validateAndNormalize(val?: UnitValue): number {
    if (val === undefined) {
        throw new Error('Missing value');
    }

    const normalized = normalizeValue(val);

    if (normalized <= 0) {
        throw new Error('Invalid value: must be greater than 0');
    }

    return normalized;
}

export function ohm({ voltage, current, resistance }: OhmParams): OhmResult {
    // Check if at least two parameters are provided
    const paramsCount = [voltage, current, resistance].filter(p => p !== undefined).length;

    if (paramsCount < 2) {
        throw new Error('Missing value');
    }

    if (voltage !== undefined && current !== undefined) {
        const V = validateAndNormalize(voltage);
        const I = validateAndNormalize(current);
        return { resistance: V / I };
    }

    if (current !== undefined && resistance !== undefined) {
        const I = validateAndNormalize(current);
        const R = validateAndNormalize(resistance);
        return { voltage: I * R };
    }

    if (voltage !== undefined && resistance !== undefined) {
        const V = validateAndNormalize(voltage);
        const R = validateAndNormalize(resistance);
        return { current: V / R };
    }

    throw new Error('Missing value');
}
