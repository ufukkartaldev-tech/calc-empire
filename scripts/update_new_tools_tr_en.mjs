import fs from 'fs';
import path from 'path';

const basePath = 'c:/Users/90538/Desktop/02_Yazilim_Projeleri/calc-empire/src/messages';

const trPath = path.join(basePath, 'tr.json');
const enPath = path.join(basePath, 'en.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

trData.CompoundInterest = {
    "title": "Bileşik Faiz & Enflasyon Analizi",
    "principal": "Ana Para (Başlangıç)",
    "interestRate": "Yıllık Faiz Oranı (%)",
    "inflationRate": "Yıllık Enflasyon Oranı (%)",
    "years": "Süre (Yıl)",
    "compounding": "Bileşikleme Sıklığı",
    "yearly": "Yıllık 1",
    "monthly": "Aylık 12",
    "daily": "Günlük 365",
    "results": "Analiz Sonuçları",
    "nominalValue": "Nominal Bakiye",
    "realValue": "Reel Alım Gücü (Enflasyon Sonrası)",
    "totalInterest": "Kazanılan Toplam Faiz",
    "inflationLoss": "Enflasyon Etkisi ile Kayıp",
    "chartTitle": "Süreç İçerisindeki Değişim Grafiği (Birikimli Büyüme)"
};

enData.CompoundInterest = {
    "title": "Compound Interest & Inflation Analysis",
    "principal": "Principal Amount (Initial)",
    "interestRate": "Annual Interest Rate (%)",
    "inflationRate": "Annual Inflation Rate (%)",
    "years": "Period (Years)",
    "compounding": "Compounding Frequency",
    "yearly": "Yearly 1",
    "monthly": "Monthly 12",
    "daily": "Daily 365",
    "results": "Analysis Results",
    "nominalValue": "Nominal Balance",
    "realValue": "Real Purchasing Power (After Inflation)",
    "totalInterest": "Total Interest Earned",
    "inflationLoss": "Inflation Impact Loss",
    "chartTitle": "Change Over Time Chart (Cumulative Growth)"
};

trData.ConcreteSection = {
    "title": "Betonarme Kesit Kapasite Hesabı",
    "width": "Kesit Genişliği - bw (mm)",
    "height": "Faydalı Yükseklik - d (mm)",
    "concreteGrade": "Beton Sınıfı",
    "steelGrade": "Çelik Sınıfı",
    "rebarArea": "Donatı Alanı - As (mm²)",
    "calculate": "Kapasiteyi Hesapla",
    "results": "Taşıma Kapasitesi Analizi",
    "momentCapacity": "Tasarım Moment Kapasitesi (Md)",
    "compressionZone": "Basınç Bloğu Derinliği (a)",
    "ductility": "Kırılma Şekli (Süneklik Kontrolü)",
    "safe": "Güvenli (Sünek Kopma)",
    "unsafe": "Gevrek (Aşırı Donatılı)",
    "visualizer": "Kesit Gerilme Dağılımı"
};

enData.ConcreteSection = {
    "title": "Concrete Section Capacity Calculator",
    "width": "Section Width - bw (mm)",
    "height": "Effective Depth - d (mm)",
    "concreteGrade": "Concrete Grade",
    "steelGrade": "Steel Grade",
    "rebarArea": "Rebar Area - As (mm²)",
    "calculate": "Calculate Capacity",
    "results": "Bearing Capacity Analysis",
    "momentCapacity": "Design Moment Capacity (Md)",
    "compressionZone": "Compression Block Depth (a)",
    "ductility": "Failure Mode (Ductility Check)",
    "safe": "Safe (Ductile Failure)",
    "unsafe": "Brittle (Over-reinforced)",
    "visualizer": "Section Stress Distribution"
};

fs.writeFileSync(trPath, JSON.stringify(trData, null, 4));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
console.log('Finance and Civil translations updated successfully');
