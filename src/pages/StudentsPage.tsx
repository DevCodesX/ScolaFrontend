import React from "react";
import { Plus } from 'lucide-react';
import { mockStudents } from '../data/mockData';
import { UserTable } from '../components/users';

export function StudentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب</h1>
          <p className="text-gray-500 mt-1">عرض وإدارة بيانات الطلاب في المؤسسة</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
          <Plus className="w-5 h-5" />
          إضافة طالب
        </button>
      </div>

      {/* Students Table */}
      <UserTable
        users={mockStudents}
        type="student"
        title="قائمة الطلاب"
      />
    </div>
  );
}
