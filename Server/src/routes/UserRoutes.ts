import express from 'express';
import UserController from '../controllers/UserController';
import { authJwt, authorizeRole } from '../middlewares/authJwt';

export default class UserRoute {
    public router = express.Router();

    constructor(private userController: UserController) {
        this.setRoutes();
    }

    setRoutes() {
        // Route for creating a new User
        this.router.post('/users', this.userController.createUser);

        this.router.get('/users', this.userController.getAllUsers);

        // Route for creating a new User
        this.router.post('/users/bulk', this.userController.createUsers);

        // Protected route: requires JWT authentication and user role
        //this.router.get('/users', this.userController.getAllUsers);

        // Route for getting a specific User by ID
        this.router.get('/users/:id', this.userController.getUserById);

        // Route for updating a User
        this.router.put('/users/:id', this.userController.updateUser);

        // Route for deleting a User
        this.router.delete('/users/:id', this.userController.deleteUser);

        // Protected route: requires JWT authentication and admin role
        //this.router.get('/users', authJwt, authorizeRole('admin'), this.userController.getAllUsers);

        // Route to handle user login and generate JWT token
        this.router.post('/signin', this.userController.signInUser);

        // Route to handle user login and generate JWT token
        this.router.post('/signup', this.userController.signUpUser);

    }
}
