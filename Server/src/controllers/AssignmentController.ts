// AssignmentController.ts
import { Request, Response } from 'express';
import AssignmentService from '../services/AssignmentService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import Logger from '@/utils/logger';
import { IAssignment } from '@/models/app';
import { AssignmentResponseDto, CreateAssignmentDto, UpdateAssignmentDto } from '@/models/dto';
import { AssignmentMapper } from '@/utils/ModelMapper';
import { ProgressService } from '@/services/Progress/ProgressService';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';

@injectable()
class AssignmentController {
    constructor(
        @inject(TYPES.AssignmentService) private assignmentService: AssignmentService,
        @inject(TYPES.ProgressService) private progressService: ProgressService,
        @inject(TYPES.Logger) private logger: Logger) {
    }

    public createAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const newAssignmentDTO: CreateAssignmentDto = req.body;
            const newAssignment: IAssignment = AssignmentMapper.fromCreateDto(newAssignmentDTO);
            const createdAssignment = await this.assignmentService.createAssignment(newAssignment);
            const response: AssignmentResponseDto = AssignmentMapper.toResponseDto(createdAssignment);
            res.status(201).json(response);
        } catch (err) {
            this.logger.error('Failed to create assignment', err);
            res.status(500).json({ error: 'Failed to create assignment' });
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
            const response: AssignmentResponseDto = AssignmentMapper.toResponseDto(assignment);

            res.status(200).json(response);
        } catch (err) {
            this.logger.error('Failed to fetch assignment', err);
            res.status(500).json({ error: 'Failed to fetch assignment' });
        }
    }

    public updateAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const updatedAssignmentDTO: UpdateAssignmentDto = req.body;
            const updatedAssignmentData: Partial<IAssignment> = AssignmentMapper.fromUpdateDto(updatedAssignmentDTO);

            const updatedAssignment = await this.assignmentService.updateAssignment(assignmentId, updatedAssignmentData);
            if (!updatedAssignment) {
                res.status(404).json({ error: 'Assignment not found' });
                return;
            }
            const response: AssignmentResponseDto = AssignmentMapper.toResponseDto(updatedAssignment);

            res.status(200).json(response);
        } catch (err) {
            this.logger.error('Failed to update assignment', err);
            res.status(500).json({ error: 'Failed to update assignment' });
        }
    }

    public deleteAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.id;
            const deletedAssignment = await this.assignmentService.deleteAssignment(assignmentId);
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
            const assignments: IAssignment[] = await this.assignmentService.getAssignmentsByModule(moduleId);

            const response: AssignmentResponseDto[] = assignments.map(AssignmentMapper.toResponseDto);

            res.status(200).json(response);
        } catch (error) {
            this.logger.error(`Error fetching assignments for module ${req.params.moduleId}`, error);
            res.status(500).json({ error: 'Failed to fetch assignments for module' });
        }
    }


    // async getAssignmentProgress(req: Request, res: Response): Promise<void> {
    //     try {
    //         const userId = req.params.userId;
    //         const assignmentId = req.params.assignmentId;
    //         const progress = await this.progressService.getAssignmentProgress(userId, assignmentId);
    //         res.status(200).json(progress);
    //     } catch (error) {
    //         if (error instanceof NotFoundError) {
    //             res.status(404).json({ message: error.message });
    //         } else {
    //             res.status(500).json({ message: 'An error occurred while fetching assignment progress' });
    //         }
    //     }
    // }


    // async submitAssignment(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { userId, courseId, assignmentId } = req.params;
    //         const { taskResults } = req.body;
    
    //         const assignment = await this.assignmentService.getAssignmentById(assignmentId);
    //         let totalXP = 0;
    
    //         for (const taskResult of taskResults) {
    //             const { taskId, answer } = taskResult;
    //             const task = assignment.tasks.find(t => t.id === taskId);
    //             if (!task) {
    //                 throw new NotFoundError(`Task ${taskId} not found in assignment ${assignmentId}`);
    //             }
    
    //             const isCorrect = await this.assignmentService.checkTaskAnswer(taskId, answer);
    //             const status = isCorrect ? TaskStatus.COMPLETED : TaskStatus.FAILED;
    //             const score = isCorrect ? task.points : 0;
    
    //             await this.progressService.updateTaskProgress(
    //                 userId,
    //                 courseId,
    //                 assignmentId,
    //                 taskId,
    //                 status,
    //                 taskResult.timeSpent,
    //                 score
    //             );
    
    //             if (isCorrect) {
    //                 totalXP += task.xpReward;
    //             }
    //         }
    
    //         const progressReport = await this.progressService.getProgressReport(userId);
    
    //         res.status(200).json({
    //             message: 'Assignment submitted successfully',
    //             xpEarned: totalXP,
    //             progressReport,
    //         });
    //     } catch (error) {
    //         // Handle errors
    //         res.status(error.status || 500).json({ error: error.message });
    //     }
    // }
}

export default AssignmentController;