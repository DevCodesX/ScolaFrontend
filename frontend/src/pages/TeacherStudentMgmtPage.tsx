import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Link2, Copy, Check, Plus, Search, X, Clock, AlertTriangle,
    CheckCircle, XCircle, Pause, Play, RefreshCw, Pencil, Loader2,
    UserPlus, KeyRound, CalendarPlus, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
    getMyStudentsList, approveStudent, rejectStudent,
    extendStudent, suspendStudent, reactivateStudent,
    getExpiringStudents, updateStudentNotes,
    type ManagedStudent,
} from '../services/teacherStudentMgmtService';
import {
    generateInvite, addStudentManually, getMyInvites,
    type GeneratedInvite,
} from '../services/teacherStudentInviteService';

type StatusFilter = 'all' | 'pending' | 'active' | 'expired' | 'suspended';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: 'بانتظار الموافقة', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock className="w-3.5 h-3.5" /> },
    active: { label: 'نشط', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    expired: { label: 'منتهي', color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle className="w-3.5 h-3.5" /> },
    suspended: { label: 'موقوف', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Pause className="w-3.5 h-3.5" /> },
};

export default function TeacherStudentMgmtPage() {
    const [students, setStudents] = useState<ManagedStudent[]>([]);
    const [expiringStudents, setExpiringStudents] = useState<ManagedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Invite state
    const [joinCode, setJoinCode] = useState<string | null>(null);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState<'link' | 'code' | null>(null);
    const [generatingLink, setGeneratingLink] = useState(false);

    // Add student modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ studentName: '', studentEmail: '', studentPhone: '', autoApprove: false, expiresInDays: 30 });
    const [addingSaving, setAddingSaving] = useState(false);

    // Extend modal
    const [showExtendModal, setShowExtendModal] = useState<string | null>(null);
    const [extendDays, setExtendDays] = useState(30);
    const [extending, setExtending] = useState(false);

    // Notes
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [notesText, setNotesText] = useState('');

    // Expiring alerts section
    const [showExpiring, setShowExpiring] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [studentsData, expiringData, invitesData] = await Promise.all([
                getMyStudentsList(),
                getExpiringStudents(3),
                getMyInvites(),
            ]);
            setStudents(studentsData);
            setExpiringStudents(expiringData);
            setJoinCode(invitesData.joinCode);
            setError('');
        } catch (err: any) {
            setError(err.message || 'فشل في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Clear success message after 3s
    useEffect(() => {
        if (success) {
            const t = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(t);
        }
    }, [success]);

    // ─── ACTIONS ──────────────────────────────

    const handleGenerateLink = async () => {
        setGeneratingLink(true);
        try {
            const result = await generateInvite({ maxUses: 50, expiresInDays: 7 });
            const base = window.location.origin;
            setGeneratedLink(`${base}/#/join/${result.token}`);
            if (result.joinCode) setJoinCode(result.joinCode);
            setSuccess('تم إنشاء رابط الدعوة بنجاح');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleCopy = (text: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleApprove = async (id: string) => {
        try {
            await approveStudent(id, 30);
            setSuccess('تم قبول الطالب');
            fetchData();
        } catch (err: any) { setError(err.message); }
    };

    const handleReject = async (id: string) => {
        if (!confirm('هل أنت متأكد من رفض هذا الطالب؟')) return;
        try {
            await rejectStudent(id);
            setSuccess('تم رفض الطالب');
            fetchData();
        } catch (err: any) { setError(err.message); }
    };

    const handleExtend = async () => {
        if (!showExtendModal) return;
        setExtending(true);
        try {
            await extendStudent(showExtendModal, extendDays);
            setSuccess(`تم تمديد الاشتراك ${extendDays} يوم`);
            setShowExtendModal(null);
            fetchData();
        } catch (err: any) { setError(err.message); }
        finally { setExtending(false); }
    };

    const handleSuspend = async (id: string) => {
        if (!confirm('هل أنت متأكد من إيقاف هذا الطالب؟')) return;
        try {
            await suspendStudent(id);
            setSuccess('تم إيقاف الطالب');
            fetchData();
        } catch (err: any) { setError(err.message); }
    };

    const handleReactivate = async (id: string) => {
        try {
            await reactivateStudent(id, 30);
            setSuccess('تم إعادة تفعيل الطالب');
            fetchData();
        } catch (err: any) { setError(err.message); }
    };

    const handleSaveNotes = async (id: string) => {
        try {
            await updateStudentNotes(id, notesText);
            setSuccess('تم حفظ الملاحظات');
            setEditingNotes(null);
            fetchData();
        } catch (err: any) { setError(err.message); }
    };

    const handleAddStudent = async () => {
        if (!addForm.studentName.trim()) return;
        setAddingSaving(true);
        try {
            await addStudentManually({
                ...addForm,
                studentEmail: addForm.studentEmail || undefined,
                studentPhone: addForm.studentPhone || undefined,
            });
            setSuccess('تم إضافة الطالب بنجاح');
            setShowAddModal(false);
            setAddForm({ studentName: '', studentEmail: '', studentPhone: '', autoApprove: false, expiresInDays: 30 });
            fetchData();
        } catch (err: any) { setError(err.message); }
        finally { setAddingSaving(false); }
    };

    // ─── FILTERING ──────────────────────────────

    const filtered = students.filter(s => {
        const matchSearch =
            (s.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.student_email || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const counts = {
        all: students.length,
        pending: students.filter(s => s.status === 'pending').length,
        active: students.filter(s => s.status === 'active').length,
        expired: students.filter(s => s.status === 'expired').length,
        suspended: students.filter(s => s.status === 'suspended').length,
    };

    const formatDate = (d: string | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getDaysLabel = (days: number | null) => {
        if (days === null) return '—';
        if (days < 0) return 'منتهي';
        if (days === 0) return 'ينتهي اليوم';
        if (days === 1) return 'يوم واحد';
        if (days === 2) return 'يومان';
        if (days <= 10) return `${days} أيام`;
        return `${days} يوم`;
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة الطلاب</h1>
                    <p className="text-gray-500 text-sm mt-1">إدارة طلابك واشتراكاتهم ودعواتهم</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        إضافة طالب
                    </button>
                    <button
                        onClick={handleGenerateLink}
                        disabled={generatingLink}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm disabled:opacity-50"
                    >
                        {generatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                        إنشاء رابط دعوة
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                    <XCircle className="w-5 h-5 flex-shrink-0" /> {error}
                    <button onClick={() => setError('')} className="mr-auto"><X className="w-4 h-4" /></button>
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
            )}

            {/* Invite & Code Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Generated Link */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Link2 className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-semibold text-gray-700">رابط الدعوة</h3>
                    </div>
                    {generatedLink ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={generatedLink}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono"
                                dir="ltr"
                            />
                            <button
                                onClick={() => handleCopy(generatedLink, 'link')}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                title="نسخ"
                            >
                                {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">اضغط "إنشاء رابط دعوة" لإنشاء رابط جديد</p>
                    )}
                </div>

                {/* Join Code */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <KeyRound className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-700">كود الانضمام الدائم</h3>
                    </div>
                    {joinCode ? (
                        <div className="flex items-center gap-2">
                            <span className="flex-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-lg font-mono font-bold text-purple-700 tracking-wider text-center" dir="ltr">
                                {joinCode}
                            </span>
                            <button
                                onClick={() => handleCopy(joinCode, 'code')}
                                className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                title="نسخ"
                            >
                                {copied === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">سيتم إنشاء كود انضمام عند إنشاء أول رابط دعوة</p>
                    )}
                </div>
            </div>

            {/* Expiring Alerts */}
            {expiringStudents.length > 0 && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                    <button
                        onClick={() => setShowExpiring(!showExpiring)}
                        className="w-full flex items-center justify-between p-4 hover:bg-amber-100/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">
                                تنبيه: {expiringStudents.length} طالب ينتهي اشتراكهم خلال 3 أيام
                            </span>
                        </div>
                        {showExpiring ? <ChevronUp className="w-5 h-5 text-amber-600" /> : <ChevronDown className="w-5 h-5 text-amber-600" />}
                    </button>
                    {showExpiring && (
                        <div className="px-4 pb-4 space-y-2">
                            {expiringStudents.map(s => (
                                <div key={s.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100">
                                    <div>
                                        <span className="font-medium text-gray-700">{s.student_name}</span>
                                        <span className="text-xs text-amber-600 mr-2">
                                            {getDaysLabel(s.days_remaining)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { setShowExtendModal(s.id); setExtendDays(30); }}
                                        className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
                                    >
                                        <CalendarPlus className="w-3.5 h-3.5" />
                                        تمديد
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث عن طالب..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                    {(['all', 'pending', 'active', 'expired', 'suspended'] as StatusFilter[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors
                                ${statusFilter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {f === 'all' ? 'الكل' : STATUS_CONFIG[f].label}
                            <span className="mr-1 opacity-70">({counts[f]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Students Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">{search || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا يوجد طلاب بعد'}</p>
                    <p className="text-sm mt-1">أنشئ رابط دعوة أو أضف طالباً يدوياً</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500">
                                    <th className="text-right py-3 px-4 font-medium">الاسم</th>
                                    <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">البريد/الهاتف</th>
                                    <th className="text-center py-3 px-4 font-medium">الحالة</th>
                                    <th className="text-center py-3 px-4 font-medium hidden md:table-cell">ينتهي في</th>
                                    <th className="text-center py-3 px-4 font-medium w-44">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(s => {
                                    const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
                                    return (
                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-800">{s.student_name || '—'}</div>
                                                {s.notes && (
                                                    <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                                                        <MessageSquare className="w-3 h-3 inline ml-1" />
                                                        {s.notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">
                                                <div dir="ltr" className="text-right">{s.student_email || s.student_phone || '—'}</div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                                                    {cfg.icon}
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center hidden md:table-cell">
                                                {s.status === 'active' ? (
                                                    <span className={`text-xs ${(s.days_remaining ?? 99) <= 3 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                                                        {getDaysLabel(s.days_remaining)}
                                                    </span>
                                                ) : s.status === 'pending' ? (
                                                    <span className="text-xs text-gray-400">لم يبدأ</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">{formatDate(s.access_expires_at)}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                                    {s.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(s.id)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="موافقة"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(s.id)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="رفض"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {s.status === 'active' && (
                                                        <>
                                                            <button
                                                                onClick={() => { setShowExtendModal(s.id); setExtendDays(30); }}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="تمديد"
                                                            >
                                                                <CalendarPlus className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSuspend(s.id)}
                                                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                                title="إيقاف"
                                                            >
                                                                <Pause className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {(s.status === 'suspended' || s.status === 'expired') && (
                                                        <button
                                                            onClick={() => handleReactivate(s.id)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="إعادة تفعيل"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setEditingNotes(s.id); setNotesText(s.notes || ''); }}
                                                        className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                                                        title="ملاحظات"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-gray-500 text-xs border-t flex items-center justify-between">
                        <span>إجمالي: {filtered.length} طالب</span>
                        <button onClick={fetchData} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                            <RefreshCw className="w-3.5 h-3.5" /> تحديث
                        </button>
                    </div>
                </div>
            )}

            {/* ─── ADD STUDENT MODAL ─── */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">إضافة طالب يدوياً</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                                <input
                                    type="text"
                                    value={addForm.studentName}
                                    onChange={e => setAddForm({ ...addForm, studentName: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="اسم الطالب"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={addForm.studentEmail}
                                    onChange={e => setAddForm({ ...addForm, studentEmail: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="email@example.com"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                                <input
                                    type="tel"
                                    value={addForm.studentPhone}
                                    onChange={e => setAddForm({ ...addForm, studentPhone: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={addForm.autoApprove}
                                        onChange={e => setAddForm({ ...addForm, autoApprove: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                                <span className="text-sm text-gray-600">قبول تلقائي</span>
                            </div>
                            {addForm.autoApprove && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">مدة الاشتراك (أيام)</label>
                                    <input
                                        type="number"
                                        value={addForm.expiresInDays}
                                        onChange={e => setAddForm({ ...addForm, expiresInDays: parseInt(e.target.value) || 30 })}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        min={1}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddStudent}
                                disabled={addingSaving || !addForm.studentName.trim()}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {addingSaving ? 'جاري الحفظ...' : 'إضافة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── EXTEND MODAL ─── */}
            {showExtendModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">تمديد الاشتراك</h2>
                            <button onClick={() => setShowExtendModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأيام</label>
                            <div className="flex items-center gap-2 mb-4">
                                {[7, 14, 30, 60, 90].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setExtendDays(d)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                            ${extendDays === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {d} يوم
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                value={extendDays}
                                onChange={e => setExtendDays(parseInt(e.target.value) || 30)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                min={1}
                            />
                        </div>
                        <div className="flex items-center gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setShowExtendModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                                إلغاء
                            </button>
                            <button
                                onClick={handleExtend}
                                disabled={extending}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {extending ? 'جاري التمديد...' : `تمديد ${extendDays} يوم`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── NOTES MODAL ─── */}
            {editingNotes && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">ملاحظات</h2>
                            <button onClick={() => setEditingNotes(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-5">
                            <textarea
                                value={notesText}
                                onChange={e => setNotesText(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
                                placeholder="أضف ملاحظات خاصة عن الطالب..."
                            />
                        </div>
                        <div className="flex items-center gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setEditingNotes(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleSaveNotes(editingNotes)}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                حفظ الملاحظات
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
