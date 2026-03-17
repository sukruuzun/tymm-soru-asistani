import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, Download, Image, Copy, Check } from 'lucide-react';
import { generateTestFromPDF, generateQuestionImage } from '../lib/geminiSetup';
import type { UploadedFile } from '../lib/geminiSetup';
import MarkdownRenderer from '../components/MarkdownRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const GRADES = ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'];
const QUESTION_COUNTS = [5, 10, 15, 20];

export default function TestGenerator() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [grade, setGrade] = useState('9. Sınıf');
    const [subject, setSubject] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputFiles = e.target.files;
        if (!inputFiles) return;
        Array.from(inputFiles).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64Data = dataUrl.split(',')[1];
                const newFile: UploadedFile = {
                    name: file.name,
                    mimeType: file.type,
                    base64Data,
                };
                setFiles(prev => [...prev, newFile]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (files.length === 0) {
            setError('Lütfen en az bir PDF dosyası yükleyin.');
            return;
        }
        if (!subject.trim()) {
            setError('Lütfen ders adını girin.');
            return;
        }
        setLoading(true);
        setError('');
        setResult('');
        try {
            const res = await generateTestFromPDF(files, grade, subject, questionCount);
            setResult(res);
        } catch (err) {
            setError((err as Error).message || 'Test oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPDF = async () => {
        if (!resultRef.current) return;
        try {
            const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position -= pdf.internal.pageSize.getHeight();
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save(`test_${subject}_${questionCount}_soru.pdf`);
        } catch (err) {
            console.error('PDF indirme hatası:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    PDF'den Test Oluşturucu
                </h1>
                <p className="text-slate-600 mt-2">PDF konu anlatımı yükleyin → AI otomatik olarak TYMM uyumlu test oluştursun</p>
            </div>

            {/* Upload & Settings Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">📄 Ders İçeriğini Yükle</h2>
                </div>

                <div className="p-6 space-y-5">
                    {/* PDF Yükleme */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">PDF Dosyası (Konu Anlatımı)</label>
                        <div className="border-2 border-dashed border-violet-300 rounded-xl p-8 text-center bg-violet-50/50 hover:bg-violet-50 transition-colors">
                            <Upload className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                            <p className="text-sm text-slate-600 mb-2">PDF dosyanızı sürükleyip bırakın veya seçin</p>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label
                                htmlFor="pdf-upload"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 cursor-pointer transition-colors"
                            >
                                <Upload className="w-4 h-4 mr-2" />Dosya Seç
                            </label>
                        </div>

                        {/* Yüklenen Dosyalar */}
                        {files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-200">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-violet-600" />
                                            <span className="text-sm font-medium text-slate-700">{file.name}</span>
                                            <span className="text-xs text-slate-400">({file.mimeType})</span>
                                        </div>
                                        <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ayarlar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ders</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Örn: Biyoloji, Matematik"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sınıf Seviyesi</label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all bg-white"
                            >
                                {GRADES.map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Soru Sayısı</label>
                            <div className="flex gap-2">
                                {QUESTION_COUNTS.map(count => (
                                    <button
                                        key={count}
                                        onClick={() => setQuestionCount(count)}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg border-2 transition-all ${questionCount === count
                                                ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                                                : 'bg-white text-slate-600 border-slate-300 hover:border-violet-400'
                                            }`}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">❌ {error}</p>
                        </div>
                    )}

                    {/* Oluştur Butonu */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || files.length === 0}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Test Oluşturuluyor... ({questionCount} soru)
                            </>
                        ) : (
                            <>
                                <FileText className="w-5 h-5" />
                                {questionCount} Soruluk Test Oluştur
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Sonuç */}
            {result && (
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">📋 Oluşturulan Test ({questionCount} Soru)</h2>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={handleCopy} className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                                    {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-green-500" />Kopyalandı</> : <><Copy className="w-3.5 h-3.5 mr-1" />Kopyala</>}
                                </button>
                                <button onClick={handleDownloadPDF} className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                                    <Download className="w-3.5 h-3.5 mr-1" />PDF İndir
                                </button>
                            </div>
                        </div>
                    </div>
                    <div ref={resultRef} className="p-6 prose prose-sm max-w-none">
                        <MarkdownRenderer content={result} />
                    </div>
                </div>
            )}
        </div>
    );
}
