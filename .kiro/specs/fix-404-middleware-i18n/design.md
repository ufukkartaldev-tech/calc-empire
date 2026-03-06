# 404 Middleware i18n Bugfix Design

## Overview

Next.js uygulaması, routing.ts'de tanımlı 16 locale için message dosyalarının eksik olması nedeniyle tüm URL'lerde 404 hatası veriyor. i18n.ts'deki dinamik import (`import(\`./src/messages/${locale}.json\`)`) eksik dosyalar için başarısız oluyor ve bu da middleware'in çalışmamasına neden oluyor. Çözüm, eksik 11 locale için message dosyalarını oluşturmak ve routing.ts ile src/messages/ klasörü arasındaki senkronizasyonu sağlamaktır.

## Glossary

- **Bug_Condition (C)**: routing.ts'de tanımlı bir locale için src/messages/ klasöründe karşılık gelen .json dosyasının bulunmaması durumu
- **Property (P)**: Tüm tanımlı locale'ler için message dosyalarının mevcut olması ve dinamik import'un başarılı olması
- **Preservation**: Mevcut 5 dil dosyasının (en, hi, ja, ru, tr) içeriği ve çeviri kalitesi değişmeden korunmalı
- **routing.ts**: src/i18n/routing.ts dosyası - next-intl routing konfigürasyonunu tanımlar, 16 locale içerir
- **i18n.ts**: Kök dizindeki i18n.ts dosyası - next-intl'in getRequestConfig fonksiyonunu kullanarak locale'e göre message dosyalarını dinamik olarak yükler
- **strings.json**: src/i18n/strings.json dosyası - master çeviri kaynağı, _meta.targetLocales ile hedef dilleri tanımlar
- **translate script**: scripts/translate.mjs - OpenAI API kullanarak strings.json'dan tüm locale'ler için message dosyaları oluşturur

## Bug Details

### Fault Condition

Bug, routing.ts'de tanımlı bir locale için karşılık gelen message dosyası src/messages/ klasöründe bulunmadığında ortaya çıkar. i18n.ts'deki `getRequestConfig` fonksiyonu her request'te çalışır ve `await import(\`./src/messages/${locale}.json\`)` satırı eksik dosyalar için başarısız olur, bu da tüm routing'in çökmesine neden olur.

**Formal Specification:**
```
FUNCTION isBugCondition(locale)
  INPUT: locale of type string
  OUTPUT: boolean
  
  RETURN locale IN routing.locales
         AND NOT fileExists(`src/messages/${locale}.json`)
         AND dynamicImportFails(`./src/messages/${locale}.json`)
END FUNCTION
```

### Examples

- **Eksik de.json**: Kullanıcı /de URL'sine eriştiğinde, i18n.ts'de `import('./src/messages/de.json')` başarısız olur → 404
- **Eksik fr.json**: Kullanıcı /fr URL'sine eriştiğinde, i18n.ts'de `import('./src/messages/fr.json')` başarısız olur → 404
- **Eksik es.json**: Kullanıcı /es URL'sine eriştiğinde, i18n.ts'de `import('./src/messages/es.json')` başarısız olur → 404
- **Mevcut tr.json**: Kullanıcı /tr URL'sine eriştiğinde, dosya mevcut olduğu için import başarılı olmalı → sayfa render edilmeli (ancak bug nedeniyle middleware çöktüğü için 404)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mevcut 5 dil dosyasının (en.json, hi.json, ja.json, ru.json, tr.json) içeriği değişmemeli
- routing.ts'deki locale sıralaması ve defaultLocale ayarı değişmemeli
- strings.json'daki mevcut çeviri içeriği değişmemeli
- translate.mjs script'inin çalışma mantığı değişmemeli

**Scope:**
Sadece eksik 11 locale için yeni message dosyaları oluşturulacak. Mevcut dosyalar, routing konfigürasyonu ve çeviri pipeline'ı tamamen korunacak.

## Hypothesized Root Cause

