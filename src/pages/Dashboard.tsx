import React from "react";
import {
  Users,
  GraduationCap,
  CalendarDays,
  TrendingUp,
  ArrowUpLeft,
  Plus
} from 'lucide-react';
import { mockStats, mockTeachers, mockStudents, mockClassrooms, mockScheduleEvents } from '../data/mockData';
import { UserTable } from '../components/users';
import { ClassroomCard } from '../components/classrooms';
import { ScheduleGrid } from '../components/schedule';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative';
  color: string;
}

function StatCard({ title, value, icon, change, changeType, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
              <ArrowUpLeft className={`w-4 h-4 ${changeType === 'negative' ? 'rotate-90' : ''}`} />
              <span>{change}</span>
            </div>
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">مرحباً بك في نظام سكولا لإدارة المؤسسات التعليمية</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
          <Plus className="w-5 h-5" />
          إضافة جديد
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الطلاب"
          value={mockStats.totalStudents}
          icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
          change="+12% من الشهر الماضي"
          changeType="positive"
          color="bg-blue-100"
        />
        <StatCard
          title="إجمالي المعلمين"
          value={mockStats.totalTeachers}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          change="+2 معلم جديد"
          changeType="positive"
          color="bg-purple-100"
        />
        <StatCard
          title="الصفوف الدراسية"
          value={mockStats.totalClassrooms}
          icon={<CalendarDays className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="نسبة الحضور"
          value={`${mockStats.attendanceRate}%`}
          icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
          change="+2.5% من الأسبوع الماضي"
          changeType="positive"
          color="bg-amber-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Schedule - Takes 2 columns */}
        <div className="xl:col-span-2">
          <ScheduleGrid events={mockScheduleEvents} selectedClassroom="class-001" />
        </div>

        {/* Classrooms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">الصفوف الدراسية</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              عرض الكل
            </button>
          </div>
          {mockClassrooms.slice(0, 2).map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      </div>

      {/* Users Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UserTable
          users={mockTeachers}
          type="teacher"
          title="المعلمون"
        />
        <UserTable
          users={mockStudents}
          type="student"
          title="الطلاب"
        />
      </div>
    </div>
  );
}
