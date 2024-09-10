import { ISubmission } from '@/models/app';
import { CreateSubmissionDto } from '@/models/dto';
import { SubmissionService } from '@/services/SubmissionService';
import { TYPES } from '@/types';
import Logger from '@/utils/logger';
import { SubmissionMapper } from '@/utils/ModelMapper';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';


@injectable()
class SubmissionController {
    constructor(
        @inject(TYPES.SubmissionService) private submissionService: SubmissionService,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    public createSubmission = async (req: Request, res: Response): Promise<void> => {
        try {
            const submissionData: CreateSubmissionDto = req.body;
            const newSubmission: ISubmission = SubmissionMapper.fromCreateDto(
                submissionData
            );
            const submission = await this.submissionService.createSubmission(newSubmission);
            const response = SubmissionMapper.toResponseDto(submission);
            res.status(201).json(response);
        } catch (error) {
            this.logger.error('Error creating submission', error);
            res.status(500).json({ error: 'Failed to create submission' });
        }
    }

    public getSubmissionById = async (req: Request, res: Response): Promise<void> => {
        try {
            const submissionId = req.params.id;
            const submission = await this.submissionService.getSubmissionById(submissionId);
            const response = SubmissionMapper.toResponseDto(submission);

            res.status(200).json(response);
        } catch (error) {
            this.logger.error(`Error fetching submission with id ${req.params.id}`, error);
            res.status(404).json({ error: 'Submission not found' });
        }
    }

    public updateSubmission = async (req: Request, res: Response): Promise<void> => {
        try {
            const submissionId = req.params.id;
            const submissionData: Partial<ISubmission> = req.body;
            const updatedSubmission = await this.submissionService.updateSubmission(submissionId, submissionData);
            const response = SubmissionMapper.toResponseDto(updatedSubmission);

            res.status(200).json(response);
        } catch (error) {
            this.logger.error(`Error updating submission with id ${req.params.id}`, error);
            res.status(500).json({ error: 'Failed to update submission' });
        }
    }

    public deleteSubmission = async (req: Request, res: Response): Promise<void> => {
        try {
            const submissionId = req.params.id;
            const result = await this.submissionService.deleteSubmission(submissionId);
            if (result) {
                res.status(204).send({ message: 'Submission deleted successful' });
            } else {
                res.status(404).json({ error: 'Submission not found' });
            }
        } catch (error) {
            this.logger.error(`Error deleting submission with id ${req.params.id}`, error);
            res.status(500).json({ error: 'Failed to delete submission' });
        }
    }

    public getSubmissionsByUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId;
            const submissions = await this.submissionService.getSubmissionsByUser(userId);
            const response = submissions.map(SubmissionMapper.toResponseDto);

            res.status(200).json(response);
        } catch (error) {
            this.logger.error(`Error fetching submissions for user ${req.params.userId}`, error);
            res.status(500).json({ error: 'Failed to fetch submissions for user' });
        }
    }

    public getSubmissionsByAssignment = async (req: Request, res: Response): Promise<void> => {
        try {
            const assignmentId = req.params.assignmentId;
            const submissions = await this.submissionService.getSubmissionsByAssignment(assignmentId);
            const response = submissions.map(SubmissionMapper.toResponseDto);

            res.status(200).json(response);
        } catch (error) {
            this.logger.error(`Error fetching submissions for assignment ${req.params.assignmentId}`, error);
            res.status(500).json({ error: 'Failed to fetch submissions for assignment' });
        }
    }
}

export default SubmissionController;