import React from 'react';

interface BodePlotChartProps {
  title: string;
  data: number[];
  frequencies: number[];
  minY: number;
  maxY: number;
  ticks: number;
  lineColor: string;
  isPhase?: boolean;
  cutoffLabel: string;
}

export function BodePlotChart({
  title,
  data,
  frequencies,
  minY,
  maxY,
  ticks,
  lineColor,
  isPhase = false,
  cutoffLabel,
}: BodePlotChartProps) {
  // Plotting dimensions
  const svgW = 400;
  const svgH = 180;
  const padX = 40;
  const padY = 20;

  const generatePath = (dataArr: number[], freqs: number[], min: number, max: number) => {
    if (!dataArr || dataArr.length === 0) return '';
    const fMin = freqs[0];
    const fMax = freqs[freqs.length - 1];
    const logFMin = Math.log10(fMin);
    const logFMax = Math.log10(fMax);

    const range = max - min;
    if (range === 0) return '';

    return dataArr
      .map((val, i) => {
        const f = freqs[i];
        const x = padX + ((Math.log10(f) - logFMin) / (logFMax - logFMin)) * (svgW - 2 * padX);
        const clampedVal = Math.max(min, Math.min(max, val));
        const y = padY + (1 - (clampedVal - min) / range) * (svgH - 2 * padY);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  };

  const drawGrid = (minAxisY: number, maxAxisY: number, numTicks: number, isPhasePlot: boolean) => {
    const lines = [];
    if (frequencies && frequencies.length > 0) {
      const fMin = frequencies[0];
      const fMax = frequencies[frequencies.length - 1];
      const logMin = Math.floor(Math.log10(fMin));
      const logMax = Math.ceil(Math.log10(fMax));

      for (let log = logMin; log <= logMax; log++) {
        const x =
          padX +
          ((log - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin))) * (svgW - 2 * padX);
        if (x >= padX && x <= svgW - padX) {
          lines.push(
            <line
              key={`x-${log}`}
              x1={x}
              y1={padY}
              x2={x}
              y2={svgH - padY}
              stroke="#94a3b8"
              strokeDasharray="2,2"
              strokeWidth="0.5"
              className="dark:stroke-slate-700"
            />
          );
          if (
            log === logMin ||
            log === logMax ||
            log === Math.round(logMin + (logMax - logMin) / 2)
          ) {
            lines.push(
              <text
                key={`tx-${log}`}
                x={x}
                y={svgH - 5}
                fontSize="9"
                textAnchor="middle"
                className="fill-slate-500 font-mono"
              >
                10^{log}
              </text>
            );
          }
        }
      }
    }

    for (let i = 0; i <= numTicks; i++) {
      const val = minAxisY + (i / numTicks) * (maxAxisY - minAxisY);
      const y = padY + (1 - i / numTicks) * (svgH - 2 * padY);
      lines.push(
        <line
          key={`y-${i}`}
          x1={padX}
          y1={y}
          x2={svgW - padX}
          y2={y}
          stroke="#94a3b8"
          strokeDasharray="2,2"
          strokeWidth="0.5"
          className="dark:stroke-slate-700"
        />
      );
      lines.push(
        <text
          key={`ty-${i}`}
          x={padX - 5}
          y={y + 3}
          fontSize="9"
          textAnchor="end"
          className="fill-slate-500 font-mono"
        >
          {val.toFixed(0)}
          {isPhasePlot ? '°' : ''}
        </text>
      );
    }
    return lines;
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </h3>
      </div>
      <div className="p-4 bg-white dark:bg-slate-950 flex justify-center">
        <svg
          width="100%"
          height="auto"
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
          className="max-w-2xl"
        >
          <rect width={svgW} height={svgH} fill="none" />
          {drawGrid(minY, maxY, ticks, isPhase)}
          <path
            d={generatePath(data, frequencies, minY, maxY)}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
          />
          <line
            x1={padX + 0.5 * (svgW - 2 * padX)}
            y1={padY}
            x2={padX + 0.5 * (svgW - 2 * padX)}
            y2={svgH - padY}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <text
            x={padX + 0.5 * (svgW - 2 * padX) + 5}
            y={padY + 15}
            fontSize="9"
            fill="#ef4444"
            fontWeight="bold"
          >
            {cutoffLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}
