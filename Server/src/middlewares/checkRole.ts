// src/middlewares/authorizeRoles.ts

//OPTIONAL middleware to check if user has one of the allowed roles, but Casbian remains the source of truth for roles/permissions, bussiness logic 

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@/models/app/Errors/ForbiddenError';
import { UserToken } from '@/models/app/User.entity';

export const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user as UserToken;
        if (!user) return next(new ForbiddenError('User not authenticated'));

        const hasRole = user.roles?.some(role => allowedRoles.includes(role));
        if (!hasRole) return next(new ForbiddenError('Insufficient permissions'));

        next();
    };
};
