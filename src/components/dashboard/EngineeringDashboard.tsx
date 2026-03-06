'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  // Electrical
  ResistorVisualizer, OhmCalculator, KirchhoffCalculator, PowerCalculator, BodePlotVisualizer,
  // Mechanical
  BeamDeflectionVisualizer, StressStrainCalculator, ShearMomentVisualizer,
  // Civil
  ConcreteSectionCalculator, SoilMechanicsCalculator,
  // Software
  BaseConverter, CronParser, JsonFormatter,
  // Chemistry
  PeriodicTableVisualizer, IdealGasCalculator,
  // Fluid
  BernoulliCalculator, PressureLossCalculator,
  // Statistics
  NormalDistributionChart, BasicStatisticsCalculator, DiscreteDistributionVisualizer, DataVisualizer,
  // Mathematics
  CalculusCalculator, MatrixCalculator, GeometryCalculator, FunctionPlotVisualizer,
  // Finance
  CompoundInterestCalculator, CryptoPnlCalculator,
  // Converters
  UnitConverter
} from '../calculators';

type ToolId =
  | 'ohm' | 'resistor' | 'kirchhoff' | 'power' | 'bode'
  | 'beam' | 'stressStrain' | 'shearMoment'
  | 'concreteSection' | 'soilMechanics'
  | 'baseConverter' | 'cronParser' | 'jsonFormatter'
  | 'periodicTable' | 'idealGas'
  | 'bernoulli' | 'pressureLoss'
  | 'normal' | 'basicStats' | 'discreteDist' | 'dataViz'
  | 'calculus' | 'matrix' | 'geometry' | 'functionPlot'
  | 'compoundInterest' | 'cryptoPnl'
  | 'unitConverter' | null;

