import ApiService from './ApiService';
import type Task from '../types/Task'; // Make sure to import the correct Task type

import type ResponseData from '../types/ResponseData';
import AuthService from './AuthService';
import type { AxiosHeaderValue, AxiosRequestConfig } from 'axios';

class TaskService {
    public async createTask(task: Task): Promise<Task> {
        try {
            const response: ResponseData = await ApiService.post<Task>('/tasks', task, this.setOptions());
            return response.data;
        } catch (error) {
            // Handle createTask specific errors if needed
            throw new Error('Failed to create task');
        }
    }

    public async createTasks(tasks: Task[]): Promise<Task[]> {
        try {
            const response: ResponseData = await ApiService.post<Task[]>('/tasks', tasks);
            return response.data;
        } catch (error) {
            // Handle createTasks specific errors if needed
            throw new Error('Failed to create tasks');
        }
    }

    public async getAllTasks(): Promise<Task[]> {
        const response: ResponseData = await ApiService.get<Task[]>('/tasks');
        return response.data;
    }

    public async getTaskById(taskId: string): Promise<Task | null> {
        const response: ResponseData = await ApiService.get<Task>(`/tasks/${taskId}`);
        return response.data;
    }

    public async updateTask(taskId: string, updatedTaskData: Task): Promise<Task | null> {
        try {
            const response: ResponseData = await ApiService.put<Task>(`/tasks/${taskId}`, updatedTaskData);
            return response.data;
        } catch (err) {
            throw new Error("Server error: " + err);
        }
    }

    public async deleteTask(taskId: string): Promise<Task | null> {
        const response: ResponseData = await ApiService.delete<Task>(`/tasks/${taskId}`);
        return response.data;
    }

    private setOptions(): AxiosRequestConfig {
        const authHeader = AuthService.authHeader() as AxiosHeaderValue;
        return {
            headers: {
                Authorization: authHeader,
            },
        };
    }
}

export default new TaskService();
