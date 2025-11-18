import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import ClassTeacherDashboard from '@/pages/ClassTeacherDashboard';
import StaffDashboard from '@/pages/StaffDashboard';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>College Attendance Management System</title>
          <meta name="description" content="Comprehensive attendance management system for colleges with role-based access for admins, class teachers, and staff" />
        </Helmet>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/class-teacher" 
            element={
              <ProtectedRoute allowedRoles={['class-teacher']}>
                <ClassTeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;