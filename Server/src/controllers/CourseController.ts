import { NextFunction, Request, Response } from 'express';
import CourseService from '../services/CourseService';

import { TYPES } from '@/types';
import logger from '@/utils/logger';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { } from '@/models/dto';

import { isModuleNamespaceObject } from 'util/types';
import { CreateCourseDetailsDto, UpdateCourseDto } from '@/models/dto/request';
import { ResponseCourseDto } from '@/models/dto/response';
import { Lesson } from '@/models/app/Lesson.entity';
import { Task } from '@/models/app/Task.entity';
import { courseMapper } from '@/utils/mapper/autoMapper';
import { Course } from '@/models/app';


@injectable()
class CourseController {
    constructor(
        @inject(TYPES.CourseService) private courseService: CourseService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }


    public importCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const courseDto: CreateCourseDetailsDto = req.body
            const courseEntity: Course = courseMapper.fromRequest(courseDto);

            const importedCourse: Course = await this.courseService.importCourse(courseEntity);
            //const response = CourseMapper.toResponseDto(importedCourse);

            res.status(201).json({
                message: 'Course imported successfully',
                course: importedCourse
            });
        } catch (err) {
            this.logger.error('Error importing course:', err);
            next(err);
        }
    }

    public createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const requestDTO: CreateCourseDetailsDto = req.body;
            const newCourse: Course = courseMapper.fromRequest(requestDTO);

            const createdCourse: Course = await this.courseService.createCourse(newCourse);
            //const response: CourseResponseDto = CourseMapper.toResponseDto(createdCourse);

            res.status(201).json(createdCourse);
        } catch (err) {
            this.logger.error('Failed to create course', err);
            next(err);
        }
    }

    public getAllCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const courses = await this.courseService.getAllCourses();

            // const response: CourseResponseDto[] = courses.map(CourseMapper.toResponseDto);

            res.status(200).json(courses);
        } catch (err) {
            this.logger.error('Failed to fetch courses', err);
            next(err);
        }
    }

    public getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const courseId = req.params.id;
            const course = await this.courseService.getCourseById(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            //const response: CourseResponseDto = CourseMapper.toResponseDto(course);

            res.status(200).json(course);
        } catch (err) {
            this.logger.error('Failed to fetch course', err);
            next(err);
        }
    }

    public getCourseByIdFull = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const courseId = req.params.id;
            const course = await this.courseService.getCourseByIdFull(courseId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            //const response: CourseResponseDto = CourseMapper.toResponseDto(course);

            res.status(200).json(course);
        } catch (err) {
            this.logger.error('Failed to fetch course', err);
            next(err);
        }
    }

    public getCoursesByInstructor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const instructorId = req.params.instructorId;
            const course = await this.courseService.getCoursesByInstructor(instructorId);
            if (!course) {
                res.status(404).json({ error: 'Course not found' });
                return;
            }
            //const response: CourseResponseDto = CourseMapper.toResponseDto(course);

            res.status(200).json(course);
        } catch (err) {
            this.logger.error('Failed to fetch course', err);
            next(err);
        }
    }


    public updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const courseId = req.params.id;
            const updatedCourseDTO: UpdateCourseDto = req.body;
            // const updatedCourseData: Partial<Course> = CourseMapper.updateDtoToDomain(updatedCourseDTO);

            // const savedCourse = await this.courseService.updateCourse(courseId, updatedCourseData);
            // if (!savedCourse) {
            //     res.status(404).json({ error: 'Course not found' });
            //     return;
            // }
            // const response: CourseResponseDto = CourseMapper.toResponseDto(savedCourse);

            res.status(200).json(updatedCourseDTO);
        } catch (err) {
            this.logger.error('Failed to update course', err);
            next(err);
        }
    }

    public deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
            next(err);
        }
    }
}

export default CourseController;