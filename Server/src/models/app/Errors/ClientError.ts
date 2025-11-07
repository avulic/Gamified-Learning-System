import { HttpStatusCode } from '@/models/enums';
import { CustomError } from './CustomError';

// Use for: Input validation, wrong data format, missing required fields
// Example: Invalid course enrollment dates, wrong file format for assignments
// ClientError (400)
export class ClientError extends CustomError {
    constructor(message: string, code = 'CLIENT_ERROR', details?: Record<string, unknown>) {
        super(HttpStatusCode.BAD_REQUEST, message, code, true, details);
    }
}

export class ValidationError extends ClientError {
    constructor(message: string, details: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', details);
    }
}