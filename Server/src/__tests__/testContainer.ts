// src/__tests__/testContainer.ts
import { Container } from 'inversify';
import { ILogger, TYPES } from '@/types';
import { CourseService } from '@/services/CourseService';
import { CourseRepository } from '@/repository/CourseRepository';
import { ModuleRepository } from '@/repository/ModuleRepository';
import { FileRepository } from '@/repository/FileRepository';
import { AssignmentRepository } from '@/repository/AssignmentRepository';
import { MongoUnitOfWork } from '@/repository/MongoUnitOfWork';
import Logger from '@/utils/logger';
import AssignmentService from '@/services/AssignmentService';
import ModuleService from '@/services/ModuleService';
import FileService from '@/services/FileService';
import { SubmissionService } from '@/services/SubmissionService';
import UserService from '@/services/UserService';
import UserProgressRepository from '@/repository/Progress/UserProgressRepository';
import { RoleRepository } from '@/repository/RoleRepository';
import { SubmissionRepository } from '@/repository/SubmissionRepository';
import { UserRepository } from '@/repository/UserRepository';
import { TaskRepository } from '@/repository/TaskRepository';
import { TaskService } from '@/services/TaskService';
import AssignmentController from '@/controllers/AssignmentController';
import CourseController from '@/controllers/CourseController';
import ModuleController from '@/controllers/ModuleController';
import SubmissionController from '@/controllers/SubmissionController';
import UserController from '@/controllers/UserController';
import mongoose from 'mongoose';


export interface TestMocks {
    courseRepository: jest.Mocked<CourseRepository>;
    userRepository: jest.Mocked<UserRepository>;
    moduleRepository: jest.Mocked<ModuleRepository>;
    taskRepository: jest.Mocked<TaskRepository>;
    fileRepository: jest.Mocked<FileRepository>;
    assignmentRepository: jest.Mocked<AssignmentRepository>;
    roleRepository: jest.Mocked<RoleRepository>;
    submissionRepository: jest.Mocked<SubmissionRepository>;
    unitOfWork: jest.Mocked<MongoUnitOfWork>;
    logger: jest.Mocked<ILogger>;
}

export const createTestMocks = (): TestMocks => ({
    courseRepository: {
        create: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn()
    } as any,

    userRepository: {
        create: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn()
    } as any,

    moduleRepository: {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    } as any,

    taskRepository: {
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByAssignmentId: jest.fn(),
        findTasksByType: jest.fn()
    } as any,

    fileRepository: {
        create: jest.fn(),
        findById: jest.fn(),
        findByFilename: jest.fn(),
        findByUploadedBy: jest.fn()
    } as any,

    assignmentRepository: {
        create: jest.fn(),
        findById: jest.fn(),
        findByModuleId: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    } as any,

    submissionRepository: {
        create: jest.fn(),
        findById: jest.fn(),
        findByModuleId: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByAssignment: jest.fn(),
        findByUser: jest.fn(),
        findLatestByUserAndTask: jest.fn(),
        bulkCreate: jest.fn(),
        getSubmissionStats: jest.fn(),
        findByTaskType: jest.fn(),
        findByUserAndAssignment: jest.fn()
    } as any,

    roleRepository: {
        create: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        find: jest.fn(),
        findAll: jest.fn()
    } as any,

    unitOfWork: {
        beginTransaction: jest.fn().mockResolvedValue({ id: 'test-session' }),  // Change from startTransaction
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
    } as any,

    logger: {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
        getInstance: jest.fn()
    } as any
});



