import React from "react";
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import {
  Dashboard,
  InstitutionPage,
  TeachersPage,
  StudentsPage,
  ClassroomsPage,
  SchedulePage,
  SettingsPage
} from './pages';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/institution" element={<InstitutionPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/classrooms" element={<ClassroomsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
