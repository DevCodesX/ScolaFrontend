import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  Building2,
  ClipboardCheck,
  Settings,
  LogOut,
  CheckSquare,
  Award,
  Calendar,
  BookOpen,
  BookMarked,
  UserCog
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { getUser, logout } from '../../services/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminNavItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/' },
  { icon: Building2, label: 'المؤسسة', path: '/institution' },
  { icon: Users, label: 'المعلمون', path: '/teachers' },
  { icon: GraduationCap, label: 'الطلاب', path: '/students' },
  { icon: CalendarDays, label: 'الصفوف', path: '/classrooms' },
  { icon: Calendar, label: 'الجدول الأسبوعي', path: '/timetable' },
  { icon: ClipboardCheck, label: 'الجدول القديم', path: '/schedule' },
  { icon: BookOpen, label: 'الدورات', path: '/courses' },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/teacher' },
  { icon: GraduationCap, label: 'طلابي', path: '/teacher/students' },
  { icon: CalendarDays, label: 'صفوفي', path: '/teacher/classes' },
  { icon: CheckSquare, label: 'الحضور', path: '/teacher/attendance' },
  { icon: Award, label: 'الدرجات', path: '/teacher/grades' },
  { icon: Calendar, label: 'جدولي', path: '/teacher/timetable' },
  { icon: UserCog, label: 'إدارة الطلاب', path: '/teacher/student-mgmt' },
  { icon: BookOpen, label: 'الدورات', path: '/courses' },
];

const bottomNavItems = [
  { icon: Settings, label: 'الإعدادات', path: '/settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const user = getUser();
  const isTeacher = user?.role === 'teacher';
  const navItems = isTeacher ? teacherNavItems : adminNavItems;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              سكولا
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className={clsx(
            "text-xs font-medium text-center py-1 px-2 rounded-full",
            isTeacher
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          )}>
            {isTeacher ? '👨‍🏫 معلم' : '👮 مدير'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col h-[calc(100%-8rem)]">
          <div className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Bottom navigation */}
          <div className="border-t border-gray-200 pt-4 space-y-1">
            {!isTeacher && bottomNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
