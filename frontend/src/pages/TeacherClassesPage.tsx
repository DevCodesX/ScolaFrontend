import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Users, X, UserPlus, UserMinus } from 'lucide-react';
import {
    getTeacherClasses,
    getTeacherClassStudents,
    getAllMyStudents,
    createMyClass,
    updateMyClass,
    deleteMyClass,
    addStudentToMyClass,
    removeStudentFromMyClass,
    type TeacherClass,
    type TeacherStudent,
} from '../services/teacherService';
import { getUser } from '../services/authService';

export default function TeacherClassesPage() {
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [allStudents, setAllStudents] = useState<TeacherStudent[]>([]);
    const [classStudents, setClassStudents] = useState<TeacherStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    // Modal states
    const [showClassModal, setShowClassModal] = useState(false);
    const [editingClass, setEditingClass] = useState<TeacherClass | null>(null);
    const [classForm, setClassForm] = useState({ name: '' });
    const [saving, setSaving] = useState(false);

    // Student assignment
    const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const user = getUser();
    const isFree = user?.teacherType === 'free';

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await getTeacherClasses();
            setClasses(data);
            setError('');
        } catch (err: any) {
            setError(err.message || 'فشل في تحميل الصفوف');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClasses(); }, []);

    // Fetch students for a class
    const openClassStudents = async (cls: TeacherClass) => {
        setSelectedClass(cls);
        setShowStudentModal(true);
        setLoadingStudents(true);
        try {
            const [students, owned] = await Promise.all([
                getTeacherClassStudents(cls.id),
                isFree ? getAllMyStudents() : Promise.resolve([]),
            ]);
            setClassStudents(students);
            setAllStudents(owned);
        } catch (err: any) {
            setError(err.message || 'فشل في تحميل طلاب الصف');
        } finally {
            setLoadingStudents(false);
        }
    };

    const openAddClass = () => {
        setEditingClass(null);
        setClassForm({ name: '' });
        setShowClassModal(true);
    };

    const openEditClass = (cls: TeacherClass) => {
        setEditingClass(cls);
        setClassForm({ name: cls.name });
        setShowClassModal(true);
    };

    const handleSaveClass = async () => {
        if (!classForm.name.trim()) return;
        setSaving(true);
        try {
            if (editingClass) {
                await updateMyClass(editingClass.id, classForm);
            } else {
                await createMyClass(classForm);
            }
            setShowClassModal(false);
            fetchClasses();
        } catch (err: any) {
            setError(err.message || 'فشل في حفظ الصف');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الصف؟ سيؤدي ذلك لحذف جميع البيانات المرتبطة.')) return;
        try {
            await deleteMyClass(id);
            fetchClasses();
        } catch (err: any) {
            setError(err.message || 'فشل في حذف الصف');
        }
    };

    const handleAddStudent = async (studentId: string) => {
        if (!selectedClass) return;
        try {
            await addStudentToMyClass(selectedClass.id, studentId);
            // Refresh student lists
            const students = await getTeacherClassStudents(selectedClass.id);
            setClassStudents(students);
        } catch (err: any) {
            setError(err.message || 'فشل في إضافة الطالب');
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedClass) return;
        try {
            await removeStudentFromMyClass(selectedClass.id, studentId);
            setClassStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (err: any) {
            setError(err.message || 'فشل في إزالة الطالب');
        }
    };

    const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Students not yet in this class
    const availableStudents = allStudents.filter(
        s => !classStudents.find(cs => cs.id === s.id)
    );

    return (
        <div className="p-6 max-w-6xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">صفوفي</h1>
                    <p className="text-gray-500 text-sm mt-1">إدارة صفوفك ومجموعاتك التعليمية</p>
                </div>
                {isFree && (
                    <button
                        onClick={openAddClass}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة صف</span>
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="بحث عن صف..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
            )}

            {/* Classes Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">{search ? 'لا توجد نتائج' : 'لا توجد صفوف بعد'}</p>
                    {!search && isFree && <p className="text-sm mt-1">اضغط "إضافة صف" للبدء</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(cls => (
                        <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-800">{cls.name}</h3>
                                {isFree && (
                                    <div className="flex items-center gap-1 mr-2">
                                        <button
                                            onClick={() => openEditClass(cls)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="تعديل"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClass(cls.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mb-4">
                                تم الإنشاء: {cls.created_at ? new Date(cls.created_at).toLocaleDateString('ar-SA') : '—'}
                            </p>
                            <button
                                onClick={() => openClassStudents(cls)}
                                className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                            >
                                <Users className="w-4 h-4" />
                                <span>عرض الطلاب</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Class Modal (Add/Edit) */}
            {showClassModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editingClass ? 'تعديل الصف' : 'إضافة صف جديد'}
                            </h2>
                            <button onClick={() => setShowClassModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الصف *</label>
                            <input
                                type="text"
                                value={classForm.name}
                                onChange={e => setClassForm({ name: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="مثال: الرياضيات - المجموعة أ"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowClassModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSaveClass}
                                disabled={saving || !classForm.name.trim()}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'جاري الحفظ...' : editingClass ? 'تحديث' : 'إضافة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Students in Class Modal */}
            {showStudentModal && selectedClass && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-bold text-gray-800">
                                طلاب {selectedClass.name}
                            </h2>
                            <button onClick={() => setShowStudentModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {loadingStudents ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                </div>
                            ) : (
                                <>
                                    {/* Current students */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">الطلاب المسجلون ({classStudents.length})</h3>
                                        {classStudents.length === 0 ? (
                                            <p className="text-sm text-gray-400 py-3 text-center">لا يوجد طلاب في هذا الصف</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {classStudents.map(s => (
                                                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                                                            <p className="text-xs text-gray-400">{s.email || s.phone || ''}</p>
                                                        </div>
                                                        {isFree && (
                                                            <button
                                                                onClick={() => handleRemoveStudent(s.id)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="إزالة من الصف"
                                                            >
                                                                <UserMinus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Available students to add (free teacher only) */}
                                    {isFree && availableStudents.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">إضافة طلاب</h3>
                                            <div className="space-y-2">
                                                {availableStudents.map(s => (
                                                    <div key={s.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                                        <div>
                                                            <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                                                            <p className="text-xs text-gray-400">{s.email || s.phone || ''}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddStudent(s.id)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="إضافة للصف"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowStudentModal(false)}
                                className="w-full py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
