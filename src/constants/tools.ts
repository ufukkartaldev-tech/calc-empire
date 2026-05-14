/**
 * @file constants/tools.ts
 * @description Centralized tool identifiers and their mapping to solver functions.
 */

/**
 * Map of solver keys (ToolId) to their corresponding solver function names in the barrel export.
 * This is the single source of truth for all calculator IDs in the system.
 */
export const SOLVER_MAP = {
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
  quadraticSolver: 'quadraticSolverSolve',
  molarity: 'molaritySolve',
  capacitorCharge: 'capacitorChargeSolve',
  springConstant: 'springConstantSolve',
} as const;

/**
 * Strict ToolId type automatically derived from SOLVER_MAP keys.
 */
export type ToolId = keyof typeof SOLVER_MAP;

/**
 * Nullable variant for state management.
 */
export type NullableToolId = ToolId | null;
