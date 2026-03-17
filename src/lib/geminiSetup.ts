import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with your key.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCLsg2ahWNDarmKkVTVRWP7qeAEvxEYksg";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = () => {
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// ═══════════════════════════════════════════════════════════════════
// TYMM SORU YAZIM KILAVUZU — SİSTEM PROMPT'U
// Kaynak: MEB TYMM Bağlam Temelli Çoktan Seçmeli Soru Yazım Kılavuzu (Ocak 2026)
// ═══════════════════════════════════════════════════════════════════

export const TYMM_RULES_CONTEXT = `
Sen "Türkiye Yüzyılı Maarif Modeli (TYMM) Bağlam Temelli Soru Yazım Kılavuzu"na hakim, uzman bir ölçme-değerlendirme akademisyenisin.
Amacın, öğretmenlere üst düzey zihinsel becerileri ölçen, bağlam temelli yeni nesil çoktan seçmeli sorular yazmalarında yardımcı olmaktır.

══ TEMEL İLKELER ══

1. BECERİ TEMELLİ ÖLÇME: Sorular "ne biliyor" değil, "bildiğiyle ne yapabiliyor" sorusuna cevap aramalıdır. Bilgi tek başına yeterli değildir; bilginin beceriyle bütünleşik biçimde kullanılması ölçülmelidir.

2. BAĞLAM ZORUNLULUĞU: Her soru otantik bir bağlama (senaryo, metin, grafik, tablo, veri seti) dayanmalıdır. Bağlam gerçek yaşamla ilişkili, öğrencinin karşılaşabileceği veya akademik merakını uyandıracak nitelikte olmalıdır.

3. BAĞLAM İŞLEVSELLİK TESTİ: "Öğrenci bu metni/görseli incelemeden, sadece ön bilgisiyle veya seçeneklerden eleyerek soruyu cevaplayabilir mi?" ➜ Evetse bağlam işlevsizdir ve soru yeniden kurgulanmalıdır. Bağlam dekoratif bir metin veya gereksiz bir hikâye olmamalıdır.

4. BİLİŞSEL YÜK KONTROLÜ: Metin anlaşılır olmalı, çözümle ilgisi olmayan gereksiz detaylar, ağdalı dil, dekoratif görseller ve karmaşık cümle yapıları çıkartılmalıdır. Bağlam kurgulanırken metin ile görsel arasındaki bütünlük "dikkat bölünmesi etkisini" en aza indirecek şekilde tasarlanmalıdır.

5. ÇELDİRİCİ TASARIMI:
   • Çeldiriciler rastgele yanlış ifadelerden DEĞİL; öğrencinin konuyu "eksik öğrenmesi" veya yanlış yapılandırması nedeniyle düşebileceği kavram yanılgılarından ya da hatalı akıl yürütmelerden seçilmelidir.
   • Metindeki cümle/kelime aynen seçeneklerde kullanılmamalıdır; anlam olarak özdeş ama farklı kelimelerle ifade edilmelidir.
   • "Hepsi", "Hiçbiri", "A ve B" gibi seçenekler KULLANILMAMALIDIR.
   • Seçeneklerin uzunluk, dil bilgisi ve karmaşıklık bakımından birbirine benzer olması gerekir; doğru cevap diğerlerinden daha uzun veya detaylı olmamalıdır.

6. SORU KÖKÜ KURALLARI:
   • Çift olumsuzluk ("...olmadığı söylenemez?") kullanılmamalıdır.
   • Olumsuzluk ifadesi tek ve net olmalı, altı çizilmeli veya koyu yazılmalıdır.
   • "Sizce" gibi öznel ifadeler kullanılmamalıdır.
   • Soru kökünde bilgi anlatılmamalı; bilgi bağlama yerleştirilmeli, soru kökü sadece öğrenciyi cevaplamaya yönlendirmelidir.
   • Sorular arası ipucu zinciri oluşmamalıdır (1. soruyu çözemeyen öğrenci 2. soruyu bağımsız çözebilmelidir).

7. TARAFSIZLIK: Bağlam, sadece belirli bir sosyoekonomik çevrenin veya grubun (VİOP, borsa, golf vb.) aşina olduğu kavramlardan seçilmemelidir. Herkesin erişebileceği ortak bağlamlar tercih edilmelidir. Kültür, cinsiyet, bölge, din açısından tarafsız olmalıdır.

══ SÜREÇ BİLEŞENLERİ ══

A) PROBLEM ÇÖZME BECERİSİ (KB3.2):
   KB3.2.SB1 — Problemi yapılandırmak: Öğrenci bağlamdaki bilgileri ayıklayıp "çözülmesi gereken asıl mesele nedir?" sorusuna kendi zihninde yanıt bulmalıdır.
   KB3.2.SB2 — Problemi özetlemek: Öğrenci gereksiz ayrıntıları eleyerek veriyi en yalın hâliyle ifade edebilmelidir.
   KB3.2.SB3 — Gözleme/veriye dayalı tahmin: Mevcut veriden henüz gerçekleşmemiş durumu veya eksik değeri belirlemek.
   KB3.2.SB4 — Akıl yürütme: "Koşullardan biri değiştirilseyse sonuç nasıl etkilenirdi?" türünde sebep-sonuç analizi.
   KB3.2.SB5 — Yansıtma/değerlendirme: Ulaşılan sonucu farklı bağlama uyarlama veya geçerliğini test etme.

B) SORGULAMA BECERİSİ (KB2.8):
   KB2.8.SB1 — Konuyu tanımlamak: Belirsizlik barındıran durumda odak soruyu belirlemek.
   KB2.8.SB2 — Sorular sormak: Belirsizliği gidermek için stratejik soru sorma yetkinliği.
   KB2.8.SB3 — Bilgi toplamak: Bu iddiayı kanıtlamak için hangi veri/kaynak gerektiğini belirlemek.
   KB2.8.SB4 — Doğruluğu değerlendirmek: Çelişen kaynaklar arasında hangisinin daha güvenilir olduğunu belirlemek.
   KB2.8.SB5 — Çıkarım yapmak: Kanıtlar arasında mantıksal köprüler kurarak nihai yargıya varmak.

══ KONTROL LİSTESİ (Soru Bazında) ══

✓ Bağlam öğrencinin yaş ve sınıf düzeyine uygun mu?
✓ Bağlam gerçek yaşamla ilişkili mi?
✓ Bağlam gereksiz/karmaşık detaylardan ve okuma yükünden arındırılmış mı?
✓ Bağlam ilgili beceriyi harekete geçirecek nitelikte mi?
✓ Bağlam tarafsız ve önyargıdan uzak mı?
✓ Soru açık ve anlaşılır bir dille yazılmış mı?
✓ Güçlük düzeyi hedef gruba uygun mu?
✓ Soru kökü ve seçenekler becerinin süreç bileşenini ölçecek şekilde mi?
✓ Soru, bağlamdaki bilgiyle cevaplanabilir mi (ön bilgiden bağımsız)?
✓ Seçenekler uzunluk ve biçim bakımından birbirine benzer mi?
✓ Çeldiriciler konuyu eksik öğrenen öğrenciyi çekecek kadar güçlü mü?
✓ İpucu veren ifadelerden kaçınılmış mı?
✓ "Hepsi/Hiçbiri" gibi seçenekler yok mu?
✓ Dil bilgisi ve anlatım bozukluğu yok mu?

══ SIK YAPILAN HATALAR ══

BAĞLAM HATALARI:
• ❌ Metin "küresel ısınma" anlatıyor ama soru "Hangisi sera gazıdır?" (ön bilgiyle çözülebilir)
• ✅ Sorunun çözümü için grafikteki "yıllık sıcaklık artışının" okunması zorunlu olmalı
• ❌ "3×2+5 ekmek aldı" (yapay ve hayatın olağan akışına aykırı)
• ✅ "Farklı gramajlardaki ürünlerin birim fiyatlarını karşılaştırarak ekonomik tercih yapmak"

SORU KÖKÜ HATALARI:
• ❌ "...olmadığı söylenemez?" (çift olumsuzluk)
• ❌ Soru kökünde bilgi anlatmaya devam etmek
• ❌ 2. sorunun kökünde "Bir önceki soruda bulduğunuz sonuca göre..."

ÇELDİRİCİ HATALARI:
• ❌ Sadece seçenek sayısını doldurmak için bariz yanlış yazmak
• ❌ Doğru cevabın diğerlerinden bariz şekilde daha uzun olması
• ❌ Metindeki cümlenin aynen seçenekte kullanılması

══ KRİTİK: HESAPLAMA VE DOĞRULUK KURALLARI ══

🚫 YASAKLAR:
• ASLA karmaşık matematik hesaplaması yapma (Newton interpolasyonu, Lagrange, yüksek dereceli polinom çözümü vb.)
• ASLA uzun adım adım çözüm yazma — soruyu ÇÖZMEK senin görevin değil, soru YAZMAK senin görevin
• ASLA 4 haneli veya daha büyük sayıları doğru cevap olarak verme — basit, kontrol edilebilir sayılar kullan
• ASLA seçenekleri hesaplama yaparak oluşturma — seçenekler mantıksal ve kontrol edilebilir olmalı

✅ ZORUNLU KURALLAR:
• Doğru cevap KISA bir mantıkla (en fazla 2-3 adımda) doğrulanabilir olmalıdır
• Seçenekler küçük ve yuvarlak sayılardan oluşmalıdır (örn: 3, 6, 12, -2, 1/2 gibi)
• Sorunun cevabını kendin hesaplayamıyorsan o soruyu YAZMA, daha basit bir soru yaz
• Çeldiriciler gerçek kavram yanılgılarına dayanmalı, rastgele sayılar olmamalı
• Her sorunun mutlaka TEK bir doğru cevabı olmalı ve bu cevap şıklardan biriyle birebir eşleşmeli
• Fonksiyon, polinom gibi konularda soruları KAVRAMSAL düzeyde sor (grafik yorumlama, kök bulma, işaret tablosu gibi), HESAPLAMA sorusu sorma

══ FORMATLAMA KURALLARI ══

1. MATEMATİKSEL İFADELER (ÇOK ÖNEMLİ):
   • Tüm matematiksel formüller LaTeX formatında, dolar işareti ($...$) içinde yazılmalıdır.
   • Satır içi formüller: $x^2 + 3x + 5$ (tek dolar işareti)
   • Blok formüller: $$P(x) = ax^2 + bx + c$$ (çift dolar işareti)
   • KESİRLER: $\frac{pay}{payda}$ — Örnek: $\frac{7}{34}$, $\frac{3}{4}$
   • KÖKLER: $\sqrt{x}$, $\sqrt[3]{x}$
   • ÜSLÜ: $x^{2n+1}$
   • EŞİTSİZLİK: $\leq$, $\geq$, $\neq$
   ⚠️ UYARI: \frac, \sqrt, \leq gibi LaTeX komutlarının başında MUTLAKA ters eğik çizgi (backslash) olmalı!
   ⚠️ DOĞRU: $\frac{a}{b}$ — YANLIŞ: $frac{a}{b}$ veya rac{a}{b}

2. GRAFİK ve SVG KODU ÜRETME. Grafik görseli ayrı bir adımda oluşturulacak.
`;

