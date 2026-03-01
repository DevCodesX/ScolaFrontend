import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, UserPlus, X } from 'lucide-react';
import {
    getAllMyStudents,
    createMyStudent,
    updateMyStudent,
    deleteMyStudent,
    type TeacherStudent,
} from '../services/teacherService';

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<TeacherStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<TeacherStudent | null>(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await getAllMyStudents();
            setStudents(data);
            setError('');
        } catch (err: any) {
            setError(err.message || 'فشل في تحميل الطلاب');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const openAdd = () => {
        setEditingStudent(null);
        setForm({ name: '', email: '', phone: '' });
        setShowModal(true);
    };

    const openEdit = (s: TeacherStudent) => {
        setEditingStudent(s);
        setForm({ name: s.name, email: s.email || '', phone: s.phone || '' });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (editingStudent) {
                await updateMyStudent(editingStudent.id, form);
            } else {
                await createMyStudent(form);
            }
            setShowModal(false);
            fetchStudents();
        } catch (err: any) {
            setError(err.message || 'فشل في حفظ الطالب');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
        try {
            await deleteMyStudent(id);
            fetchStudents();
        } catch (err: any) {
            setError(err.message || 'فشل في حذف الطالب');
        }
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-6 max-w-6xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">طلابي</h1>
                    <p className="text-gray-500 text-sm mt-1">إدارة طلابك الخصوصيين</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>إضافة طالب</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="بحث عن طالب..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">{search ? 'لا توجد نتائج' : 'لم تضف أي طلاب بعد'}</p>
                    {!search && <p className="text-sm mt-1">اضغط "إضافة طالب" للبدء</p>}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500">
                                <th className="text-right py-3 px-4 font-medium">الاسم</th>
                                <th className="text-right py-3 px-4 font-medium">البريد الإلكتروني</th>
                                <th className="text-right py-3 px-4 font-medium">الهاتف</th>
                                <th className="text-center py-3 px-4 font-medium w-28">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-gray-800">{s.name}</td>
                                    <td className="py-3 px-4 text-gray-500">{s.email || '—'}</td>
                                    <td className="py-3 px-4 text-gray-500">{s.phone || '—'}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => openEdit(s)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="تعديل"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-3 bg-gray-50 text-gray-500 text-xs">
                        إجمالي: {filtered.length} طالب
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editingStudent ? 'تعديل طالب' : 'إضافة طالب جديد'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="اسم الطالب"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="email@example.com"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.name.trim()}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'جاري الحفظ...' : editingStudent ? 'تحديث' : 'إضافة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
