import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getTeacherClasses, TeacherClass } from "../services/teacherService";
import { getClassAttendance, markAttendance } from "../services/attendance";

interface StudentRow {
    student_id: string;
    name: string;
    status: "present" | "absent" | "late";
}

export function AttendancePage() {
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClasses();
    }, []);

    async function loadClasses() {
        try {
            const data = await getTeacherClasses();
            setClasses(data);
        } catch (err) {
            console.error("Failed to load classes:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p className="text-gray-500">جاري التحميل...</p>;

    if (!selectedClass) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">تسجيل الحضور</h1>
                <p className="text-gray-500">اختر الصف</p>

                {classes.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <p className="text-gray-500">لم يتم تعيين صفوف لك بعد</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-right"
                            >
                                <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                    تسجيل الحضور <ArrowRight className="w-4 h-4" />
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => setSelectedClass(null)}
                className="text-blue-600 text-sm hover:underline"
            >
                ← العودة للصفوف
            </button>
            <AttendanceTable classId={selectedClass.id} className={selectedClass.name} />
        </div>
    );
}

function AttendanceTable({ classId, className }: { classId: string; className: string }) {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [rows, setRows] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getClassAttendance(classId, date);
            setRows(res.students);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [date, classId]);

    if (loading) return <p className="text-gray-500">جاري التحميل...</p>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">حضور: {className}</h2>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-2 border rounded-xl"
                />
            </div>

            {rows.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                    <p className="text-gray-500">لا يوجد طلاب</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-right font-semibold">الطالب</th>
                                <th className="px-4 py-4 text-center font-semibold text-green-600">حاضر</th>
                                <th className="px-4 py-4 text-center font-semibold text-red-600">غائب</th>
                                <th className="px-4 py-4 text-center font-semibold text-yellow-600">متأخر</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rows.map((r) => (
                                <tr key={r.student_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{r.name}</td>
                                    {(["present", "absent", "late"] as const).map((st) => (
                                        <td key={st} className="px-4 py-4 text-center">
                                            <input
                                                type="radio"
                                                name={r.student_id}
                                                checked={r.status === st}
                                                onChange={async () => {
                                                    await markAttendance({
                                                        student_id: r.student_id,
                                                        class_id: classId,
                                                        date,
                                                        status: st,
                                                    });
                                                    load();
                                                }}
                                                className="w-5 h-5 cursor-pointer accent-blue-600"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
