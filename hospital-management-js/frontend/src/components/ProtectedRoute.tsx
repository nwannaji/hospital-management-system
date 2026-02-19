import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredResource?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredResource,
  fallbackPath = '/login' 
}) => {
  const { user, isAuthenticated, hasRole, hasAnyRole, canAccess, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      if (!hasAnyRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      if (!hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // Check resource-based access
  if (requiredResource && !canAccess(requiredResource)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
