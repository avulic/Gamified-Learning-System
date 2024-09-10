import express from 'express';
import AssignmentController from '../controllers/AssignmentController';
import { asyncHandler } from '../utils/asyncHandler';


export default class AssignmentRoute {
    public router = express.Router();

    constructor(private AssignmentController: AssignmentController) {
        this.setRoutes();
    }
    setRoutes() {

        /**
         * @swagger
         * /assignments:
         *   post:
         *     summary: Create a new assignment
         *     tags: [Assignments]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/Assignment'
         *     responses:
         *       201:
         *         description: The created assignment
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Assignment'
         *       500:
         *         description: Server error
         */
        this.router.post('/assignments', asyncHandler(this.AssignmentController.createAssignment));

        // /**
        //  * @swagger
        //  * /assignments:
        //  *   get:
        //  *     summary: Retrieve all assignments
        //  *     tags: [Assignments]
        //  *     security:
        //  *       - bearerAuth: []
        //  *     responses:
        //  *       200:
        //  *         description: A list of assignments
        //  *         content:
        //  *           application/json:
        //  *             schema:
        //  *               type: array
        //  *               items:
        //  *                 $ref: '#/components/schemas/Assignment'
        //  *       500:
        //  *         description: Server error
        //  */
        // this.router.get('/assignments', asyncHandler(this.AssignmentController.getAllAssignments));

        /**
         * @swagger
         * /assignments/{id}:
         *   get:
         *     summary: Get an assignment by id
         *     tags: [Assignments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: The assignment
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Assignment'
         *       404:
         *         description: Assignment not found
         */
        this.router.get('/assignments/:id',asyncHandler( this.AssignmentController.getAssignmentById));

        /**
         * @swagger
         * /assignments/{id}:
         *   put:
         *     summary: Update an assignment
         *     tags: [Assignments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/Assignment'
         *     responses:
         *       200:
         *         description: The updated assignment
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Assignment'
         *       500:
         *         description: Server error
         */
        this.router.put('/assignments/:id', asyncHandler(this.AssignmentController.updateAssignment));

        /**
         * @swagger
         * /assignments/{id}:
         *   delete:
         *     summary: Delete an assignment
         *     tags: [Assignments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       204:
         *         description: Assignment deleted
         *       404:
         *         description: Assignment not found
         *       500:
         *         description: Server error
         */
        this.router.delete('/assignments/:id', asyncHandler(this.AssignmentController.deleteAssignment));

        /**
         * @swagger
         * /assignments/module/{moduleId}:
         *   get:
         *     summary: Get assignments by module
         *     tags: [Assignments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: moduleId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: List of assignments for the module
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/Assignment'
         *       500:
         *         description: Server error
         */
        this.router.get('/assignments/module/:moduleId', asyncHandler(this.AssignmentController.getAssignmentsByModule));

        /**
         * @swagger
         * /assignments/{assignmentId}/progress:
         *   get:
         *     summary: Get assignment progress including task completion status
         *     tags: [Assignments]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: assignmentId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: Assignment progress with task completion status
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/AssignmentProgressDTO'
         *       404:
         *         description: Assignment not found
         *       500:
         *         description: Server error
         */
        //this.router.get('/:assignmentId/progress', asyncHandler(this.AssignmentController.getAssignmentProgress));
    }
}


