# Bugfix Requirements Document

## Introduction

Next.js uygulaması localhost'ta çalıştırıldığında tüm URL'ler (root "/" ve locale URL'leri "/tr", "/en" vb.) 404 hatası veriyor. Sorunun temel nedeni, routing.ts'de tanımlı 16 dil için message dosyalarının eksik olması ve i18n.ts'deki dinamik import'un bu eksik dosyalar için başarısız olmasıdır. routing.ts'de 16 dil tanımlı (en, tr, ru, de, fr, es, pt, zh, ar, ko, hi, ja, it, nl, pl, id) ancak src/messages/ klasöründe sadece 5 dil dosyası mevcut (en, hi, ja, ru, tr). Eksik 11 dil dosyası (de, fr, es, pt, zh, ar, ko, it, nl, pl, id) nedeniyle i18n.ts'deki `import(\`./src/messages/${locale}.json\`)` çağrısı başarısız oluyor ve bu da tüm routing'in çalışmamasına neden oluyor.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN kullanıcı http://localhost:3000/ adresine eriştiğinde THEN sistem 404 hatası döndürür

1.2 WHEN kullanıcı http://localhost:3000/tr veya http://localhost:3000/en gibi locale URL'lerine eriştiğinde THEN sistem 404 hatası döndürür

1.3 WHEN i18n.ts dosyası eksik bir locale için message dosyası yüklemeye çalıştığında (örn: de, fr, es, pt, zh, ar, ko, it, nl, pl, id) THEN dinamik import başarısız olur ve routing çalışmaz

1.4 WHEN routing.ts'de 16 dil tanımlı olduğunda ancak src/messages/ klasöründe sadece 5 dil dosyası bulunduğunda THEN locale validation başarısız olur ve sayfa render edilemez

### Expected Behavior (Correct)

2.1 WHEN kullanıcı http://localhost:3000/ adresine eriştiğinde THEN sistem varsayılan dile (en) yönlendirme yapmalı ve ana sayfa görüntülenmeli

2.2 WHEN kullanıcı http://localhost:3000/tr veya http://localhost:3000/en gibi mevcut message dosyası olan locale URL'lerine eriştiğinde THEN sistem ilgili dilde sayfa görüntülemeli

2.3 WHEN i18n.ts dosyası bir locale için message dosyası yüklemeye çalıştığında THEN sadece mevcut message dosyaları olan locale'ler için başarılı olmalı

2.4 WHEN routing.ts'de tanımlı locale sayısı ile src/messages/ klasöründeki dosya sayısı eşleştiğinde THEN tüm locale'ler için routing düzgün çalışmalı

### Unchanged Behavior (Regression Prevention)

3.1 WHEN mevcut 5 dil dosyası (en, hi, ja, ru, tr) için message içeriği değiştirilmediğinde THEN bu dillerdeki çeviriler aynı kalmalı

3.2 WHEN routing.ts'deki locale sıralaması ve defaultLocale ayarı değiştirilmediğinde THEN varsayılan dil davranışı aynı kalmalı

3.3 WHEN middleware.ts'deki matcher pattern'i değiştirilmediğinde THEN URL matching davranışı aynı kalmalı

3.4 WHEN i18n.ts'deki locale validation mantığı değiştirilmediğinde THEN geçersiz locale'ler için fallback davranışı aynı kalmalı
