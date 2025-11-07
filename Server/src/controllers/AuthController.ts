
import { Request, Response, NextFunction } from 'express';
import { ClientError } from "../models/app/Errors/ClientError";
import { UnauthorizedError } from "../models/app/Errors/UnauthorizedError";
import UserService from '../services/UserService';

import { asyncHandler } from '../utils/asyncHandler';
import Logger from '@/utils/logger';
import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import { CreateUserDto } from '@/models/dto/request';
import { userMapper } from '@/utils/mapper/autoMapper';

@injectable()
class AuthController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.Logger) private logger: ILogger
    ) { }


    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { username, password } = req.body;

            const token = await this.userService.signIn(username, password);

            res.status(200).json(token);
        } catch (err) {
            this.logger.error('Login error:', err);
            //res.status(500).json({ error: 'An unexpected error occurred during login' });
            next(err);
        }
    }

    public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userDto: CreateUserDto = req.body;
            const userData = userMapper.fromRequest(userDto);

            const cretedUser = await this.userService.createUser(userData);
            if (!cretedUser) {
                throw new ClientError('User could not be created');
            }
            res.status(200).json({ message: "User created" });
        } catch (err) {
            this.logger.error('Login error:', err);
            //res.status(500).json({ error: 'An unexpected error occurred during login' });
            next(err);
        }
    }


    public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { oldPassword, newPassword } = req.body;

            if (!(oldPassword && newPassword)) {
                throw new ClientError("Old and new passwords are required");
            }

            await this.userService.changePassword(userId, oldPassword, newPassword);
            res.status(204).send();
        } catch (err) {
            this.logger.error('Login error:', err);
            //res.status(500).json({ error: 'An unexpected error occurred during login' });
            next(err);
        }
    }
}

export default AuthController;