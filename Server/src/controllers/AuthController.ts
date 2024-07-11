
import { Request, Response, NextFunction } from 'express';
import { ClientError } from "../models/Errors/ClientError";
import { UnauthorizedError } from "../models/Errors/UnauthorizedError";
import UserService from '../services/UserService';
import { generateToken } from '../utils/tokenUtils';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

class AuthController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    // Function to login a user
    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password } = req.body;
            
            const token = this.userService.signIn(username, password);

            res.status(200).json( token );
        } catch (err) {
            if (err instanceof ClientError || err instanceof UnauthorizedError) {
                res.status(err.status).json({ error: err.message });
            } else {
                logger.error('Login error:', err);
                res.status(500).json({ error: 'An unexpected error occurred during login' });
            }
        }
    }

    // Function to change user password
    public changePassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { oldPassword, newPassword } = req.body;

            if (!(oldPassword && newPassword)) {
                throw new ClientError("Old and new passwords are required");
            }

            await this.userService.changePassword(userId, oldPassword, newPassword);
            res.status(204).send();
        } catch (err) {
            if (err instanceof ClientError || err instanceof UnauthorizedError) {
                res.status(err.status).json({ error: err.message });
            } else {
                logger.error('Change password error:', err);
                res.status(500).json({ error: 'An unexpected error occurred while changing password' });
            }
        }
    }
}

export default AuthController;