import { NotFoundError } from '../models/app/Errors/NotFoundError';
import { ClientError } from '../models/app/Errors/ClientError';
import Logger from '../utils/logger';

import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import { Course, Assignment as IAssignment, Course as ICourse, Module as IModule, User as IUser, Module, QuizTaskContent, Task } from '@/models/app';
import { ResponseDto, RequestDto } from '@/models/dto/index';
import { CourseRepository } from '@/repository/CourseRepository';
import { UserRepository } from '@/repository/UserRepository';
import { ModuleRepository } from '@/repository/ModuleRepository';

import AssignmentRepository from '@/repository/AssignmentRepository';
import { MongoUnitOfWork } from '@/repository/MongoUnitOfWork';
import { FileRepository } from '@/repository/FileRepository';
import { CreateFileDto } from '@/models/dto/request';
import { File } from '@/models/app/File.entity';
import { Assignment, ParentType } from '@/models/app/Assignment.entity';
import { Lesson } from '@/models/app/Lesson.entity';
import { ValidationError } from 'class-validator';
import { TaskRepository } from '@/repository/TaskRepository';
import { th } from '@faker-js/faker';
import { ClientSession } from 'mongoose';
import ModuleService from './ModuleService';
import { TaskService } from './TaskService';
import { TaskTypeEnum } from '@/models/enums';

interface ImportResult<T> {
    entity: T;
    oldId?: string;
    newId: string;
}

@injectable()
export class CourseService {
    constructor(
        @inject(TYPES.CourseRepository) private courseRepository: CourseRepository,
        @inject(TYPES.ModuleRepository) private moduleRepository: ModuleRepository,
        @inject(TYPES.ModuleService) private moduleService: ModuleService,
        @inject(TYPES.AssignmentRepository) private assignmentRepository: AssignmentRepository,
        @inject(TYPES.TaskRepository) private taskRepository: TaskRepository,
        @inject(TYPES.FileRepository) private fileRepository: FileRepository,
        @inject(TYPES.TaskService) private taskService: TaskService,
        @inject(TYPES.MongoUnitOfWork) private unitOfWork: MongoUnitOfWork,
        @inject(TYPES.Logger) private logger: ILogger
    ) { }

