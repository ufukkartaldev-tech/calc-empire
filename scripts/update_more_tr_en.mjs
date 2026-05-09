import fs from 'fs';
import path from 'path';

const basePath = 'c:/Users/90538/Desktop/02_Yazilim_Projeleri/calc-empire/src/messages';

const trPath = path.join(basePath, 'tr.json');
const enPath = path.join(basePath, 'en.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

trData.Categories = {
  ...trData.Categories,
  civil: 'İnşaat & Yapı Malzemeleri',
  software: 'Yazılım & Dijital',
  chemistry: 'Kimya & Proses',
  finance: 'Finans Mühendisliği',
};

enData.Categories = {
  ...enData.Categories,
  civil: 'Civil & Materials',
  software: 'Software & Digital',
  chemistry: 'Chemistry & Process',
  finance: 'Financial Engineering',
};

const trDashContent = {
  concreteSectionTitle: 'Betonarme Kesit Hesabı',
  concreteSectionDesc: 'Kapasite, donatı ve moment analizleri.',
  soilMechanicsTitle: 'Zemin Mekaniği',
  soilMechanicsDesc: 'Taşıma gücü ve efektif gerilme hesapları.',

  baseConverterTitle: 'Base Converter & Bitwise',
  baseConverterDesc: "2, 8, 10, 16'lık taban dönüşümleri ve bitsel mantık.",
  cronParserTitle: 'Cron Job Parser',
  cronParserDesc: 'Zamanlanmış görev ifade çözümleyici ve görselleştirici.',
  jsonFormatterTitle: 'JSON/YAML Formatter',
  jsonFormatterDesc: 'Sözdizimi hatalarını anında bulan validator.',

  periodicTableTitle: 'Periyodik Tablo & Mol Ağırlığı',
  periodicTableDesc: 'Element bazlı atomik molekül hesaplayıcı.',
  idealGasTitle: 'İdeal Gaz Yasası (PV=nRT)',
  idealGasDesc: 'Kimya ve termodinamik hesaplayıcısı.',

  compoundInterestTitle: 'Bileşik Faiz & Enflasyon Analizi',
  compoundInterestDesc: 'Enflasyona karşı paranın zaman değeri grafiği.',
  cryptoPnlTitle: 'Kripto/Borsa Kaldıraç & PnL',
  cryptoPnlDesc: 'Kar-zarar oranı, likidasyon seviyesi görselleştirici.',
};

const enDashContent = {
  concreteSectionTitle: 'Concrete Section Analysis',
  concreteSectionDesc: 'Capacity, rebar, and momentum analyses.',
  soilMechanicsTitle: 'Soil Mechanics',
  soilMechanicsDesc: 'Bearing capacity and effective stress calculator.',

  baseConverterTitle: 'Base Converter & Bitwise',
  baseConverterDesc: 'Binary, octal, hex conversions and bitwise logic.',
  cronParserTitle: 'Cron Job Parser',
  cronParserDesc: 'Scheduled task syntax identifier and visualizer.',
  jsonFormatterTitle: 'JSON/YAML Formatter',
  jsonFormatterDesc: 'Syntax error-free code formatter and validator.',

  periodicTableTitle: 'Periodic Table & Molar Mass',
  periodicTableDesc: 'Element-based atomic molecular weight calculator.',
  idealGasTitle: 'Ideal Gas Law (PV=nRT)',
  idealGasDesc: 'Gas, thermodynamics and heat transfer calculator.',

  compoundInterestTitle: 'Compound Interest & Inflation Check',
  compoundInterestDesc: 'Time value of money & inflation visualization.',
  cryptoPnlTitle: 'Crypto/Stock PnL & Leverage',
  cryptoPnlDesc: 'Profit/loss and liquidation point calculator.',
};

trData.Dashboard = { ...trData.Dashboard, ...trDashContent };
enData.Dashboard = { ...enData.Dashboard, ...enDashContent };

fs.writeFileSync(trPath, JSON.stringify(trData, null, 4));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
console.log('Translations updated successfully');
