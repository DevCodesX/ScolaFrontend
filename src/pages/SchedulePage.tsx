import React from "react";
import { mockScheduleEvents } from '../data/mockData';
import { ScheduleGrid } from '../components/schedule';

export function SchedulePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الجدول الأسبوعي</h1>
        <p className="text-gray-500 mt-1">عرض وإدارة الجدول الدراسي الأسبوعي</p>
      </div>

      {/* Schedule Grid */}
      <ScheduleGrid events={mockScheduleEvents} />
    </div>
  );
}
