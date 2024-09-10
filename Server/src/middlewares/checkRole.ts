import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from "jsonwebtoken";
import { ForbiddenError } from "../models/app/Errors/ForbiddenError";
import { UnauthorizedError } from "../models/app/Errors/UnauthorizedError";
import { CustomRequest } from './authJwt';
import UserService from '../services/UserService';
import { Roles } from '../models/enums';
import User, { IUserDb } from '@/models/db/mongo/User';




export const authorizeRoles = (roles: Roles[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Find the user with the requested ID.
            User.findOne({username:(req as CustomRequest).token.payload.username}).then((user)=>{
                if(!user)
                    throw new UnauthorizedError("User not found");
                
                if (!user.roles) {
                    throw new UnauthorizedError("User roles not found");
                }
    
                const hasAuthorizedRole = user.roles.some(role => roles.includes(role as Roles));
                if (!hasAuthorizedRole) {
                    throw new ForbiddenError("Insufficient permissions");
                }

                next();
            });            
        } catch (error) {
            next(error);
        }
    };
};