    async createCourse(newCourseData: ICourse): Promise<ICourse> {
        // Fetch modules
        // newCourseData.modules = await Promise.all(
        //     newCourseData.modulesId.map(async moduleId => {
        //         const module = await this.moduleRepository.findById(moduleId);
        //         if(!module)
        //             throw new NotFoundError("module not found");
        //         return module;
        //     })
        // );

        // // Fetch instructors
        // newCourseData.instructors = await Promise.all(
        //     newCourseData.instructorsId.map(async instId => {
        //         const instructor = await this.userRepository.findById(instId);
        //         if(!instructor)
        //             throw new NotFoundError("User(instructor) not found");
        //         return instructor;
        //     })
        // );

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

    async getCoursesByIds(courseIds: string[]): Promise<ICourse[]> {
        const course = await this.courseRepository.findByIds(courseIds);
        return course;
    }

    async getCourseByIdFull(courseId: string): Promise<ICourse> {
        const populateOptions = ['modules', 'assignmentIds', 'fileIds', 'instructors']
        const course = await this.courseRepository.findById(courseId, { populate: populateOptions });
        if (!course) {
            throw new NotFoundError('Course not found');
        }

        const modules = await this.moduleService.getModulesByCourseIdDetail(course.id as string);
        course.modules = modules;
        return course;
    }

    async updateCourse(id: string, updateCourseData: ICourse): Promise<ICourse> {
        const existingCourse = await this.courseRepository.findById(id);
        if (!existingCourse) {
            throw new NotFoundError('Course not found');
        }

        // // Fetch and update instructors if provided
        // if (!updateCourseData.instructors) {
        //     updateCourseData.instructors = await Promise.all(
        //         existingCourse.instructorsId.map(async id => {
        //             const instructor = await this.userRepository.findById(id);
        //             if(!instructor)
        //                 throw new NotFoundError("User(instructor) not found");
        //             return instructor;
        //         })
        //     );
        // }

        // // Fetch and update modules if provided
        // if (!updateCourseData.modules) {
        //     updateCourseData.modules = await Promise.all(
        //         existingCourse.modulesId.map(async id => {
        //             const module = await this.moduleRepository.findById(id);
        //             if(!module)
        //                 throw new NotFoundError("Module not found");
        //             return module;
        //         })
        //     );
        // }

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
        if (!courses)
            throw new NotFoundError("courses not found");

        return courses;
    }

    async getCoursesByInstructor(instructorId: string): Promise<ICourse[]> {
        const courses = await this.courseRepository.findByInstructor(instructorId);
        if (!courses)
            throw new NotFoundError("courses not found");

        return courses;
    }


    async importCourse(course: Course): Promise<Course> {
        this.logger.debug('Starting course import process', {
            courseTitle: course.title,
            moduleCount: course.modules?.length,
            hasAssignments: !!course.assignments,
            hasMaterials: !!course.materials
        });

        const session = await this.unitOfWork.beginTransaction();

        try {
            this.logger.debug('Validating course uniqueness', { title: course.title });
            await this.validateCourseUniqueness(course.title, session);

            // Make sure modules is initialized but don't modify the input course
            const courseToCreate = {
                ...course,
                modules: []
            };

            this.logger.debug('Creating base course');
            const createdCourse = await this.courseRepository.create(courseToCreate, {}, session).catch(error => {
                this.logger.error('Failed to create course in repository', {
                    error: error.message,
                    courseTitle: course.title
                });
                throw error; // Re-throw to trigger the catch block
            });

            // Check for successful creation
            if (!createdCourse || !createdCourse.id) {
                throw new NotFoundError('Failed to create course or missing ID');
            }

            this.logger.info('Successfully created base course', {
                courseId: createdCourse.id,
                title: createdCourse.title
            });

            if (course.materials?.length > 0) {
                await this.processFiles(course.materials, createdCourse.id, ParentType.COURSE, session);
            }

            if (course.assignments?.length > 0) {
                await this.processAssignments(course.assignments, createdCourse.id, ParentType.COURSE, session);
            }

            if (course.modules?.length > 0) {
                await this.processModules(course.modules, createdCourse.id, session);
            }

            const completeCourse = await this.fetchCompleteCourse(createdCourse.id, session);
            await this.unitOfWork.commitTransaction(session);
            return completeCourse;
        } catch (error: any) {
            this.logger.error('Failed to import course', {
                error: error.message,
                stack: error.stack,
                courseTitle: course.title
            });
            await this.unitOfWork.rollbackTransaction(session);
            throw error; // Re-throw the error to maintain the rejection chain
        }
    }

    private async validateCourseUniqueness(title: string, session: ClientSession): Promise<void> {
        const existingCourse = await this.courseRepository.findOne(
            { title },
            session
        );

        if (existingCourse) {
            throw new ClientError(`Course with title "${title}" already exists`);
        }
    }

    private async fetchCompleteCourse(courseId: string, session?: ClientSession): Promise<Course> {
        this.logger.debug('Fetching complete course', {
            courseId,
            hasSession: !!session
        });

        // Define population options
        const populateOptions = ['assignmentIds', 'fileIds', 'instructors'];

        try {
            let course: Course | null = null;

            // Try to fetch the course with session if provided
            if (session) {
                this.logger.debug('Attempting to fetch course with session');
                course = await this.courseRepository.findById(courseId, { populate: populateOptions }, session);

                if (course) {
                    this.logger.debug('Course found with session, fetching modules');
                    try {
                        // Fetch modules for the course
                        // const modules = await this.moduleRepository.find({ 
                        //     courseId: course.id 
                        // } as Module, { populate:['assignmentIds' ], session });

                        const modules = await this.moduleService.getModulesByCourseIdDetail(course.id as string, session);

                        this.logger.debug('Modules fetched directly', {
                            count: modules.length,
                            ids: modules.map(m => m.id)
                        });

                        course.modules = modules;
                    } catch (moduleError) {
                        this.logger.warn('Error fetching modules for course', {
                            error: moduleError instanceof Error ? moduleError.message : 'Unknown error',
                            courseId: course.id
                        });
                        // If modules can't be fetched, set an empty array
                        course.modules = [];
                    }
                }
            }

            // If no course found with session or no session provided, try without session
            if (!course) {
                this.logger.debug('Attempting to fetch course without session');
                course = await this.courseRepository.findById(courseId, { populate: populateOptions });

                if (course) {
                    this.logger.debug('Course found without session, fetching modules');
                    try {
                        // Fetch modules for the course
                        const modules = await this.moduleService.getModulesByCourseIdDetail(course.id as string);
                        course.modules = modules;
                    } catch (moduleError) {
                        this.logger.warn('Error fetching modules for course', {
                            error: moduleError instanceof Error ? moduleError.message : 'Unknown error',
                            courseId: course.id
                        });
                        // If modules can't be fetched, set an empty array
                        course.modules = [];
                    }
                }
            }

            if (!course) {
                this.logger.error('Course not found', { courseId });
                throw new NotFoundError(`Course with ID ${courseId} not found`);
            }

            this.logger.debug('Successfully fetched course', {
                courseId,
                hasModules: course.modules?.length || 0,
                hasAssignments: course.assignments?.length || 0
            });

            return course;
        } catch (error) {
            this.logger.error('Failed to fetch complete course', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                courseId
            });

            // If it's already a NotFoundError, rethrow it
            if (error instanceof NotFoundError) {
                throw error;
            }

            // Otherwise, wrap it in a NotFoundError
            throw new NotFoundError('Failed to fetch created course');
        }
    }

