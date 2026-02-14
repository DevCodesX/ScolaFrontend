import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, Users, DollarSign, X } from "lucide-react";
import { getCourses, createCourse, updateCourse, deleteCourse, Course } from "../services/coursesService";
import { getUser } from "../services/authService";

export function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        max_students: 30,
        type: "general",
    });
    const [submitting, setSubmitting] = useState(false);

    const user = getUser();
    const isTeacher = user?.role === "teacher";

    useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        try {
            setLoading(true);
            const data = await getCourses();
            setCourses(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function openCreateForm() {
        setEditingCourse(null);
        setFormData({ title: "", description: "", price: 0, max_students: 30, type: "general" });
        setShowForm(true);
    }

    function openEditForm(course: Course) {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description || "",
            price: course.price,
            max_students: course.max_students,
            type: course.type,
        });
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCourse) {
                await updateCourse(editingCourse.id, formData);
            } else {
                await createCourse(formData);
            }
            setShowForm(false);
            await loadCourses();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;
        try {
            await deleteCourse(id);
            await loadCourses();
        } catch (err: any) {
            setError(err.message);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 mt-4">جاري تحميل الدورات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الدورات</h1>
                    <p className="text-gray-500 mt-1">إدارة الدورات التعليمية</p>
                </div>
                {isTeacher && (
                    <button
                        onClick={openCreateForm}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة دورة
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {error}
                    <button onClick={() => setError(null)} className="mr-2 text-red-500 hover:text-red-700">✕</button>
                </div>
            )}

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد دورات</h3>
                    <p className="text-gray-500 mb-4">لم يتم إضافة أي دورات بعد</p>
                    {isTeacher && (
                        <button onClick={openCreateForm} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                            <Plus className="w-4 h-4" />
                            إضافة أول دورة
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                                    <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-lg font-medium">
                                        {course.type}
                                    </span>
                                </div>
                                {course.teacher_name && (
                                    <p className="text-blue-100 text-sm mt-1">👨‍🏫 {course.teacher_name}</p>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                                <p className="text-gray-600 text-sm line-clamp-2">
                                    {course.description || "بدون وصف"}
                                </p>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-green-600">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="font-semibold">{course.price} ر.س</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Users className="w-4 h-4" />
                                        <span>حد أقصى {course.max_students}</span>
                                    </div>
                                </div>

                                {/* Actions for teacher owners */}
                                {isTeacher && course.teacher_id === user?.id && (
                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => openEditForm(course)}
                                            className="flex-1 flex items-center justify-center gap-1 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="flex-1 flex items-center justify-center gap-1 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            حذف
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingCourse ? "تعديل الدورة" : "إضافة دورة جديدة"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الدورة</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="أدخل عنوان الدورة"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="وصف الدورة"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى</label>
                                    <input
                                        type="number"
                                        value={formData.max_students}
                                        onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                                        min={1}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="general">عام</option>
                                    <option value="online">أونلاين</option>
                                    <option value="in-person">حضوري</option>
                                    <option value="hybrid">مدمج</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? "جاري الحفظ..." : editingCourse ? "تحديث" : "إضافة"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
