import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // Check if user is logged in by checking token in localStorage
  // This is a synchronous check and won't cause redirect loops
  const token = localStorage.getItem('access_token');
  
  // Show loading state only if explicitly loading (not just checking token)
  // This prevents redirect loop when permissions are being fetched
  if (isLoading && !token) {
    return <div>Loading...</div>;
  }

  if (!token) {
    console.log('ProtectedRoute: No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Token found, allowing access');
  return <>{children}</>;
};
