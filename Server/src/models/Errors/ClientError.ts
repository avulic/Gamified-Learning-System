import { CustomError } from './CustomError';

export class ClientError extends CustomError {
    constructor(message: string) {
        super(message, 400);
    }
}