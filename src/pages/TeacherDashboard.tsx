import React, { useEffect, useState } from "react";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { getTeacherDashboard, getTeacherClasses, getTeacherStudents, DashboardStats, TeacherClass, TeacherStudent } from "../services/teacherService";
import { getUser } from "../services/authService";

export function TeacherDashboard() {
    const [stats, setStats] = useState<DashboardStats>({ classes: 0, students: 0 });
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [students, setStudents] = useState<TeacherStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const user = getUser();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [dashboardData, classesData, studentsData] = await Promise.all([
                getTeacherDashboard(),
                getTeacherClasses(),
                getTeacherStudents()
            ]);
            setStats(dashboardData);
            setClasses(classesData);
            setStudents(studentsData);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="text-gray-500">جاري التحميل...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold">مرحباً، {user?.email || "معلم"}</h1>
                <p className="text-blue-100 mt-1">لوحة تحكم المعلم</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">الصفوف</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.classes}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">الطلاب</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Classes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    صفوفي
                </h2>
                {classes.length === 0 ? (
                    <p className="text-gray-500">لم يتم تعيين صفوف لك بعد</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map(cls => (
                            <div key={cls.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Students */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    طلابي
                </h2>
                {students.length === 0 ? (
                    <p className="text-gray-500">لا يوجد طلاب في صفوفك</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الاسم</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">البريد</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">الهاتف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{student.email || "-"}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{student.phone || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
