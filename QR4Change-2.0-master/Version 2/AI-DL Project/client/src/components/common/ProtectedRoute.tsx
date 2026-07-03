import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  authorityOnly?: boolean;
  userOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  authorityOnly = false,
  userOnly = false,
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  
  // Get userType from Redux state instead of localStorage
  const userType = user?.role || localStorage.getItem('userType');

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authorityOnly && userType !== 'authority') {
    return <Navigate to="/dashboard" replace />;
  }

  if (userOnly && userType !== 'user') {
    return <Navigate to="/authority/dashboard" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;