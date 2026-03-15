/**
 * SVG utility functions for visualizations
 */

// Format resistance value with appropriate units
export function formatResistance(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)} MΩ`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kΩ`;
  } else {
    return `${value.toFixed(2)} Ω`;
  }
}

// Generate smooth curve points for SVG path
export function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';

  const pathData: string[] = [];
  pathData.push(`M ${points[0].x} ${points[0].y}`);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    // Use quadratic bezier curves for smoother lines
    const cpx = (prev.x + curr.x) / 2;
    const cpy = (prev.y + curr.y) / 2;

    pathData.push(`Q ${cpx} ${cpy} ${curr.x} ${curr.y}`);
  }

  return pathData.join(' ');
}

// Convert value to SVG coordinate system
export function normalizeToSvg(
  value: number,
  min: number,
  max: number,
  svgMin: number,
  svgMax: number
): number {
  return svgMin + ((value - min) / (max - min)) * (svgMax - svgMin);
}

// Generate color hex values for resistor colors
export function getResistorColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    brown: '#8B4513',
    red: '#FF0000',
    orange: '#FFA500',
    yellow: '#FFFF00',
    green: '#00FF00',
    blue: '#0000FF',
    violet: '#8B008B',
    gray: '#808080',
    white: '#FFFFFF',
    gold: '#FFD700',
    silver: '#C0C0C0',
  };
  return colorMap[colorName] || '#CCCCCC';
}

// Calculate beam deflection curve points
export function calculateBeamDeflectionPoints(
  length: number,
  maxDeflection: number,
  beamType: 'cantilever' | 'simply-supported',
  numPoints: number = 50
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const normalizedX = i / numPoints;
    const x = normalizedX * 100; // Normalize to 0-100 for SVG
    let y = 50; // Center line

    if (beamType === 'cantilever') {
      // Cantilever beam deflection formula
      const deflectionAtPoint = (maxDeflection * Math.pow(normalizedX, 2) * (3 - normalizedX)) / 2;
      y += deflectionAtPoint;
    } else {
      // Simply supported beam deflection formula
      const deflectionAtPoint =
        maxDeflection * (normalizedX * (1 - normalizedX)) * (1 + normalizedX * (1 - normalizedX));
      y += deflectionAtPoint;
    }

    points.push({ x, y });
  }

  return points;
}

// Generate normal distribution curve points
export function generateNormalDistributionPoints(
  mean: number,
  stdDev: number,
  numPoints: number = 100,
  range: number = 4
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const xMin = mean - range * stdDev;
  const xMax = mean + range * stdDev;
  const xStep = (xMax - xMin) / numPoints;

  const maxY = 1 / (stdDev * Math.sqrt(2 * Math.PI)); // Peak height at mean

  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * xStep;
    const exponent = -Math.pow(x - mean, 2) / (2 * stdDev * stdDev);
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

    // Normalize to SVG coordinates
    const svgX = ((x - xMin) / (xMax - xMin)) * 400;
    const svgY = 200 - (y / maxY) * 150; // Inverted y-axis with margin

    points.push({ x: svgX, y: svgY });
  }

  return points;
}
