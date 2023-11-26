import express from 'express';
import UserController from '../controllers/UserController';
import { authJwt, authorizeRole } from '../middlewares/authJwt';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operations related to users
 */

export default class UserRoute {
    public router = express.Router();

    constructor(private userController: UserController) {
        this.setRoutes();
    }

    setRoutes() {
        /**
         * @swagger
         * /users:
         *   post:
         *     summary: Create multiple users
         *     description: Create multiple users with the provided data.
         *     tags: [Users]
         *     requestBody:
         *       description: List of user data
         *       required: true
         *       content:
         *         application/json:
         *           example: [{ "name": "John Doe", "email": "john@example.com", "password": "password123" }]
         *     responses:
         *       201:
         *         description: Users created successfully
         *         content:
         *           application/json:
         *             example: [{ "id": 1, "name": "John Doe", "email": "john@example.com" }]
         */
        this.router.post('/users', this.userController.createUser);
        
        /**
         * @swagger
         * /users/bulk:
         *   post:
         *     summary: Create multiple users
         *     description: Create multiple users with the provided data.
         *     tags: [Users]
         *     requestBody:
         *       description: List of user data
         *       required: true
         *       content:
         *         application/json:
         *           example: [{ "name": "John Doe", "email": "john@example.com", "password": "password123" }]
         *     responses:
         *       201:
         *         description: Users created successfully
         *         content:
         *           application/json:
         *             example: [{ "id": 1, "name": "John Doe", "email": "john@example.com" }]
         */
        this.router.post('/users/bulk', this.userController.createUsers);

        /**
         * @swagger
         * /users:
         *   get:
         *     summary: Get all users
         *     description: Retrieve a list of all users.
         *     tags: [Users]
         *     security:
         *       - BearerAuth: ['admin','User']
         *     responses:
         *       200:
         *         description: A list of users
         *         content:
         *           application/json:
         *             example: [{ "id": 1, "name": "John Doe", "email": "john@example.com" }]
         */
        this.router.get('/users', this.userController.getAllUsers);

        /**
         * @swagger
         * /users/{id}:
         *   get:
         *     summary: Get a user by ID
         *     description: Retrieve a user by their ID.
         *     tags: [Users]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the user to retrieve.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: The requested user
         *         content:
         *           application/json:
         *             example: { "id": 1, "name": "John Doe", "email": "john@example.com" }
         *       404:
         *         description: User not found
         */
        this.router.get('/users/:id', this.userController.getUserById);

        /**
         * @swagger
         * /users/{id}:
         *   put:
         *     summary: Update a user
         *     description: Update a user with the provided data.
         *     tags: [Users]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the user to update.
         *         schema:
         *           type: integer
         *     requestBody:
         *       description: Updated user data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "name": "John Doe", "email": "john@example.com" }
         *     responses:
         *       200:
         *         description: User updated successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "name": "John Doe", "email": "john@example.com" }
         *       404:
         *         description: User not found
         */
        this.router.put('/users/:id', this.userController.updateUser);

        /**
         * @swagger
         * /users/{id}:
         *   delete:
         *     summary: Delete a user
         *     description: Delete a user by their ID.
         *     tags: [Users]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the user to delete.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: User deleted successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "name": "John Doe", "email": "john@example.com" }
         *       404:
         *         description: User not found
         */
        this.router.delete('/users/:id', this.userController.deleteUser);

        /**
         * @swagger
         * /usersProtected:
         *   get:
         *     summary: Get all users (protected route)
         *     tags: [Users]
         *     security:
         *       - bearerAuth: [adasdas]
         *     responses:
         *       200:
         *         description: Users retrieved successfully
         *         content:
         *           application/json:
         *             example: 
         *               - id: 1
         *                 name: John Doe
         *                 email: john@example.com
         *               - id: 2
         *                 name: Jane Doe
         *                 email: jane@example.com
         *       401:
         *          description: Unauthorized - Invalid token or insufficient privileges
         *          content:
         *              application/json:
         *                  schema:
         *                      $ref: '#/components/schemas/BadRequestError'
         *         
         */
        this.router.get('/usersProtected', authJwt, authorizeRole('admin'), this.userController.getAllUsers);

        /**
         * @swagger
         * /signin:
         *   post:
         *     summary: User sign-in
         *     description: Authenticate and generate a JWT token for the user.
         *     tags: [Users]
         *     requestBody:
         *       description: User credentials
         *       required: true
         *       content:
         *         application/json:
         *           example: { "username": "john_doe", "password": "password123" }
         *     responses:
         *       200:
         *         description: JWT token generated successfully
         *         content:
         *           application/json:
         *             example: { "token": "your-jwt-token" }
         *       401:
         *         description: Invalid credentials
         */
        this.router.post('/signin', this.userController.signInUser);

        /**
         * @swagger
         * /signup:
         *   post:
         *     summary: User sign-up
         *     description: Create a new user account.
         *     tags: [Users]
         *     requestBody:
         *       description: New user data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "name": "John Doe", "email": "john@example.com", "password": "password123" }
         *     responses:
         *       201:
         *         description: User account created successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "name": "John Doe", "email": "john@example.com" }
         */
        this.router.post('/signup', this.userController.signUpUser);

    }
}
