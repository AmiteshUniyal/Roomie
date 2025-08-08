import config from './config';

// API Configuration
const API_BASE_URL = config.apiUrl;

const addAuthHeaders = (headers: Headers): Headers => {
    headers.set('Content-Type', 'application/json');
    return headers;
};

const handleResponse = async (response: Response) => {
    const data = await response.json().catch(() => ({ message: 'Network error' }));

    if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
    }

    // Add status code to successful responses
    return {
        ...data,
        statusCode: response.status
    };
};

export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);

    addAuthHeaders(headers);

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
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

    post: <T>(endpoint: string, data?: unknown) =>
        apiRequest<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T>(endpoint: string, data?: unknown) =>
        apiRequest<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, {
            method: 'DELETE',
        }),

    patch: <T>(endpoint: string, data?: unknown) =>
        apiRequest<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),
};

export default api; 