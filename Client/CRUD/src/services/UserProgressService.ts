import { get, post, put, patch } from '@/services/ApiService';
import { UserProgress, CourseProgress, ModuleProgress, LessonProgress, AssignmentProgress, TaskProgress, TaskStatus } from '@/types/Progression';

class UserProgressService {
    public async getUserProgress(userId: string): Promise<UserProgress> {
        try {
            const response = await get<UserProgress>(`/users/${userId}/progress`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user progress:', error);
            throw new Error('Failed to fetch user progress');
        }
    }

    public async updateCourseProgress(userId: string, courseId: string, progress: Partial<CourseProgress>): Promise<CourseProgress> {
        try {
            const response = await patch<CourseProgress>(`/users/${userId}/courses/${courseId}/progress`, progress);
            return response.data;
        } catch (error) {
            console.error('Error updating course progress:', error);
            throw new Error('Failed to update course progress');
        }
    }

    public async updateModuleProgress(userId: string, courseId: string, moduleId: string, progress: Partial<ModuleProgress>): Promise<ModuleProgress> {
        try {
            const response = await patch<ModuleProgress>(`/users/${userId}/courses/${courseId}/modules/${moduleId}/progress`, progress);
            return response.data;
        } catch (error) {
            console.error('Error updating module progress:', error);
            throw new Error('Failed to update module progress');
        }
    }

    public async updateLessonProgress(userId: string, courseId: string, moduleId: string, lessonId: string, progress: Partial<LessonProgress>): Promise<LessonProgress> {
        try {
            const response = await patch<LessonProgress>(`/users/${userId}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/progress`, progress);
            return response.data;
        } catch (error) {
            console.error('Error updating lesson progress:', error);
            throw new Error('Failed to update lesson progress');
        }
    }

    public async updateAssignmentProgress(userId: string, courseId: string, moduleId: string, assignmentId: string, progress: Partial<AssignmentProgress>): Promise<AssignmentProgress> {
        try {
            const response = await patch<AssignmentProgress>(`/users/${userId}/courses/${courseId}/modules/${moduleId}/assignments/${assignmentId}/progress`, progress);
            return response.data;
        } catch (error) {
            console.error('Error updating assignment progress:', error);
            throw new Error('Failed to update assignment progress');
        }
    }

    public async updateTaskProgress(userId: string, courseId: string, moduleId: string, assignmentId: string, taskId: string, progress: Partial<TaskProgress>): Promise<TaskProgress> {
        try {
            const response = await patch<TaskProgress>(`/users/${userId}/courses/${courseId}/modules/${moduleId}/assignments/${assignmentId}/tasks/${taskId}/progress`, progress);
            return response.data;
            
        } catch (error) {
            console.error('Error updating task progress:', error);
            throw new Error('Failed to update task progress');
        }
    }

    public async calculateOverallProgress(userId: string): Promise<number> {
        try {
            const response = await get<{ overallProgress: number }>(`/users/${userId}/overall-progress`);
            return response.data.overallProgress;
        } catch (error) {
            console.error('Error calculating overall progress:', error);
            throw new Error('Failed to calculate overall progress');
        }
    }

    public async earnXP(userId: string, amount: number): Promise<number> {
        try {
            const response = await post<{ totalXpEarned: number }>(`/users/${userId}/earn-xp`, { amount });
            return response.data.totalXpEarned;
        } catch (error) {
            console.error('Error earning XP:', error);
            throw new Error('Failed to earn XP');
        }
    }

    public async levelUp(userId: string): Promise<number> {
        try {
            const response = await post<{ newLevel: number }>(`/users/${userId}/level-up`, {});
            return response.data.newLevel;
        } catch (error) {
            console.error('Error leveling up:', error);
            throw new Error('Failed to level up');
        }
    }

    // Helper methods (these don't involve API calls, so they remain unchanged)
    public isCourseCompleted(courseProgress: CourseProgress): boolean {
        return courseProgress.completed;
    }

    public isAssignmentCompleted(assignmentProgress: AssignmentProgress): boolean {
        return assignmentProgress.taskProgress.every(task => 
            task.status === TaskStatus.COMPLETED //|| !task.requiredForCompletion
        );
    }

    public calculateModuleXP(moduleProgress: ModuleProgress): number {
        const lessonXP = moduleProgress.lessonProgress.reduce((total, lesson) => total + lesson.xpEarned, 0);
        const assignmentXP = moduleProgress.assignmentProgress.reduce((total, assignment) => total + assignment.xpEarned, 0);
        return lessonXP + assignmentXP;
    }
}

export default new UserProgressService();