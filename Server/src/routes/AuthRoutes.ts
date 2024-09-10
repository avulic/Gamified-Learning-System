import { Router } from 'express';
import express from 'express';
import AuthController from '../controllers/AuthController';
import { authJwt } from '../middlewares/authJwt';
import UserService from '../services/UserService';
import { asyncHandler } from '../utils/asyncHandler';



//const authController = new AuthController(userService);

export default class AuthRoute {
    public router = express.Router();

    constructor(private authController: AuthController) {
        this.setRoutes();
    }

    setRoutes() {
        /**
         * @swagger
         * /login:
         *   post:
         *     summary: User Login
         *     description: Authenticate a user and return a JWT token.
         *     tags: [Authentication]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - username
         *               - password
         *             properties:
         *               username:
         *                 type: string
         *               password:
         *                 type: string
         *                 format: password
         *           example:
         *             username: "johndoe"
         *             password: "password123"
         *     responses:
         *       200:
         *         description: Login successful
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 token:
         *                   type: string
         *                 user:
         *                   type: object
         *                   properties:
         *                     id:
         *                       type: string
         *                     username:
         *                       type: string
         *                     roles:
         *                       type: array
         *                       items:
         *                         type: string
         *             example:
         *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
         *               user:
         *                 id: "123456"
         *                 username: "johndoe"
         *                 roles: ["user"]
         *       401:
         *         description: Invalid credentials
         *         content:
         *           application/json:
         *             example:
         *               error: "Invalid username or password"
         */
        this.router.post('/signin', asyncHandler(this.authController.login));

        /**
         * @swagger
         * /change-password:
         *   post:
         *     summary: Change User Password
         *     description: Allow an authenticated user to change their password.
         *     tags: [Authentication]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - oldPassword
         *               - newPassword
         *             properties:
         *               oldPassword:
         *                 type: string
         *                 format: password
         *               newPassword:
         *                 type: string
         *                 format: password
         *           example:
         *             oldPassword: "oldPassword123"
         *             newPassword: "newPassword456"
         *     responses:
         *       204:
         *         description: Password changed successfully
         *       400:
         *         description: Invalid request (e.g., new password doesn't meet requirements)
         *         content:
         *           application/json:
         *             example:
         *               error: "New password does not meet strength requirements"
         *       401:
         *         description: Unauthorized (invalid old password or JWT token)
         *         content:
         *           application/json:
         *             example:
         *               error: "Invalid old password"
         */
        this.router.post('/change-password', authJwt, asyncHandler(this.authController.changePassword));
    }

}

