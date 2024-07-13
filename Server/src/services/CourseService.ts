import { Types } from 'mongoose';
import Course, { ICourse, ICourseDb } from '../models/Course';
import User from '../models/User';
import { ClientError } from '../models/Errors/ClientError';
import { NotFoundError } from '../models/Errors/NotFoundError';
import { logger } from '../utils/logger';
import { mappedCourseToAppModel } from '../utils/ModelMapper';

class CourseService {
    public async createCourse(courseData: Omit<ICourse, 'id'>): Promise<ICourse> {
        try {
            const newCourse = new Course(courseData);
            const savedCourse = await newCourse.save();
            logger.info('Course created successfully', { courseId: savedCourse._id });
            return mappedCourseToAppModel(savedCourse);
        } catch (error) {
            logger.error('Error creating course', error);
            throw new ClientError('Failed to create course');
        }
    }

    public async getCourseById(courseId: string): Promise<ICourse> {
        if (!Types.ObjectId.isValid(courseId)) {
            logger.warn('Invalid course ID format', { courseId });
            throw new ClientError('Invalid course ID format');
        }

        try {
            const course = await Course.findById(courseId)
                .populate('instructor', 'name email')
                .populate('enrolledStudents', 'name email')
                .populate('modules', 'title order')
                .populate('categories', 'name');

            if (!course) {
                logger.warn('Course not found', { courseId });
                throw new NotFoundError(`Course with ID ${courseId} not found`);
            }

            logger.info('Course retrieved successfully', { courseId });
            return mappedCourseToAppModel(course);
        } catch (error) {
            if (!(error instanceof NotFoundError)) {
                logger.error('Error fetching course', { courseId, error });
                throw new ClientError('An error occurred while fetching the course');
            }
            throw error;
        }
    }

    public async getAllCourses(): Promise<ICourse[]> {
        try {
            const courses = await Course.find().populate('instructor');
            logger.debug(`Retrieved ${courses.length} courses`);
            return courses.map(course => mappedCourseToAppModel(course));
        } catch (error) {
            logger.error('Error fetching all courses', error);
            throw new ClientError('Failed to fetch courses');
        }
    }

    public async updateCourse(courseId: string, updateData: Partial<ICourse>): Promise<ICourse> {
        if (!Types.ObjectId.isValid(courseId)) {
            throw new ClientError('Invalid course ID');
        }

        try {
            const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true, runValidators: true });
            if (!course) {
                logger.warn('Attempt to update non-existent course', { courseId });
                throw new NotFoundError(`Course with ID ${courseId} not found`);
            }

            logger.info('Course updated successfully', { courseId });
            return mappedCourseToAppModel(course);
        } catch (error) {
            if (!(error instanceof NotFoundError)) {
                logger.error('Error updating course', { courseId, error });
                throw new ClientError('Failed to update course');
            }
            throw error;
        }
    }

    public async deleteCourse(courseId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(courseId)) {
            throw new ClientError('Invalid course ID');
        }

        try {
            const result = await Course.findByIdAndDelete(courseId);
            if (!result) {
                logger.warn('Attempt to delete non-existent course', { courseId });
                throw new NotFoundError(`Course with ID ${courseId} not found`);
            }

            logger.info('Course deleted successfully', { courseId });
            return true;
        } catch (error) {
            if (!(error instanceof NotFoundError)) {
                logger.error('Error deleting course', { courseId, error });
                throw new ClientError('Failed to delete course');
            }
            throw error;
        }
    }

    public async enrollStudent(courseId: string, studentId: string): Promise<ICourse> {
        if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(studentId)) {
            throw new ClientError('Invalid course ID or student ID');
        }

        try {
            const course = await Course.findById(courseId);
            const student = await User.findById(studentId);

            if (!course) {
                throw new NotFoundError(`Course with ID ${courseId} not found`);
            }
            if (!student) {
                throw new NotFoundError(`User with ID ${studentId} not found`);
            }

            if (course.enrolledStudents.some(id => id.toString() === studentId)) {
                throw new ClientError('Student already enrolled in this course');
            }
            
            course.enrolledStudents.push(new Types.ObjectId(studentId));
            await course.save();

            logger.info('Student enrolled in course', { courseId, studentId });
            return mappedCourseToAppModel(course);
        } catch (error) {
            logger.error('Error enrolling student in course', { courseId, studentId, error });
            if (error instanceof ClientError || error instanceof NotFoundError) {
                throw error;
            }
            throw new ClientError('Failed to enroll student in course');
        }
    }
}

export default CourseService;