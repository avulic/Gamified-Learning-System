
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import { IUser, IUserDb } from '../models/User';
import { CustomError } from '../models/Errors/CustomError';
import { logger } from './logger';

export const generateToken = (user: IUser): string => {
    try {
        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                roles: user.roles.map(role => role)
            },
            authConfig.JWT_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: authConfig.JWT_EXPIRATION || '1h'
            }
        );
    } catch (error) {
        logger.error('Failed to generate token', { userId: user.id, error });
        throw new CustomError('Failed to generate token');
    }
};