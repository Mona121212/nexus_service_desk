import { useState, useEffect, useCallback } from 'react';
import { login as loginApi } from '../api/auth';
import { getUserRolesFromToken, getApplicationConfiguration, ApplicationConfiguration } from '../api/user';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [appConfig, setAppConfig] = useState<ApplicationConfiguration | null>(null);

  /**
   * Fetch user permissions from ApplicationConfiguration
   */
  const fetchPermissions = useCallback(async (): Promise<void> => {
    try {
      const config = await getApplicationConfiguration();
      setAppConfig(config);
      
      // Extract permissions from auth.grantedPermissions or auth.grantedPolicies
      const grantedPermissions = config.auth?.grantedPermissions || config.auth?.grantedPolicies || {};
      setPermissions(grantedPermissions);
      
      // Store permissions in localStorage for quick access
      localStorage.setItem('user_permissions', JSON.stringify(grantedPermissions));
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setPermissions({});
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await loginApi(username, password);
      localStorage.setItem('access_token', token);
      
      // Fetch permissions after successful login
      // Don't block login if permission fetch fails
      try {
        await fetchPermissions();
      } catch (permError) {
        // Log error but don't fail login
        console.warn('Failed to fetch permissions after login, but continuing:', permError);
      }
      
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
    localStorage.removeItem('user_permissions');
    setPermissions({});
    setAppConfig(null);
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

  /**
   * Check if user has a specific permission
   * @param permission The permission string to check (e.g., 'ServiceDesk.RepairRequests.AdminList')
   * @returns true if user has the permission, false otherwise
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!permission) return false;
    
    // Check in-memory permissions first
    if (permissions[permission]) {
      return true;
    }
    
    // Fallback to localStorage if permissions not loaded yet
    try {
      const storedPermissions = localStorage.getItem('user_permissions');
      if (storedPermissions) {
        const parsed = JSON.parse(storedPermissions);
        return parsed[permission] === true;
      }
    } catch (err) {
      console.error('Error reading permissions from localStorage:', err);
    }
    
    return false;
  }, [permissions]);

  /**
   * Check if user has any of the provided permissions
   * @param permissionList Array of permission strings
   * @returns true if user has at least one permission, false otherwise
   */
  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  /**
   * Check if user has all of the provided permissions
   * @param permissionList Array of permission strings
   * @returns true if user has all permissions, false otherwise
   */
  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Load permissions from localStorage on mount if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Try to load from localStorage first
      try {
        const storedPermissions = localStorage.getItem('user_permissions');
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions));
        } else {
          // If not in localStorage, fetch from server
          fetchPermissions();
        }
      } catch (err) {
        console.error('Error loading permissions from localStorage:', err);
        fetchPermissions();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    login,
    logout,
    isLoggedIn,
    getToken,
    getUserRoles,
    getUserRole,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
    fetchPermissions,
  };
};
