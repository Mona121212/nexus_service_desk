import http from './http';
import { User } from '../types/common';
import axios from 'axios';

/**
 * ApplicationConfiguration interface from ABP
 */
export interface ApplicationConfiguration {
  auth: {
    grantedPolicies?: Record<string, boolean>;
    grantedPermissions?: Record<string, boolean>;
  };
  [key: string]: any;
}

/**
 * Get current user profile information
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await http.get<User>('/api/account/my-profile');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to fetch user profile';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Get user roles from JWT token
 * Note: This is a simple implementation that decodes the JWT token
 * For production, you should use a proper JWT library
 */
export const getUserRolesFromToken = (): string[] => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return [];
    }

    // Decode JWT token (simple base64 decode)
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return [];
    }

    const payload = JSON.parse(atob(parts[1]));
    
    // ABP stores roles in different possible locations
    if (payload.role) {
      return Array.isArray(payload.role) ? payload.role : [payload.role];
    }
    if (payload.roles) {
      return Array.isArray(payload.roles) ? payload.roles : [payload.roles];
    }
    if (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    }

    return [];
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
};

/**
 * Get ApplicationConfiguration from ABP backend
 * This includes user permissions in auth.grantedPermissions
 */
export const getApplicationConfiguration = async (): Promise<ApplicationConfiguration> => {
  try {
    const response = await http.get<ApplicationConfiguration>('/api/abp/application-configuration');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message 
        || error.message 
        || 'Failed to fetch application configuration';
      throw new Error(message);
    }
    throw error;
  }
};
