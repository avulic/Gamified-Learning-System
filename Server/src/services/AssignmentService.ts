import { ITask } from '../models/Task'; // Import the correct Task model and interface
import Task from '../models/Task'; // Import the Task model

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import {logger} from '../utils/logger';
import { Assignment, IAssignment } from '../models/Assigment';

class AssignmentService {
    public createAssignment = async (assignment: IAssignment): Promise<void> => {
        try {
            const newAssignment = new Assignment({
                description: assignment.description,
            });
            await newAssignment.save();
        } catch (error: any) {
            throw new Error('Failed to create tasks');
        }
    }

    // Function to get all tasks
    public getAllAssignment = async (): Promise<IAssignment[]> => {
        try {
            return await Assignment.find();
        } catch (error) {
            throw new Error('Failed to fetch IAssignment');
        }
    }

    // Function to get a task by ID
    public getAssignmentById = async (assignmentId: string): Promise<IAssignment | null> => {
        try {
            return await Assignment.findById(assignmentId);
        } catch (error) {
            throw new Error('Failed to fetch IAssignment by ID');
        }
    }

    // Function to update a task
    public updateAssignment = async (assignmentId: string, updatedAssignmentData: any): Promise<IAssignment | null> => {
        try {
            var assignment = await Assignment.findByIdAndUpdate(assignmentId, updatedAssignmentData, { new: true });
            return assignment;
        } catch (error) {
            console.error('Error updating assignment:', error);
            throw new Error('Failed to update assignment');
        }
    }

    // Function to delete a task
    public deleteAssignment = async (assignmentId: string): Promise<IAssignment | null> => {
        try {
            return await Assignment.findByIdAndDelete(assignmentId);
        } catch (error) {
            throw new Error('Failed to delete assignmentId');
        }
    }
}

export default AssignmentService;
