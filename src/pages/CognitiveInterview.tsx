import React, { useState } from 'react';
import { FileQuestion, Loader2 } from 'lucide-react';
import { simulateCognitiveInterview } from '../lib/geminiSetup';

export default function CognitiveInterview() {
    const [questionData, setQuestionData] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const handleSimulate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionData) return;

        setLoading(true);
        setResult('');

        try {
            const res = await simulateCognitiveInterview(questionData);
            setResult(res);
        } catch (error: any) {
            console.error(error);
            setResult(`❌ Hata: ${error.message || 'Görüşme simüle edilirken bir hata oluştu.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <FileQuestion className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Bilişsel Görüşme (Sesli Düşünme) Simülatörü</h1>
                    <p className="text-slate-600 mt-1">
                        "Öğrencinin zihnindeki kara kutuyu aralayın." Yapay zekadan, yazdığınız soruyu sesli düşünerek -bir öğrenci gibi- çözmesini isteyin.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSimulate} className="p-6 border-b border-slate-100">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Test Edilecek Soru (Bağlam + Soru Kökü + Şıklar)
                        </label>
                        <textarea
                            rows={8}
                            placeholder="Test etmek istediğiniz sorunun tamamını buraya yapıştırın. Yapay zeka, öğrenci mantığıyla (varsa kavram yanılgılarıyla) soruyu çözmeyi deneyecektir."
                            value={questionData}
                            onChange={(e) => setQuestionData(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none font-mono text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !questionData}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Öğrenci Gibi Çözülüyor (Simülasyon)...
                            </>
                        ) : (
                            'Soruyu Öğrenci Gözüyle Test Et'
                        )}
                    </button>
                </form>

                {result && (
                    <div className="p-6 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <span className="text-2xl mr-2">💭</span> Öğrenci Gözünden Sesli Düşünme:
                        </h3>
                        <div className="prose prose-orange max-w-none bg-orange-50 italic p-6 rounded-lg border border-orange-200 whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