// ═══════════════════════════════════════════════════════════════════
// MERKEZİ GEMİNİ API ÇAĞRI FONKSİYONU
// ═══════════════════════════════════════════════════════════════════

async function callGemini(prompt: string): Promise<string> {
    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        if (!text) {
            throw new Error('Gemini boş yanıt döndürdü.');
        }
        return text;
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Gemini API Hatası:', err);

        if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
            throw new Error('API anahtarınız geçersiz. Lütfen Google AI Studio\'dan yeni bir anahtar alın: https://aistudio.google.com/apikey');
        }
        if (err.message?.includes('QUOTA') || err.message?.includes('429')) {
            throw new Error('API kota sınırına ulaşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.');
        }
        if (err.message?.includes('SAFETY')) {
            throw new Error('İçerik güvenlik filtrelerine takıldı. Lütfen farklı bir konu veya metin deneyin.');
        }
        if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('Failed to fetch')) {
            throw new Error('İnternet bağlantınızı kontrol edin. Gemini sunucusuna erişilemiyor.');
        }
        if (err.message?.includes('404') || err.message?.includes('NOT_FOUND')) {
            throw new Error('API modeli bulunamadı. Model adı güncellenmelidir.');
        }
        throw new Error(`Gemini API hatası: ${err.message || 'Bilinmeyen hata'}`);
    }
}

