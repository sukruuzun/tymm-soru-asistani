import React, { useState } from 'react';
import { CheckSquare, Loader2 } from 'lucide-react';
import { auditQuestion } from '../lib/geminiSetup';

export default function QuestionAuditor() {
    const [questionData, setQuestionData] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionData) return;

        setLoading(true);
        setResult('');

        try {
            const res = await auditQuestion(questionData);
            setResult(res);
        } catch (error: any) {
            console.error(error);
            setResult(`❌ Hata: ${error.message || 'Soru denetlenirken bir hata oluştu.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <CheckSquare className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Soru Denetleyici (Checklist)</h1>
                    <p className="text-slate-600 mt-1">
                        Yazdığınız veya seçeceğiniz soruları TYMM kılavuzundaki "Sık Yapılan Hatalar" ve "Bilişsel Yük" kırılımlarına göre denetleyin.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleAudit} className="p-6 border-b border-slate-100">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Denetlenecek Soru Metni (Bağlam + Soru Kökü + Şıklar)
                        </label>
                        <textarea
                            rows={8}
                            placeholder={'Örnek:\nAli pazara gitti, 2 elma 3 armut aldı. Buna göre...\nA) ...\nB) ...\nC) ...\nD) ...\n\n(Metnin tamamını buraya yapıştırın)'}
                            value={questionData}
                            onChange={(e) => setQuestionData(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none font-mono text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !questionData}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Soru Analiz Ediliyor ve Hatalar Tespit Ediliyor...
                            </>
                        ) : (
                            'Soruyu TYMM Kurallarına Göre Denetle'
                        )}
                    </button>
                </form>

                {result && (
                    <div className="p-6 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Yapay Zeka Denetim Raporu</h3>
                        <div className="prose prose-purple max-w-none bg-white p-6 rounded-lg border border-slate-200 whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
