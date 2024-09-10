import { Request, Response, NextFunction } from 'express';
import { CustomError, HttpStatusCode, IResponseError } from '../models/app/Errors/CustomError';

import ErrorHandler from '../utils/errorHandler';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    ErrorHandler.handleError(err);
    
    const isTrusted = ErrorHandler.isTrustedError(err);
    const httpStatusCode = isTrusted ? (err as CustomError).status : HttpStatusCode.INTERNAL_SERVER;
    
    const responseError = isTrusted ? err.message : HttpStatusCode[HttpStatusCode.INTERNAL_SERVER];

    res.status(httpStatusCode).json({
        error: responseError,
    });
}

export default errorHandler;