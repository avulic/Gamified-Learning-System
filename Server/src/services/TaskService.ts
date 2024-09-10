import { TaskTypeEnum, ProgressTypeEnum } from '../models/enums';
import Logger from '../utils/logger';
import { ClientError } from '../models/app/Errors/ClientError';
import { NotFoundError } from '../models/app/Errors/NotFoundError';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import { IUnitOfWork } from '@/repository/interface/IUnitOfWork';

import { IBaseTask, ITask } from '@/models/app';

import { IBaseRepository } from '@/repository/interface/IBaseRepository';
import { CreateTaskDto, TaskResponseDto } from '@/models/dto';
import { TaskMapper } from '@/utils/ModelMapper';
import { MongoUnitOfWork } from '@/repository/MongoUnitOfWork';



@injectable()
class TaskService {
    constructor(

    ) {}

    // async createTask(assignmentId: string, task: ITask): Promise<ITask> {
    //     task.assignmentId = assignmentId;
    //     const createdTask = await this.taskRepository.create(task, {});
    //     return createdTask;
    // }

    // async createTasks(tasks: CreateTaskDto[]): Promise<IBaseTaskDb[]> {
    //     const newTasks = tasks.map(task => this.makeNewTask(task));
    //     const savedTasks = await BaseTask.insertMany(newTasks);
    //     return savedTasks;
    // }

    // async getTaskById(taskId: string): Promise<IBaseTask> {
    //     try {
    //         const task = await BaseTask.findById(taskId);
    //         if (!task) {
    //             throw new NotFoundError(`Task with ID ${taskId} not found`);
    //         }
    //         return mapTaskToDto(task);
    //     } catch (error) {
    //         logger.error('Error fetching task', { taskId, error });
    //         throw error;
    //     }
    // }

    // async updateTask(taskId: string, updateData: Partial<IBaseTask>): Promise<IBaseTask> {
    //     try {
    //         const existingTask = await BaseTask.findById(taskId);
    //         if (!existingTask) {
    //             throw new NotFoundError(`Task with ID ${taskId} not found`);
    //         }

    //         const existingAppTask = mapTaskToDto(existingTask);
    //         const mergedTask: IBaseTask = {
    //             ...existingAppTask,
    //             ...updateData,
    //             id: existingAppTask.id,
    //             assignmentId: existingAppTask.assignmentId,
    //             taskType: updateData.taskType || existingAppTask.taskType,
    //         };

    //         if (!this.isValidTask(mergedTask)) {
    //             throw new ClientError('Invalid task data after merge');
    //         }

    //         const dbUpdateData = mapTaskToDbModel(mergedTask);
    //         const updatedTask = await BaseTask.findByIdAndUpdate(taskId, dbUpdateData, { new: true });

    //         if (!updatedTask) {
    //             throw new NotFoundError(`Task with ID ${taskId} not found after update`);
    //         }

    //         logger.info('Task updated successfully', { taskId });
    //         return mapTaskToDto(updatedTask);
    //     } catch (error) {
    //         logger.error('Error updating task', { taskId, error });
    //         throw error;
    //     }
    // }

    // async deleteTask(taskId: string): Promise<boolean> {
    //     try {
    //         const result = await BaseTask.findByIdAndDelete(taskId);
    //         if (!result) {
    //             throw new NotFoundError(`Task with ID ${taskId} not found`);
    //         }
    //         logger.info('Task deleted successfully', { taskId });
    //         return true;
    //     } catch (error) {
    //         logger.error('Error deleting task', { taskId, error });
    //         throw error;
    //     }
    // }

    // async getTasksByAssignment(assignmentId: string): Promise<IBaseTask[]> {
    //     try {
    //         const tasks = await BaseTask.find({ assignmentId });
    //         return tasks.map(task => mapTaskToDto(task));
    //     } catch (error) {
    //         logger.error('Error fetching tasks by assignment', { assignmentId, error });
    //         throw new ClientError('Failed to fetch tasks');
    //     }
    // }

    // private isValidTask(task: IBaseTask): boolean {
    //     return (
    //         !!task.id &&
    //         !!task.assignmentId &&
    //         !!task.title &&
    //         !!task.description &&
    //         !!task.taskType &&
    //         !!task.status &&
    //         typeof task.xpReward === 'number' &&
    //         typeof task.requiredForCompletion === 'boolean'
    //     );
    // }

    

    // private makeNewTask(newTask: IBaseTask): IBaseTaskDb {
    //     let task = {} as IBaseTaskDb;
    //     switch (newTask.taskType) {
    //         case TaskTypeEnum.MULTI_CHOICE:
    //             task = new MultiChoiceTask({...newTask});
    //             break;
    //         case TaskTypeEnum.QUESTION:
    //             task = new QuestionTask({...newTask});
    //             break;
    //         case TaskTypeEnum.FILE_UPLOAD:
    //             task = new FileUploadTask({...newTask});
    //             break;
    //         case TaskTypeEnum.TEXT:
    //             task = new MultiChoiceTask({...newTask});
    //             break;
    //     }
    //     return task;
    // }


    // async getFileUploadTask(taskId: string): Promise<IFileUploadTask> {
    //     const task = await BaseTask.findById(taskId).populate('content');
    //     if (!task || task.taskType !== TaskTypeEnum.FILE_UPLOAD) {
    //         throw new Error('Task not found or not a file upload task');
    //     }
    //     return mapTaskToDto(task) as IFileUploadTask;
    // }

    // // async createFileUploadTask(taskData: Omit<IFileUploadTask, 'id'>): Promise<IFileUploadTask> {
    // //     const dbModel = mapTaskToDbModel(taskData as IBaseTask) as IFileUploadTaskDb;
    // //     const createdTask = await BaseTask.create(dbModel);
    // //     return this.getFileUploadTask(createdTask._id.toString());
    // // }
    

    // // async completeTask(taskId: string, userId: string): Promise<void> {
    // //     const task = await BaseTask.findById(taskId);
    // //     if (!task) {
    // //         throw new NotFoundError(`Task with id ${taskId} not found`);
    // //     }

    // //     // Update user progress
    // //     // This is a simplified version. You might want to use a separate UserProgressService
    // //     await BaseTask.updateOne(
    // //         { _id: taskId },
    // //         { $addToSet: { completedBy: userId } }
    // //     );

    // //     // Update assignment progress if all tasks are completed
    // //     const assignment = await Assignment.findById(task.assignmentId).populate('tasks');
    // //     if (assignment) {
    // //         const allTasksCompleted = assignment.tasks.every((t: IBaseTaskDb) =>
    // //             t.completedBy && t.completedBy.includes(userId)
    // //         );
    // //         if (allTasksCompleted) {
    // //             // Update assignment progress
    // //             // Again, this is simplified. You might want to use a separate ProgressService
    // //             await Assignment.updateOne(
    // //                 { _id: assignment._id },
    // //                 { $addToSet: { completedBy: userId } }
    // //             );
    // //         }
    // //     }
    // // }

    // // async getTaskProgress(taskId: string, userId: string): Promise<ProgressTypeEnum> {
    // //     const task = await BaseTask.findById(taskId);
    // //     if (!task) {
    // //         throw new NotFoundError(`Task with id ${taskId} not found`);
    // //     }
    // //     return task.completedBy && task.completedBy.includes(userId)
    // //         ? ProgressTypeEnum.COMPLETED
    // //         : ProgressTypeEnum.IN_PROGRESS;
    // // }
}

export default TaskService;