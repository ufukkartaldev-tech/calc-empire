import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { ToolId } from '@/types';
import { LoadingCard } from '../ui/loading';

// Loading fallback component
const Loading = () => <LoadingCard title="Yükleniyor..." />;

// --- Dynamic Import Map ---

const TOOL_COMPONENTS: Partial<Record<ToolId, React.ComponentType>> = {
  // Electrical
  ohm: dynamic(
    () => import('../calculators/electrical/OhmCalculator').then((mod) => mod.OhmCalculator),
    { loading: Loading }
  ),
  resistor: dynamic(
    () =>
      import('../calculators/electrical/ResistorVisualizer').then((mod) => mod.ResistorVisualizer),
    { loading: Loading }
  ),
  kirchhoff: dynamic(
    () =>
      import('../calculators/electrical/KirchhoffCalculator').then(
        (mod) => mod.KirchhoffCalculator
      ),
    { loading: Loading }
  ),
  power: dynamic(
    () => import('../calculators/electrical/PowerCalculator').then((mod) => mod.PowerCalculator),
    { loading: Loading }
  ),
  bode: dynamic(
    () =>
      import('../calculators/electrical/BodePlotVisualizer').then((mod) => mod.BodePlotVisualizer),
    { loading: Loading }
  ),

  // Mechanical
  beam: dynamic(
    () =>
      import('../calculators/mechanical/BeamDeflectionVisualizer').then(
        (mod) => mod.BeamDeflectionVisualizer
      ),
    { loading: Loading }
  ),
  stressStrain: dynamic(
    () =>
      import('../calculators/mechanical/StressStrainCalculator').then(
        (mod) => mod.StressStrainCalculator
      ),
    { loading: Loading }
  ),
  shearMoment: dynamic(
    () =>
      import('../calculators/mechanical/ShearMomentCalculator').then(
        (mod) => mod.ShearMomentCalculator
      ),
    { loading: Loading }
  ),

  // Civil
  concreteSection: dynamic(
    () =>
      import('../calculators/civil/ConcreteSectionCalculator').then(
        (mod) => mod.ConcreteSectionCalculator
      ),
    { loading: Loading }
  ),
  soilMechanics: dynamic(
    () =>
      import('../calculators/civil/SoilMechanicsCalculator').then(
        (mod) => mod.SoilMechanicsCalculator
      ),
    { loading: Loading }
  ),

  // Software
  baseConverter: dynamic(
    () => import('../calculators/software/BaseConverter').then((mod) => mod.BaseConverter),
    { loading: Loading }
  ),
  cronParser: dynamic(
    () => import('../calculators/software/CronParser').then((mod) => mod.CronParser),
    { loading: Loading }
  ),
  jsonFormatter: dynamic(
    () => import('../calculators/software/JsonFormatter').then((mod) => mod.JsonFormatter),
    { loading: Loading }
  ),

  // Chemistry
  periodicTable: dynamic(
    () =>
      import('../calculators/chemistry/PeriodicTableVisualizer').then(
        (mod) => mod.PeriodicTableVisualizer
      ),
    { loading: Loading }
  ),
  idealGas: dynamic(
    () =>
      import('../calculators/chemistry/IdealGasCalculator').then((mod) => mod.IdealGasCalculator),
    { loading: Loading }
  ),

  // Finance
  compoundInterest: dynamic(
    () =>
      import('../calculators/finance/CompoundInterestCalculator').then(
        (mod) => mod.CompoundInterestCalculator
      ),
    { loading: Loading }
  ),
  cryptoPnl: dynamic(
    () =>
      import('../calculators/finance/CryptoPnlCalculator').then((mod) => mod.CryptoPnlCalculator),
    { loading: Loading }
  ),

  // Fluid
  bernoulli: dynamic(
    () => import('../calculators/fluid/BernoulliCalculator').then((mod) => mod.BernoulliCalculator),
    { loading: Loading }
  ),
  pressureLoss: dynamic(
    () =>
      import('../calculators/fluid/PressureLossCalculator').then(
        (mod) => mod.PressureLossCalculator
      ),
    { loading: Loading }
  ),

  // Statistics
  normal: dynamic(
    () =>
      import('../calculators/statistics/NormalDistributionChart').then(
        (mod) => mod.NormalDistributionChart
      ),
    { loading: Loading }
  ),
  basicStats: dynamic(
    () =>
      import('../calculators/statistics/BasicStatisticsCalculator').then(
        (mod) => mod.BasicStatisticsCalculator
      ),
    { loading: Loading }
  ),
  discreteDist: dynamic(
    () =>
      import('../calculators/statistics/DiscreteDistributionVisualizer').then(
        (mod) => mod.DiscreteDistributionVisualizer
      ),
    { loading: Loading }
  ),
  dataViz: dynamic(
    () => import('../calculators/statistics/DataVisualizer').then((mod) => mod.DataVisualizer),
    { loading: Loading }
  ),

  // Mathematics
  calculus: dynamic(
    () =>
      import('../calculators/mathematics/CalculusCalculator').then((mod) => mod.CalculusCalculator),
    { loading: Loading }
  ),
  matrix: dynamic(
    () => import('../calculators/mathematics/MatrixCalculator').then((mod) => mod.MatrixCalculator),
    { loading: Loading }
  ),
  geometry: dynamic(
    () =>
      import('../calculators/mathematics/GeometryCalculator').then((mod) => mod.GeometryCalculator),
    { loading: Loading }
  ),
  functionPlot: dynamic(
    () =>
      import('../calculators/mathematics/FunctionPlotVisualizer').then(
        (mod) => mod.FunctionPlotVisualizer
      ),
    { loading: Loading }
  ),

  // Converters
  unitConverter: dynamic(
    () => import('../calculators/converters/UnitConverter').then((mod) => mod.UnitConverter),
    { loading: Loading }
  ),
};

type ToolRendererProps = {
  activeTool: ToolId;
};

export const ToolRenderer: React.FC<ToolRendererProps> = ({ activeTool }) => {
  const Component = TOOL_COMPONENTS[activeTool];

  if (Component) {
    return (
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    );
  }

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
};
