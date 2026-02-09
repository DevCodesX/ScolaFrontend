import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import type { ScheduleEvent, Teacher, Classroom } from '../../types';
import { DAYS_OF_WEEK_AR, TIME_SLOTS } from '../../types';
import { EmptyState } from '../common';

interface ScheduleGridProps {
  events: ScheduleEvent[];
  selectedClassroom?: string;
  teachers?: Teacher[];
  classrooms?: Classroom[];
}

export function ScheduleGrid({ events, selectedClassroom, teachers = [], classrooms = [] }: ScheduleGridProps) {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentDay, setCurrentDay] = useState(0);

  // Filter events by classroom if selected
  const filteredEvents = selectedClassroom
    ? events.filter((e) => e.classroomId === selectedClassroom)
    : events;

  // Get events for a specific day and time
  const getEventsForSlot = (dayIndex: number, timeSlot: string) => {
    return filteredEvents.filter(
      (event) =>
        event.dayOfWeek === dayIndex && event.startTime === timeSlot
    );
  };

  // Get teacher name
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.name || 'غير محدد';
  };

  // Working days (Sunday to Thursday)
  const workingDays = [0, 1, 2, 3, 4]; // Sunday to Thursday

  // Show empty state if no events
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <EmptyState
          title="لا يوجد جدول بعد"
          description="ابدأ بإضافة الحصص الدراسية لعرض الجدول الأسبوعي"
          icon={<Calendar className="w-10 h-10 text-gray-400" />}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">الجدول الأسبوعي</h2>

          <div className="flex items-center gap-3">
            {/* Classroom filter */}
            {classrooms.length > 0 && (
              <select
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedClassroom || ''}
                onChange={(e) => {/* Handle classroom change */ }}
              >
                <option value="">جميع الصفوف</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            )}

            {/* View mode toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                أسبوعي
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === 'day'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                يومي
              </button>
            </div>
          </div>
        </div>

        {/* Day navigation for day view */}
        {viewMode === 'day' && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentDay((prev) => (prev === 0 ? 4 : prev - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[100px] text-center">
              {DAYS_OF_WEEK_AR[workingDays[currentDay]]}
            </span>
            <button
              onClick={() => setCurrentDay((prev) => (prev === 4 ? 0 : prev + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        {viewMode === 'week' ? (
          // Week view
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 w-20">
                  الوقت
                </th>
                {workingDays.map((dayIndex) => (
                  <th
                    key={dayIndex}
                    className="px-4 py-3 text-center text-sm font-medium text-gray-500"
                  >
                    {DAYS_OF_WEEK_AR[dayIndex]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TIME_SLOTS.slice(0, 6).map((timeSlot) => (
                <tr key={timeSlot} className="divide-x divide-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-500 bg-gray-50">
                    {timeSlot}
                  </td>
                  {workingDays.map((dayIndex) => {
                    const slotEvents = getEventsForSlot(dayIndex, timeSlot);
                    return (
                      <td key={dayIndex} className="px-2 py-2 h-20">
                        {slotEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-2 rounded-lg text-xs h-full flex flex-col justify-center"
                            style={{
                              backgroundColor: `${event.color}15`,
                              borderRight: `3px solid ${event.color}`,
                            }}
                          >
                            <span
                              className="font-medium"
                              style={{ color: event.color }}
                            >
                              {event.title}
                            </span>
                            <span className="text-gray-500 text-[10px] mt-0.5 truncate">
                              {getTeacherName(event.teacherId)}
                            </span>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Day view
          <div className="p-4 space-y-3">
            {TIME_SLOTS.slice(0, 6).map((timeSlot) => {
              const slotEvents = getEventsForSlot(workingDays[currentDay], timeSlot);
              return (
                <div key={timeSlot} className="flex items-stretch gap-4">
                  <div className="w-16 text-sm text-gray-500 py-3">{timeSlot}</div>
                  <div className="flex-1 min-h-[60px]">
                    {slotEvents.length > 0 ? (
                      slotEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 rounded-xl h-full"
                          style={{
                            backgroundColor: `${event.color}15`,
                            borderRight: `4px solid ${event.color}`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="font-medium"
                              style={{ color: event.color }}
                            >
                              {event.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {getTeacherName(event.teacherId)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="h-full min-h-[60px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-400">لا توجد حصص</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
