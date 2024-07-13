'use Strict'
import { Request, Response } from 'express';
import CourseService from '../services/CourseService';
import { ICourse, ICourseDb } from '../models/Course';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import {logger} from '../utils/logger';

class CourseController {
    private courseService: CourseService;

    constructor(CourseService: CourseService) {
        this.courseService = CourseService;
    }

    // Function to create a new Course
    public createCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const newCourse: ICourse = req.body;

            const createdCourse = await this.courseService.createCourse(newCourse);
            res.status(201).json(createdCourse);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create Course' + err });
        }
    }

    // Function to create a new Courses
    // public createCourses = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const newCourses: ICourse[] = req.body;
    //         console.log(req.body)
    //         const createdCourses = await this.courseService.createCourses(newCourses);
    //         res.status(201).json(createdCourses);
    //     } catch (err) {
    //         res.status(500).json({ error: 'Failed to create Courses' + err });
    //     }
    // }

    // Function to get all Courses
    public getAllCourses = async (req: Request, res: Response): Promise<void> => {
        try {
            const Courses = await this.courseService.getAllCourses();
            
            res.status(200).json(Courses);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Courses' });
        }
    }

    // Function to get a Course by ID
    public getCourseById = async (req: Request, res: Response): Promise<void> => {
        try {
            const CourseId = req.params.id;
            const Course = await this.courseService.getCourseById(CourseId);
            if (!Course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            res.status(200).json(Course);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Course' });
        }
    }

    // Function to update a Course
    public updateCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const CourseId = req.params.id;
            const updatedCourseData: ICourse = req.body;
            const updatedCourse = await this.courseService.updateCourse(CourseId, updatedCourseData);
            if (!updatedCourse) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            res.status(200).json(updatedCourse);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update Course' });
        }
    }

    // Function to delete a Course
    public deleteCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const CourseId = req.params.id;
            const deletedCourse = await this.courseService.deleteCourse(CourseId);

            if (!deletedCourse) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            res.status(200).json(deletedCourse);
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete Course' });
        }
    }

    
}

export default CourseController;
