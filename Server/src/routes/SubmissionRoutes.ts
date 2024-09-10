
// submissionRoutes.ts
import express from 'express';
import SubmissionController from '../controllers/SubmissionController';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operations related to users
 */

export default class UserRoute {
    public router = express.Router();

    constructor(private SubmissionController: SubmissionController) {
        this.setRoutes();
    }

    setRoutes() {

        /**
         * @swagger
         * /submissions:
         *   post:
         *     summary: Create a new submission
         *     tags: [Submissions]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/Submission'
         *     responses:
         *       201:
         *         description: The created submission
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Submission'
         *       500:
         *         description: Server error
         */
        this.router.post('/', asyncHandler(this.SubmissionController.createSubmission));

        /**
         * @swagger
         * /submissions/{id}:
         *   get:
         *     summary: Get a submission by id
         *     tags: [Submissions]
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
         *         description: The submission
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Submission'
         *       404:
         *         description: Submission not found
         */
        this.router.get('/:id', asyncHandler(this.SubmissionController.getSubmissionById));

        /**
         * @swagger
         * /submissions/{id}:
         *   put:
         *     summary: Update a submission
         *     tags: [Submissions]
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
         *             $ref: '#/components/schemas/Submission'
         *     responses:
         *       200:
         *         description: The updated submission
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Submission'
         *       500:
         *         description: Server error
         */
        this.router.put('/:id', asyncHandler(this.SubmissionController.updateSubmission));

        /**
         * @swagger
         * /submissions/{id}:
         *   delete:
         *     summary: Delete a submission
         *     tags: [Submissions]
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
         *         description: Submission deleted
         *       404:
         *         description: Submission not found
         *       500:
         *         description: Server error
         */
        this.router.delete('/:id', asyncHandler(this.SubmissionController.deleteSubmission));

        /**
         * @swagger
         * /submissions/user/{userId}:
         *   get:
         *     summary: Get submissions by user
         *     tags: [Submissions]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *     responses:
         *       200:
         *         description: List of submissions for the user
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/Submission'
         *       500:
         *         description: Server error
         */
        this.router.get('/user/:userId', asyncHandler(this.SubmissionController.getSubmissionsByUser));

        /**
         * @swagger
         * /submissions/assignment/{assignmentId}:
         *   get:
         *     summary: Get submissions by assignment
         *     tags: [Submissions]
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
         *         description: List of submissions for the assignment
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/Submission'
         *       500:
         *         description: Server error
         */
        this.router.get('/assignment/:assignmentId', asyncHandler(this.SubmissionController.getSubmissionsByAssignment));


    }
}