// ═══════════════════════════════════════════════════════════════════
// MULTİMODAL GEMİNİ API ÇAĞRI FONKSİYONU (PDF + Görsel Destekli)
// ═══════════════════════════════════════════════════════════════════

export interface UploadedFile {
    name: string;
    mimeType: string;
    base64Data: string; // data kısmı (prefix olmadan)
}

async function callGeminiMultimodal(textPrompt: string, files: UploadedFile[]): Promise<string> {
    try {
        const model = getGeminiModel();

        // Gemini multimodal parts oluştur
        const parts: any[] = [];

        // Dosyaları ekle
        for (const file of files) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.base64Data,
                },
            });
            parts.push({ text: `[Yüklenen dosya: ${file.name}]` });
        }

        // Metin prompt'u en sona ekle
        parts.push({ text: textPrompt });

        const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
        const response = result.response;
        const text = response.text();
        if (!text) {
            throw new Error('Gemini boş yanıt döndürdü.');
        }
        return text;
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Gemini Multimodal API Hatası:', err);

        if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid')) {
            throw new Error('API anahtarınız geçersiz.');
        }
        if (err.message?.includes('QUOTA') || err.message?.includes('429')) {
            throw new Error('API kota sınırına ulaşıldı. Birkaç dakika bekleyip tekrar deneyin.');
        }
        if (err.message?.includes('SAFETY')) {
            throw new Error('İçerik güvenlik filtrelerine takıldı.');
        }
        if (err.message?.includes('too large') || err.message?.includes('size')) {
            throw new Error('Dosya boyutu çok büyük. PDF: max 50MB, Görsel: max 20MB.');
        }
        if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('Failed to fetch')) {
            throw new Error('İnternet bağlantınızı kontrol edin.');
        }
        throw new Error(`Gemini API hatası: ${err.message || 'Bilinmeyen hata'}`);
    }
}

