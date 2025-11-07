
import { Container } from 'inversify';

import { ILogger, TYPES } from '../types';
import AssignmentController from '@/controllers/AssignmentController';
import AuthController from '@/controllers/AuthController';
import CourseController from '@/controllers/CourseController';
import ModuleController from '@/controllers/ModuleController';

import UserController from '@/controllers/UserController';
import AssignmentRepository from '@/repository/AssignmentRepository';
import { CourseRepository } from '@/repository/CourseRepository';
import { FileRepository } from '@/repository/FileRepository';
import { ModuleRepository } from '@/repository/ModuleRepository';
import { MongoUnitOfWork } from '@/repository/MongoUnitOfWork';
import { RoleRepository } from '@/repository/RoleRepository';
import { SubmissionRepository } from '@/repository/SubmissionRepository';

import { UserRepository } from '@/repository/UserRepository';
import AssignmentService from '@/services/AssignmentService';
import CourseService from '@/services/CourseService';
import FileService from '@/services/FileService';
import ModuleService from '@/services/ModuleService';
import { SubmissionService } from '@/services/SubmissionService';
import UserService from '@/services/UserService';


import loggerInstance from '@/utils/logger';
import { ProgressController } from '@/controllers/ProgressController';
import UserProgressRepository from '@/repository/Progress/UserProgressRepository';


import mongoose, { Connection } from 'mongoose';
import { IUnitOfWork } from '@/repository/interface/IUnitOfWork';
import { TaskRepository } from '@/repository/TaskRepository';
import { TaskService } from '@/services/TaskService';
import AiService from '@/services/AiService';
import TaskController from '@/controllers/TaskController';
import SubmissionController from '@/controllers/SubmissionController';
import AssignmentProgressRepository from '@/repository/AssignmentProgressRepository';



const container = new Container();

container.bind<Connection>(TYPES.DbConnection).toConstantValue(mongoose.connection);

// Services
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<AssignmentService>(TYPES.AssignmentService).to(AssignmentService);
container.bind<CourseService>(TYPES.CourseService).to(CourseService);
container.bind<ModuleService>(TYPES.ModuleService).to(ModuleService);
container.bind<SubmissionService>(TYPES.SubmissionService).to(SubmissionService);
container.bind<FileService>(TYPES.FileService).to(FileService);
container.bind<TaskService>(TYPES.TaskService).to(TaskService);
container.bind<AiService>(TYPES.AiService).to(AiService);

// Controllers
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<AssignmentController>(TYPES.AssignmentController).to(AssignmentController);
container.bind<CourseController>(TYPES.CourseController).to(CourseController);
container.bind<ModuleController>(TYPES.ModuleController).to(ModuleController);
container.bind<ProgressController>(TYPES.ProgressController).to(ProgressController);
container.bind<TaskController>(TYPES.TaskController).to(TaskController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<SubmissionController>(TYPES.SubmissionController).to(SubmissionController);

//Repository
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<RoleRepository>(TYPES.RoleRepository).to(RoleRepository);
container.bind<MongoUnitOfWork>(TYPES.MongoUnitOfWork).to(MongoUnitOfWork);
container.bind<CourseRepository>(TYPES.CourseRepository).to(CourseRepository);
container.bind<ModuleRepository>(TYPES.ModuleRepository).to(ModuleRepository);
container.bind<AssignmentRepository>(TYPES.AssignmentRepository).to(AssignmentRepository);
container.bind<SubmissionRepository>(TYPES.SubmissionRepository).to(SubmissionRepository);
container.bind<FileRepository>(TYPES.FileRepository).to(FileRepository);
container.bind<UserProgressRepository>(TYPES.UserProgressRepository).to(UserProgressRepository);
container.bind<TaskRepository>(TYPES.TaskRepository).to(TaskRepository);
container.bind<AssignmentProgressRepository>(TYPES.AssignmentProgressRepository).to(AssignmentProgressRepository);




container
    .bind<ILogger>(TYPES.Logger)
    .toConstantValue(loggerInstance);




export { container };