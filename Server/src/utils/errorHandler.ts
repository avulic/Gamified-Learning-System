// src/utils/errors/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../models/app/Errors/CustomError';

import loggerInstance from '@/utils/logger';


class ErrorHandler {
    private logger = loggerInstance;

    public handleError(error: Error): void {
        this.logger.error(error);

        //await sendMailToAdminIfCritical();
        //await sendEventsToSentry();
    }

    public isTrustedError(error: Error): boolean {
        if (error instanceof CustomError) {
            return error.isOperational;
        }
        return false;
    }
}

export default new ErrorHandler();