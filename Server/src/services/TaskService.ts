
// TaskService.ts
import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import { IUnitOfWork } from '@/repository/interface/IUnitOfWork';
import { Task } from '@/models/app';
import { TaskTypeEnum, ProgressTypeEnum } from '@/models/enums';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { ClientError } from '@/models/app/Errors/ClientError';
import Logger from '@/utils/logger';
import { TaskRepository } from '@/repository/TaskRepository';
import { MongoUnitOfWork } from '@/repository/MongoUnitOfWork';
import { ClientSession } from 'mongoose';

@injectable()
export class TaskService {
    constructor(
        @inject(TYPES.MongoUnitOfWork) private unitOfWork: MongoUnitOfWork,
        @inject(TYPES.TaskRepository) private taskRepository: TaskRepository,
        @inject(TYPES.Logger) private logger: ILogger
    ) { }

    async createTask(assignmentId: string, task: Task, session?: ClientSession): Promise<Task> {
        try {
            task.assignmentId = assignmentId;

            const createdTask = await this.taskRepository.create(task, {}, session);

            return createdTask;
        } catch (error) {
            this.logger.error('Error creating task', { assignmentId, error });
            throw error;
        }
    }

    async getTaskById(taskId: string): Promise<Task> {
        try {
            const task = await this.taskRepository.findById(taskId);
            if (!task) {
                throw new NotFoundError(`Task with ID ${taskId} not found`);
            }
            return task;
        } catch (error) {
            this.logger.error('Error fetching task', { taskId, error });
            throw error;
        }
    }
    async getAllTasks(): Promise<Task[]> {
        try {
            const tasks = await this.taskRepository.findAll();
            if (!tasks) {
                throw new NotFoundError(`Task not found`);
            }
            return tasks;
        } catch (error) {
            this.logger.error('Error fetching task', { error });
            throw error;
        }
    }


    async deleteTask(taskId: string): Promise<boolean> {
        const session = await this.unitOfWork.beginTransaction();
        try {
            const result = await this.taskRepository.delete(taskId, session);
            if (!result) {
                throw new NotFoundError(`Task with ID ${taskId} not found`);
            }
            await this.unitOfWork.commitTransaction(session);
            this.logger.info('Task deleted successfully', { taskId });
            return true;
        } catch (error) {
            await this.unitOfWork.rollbackTransaction(session);
            this.logger.error('Error deleting task', { taskId, error });
            throw error;
        }
    }

    async getTasksByAssignmentId(assignmentId: string, session?: ClientSession): Promise<Task[]> {
        try {
            const tasks = await this.taskRepository.findByAssignmentId(assignmentId, {}, session);
            return tasks;
        } catch (error) {
            this.logger.error('Error fetching tasks by assignment', { assignmentId, error });
            throw new ClientError('Failed to fetch tasks');
        }
    }

    private isValidTask(task: Task): boolean {
        if (!task.title ||
            task.taskType === undefined ||
            task.points === undefined ||
            task.xpReward === undefined ||
            task.requiredForCompletion === undefined
        ) {
            throw new ClientError('Missing required task fields');
        }
        return true;
    }

    async getTasksByType(taskType: TaskTypeEnum): Promise<Task[]> {
        try {
            const tasks = await this.taskRepository.findTasksByType(taskType);
            return tasks;
        } catch (error) {
            this.logger.error('Error fetching tasks by type', { taskType, error });
            throw new ClientError('Failed to fetch tasks by type');
        }
    }
}