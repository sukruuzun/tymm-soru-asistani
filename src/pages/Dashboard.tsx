import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PenTool, CheckSquare, FileQuestion, Wand2 } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Bağlam (Senaryo) Üretici',
            description: 'Zorlu kavramları günlük hayatla ilişkilendiren, öğrencilerin ilgisini çekecek yaşama yakın otantik senaryolar oluşturun.',
            icon: <BookOpen className="w-8 h-8 text-blue-500" />,
            path: '/scenario',
            color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
        },
        {
            title: 'Soru Üretici',
            description: 'Öğrenme çıktılarına ve süreç bileşenlerine uygun, çeldiricileri güçlü üst düzey çoktan seçmeli sorular yazın.',
            icon: <PenTool className="w-8 h-8 text-green-500" />,
            path: '/generate',
            color: 'bg-green-50 border-green-200 hover:border-green-400',
        },
        {
            title: 'Soru Denetleyici (Checklist)',
            description: 'Yazdığınız soruları TYMM kurallarına, bilişsel yüke ve bağlam işlevselliğine göre analiz edip geri bildirim alın.',
            icon: <CheckSquare className="w-8 h-8 text-purple-500" />,
            path: '/audit',
            color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
        },
        {
            title: 'Bilişsel Görüşme Simülatörü',
            description: 'Sorularınızı sanal bir öğrenciye çözdürerek sorunun anlaşılırlığını ve zihinsel çözüm süreçlerini önceden test edin.',
            icon: <FileQuestion className="w-8 h-8 text-orange-500" />,
            path: '/interview',
            color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
        },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
                    TYMM Soru Yazım Asistanına Hoş Geldiniz
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Türkiye Yüzyılı Maarif Modeli standartlarına uygun, bağlam temelli ve
                    üst düzey becerileri ölçen nitelikli sorular hazırlamanız için yapay zeka yanınızda.
                </p>
            </div>

            {/* Ana Özellik: Soru Sihirbazı */}
            <div
                onClick={() => navigate('/workflow')}
                className="mb-8 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 hover:border-indigo-500"
            >
                <div className="flex items-center mb-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                        <Wand2 className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-900">🪄 Soru Üretim Sihirbazı</h2>
                        <span className="text-xs font-semibold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">ÖNERİLEN</span>
                    </div>
                </div>
                <p className="text-slate-700 leading-relaxed">
                    Tek sayfada 4 adımda: <strong>Bağlam üret → Soru üret → Denetle → Bilişsel görüşme.</strong> Veriler otomatik aktarılır, copy-paste yapmaya gerek kalmaz.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(feature.path)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${feature.color}`}
                    >
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                                {feature.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{feature.title}</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
