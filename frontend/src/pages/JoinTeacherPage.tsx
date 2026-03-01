import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Phone, CheckCircle, AlertCircle, Loader2, BookOpen, KeyRound } from 'lucide-react';
import { getInviteInfo, joinViaToken, joinViaCode, type InviteInfo } from '../services/teacherStudentInviteService';

type JoinMode = 'token' | 'code';

export default function JoinTeacherPage() {
    const { token } = useParams<{ token?: string }>();
    const navigate = useNavigate();

    const [mode, setMode] = useState<JoinMode>(token ? 'token' : 'code');
    const [teacherInfo, setTeacherInfo] = useState<InviteInfo | null>(null);
    const [loading, setLoading] = useState(!!token);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        joinCode: '',
    });

    // Load invite info if we have a token
    useEffect(() => {
        if (token) {
            setLoading(true);
            getInviteInfo(token)
                .then(info => {
                    setTeacherInfo(info);
                    setError('');
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.studentName.trim()) {
            setError('الرجاء إدخال اسمك');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'token' && token) {
                const result = await joinViaToken(token, {
                    studentName: form.studentName,
                    studentEmail: form.studentEmail || undefined,
                    studentPhone: form.studentPhone || undefined,
                });
                setSuccess(result.message);
            } else if (mode === 'code') {
                if (!form.joinCode.trim()) {
                    setError('الرجاء إدخال كود الانضمام');
                    setSubmitting(false);
                    return;
                }
                const result = await joinViaCode({
                    joinCode: form.joinCode,
                    studentName: form.studentName,
                    studentEmail: form.studentEmail || undefined,
                    studentPhone: form.studentPhone || undefined,
                });
                setSuccess(`${result.message} — المعلم: ${result.teacherName}`);
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-500">جاري تحميل بيانات الدعوة...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">تم الانضمام بنجاح!</h1>
                    <p className="text-gray-500 mb-6">{success}</p>
                    <p className="text-sm text-gray-400 mb-6">سيقوم المعلم بمراجعة طلبك وقبوله قريباً إن شاء الله</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        تسجيل الدخول
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg w-full">
                {/* Header */}
                <div className="bg-gradient-to-l from-blue-600 to-indigo-700 px-6 py-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">الانضمام إلى معلم</h1>
                    {teacherInfo ? (
                        <div className="mt-3 space-y-1">
                            <p className="text-blue-100 text-lg font-medium">{teacherInfo.teacherName}</p>
                            {teacherInfo.subject && (
                                <p className="text-blue-200 text-sm flex items-center justify-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {teacherInfo.subject}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-blue-200 text-sm">سجّل بياناتك للانضمام إلى صف معلمك</p>
                    )}
                </div>

                {/* Mode switcher (only if no token) */}
                {!token && (
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setMode('code')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
                                ${mode === 'code' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <KeyRound className="w-4 h-4" />
                            كود الانضمام
                        </button>
                        <button
                            onClick={() => setMode('token')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
                                ${mode === 'token' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            رابط دعوة
                        </button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {mode === 'code' && !token && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">كود الانضمام *</label>
                            <div className="relative">
                                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={form.joinCode}
                                    onChange={e => setForm({ ...form, joinCode: e.target.value.toUpperCase() })}
                                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center font-mono text-lg tracking-wider"
                                    placeholder="SCL-XXXX-XXXX"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={form.studentName}
                                onChange={e => setForm({ ...form, studentName: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="اسم الطالب"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={form.studentEmail}
                                onChange={e => setForm({ ...form, studentEmail: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="email@example.com"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={form.studentPhone}
                                onChange={e => setForm({ ...form, studentPhone: e.target.value })}
                                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="05xxxxxxxx"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !form.studentName.trim()}
                        className="w-full py-3.5 bg-gradient-to-l from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري الإرسال...
                            </>
                        ) : (
                            <>
                                <GraduationCap className="w-5 h-5" />
                                طلب الانضمام
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        بعد تقديم الطلب، سيقوم المعلم بمراجعته وقبوله
                    </p>
                </form>
            </div>
        </div>
    );
}
