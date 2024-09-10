import { CustomError } from './CustomError';

export class ServerError extends CustomError {
    constructor(message: string) {
        super(message, 500);
    }
}