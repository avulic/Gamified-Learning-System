import { log, error } from 'console';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../models/Errors/CustomError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof CustomError) {
        const { statusCode, errors, logging } = err;
        if (logging) {
            error(JSON.stringify({
                code: err.statusCode,
                errors: err.errors,
                stack: err.stack,
            }, null, 2));
        }

        return res.status(statusCode).send({ errors });
    }

    // Unhandled errors
    error(JSON.stringify(err, null, 2));
    return res.status(500).send({ errors: [{ message: "Something went wrong" }] });
}