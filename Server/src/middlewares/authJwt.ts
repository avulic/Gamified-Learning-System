
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import { UnauthorizedError } from '../models/app/Errors/UnauthorizedError';
import { ForbiddenError } from '../models/app/Errors/ForbiddenError';



export interface CustomRequest extends Request {
    token: JwtPayload;
}


export const authJwt = (req: Request, res: Response, next: NextFunction): void => {
    try {
        let jwtPayload;
        const token = req.header('Authorization')?.split(' ')[1];
        
        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        jwtPayload = <any>jwt.verify(token, authConfig.JWT_SECRET!, {
            complete: true,
            audience: authConfig.JWT_AUDIENCE,
            issuer: authConfig.JWT_ISSUER,
            algorithms: ['HS256'],
            clockTolerance: 0,
            ignoreExpiration: false,
            ignoreNotBefore: false
        });
        // Add the payload to the request so controllers may access it.
        (req as CustomRequest).token = jwtPayload;
            
        next();
    } catch (error) {
        next(error);
    }
};

