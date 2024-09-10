
import { Container } from 'inversify';

import { TYPES } from '../types';
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
import { ProgressService } from '@/services/Progress/ProgressService';
import UserService from '@/services/UserService';

import { IUserDb } from '@/models/db/mongo';
import User from '@/models/db/mongo/User';
import { Model } from 'mongoose';
import Logger from '@/utils/logger';
import { ProgressController } from '@/controllers/ProgressController';
import TaskProgressRepository from '@/repository/Progress/TaskProgressRepository';
import UserProgressRepository from '@/repository/Progress/UserProgressRepository';


const container = new Container();

// Services
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<AssignmentService>(TYPES.AssignmentService).to(AssignmentService);
container.bind<CourseService>(TYPES.CourseService).to(CourseService);
container.bind<ModuleService>(TYPES.ModuleService).to(ModuleService);
container.bind<SubmissionService>(TYPES.SubmissionService).to(SubmissionService);
container.bind<FileService>(TYPES.FileService).to(FileService);
container.bind<ProgressService>(TYPES.ProgressService).to(ProgressService);


// Controllers
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<AssignmentController>(TYPES.AssignmentController).to(AssignmentController);
container.bind<CourseController>(TYPES.CourseController).to(CourseController);
container.bind<ModuleController>(TYPES.ModuleController).to(ModuleController);
container.bind<ProgressController>(TYPES.ProgressController).to(ProgressController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

//Repository
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<RoleRepository>(TYPES.RoleRepository).to(RoleRepository);
container.bind<MongoUnitOfWork>(TYPES.MongoUnitOfWork).to(MongoUnitOfWork);
container.bind<CourseRepository>(TYPES.CourseRepository).to(CourseRepository);
container.bind<ModuleRepository>(TYPES.ModuleRepository).to(ModuleRepository);
container.bind<AssignmentRepository>(TYPES.AssignmentRepository).to(AssignmentRepository);
container.bind<SubmissionRepository>(TYPES.SubmissionRepository).to(SubmissionRepository);
container.bind<FileRepository>(TYPES.FileRepository).to(FileRepository);
container.bind<TaskProgressRepository>(TYPES.TaskProgressRepository).to(TaskProgressRepository);
container.bind<UserProgressRepository>(TYPES.UserProgressRepository).to(UserProgressRepository);

container.bind<Logger>(TYPES.Logger).to(Logger);




export { container };