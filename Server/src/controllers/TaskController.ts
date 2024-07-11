'use strict';
import { Request, Response } from 'express';
import TaskService from '../services/TaskService';
import Task, { ITask } from '../models/Task'; // Import the correct Task model and interface
import {logger} from '../utils/logger';

class TaskController {
    private taskService: TaskService;

    constructor(taskService: TaskService) {
        this.taskService = taskService;
    }

    // Function to create a new task
    public createTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const newTask: ITask = req.body;
            const createdTask = await this.taskService.createTask(newTask);
            res.status(201).json(createdTask);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create task' + err });
        }
    }

    // Function to get all tasks
    public getAllTasks = async (req: Request, res: Response): Promise<void> => {
        try {
            const tasks = await this.taskService.getAllTasks();
            res.status(200).json(tasks);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    // Function to get a task by ID
    public getTaskById = async (req: Request, res: Response): Promise<void> => {
        try {
            const taskId = req.params.id;
            const task = await this.taskService.getTaskById(taskId);
            if (!task) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            res.status(200).json(task);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch task' });
        }
    }

    // Function to update a task
    public updateTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const taskId = req.params.id;
            const updatedTaskData: ITask = req.body;
            const updatedTask = await this.taskService.updateTask(taskId, updatedTaskData);
            if (!updatedTask) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            res.status(200).json(updatedTask);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update task' });
        }
    }

    // Function to delete a task
    public deleteTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const taskId = req.params.id;
            const deletedTask = await this.taskService.deleteTask(taskId);

            if (!deletedTask) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }
            res.status(200).json(deletedTask);
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete task' });
        }
    }
}

export default TaskController;
