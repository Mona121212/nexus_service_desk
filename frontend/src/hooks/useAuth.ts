import { useState } from 'react';
import { login as loginApi } from '../api/auth';
import { getUserRolesFromToken } from '../api/user';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await loginApi(username, password);
      localStorage.setItem('access_token', token);
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      let errorMessage = 'Login failed';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Handle specific error cases
        if (err.message.includes('504') || err.message.includes('timeout')) {
          errorMessage = 'Connection timeout. Please check if the backend server is running.';
        } else if (err.message.includes('401') || err.message.includes('invalid_grant')) {
          errorMessage = 'Invalid username or password.';
        } else if (err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running on https://localhost:44338';
        }
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
  };

  const isLoggedIn = (): boolean => {
    return !!localStorage.getItem('access_token');
  };

  const getToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  const getUserRoles = (): string[] => {
    return getUserRolesFromToken();
  };

  const getUserRole = (): string | null => {
    const roles = getUserRolesFromToken();
    // Return the first role, or null if no roles
    return roles.length > 0 ? roles[0] : null;
  };

  return {
    login,
    logout,
    isLoggedIn,
    getToken,
    getUserRoles,
    getUserRole,
    isLoading,
    error,
  };
};
