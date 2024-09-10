// taskRoutes.ts
import express from 'express';
import TaskController from '../controllers/TaskController';
import TaskService from '../services/TaskService';
import { authJwt } from '../middlewares/authJwt';
import { authorizeRoles } from '../middlewares/checkRole';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Operations related to Module
 */
class TaskRoute {
    public router = express.Router();

    constructor(private taskController: TaskController) {
        this.setRoutes();
    }

    setRoutes() {
        // /**
        //  * @swagger
        //  * /tasks:
        //  *   post:
        //  *     summary: Create a new task
        //  *     tags: [Tasks]
        //  *     security:
        //  *       - bearerAuth: []
        //  *     requestBody:
        //  *       required: true
        //  *       content:
        //  *         application/json:
        //  *           schema:
        //  *             $ref: '#/components/schemas/Task'
        //  *     responses:
        //  *       201:
        //  *         description: The created task
        //  *         content:
        //  *           application/json:
        //  *             schema:
        //  *               $ref: '#/components/schemas/Task'
        //  *       500:
        //  *         description: Server error
        //  */
        // this.router.post('/', asyncHandler(this.taskController.createTask));
        
        // /**
        //  * @swagger
        //  * /tasks:
        //  *   get:
        //  *     summary: Retrieve all tasks
        //  *     tags: [Tasks]
        //  *     security:
        //  *       - bearerAuth: []
        //  *     responses:
        //  *       200:
        //  *         description: A list of tasks
        //  *         content:
        //  *           application/json:
        //  *             schema:
        //  *               type: array
        //  *               items:
        //  *                 $ref: '#/components/schemas/Task'
        //  *       500:
        //  *         description: Server error
        //  */
        // this.router.get('/',  asyncHandler(this.taskController.getAllTasks));
        
        // /**
        //  * @swagger
        //  * /tasks/{id}:
        //  *   get:
        //  *     summary: Get a task by id
        //  *     tags: [Tasks]
        //  *     security:
        //  *       - bearerAuth: []
        //  *     parameters:
        //  *       - in: path
        //  *         name: id
        //  *         required: true
        //  *         schema:
        //  *           type: string
        //  *     responses:
        //  *       200:
        //  *         description: The task
        //  *         content:
        //  *           application/json:
        //  *             schema:
        //  *               $ref: '#/components/schemas/Task'
        //  *       404:
        //  *         description: Task not found
        //  */
        // this.router.get('/:id',  asyncHandler(this.taskController.getTaskById));
        
        // /**
        //  * @swagger
        //  * /tasks/{id}:
        //  *   put:
        //  *     summary: Update a task
        //  *     tags: [Tasks]
        //  *     security:
        //  *       - bearerAuth: []
        //  *     parameters:
        //  *       - in: path
        //  *         name: id
        //  *         required: true
        //  *         schema:
        //  *           type: string
        //  *     requestBody:
        //  *       required: true
        //  *       content:
        //  *         application/json:
        //  *           schema:
        //  *             $ref: '#/components/schemas/Task'
        //  *     responses:
        //  *       200:
        //  *         description: The updated task
        //  *         content:
        //  *           application/json:
        //  *             schema:
        //  *               $ref: '#/components/schemas/Task'
        //  *       500:
        //  *         description: Server error
        //  */
        // this.router.put('/:id',  asyncHandler(this.taskController.updateTask));
        
        // /**
        //  * @swagger
        //  * /tasks/{id}:
        //  *   delete:
        //  *     summary: Delete a task
        //  *     tags: [Tasks]
        //  *     security:
        //  *       - bearerAuth: []
        //  *     parameters:
        //  *       - in: path
        //  *         name: id
        //  *         required: true
        //  *         schema:
        //  *           type: string
        //  *     responses:
        //  *       204:
        //  *         description: Task deleted
        //  *       500:
        //  *         description: Server error
        //  */
        // this.router.delete('/:id',  asyncHandler(this.taskController.deleteTask));
        
        // /**
        //  * @swagger
        //  * /tasks/assignment/{assignmentId}:
        //  *   get:
        //  *     summary: Get tasks by assignment
        //  *     tags: [Tasks]
        //  *     security:
        //  *       - bearerAuth: []
        //  *     parameters:
        //  *       - in: path
        //  *         name: assignmentId
        //  *         required: true
        //  *         schema:
        //  *           type: string
        //  *     responses:
        //  *       200:
        //  *         description: List of tasks for the assignment
        //  *         content:
        //  *           application/json:
        //  *             schema:
        //  *               type: array
        //  *               items:
        //  *                 $ref: '#/components/schemas/Task'
        //  *       500:
        //  *         description: Server error
        //  */
        // this.router.get('/assignment/:assignmentId', asyncHandler(this.taskController.getTasksByAssignment));
    }
}

export default TaskRoute;