import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyToken, acceptInvitation } from '../services/teacherInvitations';
import { CheckCircle, XCircle, Loader, Lock, Eye, EyeOff } from 'lucide-react';

export function AcceptInvitePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [inviteInfo, setInviteInfo] = useState<any>(null);
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) { setStatus('invalid'); setError('لم يتم تقديم رمز الدعوة'); return; }
        verifyToken(token)
            .then(data => { setInviteInfo(data); setStatus('valid'); })
            .catch(err => { setError(err.message); setStatus('invalid'); });
    }, [token]);

    async function handleAccept(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }
        if (password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await acceptInvitation(token, password);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    // Loading state
    if (status === 'loading') return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="text-center">
                <Loader className="w-10 h-10 animate-spin text-white mx-auto mb-4" />
                <p className="text-white/80 text-lg">جارٍ التحقق من الدعوة...</p>
            </div>
        </div>
    );

    // Success state
    if (status === 'success') return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
            <div className="text-center bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بك!</h2>
                <p className="text-gray-600 mb-4">تم إنشاء حسابك بنجاح وتم ربطك بالمؤسسة.</p>
                <p className="text-sm text-gray-400">سيتم تحويلك لتسجيل الدخول خلال ثوانٍ...</p>
            </div>
        </div>
    );

    // Invalid state
    if (status === 'invalid') return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600">
            <div className="text-center bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">رمز الدعوة غير صالح</h2>
                <p className="text-gray-600">{error || 'هذا الرابط منتهي الصلاحية أو غير صحيح'}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                    الذهاب لتسجيل الدخول
                </button>
            </div>
        </div>
    );

    // Valid — show the accept form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">قبول دعوة الانضمام</h1>
                    <p className="text-white/80 text-sm mt-1">
                        دُعيت للانضمام إلى <span className="font-bold text-white">{inviteInfo?.institutionName}</span>
                    </p>
                </div>

                <div className="p-6">
                    {/* معلومات المدرس */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">الاسم:</span>
                            <span className="text-gray-900">{inviteInfo?.firstName} {inviteInfo?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">البريد:</span>
                            <span className="text-gray-900" dir="ltr">{inviteInfo?.email}</span>
                        </div>
                        {inviteInfo?.subject && (
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-600">المادة:</span>
                                <span className="text-gray-900">{inviteInfo?.subject}</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAccept} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                كلمة المرور الجديدة
                            </label>
                            <div className="relative">
                                <input
                                    required type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    minLength={8} placeholder="8 أحرف على الأقل"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                تأكيد كلمة المرور
                            </label>
                            <input
                                required type={showPassword ? 'text' : 'password'} value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="أعد كتابة كلمة المرور"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">كلمات المرور غير متطابقة</p>
                            )}
                        </div>
                        <button
                            type="submit" disabled={submitting}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
                        >
                            {submitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب والانضمام'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
