import express from 'express';
import TaskController from '../controllers/TaskController';
import { authJwt } from '../middlewares/authJwt';
import {  authorizeRoles } from '../middlewares/checkRole';

    /**
     * @swagger
     * tags:
     *   name: Tasks
     *   description: Operations related to tasks
     */
export default class TaskRoute {
    public router = express.Router();

    constructor(private taskController: TaskController) {
        this.setRoutes();
    }

    setRoutes() {

        /**
         * @swagger
         * /tasks:
         *   post:
         *     summary: Create a new task
         *     description: Create a new task with the provided data.
         *     tags: [Tasks]
         *     requestBody:
         *       description: Task data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "title": "Task 1", "description": "Description of Task 1" }
         *     responses:
         *       201:
         *         description: Task created successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Task 1", "description": "Description of Task 1" }
         */
        this.router.post('/tasks', this.taskController.createTask);

        /**
         * @swagger
         * /tasks:
         *   get:
         *     summary: Get all tasks
         *     description: Retrieve a list of all tasks.
         *     tags: [Tasks]
         *     responses:
         *       200:
         *         description: A list of tasks
         *         content:
         *           application/json:
         *             example: 
         *               - id: 1
         *                 title: Task 1
         *                 description: Description of Task 1
         *               - id: 2
         *                 title: Task 2
         *                 description: Description of Task 2
         */
        this.router.get('/tasks', this.taskController.getAllTasks);

        /**
         * @swagger
         * /tasks/{id}:
         *   get:
         *     summary: Get a task by ID
         *     description: Retrieve a task by its ID.
         *     tags: [Tasks]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the task to retrieve.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: The requested task
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Task 1", "description": "Description of Task 1" }
         *       404:
         *         description: Task not found
         */
        this.router.get('/tasks/:id', this.taskController.getTaskById);

        /**
         * @swagger
         * /tasks/{id}:
         *   put:
         *     summary: Update a task
         *     description: Update a task with the provided data.
         *     tags: [Tasks]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the task to update.
         *         schema:
         *           type: integer
         *     requestBody:
         *       description: Updated task data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "title": "Updated Task", "description": "Updated description" }
         *     responses:
         *       200:
         *         description: Task updated successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Updated Task", "description": "Updated description" }
         *       404:
         *         description: Task not found
         */
        this.router.put('/tasks/:id', this.taskController.updateTask);

        /**
         * @swagger
         * /tasks/{id}:
         *   delete:
         *     summary: Delete a task
         *     description: Delete a task by its ID.
         *     tags: [Tasks]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the task to delete.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: Task deleted successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Task 1", "description": "Description of Task 1" }
         *       404:
         *         description: Task not found
         */
        this.router.delete('/tasks/:id', this.taskController.deleteTask);
    }
}
