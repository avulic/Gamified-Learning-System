// AssignmentController.ts
import { Request, Response } from 'express';
import AssignmentService from '../services/AssignmentService';
import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import Logger from '@/utils/logger';
import { Assignment } from '@/models/app';
import { RequestDto, ResponseDto } from '@/models/dto';
import { assignmentMapper } from '@/utils/mapper/autoMapper';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { CreateAssignmentDto, UpdateAssignmentOld } from '@/models/dto/request';
import { ResponseAssignmentDto } from '@/models/dto/response';

@injectable()
class AssignmentController {
    constructor(
        @inject(TYPES.AssignmentService) private assignmentService: AssignmentService,
        @inject(TYPES.Logger) private logger: ILogger) {
    }

    public createAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const newAssignmentDTO: CreateAssignmentDto = req.body;
            const newAssignment: Assignment = assignmentMapper.fromRequest(newAssignmentDTO);

            const createdAssignment = await this.assignmentService.createAssignment(newAssignment);
            //const response: AssignmentResponseDto = assignmentMapper.toResponseDto(createdAssignment);
            res.status(201).json(createdAssignment);
        } catch (err) {
            this.logger.error('Failed to create assignment', err);
            res.status(500).json({ error: 'Failed to create assignment' });
        }
    }

    public getAllAssignments = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignments = await this.assignmentService.getAllAssignments();
            if (!assignments) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            //const response: AssignmentResponseDto = assignmentMapper.fromRequest(assignment);

            res.status(200).json(assignments);
        } catch (err) {
            this.logger.error('Failed to fetch assignment', err);
            res.status(500).json({ error: 'Failed to fetch assignment' });
        }
    }

    public getAssignmentById = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const assignment = await this.assignmentService.getAssignmentById(assignmentId);
            if (!assignment) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            //const response: AssignmentResponseDto = assignmentMapper.fromRequest(assignment);

            res.status(200).json(assignment);
        } catch (err) {
            this.logger.error('Failed to fetch assignment', err);
            res.status(500).json({ error: 'Failed to fetch assignment' });
        }
    }

    public updateAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const updatedAssignmentDTO: CreateAssignmentDto = req.body;
            const updatedAssignmentData = updatedAssignmentDTO;

            if (!updatedAssignmentData.tasks) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }

            // const taskUpdate = updatedAssignmentData.tasks.map((task) => (
            //     (task.prerequisites && task.id) ? { 
            //         taskId: task.id, 
            //         prerequisites: task.prerequisites
            //     } : null
            // ));

            // const updatedAssignment = await this.assignmentService.updateAssignmentTasks(assignmentId, taskUpdate.filter(t => t !== null));
            if (!updatedAssignmentData) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            //const response = assignmentMapper.fromRequest(updatedAssignment);

            res.status(200).json(updatedAssignmentData);
        } catch (err) {
            this.logger.error('Failed to update assignment', err);
            res.status(500).json({ error: 'Failed to update assignment' });
        }
    }

    public deleteAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const deletedAssignment = await this.assignmentService.getAssignmentsByModule(assignmentId);
            if (!deletedAssignment) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            res.status(200).json({ message: 'Assignment deleted successfully' });
        } catch (err) {
            this.logger.error('Failed to delete assignment', err);
            res.status(500).json({ error: 'Failed to delete assignment' });
        }
    }

    public getAssignmentsByModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const moduleId = req.params.moduleId;
            const assignments: Assignment[] = await this.assignmentService.getAssignmentsByModule(moduleId);

            //const response: AssignmentResponseDto[] = assignments.map(assignmentMapper.toResponseDto);

            res.status(200).json(assignments);
        } catch (error) {
            this.logger.error(`Error fetching assignments for module ${req.params.moduleId}`, error);
            res.status(500).json({ error: 'Failed to fetch assignments for module' });
        }
    }
}

export default AssignmentController;