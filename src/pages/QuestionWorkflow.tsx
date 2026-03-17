import React, { useState, useRef } from 'react';
import { BookOpen, PenTool, CheckSquare, FileQuestion, Loader2, ChevronRight, ChevronLeft, Wand2, Copy, Check, Upload, X, FileText, Image, Download } from 'lucide-react';
import { generateScenario, generateQuestion, auditQuestion, simulateCognitiveInterview, analyzeAndGenerate, generateQuestionImage } from '../lib/geminiSetup';
import type { UploadedFile } from '../lib/geminiSetup';
import MarkdownRenderer from '../components/MarkdownRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const STEPS = [
    { id: 1, title: 'Bağlam Üretici', icon: BookOpen, color: 'indigo', description: 'Otantik bir senaryo/bağlam oluşturun' },
    { id: 2, title: 'Soru Üretici', icon: PenTool, color: 'green', description: 'Bağlamdan TYMM uyumlu soru üretin' },
    { id: 3, title: 'Soru Denetmeni', icon: CheckSquare, color: 'purple', description: 'Kontrol listesiyle soruyu denetleyin' },
    { id: 4, title: 'Bilişsel Görüşme', icon: FileQuestion, color: 'orange', description: 'Öğrenci gözüyle test edin' },
];

const GRADES = [
    'İlkokul 4. Sınıf', 'Ortaokul 5. Sınıf', 'Ortaokul 6. Sınıf',
    'Ortaokul 7. Sınıf', 'Ortaokul 8. Sınıf', 'Lise 9. Sınıf',
    'Lise 10. Sınıf', 'Lise 11. Sınıf', 'Lise 12. Sınıf',
];

const SKILLS = [
    'Problemi yapılandırmak (Problem Çözme — KB3.2.SB1)',
    'Problemi özetlemek (Problem Çözme — KB3.2.SB2)',
    'Gözleme/veriye dayalı tahmin (Problem Çözme — KB3.2.SB3)',
    'Akıl yürütme (Problem Çözme — KB3.2.SB4)',
    'Yansıtma/değerlendirme (Problem Çözme — KB3.2.SB5)',
    'Konuyu tanımlamak (Sorgulama — KB2.8.SB1)',
    'Sorular sormak (Sorgulama — KB2.8.SB2)',
    'Bilgi toplamak (Sorgulama — KB2.8.SB3)',
    'Doğruluğu değerlendirmek (Sorgulama — KB2.8.SB4)',
    'Çıkarım yapmak (Sorgulama — KB2.8.SB5)',
];

