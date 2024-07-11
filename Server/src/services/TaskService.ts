import { ITask } from '../models/Task'; // Import the correct Task model and interface
import Task from '../models/Task'; // Import the Task model

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import {logger} from '../utils/logger';

class TaskService {
    public createTask = async (task: ITask): Promise<void> => {
        try {
            const newTask = new Task({
                name: task.name,
                description: task.description,
            });
            await newTask.save();
        } catch (error: any) {
            throw new Error('Failed to create tasks');
        }
    }

    // Function to get all tasks
    public getAllTasks = async (): Promise<ITask[]> => {
        try {
            return await Task.find();
        } catch (error) {
            throw new Error('Failed to fetch tasks');
        }
    }

    // Function to get a task by ID
    public getTaskById = async (taskId: string): Promise<ITask | null> => {
        try {
            return await Task.findById(taskId);
        } catch (error) {
            throw new Error('Failed to fetch task by ID');
        }
    }

    // Function to update a task
    public updateTask = async (taskId: string, updatedTaskData: any): Promise<ITask | null> => {
        try {
            var task = await Task.findByIdAndUpdate(taskId, updatedTaskData, { new: true });
            return task;
        } catch (error) {
            console.error('Error updating task:', error);
            throw new Error('Failed to update task');
        }
    }

    // Function to delete a task
    public deleteTask = async (taskId: string): Promise<ITask | null> => {
        try {
            return await Task.findByIdAndDelete(taskId);
        } catch (error) {
            throw new Error('Failed to delete task');
        }
    }
}

export default TaskService;
