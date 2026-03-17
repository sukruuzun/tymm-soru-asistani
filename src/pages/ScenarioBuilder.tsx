import React, { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { generateScenario } from '../lib/geminiSetup';

export default function ScenarioBuilder() {
    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('Ortaokul 5. Sınıf');
    const [skill, setSkill] = useState('Olay, yer, zaman ve şahıs ilişkisini kurma (Bağlam İlişkisi)');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setLoading(true);
        setResult('');

        try {
            const res = await generateScenario(topic, grade, skill);
            setResult(res);
        } catch (error: any) {
            console.error(error);
            setResult(`❌ Hata: ${error.message || 'Bağlam üretilirken bir hata oluştu.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Bağlam (Senaryo) Üretici</h1>
                    <p className="text-slate-600 mt-1">Öğrencilerin öğrendikleri bilgileri transfer edebilmeleri için gerçek hayat senaryoları kurgulayın.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleGenerate} className="p-6 border-b border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Konu / Kazanım</label>
                            <input
                                type="text"
                                placeholder="Örn: Newton'un Hareket Yasaları, Veri Madenciliği..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sınıf Seviyesi</label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                            >
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

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Ölçülecek Kavramsal Beceri (TYMM Süreç Bileşeni)</label>
                        <select
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                        >
                            <optgroup label="Üst Düzey Düşünme Becerileri">
                                <option>Problemi yapılandırmak (Problem Çözme)</option>
                                <option>Problemin çözümüne yönelik tahminde bulunmak</option>
                                <option>Merak ettiği konuyu tanımlamak (Sorgulama)</option>
                                <option>Toplanan verilerin doğruluğunu değerlendirmek</option>
                            </optgroup>
                            <optgroup label="Alan Becerileri / Yorumlama">
                                <option>Olay, yer, zaman ve şahıs ilişkisini kurma</option>
                                <option>Verilmiş bir harita / tablo üzerinden çıkarım yapma</option>
                            </optgroup>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !topic}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                TYMM Kurallarına Göre Bağlam Üretiliyor...
                            </>
                        ) : (
                            'Bağlam (Senaryo) Üret'
                        )}
                    </button>
                </form>

                {result && (
                    <div className="p-6 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Üretilen Bağlam</h3>
                        <div className="prose prose-blue max-w-none bg-white p-6 rounded-lg border border-slate-200 whitespace-pre-wrap">
                            {result}
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => navigator.clipboard.writeText(result)}
                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                Metni Kopyala
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