export default function QuestionWorkflow() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Step 1 — Bağlam
    const [topic, setTopic] = useState('');
    const [grade, setGrade] = useState('Ortaokul 8. Sınıf');
    const [skill, setSkill] = useState(SKILLS[0]);
    const [subject, setSubject] = useState('Fen Bilimleri');
    const [scenarioResult, setScenarioResult] = useState('');

    // Dosya yükleme
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // Step 2 — Soru
    const [contextForQuestion, setContextForQuestion] = useState('');
    const [questionResult, setQuestionResult] = useState('');

    // Step 3 — Denetim
    const [questionForAudit, setQuestionForAudit] = useState('');
    const [auditResult, setAuditResult] = useState('');

    // Step 4 — Bilişsel Görüşme
    const [questionForInterview, setQuestionForInterview] = useState('');
    const [interviewResult, setInterviewResult] = useState('');

    // Soru görseli
    const [questionImage, setQuestionImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [withImage, setWithImage] = useState(false);
    const [imageError, setImageError] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // data:image/png;base64,XXXXX → sadece XXXXX kısmını al
                const base64Data = result.split(',')[1];
                const newFile: UploadedFile = {
                    name: file.name,
                    mimeType: file.type,
                    base64Data,
                };
                setUploadedFiles(prev => [...prev, newFile]);
            };
            reader.readAsDataURL(file);
        });
        // Input'u sıfırla (aynı dosya tekrar yüklenebilsin)
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            if (currentStep === 1) {
                if (!topic) return;
                setScenarioResult('');
                let res: string;
                if (uploadedFiles.length > 0) {
                    // Dosya varsa multimodal analiz + soru üretimi
                    res = await analyzeAndGenerate(topic, grade, skill, subject, uploadedFiles);
                } else {
                    // Dosya yoksa normal bağlam üretimi
                    res = await generateScenario(topic, grade, skill);
                }
                setScenarioResult(res);
                // Otomatik olarak soru üretici inputuna aktar
                setContextForQuestion(res);
            } else if (currentStep === 2) {
                if (!contextForQuestion) return;
                setQuestionResult('');
                const res = await generateQuestion(contextForQuestion, grade, subject);
                setQuestionResult(res);
                // Bağlam metni + üretilen soruyu birlikte aktar (denetim ve bilişsel görüşme için)
                const fullQuestionWithContext = `--- BAĞLAM METNİ ---\n${contextForQuestion}\n\n--- ÜRETİLEN SORU ---\n${res}`;
                setQuestionForAudit(fullQuestionWithContext);
                setQuestionForInterview(fullQuestionWithContext);
                // Görsel üretme: toggle açıksa soru ile birlikte görsel de üret
                setQuestionImage(null);
                setImageError('');
                if (withImage) {
                    setImageLoading(true);
                    generateQuestionImage(res).then(img => {
                        setQuestionImage(img);
                        setImageLoading(false);
                    }).catch((err) => {
                        setImageLoading(false);
                        setImageError(err.message || 'Görsel oluşturulurken bir hata oluştu.');
                    });
                }
            } else if (currentStep === 3) {
                if (!questionForAudit) return;
                setAuditResult('');
                const res = await auditQuestion(questionForAudit);
                setAuditResult(res);
            } else if (currentStep === 4) {
                if (!questionForInterview) return;
                setInterviewResult('');
                const res = await simulateCognitiveInterview(questionForInterview);
                setInterviewResult(res);
            }
        } catch (error: any) {
            const errMsg = `❌ Hata: ${error.message || 'Bilinmeyen hata'}`;
            if (currentStep === 1) setScenarioResult(errMsg);
            else if (currentStep === 2) setQuestionResult(errMsg);
            else if (currentStep === 3) setAuditResult(errMsg);
            else if (currentStep === 4) setInterviewResult(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = async () => {
        if (!resultRef.current) return;
        try {
            const canvas = await html2canvas(resultRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pageHeight - 20);
            }

            const stepNames = ['Baglam', 'Soru', 'Denetim', 'Bilissel_Gorusme'];
            pdf.save(`TYMM_${stepNames[currentStep - 1]}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error('PDF oluşturma hatası:', err);
        }
    };

    const currentResult = currentStep === 1 ? scenarioResult : currentStep === 2 ? questionResult : currentStep === 3 ? auditResult : interviewResult;
    const stepInfo = STEPS[currentStep - 1];
    const StepIcon = stepInfo.icon;

    const colorMap: Record<string, { bg: string; hover: string; ring: string; text: string; light: string; border: string }> = {
        indigo: { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', ring: 'focus:ring-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' },
        green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', ring: 'focus:ring-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' },
        purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', ring: 'focus:ring-purple-500', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200' },
        orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', ring: 'focus:ring-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' },
    };
    const colors = colorMap[stepInfo.color];

    const buttonLabels: Record<number, { idle: string; loading: string }> = {
        1: { idle: uploadedFiles.length > 0 ? '🚀 Materyalleri Analiz Et & Soru Üret' : '🎯 Bağlam (Senaryo) Üret', loading: uploadedFiles.length > 0 ? 'Materyaller Analiz Ediliyor...' : 'Otantik Bağlam Üretiliyor...' },
        2: { idle: '📝 TYMM Uyumlu Soru Üret', loading: 'Beceri Temelli Soru Üretiliyor...' },
        3: { idle: '📋 TYMM Kurallarına Göre Denetle', loading: 'Kontrol Listesine Göre Denetleniyor...' },
        4: { idle: '💭 Öğrenci Gözüyle Test Et', loading: 'Bilişsel Görüşme Simüle Ediliyor...' },
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {STEPS.map((step, idx) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const StIcon = step.icon;
                        return (
                            <React.Fragment key={step.id}>
                                <button
                                    onClick={() => goToStep(step.id)}
                                    className={`flex flex-col items-center group transition-all ${isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                                        ${isActive ? `${colorMap[step.color].bg} text-white shadow-lg` : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                                        {isCompleted ? <Check className="w-6 h-6" /> : <StIcon className="w-6 h-6" />}
                                    </div>
                                    <span className={`text-xs font-medium text-center ${isActive ? colorMap[step.color].text : 'text-slate-500'}`}>{step.title}</span>
                                </button>
                                {idx < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 mt-[-1.5rem] ${step.id < currentStep ? 'bg-green-400' : 'bg-slate-200'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Step Header */}
            <div className="flex items-center mb-6">
                <StepIcon className={`w-8 h-8 ${colors.text} mr-3`} />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Adım {currentStep}: {stepInfo.title}</h1>
                    <p className="text-slate-600 text-sm mt-0.5">{stepInfo.description}</p>
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    {/* Step 1: Bağlam */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Konu / Kazanım</label>
                                <input type="text" placeholder="Örn: Fotosentez, Oran-Orantı, Osmanlı Kuruluş Dönemi..." value={topic} onChange={(e) => setTopic(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sınıf Seviyesi</label>
                                    <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                                        {GRADES.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ders</label>
                                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Beceri / Süreç Bileşeni</label>
                                    <select value={skill} onChange={(e) => setSkill(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                                        {SKILLS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Dosya Yükleme Alanı */}
                            <div className="mt-5 p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">📎 Materyal Yükle <span className="text-slate-400 font-normal">(İsteğe bağlı)</span></h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* PDF Yükleme */}
                                    <button type="button" onClick={() => pdfInputRef.current?.click()}
                                        className="flex items-center justify-center gap-2 p-3 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-700">📄 PDF Yükle (Ders İçeriği)</span>
                                    </button>
                                    <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} multiple />

                                    {/* Görsel Yükleme */}
                                    <button type="button" onClick={() => imageInputRef.current?.click()}
                                        className="flex items-center justify-center gap-2 p-3 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer">
                                        <Image className="w-5 h-5 text-amber-600" />
                                        <span className="text-sm font-medium text-amber-700">🖼️ Görsel Yükle (Eski Testler)</span>
                                    </button>
                                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} multiple />
                                </div>

                                {/* Yüklenen Dosya Listesi */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs font-semibold text-slate-500">{uploadedFiles.length} dosya yüklendi:</p>
                                        {uploadedFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    {file.mimeType === 'application/pdf' ? <FileText className="w-4 h-4 text-blue-500" /> : <Image className="w-4 h-4 text-amber-500" />}
                                                    <span className="text-sm text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                                    <span className="text-xs text-slate-400">{file.mimeType === 'application/pdf' ? 'PDF' : 'Görsel'}</span>
                                                </div>
                                                <button onClick={() => removeFile(idx)} className="p-1 hover:bg-red-50 rounded transition-colors">
                                                    <X className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Soru Üretimi */}
                    {currentStep === 2 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bağlam Metni <span className="text-green-600 text-xs">(önceki adımdan otomatik aktarıldı)</span></label>
                            <textarea rows={6} value={contextForQuestion} onChange={(e) => setContextForQuestion(e.target.value)}
                                placeholder="Bağlam metni burada görünecek veya kendi metninizi yapıştırabilirsiniz..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none text-sm" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ders</label>
                                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sınıf Seviyesi</label>
                                    <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white">
                                        {GRADES.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Görsel İçerikli Soru Toggle */}
                            <div className="mt-3 flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={withImage} onChange={(e) => setWithImage(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                                <div>
                                    <span className="text-sm font-medium text-slate-700">🖼️ Görsel içerikli soru oluştur</span>
                                    <p className="text-xs text-slate-500">Soruya uygun grafik, şekil veya illüstrasyon otomatik oluşturulur</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Denetim */}
                    {currentStep === 3 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Denetlenecek Soru <span className="text-purple-600 text-xs">(önceki adımdan otomatik aktarıldı)</span></label>
                            <textarea rows={8} value={questionForAudit} onChange={(e) => setQuestionForAudit(e.target.value)}
                                placeholder="Soru metni burada görünecek veya kendi sorunuzu yapıştırabilirsiniz..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none text-sm font-mono" />
                        </div>
                    )}

                    {/* Step 4: Bilişsel Görüşme */}
                    {currentStep === 4 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Test Edilecek Soru <span className="text-orange-600 text-xs">(önceki adımdan otomatik aktarıldı)</span></label>
                            <textarea rows={8} value={questionForInterview} onChange={(e) => setQuestionForInterview(e.target.value)}
                                placeholder="Soru metni burada görünecek veya kendi sorunuzu yapıştırabilirsiniz..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none text-sm font-mono" />
                        </div>
                    )}

                    {/* Action Button */}
                    <button onClick={handleGenerate} disabled={loading}
                        className={`w-full flex items-center justify-center py-3 px-4 mt-5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${colors.bg} ${colors.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.ring} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}>
                        {loading ? (<><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />{buttonLabels[currentStep].loading}</>) : (<><Wand2 className="mr-2 h-5 w-5" />{buttonLabels[currentStep].idle}</>)}
                    </button>
                </div>

                {/* Result */}
                {currentResult && (
                    <div className={`p-6 ${colors.light}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Yapay Zeka Çıktısı</h3>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => handleCopy(currentResult)} className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                                    {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-green-500" />Kopyalandı</> : <><Copy className="w-3.5 h-3.5 mr-1" />Kopyala</>}
                                </button>
                                <button onClick={handleDownloadPDF} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                                    <Download className="w-3.5 h-3.5 mr-1" />PDF İndir
                                </button>
                                {currentStep === 2 && questionResult && !imageLoading && !questionImage && (
                                    <button
                                        onClick={() => {
                                            setImageLoading(true);
                                            setQuestionImage(null);
                                            setImageError('');
                                            generateQuestionImage(questionResult).then(img => {
                                                setQuestionImage(img);
                                                setImageLoading(false);
                                            }).catch((err) => {
                                                setImageLoading(false);
                                                setImageError(err.message || 'Görsel oluşturulamadı.');
                                            });
                                        }}
                                        className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                                    >
                                        <Image className="w-3.5 h-3.5 mr-1" />Görsel Oluştur
                                    </button>
                                )}
                            </div>
                        </div>
                        <div ref={resultRef} className={`prose prose-sm max-w-none bg-white p-6 rounded-lg border ${colors.border}`}>
                            <MarkdownRenderer content={currentResult} />
                        </div>

                        {/* Soru Görseli Gösterim Alanı */}
                        {currentStep === 2 && (imageLoading || questionImage || imageError) && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">🖼️ Soru Görseli</h4>
                                {imageLoading && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Soru görseli oluşturuluyor...
                                    </div>
                                )}
                                {imageError && !imageLoading && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700 font-medium">❌ Görsel Oluşturulamadı</p>
                                        <p className="text-xs text-red-600 mt-1 whitespace-pre-wrap">{imageError}</p>
                                        <button
                                            onClick={() => {
                                                setImageLoading(true);
                                                setImageError('');
                                                generateQuestionImage(questionResult).then(img => {
                                                    setQuestionImage(img);
                                                    setImageLoading(false);
                                                }).catch((err) => {
                                                    setImageLoading(false);
                                                    setImageError(err.message || 'Görsel oluşturulamadı.');
                                                });
                                            }}
                                            className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Tekrar Dene
                                        </button>
                                    </div>
                                )}
                                {questionImage && (
                                    <div>
                                        <img src={questionImage} alt="Soru Görseli" className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm" />
                                        <div className="flex gap-2 mt-3">
                                            <a href={questionImage} download="soru_gorseli.png" className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                                                <Download className="w-3.5 h-3.5 mr-1" />Görseli İndir
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setImageLoading(true);
                                                    setQuestionImage(null);
                                                    setImageError('');
                                                    generateQuestionImage(questionResult).then(img => {
                                                        setQuestionImage(img);
                                                        setImageLoading(false);
                                                    }).catch((err) => {
                                                        setImageLoading(false);
                                                        setImageError(err.message || 'Görsel oluşturulamadı.');
                                                    });
                                                }}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
                                            >
                                                <Image className="w-3.5 h-3.5 mr-1" />Yeniden Oluştur
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
                <button onClick={() => goToStep(currentStep - 1)} disabled={currentStep === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Önceki Adım
                </button>
                <button onClick={() => goToStep(currentStep + 1)} disabled={currentStep === 4}
                    className={`flex items-center px-4 py-2 text-sm font-medium text-white ${colors.bg} ${colors.hover} rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}>
                    Sonraki Adım <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );
}
