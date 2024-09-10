import type Quiz from '@/types/quiz/Quiz';
import { get, post, put, del } from '@/services/ApiService';

class QuizService {
    private readonly baseUrl = '/quiz';

    public async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
        try {
            const response = await post<Quiz>(this.baseUrl, quiz);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create quiz');
        }
    }

    public async createQuizzes(quizzes: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Quiz[]> {
        try {
            const response = await post<Quiz[]>(this.baseUrl, quizzes);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create quizzes');
        }
    }

    public async getAllQuizzes(): Promise<Quiz[]> {
        const response = await get<Quiz[]>(this.baseUrl);
        return response.data;
    }

    public async getQuizById(quizId: string): Promise<Quiz | null> {
        const response = await get<Quiz>(`${this.baseUrl}/${quizId}`);
        return response.data;
    }

    public async getQuizzesByModuleId(moduleId: string): Promise<Quiz[]> {
        const response = await get<Quiz[]>(`${this.baseUrl}?moduleId=${moduleId}`);
        return response.data;
    }

    public async updateQuiz(quizId: string, updatedQuizData: Partial<Quiz>): Promise<Quiz | null> {
        try {
            const response = await put<Quiz>(`${this.baseUrl}/${quizId}`, updatedQuizData);
            return response.data;
        } catch (err) {
            throw new Error(`Error updating quiz: ${err}`);
        }
    }

    public async deleteQuiz(quizId: string): Promise<void> {
        await del(`${this.baseUrl}/${quizId}`);
    }

    public async getQuizzesByTitle(title: string): Promise<Quiz[]> {
        const response = await get<Quiz[]>(`${this.baseUrl}?title=${encodeURIComponent(title)}`);
        return response.data;
    }
}

export default new QuizService();