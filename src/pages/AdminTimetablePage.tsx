import React, { useEffect, useState } from "react";
import { Calendar, Plus, Trash2, X } from "lucide-react";
import { getAllSlots, addSlot, deleteSlot, TimetableSlot } from "../services/timetable";
import { getTeachers, Teacher } from "../services/teachers";
import { getClasses } from "../services/classes";

interface ClassOption {
    id: string;
    name: string;
}

const DAYS = [
    { key: 'sat', label: 'السبت' },
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الإثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
];

export function AdminTimetablePage() {
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        class_id: '',
        teacher_id: '',
        day: 'sat',
        start_time: '08:00',
        end_time: '09:00',
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [slotsData, teachersData, classesData] = await Promise.all([
                getAllSlots(),
                getTeachers(),
                getClasses()
            ]);
            setSlots(slotsData);
            setTeachers(teachersData);
            setClasses(classesData);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        try {
            await addSlot(formData);
            await loadData();
            setShowForm(false);
            setFormData({ class_id: '', teacher_id: '', day: 'sat', start_time: '08:00', end_time: '09:00' });
        } catch (err) {
            alert("حدث خطأ أثناء إضافة الحصة");
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("هل أنت متأكد من حذف هذه الحصة؟")) return;
        try {
            await deleteSlot(id);
            setSlots(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert("حدث خطأ أثناء الحذف");
        }
    }

    // Group slots by day
    const slotsByDay = DAYS.map(day => ({
        ...day,
        slots: slots.filter(s => s.day === day.key)
    }));

    if (loading) return <p className="text-gray-500">جاري التحميل...</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">إدارة الجدول الأسبوعي</h1>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium"
                >
                    <Plus className="w-5 h-5" />
                    إضافة حصة
                </button>
            </div>

            {/* Timetable Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slotsByDay.map(day => (
                    <div key={day.key} className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 font-bold">
                            {day.label}
                        </div>
                        <div className="p-4">
                            {day.slots.length === 0 ? (
                                <p className="text-gray-400 text-sm">لا توجد حصص</p>
                            ) : (
                                <div className="space-y-3">
                                    {day.slots.map(slot => (
                                        <div key={slot.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">{slot.class_name}</p>
                                                <p className="text-sm text-gray-500">{slot.teacher_name}</p>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(slot.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">إضافة حصة جديدة</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <select
                                required
                                value={formData.class_id}
                                onChange={e => setFormData(prev => ({ ...prev, class_id: e.target.value }))}
                                className="w-full px-4 py-3 border rounded-xl bg-white"
                            >
                                <option value="">اختر الصف</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <select
                                required
                                value={formData.teacher_id}
                                onChange={e => setFormData(prev => ({ ...prev, teacher_id: e.target.value }))}
                                className="w-full px-4 py-3 border rounded-xl bg-white"
                            >
                                <option value="">اختر المعلم</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <select
                                required
                                value={formData.day}
                                onChange={e => setFormData(prev => ({ ...prev, day: e.target.value }))}
                                className="w-full px-4 py-3 border rounded-xl bg-white"
                            >
                                {DAYS.map(d => (
                                    <option key={d.key} value={d.key}>{d.label}</option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">من</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.start_time}
                                        onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                                        className="w-full px-4 py-3 border rounded-xl"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">إلى</label>
                                    <input
                                        required
                                        type="time"
                                        value={formData.end_time}
                                        onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                                        className="w-full px-4 py-3 border rounded-xl"
                                    />
                                </div>
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
