/**
 * @file config/tools.config.ts
 * @description Tool configuration for CalcEmpire
 */

import type { ToolConfig, ToolId, EnhancedToolConfig } from '@/types';

export const TOOLS_CONFIG: ToolConfig[] = [
  // Electrical
  {
    id: 'ohm',
    titleKey: 'ohmTitle',
    descKey: 'ohmDesc',
    ceoTitleKey: 'ohmCeoTitle',
    ceoDescKey: 'ohmCeoDesc',
    catKey: 'electrical',
    icon: 'Ω',
    features: { shareableUrl: true, pdfExport: true },
    isPopular: true,
  },
  {
    id: 'kirchhoff',
    titleKey: 'kirchhoffTitle',
    descKey: 'kirchhoffDesc',
    ceoTitleKey: 'kirchhoffCeoTitle',
    ceoDescKey: 'kirchhoffCeoDesc',
    catKey: 'electrical',
    icon: '🔌',
    features: { shareableUrl: true, pdfExport: true },
  },
  {
    id: 'power',
    titleKey: 'powerTitle',
    descKey: 'powerDesc',
    ceoTitleKey: 'powerCeoTitle',
    ceoDescKey: 'powerCeoDesc',
    catKey: 'electrical',
    icon: '💡',
    features: { shareableUrl: true, pdfExport: true },
  },
  {
    id: 'resistor',
    titleKey: 'resistorTitle',
    descKey: 'resistorDesc',
    ceoTitleKey: 'resistorCeoTitle',
    ceoDescKey: 'resistorCeoDesc',
    catKey: 'electrical',
    icon: '🎨',
  },
  { 
    id: 'bode', 
    titleKey: 'bodeTitle', 
    descKey: 'bodeDesc',
    ceoTitleKey: 'bodeCeoTitle',
    ceoDescKey: 'bodeCeoDesc',
    catKey: 'electrical', 
    icon: '📈' 
  },

  // Software
  {
    id: 'baseConverter',
    titleKey: 'baseConverterTitle',
    descKey: 'baseConverterDesc',
    ceoTitleKey: 'baseConverterCeoTitle',
    ceoDescKey: 'baseConverterCeoDesc',
    catKey: 'software',
    icon: '🔟',
    isPopular: true,
  },
  {
    id: 'cronParser',
    titleKey: 'cronParserTitle',
    descKey: 'cronParserDesc',
    ceoTitleKey: 'cronParserCeoTitle',
    ceoDescKey: 'cronParserCeoDesc',
    catKey: 'software',
    icon: '⏱️',
  },
  {
    id: 'jsonFormatter',
    titleKey: 'jsonFormatterTitle',
    descKey: 'jsonFormatterDesc',
    ceoTitleKey: 'jsonFormatterCeoTitle',
    ceoDescKey: 'jsonFormatterCeoDesc',
    catKey: 'software',
    icon: '｛',
  },

  // Finance
  {
    id: 'compoundInterest',
    titleKey: 'compoundInterestTitle',
    descKey: 'compoundInterestDesc',
    ceoTitleKey: 'compoundInterestCeoTitle',
    ceoDescKey: 'compoundInterestCeoDesc',
    catKey: 'finance',
    icon: '📈',
  },
  {
    id: 'cryptoPnl',
    titleKey: 'cryptoPnlTitle',
    descKey: 'cryptoPnlDesc',
    ceoTitleKey: 'cryptoPnlCeoTitle',
    ceoDescKey: 'cryptoPnlCeoDesc',
    catKey: 'finance',
    icon: '🪙',
  },

  // Civil
  {
    id: 'concreteSection',
    titleKey: 'concreteSectionTitle',
    descKey: 'concreteSectionDesc',
    ceoTitleKey: 'concreteSectionCeoTitle',
    ceoDescKey: 'concreteSectionCeoDesc',
    catKey: 'civil',
    icon: '🪨',
  },
  {
    id: 'soilMechanics',
    titleKey: 'soilMechanicsTitle',
    descKey: 'soilMechanicsDesc',
    ceoTitleKey: 'soilMechanicsCeoTitle',
    ceoDescKey: 'soilMechanicsCeoDesc',
    catKey: 'civil',
    icon: '🌱',
  },

  // Mechanical
  {
    id: 'beam',
    titleKey: 'beamTitle',
    descKey: 'beamDesc',
    ceoTitleKey: 'beamCeoTitle',
    ceoDescKey: 'beamCeoDesc',
    catKey: 'mechanical',
    icon: '📏',
    features: { shareableUrl: true, pdfExport: true },
  },
  {
    id: 'stressStrain',
    titleKey: 'stressStrainTitle',
    descKey: 'stressStrainDesc',
    ceoTitleKey: 'stressStrainCeoTitle',
    ceoDescKey: 'stressStrainCeoDesc',
    catKey: 'mechanical',
    icon: '💥',
  },
  {
    id: 'shearMoment',
    titleKey: 'shearMomentTitle',
    descKey: 'shearMomentDesc',
    ceoTitleKey: 'shearMomentCeoTitle',
    ceoDescKey: 'shearMomentCeoDesc',
    catKey: 'mechanical',
    icon: '✂️',
  },

  // Chemistry
  {
    id: 'periodicTable',
    titleKey: 'periodicTableTitle',
    descKey: 'periodicTableDesc',
    ceoTitleKey: 'periodicTableCeoTitle',
    ceoDescKey: 'periodicTableCeoDesc',
    catKey: 'chemistry',
    icon: '🧪',
  },
  {
    id: 'idealGas',
    titleKey: 'idealGasTitle',
    descKey: 'idealGasDesc',
    ceoTitleKey: 'idealGasCeoTitle',
    ceoDescKey: 'idealGasCeoDesc',
    catKey: 'chemistry',
    icon: '💨',
  },

  // Fluid
  {
    id: 'bernoulli',
    titleKey: 'bernoulliTitle',
    descKey: 'bernoulliDesc',
    ceoTitleKey: 'bernoulliCeoTitle',
    ceoDescKey: 'bernoulliCeoDesc',
    catKey: 'fluid',
    icon: '⛲',
  },
  {
    id: 'pressureLoss',
    titleKey: 'pressureLossTitle',
    descKey: 'pressureLossDesc',
    ceoTitleKey: 'pressureLossCeoTitle',
    ceoDescKey: 'pressureLossCeoDesc',
    catKey: 'fluid',
    icon: '🚰',
  },

  // Statistics
  {
    id: 'normal',
    titleKey: 'normalTitle',
    descKey: 'normalDesc',
    ceoTitleKey: 'normalCeoTitle',
    ceoDescKey: 'normalCeoDesc',
    catKey: 'statistics',
    icon: '🔔',
  },
  {
    id: 'basicStats',
    titleKey: 'basicStatsTitle',
    descKey: 'basicStatsDesc',
    ceoTitleKey: 'basicStatsCeoTitle',
    ceoDescKey: 'basicStatsCeoDesc',
    catKey: 'statistics',
    icon: '📉',
  },
  {
    id: 'discreteDist',
    titleKey: 'discreteDistTitle',
    descKey: 'discreteDistDesc',
    ceoTitleKey: 'discreteDistCeoTitle',
    ceoDescKey: 'discreteDistCeoDesc',
    catKey: 'statistics',
    icon: '🎲',
  },
  {
    id: 'dataViz',
    titleKey: 'dataVizTitle',
    descKey: 'dataVizDesc',
    ceoTitleKey: 'dataVizCeoTitle',
    ceoDescKey: 'dataVizCeoDesc',
    catKey: 'statistics',
    icon: '📊',
  },

  // Mathematics
  {
    id: 'calculus',
    titleKey: 'calculusTitle',
    descKey: 'calculusDesc',
    ceoTitleKey: 'calculusCeoTitle',
    ceoDescKey: 'calculusCeoDesc',
    catKey: 'mathematics',
    icon: '∫',
  },
  {
    id: 'matrix',
    titleKey: 'matrixTitle',
    descKey: 'matrixDesc',
    ceoTitleKey: 'matrixCeoTitle',
    ceoDescKey: 'matrixCeoDesc',
    catKey: 'mathematics',
    icon: '▦',
  },
  {
    id: 'geometry',
    titleKey: 'geometryTitle',
    descKey: 'geometryDesc',
    ceoTitleKey: 'geometryCeoTitle',
    ceoDescKey: 'geometryCeoDesc',
    catKey: 'mathematics',
    icon: '📐',
  },
  {
    id: 'functionPlot',
    titleKey: 'functionPlotTitle',
    descKey: 'functionPlotDesc',
    ceoTitleKey: 'functionPlotCeoTitle',
    ceoDescKey: 'functionPlotCeoDesc',
    catKey: 'mathematics',
    icon: '📈',
  },

  // Converters
  {
    id: 'unitConverter',
    titleKey: 'unitConverterTitle',
    descKey: 'unitConverterDesc',
    ceoTitleKey: 'unitConverterCeoTitle',
    ceoDescKey: 'unitConverterCeoDesc',
    catKey: 'converters',
    icon: '⚖️',
  },
];

export const CRITICAL_TOOLS: Exclude<ToolId, null>[] = [
  'concreteSection',
  'soilMechanics',
  'beam',
  'stressStrain',
  'shearMoment',
  'pressureLoss',
  'kirchhoff',
];

/**
 * Creates an enhanced tool configuration with computed hasCeoDescriptions property
 */
export function createEnhancedToolConfig(tool: ToolConfig): EnhancedToolConfig {
  return {
    ...tool,
    hasCeoDescriptions: !!(tool.ceoTitleKey && tool.ceoDescKey),
  };
}

/**
 * Enhanced tool configurations with computed properties
 */
export const ENHANCED_TOOLS_CONFIG: EnhancedToolConfig[] = TOOLS_CONFIG.map(createEnhancedToolConfig);
