// TaskController.ts
import { Request, Response } from 'express';
import TaskService from '../services/TaskService';
import { IBaseTask } from '../models/app/Task/BaseTask';

import { injectable, inject } from 'inversify';
import { TYPES } from '../types';
import { IFileUploadTask } from '../models/app/Task/FileUploadTask';
import { IMultiChoiceTask } from '../models/app/Task/MultiChoiceTask';
import { IQuestionTask } from '../models/app/Task/QuestionTask';

@injectable()
class TaskController {
    constructor() {
        
    }

    // public createTask = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const newTask: (IQuestionTask | IFileUploadTask | IMultiChoiceTask) = req.body;
    //         const createdTask = await this.taskService.createTask(newTask);
    //         res.status(201).json(createdTask);
    //     } catch (err) {
    //         logger.error('Failed to create task', err);
    //         res.status(500).json({ error: 'Failed to create task' });
    //     }
    // }

    // public getAllTasks = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const tasks = await this.taskService.getAllTasks();
    //         res.status(200).json(tasks);
    //     } catch (err) {
    //         logger.error('Failed to fetch tasks', err);
    //         res.status(500).json({ error: 'Failed to fetch tasks' });
    //     }
    // }

    // public getTaskById = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const taskId = req.params.id;
    //         const task = await this.taskService.getTaskById(taskId);
    //         if (!task) {
    //             res.status(404).json({ error: 'Task not found' });
    //             return;
    //         }
    //         res.status(200).json(task);
    //     } catch (err) {
    //         logger.error('Failed to fetch task', err);
    //         res.status(500).json({ error: 'Failed to fetch task' });
    //     }
    // }

    // public updateTask = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const taskId = req.params.id;
    //         const updatedTaskData: IBaseTask = req.body;
    //         const updatedTask = await this.taskService.updateTask(taskId, updatedTaskData);
    //         if (!updatedTask) {
    //             res.status(404).json({ error: 'Task not found' });
    //             return;
    //         }
    //         res.status(200).json(updatedTask);
    //     } catch (err) {
    //         logger.error('Failed to update task', err);
    //         res.status(500).json({ error: 'Failed to update task' });
    //     }
    // }

    // public deleteTask = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const taskId = req.params.id;
    //         const deletedTask = await this.taskService.deleteTask(taskId);
    //         if (!deletedTask) {
    //             res.status(404).json({ error: 'Task not found' });
    //             return;
    //         }
    //         res.status(200).json({ message: 'Task deleted successfully' });
    //     } catch (err) {
    //         logger.error('Failed to delete task', err);
    //         res.status(500).json({ error: 'Failed to delete task' });
    //     }
    // }

    // public getTasksByAssignment = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const assignmentId = req.params.id;
    //         const tasks = await this.taskService.getTasksByAssignment(assignmentId);
    //         if (!tasks) {
    //             res.status(404).json({ error: 'Tasks not found' });
    //             return;
    //         }
    //         res.status(200).json(tasks);
    //     } catch (err) {
    //         logger.error('Failed to get task', err);
    //         res.status(500).json({ error: 'Failed to get task' });
    //     }
    // }
}

export default TaskController;








