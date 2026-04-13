/**
 * @file solver.worker.ts
 * @description Generic Web Worker for calculator solver functions
 * Executes heavy calculations in a separate thread to prevent UI blocking
 */

import { toCalculatorError } from '@/lib/errors/CalculatorError';
import * as solvers from '../calculators/index';

export type SolverWorkerInput = {
  solverKey: string;
  values: Record<string, { value: number | null; unit: string }>;
  requestId: string;
};

export type SolverWorkerOutput = {
  result: Record<string, unknown>;
};

export type SolverWorkerResponse =
  | { success: true; data: SolverWorkerOutput; requestId: string }
  | { success: false; error: { message: string; code: string; context?: Record<string, unknown> }; requestId: string };

self.onmessage = (e: MessageEvent<SolverWorkerInput>) => {
  const { solverKey, values, requestId } = e.data;

  try {

    // Get the solver function from the barrel export
    const solverName = `${solverKey}Solve` as keyof typeof solvers;
    const solver = solvers[solverName];

    if (!solver || typeof solver !== 'function') {
      throw new Error(`Solver not found: ${solverKey}`);
    }

    // Execute the solver
    const result = solver(values);

    self.postMessage({ success: true, data: { result }, requestId } as SolverWorkerResponse);
  } catch (error) {
    // Convert error to CalculatorError for consistent error handling
    const calculatorError = toCalculatorError(error);
    
    self.postMessage({
      success: false,
      error: {
        message: calculatorError.message,
        code: calculatorError.code,
        context: calculatorError.context,
      },
      requestId,
    } as SolverWorkerResponse);
  }
};
