export interface ApiRequest<T = any> {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: T;
    params?: Record<string, string | number>;
    headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

export interface ApiError {
    message: string;
    code: string;
    status: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}