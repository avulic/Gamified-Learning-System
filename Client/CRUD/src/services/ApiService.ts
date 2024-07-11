import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError } from '@/types/respons/Response';

const ApiService: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_DEV_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_API_KEY
    }
});

// Request interceptor
ApiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
ApiService.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        const apiResponse: ApiResponse = {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers as Record<string, string>
        };
        response.data = apiResponse;
        return response;
    },
    (error: AxiosError) => {
        const apiError: ApiError = {
            message: error.response?.data?.message || error.message,
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
            status: error.response?.status || 500
        };
        return Promise.reject(apiError);
    }
);

// Helper functions
function handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    return response.data;
}

function handleError(error: any): never {
    if (error.response) {
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
    } else if (error.request) {
        console.error("Error request:", error.request);
    } else {
        console.error("Error message:", error.message);
    }
    throw error;
}

// API methods
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    ApiService.get<ApiResponse<T>>(url, config).then(handleResponse).catch(handleError);

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    ApiService.post<ApiResponse<T>>(url, data, config).then(handleResponse).catch(handleError);

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    ApiService.put<ApiResponse<T>>(url, data, config).then(handleResponse).catch(handleError);

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    ApiService.delete<ApiResponse<T>>(url, config).then(handleResponse).catch(handleError);

export default ApiService;