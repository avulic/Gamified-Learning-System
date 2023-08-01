import  express from 'express';
import UserController from '../controllers/UserController';

export default class UserRoute {
    public router = express.Router();

    constructor(private userController: UserController){
        this.setRoutes();
    }

    setRoutes(){
        // Route for creating a new User
        this.router.post('/users', this.userController.createUser);
        
        // Route for creating a new User
        this.router.post('/users/bulk', this.userController.createUsers);

        // Route for getting all User
        this.router.get('/users', this.userController.getAllUsers);
        
        // Route for getting a specific User by ID
        this.router.get('/users/:id', this.userController.getUserById);
        
        // Route for updating a User
        this.router.put('/users/:id', this.userController.updateUser);
        
        // Route for deleting a User
        this.router.delete('/users/:id', this.userController.deleteUser);
    }
}
