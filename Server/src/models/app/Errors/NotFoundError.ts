import { HttpStatusCode } from '@/models/enums';
import { CustomError } from './CustomError';

// Use for: Resource doesn't exist
// Example: Course, assignment, or user not found
// NotFoundError (404)
export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(HttpStatusCode.NOT_FOUND, message, 'NOT_FOUND', true);
    }
}
