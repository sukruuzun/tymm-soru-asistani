import React, { useState, useRef } from 'react';
import { CheckSquare, Loader2, Upload, X, Image, Camera, Download, Copy, Check } from 'lucide-react';
import { auditQuestionMultimodal } from '../lib/geminiSetup';
import type { UploadedFile } from '../lib/geminiSetup';
import MarkdownRenderer from '../components/MarkdownRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function QuestionAuditor() {
    const [questionData, setQuestionData] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const base64Data = dataUrl.split(',')[1];
                const newFile: UploadedFile = {
                    name: file.name,
                    mimeType: file.type,
                    base64Data,
                };
                setUploadedFiles(prev => [...prev, newFile]);
                setPreviewUrls(prev => [...prev, dataUrl]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionData.trim() && uploadedFiles.length === 0) return;

        setLoading(true);
        setResult('');

        try {
            const res = await auditQuestionMultimodal(questionData, uploadedFiles);
            setResult(res);
        } catch (error: any) {
            console.error(error);
            setResult(`❌ Hata: ${error.message || 'Soru denetlenirken bir hata oluştu.'}`);
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

            pdf.save(`TYMM_Denetim_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error('PDF oluşturma hatası:', err);
        }
    };

    const canSubmit = questionData.trim().length > 0 || uploadedFiles.length > 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
                <CheckSquare className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Soru Denetleyici (Checklist)</h1>
                    <p className="text-slate-600 mt-1">
                        Yazdığınız veya dışarıdan gelen soruları TYMM kılavuzuna göre denetleyin. Metin yapıştırın veya soru görselini yükleyin.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleAudit} className="p-6 border-b border-slate-100">

                    {/* Görsel Yükleme Alanı */}
                    <div className="mb-5 p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/50">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-purple-600" />
                            Soru Görseli Yükle
                            <span className="text-slate-400 font-normal">(İsteğe bağlı — ekran görüntüsü, fotoğraf vb.)</span>
                        </h3>
                        <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 w-full p-4 border border-purple-200 rounded-lg bg-white hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                            <Upload className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium text-purple-700">📷 Soru görselini yükleyin (PNG, JPG, WebP)</span>
                        </button>
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            multiple
                        />

                        {/* Yüklenen Dosya Önizlemesi */}
                        {uploadedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-500">{uploadedFiles.length} görsel yüklendi:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={idx} className="relative group rounded-lg border border-slate-200 overflow-hidden bg-white">
                                            {previewUrls[idx] && (
                                                <img
                                                    src={previewUrls[idx]}
                                                    alt={file.name}
                                                    className="w-full h-40 object-contain bg-slate-50 p-2"
                                                />
                                            )}
                                            <div className="flex items-center justify-between p-2 border-t border-slate-100">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Image className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                    <span className="text-xs text-slate-600 truncate">{file.name}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ayırıcı */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-xs font-medium text-slate-400 uppercase">ve / veya</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Metin Girişi */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Denetlenecek Soru Metni (Bağlam + Soru Kökü + Şıklar)
                            <span className="text-slate-400 font-normal ml-1">(İsteğe bağlı)</span>
                        </label>
                        <textarea
                            rows={8}
                            placeholder={'Bir meslektaşınızdan gelen soruyu buraya yapıştırın:\n\nÖrnek:\nAli pazarda 3 çeşit meyve arasından seçim yapmaktadır...\nBuna göre Ali en ekonomik tercihi yapmak isterse...\nA) ...\nB) ...\nC) ...\nD) ...'}
                            value={questionData}
                            onChange={(e) => setQuestionData(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none font-mono text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !canSubmit}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                {uploadedFiles.length > 0 ? 'Görsel Okunuyor ve Denetleniyor...' : 'Soru Analiz Ediliyor ve Hatalar Tespit Ediliyor...'}
                            </>
                        ) : (
                            `📋 Soruyu TYMM Kurallarına Göre Denetle${uploadedFiles.length > 0 ? ' (Görsel Dahil)' : ''}`
                        )}
                    </button>
                </form>

                {result && (
                    <div className="p-6 bg-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Yapay Zeka Denetim Raporu</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-green-500" />Kopyalandı</> : <><Copy className="w-3.5 h-3.5 mr-1" />Kopyala</>}
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5 mr-1" />PDF İndir
                                </button>
                            </div>
                        </div>
                        <div ref={resultRef} className="prose prose-purple max-w-none bg-white p-6 rounded-lg border border-slate-200">
                            <MarkdownRenderer content={result} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
