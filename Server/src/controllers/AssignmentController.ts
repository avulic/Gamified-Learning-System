'use strict';
import { Request, Response } from 'express';
import AssignmentService from '../services/AssignmentService';
import Task, { ITask } from '../models/Task'; // Import the correct Task model and interface
import {logger} from '../utils/logger';
import { IAssignment } from '../models/Assigment';

class AssignmentController {
    private assignmentService: AssignmentService;

    constructor(assignmentService: AssignmentService) {
        this.assignmentService = assignmentService;
    }

    // Function to create a new task
    public createAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const newAssignment: IAssignment = req.body;
            const createdAssignment = await this.assignmentService.createAssignment(newAssignment);
            res.status(201).json(createdAssignment);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create task' + err });
        }
    }

    // Function to get all tasks
    public getAllAssignments = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignment = await this.assignmentService.getAllAssignment();
            res.status(200).json(assignment);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    // Function to get a task by ID
    public getAssignmentById = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);
            if (!assignment) {
                res.status(404).json({ error: 'assignment not found' });
                return;
            }
            res.status(200).json(assignment);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch assignment' });
        }
    }

    // Function to update a task
    public updateAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const updatedAssignmentData: ITask = req.body;
            const updatedAssignment = await this.assignmentService.updateAssignment(assignmentId, updatedAssignmentData);
            if (!updatedAssignment) {
                res.status(404).json({ error: 'assignment not found' });
                return;
            }
            res.status(200).json(updatedAssignment);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update assignment' });
        }
    }

    // Function to delete a task
    public deleteAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const deletedAssignment = await this.assignmentService.deleteAssignment(assignmentId);

            if (!deletedAssignment) {
                res.status(404).json({ error: 'assignment not found' });
                return;
            }
            res.status(200).json(deletedAssignment);
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete assignment' });
        }
    }
}

export default AssignmentController;
