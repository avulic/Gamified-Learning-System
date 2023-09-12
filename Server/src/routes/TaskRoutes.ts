import express from 'express';
import TaskController from '../controllers/TaskController';
import { authJwt, authorizeRole } from '../middlewares/authJwt';

export default class UserRoute {
    public router = express.Router();

    constructor(private taskController: TaskController) {
        this.setRoutes();
    }

    setRoutes() {
        // Route for creating a new User
        this.router.post('/tasks', this.taskController.createTask);

        this.router.get('/tasks', this.taskController.getAllTasks);

        // Route for getting a specific User by ID
        this.router.get('/tasks/:id', this.taskController.getTaskById);

        // Route for updating a User
        this.router.put('/tasks/:id', this.taskController.updateTask);

        // Route for deleting a User
        this.router.delete('/tasks/:id', this.taskController.deleteTask);
    }
}
