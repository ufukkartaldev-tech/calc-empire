'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Fuse from 'fuse.js';
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

const CATEGORY_ORDER = [
  'electrical', 'software', 'finance', 'civil', 'mechanical',
  'chemistry', 'fluid', 'statistics', 'mathematics', 'converters'
] as const;

type ToolConfig = {
  id: ToolId;
  titleKey: string;
  descKey: string;
  catKey: typeof CATEGORY_ORDER[number];
  icon: string;
};

const TOOLS_CONFIG: ToolConfig[] = [
  // Electrical
  { id: 'ohm', titleKey: 'ohmTitle', descKey: 'ohmDesc', catKey: 'electrical', icon: 'Ω' },
  { id: 'kirchhoff', titleKey: 'kirchhoffTitle', descKey: 'kirchhoffDesc', catKey: 'electrical', icon: '🔌' },
  { id: 'power', titleKey: 'powerTitle', descKey: 'powerDesc', catKey: 'electrical', icon: '💡' },
  { id: 'resistor', titleKey: 'resistorTitle', descKey: 'resistorDesc', catKey: 'electrical', icon: '🎨' },
  { id: 'bode', titleKey: 'bodeTitle', descKey: 'bodeDesc', catKey: 'electrical', icon: '📈' },

  // Software
  { id: 'baseConverter', titleKey: 'baseConverterTitle', descKey: 'baseConverterDesc', catKey: 'software', icon: '�' },
  { id: 'cronParser', titleKey: 'cronParserTitle', descKey: 'cronParserDesc', catKey: 'software', icon: '⏱️' },
  { id: 'jsonFormatter', titleKey: 'jsonFormatterTitle', descKey: 'jsonFormatterDesc', catKey: 'software', icon: '｛' },

  // Finance
  { id: 'compoundInterest', titleKey: 'compoundInterestTitle', descKey: 'compoundInterestDesc', catKey: 'finance', icon: '�' },
  { id: 'cryptoPnl', titleKey: 'cryptoPnlTitle', descKey: 'cryptoPnlDesc', catKey: 'finance', icon: '🪙' },

  // Civil
  { id: 'concreteSection', titleKey: 'concreteSectionTitle', descKey: 'concreteSectionDesc', catKey: 'civil', icon: '🪨' },
  { id: 'soilMechanics', titleKey: 'soilMechanicsTitle', descKey: 'soilMechanicsDesc', catKey: 'civil', icon: '�' },

  // Mechanical
  { id: 'beam', titleKey: 'beamTitle', descKey: 'beamDesc', catKey: 'mechanical', icon: '📏' },
  { id: 'stressStrain', titleKey: 'stressStrainTitle', descKey: 'stressStrainDesc', catKey: 'mechanical', icon: '💥' },
  { id: 'shearMoment', titleKey: 'shearMomentTitle', descKey: 'shearMomentDesc', catKey: 'mechanical', icon: '✂️' },

  // Chemistry
  { id: 'periodicTable', titleKey: 'periodicTableTitle', descKey: 'periodicTableDesc', catKey: 'chemistry', icon: '🧪' },
  { id: 'idealGas', titleKey: 'idealGasTitle', descKey: 'idealGasDesc', catKey: 'chemistry', icon: '💨' },

  // Fluid
  { id: 'bernoulli', titleKey: 'bernoulliTitle', descKey: 'bernoulliDesc', catKey: 'fluid', icon: '⛲' },
  { id: 'pressureLoss', titleKey: 'pressureLossTitle', descKey: 'pressureLossDesc', catKey: 'fluid', icon: '🚰' },

  // Statistics
  { id: 'normal', titleKey: 'normalTitle', descKey: 'normalDesc', catKey: 'statistics', icon: '�' },
  { id: 'basicStats', titleKey: 'basicStatsTitle', descKey: 'basicStatsDesc', catKey: 'statistics', icon: '�' },
  { id: 'discreteDist', titleKey: 'discreteDistTitle', descKey: 'discreteDistDesc', catKey: 'statistics', icon: '🎲' },
  { id: 'dataViz', titleKey: 'dataVizTitle', descKey: 'dataVizDesc', catKey: 'statistics', icon: '📊' },

  // Mathematics
  { id: 'calculus', titleKey: 'calculusTitle', descKey: 'calculusDesc', catKey: 'mathematics', icon: '∫' },
  { id: 'matrix', titleKey: 'matrixTitle', descKey: 'matrixDesc', catKey: 'mathematics', icon: '▦' },
  { id: 'geometry', titleKey: 'geometryTitle', descKey: 'geometryDesc', catKey: 'mathematics', icon: '📐' },
  { id: 'functionPlot', titleKey: 'functionPlotTitle', descKey: 'functionPlotDesc', catKey: 'mathematics', icon: '📈' },

  // Converters
  { id: 'unitConverter', titleKey: 'unitConverterTitle', descKey: 'unitConverterDesc', catKey: 'converters', icon: '⚖️' }
];

const CATEGORY_ICONS: Record<typeof CATEGORY_ORDER[number], string> = {
  electrical: '⚡', software: '💻', finance: '💰', civil: '🏗️',
  mechanical: '⚙️', chemistry: '☢️', fluid: '🌊', statistics: '📊',
  mathematics: '🧮', converters: '🔄'
};

