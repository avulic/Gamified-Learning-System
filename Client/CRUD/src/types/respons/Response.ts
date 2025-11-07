export interface ApiRequest<T = any> {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: T;
    params?: Record<string, string | number | boolean | Array<string | number>>;
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



// types/auth/AuthResponse.ts
export interface AuthResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    status: number;
}

// types/auth/AuthError.ts
export class AuthError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message);
        this.name = 'AuthError';
    }
}