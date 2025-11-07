import { HttpStatusCode } from '@/models/enums';
import { CustomError } from './CustomError';

// Use for: External API failures, integration errors
// Example: Failed third-party service calls, database connection issues
// ApiError (500)
export class ApiError extends CustomError {
    constructor(message: string) {
        super(HttpStatusCode.INTERNAL_SERVER, message, 'API_ERROR', false);
    }
}