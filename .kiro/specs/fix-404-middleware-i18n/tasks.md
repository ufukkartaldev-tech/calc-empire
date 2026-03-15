# Implementation Plan

- [-] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Message Dosyaları Eksik
  - **CRITICAL**: Bu test UNFIXED code'da BAŞARISIZ OLMALI - başarısızlık bug'ın varlığını doğrular
  - **AMAÇ**: Eksik message dosyalarının import hatasına neden olduğunu göster
  - **Scoped PBT Approach**: Eksik locale'ler için (de, fr, es) concrete test case'leri oluştur
  - Test: routing.ts'deki her locale için src/messages/{locale}.json dosyasının mevcut olduğunu kontrol et
  - Test: i18n.ts'deki dinamik import'un her locale için başarılı olduğunu doğrula
  - UNFIXED code'da çalıştır
  - **BEKLENEN SONUÇ**: Test BAŞARISIZ (11 eksik dosya için import hatası)
  - Counterexample'ları dokümante et (örn: "de.json eksik, import başarısız")
  - Task tamamlandı olarak işaretle: test yazıldı, çalıştırıldı, başarısızlık dokümante edildi
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Write preservation property tests (fix uygulanmadan ÖNCE)
  - **Property 2: Preservation** - Mevcut Çeviriler Korunmalı
  - **ÖNEMLİ**: Observation-first metodolojisini takip et
  - Gözlem: UNFIXED code'da mevcut 5 dosyanın (en, hi, ja, ru, tr) içeriğini kaydet
  - Test: Her mevcut dosya için snapshot oluştur
  - Test: Fix sonrası dosya içeriğinin snapshot ile aynı olduğunu doğrula
  - UNFIXED code'da çalıştır
  - **BEKLENEN SONUÇ**: Testler BAŞARILI (baseline davranış kaydedildi)
  - Task tamamlandı olarak işaretle: testler yazıldı, çalıştırıldı, unfixed code'da başarılı
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Fix for 404 middleware i18n bug
  - [ ] 3.1 Eksik message dosyalarını oluştur
    - OPENAI_API_KEY environment variable'ını ayarla
    - `npm run translate` komutunu çalıştır
    - Script otomatik olarak eksik 11 dosyayı oluşturacak (de, fr, es, pt, zh, ar, ko, it, nl, pl, id)
    - Fallback: API key yoksa en.json'ı manuel kopyala
    - src/messages/ klasöründe 16 dosyanın tümünün mevcut olduğunu doğrula
    - _Bug_Condition: isBugCondition(locale) where locale IN routing.locales AND NOT fileExists(`src/messages/${locale}.json`)_
    - _Expected_Behavior: Her locale için message dosyası mevcut ve dinamik import başarılı_
    - _Preservation: Mevcut 5 dosya (en, hi, ja, ru, tr) içeriği değişmemeli_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Tüm Message Dosyaları Mevcut
    - **ÖNEMLİ**: Task 1'deki AYNI testi çalıştır - yeni test yazma
    - Task 1'deki test expected behavior'ı encode eder
    - Test başarılı olduğunda, expected behavior'ın sağlandığını doğrular
    - Bug condition exploration testini çalıştır
    - **BEKLENEN SONUÇ**: Test BAŞARILI (bug düzeltildi)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Mevcut Çeviriler Korundu
    - **ÖNEMLİ**: Task 2'deki AYNI testleri çalıştır - yeni test yazma
    - Preservation property testlerini çalıştır
    - **BEKLENEN SONUÇ**: Testler BAŞARILI (regression yok)
    - Tüm testlerin fix sonrası hala başarılı olduğunu doğrula

- [ ] 4. Checkpoint - Ensure all tests pass
  - Tüm testlerin başarılı olduğundan emin ol
  - Sorular çıkarsa kullanıcıya danış
