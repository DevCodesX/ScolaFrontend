import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  CalendarDays,
  Plus,
  Calendar,
  BookOpen,
  UserPlus,
  School
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common';
import { getAdminDashboard, DashboardStats } from '../services/admin';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isEmpty?: boolean;
  emptyText?: string;
  addLink?: string;
}

function StatCard({ title, value, icon, color, isEmpty, emptyText, addLink }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          {isEmpty ? (
            <div className="mt-2">
              <p className="text-sm text-gray-400">{emptyText || 'لا توجد بيانات'}</p>
              {addLink && (
                <Link
                  to={addLink}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                >
                  + إضافة الآن
                </Link>
              )}
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">مرحباً بك في نظام سكولا لإدارة المؤسسات التعليمية</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="إجمالي المعلمين"
          value={stats?.teachers || 0}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          isEmpty={stats?.teachers === 0}
          emptyText="لم يتم إضافة معلمين بعد"
          addLink="/teachers"
        />
        <StatCard
          title="إجمالي الطلاب"
          value={stats?.students || 0}
          icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
          isEmpty={stats?.students === 0}
          emptyText="لم يتم إضافة طلاب بعد"
          addLink="/students"
        />
        <StatCard
          title="الصفوف الدراسية"
          value={stats?.classes || 0}
          icon={<CalendarDays className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          isEmpty={stats?.classes === 0}
          emptyText="لم يتم إضافة صفوف بعد"
          addLink="/classes"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/teachers"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">إضافة معلم</p>
              <p className="text-sm text-gray-500">تسجيل معلم جديد</p>
            </div>
          </Link>
          <Link
            to="/students"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">إضافة طالب</p>
              <p className="text-sm text-gray-500">تسجيل طالب جديد</p>
            </div>
          </Link>
          <Link
            to="/classes"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <School className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">إضافة صف</p>
              <p className="text-sm text-gray-500">إنشاء صف دراسي جديد</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Empty State for when everything is zero */}
      {stats && stats.teachers === 0 && stats.students === 0 && stats.classes === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">ابدأ بإعداد مؤسستك</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            أضف المعلمين والطلاب والصفوف الدراسية لبدء استخدام النظام
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/teachers"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-5 h-5" />
              إضافة معلم
            </Link>
            <Link
              to="/classes"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all border border-gray-200"
            >
              <Plus className="w-5 h-5" />
              إضافة صف
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