Bug'ın temel nedeni açık:

1. **Eksik Message Dosyaları**: routing.ts'de 16 locale tanımlı ancak src/messages/ klasöründe sadece 5 dosya var
   - Mevcut: en, hi, ja, ru, tr
   - Eksik: de, fr, es, pt, zh, ar, ko, it, nl, pl, id (11 dosya)

2. **Dinamik Import Hatası**: i18n.ts'deki `await import(\`./src/messages/${locale}.json\`)` satırı eksik dosyalar için exception fırlatıyor
   - Next.js build-time'da bu import'ları resolve etmeye çalışıyor
   - Eksik dosyalar nedeniyle module resolution başarısız oluyor

3. **Middleware Çökmesi**: i18n.ts'deki hata middleware'in initialize olmasını engelliyor
   - getRequestConfig her request'te çalıştığı için ilk request'te hata oluşuyor
   - Bu da tüm routing'in çalışmamasına neden oluyor

4. **Translate Script Çalıştırılmamış**: npm run translate komutu eksik dosyaları oluşturabilir ancak çalıştırılmamış
   - Script OPENAI_API_KEY gerektirir
   - strings.json'daki _meta.targetLocales ile routing.ts'deki locales senkronize

## Correctness Properties

Property 1: Fault Condition - Message Dosyaları Mevcut Olmalı

_For any_ locale tanımlı routing.ts'deki locales array'inde, src/messages/ klasöründe karşılık gelen {locale}.json dosyası MEVCUT OLMALI ve i18n.ts'deki dinamik import başarılı olmalıdır.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Mevcut Çeviriler Korunmalı

_For any_ mevcut message dosyası (en, hi, ja, ru, tr), fix uygulandıktan sonra dosya içeriği AYNI KALMALI ve çeviri kalitesi değişmemelidir.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Fix için iki yaklaşım mevcut:

**Yaklaşım 1: Translate Script Çalıştırma (Önerilen)**

**File**: `scripts/translate.mjs`

**Command**: `npm run translate`

**Specific Changes**:
1. **OPENAI_API_KEY Ayarlama**: Environment variable olarak OpenAI API key'i sağlanmalı
   - `.env.local` dosyasına eklenebilir veya command-line'da verilebilir
   - Örnek: `OPENAI_API_KEY=sk-... npm run translate`

2. **Script Çalıştırma**: translate.mjs script'i otomatik olarak:
   - strings.json'dan _meta.targetLocales'i okur
   - Her locale için OpenAI API'ye çeviri isteği gönderir
   - src/messages/{locale}.json dosyalarını oluşturur
   - Eksik 11 dosyayı (de, fr, es, pt, zh, ar, ko, it, nl, pl, id) otomatik oluşturur

3. **Doğrulama**: Script çalıştıktan sonra src/messages/ klasöründe 16 dosya olmalı
   - en.json (zaten mevcut, script tarafından yeniden yazılır)
   - tr, ru, hi, ja (zaten mevcut, script tarafından yeniden yazılır)
   - de, fr, es, pt, zh, ar, ko, it, nl, pl, id (yeni oluşturulur)

**Yaklaşım 2: Manuel Dosya Oluşturma (Fallback)**

Eğer OpenAI API key'i mevcut değilse:

**File**: `src/messages/{locale}.json` (11 yeni dosya)

**Specific Changes**:
1. **İngilizce Kopyalama**: en.json'ı her eksik locale için kopyala
   - Geçici çözüm olarak İngilizce metinler kullanılır
   - Daha sonra translate script ile güncellenebilir

2. **Dosya Oluşturma**: Her eksik locale için:
   ```bash
   cp src/messages/en.json src/messages/de.json
   cp src/messages/en.json src/messages/fr.json
   # ... diğer 9 locale için tekrarla
   ```

3. **Doğrulama**: 16 dosyanın tümü mevcut olmalı