    private handleProcessingError(error: any): Error {
        if (error instanceof ClientError || error instanceof NotFoundError) {
            return error;
        }
        if (error.message === "Course not created") {
            return new NotFoundError(error.message);
        }
        this.logger.error('Course processing failed', {
            error: error.message,
            stack: error.stack
        });
        return new Error(`Course processing failed: ${error.message}`);
    }

    private async processModules(
        modules: Module[],
        courseId: string,
        session: ClientSession
    ): Promise<void> {
        this.logger.debug('Starting module processing', {
            moduleCount: modules.length,
            courseId
        });

        const createdModules = await Promise.all(
            modules.map(async (module, index) => {
                this.logger.debug('Processing module', {
                    moduleTitle: module.title,
                    moduleIndex: index,
                    courseId
                });

                const moduleToCreate: Module = {
                    ...module,
                    courseId: courseId,
                    order: module.order || index,
                    lessons: module.lessons?.map((lesson, lessonIndex) => ({
                        ...lesson,
                        order: lesson.order || lessonIndex
                    })) || []
                };

                const createdModule = await this.moduleRepository.create(moduleToCreate, {}, session);

                if (!createdModule || !createdModule.id) {
                    this.logger.error('Failed to create module', {
                        moduleTitle: module.title,
                        courseId
                    });
                    throw new Error('Failed to create module');
                }

                this.logger.debug('Successfully created module', {
                    moduleId: createdModule.id,
                    moduleTitle: createdModule.title
                });

                if (module.files) {
                    this.logger.debug('Processing module files', {
                        fileCount: module.files.length,
                        moduleId: createdModule.id
                    });
                    await this.processFiles(module.files, createdModule.id, ParentType.MODULE, session);
                }

                if (module.assignments) {
                    this.logger.debug('Processing module assignments', {
                        assignmentCount: module.assignments.length,
                        moduleId: createdModule.id
                    });
                    const createdAssignments = await this.processAssignments(module.assignments, createdModule.id, ParentType.MODULE, session);

                    if (!createdAssignments) {
                        throw new Error("Assignments not created in module");
                    }

                    await this.moduleRepository.update(createdModule.id, {
                        assignments: createdAssignments
                    } as Module, session);
                }

                if (module.lessons) {
                    this.logger.debug('Processing module lessons', {
                        lessonCount: module.lessons.length,
                        moduleId: createdModule.id
                    });
                    await this.processLessonContent(module.lessons, createdModule.id, session);
                }

                return {
                    id: createdModule.id,
                    title: createdModule.title,
                    order: createdModule.order
                };
            })
        );

        if (!(createdModules.length > 0)) {
            this.logger.error('No modules created', { courseId });
            throw new NotFoundError("No modules created");
        }

        this.logger.debug('Updating course with module references', {
            moduleCount: createdModules.length,
            courseId
        });

        await this.courseRepository.update(courseId, {
            modules: createdModules.sort((a, b) => a.order - b.order)
        } as Course, session);


        // Verify the course was updated correctly
        const updatedCourse = await this.courseRepository.findById(courseId, {}, session);
        this.logger.debug('Course after module update', {
            hasModules: updatedCourse?.modules?.length || 0
        });

        this.logger.info('Successfully processed all modules', {
            moduleCount: createdModules.length,
            courseId
        });
    }

