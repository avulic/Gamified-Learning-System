import { Request, Response, NextFunction } from 'express';
import { CustomError, IResponseError } from '../models/app/Errors/CustomError';

import ErrorHandler from '../utils/errorHandler';
import { HttpStatusCode } from '@/models/enums';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err);
    
    const customError = err instanceof CustomError 
        ? err 
        : new CustomError(
            HttpStatusCode.INTERNAL_SERVER,
            'An unexpected error occurred',
            'INTERNAL_ERROR',
            false
        );

    const response: IResponseError = {
        status: customError.status,
        message: customError.message,
        code: customError.code
    };

    if (customError.details) {
        response.details = customError.details;
    }

    if (!customError.isOperational) {
        response.message = HttpStatusCode[HttpStatusCode.INTERNAL_SERVER];
    }

    res.status(customError.status).json(response);
};

export default errorHandler;