import React from 'react';
import type { ToolId } from './tools.config';
import {
  // Electrical
  ResistorVisualizer,
  OhmCalculator,
  KirchhoffCalculator,
  PowerCalculator,
  BodePlotVisualizer,
  // Mechanical
  BeamDeflectionVisualizer,
  StressStrainCalculator,
  ShearMomentCalculator,
  // Civil
  ConcreteSectionCalculator,
  SoilMechanicsCalculator,
  // Software
  BaseConverter,
  CronParser,
  JsonFormatter,
  // Chemistry
  PeriodicTableVisualizer,
  IdealGasCalculator,
  // Fluid
  BernoulliCalculator,
  PressureLossCalculator,
  // Statistics
  NormalDistributionChart,
  BasicStatisticsCalculator,
  DiscreteDistributionVisualizer,
  DataVisualizer,
  // Mathematics
  CalculusCalculator,
  MatrixCalculator,
  GeometryCalculator,
  FunctionPlotVisualizer,
  // Finance
  CompoundInterestCalculator,
  CryptoPnlCalculator,
  // Converters
  UnitConverter,
} from '../calculators';

type ToolRendererProps = {
  activeTool: ToolId;
};

export const ToolRenderer: React.FC<ToolRendererProps> = ({ activeTool }) => {
  switch (activeTool) {
    // Electrical
    case 'ohm':
      return <OhmCalculator />;
    case 'resistor':
      return <ResistorVisualizer />;
    case 'kirchhoff':
      return <KirchhoffCalculator />;
    case 'power':
      return <PowerCalculator />;
    case 'bode':
      return <BodePlotVisualizer />;

    // Mechanical
    case 'beam':
      return <BeamDeflectionVisualizer />;
    case 'stressStrain':
      return <StressStrainCalculator />;
    case 'shearMoment':
      return <ShearMomentCalculator />;

    // Civil
    case 'concreteSection':
      return <ConcreteSectionCalculator />;
    case 'soilMechanics':
      return <SoilMechanicsCalculator />;

    // Software
    case 'baseConverter':
      return <BaseConverter />;
    case 'cronParser':
      return <CronParser />;
    case 'jsonFormatter':
      return <JsonFormatter />;

    // Chemistry
    case 'periodicTable':
      return <PeriodicTableVisualizer />;
    case 'idealGas':
      return <IdealGasCalculator />;

    // Finance
    case 'compoundInterest':
      return <CompoundInterestCalculator />;
    case 'cryptoPnl':
      return <CryptoPnlCalculator />;

    // Fluid
    case 'bernoulli':
      return <BernoulliCalculator />;
    case 'pressureLoss':
      return <PressureLossCalculator />;

    // Statistics
    case 'normal':
      return <NormalDistributionChart />;
    case 'basicStats':
      return <BasicStatisticsCalculator />;
    case 'discreteDist':
      return <DiscreteDistributionVisualizer />;
    case 'dataViz':
      return <DataVisualizer />;

    // Mathematics
    case 'calculus':
      return <CalculusCalculator />;
    case 'matrix':
      return <MatrixCalculator />;
    case 'geometry':
      return <GeometryCalculator />;
    case 'functionPlot':
      return <FunctionPlotVisualizer />;

    // Converters
    case 'unitConverter':
      return <UnitConverter />;

    default:
      return null;
  }
};