    private async processFiles(
        files: File[],
        parentId: string,
        parentType: ParentType,
        session: ClientSession
    ): Promise<void> {
        this.logger.debug('Processing files', {
            fileCount: files.length,
            parentId,
            parentType
        });

        await Promise.all(
            files.map(async file => {
                try {
                    this.logger.debug('Creating file', {
                        filename: file.filename,
                        parentId,
                        parentType
                    });

                    await this.fileRepository.create({
                        ...file,
                        parentId,
                        parentType
                    }, {}, session);
                } catch (error: any) {
                    this.logger.error('Failed to create file', {
                        filename: file.filename,
                        error: error.message,
                        parentId,
                        parentType
                    });
                    throw error;
                }
            })
        );

        this.logger.debug('Successfully processed all files', {
            fileCount: files.length,
            parentId,
            parentType
        });
    }

    private async processAssignments(
        assignments: Assignment[],
        parentId: string,
        parentType: ParentType,
        session: ClientSession
    ): Promise<Assignment[] | null> {
        this.logger.debug('Processing assignments', {
            assignmentCount: assignments.length,
            parentId,
            parentType
        });

        return await Promise.all(
            assignments.map(async assignment => {
                try {
                    this.logger.debug('Creating assignment', {
                        assignmentTitle: assignment.title,
                        parentId,
                        parentType
                    });

                    const createdAssignment = await this.assignmentRepository.create({
                        ...assignment,
                        parentId,
                        parentType
                    }, {}, session);

                    if (!createdAssignment || !createdAssignment.id) {
                        this.logger.error('Failed to create assignment', {
                            assignmentTitle: assignment.title,
                            parentId,
                            parentType
                        });
                        throw new Error('Failed to create assignment: Missing assignment ID');
                    }

                    if (assignment.tasks?.length) {
                        this.logger.debug('Processing assignment tasks', {
                            taskCount: assignment.tasks.length,
                            assignmentId: createdAssignment.id
                        });
                        await this.processTasks(assignment.tasks, createdAssignment.id, session);
                    }

                    this.logger.debug('Successfully processed all assignments', {
                        assignmentCount: assignments.length,
                        parentId,
                        parentType
                    });

                    return createdAssignment;
                } catch (error: any) {
                    this.logger.error('Assignment processing failed', {
                        error: error.message,
                        parentId,
                        parentType
                    });
                    throw error;
                }
            })
        );
    }

    private async processTasks(tasks: Task[], assignmentId: string, session: ClientSession): Promise<void> {
        try {
            await Promise.all(
                tasks.map((task, index) => {
                    this.logger.debug('Creating task with content', {
                        taskType: task.taskType,
                        hasContent: !!task.content,
                        contentKeys: task.content ? Object.keys(task.content) : []
                    });
                    const preparedTask = this.prepareTaskForSaving(task, assignmentId);
                    const tasksCreated = this.taskService.createTask(assignmentId, preparedTask, session);
                })
            );
        } catch (error: any) {
            this.logger.error('Failed to import tasks', {
                error: error.message,
                stack: error.stack,
                tasksTitle: tasks[0].title
            });
            throw error;
        }
    }


    private prepareTaskForSaving(task: Task, assignmentId: string): Task {
        // Make a deep copy to avoid modifying original
        const preparedTask = JSON.parse(JSON.stringify(task));
        preparedTask.assignmentId = assignmentId;

        // For quiz tasks, ensure questions have proper structure
        if (task.taskType === TaskTypeEnum.QUIZ && task.content) {
            const quizContent = task.content as QuizTaskContent;
            if (quizContent.questions && Array.isArray(quizContent.questions)) {
                // Log the questions structure
                this.logger.debug('Quiz questions structure:', {
                    questionsCount: quizContent.questions.length,
                    firstQuestion: quizContent.questions[0] ? {
                        type: quizContent.questions[0].questionType,
                        text: quizContent.questions[0].question,
                        hasOptions: !!(quizContent.questions[0] as any).options
                    } : null
                });
            }
        }

        return preparedTask;
    }



    private async processLessonContent(
        lessons: Lesson[],
        moduleId: string,
        session: ClientSession
    ): Promise<void> {
        const operations = lessons.flatMap(lesson => [
            ...(lesson.assignments ? [
                this.processAssignments(lesson.assignments, moduleId, ParentType.LESSON, session)
            ] : []),
            ...(lesson.files ? [
                this.processFiles(lesson.files, moduleId, ParentType.LESSON, session)
            ] : [])
        ]);

        await Promise.all(operations);
    }
}


export default CourseService;

