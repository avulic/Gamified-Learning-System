import CourseController from "@/controllers/CourseController";
import { CreateCourseDetailsDto } from "@/models/dto/request";
import CourseService from "@/services/CourseService";
import ModuleService from "@/services/ModuleService";
import { TYPES } from "@/types";
import { MongoMemoryReplSet, MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { setupTestContainer, TestMocks } from "../testContainer";
import ModuleModel from '@/models/db/mongo/Module.db';
import CourseModel from '@/models/db/mongo/Course.db';

import AssignmentModel from '@/models/db/mongo/Assignment.db';
import UserModel from '@/models/db/mongo/User.db';
import FileModel from '@/models/db/mongo/File.db';
import BaseTask from '@/models/db/mongo/Task.db';
import { ParentType, ProgressTypeEnum, QuestionType, Roles, TaskTypeEnum } from "@/models/enums";
import { Assignment, Course, Module, MultiChoiceQuestion, QuizTask, QuizTaskContent, TrueFalseQuestion, User } from "@/models/app";
import { FileStatus } from "@/models/app/File.entity";
import { Lesson } from "@/models/app/Lesson.entity";
import { File } from "@/models/app/File.entity";
import AssignmentRepository from "@/repository/AssignmentRepository";
import { CourseRepository } from "@/repository/CourseRepository";
import { FileRepository } from "@/repository/FileRepository";
import { ModuleRepository } from "@/repository/ModuleRepository";
import { MongoUnitOfWork } from "@/repository/MongoUnitOfWork";
import { TaskRepository } from "@/repository/TaskRepository";
import { Logger } from "winston";
import { container as myContainer} from '@/config/inversify.config';
import { Container } from "inversify";
import { TaskService } from "@/services/TaskService";

export interface IntegrationTestContext {
    container: Container;
    replSet: MongoMemoryReplSet;
    courseService: CourseService;
    moduleService: ModuleService;
    courseController: CourseController;
    logger: Logger;
    unitOfWork: MongoUnitOfWork;
    courseRepository: jest.Mocked<CourseRepository>;
    taskService: TaskService;
}

export const setupIntegrationTest = async (): Promise<IntegrationTestContext> => {
    // Initialize MongoDB Memory Server
    // This will create an new instance of "MongoMemoryReplSet" and automatically start all Servers
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(replSet.getUri());
    //await mongoose.connect(uri);

    const Course = mongoose.model('Course', CourseModel.schema);
    const Module = mongoose.model('Module', ModuleModel.schema);
    const Assignment = mongoose.model('Assignment', AssignmentModel.schema);
    const User = mongoose.model('User', UserModel.schema);
    const File = mongoose.model('File', FileModel.schema);
    const Task = mongoose.model('Task', BaseTask.schema);



    await Promise.all([
        Course.createCollection(),
        Module.createCollection(),
        Assignment.createCollection(),
        User.createCollection(),
        File.createCollection(),
        Task.createCollection()
    ]);


    const { container, mocks } = await setupTestContainer(); 


    const unitOfWork = new MongoUnitOfWork(mongoose.connection);
    
    // Rebind UnitOfWork in container
    myContainer.rebind(TYPES.MongoUnitOfWork).toConstantValue(unitOfWork);


    return {
        container: myContainer,
        replSet,
        courseService: myContainer.get(TYPES.CourseService),
        moduleService: myContainer.get(TYPES.ModuleService),
        courseController: myContainer.get(TYPES.CourseController),
        logger: myContainer.get(TYPES.Logger),
        unitOfWork,
        courseRepository: mocks.courseRepository,
        taskService: myContainer.get(TYPES.TaskService),
    };
};

export const clearDatabase = async (): Promise<void> => {
    if (mongoose.connection.readyState === 1) {
        await Promise.all([
            CourseModel.deleteMany({}),
            ModuleModel.deleteMany({}),
            AssignmentModel.deleteMany({}),
            UserModel.deleteMany({}),
            FileModel.deleteMany({}),
            BaseTask.deleteMany({})
        ]);
    }
};

export const closeIntegrationTest = async (ctx: IntegrationTestContext): Promise<void> => {
    await mongoose.disconnect();
    await ctx.replSet.stop();
};




describe('Course Integration Tests', () => {
    let testContext: IntegrationTestContext;

    beforeAll(async () => {
        testContext = await setupIntegrationTest();
    }, 30000);

    afterAll(async () => {
        await closeIntegrationTest(testContext);
    });

    beforeEach(async () => {
       // Just clear collections without deleting model definitions
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        
        // Reset mocks if needed
        jest.clearAllMocks();
    });

    describe('Course Creation', () => {
        describe('Basic Course Creation', () => {
            it('should create a simple course successfully', async () => {
                // Arrange
                const professor = await createTestUser([Roles.PROFESSOR]);
                const course = createTestCourse(professor.id);

                // Act
                const savedCourse = await testContext.courseService.importCourse(course);

                // Assert
                expect(savedCourse).toBeDefined();
                expect(savedCourse.id).toBeDefined();
                expect(savedCourse.title).toBe(course.title);

                // Verify logs
                // expect(testContext.logger.info).toHaveBeenCalledWith(
                //     'Successfully created base course',
                //     expect.any(Object)
                // );
            });

            it('should handle course creation with empty modules array', async () => {
                const professor = await createTestUser([Roles.PROFESSOR]);
                const course = createTestCourse(professor.id);
                course.modules = [];

                const savedCourse = await testContext.courseService.importCourse(course);

                expect(savedCourse.modules).toHaveLength(0);
            });
        });

        describe('Complex Course Structure', () => {
            it('should create course with full nested structure', async () => {
                const unitOfWork = testContext.container.get<MongoUnitOfWork>(TYPES.MongoUnitOfWork);
                const beginTransactionSpy = jest.spyOn(unitOfWork, 'beginTransaction');
                const commitTransactionSpy = jest.spyOn(unitOfWork, 'commitTransaction');

                try {
                    const professor = await createTestUser([Roles.PROFESSOR]);
                    const course = createTestCourse(professor.id);
                    const module = createTestModule();
                    const assignment = createTestAssignment(ParentType.MODULE);
                    const quizTask = createTestQuizTask();
                    
                    assignment.tasks = [quizTask];
                    module.assignments = [assignment];
                    course.modules = [module];
                    
                    // Act
                    const savedCourse = await testContext.courseService.importCourse(course);

                    // Assert - Course Level
                    expect(savedCourse.id).toBeDefined();
                    expect(savedCourse.modules).toHaveLength(1);

                    // Assert - Module Level
                    const savedModule = savedCourse.modules[0];
                    expect(savedModule.courseId).toBe(savedCourse.id);
                    expect(savedModule.assignments).toHaveLength(1);

                    // Assert - Assignment Level
                    const savedAssignments = savedModule.assignments;
                    //expect(savedAssignment.parentId).toBe(savedModule.id);
                    expect(savedAssignments).toHaveLength(1);
                    //expect(savedAssignment.tasks).toHaveLength(1);

                    const savedTasks = await testContext.taskService.getTasksByAssignmentId(savedAssignments[0].id as string);
                    expect(savedTasks).toHaveLength(1);
                    expect(savedTasks[0].taskType).toBe(TaskTypeEnum.QUIZ);
                    expect((savedTasks[0].content as QuizTaskContent).questions).toBeDefined();

                    expect(beginTransactionSpy).toHaveBeenCalled();
                    expect(commitTransactionSpy).toHaveBeenCalled();

                } finally {
                    // Cleanup spies
                    beginTransactionSpy.mockRestore();
                    commitTransactionSpy.mockRestore();
                }
            });

            it('should save task content correctly when creating a course with nested structure', async () => {
                // Arrange
                const professor = await createTestUser([Roles.PROFESSOR]);
                const course = createTestCourse(professor.id);
                const module = createTestModule();
                const assignment = createTestAssignment(ParentType.MODULE);
                const quizTask = createTestQuizTask();

                assignment.tasks = [quizTask];
                module.assignments = [assignment];

                module.id = undefined; // Ensure we get a new ID
                module.courseId = ''; // Will be set during import
                
                course.modules = [module];
                // Act
                const savedCourse = await testContext.courseService.importCourse(course);
                
                // Assert - Course and Module Structure
                expect(savedCourse.id).toBeDefined();
                expect(savedCourse.modules).toHaveLength(1);
                
                const savedModule = savedCourse.modules[0];
                expect(savedModule.assignments).toHaveLength(1);
                
                // Get the saved tasks from the database
                const savedAssignment = savedModule.assignments[0];
                const savedTasks = await testContext.taskService.getTasksByAssignmentId(savedAssignment.id as string);
                
                // Assert - Task Structure
                expect(savedTasks).toHaveLength(1);
                const savedTask = savedTasks[0];
                expect(savedTask.taskType).toBe(TaskTypeEnum.QUIZ);
                
                // Assert - Task Content Details
                const taskContent = savedTask.content as QuizTaskContent;
                expect(taskContent).toBeDefined();
                expect(taskContent.questions).toHaveLength(2);
                expect(taskContent.timeLimit).toBe(45);
                expect(taskContent.passingScore).toBe(80);
                expect(taskContent.maxAttempts).toBe(3);
                
                // Verify first question (multi-choice)
                const multiChoiceQuestion = taskContent.questions[0] as MultiChoiceQuestion;
                expect(multiChoiceQuestion.question).toBe('What is the capital of France?');
                expect(multiChoiceQuestion.questionType).toBe(QuestionType.MULTI_CHOICE);
                expect(multiChoiceQuestion.options).toHaveLength(4);
                
                // Verify the correct answer in multi-choice question
                const correctOption = multiChoiceQuestion.options.find(opt => opt.isCorrect);
                expect(correctOption).toBeDefined();
                expect(correctOption?.text).toBe('Paris');
                
                // Verify second question (true/false)
                const trueFalseQuestion = taskContent.questions[1] as TrueFalseQuestion;
                expect(trueFalseQuestion.question).toBe('Is JavaScript a compiled language?');
                expect(trueFalseQuestion.questionType).toBe(QuestionType.TRUE_FALSE);
                expect(trueFalseQuestion.correctAnswer).toBe(false);
            });
        });

        it('should rollback transaction on error', async () => {
            // Setup spies
            const beginTransactionSpy = jest.spyOn(testContext.unitOfWork, 'beginTransaction');
            const commitTransactionSpy = jest.spyOn(testContext.unitOfWork, 'commitTransaction');
            const rollbackTransactionSpy = jest.spyOn(testContext.unitOfWork, 'rollbackTransaction');

            // Create invalid course data to force an error
            const professor = await createTestUser([Roles.PROFESSOR]);
            const invalidCourse = createTestCourse(professor.id);
            invalidCourse.title = ''; // This should cause validation to fail

            // Act & Assert
            await expect(testContext.courseService.importCourse(invalidCourse))
                .rejects.toThrow();

            // Verify transaction behavior
            expect(beginTransactionSpy).toHaveBeenCalled();
            expect(commitTransactionSpy).not.toHaveBeenCalled();
            expect(rollbackTransactionSpy).toHaveBeenCalled();

            // Verify no data was persisted
            const coursesInDb = await CourseModel.countDocuments();
            expect(coursesInDb).toBe(0);

            // Cleanup spies
            beginTransactionSpy.mockRestore();
            commitTransactionSpy.mockRestore();
            rollbackTransactionSpy.mockRestore();
        });
    });
});


function createTestUser(roles: Roles[] = [Roles.STUDENT]): User {
    return {
        id: `test-user-${Date.now()}`,
        name: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: 'hashedpassword',
        roles: roles.map(role => ({ name: role })),
        preferences: {
            notifications: true,
            theme: 'light',
            language: 'en'
        }
    } as User;
}

function createTestCourse(creatorId: string): Course {
    return {
        id:undefined,
        title: 'Test Course',
        description: 'This is a test course description that meets minimum length',
        modules: [],
        instructors: [],
        prerequisites: [],
        categories: ['test'],
        enrollmentCode: 'TEST123',
        isPublished: false,
        version: 1,
        lastUpdated: new Date(),
        enrolledStudentCount: 0,
        xpReward: 100,
        materials: [],
        assignments: []
    } as Course;
}

function createTestModule(): Module {
    const lesson = createTestLesson();
    return {
        id: undefined,
        courseId: '',
        title: 'Test Module',
        description: 'Test Module Description',
        order: 1,
        lessons: [lesson],
        learningObjectives: ['Test objective'],
        estimatedDuration: 60,
        difficulty: 1,
        publishedAt: new Date(),
        xpReward: 100,
        badgeReward: '1',
        prerequisites: [],
        assignments: [],
        files: []
    } as Module;
}

function createTestLesson(): Lesson {
    return {
        id: undefined,
        title: 'Test Lesson',
        content: 'Test content',
        order: 1,
        assignments: [],
        files: []
    } as Lesson;
}

function createTestAssignment(parentType: ParentType): Assignment {
    return {
        id: undefined,
        title: 'Test Assignment',
        description: 'Test assignment description',
        tasks: [],
        parentType,
        submissionWindow: {
            start: new Date(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            allowLateSubmissions: true,
            lateSubmissionPenalty: 10
        },
        maxAttempts: 3,
        passingScore: 70,
        points: 100
    } as Assignment;
}

function createTestQuizTask(): QuizTask {
    // Create the multi-choice question
    const multiChoiceQuestion = {
        question: 'What is the capital of France?',
        questionType: QuestionType.MULTI_CHOICE,
        options: [
            { text: 'London', isCorrect: false },
            { text: 'Paris', isCorrect: true },
            { text: 'Berlin', isCorrect: false },
            { text: 'Madrid', isCorrect: false }
        ]
    };
    
    // Create the true/false question
    const trueFalseQuestion = {
        question: 'Is JavaScript a compiled language?',
        questionType: QuestionType.TRUE_FALSE,
        correctAnswer: false
    };
    
    return {
        id: undefined,
        title: 'Test Quiz',
        description: 'Test quiz description',
        taskType: TaskTypeEnum.QUIZ,
        status: ProgressTypeEnum.NOT_STARTED,
        points: 100,
        order: 1,
        xpReward: 50,
        requiredForCompletion: true,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        content: {
            questions: [multiChoiceQuestion, trueFalseQuestion],
            timeLimit: 45,
            passingScore: 80,
            maxAttempts: 3
        },
        submissionWindow: {
            start: new Date(),
            end: new Date(Date.now() + 24 * 60 * 60 * 1000),
            allowLateSubmissions: false,
            lateSubmissionPenalty: 0.01  
        },
        assignmentId: ""
    } as QuizTask;
}







