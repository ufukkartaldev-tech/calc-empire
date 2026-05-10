import React from 'react';
import dynamic from 'next/dynamic';
import type { ToolId } from '@/types';
import { LoadingCard } from '../ui/loading';

// Loading fallback component
const Loading = () => <LoadingCard title="Yükleniyor..." />;

// --- Dynamic Imports ---

// Electrical
const OhmCalculator = dynamic(
  () => import('../calculators/electrical/OhmCalculator').then((mod) => mod.OhmCalculator),
  { loading: Loading }
);
const ResistorVisualizer = dynamic(
  () =>
    import('../calculators/electrical/ResistorVisualizer').then((mod) => mod.ResistorVisualizer),
  { loading: Loading }
);
const KirchhoffCalculator = dynamic(
  () =>
    import('../calculators/electrical/KirchhoffCalculator').then((mod) => mod.KirchhoffCalculator),
  { loading: Loading }
);
const PowerCalculator = dynamic(
  () => import('../calculators/electrical/PowerCalculator').then((mod) => mod.PowerCalculator),
  { loading: Loading }
);
const BodePlotVisualizer = dynamic(
  () =>
    import('../calculators/electrical/BodePlotVisualizer').then((mod) => mod.BodePlotVisualizer),
  { loading: Loading }
);

// Mechanical
const BeamDeflectionVisualizer = dynamic(
  () =>
    import('../calculators/mechanical/BeamDeflectionVisualizer').then(
      (mod) => mod.BeamDeflectionVisualizer
    ),
  { loading: Loading }
);
const StressStrainCalculator = dynamic(
  () =>
    import('../calculators/mechanical/StressStrainCalculator').then(
      (mod) => mod.StressStrainCalculator
    ),
  { loading: Loading }
);
const ShearMomentCalculator = dynamic(
  () =>
    import('../calculators/mechanical/ShearMomentCalculator').then(
      (mod) => mod.ShearMomentCalculator
    ),
  { loading: Loading }
);

// Civil
const ConcreteSectionCalculator = dynamic(
  () =>
    import('../calculators/civil/ConcreteSectionCalculator').then(
      (mod) => mod.ConcreteSectionCalculator
    ),
  { loading: Loading }
);
const SoilMechanicsCalculator = dynamic(
  () =>
    import('../calculators/civil/SoilMechanicsCalculator').then(
      (mod) => mod.SoilMechanicsCalculator
    ),
  { loading: Loading }
);

// Software
const BaseConverter = dynamic(
  () => import('../calculators/software/BaseConverter').then((mod) => mod.BaseConverter),
  { loading: Loading }
);
const CronParser = dynamic(
  () => import('../calculators/software/CronParser').then((mod) => mod.CronParser),
  { loading: Loading }
);
const JsonFormatter = dynamic(
  () => import('../calculators/software/JsonFormatter').then((mod) => mod.JsonFormatter),
  { loading: Loading }
);

// Chemistry
const PeriodicTableVisualizer = dynamic(
  () =>
    import('../calculators/chemistry/PeriodicTableVisualizer').then(
      (mod) => mod.PeriodicTableVisualizer
    ),
  { loading: Loading }
);
const IdealGasCalculator = dynamic(
  () => import('../calculators/chemistry/IdealGasCalculator').then((mod) => mod.IdealGasCalculator),
  { loading: Loading }
);

// Finance
const CompoundInterestCalculator = dynamic(
  () =>
    import('../calculators/finance/CompoundInterestCalculator').then(
      (mod) => mod.CompoundInterestCalculator
    ),
  { loading: Loading }
);
const CryptoPnlCalculator = dynamic(
  () => import('../calculators/finance/CryptoPnlCalculator').then((mod) => mod.CryptoPnlCalculator),
  { loading: Loading }
);

// Fluid
const BernoulliCalculator = dynamic(
  () => import('../calculators/fluid/BernoulliCalculator').then((mod) => mod.BernoulliCalculator),
  { loading: Loading }
);
const PressureLossCalculator = dynamic(
  () =>
    import('../calculators/fluid/PressureLossCalculator').then((mod) => mod.PressureLossCalculator),
  { loading: Loading }
);

// Statistics
const NormalDistributionChart = dynamic(
  () =>
    import('../calculators/statistics/NormalDistributionChart').then(
      (mod) => mod.NormalDistributionChart
    ),
  { loading: Loading }
);
const BasicStatisticsCalculator = dynamic(
  () =>
    import('../calculators/statistics/BasicStatisticsCalculator').then(
      (mod) => mod.BasicStatisticsCalculator
    ),
  { loading: Loading }
);
const DiscreteDistributionVisualizer = dynamic(
  () =>
    import('../calculators/statistics/DiscreteDistributionVisualizer').then(
      (mod) => mod.DiscreteDistributionVisualizer
    ),
  { loading: Loading }
);
const DataVisualizer = dynamic(
  () => import('../calculators/statistics/DataVisualizer').then((mod) => mod.DataVisualizer),
  { loading: Loading }
);

// Mathematics
const CalculusCalculator = dynamic(
  () =>
    import('../calculators/mathematics/CalculusCalculator').then((mod) => mod.CalculusCalculator),
  { loading: Loading }
);
const MatrixCalculator = dynamic(
  () => import('../calculators/mathematics/MatrixCalculator').then((mod) => mod.MatrixCalculator),
  { loading: Loading }
);
const GeometryCalculator = dynamic(
  () =>
    import('../calculators/mathematics/GeometryCalculator').then((mod) => mod.GeometryCalculator),
  { loading: Loading }
);
const FunctionPlotVisualizer = dynamic(
  () =>
    import('../calculators/mathematics/FunctionPlotVisualizer').then(
      (mod) => mod.FunctionPlotVisualizer
    ),
  { loading: Loading }
);

// Converters
const UnitConverter = dynamic(
  () => import('../calculators/converters/UnitConverter').then((mod) => mod.UnitConverter),
  { loading: Loading }
);

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
