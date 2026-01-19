import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StudentDashboard from './components/Student/Dashboard';
import ReportIncident from './components/Student/ReportIncident';
import MyReports from './components/Student/MyReports';

import AdminDashboard from './components/Admin/AdminDashboard';
import ManageReports from './components/Admin/ManageReports';
import Analytics from './components/Admin/Analytics';

import AwarenessHub from './components/Shared/AwarenessHub';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Student Routes */}
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="report" element={<ReportIncident />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="awareness" element={<AwarenessHub />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <ManageReports />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