export function EngineeringDashboard() {
  const tCat = useTranslations('Categories');
  const tDash = useTranslations('Dashboard');
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [acknowledgedTools, setAcknowledgedTools] = useState<Set<ToolId>>(new Set());

  const CRITICAL_TOOLS: ToolId[] = ['concreteSection', 'soilMechanics', 'beam', 'stressStrain', 'shearMoment', 'pressureLoss', 'kirchhoff'];

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

  // Pre-translate everything for searchable fields
  const searchableTools = useMemo(() => {
    return TOOLS_CONFIG.map(tool => ({
      ...tool,
      translatedTitle: tDash(tool.titleKey as any),
      translatedDesc: tDash(tool.descKey as any),
      translatedCat: tCat(tool.catKey as any)
    }));
  }, [tDash, tCat]);

  // Use Fuse for fuzzy matching with typo tolerance
  const fuse = useMemo(() => {
    return new Fuse(searchableTools, {
      keys: ['translatedTitle', 'translatedDesc', 'translatedCat'],
      threshold: 0.35, // Typos tolerance limit (lower means stricter, 0.35 allows "yaxilim" for "yazilim")
      distance: 100
    });
  }, [searchableTools]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return searchableTools;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, searchableTools]);

  // Group the filtered tools by category to render them exactly as they were
  const toolsByCategory = useMemo(() => {
    const grouped: Partial<Record<typeof CATEGORY_ORDER[number], typeof searchableTools>> = {};
    for (const tool of filteredTools) {
      if (!grouped[tool.catKey]) grouped[tool.catKey] = [];
      grouped[tool.catKey]!.push(tool);
    }
    return grouped;
  }, [filteredTools]);

  // --- RENDERING VIEWS ---

  if (activeTool) {
    const isCritical = CRITICAL_TOOLS.includes(activeTool);
    const hasAcknowledged = acknowledgedTools.has(activeTool);

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-20 mt-4 md:mt-8">
        <div className="w-full flex justify-start mb-6">
          <button
            onClick={() => setActiveTool(null)}
            className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span>←</span> {tDash('backButton')}
          </button>
        </div>

        {isCritical && !hasAcknowledged ? (
          <div className="w-full flex justify-center mt-6">
            <div className="max-w-xl w-full p-8 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-amber-900 dark:text-amber-400 font-bold text-xl mb-4 flex items-center gap-2">
                <span>⚠️</span> {tDash('consentTitle' as any) || "Kullanım Öncesi Onay"}
              </h3>
              <p className="text-amber-800 dark:text-amber-300 text-sm mb-6 leading-relaxed">
                {tDash('disclaimer' as any)}
              </p>
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-amber-200 dark:border-amber-800 group hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 transition-colors cursor-pointer"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAcknowledgedTools(prev => new Set([...prev, activeTool]));
                    }
                  }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {tDash('acknowledgeDisclaimer' as any)}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              {renderTool()}
            </div>

            {isCritical && (
              <div className="mt-12 w-full px-6 py-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-xl shadow-sm">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300/80 leading-relaxed text-center sm:text-left">
                  {tDash('disclaimer' as any)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

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
      <div className="mb-10 mt-6 md:mt-10 text-center flex flex-col items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">{tDash('title')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {tDash('subtitle')}
        </p>

        <div className="flex flex-col items-center w-full max-w-2xl mt-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full shadow-sm"
          >
            <span>{showHelp ? '✕' : 'ℹ️'}</span> {tDash('helpButton' as any)}
          </button>

          {showHelp && (
            <div className="mt-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/20 shadow-lg text-left animate-in fade-in slide-in-from-top-4 duration-300 w-full relative">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">{tDash('helpTitle' as any)}</h3>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p><strong>⚡ {tCat('electrical' as any)}:</strong> {tDash('helpElectrical' as any)}</p>
                <p><strong>🏗️ {tCat('civil' as any)} & ⚙️ {tCat('mechanical' as any)}:</strong> {tDash('helpCivil' as any)}</p>
                <p><strong>📊 {tCat('statistics' as any)} & 🧮 {tCat('mathematics' as any)}:</strong> {tDash('helpStats' as any)}</p>
                <p><strong>💡 İpucu:</strong> {tDash('helpSearch' as any)}</p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
              >
                {tDash('helpClose' as any)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="w-full max-w-2xl mx-auto mb-14">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tDash('searchPlaceholder' as any) || "Ara... (Örn: yazılım, beton)"}
            className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition-all shadow-sm hover:shadow-md focus:shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY TOOLS LIST */}
      <div className="flex flex-col w-full">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {tDash('noResults' as any)}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
              {tDash('requestTool' as any)}
            </p>
            <a
              href="mailto:contact@calcempire.com?subject=Tool%20Request"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {tDash('contactUs' as any)}
            </a>
          </div>
        ) : (
          CATEGORY_ORDER.map(catKey => {
            const catTools = toolsByCategory[catKey];
            if (!catTools || catTools.length === 0) return null;

            return (
              <Section
                key={catKey}
                icon={CATEGORY_ICONS[catKey]}
                title={tCat(catKey as any)}
              >
                {catTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="group w-full flex flex-col items-start p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:scale-110 transition-all shadow-sm">
                        {tool.icon}
                      </span>
                      <div className="flex flex-col flex-1 pl-1">
                        <span className="font-semibold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.translatedTitle}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {tool.translatedDesc}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </Section>
            );
          })
        )}
      </div>
    </div>
  );
}
