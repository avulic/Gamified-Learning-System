import { apiService } from '@/services/ApiService';
import type { Lesson } from '@/types/Lesson';

class LessonService {
    public async createLesson(lesson: Lesson): Promise<Lesson> {
        try {
            const response = await apiService.post<Lesson>('/lessons', lesson);
            return response.data;
        } catch (error) {
            // Handle createLesson specific errors if needed
            throw new Error('Failed to create Lesson');
        }
    }

    public async createLessons(lessons: Lesson[]): Promise<Lesson[]> {
        try {
            const response = await apiService.post<Lesson[]>('/lessons', lessons);
            return response.data;
        } catch (error) {
            // Handle createLessons specific errors if needed
            throw new Error('Failed to create Lessons');
        }
    }

    public async getAllLessons(): Promise<Lesson[]> {
        const response = await apiService.get<Lesson[]>('/lessons');
        return response.data;
    }

    public async getLessonById(lessonId: string): Promise<Lesson | null> {
        const response = await apiService.get<Lesson>(`/lessons/${lessonId}`);
        return response.data;
    }

    public async updateLesson(lessonId: string, updatedLessonData: Lesson): Promise<Lesson | null> {
        try {
            const response = await apiService.put<Lesson>(`/lessons/${lessonId}`, updatedLessonData);
            return response.data;
        } catch (err) {
            throw new Error("Server error: " + err);
        }
    }

    public async deleteLesson(lessonId: string): Promise<boolean> {
        try {
            const response = await apiService.delete<boolean>(`/lessons/${lessonId}`);
            return response.data;
        } catch (err) {
            throw new Error("Failed to delete lesssn: " + err);
        }
    }
}

export default new LessonService();


