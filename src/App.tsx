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
  AdminTimetablePage
} from './pages';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Admin only route
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = getUser();
  if (user?.role !== 'admin') {
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
  return <Dashboard />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

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

          {/* Teacher routes */}
          <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/teacher/attendance" element={<TeacherRoute><AttendancePage /></TeacherRoute>} />
          <Route path="/teacher/grades" element={<TeacherRoute><GradesPage /></TeacherRoute>} />
          <Route path="/teacher/timetable" element={<TeacherRoute><TeacherTimetablePage /></TeacherRoute>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
