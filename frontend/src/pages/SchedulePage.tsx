import React from "react";
import { Calendar } from 'lucide-react';
import { EmptyState } from '../components/common';

export function SchedulePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الجدول الأسبوعي</h1>
        <p className="text-gray-500 mt-1">عرض وإدارة الجدول الدراسي الأسبوعي</p>
      </div>

      {/* Schedule Grid - Empty State */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <EmptyState
          title="لا يوجد جدول بعد"
          description="ابدأ بإضافة الحصص الدراسية لعرض الجدول الأسبوعي"
          icon={<Calendar className="w-10 h-10 text-gray-400" />}
        />
      </div>
    </div>
  );
}
