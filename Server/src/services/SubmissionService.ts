import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { TYPES } from '@/types';
import { ISubmission, IAnswer, IAssignment } from '@/models/app';
import { SubmissionRepository } from '@/repository/SubmissionRepository';
import { AssignmentService } from './AssignmentService';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { ClientError } from '@/models/app/Errors/ClientError';
import { Logger } from 'winston';
import { SubmissionMapper, AnswerMapper, AssignmentMapper } from '@/utils/ModelMapper';
import { CreateSubmissionDto, UpdateSubmissionDto } from '@/models/dto/request/CreateSubmissionDto';
import { SubmissionStatus, TaskTypeEnum } from '@/models/enums';
import { ServerError } from '@/models/app/Errors/ServerError';

@injectable()
export class SubmissionService {
    constructor(
        @inject(TYPES.SubmissionRepository) private submissionRepo: SubmissionRepository,
        @inject(TYPES.AssignmentService) private assignmentService: AssignmentService,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    async createSubmission(submissionData: ISubmission): Promise<ISubmission> {
        const assignment = await this.assignmentService.getAssignmentById(submissionData.assignmentId);
        if (!assignment) {
            throw new NotFoundError('Assignment not found');
        }

        const newSubmission = this.submissionRepo.create(submissionData);
        return newSubmission;
    }

    // private createAnswers(assignment: IAssignment, answer: IAnswer[]): IAnswer[] {
    //         const task = assignment.tasks.find((t: any) => t.id === answer.taskId);
    //         if (!task) {
    //             throw new ClientError(`Task with id ${answer.taskId} not found in the assignment`);
    //         }
    //         if (task.taskType !== answer.a) {
    //             throw new ClientError(`Task type mismatch for task ${answer.taskId}`);
    //         }
    //         return answer;
    // }

    async getSubmissionById(id: string): Promise<ISubmission> {
        const submission = await this.submissionRepo.findById(id);
        if (!submission) {
            throw new NotFoundError(`Submission with id ${id} not found`);
        }
        return submission;
    }

    async updateSubmission(id: string, dto: Partial<ISubmission>): Promise<ISubmission> {
        const submission = await this.getSubmissionById(id);
        const assignment = await this.assignmentService.getAssignmentById(submission.assignmentId);

        const updatedSubmission: Partial<ISubmission> = {
            ...submission,
            status: dto.status || submission.status,
            lastUpdatedAt: new Date(),
            timeSpent: dto.timeSpent || submission.timeSpent,
        };

        if (dto.answers) {
            updatedSubmission.answers = this.updateAnswers(assignment, submission.answers, dto.answers);
            updatedSubmission.isPartial = updatedSubmission.answers.length < assignment.tasks!.length;
        }

        const savedUpdatedSubmission = await this.submissionRepo.update(id, updatedSubmission);
        if(!savedUpdatedSubmission)
            throw new NotFoundError("Submsion not updated");
        
        return savedUpdatedSubmission;
    }

    private updateAnswers(assignment: IAssignment, existingAnswers: IAnswer[], updateAnswers: IAnswer[]): IAnswer[] {
        return updateAnswers.map(updateAnswer => {
            const existingAnswer = existingAnswers.find(a => a.taskIndex === updateAnswer.taskIndex);
            if(!existingAnswer)
                throw new ClientError(`Old Answer for new answer id ${updateAnswer.taskIndex} not found in the submission`);

            const task = assignment.tasks!.find((t: any) => t.id === updateAnswer.taskIndex);
            if (!task) {
                throw new ClientError(`Task with id ${updateAnswer.taskIndex} not found in the assignment`);
            }

            return updateAnswer;
        });
    }

    async deleteSubmission(id: string): Promise<boolean> {
        return await this.submissionRepo.delete(id);
    }

    async getSubmissionsByAssignment(assignmentId: string): Promise<ISubmission[]> {
        return this.submissionRepo.findByAssignment(assignmentId);
    }

    async getSubmissionsByUser(userId: string): Promise<ISubmission[]> {
        return this.submissionRepo.findByUser(userId);
    }

    async gradeSubmission(submissionId: string, grades: { taskIndex: number, score: number, feedback?: string }[], graderId: string): Promise<ISubmission> {
        const submission = await this.getSubmissionById(submissionId);
        let totalScore = 0;

        submission.answers = submission.answers.map(answer => {
            const grade = grades.find(g => g.taskIndex === answer.taskIndex);
            if (grade) {
                answer.score = grade.score;
                answer.feedback = grade.feedback;
                totalScore += grade.score;
            }
            return answer;
        });

        submission.grade = totalScore;
        submission.gradedBy = graderId;
        submission.gradedAt = new Date();
        submission.status = SubmissionStatus.GRADED;

        const updatedSubmission = await this.submissionRepo.update(submissionId, submission);
        if(!updatedSubmission)
            throw new ServerError("Error on update submission at grading");
        return updatedSubmission;
    }
}