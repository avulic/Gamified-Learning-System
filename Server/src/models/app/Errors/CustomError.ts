import { HttpStatusCode } from "@/models/enums";

export class CustomError extends Error {
    public readonly status: HttpStatusCode;
    public readonly code: string;
    public readonly isOperational: boolean;
    public readonly details?: Record<string, unknown>;

    constructor(
        status: HttpStatusCode,
        message: string,
        code = 'INTERNAL_ERROR',
        isOperational = true,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.status = status;
        this.code = code;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export interface IResponseError {
    status: number;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
}


export class ConflictError extends CustomError {
    constructor(message: string) {
        super(HttpStatusCode.CONFLICT, message, 'CONFLICT', true);
    }
}
