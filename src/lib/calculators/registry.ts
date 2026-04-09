import type { SolveFn, AsyncSolveFn } from '@/types';
import { toCalculatorError } from '@/lib/errors/CalculatorError';
import { solverWorkerManager } from '@/lib/workers/solverWorkerManager';

/**
 * Dynamic solver registry using barrel exports for centralized imports.
 * 
 * To add a new solver:
 * 1. Create the solver file in src/lib/calculators/ (e.g., 'newSolver.ts')
 * 2. Export the solve function: export const solve: SolveFn = ...
 * 3. Add it to src/lib/calculators/index.ts barrel export
 * 4. Add it to the SOLVER_MAP below with the corresponding key
 * 
 * This approach centralizes solver exports and reduces manual import duplication.
 * All solver errors are automatically converted to structured CalculatorError types.
 * Heavy solvers automatically use Web Workers for non-blocking execution.
 */

// Import all solvers from barrel export
import * as solvers from './index';

/**
 * Map of solver keys to their corresponding solver function names.
 * New solvers should be added here with their key and function name.
 */
const SOLVER_MAP: Record<string, keyof typeof solvers> = {
  ohm: 'ohmSolve',
  kirchhoff: 'kirchhoffSolve',
  power: 'powerSolve',
  resistor: 'resistorSolve',
  bode: 'bodeSolve',
  beam: 'beamSolve',
  stressStrain: 'stressStrainSolve',
  shearMoment: 'shearMomentSolve',
  concreteSection: 'concreteSectionSolve',
  soilMechanics: 'soilMechanicsSolve',
  baseConverter: 'baseConverterSolve',
  cronParser: 'cronParserSolve',
  jsonFormatter: 'jsonFormatterSolve',
  periodicTable: 'periodicTableSolve',
  idealGas: 'idealGasSolve',
  bernoulli: 'bernoulliSolve',
  pressureLoss: 'pressureLossSolve',
  normal: 'normalSolve',
  basicStats: 'basicStatsSolve',
  discreteDist: 'discreteDistSolve',
  dataViz: 'dataVizSolve',
  calculus: 'calculusSolve',
  matrix: 'matrixSolve',
  geometry: 'geometrySolve',
  functionPlot: 'functionPlotSolve',
  compoundInterest: 'compoundInterestSolve',
  cryptoPnl: 'cryptoPnlSolve',
  unitConverter: 'unitConverterSolve',
};

/**
 * Wrap a solver function with error handling that converts errors to CalculatorError
 */
function wrapSolver(solver: SolveFn, solverKey: string): SolveFn {
  return (values) => {
    try {
      return solver(values);
    } catch (error) {
      // Convert generic errors to structured CalculatorError types
      throw toCalculatorError(error);
    }
  };
}

/**
 * Registry of all available calculator solvers.
 * This identifies logic at runtime based on a serializable key stored in the config.
 * Built dynamically from the SOLVER_MAP and barrel exports.
 * All solvers are wrapped with error handling for consistent error types.
 * Heavy solvers automatically use Web Workers for non-blocking execution.
 */
export const SOLVER_REGISTRY: Record<string, SolveFn> = Object.entries(
  SOLVER_MAP
).reduce(
  (acc, [key, solverName]) => {
    const solver = solvers[solverName] as SolveFn;
    if (solver) {
      // Wrap solver with error handling
      acc[key] = wrapSolver(solver, key);
    }
    return acc;
  },
  {} as Record<string, SolveFn>
);

/**
 * Async solver registry for heavy calculations that use Web Workers.
 * Returns Promise<SolveResult> for non-blocking execution.
 */
export const ASYNC_SOLVER_REGISTRY: Record<string, AsyncSolveFn> = Object.entries(
  SOLVER_MAP
).reduce(
  (acc, [key, solverName]) => {
    const solver = solvers[solverName] as SolveFn;
    if (solver) {
      // Create async wrapper that uses Web Worker for heavy solvers
      acc[key] = async (values) => {
        return solverWorkerManager.execute(key, values, wrapSolver(solver, key));
      };
    }
    return acc;
  },
  {} as Record<string, AsyncSolveFn>
);
