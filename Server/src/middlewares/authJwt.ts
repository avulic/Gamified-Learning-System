// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import BadRequestError from '../models/Errors/BadRequstError';

/**
 * Middleware to authenticate requests using JWT.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const authJwt = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        //res.status(401).json({ error: 'Unauthorized' });
        throw new BadRequestError({ code: 401, message: "Unauthorized", logging: false });
    }

    jwt.verify(token, authConfig.JWT_SECRET, (err, user) => {
        if (err instanceof TokenExpiredError) {
            throw new BadRequestError({ code: 403, message: "Token expired", logging: false });
            //res.status(403).json({ error: 'Invalid token' });
            //return;
        }
        if (err) {
            throw new BadRequestError({ code: 403, message: "Invalid token", logging: false });
            //res.status(403).json({ error: 'Invalid token' });
            //return;
        }
        
        req.body.user = user;
        next();
    });
};

/**
 * Middleware to authorize user roles.
 * @param role - The role to authorize
 */
const authorizeRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.body.user?.role;

        if (userRole !== role) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        next();
    };
};

// const isAdmin = (req, res, next) => {
//     User.findById(req.userId).exec((err, user) => {
//         if (err) {
//             res.status(500).send({ message: err });
//             return;
//         }

//         Role.find(
//             {
//                 _id: { $in: user.roles }
//             },
//             (err, roles) => {
//                 if (err) {
//                     res.status(500).send({ message: err });
//                     return;
//                 }

//                 for (let i = 0; i < roles.length; i++) {
//                     if (roles[i].name === "admin") {
//                         next();
//                         return;
//                     }
//                 }

//                 res.status(403).send({ message: "Require Admin Role!" });
//                 return;
//             }
//         );
//     });
// };

// const isModerator = (req, res, next) => {
//     User.findById(req.userId).exec((err, user) => {
//         if (err) {
//             res.status(500).send({ message: err });
//             return;
//         }

//         Role.find(
//             {
//                 _id: { $in: user.roles }
//             },
//             (err, roles) => {
//                 if (err) {
//                     res.status(500).send({ message: err });
//                     return;
//                 }

//                 for (let i = 0; i < roles.length; i++) {
//                     if (roles[i].name === "moderator") {
//                         next();
//                         return;
//                     }
//                 }

//                 res.status(403).send({ message: "Require Moderator Role!" });
//                 return;
//             }
//         );
//     });
// };

// const authJwt = {
//     verifyToken,
//     isAdmin,
//     isModerator
// };
export { authJwt, authorizeRole };
