// CourseController.ts

import { Request, Response } from 'express';
import CourseService from '../services/CourseService';
import { ICourse } from '@/models/app';
import { TYPES } from '@/types';
import logger from '@/utils/logger';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { CourseResponseDto, CreateCourseDto, UpdateCourseDto } from '@/models/dto';
import { CourseMapper } from '@/utils/ModelMapper';

@injectable()
class CourseController {
    constructor(
        @inject(TYPES.CourseService) private courseService: CourseService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    public createCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestDTO: CreateCourseDto = req.body;
            const newCourse: ICourse = CourseMapper.createDtoToDomain(requestDTO);

            const createdCourse: ICourse = await this.courseService.createCourse(newCourse);
            const response: CourseResponseDto = CourseMapper.toResponseDto(createdCourse);

            res.status(201).json(response);
        } catch (err) {
            this.logger.error('Failed to create course', err);
            res.status(500).json({ error: 'Failed to create course' });
        }
    }

    public getAllCourses = async (req: Request, res: Response): Promise<void> => {
        try {
            const courses = await this.courseService.getAllCourses();

            const response: CourseResponseDto[] = courses.map(CourseMapper.toResponseDto);

            res.status(200).json(response);
        } catch (err) {
            this.logger.error('Failed to fetch courses', err);
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    }

    public getCourseById = async (req: Request, res: Response): Promise<void> => {
        try {
            const courseId = req.params.id;
            const course = await this.courseService.getCourseById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const response: CourseResponseDto = CourseMapper.toResponseDto(course);

            res.status(200).json(response);
        } catch (err) {
            this.logger.error('Failed to fetch course', err);
            res.status(500).json({ error: 'Failed to fetch course' });
        }
    }

    public updateCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const courseId = req.params.id;
            const updatedCourseDTO: UpdateCourseDto = req.body;
            const updatedCourseData: Partial<ICourse> = CourseMapper.updateDtoToDomain(updatedCourseDTO);

            const savedCourse = await this.courseService.updateCourse(courseId, updatedCourseData);
            if (!savedCourse) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            const response: CourseResponseDto = CourseMapper.toResponseDto(savedCourse);

            res.status(200).json(response);
        } catch (err) {
            this.logger.error('Failed to update course', err);
            res.status(500).json({ error: 'Failed to update course' });
        }
    }

    public deleteCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const courseId = req.params.id;
            const deletedCourse = await this.courseService.deleteCourse(courseId);
            if (!deletedCourse) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }

            res.status(200).json({ message: 'Course deleted successfully' });
        } catch (err) {
            this.logger.error('Failed to delete course', err);
            res.status(500).json({ error: 'Failed to delete course' });
        }
    }
}

export default CourseController;