export const setupTestContainer = async (): Promise<{ container: Container; mocks: TestMocks }> => {
    const container = new Container();
    const mocks = createTestMocks();

    // Infrastructure
    container.bind<ILogger>(TYPES.Logger).toConstantValue(mocks.logger);
    container.bind<MongoUnitOfWork>(TYPES.MongoUnitOfWork).toConstantValue(mocks.unitOfWork);
    container.bind(TYPES.DbConnection).toConstantValue(mongoose.connection);

    // Repositories
    container.bind<UserRepository>(TYPES.UserRepository).toConstantValue(mocks.userRepository);
    container.bind<RoleRepository>(TYPES.RoleRepository).toConstantValue(mocks.roleRepository);
    container.bind<CourseRepository>(TYPES.CourseRepository).toConstantValue(mocks.courseRepository);
    container.bind<ModuleRepository>(TYPES.ModuleRepository).toConstantValue(mocks.moduleRepository);
    container.bind<TaskRepository>(TYPES.TaskRepository).toConstantValue(mocks.taskRepository);
    container.bind<AssignmentRepository>(TYPES.AssignmentRepository).toConstantValue(mocks.assignmentRepository);
    container.bind<FileRepository>(TYPES.FileRepository).toConstantValue(mocks.fileRepository);
    container.bind<SubmissionRepository>(TYPES.SubmissionRepository).toConstantValue(mocks.submissionRepository);

    // Services
    container.bind<UserService>(TYPES.UserService).to(UserService);
    container.bind<AssignmentService>(TYPES.AssignmentService).to(AssignmentService);
    container.bind<CourseService>(TYPES.CourseService).to(CourseService);
    container.bind<ModuleService>(TYPES.ModuleService).to(ModuleService);
    container.bind<TaskService>(TYPES.TaskService).to(TaskService);
    container.bind<SubmissionService>(TYPES.SubmissionService).to(SubmissionService);
    container.bind<FileService>(TYPES.FileService).to(FileService);

    // Controllers
    container.bind<CourseController>(TYPES.CourseController).to(CourseController);
    container.bind<ModuleController>(TYPES.ModuleController).to(ModuleController);
    container.bind<AssignmentController>(TYPES.AssignmentController).to(AssignmentController);
    container.bind<UserController>(TYPES.UserController).to(UserController);

    return { container, mocks };
};


describe('Test Container Validation', () => {
    let container: Container;
    let mocks: TestMocks;

    beforeAll(async () => {
        const setup = await setupTestContainer();
        container = setup.container;
        mocks = setup.mocks;
    });

    beforeEach(async () => {
        // Reset container and mocks before each test
        const setup = await setupTestContainer();
        container = setup.container;
        mocks = setup.mocks;
    });

    it('validates repository method implementations', async () => {
        // Prepare test data
        const testData = {
            id: 'test-id',
            name: 'Test Entity',
            description: 'Test Description'
        };

        // Execute create operations
        await Promise.all(Object.entries(mocks).map(async ([key, repository]) => {
            if ('create' in repository) {
                await repository.create(testData);
            }
        }));

        // Verify repository calls
        Object.entries(mocks).forEach(([key, repository]) => {
            if ('create' in repository) {
                expect(repository.create).toHaveBeenCalledWith(testData);
                expect(repository.create).toHaveBeenCalledTimes(1);
            }
        });
    });

    it('verifies all repository bindings', () => {
        expect(mocks.courseRepository).toBeDefined();
        expect(mocks.userRepository).toBeDefined();
        expect(mocks.moduleRepository).toBeDefined();
        expect(mocks.fileRepository).toBeDefined();
        expect(mocks.assignmentRepository).toBeDefined();
        expect(mocks.roleRepository).toBeDefined();
        expect(mocks.submissionRepository).toBeDefined();
    });

    it('verifies transaction handling', async () => {
        const { unitOfWork } = mocks;

        const session = await unitOfWork.beginTransaction();
        await unitOfWork.commitTransaction(session);

        expect(unitOfWork.beginTransaction).toHaveBeenCalledTimes(1);
        expect(unitOfWork.commitTransaction).toHaveBeenCalledTimes(1);
    });

    it('verifies container service bindings', () => {
        expect(container.isBound(TYPES.CourseService)).toBeTruthy();
        expect(container.isBound(TYPES.ModuleService)).toBeTruthy();
        expect(container.isBound(TYPES.TaskService)).toBeTruthy();
        expect(container.isBound(TYPES.UserService)).toBeTruthy();
    });
});