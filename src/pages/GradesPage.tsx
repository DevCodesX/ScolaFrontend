import React, { useEffect, useState } from "react";
import { Plus, Trash2, ArrowRight, X } from "lucide-react";
import { getTeacherClasses, TeacherClass, getTeacherClassStudents, TeacherStudent } from "../services/teacherService";
import { getClassGrades, addGrade, deleteGrade, Grade } from "../services/gradesService";

const GRADE_TYPES = [
    { value: 'quiz', label: 'اختبار قصير' },
    { value: 'exam', label: 'امتحان' },
    { value: 'homework', label: 'واجب' },
    { value: 'project', label: 'مشروع' },
    { value: 'participation', label: 'مشاركة' },
];

export function GradesPage() {
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
    const [students, setStudents] = useState<TeacherStudent[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        student_id: '',
        grade_type: 'quiz',
        score: '',
        max_score: '100',
    });

    useEffect(() => {
        loadClasses();
    }, []);

    async function loadClasses() {
        try {
            const data = await getTeacherClasses();
            setClasses(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load classes:", err);
            setLoading(false);
        }
    }

    async function selectClass(cls: TeacherClass) {
        setSelectedClass(cls);
        try {
            const [gradesData, studentsData] = await Promise.all([
                getClassGrades(cls.id),
                getTeacherClassStudents(cls.id)
            ]);
            setGrades(gradesData);
            setStudents(studentsData);
        } catch (err) {
            console.error("Failed to load data:", err);
        }
    }

    async function handleAddGrade(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedClass) return;

        try {
            const newGrade = await addGrade({
                student_id: formData.student_id,
                class_id: selectedClass.id,
                grade_type: formData.grade_type,
                score: parseFloat(formData.score),
                max_score: parseFloat(formData.max_score),
            });
            // Refresh grades
            const gradesData = await getClassGrades(selectedClass.id);
            setGrades(gradesData);
            setShowForm(false);
            setFormData({ student_id: '', grade_type: 'quiz', score: '', max_score: '100' });
        } catch (err) {
            alert("حدث خطأ أثناء إضافة الدرجة");
            console.error(err);
        }
    }

    async function handleDelete(gradeId: string) {
        if (!window.confirm("هل أنت متأكد من حذف هذه الدرجة؟")) return;
        try {
            await deleteGrade(gradeId);
            setGrades(prev => prev.filter(g => g.id !== gradeId));
        } catch (err) {
            alert("حدث خطأ أثناء حذف الدرجة");
        }
    }

    if (loading) {
        return <div className="text-gray-500">جاري التحميل...</div>;
    }

    // Class selection view
    if (!selectedClass) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة الدرجات</h1>
                <p className="text-gray-500">اختر الصف لإدارة الدرجات</p>

                {classes.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <p className="text-gray-500">لم يتم تعيين صفوف لك بعد</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => selectClass(cls)}
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-right"
                            >
                                <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                    إدارة الدرجات <ArrowRight className="w-4 h-4" />
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Grades management view
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <button
                        onClick={() => setSelectedClass(null)}
                        className="text-blue-600 text-sm mb-2 hover:underline"
                    >
                        ← العودة للصفوف
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">درجات: {selectedClass.name}</h1>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700"
                >
                    <Plus className="w-5 h-5" />
                    إضافة درجة
                </button>
            </div>

            {/* Grades table */}
            {grades.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                    <p className="text-gray-500">لا توجد درجات مسجلة بعد</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الطالب</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">النوع</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">الدرجة</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">النسبة</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {grades.map(grade => (
                                <tr key={grade.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{grade.student_name}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {GRADE_TYPES.find(t => t.value === grade.grade_type)?.label || grade.grade_type}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold">{grade.score}</span>
                                        <span className="text-gray-400"> / {grade.max_score}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${(grade.score / grade.max_score) >= 0.9 ? 'bg-green-100 text-green-700' :
                                                (grade.score / grade.max_score) >= 0.7 ? 'bg-blue-100 text-blue-700' :
                                                    (grade.score / grade.max_score) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {Math.round((grade.score / grade.max_score) * 100)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(grade.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Grade Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">إضافة درجة جديدة</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddGrade} className="space-y-4">
                            <select
                                required
                                value={formData.student_id}
                                onChange={e => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                                className="w-full px-4 py-3 border rounded-xl bg-white"
                            >
                                <option value="">اختر الطالب</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <select
                                value={formData.grade_type}
                                onChange={e => setFormData(prev => ({ ...prev, grade_type: e.target.value }))}
                                className="w-full px-4 py-3 border rounded-xl bg-white"
                            >
                                {GRADE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <input
                                    required
                                    type="number"
                                    placeholder="الدرجة"
                                    value={formData.score}
                                    onChange={e => setFormData(prev => ({ ...prev, score: e.target.value }))}
                                    className="flex-1 px-4 py-3 border rounded-xl"
                                    min="0"
                                />
                                <input
                                    required
                                    type="number"
                                    placeholder="من"
                                    value={formData.max_score}
                                    onChange={e => setFormData(prev => ({ ...prev, max_score: e.target.value }))}
                                    className="w-24 px-4 py-3 border rounded-xl"
                                    min="1"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
                                >
                                    إضافة
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl"
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
