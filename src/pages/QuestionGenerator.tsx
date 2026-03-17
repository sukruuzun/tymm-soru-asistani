import React, { useState } from 'react';
import { PenTool, Loader2 } from 'lucide-react';
import { generateQuestion } from '../lib/geminiSetup';

export default function QuestionGenerator() {
    const [context, setContext] = useState('');
    const [grade, setGrade] = useState('Ortaokul 8. Sınıf');
    const [subject, setSubject] = useState('Fen Bilimleri');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!context) return;

        setLoading(true);
        setResult('');

        try {
            const res = await generateQuestion(context, grade, subject);
            setResult(res);
        } catch (error: any) {
            console.error(error);
            setResult(`❌ Hata: ${error.message || 'Soru üretilirken bir hata oluştu.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <PenTool className="w-8 h-8 text-green-600 mr-3" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Soru Üretici</h1>
                    <p className="text-slate-600 mt-1">
                        Elindeki bağlam metninden yola çıkarak TYMM standartlarında, çeldiricisi güçlü, beceri temelli çoktan seçmeli sorular hazırlayın.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleGenerate} className="p-6 border-b border-slate-100">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Bağlam Metni (Senaryo / Bilgi / Veri)
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Sorunun dayanak noktası olan metni buraya yapıştırın... (Örn: Küresel ısınma senaryosu, bir deneyin veri tablosu vb.)"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            İpucu: Metin ne kadar "otantik" ve gerçek yaşamla ilişkiliyse üretilen soru da o kadar üst düzey beceri ölçer.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ders</label>
                            <input
                                type="text"
                                placeholder="Örn: Türkçe, Matematik, Tarih, Biyoloji..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sınıf Seviyesi</label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                            >
                                <option>İlkokul 4. Sınıf</option>
                                <option>Ortaokul 5. Sınıf</option>
                                <option>Ortaokul 6. Sınıf</option>
                                <option>Ortaokul 7. Sınıf</option>
                                <option>Ortaokul 8. Sınıf</option>
                                <option>Lise 9. Sınıf</option>
                                <option>Lise 10. Sınıf</option>
                                <option>Lise 11. Sınıf</option>
                                <option>Lise 12. Sınıf</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !context}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Beceri Temelli Soru ve Çeldirici Analizi Yazdırılıyor...
                            </>
                        ) : (
                            'Analiz ve Sentez Beceri Sorusu Üret'
                        )}
                    </button>
                </form>

                {result && (
                    <div className="p-6 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Yapay Zeka Çıktısı (Soru ve Analiz)</h3>
                        <div className="prose prose-green max-w-none bg-white p-6 rounded-lg border border-slate-200 whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