**Önerilen Yaklaşım**: Yaklaşım 1 (translate script) çünkü:
- Otomatik ve hatasız
- Kaliteli çeviriler üretir
- strings.json ile senkronize kalır
- Gelecekte yeni string eklendiğinde kolayca güncellenebilir

## Testing Strategy

### Validation Approach

Testing stratejisi iki aşamalı: önce bug'ı unfixed code'da doğrula, sonra fix'in çalıştığını ve mevcut davranışı koruduğunu doğrula.

### Exploratory Fault Condition Checking

**Goal**: Fix uygulanmadan ÖNCE bug'ı doğrula. Eksik dosyaların gerçekten import hatasına neden olduğunu göster.

**Test Plan**: Unfixed code'da eksik locale'ler için request simüle et ve import hatasını gözlemle.

**Test Cases**:
1. **Eksik de.json Testi**: /de URL'sine request gönder (unfixed code'da başarısız olacak)
2. **Eksik fr.json Testi**: /fr URL'sine request gönder (unfixed code'da başarısız olacak)
3. **Eksik es.json Testi**: /es URL'sine request gönder (unfixed code'da başarısız olacak)
4. **Root URL Testi**: / URL'sine request gönder (unfixed code'da middleware çöktüğü için başarısız olacak)

**Expected Counterexamples**:
- Dynamic import hatası: "Cannot find module './src/messages/de.json'"
- 404 hatası tüm URL'lerde
- Middleware initialization hatası

### Fix Checking

**Goal**: Fix uygulandıktan sonra tüm locale'ler için message dosyalarının mevcut olduğunu ve import'ların başarılı olduğunu doğrula.

**Pseudocode:**
```
FOR ALL locale IN routing.locales DO
  filePath := `src/messages/${locale}.json`
  ASSERT fileExists(filePath)
  ASSERT canImport(filePath)
  ASSERT validJSON(filePath)
END FOR
```

### Preservation Checking

**Goal**: Mevcut 5 dil dosyasının içeriğinin değişmediğini doğrula.

**Pseudocode:**
```
FOR ALL existingLocale IN ['en', 'hi', 'ja', 'ru', 'tr'] DO
  originalContent := readFile(`src/messages/${existingLocale}.json`, beforeFix)
  fixedContent := readFile(`src/messages/${existingLocale}.json`, afterFix)
  ASSERT originalContent = fixedContent
END FOR
```

**Testing Approach**: Property-based testing burada gerekli değil çünkü:
- Dosya içeriği deterministik
- Basit dosya karşılaştırması yeterli
- Input domain sınırlı (5 dosya)

**Test Plan**: Fix öncesi mevcut dosyaların snapshot'ını al, fix sonrası karşılaştır.

**Test Cases**:
1. **en.json Preservation**: İçerik değişmemeli (translate script en.json'ı yeniden yazar ama aynı içerikle)
2. **tr.json Preservation**: İçerik değişmemeli
3. **ru.json Preservation**: İçerik değişmemeli
4. **hi.json Preservation**: İçerik değişmemeli
5. **ja.json Preservation**: İçerik değişmemeli

### Unit Tests

- Her locale için message dosyasının varlığını test et
- Her message dosyasının geçerli JSON olduğunu test et
- routing.locales ile src/messages/ dosyalarının senkronize olduğunu test et
- i18n.ts'deki dinamik import'un her locale için başarılı olduğunu test et

### Property-Based Tests

Property-based testing bu bug için gerekli değil çünkü:
- Input domain sınırlı ve deterministik (16 locale)
- Dosya varlığı binary bir durum (var/yok)
- Manuel unit testler yeterli coverage sağlar

### Integration Tests

- Localhost'ta her locale URL'ine erişim testi (/en, /tr, /de, vb.)
- Root URL'den (/) default locale'e yönlendirme testi
- Middleware'in tüm locale'ler için düzgün çalıştığını test et
- Browser'da her dilde sayfa render testi
- Geçersiz locale için fallback davranışı testi (/invalid-locale → /en)
