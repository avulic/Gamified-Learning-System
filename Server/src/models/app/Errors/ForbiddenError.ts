import { HttpStatusCode } from '@/models/enums';
import { CustomError } from './CustomError';

// Use for: Permission-based access control
// Example: Student trying to access instructor features, accessing unpublished content
// ForbiddenError (403)
export class ForbiddenError extends CustomError {
    constructor(message: string) {
        super(HttpStatusCode.FORBIDDEN, message, 'FORBIDDEN', true);
    }
}
