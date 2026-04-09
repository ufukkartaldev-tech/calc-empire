import type { SolveFn } from '@/types';

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
 * Registry of all available calculator solvers.
 * This identifies logic at runtime based on a serializable key stored in the config.
 * Built dynamically from the SOLVER_MAP and barrel exports.
 */
export const SOLVER_REGISTRY: Record<string, SolveFn> = Object.entries(
  SOLVER_MAP
).reduce(
  (acc, [key, solverName]) => {
    const solver = solvers[solverName] as SolveFn;
    if (solver) {
      acc[key] = solver;
    }
    return acc;
  },
  {} as Record<string, SolveFn>
);
