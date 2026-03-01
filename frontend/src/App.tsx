import React from "react";
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import { isAuthenticated, getUser } from './services/authService';
import {
  Dashboard,
  InstitutionPage,
  InstitutionsPage,
  TeachersPage,
  StudentsPage,
  ClassroomsPage,
  SchedulePage,
  SettingsPage,
  LoginPage,
  TeacherDashboard,
  AttendancePage,
  GradesPage,
  TeacherTimetablePage,
  AdminTimetablePage,
  CoursesPage,
  TeacherRegisterPage,
  InstitutionRegisterPage,
  EmailVerificationPage,
  InstitutionDashboardPage,
  AcceptInvitePage,
  TeacherStudentsPage,
  TeacherClassesPage
} from './pages';
import JoinTeacherPage from './pages/JoinTeacherPage';
import TeacherStudentMgmtPage from './pages/TeacherStudentMgmtPage';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Admin only route — accepts both 'admin' and 'institution_admin' roles
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'institution_admin';
  if (!isAdmin) {
    return <Navigate to="/teacher" replace />;
  }
  return <>{children}</>;
}

// Teacher only route
function TeacherRoute({ children }: { children: React.ReactNode }) {
  const user = getUser();
  if (user?.role !== 'teacher') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// Smart redirect based on role
function RoleRedirect() {
  const user = getUser();
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }
  // admin and institution_admin both see the Dashboard
  return <Dashboard />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/teacher" element={<TeacherRegisterPage />} />
        <Route path="/register/institution" element={<InstitutionRegisterPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/join/:token" element={<JoinTeacherPage />} />
        <Route path="/join" element={<JoinTeacherPage />} />

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Smart home redirect */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin routes */}
          <Route path="/institution" element={<AdminRoute><InstitutionPage /></AdminRoute>} />
          <Route path="/institutions" element={<AdminRoute><InstitutionsPage /></AdminRoute>} />
          <Route path="/teachers" element={<AdminRoute><TeachersPage /></AdminRoute>} />
          <Route path="/students" element={<AdminRoute><StudentsPage /></AdminRoute>} />
          <Route path="/classrooms" element={<AdminRoute><ClassroomsPage /></AdminRoute>} />
          <Route path="/schedule" element={<AdminRoute><SchedulePage /></AdminRoute>} />
          <Route path="/timetable" element={<AdminRoute><AdminTimetablePage /></AdminRoute>} />
          <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          <Route path="/courses" element={<CoursesPage />} />

          {/* Institution dashboard (admin) */}
          <Route path="/institution-dashboard" element={<AdminRoute><InstitutionDashboardPage /></AdminRoute>} />

          {/* Teacher routes */}
          <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/teacher/students" element={<TeacherRoute><TeacherStudentsPage /></TeacherRoute>} />
          <Route path="/teacher/classes" element={<TeacherRoute><TeacherClassesPage /></TeacherRoute>} />
          <Route path="/teacher/attendance" element={<TeacherRoute><AttendancePage /></TeacherRoute>} />
          <Route path="/teacher/grades" element={<TeacherRoute><GradesPage /></TeacherRoute>} />
          <Route path="/teacher/timetable" element={<TeacherRoute><TeacherTimetablePage /></TeacherRoute>} />
          <Route path="/teacher/student-mgmt" element={<TeacherRoute><TeacherStudentMgmtPage /></TeacherRoute>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;

