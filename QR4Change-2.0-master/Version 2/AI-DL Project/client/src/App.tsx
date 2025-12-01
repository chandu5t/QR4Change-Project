import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store';
import { refreshUserData } from './store/slices/authSclice';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthorityRegisterPage from './pages/auth/AuthorityRegisterPage';
import Dashboard from './pages/user/Dashboard';
import MyComplaints from './pages/user/MyComplaints';
import ComplaintForm from './components/forms/ComplaintForm';
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AuthorityComplaints from './pages/authority/AuthorityComplaints';
import QRCodeManagement from './pages/authority/QRCodeManagement';
import QRDemo from './pages/QRDemo';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Refresh user data when app loads if token exists
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(refreshUserData());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="authority/register" element={<AuthorityRegisterPage />} />

              {/* User Protected Routes */}
              <Route path="dashboard" element={
                <ProtectedRoute userOnly>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="file-complaint" element={
                <ProtectedRoute userOnly>
                  <ComplaintForm />
                </ProtectedRoute>
              } />
              
              <Route path="my-complaints" element={
                <ProtectedRoute userOnly>
                  <MyComplaints />
                </ProtectedRoute>
              } />

              {/* Authority Protected Routes */}
              <Route path="authority/dashboard" element={
                <ProtectedRoute authorityOnly>
                  <AuthorityDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="authority/complaints" element={
                <ProtectedRoute authorityOnly>
                  <AuthorityComplaints />
                </ProtectedRoute>
              } />
              
              <Route path="authority/qr-codes" element={
                <ProtectedRoute authorityOnly>
                  <QRCodeManagement />
                </ProtectedRoute>
              } />

              {/* Demo Route */}
              <Route path="qr-demo" element={<QRDemo />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </div>
      </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;