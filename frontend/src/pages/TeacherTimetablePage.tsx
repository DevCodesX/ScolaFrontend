import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { getTeacherTimetable, TimetableSlot } from "../services/timetable";

const DAYS = [
    { key: 'sat', label: 'السبت' },
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الإثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
];

export function TeacherTimetablePage() {
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTimetable();
    }, []);

    async function loadTimetable() {
        try {
            const data = await getTeacherTimetable();
            setSlots(data);
        } catch (err) {
            console.error("Failed to load timetable:", err);
        } finally {
            setLoading(false);
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
            <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">جدولي الأسبوعي</h1>
            </div>

            {slots.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                    <p className="text-gray-500">لا توجد حصص مجدولة لك بعد</p>
                </div>
            ) : (
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
                                            <div key={slot.id} className="bg-gray-50 rounded-lg p-3">
                                                <p className="font-medium text-gray-900">{slot.class_name}</p>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
