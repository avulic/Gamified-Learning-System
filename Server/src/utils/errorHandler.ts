// src/utils/errors/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../models/app/Errors/CustomError';
import Logger from './logger'; // Assume you have a logger utility


class ErrorHandler {
    private logger = new Logger();

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