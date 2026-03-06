import fs from 'fs';
import path from 'path';

const basePath = 'c:/Users/90538/Desktop/02_Yazilim_Projeleri/calc-empire/src/messages';

const trPath = path.join(basePath, 'tr.json');
const enPath = path.join(basePath, 'en.json');

const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

trData.BaseConverter = {
    "title": "Base Converter & Bitwise Logic",
    "description": "Farklı sayı tabanları arasında dönüşüm yapın ve bit düzeyinde (Bitwise) işlemleri kopyalayarak analiz edin.",
    "inputLabel": "Dönüştürülecek Sayı",
    "inputPlaceholder": "Örn. 1010, 255, FF...",
    "fromBase": "Giriş Tabanı",
    "decimal": "10'luk (Decimal)",
    "binary": "2'lik (Binary)",
    "hex": "16'lık (Hex)",
    "octal": "8'lik (Octal)",
    "results": "Dönüşüm Sonuçları",
    "copy": "Kopyala",
    "copied": "Kopyalandı!",
    "invalidInput": "Geçersiz giriş. Lütfen seçili tabana uygun karakterler girin.",
    "bitwiseOperations": "Bitwise İşlemler (Bit Düzeyi)",
    "operandA": "İşlenen A (Sayısal Değer 1)",
    "operandB": "İşlenen B (Sayısal Değer 2)",
    "operator": "Operatör",
    "calculateBitwise": "Hesapla ve Bitleri Göster",
    "bitwiseResult": "İşlem Sonucu",
    "bitwiseExplanation": "Bit düzeyinde karşılıklı işlem görünümü:"
};

enData.BaseConverter = {
    "title": "Base Converter & Bitwise Logic",
    "description": "Convert between different number bases and visually analyze bitwise logical operations.",
    "inputLabel": "Number to Convert",
    "inputPlaceholder": "e.g., 1010, 255, FF...",
    "fromBase": "Input Base",
    "decimal": "Decimal (Base 10)",
    "binary": "Binary (Base 2)",
    "hex": "Hexadecimal (Base 16)",
    "octal": "Octal (Base 8)",
    "results": "Conversion Results",
    "copy": "Copy",
    "copied": "Copied!",
    "invalidInput": "Invalid input. Please enter characters matching the selected base.",
    "bitwiseOperations": "Bitwise Operations",
    "operandA": "Operand A (Decimal)",
    "operandB": "Operand B (Decimal)",
    "operator": "Operator",
    "calculateBitwise": "Calculate & Show Bits",
    "bitwiseResult": "Result",
    "bitwiseExplanation": "Detailed bit-by-bit logical view:"
};

fs.writeFileSync(trPath, JSON.stringify(trData, null, 4));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
console.log('BaseConverter translations updated successfully');
