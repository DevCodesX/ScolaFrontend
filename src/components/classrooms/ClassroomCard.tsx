import React from "react";
import { Users, BookOpen, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { mockTeachers } from '../../data/mockData';
import type { Classroom } from '../../types';

interface ClassroomCardProps {
  classroom: Classroom;
}

export function ClassroomCard({ classroom }: ClassroomCardProps) {
  const teacher = mockTeachers.find((t) => t.id === classroom.teacherId);
  const capacityPercentage = (classroom.studentCount / classroom.capacity) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{classroom.grade}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Teacher */}
        {teacher && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {teacher.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
              <p className="text-xs text-gray-500">المعلم المسؤول</p>
            </div>
          </div>
        )}

        {/* Students capacity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="w-4 h-4" />
              الطلاب
            </span>
            <span className="text-sm font-medium text-gray-900">
              {classroom.studentCount} / {classroom.capacity}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
        </div>

        {/* Subjects */}
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>المواد الدراسية</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {classroom.subjects.slice(0, 3).map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
              >
                {subject}
              </span>
            ))}
            {classroom.subjects.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                +{classroom.subjects.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit className="w-4 h-4" />
          تعديل
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
          حذف
        </button>
      </div>
    </div>
  );
}
