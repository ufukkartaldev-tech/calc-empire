/**
 * @file solverWorkerManager.ts
 * @description Web Worker manager for calculator solver functions
 * Provides a pool of workers for parallel execution of heavy calculations
 */

import type { FieldValues, SolveResult } from '@/types';
import type { SolverWorkerInput, SolverWorkerResponse } from './solver.worker';

// List of solvers that should use Web Workers for heavy calculations
const HEAVY_SOLVERS = new Set([
  'matrix', // Matrix operations (determinant, multiplication)
  'calculus', // Numerical integration/differentiation
  'functionPlot', // Plot point generation
  'basicStats', // Statistical calculations with arrays
  'discreteDist', // Discrete distributions
  'dataViz', // Data visualization calculations
  'kirchhoff', // Circuit analysis (already has dedicated worker)
  'bode', // Bode plot calculations (already has dedicated worker)
]);

/**
 * Web Worker Manager for calculator solvers
 * Manages worker lifecycle and provides async execution interface
 */
export class SolverWorkerManager {
  private static instance: SolverWorkerManager;
  private workers: Map<string, Worker> = new Map();
  private pendingPromises: Map<string, {
    resolve: (value: SolverWorkerResponse) => void;
    reject: (error: Error) => void;
  }> = new Map();

  private constructor() {}

  static getInstance(): SolverWorkerManager {
    if (!SolverWorkerManager.instance) {
      SolverWorkerManager.instance = new SolverWorkerManager();
    }
    return SolverWorkerManager.instance;
  }

  /**
   * Execute a solver using Web Worker if it's marked as heavy
   * Falls back to synchronous execution for light solvers
   */
  async execute(
    solverKey: string,
    values: FieldValues,
    syncSolver: (values: FieldValues) => SolveResult
  ): Promise<SolveResult> {
    // Check if this solver should use Web Worker
    if (!HEAVY_SOLVERS.has(solverKey)) {
      // Use synchronous execution for light solvers
      return syncSolver(values);
    }

    // Use Web Worker for heavy solvers
    return this.executeInWorker(solverKey, values);
  }

  /**
   * Execute solver in Web Worker
   */
  private async executeInWorker(
    solverKey: string,
    values: FieldValues
  ): Promise<SolveResult> {
    const requestId = `${solverKey}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    try {
      // Get or create worker for this solver
      let worker = this.workers.get(solverKey);

      if (!worker) {
        worker = new Worker(
          new URL('./solver.worker.ts', import.meta.url),
          { type: 'module' }
        );
        this.workers.set(solverKey, worker);

        // Set up message handler once per worker
        // Uses response.requestId to correctly match with pending promise
        worker.onmessage = (e: MessageEvent<SolverWorkerResponse>) => {
          const { requestId: responseRequestId } = e.data;
          const pending = this.pendingPromises.get(responseRequestId);
          if (pending) {
            pending.resolve(e.data);
            this.pendingPromises.delete(responseRequestId);
          }
        };

        worker.onerror = (error) => {
          // On worker error, reject all pending promises for this worker
          this.pendingPromises.forEach((pending, key) => {
            if (key.startsWith(`${solverKey}-`)) {
              pending.reject(new Error(error.message || 'Worker error'));
              this.pendingPromises.delete(key);
            }
          });
        };

        worker.onmessageerror = (error) => {
          // Handle message deserialization errors
          this.pendingPromises.forEach((pending, key) => {
            if (key.startsWith(`${solverKey}-`)) {
              pending.reject(new Error('Worker message error: ' + error.toString()));
              this.pendingPromises.delete(key);
            }
          });
        };
      }

      // Create promise for this request
      const promise = new Promise<SolverWorkerResponse>((resolve, reject) => {
        this.pendingPromises.set(requestId, { resolve, reject });
      });

      // Send request to worker with requestId for proper matching
      const input: SolverWorkerInput = { solverKey, values, requestId };
      worker.postMessage(input);

      // Wait for response
      const response = await promise;

      if (response.success) {
        return response.data.result as SolveResult;
      } else {
        throw new Error(response.error.message);
      }
    } catch (error) {
      // Clean up pending promise on error
      this.pendingPromises.delete(requestId);
      // Clean up worker on error
      this.terminateWorker(solverKey);
      throw error;
    }
  }

  /**
   * Terminate a specific worker
   */
  private terminateWorker(solverKey: string): void {
    const worker = this.workers.get(solverKey);
    if (worker) {
      worker.terminate();
      this.workers.delete(solverKey);
    }
  }

  /**
   * Terminate all workers
   */
  terminateAll(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers.clear();
    this.pendingPromises.clear();
  }

  /**
   * Check if a solver uses Web Worker
   */
  isAsyncSolver(solverKey: string): boolean {
    return HEAVY_SOLVERS.has(solverKey);
  }
}

// Export singleton instance
export const solverWorkerManager = SolverWorkerManager.getInstance();
