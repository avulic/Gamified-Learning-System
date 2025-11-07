import { ApiError, ApiResponse, ApiRequest, PaginatedResponse } from '@/types/respons/Response';
import axios, { 
    AxiosInstance, 
    AxiosResponse, 
    AxiosError, 
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
    AxiosHeaders
} from 'axios';

class ApiService {
    private static instance: ApiService;
    private axiosInstance: AxiosInstance;
    private readonly defaultTimeout = 30000;

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_DEV_BASE_URL,
            timeout: this.defaultTimeout,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": import.meta.env.VITE_API_KEY
            },
            validateStatus: (status) => status >= 200 && status < 300
        });
        this.initializeInterceptors();
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    private initializeInterceptors(): void {
        this.axiosInstance.interceptors.request.use(
            this.handleRequestInterceptor.bind(this),
            this.handleRequestError.bind(this)
        );

        this.axiosInstance.interceptors.response.use(
            this.handleResponseInterceptor.bind(this),
            this.handleResponseError.bind(this)
        );
    }

    private handleRequestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers = config.headers || new AxiosHeaders();
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        
        // Add request timestamp for tracking
        config.metadata = { startTime: new Date() };
        
        return config;
    }

    private handleRequestError(error: unknown): Promise<ApiError> {
        return Promise.reject(this.createApiError(error));
    }

    private handleResponseInterceptor(response: AxiosResponse): AxiosResponse {
        const endTime = new Date();
        const startTime = response.config.metadata?.startTime;
        const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

        // Log response time if it exceeds threshold
        if (duration > 5000) {
            console.warn(`API call to ${response.config.url} took ${duration}ms`);
        }

        const apiResponse: ApiResponse = {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers as Record<string, string>
        };
        
        response.data = apiResponse;
        return response;
    }

    private handleResponseError(error: AxiosError): Promise<ApiError> {
        const apiError = this.handleErrorInterceptor(error);
        
        // Handle specific error cases
        if (apiError.status === 401) {
            // Handle unauthorized access
            this.handleUnauthorized();
        }
        
        return Promise.reject(apiError);
    }

    private handleUnauthorized(): void {
        localStorage.removeItem('auth_token');
        // You can emit an event or use your state management solution
        window.dispatchEvent(new CustomEvent('unauthorized'));
    }

    private handleErrorInterceptor(error: AxiosError): ApiError {
        if (error.response) {
            return {
                message: error.response.statusText || 'Server Error',
                code: error.code || 'SERVER_ERROR',
                status: error.response.status || 500
            };
        }
        
        if (error.request) {
            return {
                message: 'Network Error',
                code: 'NETWORK_ERROR',
                status: 0
            };
        }

        return {
            message: error.message || 'Unknown Error',
            code: 'UNKNOWN_ERROR',
            status: 500
        };
    }

    private createApiError(error: unknown): ApiError {
        if (this.isApiError(error)) return error;
        
        return {
            message: error instanceof Error ? error.message : 'Unknown Error',
            code: 'UNKNOWN_ERROR',
            status: 500
        };
    }

    private isApiError(error: any): error is ApiError {
        return (
            error &&
            typeof error.message === 'string' &&
            typeof error.code === 'string' &&
            typeof error.status === 'number'
        );
    }

    private serializeParams(params: Record<string, any>): URLSearchParams {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Handle array values
                value.forEach(item => {
                    searchParams.append(`${key}[]`, String(item));
                });
            } else if (value !== null && value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        return searchParams;
    }

    // Generic request method to handle all types of requests
    public async request<T>(config: ApiRequest<T>): Promise<ApiResponse<T>> {
        const { endpoint, method, data, params, headers } = config;
        
        const axiosConfig: AxiosRequestConfig = {
            url: endpoint,
            method,
            headers,
            ...(params && { params: this.serializeParams(params) }),
            ...(data && { data })
        };

        const response = await this.axiosInstance.request<ApiResponse<T>>(axiosConfig);
        return response.data;
    }

    // Specialized methods for different HTTP methods
    public async get<T>(endpoint: string, config?: Omit<ApiRequest<never>, 'endpoint' | 'method'>): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, endpoint, method: 'GET' });
    }

    public async post<T>(endpoint: string, data?: any, config?: Omit<ApiRequest<T>, 'endpoint' | 'method' | 'data'>): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, endpoint, method: 'POST', data });
    }

    public async put<T>(endpoint: string, data?: any, config?: Omit<ApiRequest<T>, 'endpoint' | 'method' | 'data'>): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, endpoint, method: 'PUT', data });
    }

    public async delete<T>(endpoint: string, config?: Omit<ApiRequest<never>, 'endpoint' | 'method'>): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, endpoint, method: 'DELETE' });
    }

    public async patch<T>(endpoint: string, data?: any, config?: Omit<ApiRequest<T>, 'endpoint' | 'method' | 'data'>): Promise<ApiResponse<T>> {
        return this.request<T>({ ...config, endpoint, method: 'PATCH', data });
    }

    // Utility method for paginated requests
    public async getPaginated<T>(
        endpoint: string,
        page: number,
        pageSize: number,
        config?: Omit<ApiRequest<never>, 'endpoint' | 'method'>
    ): Promise<ApiResponse<PaginatedResponse<T>>> {
        const params = {
            ...config?.params,
            page: String(page),
            pageSize: String(pageSize)
        };
        
        return this.get<PaginatedResponse<T>>(endpoint, { ...config, params });
    }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
