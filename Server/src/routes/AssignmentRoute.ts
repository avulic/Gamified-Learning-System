import express from 'express';
import AssignmentController from '../controllers/AssignmentController';
import { authJwt } from '../middlewares/authJwt';
import {  authorizeRoles } from '../middlewares/checkRole';
;

    /**
     * @swagger
     * tags:
     *   name: Assignments
     *   description: Operations related to Assignment
     */
export default class AssignmentRoute {
    public router = express.Router();

    constructor(private assignmentController: AssignmentController) {
        this.setRoutes();
    }

    setRoutes() {

        /**
         * @swagger
         * /Assignments:
         *   post:
         *     summary: Create a new Assignment
         *     description: Create a new Assignment with the provided data.
         *     tags: [Assignments]
         *     requestBody:
         *       description: Assignment data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "title": "Assignment 1", "description": "Description of Assignment 1" }
         *     responses:
         *       201:
         *         description: Assignment created successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Assignment 1", "description": "Description of Assignment 1" }
         */
        this.router.post('/assignments', this.assignmentController.createAssignment);

        /**
         * @swagger
         * /Assignments:
         *   get:
         *     summary: Get all Assignments
         *     description: Retrieve a list of all Assignments.
         *     tags: [Assignments]
         *     responses:
         *       200:
         *         description: A list of Assignments
         *         content:
         *           application/json:
         *             example: 
         *               - id: 1
         *                 title: Assignment 1
         *                 description: Description of Assignment 1
         *               - id: 2
         *                 title: Assignment 2
         *                 description: Description of Assignment 2
         */
        this.router.get('/assignments', this.assignmentController.getAllAssignments);

        /**
         * @swagger
         * /Assignments/{id}:
         *   get:
         *     summary: Get a Assignment by ID
         *     description: Retrieve a Assignment by its ID.
         *     tags: [Assignments]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Assignment to retrieve.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: The requested Assignment
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Assignment 1", "description": "Description of Assignment 1" }
         *       404:
         *         description: Assignment not found
         */
        this.router.get('/assignments/:id', this.assignmentController.getAssignmentById);

        /**
         * @swagger
         * /Assignments/{id}:
         *   put:
         *     summary: Update a Assignment
         *     description: Update a Assignment with the provided data.
         *     tags: [Assignments]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Assignment to update.
         *         schema:
         *           type: integer
         *     requestBody:
         *       description: Updated Assignment data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "title": "Updated Assignment", "description": "Updated description" }
         *     responses:
         *       200:
         *         description: Assignment updated successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Updated Assignment", "description": "Updated description" }
         *       404:
         *         description: Assignment not found
         */
        this.router.put('/assignments/:id', this.assignmentController.updateAssignment);

        /**
         * @swagger
         * /Assignments/{id}:
         *   delete:
         *     summary: Delete a Assignment
         *     description: Delete a Assignment by its ID.
         *     tags: [Assignments]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Assignment to delete.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: Assignment deleted successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Assignment 1", "description": "Description of Assignment 1" }
         *       404:
         *         description: Assignment not found
         */
        this.router.delete('/assignments/:id', this.assignmentController.deleteAssignment);
    }
}
