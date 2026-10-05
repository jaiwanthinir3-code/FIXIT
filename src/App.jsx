import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';

// Common UI
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ReportComplaintPage from './pages/student/ReportComplaintPage';
import StudentComplaintsPage from './pages/student/StudentComplaintsPage';
import StudentComplaintDetailPage from './pages/student/StudentComplaintDetailPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

// Maintenance Staff Pages
import MaintenanceDashboard from './pages/maintenance/MaintenanceDashboard';
import MaintenanceComplaintsPage from './pages/maintenance/MaintenanceComplaintsPage';
import MaintenanceComplaintDetailPage from './pages/maintenance/MaintenanceComplaintDetailPage';
import MaintenanceNotificationsPage from './pages/maintenance/MaintenanceNotificationsPage';
import MaintenanceProfilePage from './pages/maintenance/MaintenanceProfilePage';
import MaintenanceInsightsPage from './pages/maintenance/MaintenanceInsightsPage';

// Global Loading Screen
function GlobalLoader() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-purple-600 flex items-center justify-center mb-4 shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <div className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      <p className="text-slate-400 text-xs font-medium mt-3">Connecting to Firebase...</p>
    </div>
  );
}

// Role Guard Wrapper
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading, isStudent, isStaff } = useAuth();

  if (loading) return <GlobalLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole === 'student' && !isStudent) {
    return <Navigate to="/maintenance/dashboard" replace />;
  }

  if (allowedRole === 'staff' && !isStaff) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

// Main App Layout
function MainLayout({ children }) {
  const { user } = useAuth();
  if (!user) return children;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

// Auth-aware root redirect
function RootRedirect() {
  const { user, loading, isStudent, isStaff } = useAuth();

  if (loading) return <GlobalLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (isStudent) return <Navigate to="/student/dashboard" replace />;
  if (isStaff) return <Navigate to="/maintenance/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Student Protected Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRole="student">
                <MainLayout><StudentDashboard /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/report" element={
              <ProtectedRoute allowedRole="student">
                <MainLayout><ReportComplaintPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/complaints" element={
              <ProtectedRoute allowedRole="student">
                <MainLayout><StudentComplaintsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/complaint/:id" element={
              <ProtectedRoute allowedRole="student">
                <MainLayout><StudentComplaintDetailPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/notifications" element={
              <ProtectedRoute allowedRole="student">
                <MainLayout><StudentNotificationsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRole="student">
                <MainLayout><StudentProfilePage /></MainLayout>
              </ProtectedRoute>
            } />

            {/* Maintenance Staff Protected Routes */}
            <Route path="/maintenance/dashboard" element={
              <ProtectedRoute allowedRole="staff">
                <MainLayout><MaintenanceDashboard /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/maintenance/complaints" element={
              <ProtectedRoute allowedRole="staff">
                <MainLayout><MaintenanceComplaintsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/maintenance/complaint/:id" element={
              <ProtectedRoute allowedRole="staff">
                <MainLayout><MaintenanceComplaintDetailPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/maintenance/insights" element={
              <ProtectedRoute allowedRole="staff">
                <MainLayout><MaintenanceInsightsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/maintenance/notifications" element={
              <ProtectedRoute allowedRole="staff">
                <MainLayout><MaintenanceNotificationsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/maintenance/profile" element={
              <ProtectedRoute allowedRole="staff">
                <MainLayout><MaintenanceProfilePage /></MainLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ComplaintProvider>
    </AuthProvider>
  );
}

export default App;
