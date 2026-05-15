'use client';

import React, { useState, useMemo } from 'react';
import { beamDeflection } from '@/lib/formulas/mechanical';
import { Input } from '../ui/Input';
import { calculateBeamDeflectionPoints, generateSmoothPath } from '@/utils/svg-helpers';
import { useCanvasTransform } from '@/lib/performance/useCanvasTransform';
import { ArrowMarker, DimensionLine } from './VisualPrimitives';

interface BeamDeflectionVisualizerProps {
  className?: string;
}

export function BeamDeflectionVisualizer({ className = '' }: BeamDeflectionVisualizerProps) {
  const [beamType, setBeamType] = useState<'cantilever' | 'simply-supported'>('cantilever');
  const [length, setLength] = useState<number>(2);
  const [load, setLoad] = useState<number>(1000);
  const [elasticModulus, setElasticModulus] = useState<number>(200000);
  const [momentOfInertia, setMomentOfInertia] = useState<number>(8.33e-6);

  const { viewBox, transform } = useCanvasTransform({ viewBox: '0 0 120 120', padding: 10 });

  const deflection = useMemo(() => {
    try {
      return beamDeflection({
        W: load,
        L: length,
        E: elasticModulus,
        I: momentOfInertia,
        type: beamType,
      });
    } catch (error) {
      return 0;
    }
  }, [load, length, elasticModulus, momentOfInertia, beamType]);

  const beamPath = useMemo(() => {
    const maxDeflection = Math.min(deflection * 1000, 100);
    const points = calculateBeamDeflectionPoints(length, maxDeflection, beamType, 100);
    return generateSmoothPath(points);
  }, [length, deflection, beamType]);

  const getSupportElements = () => {
    if (beamType === 'cantilever') {
      return (
        <>
          <rect x="0" y="40" width="12" height="20" fill="#666" />
          <line x1="0" y1="35" x2="12" y2="35" stroke="#666" strokeWidth="2" />
          <line x1="0" y1="65" x2="12" y2="65" stroke="#666" strokeWidth="2" />
          <line x1="2" y1="30" x2="2" y2="70" stroke="#333" strokeWidth="1" />
          <line x1="4" y1="30" x2="4" y2="70" stroke="#333" strokeWidth="1" />
          <line x1="6" y1="30" x2="6" y2="70" stroke="#333" strokeWidth="1" />
          <line x1="8" y1="30" x2="8" y2="70" stroke="#333" strokeWidth="1" />
          <line x1="10" y1="30" x2="10" y2="70" stroke="#333" strokeWidth="1" />
        </>
      );
    } else {
      return (
        <>
          <polygon points="0,50 12,45 12,55" fill="#666" />
          <circle cx="6" cy="50" r="3" fill="#333" />
          <rect x="98" y="47" width="12" height="6" fill="#666" />
          <circle cx="104" cy="50" r="4" fill="#333" />
          <circle cx="104" cy="50" r="2" fill="#999" />
        </>
      );
    }
  };

  const getLoadArrows = () => {
    const arrowColor = '#FF0000';
    if (beamType === 'cantilever') {
      return (
        <g>
          <ArrowMarker id="arrowhead" color={arrowColor} />
          <line
            x1="100"
            y1="10"
            x2="100"
            y2="40"
            stroke={arrowColor}
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
          />
          <text x="105" y="15" fill={arrowColor} fontSize="14" fontWeight="bold">
            W
          </text>
        </g>
      );
    } else {
      return (
        <g>
          <ArrowMarker id="arrowhead-dist" color={arrowColor} />
          {[20, 35, 50, 65, 80].map((x) => (
            <line
              key={x}
              x1={x}
              y1="10"
              x2={x}
              y2="40"
              stroke={arrowColor}
              strokeWidth="2"
              markerEnd="url(#arrowhead-dist)"
            />
          ))}
          <text x="50" y="8" textAnchor="middle" fill={arrowColor} fontSize="14" fontWeight="bold">
            W
          </text>
        </g>
      );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Beam Deflection Calculator</h2>

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBeamType('cantilever')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium ${
              beamType === 'cantilever'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Cantilever
          </button>
          <button
            onClick={() => setBeamType('simply-supported')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium ${
              beamType === 'simply-supported'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Simply Supported
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          value={length}
          onChange={setLength}
          label="Uzunluk (L)"
          unit="m"
          step={0.1}
          min={0.1}
          max={10}
        />
        <Input
          value={load}
          onChange={setLoad}
          label="Yük (W)"
          unit="N"
          step={100}
          min={100}
          max={50000}
        />
        <Input
          value={elasticModulus}
          onChange={setElasticModulus}
          label="Elastisite Modülü (E)"
          unit="MPa"
          step={1000}
          min={1000}
          max={500000}
        />
        <Input
          value={momentOfInertia}
          onChange={setMomentOfInertia}
          label="Atalet Momenti (I)"
          unit="m⁴"
          step={0.000001}
          min={0.000001}
          max={0.01}
        />
      </div>

      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <svg
          width="100%"
          height="400"
          viewBox={viewBox}
          className="w-full max-w-4xl mx-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="120" height="120" fill="url(#grid)" />

          <line
            x1="10"
            y1="60"
            x2="110"
            y2="60"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          <g transform={transform}>
            {getSupportElements()}
            <path d={beamPath} fill="none" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />
            {getLoadArrows()}
            {deflection > 0.0001 && (
              <g>
                <line
                  x1={beamType === 'cantilever' ? 100 : 50}
                  y1="60"
                  x2={beamType === 'cantilever' ? 100 : 50}
                  y2={60 + Math.min(deflection * 1000, 50)}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                <text
                  x={beamType === 'cantilever' ? 85 : 35}
                  y={65 + Math.min(deflection * 1000, 50)}
                  fill="#3B82F6"
                  fontSize="12"
                  fontWeight="bold"
                >
                  δ = {(deflection * 1000).toFixed(2)} mm
                </text>
              </g>
            )}
            <DimensionLine x1={0} y1={85} x2={100} y2={85} label={`L = ${length} m`} />
          </g>
        </svg>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Calculation Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">Maximum Deflection</p>
            <p className="text-4xl font-bold text-blue-800">{(deflection * 1000).toFixed(3)}</p>
            <p className="text-sm text-blue-600">mm</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">Deflection Formula</p>
            <p className="text-lg font-mono text-blue-800">
              {beamType === 'cantilever' ? 'δ = WL³/(3EI)' : 'δ = WL³/(48EI)'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">Safety Check</p>
            <p
              className={`text-2xl font-bold ${
                deflection < length * 0.001 ? 'text-green-600' : 'text-orange-600'
              }`}
            >
              {deflection < length * 0.001 ? '✓ Safe' : '⚠ Check'}
            </p>
            <p className="text-xs text-blue-600">L/{(length / (deflection * 1000)).toFixed(0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
