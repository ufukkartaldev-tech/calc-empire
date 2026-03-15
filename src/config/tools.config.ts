/**
 * @file config/tools.config.ts
 * @description Tool configuration for CalcEmpire
 */

import type { ToolConfig, ToolId } from '@/types';

export const TOOLS_CONFIG: ToolConfig[] = [
  // Electrical
  {
    id: 'ohm',
    titleKey: 'ohmTitle',
    descKey: 'ohmDesc',
    catKey: 'electrical',
    icon: 'Ω',
    features: { shareableUrl: true, pdfExport: true },
  },
  {
    id: 'kirchhoff',
    titleKey: 'kirchhoffTitle',
    descKey: 'kirchhoffDesc',
    catKey: 'electrical',
    icon: '🔌',
    features: { shareableUrl: true, pdfExport: true },
  },
  {
    id: 'power',
    titleKey: 'powerTitle',
    descKey: 'powerDesc',
    catKey: 'electrical',
    icon: '💡',
    features: { shareableUrl: true, pdfExport: true },
  },
  {
    id: 'resistor',
    titleKey: 'resistorTitle',
    descKey: 'resistorDesc',
    catKey: 'electrical',
    icon: '🎨',
  },
  { id: 'bode', titleKey: 'bodeTitle', descKey: 'bodeDesc', catKey: 'electrical', icon: '📈' },

  // Software
  {
    id: 'baseConverter',
    titleKey: 'baseConverterTitle',
    descKey: 'baseConverterDesc',
    catKey: 'software',
    icon: '🔟',
  },
  {
    id: 'cronParser',
    titleKey: 'cronParserTitle',
    descKey: 'cronParserDesc',
    catKey: 'software',
    icon: '⏱️',
  },
  {
    id: 'jsonFormatter',
    titleKey: 'jsonFormatterTitle',
    descKey: 'jsonFormatterDesc',
    catKey: 'software',
    icon: '｛',
  },

  // Finance
  {
    id: 'compoundInterest',
    titleKey: 'compoundInterestTitle',
    descKey: 'compoundInterestDesc',
    catKey: 'finance',
    icon: '📈',
  },
  {
    id: 'cryptoPnl',
    titleKey: 'cryptoPnlTitle',
    descKey: 'cryptoPnlDesc',
    catKey: 'finance',
    icon: '🪙',
  },

  // Civil
  {
    id: 'concreteSection',
    titleKey: 'concreteSectionTitle',
    descKey: 'concreteSectionDesc',
    catKey: 'civil',
    icon: '🪨',
  },
  {
    id: 'soilMechanics',
    titleKey: 'soilMechanicsTitle',
    descKey: 'soilMechanicsDesc',
    catKey: 'civil',
    icon: '🌱',
  },

  // Mechanical
  {
    id: 'beam',
    titleKey: 'beamTitle',
    descKey: 'beamDesc',
    catKey: 'mechanical',
    icon: '📏',
    features: { shareableUrl: true, pdfExport: true },
  },
  {
    id: 'stressStrain',
    titleKey: 'stressStrainTitle',
    descKey: 'stressStrainDesc',
    catKey: 'mechanical',
    icon: '💥',
  },
  {
    id: 'shearMoment',
    titleKey: 'shearMomentTitle',
    descKey: 'shearMomentDesc',
    catKey: 'mechanical',
    icon: '✂️',
  },

  // Chemistry
  {
    id: 'periodicTable',
    titleKey: 'periodicTableTitle',
    descKey: 'periodicTableDesc',
    catKey: 'chemistry',
    icon: '🧪',
  },
  {
    id: 'idealGas',
    titleKey: 'idealGasTitle',
    descKey: 'idealGasDesc',
    catKey: 'chemistry',
    icon: '💨',
  },

  // Fluid
  {
    id: 'bernoulli',
    titleKey: 'bernoulliTitle',
    descKey: 'bernoulliDesc',
    catKey: 'fluid',
    icon: '⛲',
  },
  {
    id: 'pressureLoss',
    titleKey: 'pressureLossTitle',
    descKey: 'pressureLossDesc',
    catKey: 'fluid',
    icon: '🚰',
  },

  // Statistics
  {
    id: 'normal',
    titleKey: 'normalTitle',
    descKey: 'normalDesc',
    catKey: 'statistics',
    icon: '🔔',
  },
  {
    id: 'basicStats',
    titleKey: 'basicStatsTitle',
    descKey: 'basicStatsDesc',
    catKey: 'statistics',
    icon: '📉',
  },
  {
    id: 'discreteDist',
    titleKey: 'discreteDistTitle',
    descKey: 'discreteDistDesc',
    catKey: 'statistics',
    icon: '🎲',
  },
  {
    id: 'dataViz',
    titleKey: 'dataVizTitle',
    descKey: 'dataVizDesc',
    catKey: 'statistics',
    icon: '📊',
  },

  // Mathematics
  {
    id: 'calculus',
    titleKey: 'calculusTitle',
    descKey: 'calculusDesc',
    catKey: 'mathematics',
    icon: '∫',
  },
  {
    id: 'matrix',
    titleKey: 'matrixTitle',
    descKey: 'matrixDesc',
    catKey: 'mathematics',
    icon: '▦',
  },
  {
    id: 'geometry',
    titleKey: 'geometryTitle',
    descKey: 'geometryDesc',
    catKey: 'mathematics',
    icon: '📐',
  },
  {
    id: 'functionPlot',
    titleKey: 'functionPlotTitle',
    descKey: 'functionPlotDesc',
    catKey: 'mathematics',
    icon: '📈',
  },

  // Converters
  {
    id: 'unitConverter',
    titleKey: 'unitConverterTitle',
    descKey: 'unitConverterDesc',
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
