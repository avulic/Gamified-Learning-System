import { CustomRequest } from '@/middlewares/authJwt';
import { BaseTaskSubmission as Submission } from '@/models/app';
import { UserToken } from '@/models/app/User.entity';
import { AssignmentSubmissionDto } from '@/models/dto/request';
import { SubmissionService } from '@/services/SubmissionService';
import { ILogger, TYPES } from '@/types';
import Logger from '@/utils/logger';

import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';


@injectable()
class SubmissionController {
    constructor(
        @inject(TYPES.SubmissionService) private submissionService: SubmissionService,
        @inject(TYPES.Logger) private logger: ILogger
    ) { }

    public submitTasks = async (req: Request, res: Response): Promise<void> => {
        try {
            //const userId = "67c623aa93b42c36efb8d9ea"//(req as CustomRequest).token.payload.id;
            const user = (req as any).user as UserToken;

            const submissionsData: AssignmentSubmissionDto = req.body;

            const progress = await this.submissionService.submitTasks(user, submissionsData);

            res.status(201).json({
                message: 'Submissions processed successfully',
                progress
            });
        } catch (error: any) {
            this.logger.error('Error processing submissions', error);
            if (error.name === 'NotFoundError') {
                res.status(404).json({ error: error.message });
            } else if (error.name === 'ClientError') {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to process submissions: ' + error.message });
            }
        }
    }


    public getSubmissionById = async (req: Request, res: Response): Promise<void> => {
        try {
            const submissionId = req.params.id;
            const submission = await this.submissionService.getSubmissionById(submissionId);
            const response = submission;

            res.status(200).json(response);
        } catch (error) {
            this.logger.error(`Error fetching submission with id ${req.params.id}`, error);
            res.status(404).json({ error: 'Submission not found' });
        }
    }

    public updateSubmission = async (req: Request, res: Response): Promise<void> => {
        try {
            const submissionId = req.params.id;
            const submissionData: Partial<Submission> = req.body;
            const updatedSubmission = await this.submissionService.updateSubmission(submissionId, submissionData);
            const response = updatedSubmission;

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
            const response = submissions;

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
            const response = submissions;

            res.status(200).json(response);
        } catch (error) {
            this.logger.error(`Error fetching submissions for assignment ${req.params.assignmentId}`, error);
            res.status(500).json({ error: 'Failed to fetch submissions for assignment' });
        }
    }
}

export default SubmissionController;