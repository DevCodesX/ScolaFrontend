// User roles in the system
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

// Base user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

// Teacher specific interface
export interface Teacher extends User {
  role: 'teacher';
  subjects: string[];
  classroomIds: string[];
}

// Student specific interface
export interface Student extends User {
  role: 'student';
  classroomId: string;
  parentId?: string;
  grade: string;
}

// Parent specific interface
export interface Parent extends User {
  role: 'parent';
  studentIds: string[];
}

// Institution interface
export interface Institution {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  createdAt: Date;
  adminId: string;
}

// Classroom interface
export interface Classroom {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacherId: string;
  studentCount: number;
  capacity: number;
  subjects: string[];
}

// Schedule event interface
export interface ScheduleEvent {
  id: string;
  title: string;
  classroomId: string;
  teacherId: string;
  subject: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  color: string;
}

// Days of the week in Arabic
export const DAYS_OF_WEEK_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

// Time slots for schedule
export const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
];
