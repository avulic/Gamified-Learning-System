import express from 'express';
import CourseController from '../controllers/CourseController';
import { authJwt } from '../middlewares/authJwt';
import {  authorizeRoles } from '../middlewares/checkRole';
import { asyncHandler } from '../utils/asyncHandler';


    /**
     * @swagger
     * tags:
     *   name: Courses
     *   description: Operations related to Course
     */
export default class CourseRoute {
    public router = express.Router();

    constructor(private courseController: CourseController) {
        this.setRoutes();
    }

    setRoutes() {

        /**
         * @swagger
         * /Courses:
         *   post:
         *     summary: Create a new Course
         *     description: Create a new Course with the provided data.
         *     tags: [Courses]
         *     requestBody:
         *       description: Course data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "title": "Course 1", "description": "Description of Course 1",  "instructors": "Course 1","enrolledStudents": "Course 1","modules": "Course 1","startDate": "Course 1","endDate": "Course 1"}
         *     responses:
         *       201:
         *         description: Course created successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Course 1", "description": "Description of Course 1" }
         */
        this.router.post('/courses', asyncHandler(this.courseController.createCourse));

        /**
         * @swagger
         * /Courses:
         *   get:
         *     summary: Get all Courses
         *     description: Retrieve a list of all Courses.
         *     tags: [Courses]
         *     responses:
         *       200:
         *         description: A list of Courses
         *         content:
         *           application/json:
         *             example: 
         *               - id: 1
         *                 title: Course 1
         *                 description: Description of Course 1
         *               - id: 2
         *                 title: Course 2
         *                 description: Description of Course 2
         */
        this.router.get('/courses', asyncHandler(this.courseController.getAllCourses));

        /**
         * @swagger
         * /Courses/{id}:
         *   get:
         *     summary: Get a Course by ID
         *     description: Retrieve a Course by its ID.
         *     tags: [Courses]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Course to retrieve.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: The requested Course
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Course 1", "description": "Description of Course 1" }
         *       404:
         *         description: Course not found
         */
        this.router.get('/courses/:id', asyncHandler(this.courseController.getCourseById));

        /**
         * @swagger
         * /Courses/{id}:
         *   put:
         *     summary: Update a Course
         *     description: Update a Course with the provided data.
         *     tags: [Courses]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Course to update.
         *         schema:
         *           type: integer
         *     requestBody:
         *       description: Updated Course data
         *       required: true
         *       content:
         *         application/json:
         *           example: { "title": "Updated Course", "description": "Updated description" }
         *     responses:
         *       200:
         *         description: Course updated successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Updated Course", "description": "Updated description" }
         *       404:
         *         description: Course not found
         */
        this.router.put('/courses/:id', asyncHandler(this.courseController.updateCourse));

        /**
         * @swagger
         * /Courses/{id}:
         *   delete:
         *     summary: Delete a Course
         *     description: Delete a Course by its ID.
         *     tags: [Courses]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Numeric ID of the Course to delete.
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: Course deleted successfully
         *         content:
         *           application/json:
         *             example: { "id": 1, "title": "Course 1", "description": "Description of Course 1" }
         *       404:
         *         description: Course not found
         */
        this.router.delete('/courses/:id', asyncHandler(this.courseController.deleteCourse));
    }
}
