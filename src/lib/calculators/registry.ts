import type { SolveFn } from '@/types';

// Import all solvers
import { solve as ohmSolve } from './ohm';
import { solve as kirchhoffSolve } from './kirchhoff';
import { solve as powerSolve } from './power';
import { solve as resistorSolve } from './resistor';
import { solve as bodeSolve } from './bode';
import { solve as beamSolve } from './beam';
import { solve as stressStrainSolve } from './stressStrain';
import { solve as shearMomentSolve } from './shearMoment';
import { solve as concreteSectionSolve } from './concreteSection';
import { solve as soilMechanicsSolve } from './soilMechanics';
import { solve as baseConverterSolve } from './baseConverter';
import { solve as cronParserSolve } from './cronParser';
import { solve as jsonFormatterSolve } from './jsonFormatter';
import { solve as periodicTableSolve } from './periodicTable';
import { solve as idealGasSolve } from './idealGas';
import { solve as bernoulliSolve } from './bernoulli';
import { solve as pressureLossSolve } from './pressureLoss';
import { solve as normalSolve } from './normal';
import { solve as basicStatsSolve } from './basicStats';
import { solve as discreteDistSolve } from './discreteDist';
import { solve as dataVizSolve } from './dataViz';
import { solve as calculusSolve } from './calculus';
import { solve as matrixSolve } from './matrix';
import { solve as geometrySolve } from './geometry';
import { solve as functionPlotSolve } from './functionPlot';
import { solve as compoundInterestSolve } from './compoundInterest';
import { solve as cryptoPnlSolve } from './cryptoPnl';
import { solve as unitConverterSolve } from './unitConverter';

/**
 * Registry of all available calculator solvers.
 * This identifies logic at runtime based on a serializable key stored in the config.
 */
export const SOLVER_REGISTRY: Record<string, SolveFn> = {
  ohm: ohmSolve,
  kirchhoff: kirchhoffSolve,
  power: powerSolve,
  resistor: resistorSolve,
  bode: bodeSolve,
  beam: beamSolve,
  stressStrain: stressStrainSolve,
  shearMoment: shearMomentSolve,
  concreteSection: concreteSectionSolve,
  soilMechanics: soilMechanicsSolve,
  baseConverter: baseConverterSolve,
  cronParser: cronParserSolve,
  jsonFormatter: jsonFormatterSolve,
  periodicTable: periodicTableSolve,
  idealGas: idealGasSolve,
  bernoulli: bernoulliSolve,
  pressureLoss: pressureLossSolve,
  normal: normalSolve,
  basicStats: basicStatsSolve,
  discreteDist: discreteDistSolve,
  dataViz: dataVizSolve,
  calculus: calculusSolve,
  matrix: matrixSolve,
  geometry: geometrySolve,
  functionPlot: functionPlotSolve,
  compoundInterest: compoundInterestSolve,
  cryptoPnl: cryptoPnlSolve,
  unitConverter: unitConverterSolve,
};