export function EngineeringDashboard() {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  const renderTool = () => {
    switch (activeTool) {
      // Electrical
      case 'ohm': return <OhmCalculator />;
      case 'resistor': return <ResistorVisualizer />;
      case 'kirchhoff': return <KirchhoffCalculator />;
      case 'power': return <PowerCalculator />;
      case 'bode': return <BodePlotVisualizer />;

      // Mechanical
      case 'beam': return <BeamDeflectionVisualizer />;
      case 'stressStrain': return <StressStrainCalculator />;
      case 'shearMoment': return <ShearMomentVisualizer />;

      // Civil
      case 'concreteSection': return <ConcreteSectionCalculator />;
      case 'soilMechanics': return <SoilMechanicsCalculator />;

      // Software
      case 'baseConverter': return <BaseConverter />;
      case 'cronParser': return <CronParser />;
      case 'jsonFormatter': return <JsonFormatter />;

      // Chemistry
      case 'periodicTable': return <PeriodicTableVisualizer />;
      case 'idealGas': return <IdealGasCalculator />;

      // Finance
      case 'compoundInterest': return <CompoundInterestCalculator />;
      case 'cryptoPnl': return <CryptoPnlCalculator />;

      // Fluid
      case 'bernoulli': return <BernoulliCalculator />;
      case 'pressureLoss': return <PressureLossCalculator />;

      // Statistics
      case 'normal': return <NormalDistributionChart />;
      case 'basicStats': return <BasicStatisticsCalculator />;
      case 'discreteDist': return <DiscreteDistributionVisualizer />;
      case 'dataViz': return <DataVisualizer />;

      // Mathematics
      case 'calculus': return <CalculusCalculator />;
      case 'matrix': return <MatrixCalculator />;
      case 'geometry': return <GeometryCalculator />;
      case 'functionPlot': return <FunctionPlotVisualizer />;

      // Converters
      case 'unitConverter': return <UnitConverter />;

      default: return null;
    }
  };

  if (activeTool) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-20">
        <div className="w-full flex justify-start mb-6">
          <button
            onClick={() => setActiveTool(null)}
            className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span>←</span> {tDash('backButton')}
          </button>
        </div>
        <div className="w-full flex justify-center">
          {renderTool()}
        </div>
      </div>
    );
  }

  const renderCard = (id: ToolId, titleKey: string, descKey: string) => (
    <button
      key={id}
      onClick={() => setActiveTool(id)}
      className="group w-full flex flex-col items-start p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer text-left"
    >
      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {tDash(titleKey as any)}
      </span>
      <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
        {tDash(descKey as any)}
      </span>
    </button>
  );

  const Section = ({ icon, title, children }: { icon: string, title: string, children: React.ReactNode }) => (
    <div className="mb-14">
      <div className="flex items-center space-x-4 mb-6 pb-3 border-b-2 border-slate-100 dark:border-slate-800/80">
        <span className="text-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-sm">
          {icon}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">

      <div className="mb-16 mt-6 md:mt-10 text-center flex flex-col items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">{tDash('title')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {tDash('subtitle')}
        </p>
      </div>

      <div className="flex flex-col w-full">

        <Section icon="⚡" title={tCat('electrical')}>
          {renderCard('ohm', 'ohmTitle', 'ohmDesc')}
          {renderCard('kirchhoff', 'kirchhoffTitle', 'kirchhoffDesc')}
          {renderCard('power', 'powerTitle', 'powerDesc')}
          {renderCard('resistor', 'resistorTitle', 'resistorDesc')}
          {renderCard('bode', 'bodeTitle', 'bodeDesc')}
        </Section>

        <Section icon="💻" title={tCat('software')}>
          {renderCard('baseConverter', 'baseConverterTitle', 'baseConverterDesc')}
          {renderCard('cronParser', 'cronParserTitle', 'cronParserDesc')}
          {renderCard('jsonFormatter', 'jsonFormatterTitle', 'jsonFormatterDesc')}
        </Section>

        <Section icon="💰" title={tCat('finance')}>
          {renderCard('compoundInterest', 'compoundInterestTitle', 'compoundInterestDesc')}
          {renderCard('cryptoPnl', 'cryptoPnlTitle', 'cryptoPnlDesc')}
        </Section>

        <Section icon="🏗️" title={tCat('civil')}>
          {renderCard('concreteSection', 'concreteSectionTitle', 'concreteSectionDesc')}
          {renderCard('soilMechanics', 'soilMechanicsTitle', 'soilMechanicsDesc')}
        </Section>

        <Section icon="⚙️" title={tCat('mechanical')}>
          {renderCard('beam', 'beamTitle', 'beamDesc')}
          {renderCard('stressStrain', 'stressStrainTitle', 'stressStrainDesc')}
          {renderCard('shearMoment', 'shearMomentTitle', 'shearMomentDesc')}
        </Section>

        <Section icon="☢️" title={tCat('chemistry')}>
          {renderCard('periodicTable', 'periodicTableTitle', 'periodicTableDesc')}
          {renderCard('idealGas', 'idealGasTitle', 'idealGasDesc')}
        </Section>

        <Section icon="🌊" title={tCat('fluid')}>
          {renderCard('bernoulli', 'bernoulliTitle', 'bernoulliDesc')}
          {renderCard('pressureLoss', 'pressureLossTitle', 'pressureLossDesc')}
        </Section>

        <Section icon="📊" title={tCat('statistics')}>
          {renderCard('normal', 'normalTitle', 'normalDesc')}
          {renderCard('basicStats', 'basicStatsTitle', 'basicStatsDesc')}
          {renderCard('discreteDist', 'discreteDistTitle', 'discreteDistDesc')}
          {renderCard('dataViz', 'dataVizTitle', 'dataVizDesc')}
        </Section>

        <Section icon="🧮" title={tCat('mathematics')}>
          {renderCard('calculus', 'calculusTitle', 'calculusDesc')}
          {renderCard('matrix', 'matrixTitle', 'matrixDesc')}
          {renderCard('geometry', 'geometryTitle', 'geometryDesc')}
          {renderCard('functionPlot', 'functionPlotTitle', 'functionPlotDesc')}
        </Section>

        <Section icon="🔄" title={tCat('converters')}>
          {renderCard('unitConverter', 'unitConverterTitle', 'unitConverterDesc')}
        </Section>

      </div>
    </div>
  );
}
