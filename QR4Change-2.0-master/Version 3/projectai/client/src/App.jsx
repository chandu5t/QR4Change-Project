import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home/Home'));
const SignUp = lazy(() => import('./components/SignUp/Signup'));
const SignIn = lazy(() => import('./components/SignIn/Signin'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const ComplaintForm = lazy(() => import('./components/ComplaintForm/ComplaintForm'));
const AdminLogin = lazy(() => import('./admin/AdminLogin/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard/AdminDashboard'));
const PublicDashboard = lazy(() => import('./components/Public Dashboard/PublicDashboard'));

// Enhanced App component with modern features
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-500">
            <Toaster 
              position="top-right" 
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<SignIn />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/complaint-form" element={<ComplaintForm />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/public/dashboard" element={<PublicDashboard />} />
                </Routes>
              </Suspense>
            </Router>
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
