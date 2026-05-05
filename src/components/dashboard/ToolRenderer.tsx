import React from 'react';
import type { ToolId } from '@/types';
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
      // This should never happen if ToolId type is properly maintained
      return (
        <div className="w-full max-w-2xl mx-auto p-8">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔧</span>
            </div>
            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">
              Calculator Not Available
            </h2>
            <p className="text-amber-700 dark:text-amber-500 mb-4">
              The calculator &quot;{activeTool}&quot; is not implemented yet or is temporarily
              unavailable.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
  }
};
