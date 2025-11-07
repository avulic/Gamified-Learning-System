import { HttpStatusCode } from '@/models/enums';
import { CustomError } from './CustomError';

export enum ServerErrorCode {
    GENERAL = 'SERVER_ERROR',
    DATABASE = 'DB_ERROR',
    NETWORK = 'NETWORK_ERROR',
    FILE_SYSTEM = 'FS_ERROR',
    MEMORY = 'MEMORY_ERROR'
}

export const ServerErrorMessages = {
    GENERAL: 'An internal server error occurred',
    DATABASE: 'Database operation failed',
    NETWORK: 'Network operation failed',
    FILE_SYSTEM: 'File system operation failed',
    MEMORY: 'Memory operation failed'
} as const;


// Use for: Unhandled server-side errors
// Example: Database transaction failures, file system errors
// ServerError (500)
export class ServerError extends CustomError {
    constructor(
        message: string = ServerErrorMessages.GENERAL,
        code: ServerErrorCode = ServerErrorCode.GENERAL,
        details?: Record<string, unknown>
    ) {
        super(
            HttpStatusCode.INTERNAL_SERVER, 
            message, 
            code,
            false,  // Not operational - requires developer attention
            details
        );
        
        Object.setPrototypeOf(this, ServerError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    public static fromError(error: Error): ServerError {
        return new ServerError(
            error.message,
            ServerErrorCode.GENERAL,
            { originalError: error.stack }
        );
    }
}


export class DatabaseError extends ServerError {
    constructor(message: string) {
        super(`Database error: ${message}`, ServerErrorCode.DATABASE);
    }
}

export class FileSystemError extends ServerError {
    constructor(message: string) {
        super(`File system error: ${message}`, ServerErrorCode.FILE_SYSTEM);
    }
}

export class ConfigurationError extends ServerError {
    constructor(message: string) {
        super(`Configuration error: ${message}`, ServerErrorCode.GENERAL);
    }
}

export class ServiceUnavailableError extends ServerError {
    constructor(service: string) {
        super(`Service unavailable: ${service}`, ServerErrorCode.GENERAL);
    }
}

export class TimeoutError extends ServerError {
    constructor(operation: string) {
        super(`Operation timed out: ${operation}`, ServerErrorCode.NETWORK);
    }
}

export class MemoryError extends ServerError {
    constructor(message: string) {
        super(`Memory error: ${message}`, ServerErrorCode.MEMORY);
    }
}