// ═══════════════════════════════════════════════════════════════════
// MATERYAL TABANLI SORU ÜRETİCİ (PDF + Görsel + Kazanım)
// ═══════════════════════════════════════════════════════════════════

export async function analyzeAndGenerate(
    topic: string,
    grade: string,
    skill: string,
    subject: string,
    files: UploadedFile[]
): Promise<string> {
    const pdfFiles = files.filter(f => f.mimeType === 'application/pdf');
    const imageFiles = files.filter(f => f.mimeType.startsWith('image/'));

    const prompt = `
${TYMM_RULES_CONTEXT}

════ GÖREV: MATERYAL ANALİZİ VE OTANTİK BAĞLAM ÜRETİMİ ════

⚠️ ÖNEMLİ: Bu adımda SADECE bağlam (senaryo) üret. SORU ÜRETME! Soru üretimi bir sonraki adımda yapılacak.

Sana ders materyalleri ve/veya eski test görselleri yüklendi. Bunları analiz et ve TYMM standartlarında otantik bir BAĞLAM oluştur.

📋 GİRDİLER:
• Konu / Kazanım: ${topic}
• Sınıf Seviyesi: ${grade}
• Ders: ${subject}
• Ölçülecek Beceri: ${skill}
${pdfFiles.length > 0 ? `• 📄 Yüklenen PDF sayısı: ${pdfFiles.length} (Ders içeriği / konu anlatımı)` : ''}
${imageFiles.length > 0 ? `• 🖼️ Yüklenen görsel sayısı: ${imageFiles.length} (Eski test soruları / örnek sorular)` : ''}

${pdfFiles.length > 0 ? `
══ PDF ANALİZ TALİMATI ══
Yüklenen PDF'lerdeki konu anlatımını DİKKATLİCE oku ve şunları çıkar:
• Konunun temel kavramları ve anahtar bilgileri
• Öğrencinin bilmesi gereken kritik noktalar
• Soru üretimi için kullanılabilecek veriler, tablolar, grafikler
` : ''}

${imageFiles.length > 0 ? `
══ GÖRSEL ANALİZ TALİMATI ══
Yüklenen soru görsellerini DİKKATLİCE incele ve şunları analiz et:
• Soruların zorluk seviyesi (kolay / orta / zor)
• Soru formatı ve yapısı
• Bu soruların TYMM standartlarına uygunluk durumu
` : ''}

📝 ÜRETİLECEK ÇIKTI (Markdown formatında):

${pdfFiles.length > 0 ? `
## 📄 Ders İçeriği Analizi
[PDF'deki konu anlatımının KISA özeti — en fazla 5-6 madde. Soru için kullanılabilecek temel bilgiler.]
` : ''}

${imageFiles.length > 0 ? `
## 🖼️ Mevcut Soru Analizi
[Yüklenen eski soruların KISA zorluk ve format analizi — en fazla 3-4 madde.]
` : ''}

## 🎯 Üretilen Otantik Bağlam
[Analiz edilen materyallere dayalı, gerçek yaşamla ilişkili, 80-150 kelime arası OTANTİK BAĞLAM METNİ.
PDF'teki konuya sadık kalmalı.
Bağlam içinde veriler, sayısal değerler veya tablo/grafik verisi bulunmalı.
Bağlam, öğrencinin sadece ezber bilgisiyle değil, analiz yaparak soruyu çözmesini gerektirmeli.]

⚠️ HATIRLATMA: Bu çıktıda SORU YAZMA. Sadece bağlam ve analiz üret.
`;

    if (files.length > 0) {
        return await callGeminiMultimodal(prompt, files);
    } else {
        return await callGemini(prompt);
    }
}

// ═══════════════════════════════════════════════════════════════════
// 1. BAĞLAM (SENARYO) ÜRETİCİ
// ═══════════════════════════════════════════════════════════════════

export async function generateScenario(topic: string, grade: string, skill: string) {
    const prompt = `
${TYMM_RULES_CONTEXT}

════ GÖREV: OTANTİK BAĞLAM ÜRETİMİ ════

Aşağıdaki bilgilere göre TYMM standartlarında otantik bir BAĞLAM (Senaryo/Metin) üret.

📋 GİRDİLER:
• Konu / Kazanım: ${topic}
• Sınıf Seviyesi: ${grade}
• Ölçülecek Beceri / Süreç Bileşeni: ${skill}

📝 ÜRETİLECEK ÇIKTI (Markdown formatında):

## 🎯 [Dikkat Çekici Başlık]

### Bağlam Metni
[Öğrencinin günlük hayatta karşılaşabileceği veya bilimsel/toplumsal gerçekçi bir senaryo yaz. İçinde öğrencinin analiz edeceği bir problem, veri veya ikilem barındırmalıdır. Mümkünse gerçek veri kaynağı (TÜİK, NASA, MGM vb.) referans ver. Metin sınıf seviyesinin dil düzeyine uygun, 80-150 kelime arası olsun.]

### Bağlam Değerlendirmesi
• **İşlevsellik Kontrolü:** Bu metin olmadan soru çözülememeli. Bağlam neden işlevsel?
• **Otantiklik:** Gerçek yaşamla bağlantısı nedir?
• **Bilişsel Yük:** Gereksiz detay var mı, metin sade ve odaklı mı?
• **Hedef Beceri Uyumu:** Bu bağlam ${skill} becerisini nasıl harekete geçirir?
• **Referans Kaynağı:** Bağlamda kullanılan verilerin kaynağı ne olabilir?

### Önerilen Süreç Bileşenleri
[Bu bağlam üzerinden hangi süreç bileşenleri (KB3.2.SB1-SB5 veya KB2.8.SB1-SB5) ölçülebilir, kısa açıkla.]
`;

    return await callGemini(prompt);
}

// ═══════════════════════════════════════════════════════════════════
// 2. SORU ÜRETİCİ
// ═══════════════════════════════════════════════════════════════════

export async function generateQuestion(context: string, grade: string, subject: string) {
    const prompt = `
${TYMM_RULES_CONTEXT}

════ GÖREV: TYMM UYUMLU ÇOKTAN SEÇMELİ SORU ÜRETİMİ ════

Verilen bağlam metnini okuyan bir öğrencinin becerilerini ölçecek TYMM standartlarına tam uygun 1 adet Çoktan Seçmeli Soru (A, B, C, D) yaz.

⚠️ KRİTİK KURALLAR:
1. Bağlam metnini MUTLAKA AYNEN KULLAN — sorunun bir parçası olarak bağlamı öğrenciye ver
2. Soru bağlam metni OLMADAN çözülememeli — bağlam dekoratif değil, İŞLEVSEL olmalı
3. Doğru cevabı en fazla 2-3 basit adımda kontrol edebilmelisin. Kendin hesaplayamıyorsan o soruyu YAZMA
4. Seçenekler KÜÇÜK, YUVARLAK ve KONTROL EDİLEBİLİR sayılar olmalı (10, 24, -3, 1/2 gibi)
5. ASLA 4 haneli veya daha büyük sayıları cevap yapma
6. Fonksiyon/polinom/geometri konularında KAVRAMSAL soru sor (grafik yorumlama, kök sayısı, işaret değişimi vb.)
7. ASLA uzun çözüm yazma — kısa ve net gerekçe yeterli

📋 GİRDİLER:
• Bağlam Metni: "${context}"
• Sınıf Seviyesi: ${grade}
• Ders: ${subject}

📝 ÜRETİLECEK ÇIKTI (Markdown formatında):

## 📌 Soru

**Ölçülen Süreç Bileşeni:** [KB3.2.SBx veya KB2.8.SBx kodu ve adı]

### Bağlam
[Önceki adımdan gelen bağlam metnini buraya yaz — AYNEN veya hafifçe düzenleyerek]

### Soru Kökü
[Öğrenciyi bağlamı kullanmaya zorlayan soru. Bağlamdaki veriyle çözülmeli, ön bilgiyle değil.]

A) [Seçenek — kısa, net]
B) [Seçenek — benzer uzunlukta]
C) [Seçenek — benzer uzunlukta]
D) [Seçenek — benzer uzunlukta]

---

### ✅ Doğru Cevap
**Cevap: [Şık harfi])**
**Gerekçe:** [En fazla 3 cümle. Öğrencinin bağlamdan hangi veriyi alıp nasıl sonuca ulaştığı.]

### 🔍 Çeldirici Analizi
• **A)** [Kavram yanılgısı veya tipik hata — 1 cümle]
• **B)** [Kavram yanılgısı — 1 cümle]
• **C)** [Kavram yanılgısı — 1 cümle]
• **D)** [Kavram yanılgısı — 1 cümle]

### 🛡️ Kontrol
• Bağlamsız çözülebilir mi? ➜ Hayır
• Doğru cevap uzunluk olarak ayrışıyor mu? ➜ Hayır
• Seçenekler dengeli mi? ➜ Evet
`;

    return await callGemini(prompt);
}

// ═══════════════════════════════════════════════════════════════════
// 3. SORU DENETLEYİCİ (Kontrol Listesi Tabanlı)
// ═══════════════════════════════════════════════════════════════════

export async function auditQuestion(questionData: string) {
    const prompt = `
${TYMM_RULES_CONTEXT}

════ GÖREV: TYMM SORU DENETİMİ (KONTROL LİSTESİ) ════

Aşağıda bir öğretmen tarafından yazılmış bir soru (bağlam metni, soru kökü ve şıklar) verilmiştir. Bu soruyu TYMM Soru Yazım Kılavuzu'ndaki kontrol listesine göre MADDE MADDE denetle.

📋 DENETLENECEK SORU:
"${questionData}"

📝 ÜRETİLECEK DENETİM RAPORU (Markdown formatında):

## 📋 TYMM Soru Denetim Raporu

### 1. Bağlam Seçimi
| Kontrol Ölçütü | Sonuç | Açıklama |
|---|---|---|
| Bağlam öğrencinin yaş ve sınıf düzeyine uygun mu? | ✅/❌ | [Kısa açıklama] |
| Bağlam gerçek yaşamla ilişkili mi? | ✅/❌ | [Kısa açıklama] |
| Bağlam gereksiz ve karmaşık detaylardan arındırılmış mı? | ✅/❌ | |
| Bağlam gereksiz okuma yükünden arındırılmış mı? | ✅/❌ | |
| Bağlam ilgili beceriyi harekete geçirecek nitelikte mi? | ✅/❌ | |
| Bağlam kültür, cinsiyet, bölge, din açısından tarafsız mı? | ✅/❌ | |

### 2. Soru ve Seçenekler
| Kontrol Ölçütü | Sonuç | Açıklama |
|---|---|---|
| Soru açık ve anlaşılır bir dille yazılmış mı? | ✅/❌ | |
| Güçlük düzeyi hedeflenen gruba uygun mu? | ✅/❌ | |
| Soru kökü/seçenekler süreç bileşenini ölçecek şekilde mi? | ✅/❌ | |
| Soru, bağlamdaki bilgiyle cevaplanabilir mi (ön bilgiden bağımsız)? | ✅/❌ | |
| Seçenekler uzunluk ve biçim bakımından birbirine benzer mi? | ✅/❌ | |
| Çeldiriciler yeterince güçlü mü? | ✅/❌ | |
| İpucu veren ifadelerden kaçınılmış mı? | ✅/❌ | |
| "Hepsi/Hiçbiri" gibi seçenekler var mı? | ✅/❌ | |

### 3. Dil ve Anlatım
| Kontrol Ölçütü | Sonuç | Açıklama |
|---|---|---|
| Dil bilgisi kurallarına uyulmuş mu? | ✅/❌ | |
| Anlatım bozukluğu var mı? | ✅/❌ | |

### 4. Genel Puan: [X/10]

### 5. Sık Yapılan Hatalar Kontrolü
[Kılavuzdaki "Sık Yapılan Hatalar" tablolarına (bağlam, soru kökü, seçenek, bilişsel yük) göre bu soruda tespit edilen hatalar:]

### 6. 🔧 İyileştirme Önerileri
[TYMM'ye tam uyumlu hale getirmek için yapılması gereken düzeltmeler, madde madde ve somut:]
`;

    return await callGemini(prompt);
}

// ═══════════════════════════════════════════════════════════════════
// 4. BİLİŞSEL GÖRÜŞME (SESLİ DÜŞÜNME) SİMÜLATÖRÜ
// ═══════════════════════════════════════════════════════════════════

export async function simulateCognitiveInterview(questionData: string) {
    const prompt = `
${TYMM_RULES_CONTEXT}

════ GÖREV: BİLİŞSEL GÖRÜŞME (SESLİ DÜŞÜNME) SİMÜLASYONU ════

TYMM Kılavuzu'ndaki "Bilişsel Görüşme Protokolü"ne uygun olarak simülasyon yap.
Sen şu anda bu soruyu çözen, ortalama başarılı ancak bazı kavram yanılgıları olan bir ortaokul/lise öğrencisisin. Amacımız öğretmene, sorusunun öğrenci zihninde NASIL ANLAŞILDIĞINI göstermektir.

📋 TEST EDİLECEK SORU:
"${questionData}"

📝 ÜRETİLECEK SİMÜLASYON (Markdown formatında, 1. tekil şahıs ağzından öğrenci gibi konuş):

## 💭 Sesli Düşünme Simülasyonu

### 1. Bağlamı Okuma
"Metni okurken aklımdan şunlar geçti..."
[Bağlam ilgini çekti mi? Yaşamından bir durumu anımsattı mı? Anlamını bilmediğin sözcük veya anlaşılması zor cümle var mıydı? Zorlandığın bölümler oldu mu?]

### 2. Soru Kökünü Anlama
"Soru kökünü okuyunca şunu aramam gerektiğini anladım..."
[Soruyu okuyunca aklına gelen ilk cevap ne oldu? Bağlamdaki hangi bilgiye odaklanman gerektiğini anladın mı?]

### 3. Seçenekleri Değerlendirme
"Şıklara baktığımda..."
[Her şıkkı tek tek değerlendir. Hangisi sana önce mantıklı geldi? Hangileri arasında kaldın? Çeldiriciye nasıl düştün veya düşmekten nasıl kurtuldun? Seçenekler arasında anlamsız veya ne demek istediğini anlamadığın ifade var mıydı?]

### 4. Karar ve Doğrulama
"Sonunda cevabımı şu şekilde verdim..."
[Cevabını verirken metindeki bir cümleyi mi hatırladın, yoksa önceden bildiğin bilgiyi mi kullandın? Cevabından ne kadar eminsin? Soru senin için zor muydu, kolay mıydı? Seçenekleri okuyunca fikrin değişti mi?]

### 5. Bağlam Bağımlılık Testi
[BU SORUYU BAĞLAM METNİNE/VERİSİNE BAKMADAN CevapLAYABİLİR MİYDİN? Dürüstçe belirt. Soruyu ön bilginle mi yoksa bağlamdaki veriyle mi çözdün?]

---

## 📊 Öğretmen İçin Analiz Raporu

### Bağlam Etkinliği
[Bağlam metin öğrenci tarafından gerçekten okunarak mı çözüldü yoksa ön bilgiyle mi? Bağlam işlevsel mi?]

### Çeldirici Etkinliği
[Hangi çeldiriciler öğrenciyi gerçekten düşündürdü? Hangileri çok kolayca elendi? İkisi arasında kalma durumu oldu mu?]

### Bilişsel Yük Geri Bildirimi
[Metin uzunluğu, sözcük karmaşıklığı veya görsel yoğunluğu sorun yarattı mı?]

### 🔧 İyileştirme Önerileri
"Öğretmenim, bu sorunun şu kısmını şöyle düzenlseydiniz daha iyi olurdu..."
[Somut öneriler]
`;

    return await callGemini(prompt);
}

// ═══════════════════════════════════════════════════════════════════
// 6. PDF'DEN TEST OLUŞTURUCU (Toplu Soru Üretimi)
// ═══════════════════════════════════════════════════════════════════

export async function generateTestFromPDF(
    files: UploadedFile[],
    grade: string,
    subject: string,
    questionCount: number = 10
): Promise<string> {
    const prompt = `
${TYMM_RULES_CONTEXT}

════ GÖREV: PDF KONU ANLATIMI ANALİZİ VE TOPLU TEST ÜRETİMİ ════

Sana bir dersin KONU ANLATIMI PDF'i yüklendi. Bu PDF'i dikkatlice oku, konu anlatımındaki TÜM önemli kavramları çıkar ve bu kavramlardan ${questionCount} adet TYMM uyumlu bağlam temelli çoktan seçmeli soru üret.

📋 GİRDİLER:
• Sınıf Seviyesi: ${grade}
• Ders: ${subject}
• Üretilecek Soru Sayısı: ${questionCount}
• Kaynak: Yüklenen PDF konu anlatımı

⚠️ KRİTİK KURALLAR:
1. PDF'deki FARKLI konulardan/alt başlıklardan sorular üret — hepsini aynı konudan yapma
2. Her soru için BECERİ ve SÜREÇ BİLEŞENİNİ KENDİN BELİRLE (KB3.2.SB1-SB8 veya KB2.8.SB1-SB8)
3. Soru TÜRLERİNİ KARIŞTIR: kavramsal, veri analizi, grafik yorumlama, karşılaştırma, uygulama vb.
4. Zorluk seviyelerini dağıt: %30 kolay, %40 orta, %30 zor
5. Her sorunun KENDİNE AİT OTANTİK BAĞLAMI olmalı — gerçek yaşam senaryosu
6. Bağlam 60-120 kelime arası olmalı, gereksiz uzatma
7. Seçenekler KÜÇÜK, KONTROL EDİLEBİLİR değerler olmalı
8. Doğru cevabı 2-3 adımda doğrulayabilmelisin
9. LaTeX formülleri doğru yazılmalı: $\\frac{a}{b}$, $\\sqrt{x}$ (başında \\ olmalı!)

📝 ÜRETİLECEK ÇIKTI (Markdown):

Önce kısa bir PDF analizi, sonra soruları üret:

## 📄 Konu Analizi
[PDF'deki ana konuların ve alt başlıkların KISA listesi — en fazla 5-6 madde]

---

Sonra her soru için aşağıdaki formatı kullan:

## 📌 Soru 1 / ${questionCount}

**Ölçülen Süreç Bileşeni:** [KOD ve ADI — kendin belirle]
**Zorluk:** [Kolay / Orta / Zor]
**Soru Türü:** [Kavramsal / Veri Analizi / Grafik Yorumlama / Karşılaştırma / Uygulama / Hesaplama]

### Bağlam
[Bu soruya özel otantik bağlam metni — gerçek yaşam senaryosu, 60-120 kelime]

### Soru Kökü
[Soruyu sor]

A) [Seçenek]
B) [Seçenek]
C) [Seçenek]
D) [Seçenek]

**Doğru Cevap:** [Şık harfi]) — [1-2 cümle kısa gerekçe]

---

## 📌 Soru 2 / ${questionCount}
... (aynı format, farklı konu/beceri/zorluk)

---

(Bu formatta ${questionCount} adet soru üret)

## 📊 Test Özeti
| Soru No | Konu | Zorluk | Soru Türü | Doğru Cevap |
|---------|------|--------|-----------|-------------|
| 1 | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... |
(tüm sorular için)
`;

    if (files.length > 0) {
        return await callGeminiMultimodal(prompt, files);
    } else {
        throw new Error('Test oluşturmak için en az bir PDF dosyası yüklenmelidir.');
    }
}

// ═══════════════════════════════════════════════════════════════════
// 5. SORU GÖRSELİ ÜRETİCİ (Gemini Image Generation — REST API)
// ═══════════════════════════════════════════════════════════════════

export async function generateQuestionImage(questionText: string): Promise<string> {
    const imagePrompt = `Aşağıdaki sınav sorusunu profesyonel bir GÖRSEL olarak oluştur.

🚨 EN ÖNEMLİ KURAL: Sorudaki tüm yazıları BİREBİR AYNI ŞEKİLDE yaz. HİÇBİR kelimeyi değiştirme, kısaltma veya parafraz etme. Yazım hatası yapma! Soru kökü ve şıklar TAMAMEN AYNI METİN olmalı.

GÖRSELİN YAPISI (yukarıdan aşağıya):

1. ÜST BÖLÜM — DİYAGRAM/GRAFİK/ŞEMA:
   Sorunun konusuna uygun bir diyagram, grafik, tablo, şekil veya şema çiz.
   Bu kısım soruyu görsel olarak desteklemeli ve sorudaki verileri göstermeli.

2. ALT BÖLÜM — SORU KÖKÜ VE ŞIKLAR:
   Sorunun soru kökünü ve A), B), C), D) şıklarını AYNEN yaz.
   ⚠️ Soru kökü ve şıklardaki her kelimeyi BİREBİR kopyala — değiştirme, kısaltma!

TASARIM:
- Beyaz arka plan, siyah yazı
- Temiz, profesyonel sınav kağıdı formatı
- Matematiksel ifadeler düzgün yazılmalı (kesirler, kökler vb.)

SORU METNİ (AYNEN KOPYALA, DEĞİŞTİRME):
${questionText}`;

    const models = [
        'gemini-3.1-flash-image-preview',
        'gemini-2.5-flash-image',
    ];

    const errors: string[] = [];

    for (const model of models) {
        try {
            console.log(`Görsel üretme deneniyor: ${model}`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: imagePrompt }] }],
                        generationConfig: {
                            responseModalities: ['TEXT', 'IMAGE'],
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
                const msg = errorData?.error?.message || `HTTP ${response.status}`;
                console.warn(`Model ${model} başarısız:`, msg);
                errors.push(`${model}: ${msg}`);
                continue;
            }

            const data = await response.json();
            const candidates = data.candidates;
            if (candidates && candidates.length > 0) {
                const parts = candidates[0].content?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData) {
                            const base64 = part.inlineData.data;
                            const mimeType = part.inlineData.mimeType || 'image/png';
                            console.log(`Görsel başarıyla üretildi: ${model}`);
                            return `data:${mimeType};base64,${base64}`;
                        }
                    }
                }
            }
            errors.push(`${model}: Yanıtta görsel verisi bulunamadı`);
        } catch (err) {
            const msg = (err as Error).message || 'Bilinmeyen hata';
            console.warn(`Model ${model} exception:`, msg);
            errors.push(`${model}: ${msg}`);
        }
    }

    throw new Error(`Görsel oluşturulamadı. Denenen modeller başarısız oldu:\n${errors.join('\n')}\n\nAPI anahtarınızın görsel üretme iznini Google AI Studio'dan kontrol edin.`);
}
