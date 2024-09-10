import axios from 'axios';
import { Submission } from '@/types/Submission';

class SubmissionService {
    public async submitAssignment(assignmentId: string, submission: Partial<Submission>): Promise<Submission> {
        try {
            const response = await axios.post<Submission>(`/assignments/${assignmentId}/submissions`, submission);
            return response.data;
        } catch (error) {
            console.error('Error submitting assignment:', error);
            throw error;
        }
    }

    public async getSubmission(submissionId: string): Promise<Submission> {
        try {
            const response = await axios.get<Submission>(`/submissions/${submissionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching submission:', error);
            throw error;
        }
    }

    public async updateSubmission(submissionId: string, updates: Partial<Submission>): Promise<Submission> {
        try {
            const response = await axios.patch<Submission>(`/submissions/${submissionId}`, updates);
            return response.data;
        } catch (error) {
            console.error('Error updating submission:', error);
            throw error;
        }
    }

    public async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
        try {
            const response = await axios.get<Submission[]>(`/assignments/${assignmentId}/submissions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching submissions for assignment:', error);
            throw error;
        }
    }

    public async getSubmissionsForUser(userId: string): Promise<Submission[]> {
        try {
            const response = await axios.get<Submission[]>(`/users/${userId}/submissions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching submissions for user:', error);
            throw error;
        }
    }
}

export default new SubmissionService();