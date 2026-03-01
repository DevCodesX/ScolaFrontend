import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Type, Download, Check, AlertCircle, Loader2, Trash2, Users } from 'lucide-react';
import {
    BulkTeacherRow,
    BulkImportResult,
    parseExcelFile,
    parsePDFText,
    validateRows,
    downloadTemplate,
    bulkAddTeachers,
} from '../../services/bulkTeachers';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'choose' | 'data' | 'review' | 'results';
type Method = 'excel' | 'pdf' | 'manual';

export function BulkTeacherImportModal({ onClose, onSuccess }: Props) {
    const [step, setStep] = useState<Step>('choose');
    const [method, setMethod] = useState<Method>('excel');
    const [rows, setRows] = useState<BulkTeacherRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<BulkImportResult | null>(null);
    const [pdfText, setPdfText] = useState('');
    const [sendInvites, setSendInvites] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // ─── Step 1: Choose Method ─────────────────────────
    function chooseMethod(m: Method) {
        setMethod(m);
        setError('');
        if (m === 'manual') {
            setRows([
                emptyRow(1), emptyRow(2), emptyRow(3),
            ]);
            setStep('data');
        } else {
            setStep('data');
        }
    }

    function emptyRow(n: number): BulkTeacherRow {
        return { first_name: '', last_name: '', email: '', phone: '', subject: '', _rowNum: n, _status: 'pending' };
    }

    // ─── Step 2: Handle Data Input ─────────────────────
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        setError('');
        try {
            const parsed = await parseExcelFile(file);
            const validated = validateRows(parsed);
            setRows(validated);
            setStep('review');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handlePDFSubmit() {
        if (!pdfText.trim()) {
            setError('يرجى لصق البيانات أولاً');
            return;
        }
        const parsed = parsePDFText(pdfText);
        if (parsed.length === 0) {
            setError('لم يتم العثور على بيانات صالحة. تأكد من فصل الحقول بفاصلة أو Tab');
            return;
        }
        const validated = validateRows(parsed);
        setRows(validated);
        setStep('review');
    }

    function handleManualNext() {
        const nonEmpty = rows.filter(r => r.first_name || r.email);
        if (nonEmpty.length === 0) {
            setError('يرجى إدخال بيانات معلم واحد على الأقل');
            return;
        }
        const validated = validateRows(nonEmpty);
        setRows(validated);
        setStep('review');
    }

    // ─── Step 3: Review & Edit ─────────────────────────
    function updateRow(idx: number, field: keyof BulkTeacherRow, value: string) {
        setRows(prev => prev.map((r, i) =>
            i === idx ? { ...r, [field]: value, _error: undefined, _status: 'pending' as const } : r
        ));
    }

    function removeRow(idx: number) {
        setRows(prev => prev.filter((_, i) => i !== idx));
    }

    function addManualRow() {
        setRows(prev => [...prev, emptyRow(prev.length + 1)]);
    }

    function revalidate() {
        setRows(validateRows(rows));
    }

    // ─── Step 4: Submit ────────────────────────────────
    async function handleSubmit() {
        revalidate();
        const validRows = rows.filter(r => r._status !== 'error' && r._status !== 'duplicate');
        if (validRows.length === 0) {
            setError('لا توجد صفوف صالحة للإضافة');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await bulkAddTeachers(validRows, sendInvites);
            setResults(result);
            setStep('results');
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const validCount = rows.filter(r => !r._error).length;
    const errorCount = rows.filter(r => r._error).length;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">استيراد معلمين جماعي</h2>
                            <p className="text-sm text-gray-500">
                                {step === 'choose' && 'اختر طريقة الاستيراد'}
                                {step === 'data' && 'أدخل بيانات المعلمين'}
                                {step === 'review' && `مراجعة البيانات — ${validCount} صالح، ${errorCount} خطأ`}
                                {step === 'results' && 'نتائج الاستيراد'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-1 px-5 pt-3 shrink-0">
                    {(['choose', 'data', 'review', 'results'] as Step[]).map((s, i) => (
                        <div key={s} className={`h-1.5 rounded-full flex-1 transition-colors ${(['choose', 'data', 'review', 'results'].indexOf(step) >= i)
                                ? 'bg-indigo-500' : 'bg-gray-200'
                            }`} />
                    ))}
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* ─── STEP: Choose Method ─── */}
                    {step === 'choose' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => chooseMethod('excel')}
                                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group"
                            >
                                <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-gray-900 mb-1">ملف Excel</h3>
                                <p className="text-xs text-gray-500">رفع ملف .xlsx أو .xls</p>
                            </button>
                            <button
                                onClick={() => chooseMethod('pdf')}
                                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group"
                            >
                                <Type className="w-10 h-10 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-gray-900 mb-1">لصق نص</h3>
                                <p className="text-xs text-gray-500">نسخ من PDF أو أي مصدر</p>
                            </button>
                            <button
                                onClick={() => chooseMethod('manual')}
                                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group"
                            >
                                <Upload className="w-10 h-10 mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-gray-900 mb-1">إدخال يدوي</h3>
                                <p className="text-xs text-gray-500">إضافة عدة معلمين يدوياً</p>
                            </button>
                        </div>
                    )}

                    {/* ─── STEP: Data Input ─── */}
                    {step === 'data' && method === 'excel' && (
                        <div className="text-center py-8 space-y-4">
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-2xl p-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="w-12 h-12 mx-auto mb-3 text-indigo-500 animate-spin" />
                                ) : (
                                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                )}
                                <p className="font-medium text-gray-700">
                                    {loading ? 'جارٍ قراءة الملف...' : 'اضغط لاختيار ملف Excel'}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">.xlsx أو .xls</p>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={downloadTemplate}
                                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <Download className="w-4 h-4" />
                                تحميل قالب Excel
                            </button>
                        </div>
                    )}

                    {step === 'data' && method === 'pdf' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                الصق بيانات المعلمين (كل سطر = معلم، البيانات مفصولة بفاصلة أو Tab):
                                <br />
                                <span className="text-gray-400">مثال: أحمد, محمد, ahmed@example.com, 0501234567, رياضيات</span>
                            </p>
                            <textarea
                                value={pdfText}
                                onChange={(e) => setPdfText(e.target.value)}
                                rows={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                placeholder="الصق البيانات هنا..."
                                dir="auto"
                            />
                            <button
                                onClick={handlePDFSubmit}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
                            >
                                معاينة البيانات
                            </button>
                        </div>
                    )}

                    {step === 'data' && method === 'manual' && (
                        <div className="space-y-3">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="p-2 text-right font-medium text-gray-600">الاسم الأول *</th>
                                            <th className="p-2 text-right font-medium text-gray-600">اسم العائلة</th>
                                            <th className="p-2 text-right font-medium text-gray-600">البريد *</th>
                                            <th className="p-2 text-right font-medium text-gray-600">الهاتف</th>
                                            <th className="p-2 text-right font-medium text-gray-600">المادة</th>
                                            <th className="p-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="p-1">
                                                    <input value={row.first_name} onChange={(e) => updateRow(idx, 'first_name', e.target.value)}
                                                        className="w-full px-2 py-1.5 border rounded-lg text-sm" placeholder="أحمد" />
                                                </td>
                                                <td className="p-1">
                                                    <input value={row.last_name} onChange={(e) => updateRow(idx, 'last_name', e.target.value)}
                                                        className="w-full px-2 py-1.5 border rounded-lg text-sm" placeholder="محمد" />
                                                </td>
                                                <td className="p-1">
                                                    <input type="email" value={row.email} onChange={(e) => updateRow(idx, 'email', e.target.value)}
                                                        className="w-full px-2 py-1.5 border rounded-lg text-sm" placeholder="email@example.com" dir="ltr" />
                                                </td>
                                                <td className="p-1">
                                                    <input value={row.phone} onChange={(e) => updateRow(idx, 'phone', e.target.value)}
                                                        className="w-full px-2 py-1.5 border rounded-lg text-sm" placeholder="05..." dir="ltr" />
                                                </td>
                                                <td className="p-1">
                                                    <input value={row.subject} onChange={(e) => updateRow(idx, 'subject', e.target.value)}
                                                        className="w-full px-2 py-1.5 border rounded-lg text-sm" placeholder="رياضيات" />
                                                </td>
                                                <td className="p-1">
                                                    <button onClick={() => removeRow(idx)} className="p-1 text-red-400 hover:text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={addManualRow}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    + إضافة صف
                                </button>
                            </div>
                            <button onClick={handleManualNext}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all">
                                معاينة ومراجعة
                            </button>
                        </div>
                    )}

                    {/* ─── STEP: Review ─── */}
                    {step === 'review' && (
                        <div className="space-y-4">
                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="p-2 text-right font-medium text-gray-600">#</th>
                                            <th className="p-2 text-right font-medium text-gray-600">الاسم الأول</th>
                                            <th className="p-2 text-right font-medium text-gray-600">اسم العائلة</th>
                                            <th className="p-2 text-right font-medium text-gray-600">البريد</th>
                                            <th className="p-2 text-right font-medium text-gray-600">الهاتف</th>
                                            <th className="p-2 text-right font-medium text-gray-600">المادة</th>
                                            <th className="p-2 text-right font-medium text-gray-600">الحالة</th>
                                            <th className="p-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, idx) => (
                                            <tr key={idx} className={`border-b ${row._error ? 'bg-red-50' : ''}`}>
                                                <td className="p-2 text-gray-400 text-xs">{row._rowNum}</td>
                                                <td className="p-1">
                                                    <input value={row.first_name} onChange={(e) => updateRow(idx, 'first_name', e.target.value)}
                                                        className={`w-full px-2 py-1 border rounded-lg text-sm ${!row.first_name && row._error ? 'border-red-400' : ''}`} />
                                                </td>
                                                <td className="p-1">
                                                    <input value={row.last_name} onChange={(e) => updateRow(idx, 'last_name', e.target.value)}
                                                        className="w-full px-2 py-1 border rounded-lg text-sm" />
                                                </td>
                                                <td className="p-1">
                                                    <input value={row.email} onChange={(e) => updateRow(idx, 'email', e.target.value)}
                                                        className={`w-full px-2 py-1 border rounded-lg text-sm ${row._error?.includes('البريد') ? 'border-red-400' : ''}`} dir="ltr" />
                                                </td>
                                                <td className="p-1">
                                                    <input value={row.phone} onChange={(e) => updateRow(idx, 'phone', e.target.value)}
                                                        className="w-full px-2 py-1 border rounded-lg text-sm" dir="ltr" />
                                                </td>
                                                <td className="p-1">
                                                    <input value={row.subject} onChange={(e) => updateRow(idx, 'subject', e.target.value)}
                                                        className="w-full px-2 py-1 border rounded-lg text-sm" />
                                                </td>
                                                <td className="p-2">
                                                    {row._error ? (
                                                        <span className="text-xs text-red-600" title={row._error}>
                                                            <AlertCircle className="w-4 h-4 inline" /> خطأ
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-green-600">
                                                            <Check className="w-4 h-4 inline" /> صالح
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-1">
                                                    <button onClick={() => removeRow(idx)} className="p-1 text-red-400 hover:text-red-600">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-600 font-medium">✅ {validCount} صالح</span>
                                    {errorCount > 0 && <span className="text-red-600 font-medium">❌ {errorCount} خطأ</span>}
                                </div>
                                <button onClick={revalidate} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    إعادة التحقق
                                </button>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sendInvites}
                                    onChange={(e) => setSendInvites(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                إرسال دعوات تلقائية بالبريد الإلكتروني للمعلمين المُضافين
                            </label>
                        </div>
                    )}

                    {/* ─── STEP: Results ─── */}
                    {step === 'results' && results && (
                        <div className="space-y-4">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-green-700">{results.added.length}</p>
                                    <p className="text-sm text-green-600">تمت الإضافة</p>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-700">{results.duplicates.length}</p>
                                    <p className="text-sm text-yellow-600">مكرر</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-red-700">{results.failed.length}</p>
                                    <p className="text-sm text-red-600">فشل</p>
                                </div>
                            </div>

                            {/* Details */}
                            {results.added.length > 0 && (
                                <div className="bg-green-50 rounded-xl p-3">
                                    <h4 className="font-medium text-green-800 mb-2 text-sm">✅ تمت الإضافة بنجاح:</h4>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        {results.added.map((t, i) => (
                                            <li key={i}>{t.name} ({t.email})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {results.duplicates.length > 0 && (
                                <div className="bg-yellow-50 rounded-xl p-3">
                                    <h4 className="font-medium text-yellow-800 mb-2 text-sm">⚠️ مكرر:</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        {results.duplicates.map((t, i) => (
                                            <li key={i}>{t.email} — {t.reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {results.failed.length > 0 && (
                                <div className="bg-red-50 rounded-xl p-3">
                                    <h4 className="font-medium text-red-800 mb-2 text-sm">❌ فشل:</h4>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        {results.failed.map((t, i) => (
                                            <li key={i}>{t.email} — {t.reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t shrink-0 flex gap-3">
                    {step === 'review' && (
                        <>
                            <button onClick={() => setStep('choose')}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                                رجوع
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || validCount === 0}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الإضافة...</>
                                ) : (
                                    <><Check className="w-4 h-4" /> إضافة {validCount} معلم</>
                                )}
                            </button>
                        </>
                    )}
                    {step === 'results' && (
                        <button onClick={onClose}
                            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all">
                            إغلاق
                        </button>
                    )}
                    {(step === 'choose' || step === 'data') && (
                        <button onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                            إلغاء
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
