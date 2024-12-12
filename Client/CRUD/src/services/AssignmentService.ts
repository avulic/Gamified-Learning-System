import ApiService from '@/services/ApiService';
import type Assignment from '@/types/Assignment'; // Make sure to import the correct Assignment type

import { get, post, put } from '@/services/ApiService';


class AssignmentService {
    public async createAssignment(assignment: Assignment): Promise<Assignment> {
        try {
            const response = await post<Assignment>('/assignments', assignment);
            return response.data;
        } catch (error) {
            // Handle createAssignment specific errors if needed
            throw new Error('Failed to create Assignment');
        }
    }

    public async createAssignments(assignments: Assignment[]): Promise<Assignment[]> {
        try {
            const response = await post<Assignment[]>('/assignments', assignments);
            return response.data;
        } catch (error) {
            // Handle createAssignments specific errors if needed
            throw new Error('Failed to create Assignments');
        }
    }

    public async getAllAssignments(): Promise<Assignment[]> {
        const response = await get<Assignment[]>('/assignments');
        return response.data;
    }

    public async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
        const response = await get<Assignment>(`/assignments/${assignmentId}`);
        return response.data;
    }

    public async updateAssignment(assignmentId: string, updatedAssignmentData: Assignment): Promise<Assignment | null> {
        try {
            const response = await put<Assignment>(`/assignments/${assignmentId}`, updatedAssignmentData);
            return response.data;
        } catch (err) {
            throw new Error("Server error: " + err);
        }
    }

    public async deleteAssignment(assignmentId: string): Promise<Assignment | null> {
        const response = await ApiService.delete<Assignment>(`/assignments/${assignmentId}`);
        return response.data;
    }

    
}

export default new AssignmentService();
