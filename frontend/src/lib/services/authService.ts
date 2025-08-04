import api from '@/lib/api';
import { User } from '@/types';

// Auth service interface
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    message: string;
    token?: string; // Optional for cookie-based auth
}

// Auth service class
class AuthService {
    // Login user
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return api.post<AuthResponse>('/auth/login', credentials);
    }

    // Register user
    async register(userData: RegisterData): Promise<AuthResponse> {
        return api.post<AuthResponse>('/auth/register', userData);
    }

    // Logout user
    async logout(): Promise<{ message: string }> {
        return api.post<{ message: string }>('/auth/logout');
    }

    // Get current user profile
    async getProfile(): Promise<AuthResponse> {
        return api.get<AuthResponse>('/auth/me');
    }

    // Check if user is authenticated
    async checkAuth(): Promise<boolean> {
        try {
            await api.get<AuthResponse>('/auth/me');
            return true;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 