import fs from 'fs';
import path from 'path';

const basePath = 'c:/Users/90538/Desktop/02_Yazilim_Projeleri/calc-empire/src/messages';

const trPath = path.join(basePath, 'tr.json');
const enPath = path.join(basePath, 'en.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Categories
trData.Categories = {
    ...trData.Categories,
    electrical: "Elektrik & Elektronik",
    mechanical: "Makine (Mekanik)",
    fluid: "Akışkanlar Mekaniği",
    statistics: "İstatistik & Analiz",
    mathematics: "Matematik & Geometri",
    converters: "Birim Dönüştürücüler"
};

enData.Categories = {
    ...enData.Categories,
    electrical: "Electrical & Electronics",
    mechanical: "Mechanical Engineering",
    fluid: "Fluid Mechanics",
    statistics: "Statistics & Analysis",
    mathematics: "Mathematics & Geometry",
    converters: "Unit Converters"
};

// Dashboard
const trDashContent = {
    "title": "Hesaplama Araçları",
    "subtitle": "İhtiyacınız olan hesaplayıcıyı seçerek anında işlemlere başlayın. Temiz, sade ve hızlı.",
    "backButton": "Geri Dön",

    "ohmTitle": "Ohm Kanunu",
    "ohmDesc": "V = I × R standart hesaplamaları.",
    "resistorTitle": "Direnç Renk Kodları",
    "resistorDesc": "4, 5 ve 6 bantlı renk kodu okuyucu.",
    "kirchhoffTitle": "Kirchhoff Kanunları",
    "kirchhoffDesc": "Düğüm ve Çevre denklemleri hesaplayıcısı.",
    "powerTitle": "Güç Hesaplamaları",
    "powerDesc": "AC/DC güç ve güç faktörü (cos φ).",
    "bodeTitle": "Bode Diyagramı",
    "bodeDesc": "Filtre devrelerinin frekans tepkisi.",

    "beamTitle": "Kiriş Sehim Analizi",
    "beamDesc": "Farklı kiriş tipleri için sehim hesaplama.",
    "stressStrainTitle": "Gerilme-Gerinim (Stress/Strain)",
    "stressStrainDesc": "Kalıcı gerilme ve uzama analizleri.",
    "shearMomentTitle": "Kesme ve Moment Diyagramı",
    "shearMomentDesc": "Kirişler üzerinde iç kuvvet grafikleri.",

    "bernoulliTitle": "Bernoulli Denklemi",
    "bernoulliDesc": "Basınç, hız ve yükseklik ilişkisi.",
    "pressureLossTitle": "Boru İçi Basınç Kaybı",
    "pressureLossDesc": "Sürtünme ve debi kayıpları analizi.",

    "normalTitle": "Normal Dağılım",
    "normalDesc": "Standart sapma ve ortalama görselleştirici.",
    "basicStatsTitle": "Temel İstatistik Analizi",
    "basicStatsDesc": "Ortalama, medyan, varyans hesaplamaları.",
    "discreteDistTitle": "Olasılık Dağılımları",
    "discreteDistDesc": "Binom ve Poisson dağılımları grafiği.",
    "dataVizTitle": "Veri Görselleştirme",
    "dataVizDesc": "Histogram, kutu grafiği ve regresyon.",

    "calculusTitle": "Türev & İntegral",
    "calculusDesc": "Fonksiyonlar için analitik çözümler.",
    "matrixTitle": "Matris Hesaplayıcı",
    "matrixDesc": "Çarpım ve determinant işlemleri.",
    "geometryTitle": "2D/3D Geometri",
    "geometryDesc": "Hacim ve ağırlık merkezi hesapları.",
    "functionPlotTitle": "Fonksiyon Grafiği Çizici",
    "functionPlotDesc": "f(x) formülünü yazıp grafiğini oluşturun.",

    "unitConverterTitle": "Genel Birim Dönüştürücü",
    "unitConverterDesc": "Sıcaklık, basınç, enerji, ağırlık ve uzunluk çevirileri."
};

const enDashContent = {
    "title": "Calculator Tools",
    "subtitle": "Select the calculator you need and start computing immediately. Clean, simple, and fast.",
    "backButton": "Go Back",

    "ohmTitle": "Ohm's Law",
    "ohmDesc": "V = I × R standard calculations.",
    "resistorTitle": "Resistor Color Codes",
    "resistorDesc": "4, 5, and 6 band color code reader.",
    "kirchhoffTitle": "Kirchhoff's Laws",
    "kirchhoffDesc": "Node and loop equations calculator.",
    "powerTitle": "Power Calculations",
    "powerDesc": "AC/DC power and power factor (cos φ).",
    "bodeTitle": "Bode Plot Visualizer",
    "bodeDesc": "Frequency response of filter circuits.",

    "beamTitle": "Beam Deflection Analysis",
    "beamDesc": "Deflection calculation for various beam types.",
    "stressStrainTitle": "Stress-Strain Rules",
    "stressStrainDesc": "Stress, elongation and deformation analysis.",
    "shearMomentTitle": "Shear & Moment Diagrams",
    "shearMomentDesc": "Internal force graphs on beams.",

    "bernoulliTitle": "Bernoulli Equation",
    "bernoulliDesc": "Pressure, velocity and elevation relation.",
    "pressureLossTitle": "Pipeline Pressure Loss",
    "pressureLossDesc": "Friction and flow calculations.",

    "normalTitle": "Normal Distribution",
    "normalDesc": "Standard deviation and mean visualizer.",
    "basicStatsTitle": "Basic Statistical Analysis",
    "basicStatsDesc": "Mean, median, and variance calculations.",
    "discreteDistTitle": "Discrete Probability Distributions",
    "discreteDistDesc": "Binomial and Poisson distribution charts.",
    "dataVizTitle": "Data Visualization",
    "dataVizDesc": "Histograms, box plots, and regressions.",

    "calculusTitle": "Calculus & Integrals",
    "calculusDesc": "Basic analytical solutions for functions.",
    "matrixTitle": "Matrix Calculator",
    "matrixDesc": "Multiplication and determinant operations.",
    "geometryTitle": "2D/3D Geometry",
    "geometryDesc": "Area, volume, and centroid computations.",
    "functionPlotTitle": "Function Plotter",
    "functionPlotDesc": "Type an f(x) formula and plot the graph.",

    "unitConverterTitle": "Unit Converters",
    "unitConverterDesc": "Temperature, pressure, energy, weight, and length."
};

trData.Dashboard = { ...trData.Dashboard, ...trDashContent };
enData.Dashboard = { ...enData.Dashboard, ...enDashContent };

fs.writeFileSync(trPath, JSON.stringify(trData, null, 4));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
console.log('Translations updated successfully');
