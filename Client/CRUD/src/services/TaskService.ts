import ApiService from '@/services/ApiService';
import type Task from '@/types/Task'; // Make sure to import the correct Task type

import { get, post, put } from '@/services/ApiService';


class TaskService {
    public async createTask(task: Task): Promise<Task> {
        try {
            const response = await post<Task>('/tasks', task);
            return response.data;
        } catch (error) {
            // Handle createTask specific errors if needed
            throw new Error('Failed to create task');
        }
    }

    public async createTasks(tasks: Task[]): Promise<Task[]> {
        try {
            const response = await post<Task[]>('/tasks', tasks);
            return response.data;
        } catch (error) {
            // Handle createTasks specific errors if needed
            throw new Error('Failed to create tasks');
        }
    }

    public async getAllTasks(): Promise<Task[]> {
        const response = await get<Task[]>('/tasks');
        return response.data;
    }

    public async getTaskById(taskId: string): Promise<Task | null> {
        const response = await get<Task>(`/tasks/${taskId}`);
        return response.data;
    }

    public async updateTask(taskId: string, updatedTaskData: Task): Promise<Task | null> {
        try {
            const response = await put<Task>(`/tasks/${taskId}`, updatedTaskData);
            return response.data;
        } catch (err) {
            throw new Error("Server error: " + err);
        }
    }

    public async deleteTask(taskId: string): Promise<Task | null> {
        const response = await ApiService.delete<Task>(`/tasks/${taskId}`);
        return response.data;
    }

    
}

export default new TaskService();
