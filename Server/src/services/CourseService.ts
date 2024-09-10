// CourseService.ts
import { Types } from 'mongoose';
import {CourseMapper} from '@/utils/ModelMapper'
import { NotFoundError } from '../models/app/Errors/NotFoundError';
import { ClientError } from '../models/app/Errors/ClientError';
import  Logger  from '../utils/logger';

import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import { ICourse, IUser } from '@/models/app';
import { CourseResponseDto, CreateCourseDto, UpdateCourseDto } from '@/models/dto';
import { CourseRepository } from '@/repository/CourseRepository';
import { UserRepository } from '@/repository/UserRepository';
import { ModuleRepository } from '@/repository/ModuleRepository';


@injectable()
export class CourseService {
    constructor(
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository,
        @inject(TYPES.ModuleRepository) private moduleRepository: ModuleRepository,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    async createCourse(newCourseData: ICourse): Promise<ICourse> {
        // Fetch modules
        newCourseData.modules = await Promise.all(
            newCourseData.modulesId.map(async moduleId => {
                const module = await this.moduleRepository.findById(moduleId);
                if(!module)
                    throw new NotFoundError("module not found");
                return module;
            })
        );

        // Fetch instructors
        newCourseData.instructors = await Promise.all(
            newCourseData.instructorsId.map(async instId => {
                const instructor = await this.userRepository.findById(instId);
                if(!instructor)
                    throw new NotFoundError("User(instructor) not found");
                return instructor;
            })
        );

        const createdCourse = await this.courseRepository.create(newCourseData);
        return createdCourse;
    }

    async getCourseById(id: string): Promise<ICourse> {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new NotFoundError('Course not found');
        }
        return course;
    }

    async updateCourse(id: string, updateCourseData: Partial<ICourse>): Promise<ICourse> {
        const existingCourse = await this.courseRepository.findById(id);
        if (!existingCourse) {
            throw new NotFoundError('Course not found');
        }

        // Fetch and update instructors if provided
        if (!updateCourseData.instructors) {
            updateCourseData.instructors = await Promise.all(
                existingCourse.instructorsId.map(async id => {
                    const instructor = await this.userRepository.findById(id);
                    if(!instructor)
                        throw new NotFoundError("User(instructor) not found");
                    return instructor;
                })
            );
        }

        // Fetch and update modules if provided
        if (!updateCourseData.modules) {
            updateCourseData.modules = await Promise.all(
                existingCourse.modulesId.map(async id => {
                    const module = await this.moduleRepository.findById(id);
                    if(!module)
                        throw new NotFoundError("Module not found");
                    return module;
                })
            );
        }

        const updatedCourse = await this.courseRepository.update(id, updateCourseData);
        if (!updatedCourse) {
            throw new NotFoundError("Course not updated");
        }

        return updatedCourse;
    }

    async deleteCourse(id: string): Promise<boolean> {
        const result = await this.courseRepository.delete(id);
        if (!result) {
            throw new NotFoundError('Course not found');
        }
        return result;
    }

    async getAllCourses(): Promise<ICourse[]> {
        const courses = await this.courseRepository.findAll();
        if(!courses)
            throw new NotFoundError("courses not found");

        return courses;
    }
}

export default CourseService;

