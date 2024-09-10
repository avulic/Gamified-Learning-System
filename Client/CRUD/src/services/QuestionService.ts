import ApiService from '@/services/ApiService';
import type Question from '@/types/task/Question';
import { get, post, put, del } from '@/services/ApiService';

class QuestionService {
    public async createQuestion(question: Question): Promise<Question> {
        try {
            const response = await post<Question>('/questions', question);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create question');
        }
    }

    public async createQuestions(questions: Question[]): Promise<Question[]> {
        try {
            const response = await post<Question[]>('/questions/bulk', questions);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create questions');
        }
    }

    public async getAllQuestions(): Promise<Question[]> {
        const response = await get<Question[]>('/questions');
        return response.data;
    }

    public async getQuestionById(questionId: string): Promise<Question | null> {
        const response = await get<Question>(`/questions/${questionId}`);
        return response.data;
    }

    public async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
        const response = await get<Question[]>(`/questions?quizId=${quizId}`);
        return response.data;
    }

    public async updateQuestion(questionId: string, updatedQuestionData: Question): Promise<Question | null> {
        try {
            const response = await put<Question>(`/questions/${questionId}`, updatedQuestionData);
            return response.data;
        } catch (err) {
            throw new Error(`Error updating question: ${err}`);
        }
    }

    public async deleteQuestion(questionId: string): Promise<Question | null> {
        const response = await del<Question>(`/questions/${questionId}`);
        return response.data;
    }

    public async deleteQuestionsByQuiz(quizId: string): Promise<void> {
        await del(`/questions?quizId=${quizId}`);
    }
}

export default new QuestionService();