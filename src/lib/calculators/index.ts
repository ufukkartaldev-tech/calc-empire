/**
 * @file index.ts
 * @description Barrel export for all calculator solvers
 *
 * To add a new solver:
 * 1. Create the solver file in this directory
 * 2. Export the solve function from this file
 * 3. Add it to the exports below
 */

export { solve as ohmSolve } from './ohm';
export { solve as kirchhoffSolve } from './kirchhoff';
export { solve as powerSolve } from './power';
export { solve as resistorSolve } from './resistor';
export { solve as bodeSolve } from './bode';
export { solve as beamSolve } from './beam';
export { solve as stressStrainSolve } from './stressStrain';
export { solve as shearMomentSolve } from './shearMoment';
export { solve as concreteSectionSolve } from './concreteSection';
export { solve as soilMechanicsSolve } from './soilMechanics';
export { solve as baseConverterSolve } from './baseConverter';
export { solve as cronParserSolve } from './cronParser';
export { solve as jsonFormatterSolve } from './jsonFormatter';
export { solve as periodicTableSolve } from './periodicTable';
export { solve as idealGasSolve } from './idealGas';
export { solve as bernoulliSolve } from './bernoulli';
export { solve as pressureLossSolve } from './pressureLoss';
export { solve as normalSolve } from './normal';
export { solve as basicStatsSolve } from './basicStats';
export { solve as discreteDistSolve } from './discreteDist';
export { solve as dataVizSolve } from './dataViz';
export { solve as calculusSolve } from './calculus';
export { solve as matrixSolve } from './matrix';
export { solve as geometrySolve } from './geometry';
export { solve as functionPlotSolve } from './functionPlot';
export { solve as compoundInterestSolve } from './compoundInterest';
export { solve as cryptoPnlSolve } from './cryptoPnl';
export { solve as unitConverterSolve } from './unitConverter';
