import { HttpStatusCode } from '@/models/enums';
import { CustomError } from './CustomError';

// Use for: Authentication failures
// Example: Invalid login credentials, expired tokens
// UnauthorizedError (401)
export class UnauthorizedError extends CustomError {
    constructor(message: string) {
        super(HttpStatusCode.UNAUTHORIZED, message, 'UNAUTHORIZED', true);
    }
}
