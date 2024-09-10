import ApiService from '@/services/ApiService';
import Task from '@/types/task/Task';
import { get, post, put, del } from '@/services/ApiService';

class TaskService {
    private readonly baseUrl = '/tasks';

    public async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
        try {
            const response = await post<Task>(this.baseUrl, task);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create task: ' + error);
        }
    }

    public async createTasks(tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Task[]> {
        try {
            const response = await post<Task[]>(`${this.baseUrl}/bulk`, tasks);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create tasks: ' + error);
        }
    }

    public async getAllTasks(): Promise<Task[]> {
        try {
            const response = await get<Task[]>(this.baseUrl);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch tasks: ' + error);
        }
    }

    public async getTaskById(taskId: string): Promise<Task | null> {
        try {
            const response = await get<Task>(`${this.baseUrl}/${taskId}`);
            return response.data;
        } catch (error) {
            if ((error as any).status === 404) {
                return null;
            }
            throw new Error('Failed to fetch task: ' + error);
        }
    }

    public async getTasksByAssignment(assignmentId: string): Promise<Task[]> {
        try {
            const response = await get<Task[]>(`${this.baseUrl}?assignmentId=${assignmentId}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch tasks for assignment: ' + error);
        }
    }

    public async updateTask(taskId: string, updatedTaskData: Partial<Task>): Promise<Task | null> {
        try {
            const response = await put<Task>(`${this.baseUrl}/${taskId}`, updatedTaskData);
            return response.data;
        } catch (error) {
            throw new Error('Failed to update task: ' + error);
        }
    }

    public async deleteTask(taskId: string): Promise<boolean> {
        try {
            await del(`${this.baseUrl}/${taskId}`);
            return true;
        } catch (error) {
            throw new Error('Failed to delete task: ' + error);
        }
    }

    public async updateTaskOrder(taskId: string, newOrder: number): Promise<Task | null> {
        try {
            const response = await put<Task>(`${this.baseUrl}/${taskId}/order`, { order: newOrder });
            return response.data;
        } catch (error) {
            throw new Error('Failed to update task order: ' + error);
        }
    }

    public async getTasksByStatus(status: Task['status']): Promise<Task[]> {
        try {
            const response = await get<Task[]>(`${this.baseUrl}?status=${status}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch tasks by status: ' + error);
        }
    }

    public async getOverdueTasks(): Promise<Task[]> {
        try {
            const response = await get<Task[]>(`${this.baseUrl}/overdue`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch overdue tasks: ' + error);
        }
    }

    // getTasksForAssignment(assignmentId: string): Promise<Task[]> {
    //     // Implementation
    //   }
    
    //   updateTaskProgress(progress: TaskProgress): Promise<TaskProgress> {
    //     // Implementation
    //   }
    
    //   getTaskProgress(userId: string, taskId: string): Promise<TaskProgress | null> {
    //     // Implementation
    //   }
    
    //   evaluateTaskSubmission(taskId: string, userId: string, submission: any): Promise<{
    //     score: number;
    //     feedback: string;
    //     xpEarned: number;
    //   }> {
    //     // Implementation
    //   }


}

export default new TaskService();