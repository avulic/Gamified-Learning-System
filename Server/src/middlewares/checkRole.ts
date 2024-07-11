import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from "jsonwebtoken";
import { ForbiddenError } from "../models/Errors/ForbiddenError";
import { UnauthorizedError } from "../models/Errors/UnauthorizedError";
import { Roles } from "../models/Role";
import { CustomRequest } from './authJwt';
import UserService from '../services/UserService';


    

export const authorizeRoles = (roles: Roles[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            let userService: UserService =new UserService();

            // Find the user with the requested ID.
            userService.getUserByUsername((req as CustomRequest).token.payload.username).then((user)=>{
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