// tests/services/CourseService.test.ts
import { Container } from 'inversify';
import { Types } from 'mongoose';
import { ILogger, TYPES } from '@/types';
import { CourseService } from '@/services/CourseService';
import { CourseRepository } from '@/repository/CourseRepository';
import { ModuleRepository } from '@/repository/ModuleRepository';
import { FileRepository } from '@/repository/FileRepository';
import { AssignmentRepository } from '@/repository/AssignmentRepository';
import { MongoUnitOfWork } from '@/repository/MongoUnitOfWork';
import { Course, Module } from '@/models/app';
import Logger from '@/utils/logger';
import { ClientError } from '@/models/app/Errors/ClientError';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { TaskService } from '@/services/TaskService';
import { TaskRepository } from '@/repository/TaskRepository';
import ModuleService from '@/services/ModuleService';

describe('CourseService Test Suite', () => {
    let courseService: CourseService;
    let courseRepository: jest.Mocked<CourseRepository>;
    let moduleRepository: jest.Mocked<ModuleRepository>;
    let fileRepository: jest.Mocked<FileRepository>;
    let assignmentRepository: jest.Mocked<AssignmentRepository>;
    let unitOfWork: jest.Mocked<MongoUnitOfWork>;
    let logger: jest.Mocked<ILogger>;
    let taskService: jest.Mocked<TaskService>;
    let moduleService: jest.Mocked<ModuleService>;
    let taskRepository: jest.Mocked<TaskRepository>;

    const mockSession = { id: 'test-session' };
    const mockCourseId = new Types.ObjectId().toString();
    const mockModuleId = new Types.ObjectId().toString();
    const mockFileId = new Types.ObjectId().toString();

    // Create mocked repositories and services before each test
    beforeEach(() => {
        // Setup mocked repositories
        courseRepository = {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
            findAll: jest.fn()
        } as any;

        moduleRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        } as any;

        fileRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByFilename: jest.fn(),
            findByUploadedBy: jest.fn()
        } as any;

        assignmentRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findByModuleId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        } as any;

        unitOfWork = {
            beginTransaction: jest.fn().mockResolvedValue(mockSession),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            rollbackTransaction: jest.fn().mockResolvedValue(undefined)
        } as any;

        logger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        } as any;
        moduleService = {
            getModulesByCourseIdDetail: jest.fn()
        } as any;

        taskRepository = {
            create: jest.fn(),
            findById: jest.fn()
        } as any;

        taskService = {
            createTask: jest.fn(),
            getTasksByAssignmentId: jest.fn()
        } as any;

        // Manually instantiate CourseService with mocked dependencies
        courseService = new CourseService(
            courseRepository,
            moduleRepository,
            moduleService,     // Add this
            assignmentRepository,
            taskRepository,    // Add this
            fileRepository,
            taskService,
            unitOfWork,
            logger
        );
    });


    describe('importCourse Method', () => {
        it('should import basic course without modules', async () => {
            const basicCourse = {
                id: new Types.ObjectId().toString(),
                title: 'Basic Course',
                description: 'Simple course description',
                categories: ['Programming'],
                enrollmentCode: 'BASIC101',
                isPublished: false,
                xpReward: 100
            } as Course;

            courseRepository.findOne.mockResolvedValueOnce(null);
            courseRepository.create.mockResolvedValueOnce(basicCourse);
            courseRepository.findById.mockResolvedValueOnce(basicCourse);

            const result = await courseService.importCourse(basicCourse);

            expect(result).toBeDefined();
            expect(result.title).toBe('Basic Course');
            expect(moduleRepository.create).not.toHaveBeenCalled();
            // Error Cases
        });

        // Transaction rollback tests
        it('should rollback transaction if module creation fails', async () => {
            const course = {
                title: 'Transaction Test Course',
                modules: [{
                    title: 'Module 1',
                    order: 1
                }]
            } as unknown as Course;

            // This will allow course creation to succeed so we can reach module creation
            courseRepository.create.mockImplementationOnce((courseData) => {
                return Promise.resolve({
                    ...courseData,
                    id: new Types.ObjectId().toString()
                });
            });

            courseRepository.findOne.mockResolvedValueOnce(null);
            moduleRepository.create.mockRejectedValueOnce(new Error('Module creation failed'));

            await expect(courseService.importCourse(course))
                .rejects
                .toThrow('Module creation failed');

            expect(unitOfWork.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(unitOfWork.commitTransaction).not.toHaveBeenCalled();
        });

        it('should rollback transaction if assignment creation fails', async () => {
            const course = {
                id: new Types.ObjectId().toString(),
                title: 'Transaction Test Course',
                modules: [{
                    id: new Types.ObjectId().toString(),
                    title: 'Module 1',
                    assignments: [{
                        title: 'Assignment 1'
                    }]
                }]
            } as unknown as Course;

            courseRepository.findOne.mockResolvedValueOnce(null);
            courseRepository.create.mockResolvedValueOnce(course);
            moduleRepository.create.mockResolvedValueOnce(course.modules[0]);
            assignmentRepository.create.mockRejectedValueOnce(new Error('Assignment creation failed'));

            await expect(courseService.importCourse(course))
                .rejects
                .toThrow('Assignment creation failed');

            expect(unitOfWork.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(unitOfWork.commitTransaction).not.toHaveBeenCalled();
        });

        it('should rollback transaction if file creation fails', async () => {
            const course = {
                id: new Types.ObjectId().toString(),
                title: 'Transaction Test Course',
                modules: [{
                    id: new Types.ObjectId().toString(),
                    title: 'Module 1',
                    files: [{
                        filename: 'test.pdf',
                        mimetype: 'application/pdf'
                    }]
                }]
            } as unknown as Course;

            courseRepository.findOne.mockResolvedValueOnce(null);
            courseRepository.create.mockResolvedValueOnce(course);
            moduleRepository.create.mockResolvedValueOnce(course.modules[0]);
            fileRepository.create.mockRejectedValueOnce(new Error('File creation failed'));

            await expect(courseService.importCourse(course))
                .rejects
                .toThrow('File creation failed');

            expect(unitOfWork.rollbackTransaction).toHaveBeenCalledTimes(1);
            expect(unitOfWork.commitTransaction).not.toHaveBeenCalled();
        });

        // it('should throw ClientError when module has invalid order', async () => {
        //     const courseWithInvalidModule = {
        //         title: 'Invalid Module Course',
        //         description: 'Test course',
        //         modules: [{
        //             title: 'Invalid Module',
        //             order: -1  // Invalid order
        //         }]
        //     } as Course;

        //     courseRepository.findOne.mockResolvedValueOnce(null);
        //     courseRepository.create.mockResolvedValueOnce(courseWithInvalidModule);

        //     await expect(courseService.importCourse(courseWithInvalidModule))
        //         .rejects
        //         .toThrow(ClientError);
        // });

        // it('should throw NotFoundError when prerequisite course not found', async () => {
        //     const courseWithInvalidPrereq = {
        //         title: 'Course with Prerequisites',
        //         description: 'Test course',
        //         prerequisites: [new Types.ObjectId()]
        //     } as Course;

        //     courseRepository.findOne.mockResolvedValueOnce(null);
        //     courseRepository.create.mockResolvedValueOnce(courseWithInvalidPrereq);
        //     courseRepository.findById.mockResolvedValueOnce(null);

        //     await expect(courseService.importCourse(courseWithInvalidPrereq))
        //         .rejects
        //         .toThrow(NotFoundError);
        // });

        // it('should throw ClientError when file size exceeds limit', async () => {
        //     const courseWithLargeFile = {
        //         title: 'Course with Large File',
        //         modules: [{
        //             title: 'Module 1',
        //             files: [{
        //                 filename: 'large.pdf',
        //                 size: 1024 * 1024 * 1024 // 1GB
        //             }]
        //         }]
        //     } as Course;

        //     courseRepository.findOne.mockResolvedValueOnce(null);
        //     courseRepository.create.mockResolvedValueOnce(courseWithLargeFile);

        //     await expect(courseService.importCourse(courseWithLargeFile))
        //         .rejects
        //         .toThrow(ClientError);
        // });

        it('should throw ClientError for duplicate enrollment codes', async () => {
            const course = {
                id: new Types.ObjectId().toString(),
                title: 'Duplicate Code Course',
                enrollmentCode: 'CODE123'
            } as Course;

            courseRepository.findOne.mockResolvedValueOnce({
                title: 'Existing Course',
                enrollmentCode: 'CODE123'
            } as unknown as Course);

            await expect(courseService.importCourse(course))
                .rejects
                .toThrow(ClientError);
        });


        // Course with instructors
        it('should import course with instructors', async () => {
            const courseWithInstructors = {
                id: new Types.ObjectId().toString(),
                title: 'Advanced Course',
                description: 'Course with instructors',
                instructors: [
                    { _id: new Types.ObjectId(), name: 'John Doe' },
                    { _id: new Types.ObjectId(), name: 'Jane Smith' }
                ],
                categories: ['Programming'],
                enrollmentCode: 'ADV202',
                isPublished: true
            } as unknown as Course;

            courseRepository.findOne.mockResolvedValueOnce(null);
            courseRepository.create.mockResolvedValueOnce(courseWithInstructors);
            courseRepository.findById.mockResolvedValueOnce(courseWithInstructors);

            const result = await courseService.importCourse(courseWithInstructors);

            expect(result.instructors).toHaveLength(2);
            expect(result.instructors[0].name).toBe('John Doe');
        });

        // Course with modules and lessons
        it('should import course with modules and lessons', async () => {
            const courseWithModules = {
                id: new Types.ObjectId().toString(),
                title: 'Complete Course',
                description: 'Full course structure',
                modules: [{
                    id: new Types.ObjectId().toString(),
                    title: 'Module 1',
                    description: 'First module',
                    order: 1,
                    lessons: [
                        { title: 'Lesson 1', content: 'Content 1', order: 1 },
                        { title: 'Lesson 2', content: 'Content 2', order: 2 }
                    ]
                }],
                isPublished: true
            } as unknown as Course;

            courseRepository.findOne.mockResolvedValueOnce(null);
            courseRepository.create.mockResolvedValueOnce(courseWithModules);
            moduleRepository.create.mockResolvedValueOnce(courseWithModules.modules[0]);
            courseRepository.findById.mockImplementation((id, options = {}, session = undefined) => {
                return Promise.resolve(courseWithModules);
            });
            moduleService.getModulesByCourseIdDetail.mockImplementation((courseId, session = undefined) => {
                return Promise.resolve(courseWithModules.modules);
            });

            const result = await courseService.importCourse(courseWithModules);

            expect(result.modules).toHaveLength(1);
            expect(result.modules[0].lessons).toHaveLength(2);
            expect(moduleRepository.create).toHaveBeenCalledTimes(1);
        });

        // Complex course with everything
        it('should import complex course with all features', async () => {
            const complexCourse = {
                id: new Types.ObjectId().toString(),
                title: 'Master Course',
                description: 'Complete learning experience',
                instructors: [
                    { _id: new Types.ObjectId(), name: 'Expert One' }
                ],
                modules: [{
                    id: new Types.ObjectId().toString(),
                    title: 'Advanced Module',
                    description: 'Complex module',
                    order: 1,
                    lessons: [{ title: 'Complex Lesson', content: 'Advanced content', order: 1 }],
                    assignments: [{
                        id: new Types.ObjectId().toString(),
                        title: 'Final Project',
                        description: 'Complex assignment',
                        dueDate: new Date(),
                        tasks: []
                    }],
                    files: [{
                        id: new Types.ObjectId().toString(),
                        filename: 'resource.pdf',
                        originalname: 'Resource.pdf',
                        mimetype: 'application/pdf',
                        size: 1024
                    }]
                }],
                prerequisites: [new Types.ObjectId()],
                categories: ['Advanced', 'Programming'],
                enrollmentCode: 'MASTER303',
                isPublished: true,
                xpReward: 1000,
                version: 2
            } as unknown as Course;

            courseRepository.findOne.mockResolvedValueOnce(null);
            courseRepository.create.mockResolvedValueOnce(complexCourse);
            moduleRepository.create.mockResolvedValueOnce(complexCourse.modules[0]);
            assignmentRepository.create.mockResolvedValueOnce(complexCourse.modules[0].assignments[0]);
            fileRepository.create.mockResolvedValueOnce(complexCourse.modules[0].files[0]);
            courseRepository.findById.mockImplementation((id, options = {}, session = undefined) => {
                return Promise.resolve(complexCourse);
            });

            // Mock module service to return the modules
            moduleService.getModulesByCourseIdDetail.mockImplementation((courseId, session = undefined) => {
                return Promise.resolve(complexCourse.modules);
            });

            const result = await courseService.importCourse(complexCourse);

            expect(result).toMatchObject({
                title: 'Master Course',
                instructors: [expect.objectContaining({ name: 'Expert One' })],
                modules: expect.arrayContaining([
                    expect.objectContaining({
                        title: 'Advanced Module',
                        lessons: expect.arrayContaining([
                            expect.objectContaining({ title: 'Complex Lesson' })
                        ])
                    })
                ])
            });

            expect(moduleRepository.create).toHaveBeenCalledTimes(1);
            expect(assignmentRepository.create).toHaveBeenCalledTimes(1);
            expect(fileRepository.create).toHaveBeenCalledTimes(1);
        });
    });

});