import config from './config';

// API Configuration
const API_BASE_URL = config.apiUrl;

// Request interceptor to add auth headers
const addAuthHeaders = (headers: Headers): Headers => {
    // For cookie-based auth, we don't need to manually add headers
    // The browser will automatically send cookies
    headers.set('Content-Type', 'application/json');
    return headers;
};

// Response interceptor for error handling
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
};

// Generic API request function
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);

    // Add auth headers
    addAuthHeaders(headers);

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include', // Important for cookie-based auth
    };

    try {
        const response = await fetch(url, config);
        return await handleResponse(response);
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};

// API methods for different HTTP verbs
export const api = {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint),

    post: <T>(endpoint: string, data?: any) =>
        apiRequest<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T>(endpoint: string, data?: any) =>
        apiRequest<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, {
            method: 'DELETE',
        }),

    patch: <T>(endpoint: string, data?: any) =>
        apiRequest<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),
};

export default api; 