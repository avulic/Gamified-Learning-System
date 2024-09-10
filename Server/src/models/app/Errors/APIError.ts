import { CustomError, HttpStatusCode } from './CustomError';

class APIError extends CustomError {
    constructor(message:string, httpCode = HttpStatusCode.INTERNAL_SERVER, isOperational = true, description = 'internal server error') {
        super(message, httpCode, description, isOperational);
    }
}