import React, { useState } from 'react';
import { X, Send, UserPlus } from 'lucide-react';
import { sendInvitation, InvitePayload } from '../../services/teacherInvitations';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export function InviteTeacherModal({ onClose, onSuccess }: Props) {
    const [form, setForm] = useState<InvitePayload>({
        first_name: '', last_name: '', email: '', phone: '', subject: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await sendInvitation(form);
            if (result.emailSent) {
                setSuccess('✅ تم إرسال الدعوة بنجاح عبر البريد الإلكتروني');
            } else {
                setSuccess('✅ تم حفظ الدعوة — انسخ الرابط وأرسله للمدرس يدوياً');
            }
            setInviteLink(result.inviteLink);
            setTimeout(() => { onSuccess(); onClose(); }, 6000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function copyLink() {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">دعوة مدرس جديد</h2>
                            <p className="text-sm text-gray-500">سيتلقى المدرس رابط دعوة للانضمام</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm space-y-2">
                            <p>{success}</p>
                            {inviteLink && (
                                <div className="bg-white p-2 rounded-lg border border-green-300">
                                    <p className="text-xs text-gray-500 mb-1">رابط الدعوة:</p>
                                    <p className="text-xs text-blue-600 break-all select-all" dir="ltr">{inviteLink}</p>
                                    <button
                                        type="button"
                                        onClick={copyLink}
                                        className="mt-2 w-full text-xs py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                        {copied ? '✅ تم النسخ!' : '📋 نسخ الرابط'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الاسم الأول <span className="text-red-500">*</span>
                            </label>
                            <input
                                required name="first_name" value={form.first_name} onChange={handleChange}
                                placeholder="الاسم الأول"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                اسم العائلة
                            </label>
                            <input
                                name="last_name" value={form.last_name} onChange={handleChange}
                                placeholder="اسم العائلة"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            البريد الإلكتروني <span className="text-red-500">*</span>
                        </label>
                        <input
                            required type="email" name="email" value={form.email} onChange={handleChange}
                            placeholder="teacher@example.com" dir="ltr"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                            <input
                                name="phone" value={form.phone} onChange={handleChange}
                                placeholder="05xxxxxxxx" dir="ltr"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-left"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المادة</label>
                            <input
                                name="subject" value={form.subject} onChange={handleChange}
                                placeholder="رياضيات، علوم..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit" disabled={loading || !!success}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                        >
                            <Send className="w-4 h-4" />
                            {loading ? 'جارٍ الإرسال...' : 'إرسال الدعوة'}
                        </button>
                        <button
                            type="button" onClick={onClose}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
