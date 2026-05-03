'use client';

import React, { useState, useMemo } from 'react';
import {
  Matrix,
  createEmptyMatrix,
  addMatrices,
  multiplyMatrices,
  transposeMatrix,
  calculateDeterminant,
} from '@/lib/formulas/mathematics';

type Operation = 'add' | 'subtract' | 'multiply' | 'determinant' | 'transpose';

const MAX_MATRIX_SIZE = 6;

interface MatrixViewProps {
  m: Matrix;
  title: string;
  onUpdate?: (r: number, c: number, v: string) => void;
  onResize?: (rows: number, cols: number) => void;
}

const MatrixView = ({ m, title, onUpdate, onResize }: MatrixViewProps) => (
  <div className="flex flex-col items-center gap-2">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{title}</span>
    <div className="relative inline-flex p-1">
      {/* Left Bracket */}
      <div className="w-2 border-l-2 border-t-2 border-b-2 border-slate-300 dark:border-slate-700 rounded-l-sm" />
      <div
        className="grid gap-1 px-1"
        style={{ gridTemplateColumns: `repeat(${m[0].length}, minmax(40px, 1fr))` }}
      >
        {m.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${i}-${j}`}
              type="number"
              value={val === 0 ? '' : val}
              placeholder="0"
              readOnly={!onUpdate}
              onChange={(e) => onUpdate?.(i, j, e.target.value)}
              className={`w-12 h-10 text-center text-sm font-mono rounded-md border focus:outline-none transition-colors ${
                onUpdate
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-blue-500'
                  : 'bg-slate-50 dark:bg-slate-950 border-transparent text-indigo-600 dark:text-indigo-400 font-bold'
              }`}
            />
          ))
        )}
      </div>
      {/* Right Bracket */}
      <div className="w-2 border-r-2 border-t-2 border-b-2 border-slate-300 dark:border-slate-700 rounded-r-sm" />
    </div>
    {onResize && (
      <div className="flex gap-2 mt-1">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">
          Rows:
          <button
            onClick={() => onResize(m.length - 1, m[0].length)}
            className="hover:text-blue-500"
          >
            −
          </button>
          <span>{m.length}</span>
          <button
            onClick={() => onResize(m.length + 1, m[0].length)}
            className="hover:text-blue-500"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">
          Cols:
          <button
            onClick={() => onResize(m.length, m[0].length - 1)}
            className="hover:text-blue-500"
          >
            −
          </button>
          <span>{m[0].length}</span>
          <button
            onClick={() => onResize(m.length, m[0].length + 1)}
            className="hover:text-blue-500"
          >
            +
          </button>
        </div>
      </div>
    )}
  </div>
);

export function MatrixCalculator() {
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);

  const [matrixA, setMatrixA] = useState<Matrix>(() => createEmptyMatrix(3, 3));
  const [matrixB, setMatrixB] = useState<Matrix>(() => createEmptyMatrix(3, 3));
  const [operation, setOperation] = useState<Operation>('add');

  // Handle matrix A resize
  const handleResizeA = (rows: number, cols: number) => {
    const newRows = Math.max(1, Math.min(MAX_MATRIX_SIZE, rows));
    const newCols = Math.max(1, Math.min(MAX_MATRIX_SIZE, cols));
    setRowsA(newRows);
    setColsA(newCols);

    setMatrixA((prev) => {
      const next = createEmptyMatrix(newRows, newCols);
      for (let i = 0; i < Math.min(prev.length, newRows); i++) {
        for (let j = 0; j < Math.min(prev[0].length, newCols); j++) {
          next[i][j] = prev[i][j];
        }
      }
      return next;
    });
  };

  // Handle matrix B resize
  const handleResizeB = (rows: number, cols: number) => {
    const newRows = Math.max(1, Math.min(MAX_MATRIX_SIZE, rows));
    const newCols = Math.max(1, Math.min(MAX_MATRIX_SIZE, cols));
    setRowsB(newRows);
    setColsB(newCols);

    setMatrixB((prev) => {
      const next = createEmptyMatrix(newRows, newCols);
      for (let i = 0; i < Math.min(prev.length, newRows); i++) {
        for (let j = 0; j < Math.min(prev[0].length, newCols); j++) {
          next[i][j] = prev[i][j];
        }
      }
      return next;
    });
  };

  const updateCell = (m: 'A' | 'B', r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    if (m === 'A') {
      const next = [...matrixA.map((row) => [...row])];
      next[r][c] = num;
      setMatrixA(next);
    } else {
      const next = [...matrixB.map((row) => [...row])];
      next[r][c] = num;
      setMatrixB(next);
    }
  };

  // Logic checks
  const canPerform = useMemo(() => {
    if (operation === 'add' || operation === 'subtract') {
      return rowsA === rowsB && colsA === colsB;
    }
    if (operation === 'multiply') {
      return colsA === rowsB;
    }
    if (operation === 'determinant') {
      return rowsA === colsA;
    }
    return true; // transpose
  }, [operation, rowsA, colsA, rowsB, colsB]);

  const result = useMemo(() => {
    if (!canPerform) return null;
    try {
      if (operation === 'add') return addMatrices(matrixA, matrixB);
      if (operation === 'subtract') {
        const negB = matrixB.map((row) => row.map((v) => -v));
        return addMatrices(matrixA, negB);
      }
      if (operation === 'multiply') return multiplyMatrices(matrixA, matrixB);
      if (operation === 'transpose') return transposeMatrix(matrixA);
      if (operation === 'determinant') {
        const det = calculateDeterminant(matrixA);
        // Check for valid number (not NaN or Infinity)
        if (!Number.isFinite(det)) return null;
        return det;
      }
    } catch {
      return null;
    }
    return null;
  }, [operation, matrixA, matrixB, canPerform]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-800 text-blue-600">
            [M]
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Matrix Master</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Advanced linear algebra solver
            </p>
          </div>
        </div>

        {/* Operation Picker */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          {[
            { id: 'add', label: 'A + B' },
            { id: 'subtract', label: 'A − B' },
            { id: 'multiply', label: 'A × B' },
            { id: 'determinant', label: 'det(A)' },
            { id: 'transpose', label: 'trans(A)' },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id as Operation)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                operation === op.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8">
          {/* Matrix A */}
          <MatrixView
            m={matrixA}
            title="Matrix A"
            onUpdate={(r, c, v) => updateCell('A', r, c, v)}
            onResize={handleResizeA}
          />

          {/* Operation Symbol */}
          <div className="flex flex-col items-center justify-center text-3xl font-bold text-slate-300">
            {operation === 'add' && '+'}
            {operation === 'subtract' && '−'}
            {operation === 'multiply' && '×'}
            {(operation === 'determinant' || operation === 'transpose') && '→'}
          </div>

          {/* Matrix B or Spacer */}
          {operation === 'add' || operation === 'subtract' || operation === 'multiply' ? (
            <MatrixView
              m={matrixB}
              title="Matrix B"
              onUpdate={(r, c, v) => updateCell('B', r, c, v)}
              onResize={handleResizeB}
            />
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950 aspect-video rounded-xl flex items-center justify-center text-slate-400 text-xs italic border border-slate-100 dark:border-slate-800">
              {operation === 'determinant' ? 'Singular Value Target' : 'Row-Column Swap'}
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Calculation Result</h3>

          {!canPerform ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              ⚠️ <span>Invalid dimensions for this operation.</span>
            </div>
          ) : result === null ? (
            <div className="text-slate-400 italic text-sm">Waiting for input...</div>
          ) : typeof result === 'number' && !Number.isNaN(result) ? (
            <div className="px-8 py-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border-2 border-blue-600 text-4xl font-mono font-black text-blue-700 dark:text-blue-300">
              {result.toString()}
            </div>
          ) : Array.isArray(result) ? (
            <MatrixView m={result} title="Result Matrix" />
          ) : (
            <div className="text-slate-400 italic text-sm">Invalid result</div>
          )}
        </div>
      </div>
    </div>
  );
}
