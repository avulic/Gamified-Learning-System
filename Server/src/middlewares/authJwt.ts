// src/middlewares/authJwt.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { authConfig } from '@/config/authConfig';
import { UnauthorizedError } from '@/models/app/Errors/UnauthorizedError';
import { ForbiddenError } from '@/models/app/Errors/ForbiddenError';
import { UserToken } from '@/models/app/User.entity';

export interface CustomRequest extends Request {
    token: JwtPayload;
    user: UserToken;
}

/**
 * Middleware: verifies JWT and attaches req.user
 */
export const authJwt = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) throw new UnauthorizedError('No Authorization header');

        const token = authHeader.split(' ')[1];
        if (!token) throw new UnauthorizedError('No token provided');

        const decoded = jwt.verify(token, authConfig.JWT_SECRET!, {
            complete: false,
            audience: authConfig.JWT_AUDIENCE,
            issuer: authConfig.JWT_ISSUER,
            algorithms: ['HS256']
        }) as JwtPayload;

        // normalize fields
        const id = decoded.id;
        if (!id) throw new ForbiddenError('Invalid token payload (missing id)');

        const roles = Array.isArray(decoded.roles)
            ? decoded.roles
            : decoded.role
                ? [decoded.role]
                : [];

        const user: UserToken = {
            id: id as string,
            username: decoded.username as string,
            roles,
            attrs: decoded.attrs || {}
        };

        // Attach to request
        (req as CustomRequest).token = decoded;
        (req as CustomRequest).user = user;

        next();
    } catch (err: any) {
        next(new UnauthorizedError('Invalid or expired token'));
    }
};
