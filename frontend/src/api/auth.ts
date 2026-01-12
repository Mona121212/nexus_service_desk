import http from './http';
import { LoginResponse } from '../types/common';

/**
 * Performs user login using OAuth2 Password Grant
 */
export const login = async (username: string, password: string): Promise<string> => {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('username', username);
        params.append('password', password);

        // Client ID must match the OpenIddictApplications table in your database
        params.append('client_id', 'ServiceDesk_Swagger');

        // Required scopes for ABP and ServiceDesk API
        params.append('scope', 'ServiceDesk roles profile email offline_access');

        const response = await http.post<LoginResponse>('/connect/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Explicitly clear Authorization header to prevent browser Basic Auth prompts
                // and avoid conflict with interceptors during the login phase
                'Authorization': ''
            },
        });

        // Store token in localStorage if needed, or handle it in the calling component
        const accessToken = response.data.access_token;
        if (accessToken) {
            localStorage.setItem('access_token', accessToken);
        }

        return accessToken;
    } catch (error) {
        // Detailed error logging can be added here
        console.error('Login failed:', error);
        throw error;
    }
};