import { injectable } from 'inversify';
import { ClientSession, Types } from 'mongoose';
import { MongoRepository } from "./MongoRepository";
import {
    BaseTaskSubmission,
    QuizSubmission,
    QuestionSubmission,
    FileUploadSubmission,
    CodeSubmission,
    BaseTaskSubmissionDocument,
    IBaseTaskSubmissionDb
} from '@/models/db/mongo/Submission.db';
import { BaseTaskSubmission as ISubmission } from "@/models/app";
import { TaskTypeEnum } from '@/models/enums';

@injectable()
export class SubmissionRepository extends MongoRepository<ISubmission, IBaseTaskSubmissionDb, BaseTaskSubmissionDocument> {
    constructor() {
        super(BaseTaskSubmission);
    }

    toDomain(dbModel: IBaseTaskSubmissionDb): ISubmission {
        return dbModel as unknown as ISubmission;
    }

    toDatabase(domainModel: ISubmission): IBaseTaskSubmissionDb {
        return ISubmission.toDb(domainModel) as IBaseTaskSubmissionDb;
    }

    async findById(
        id: string,
        options?: { populate?: string[], session?: ClientSession }
    ): Promise<ISubmission | null> {
        const { populate = [], session } = options || {};

        const found = await BaseTaskSubmission
            .findById(id)
            .populate(populate)
            .session(session || null as any);

        return found ? this.toDomain(found.toObject()) : null;
    }


    async findByAssignment(
        assignmentId: string,
        options?: { populate?: string[], session?: ClientSession }
    ): Promise<ISubmission[]> {
        const { populate = [], session } = options || {};

        const found = await BaseTaskSubmission
            .find({ assignmentId: new Types.ObjectId(assignmentId) })
            .populate(populate)
            .session(session || null as any);

        return found.map(submission => this.toDomain(submission.toObject()));
    }

    async findByUser(
        userId: string,
        options?: { populate?: string[], session?: ClientSession }
    ): Promise<ISubmission[]> {
        const { populate = [], session } = options || {};

        const found = await BaseTaskSubmission
            .find({ userId: new Types.ObjectId(userId) })
            .populate(populate)
            .session(session || null as any);

        return found.map(submission => this.toDomain(submission.toObject()));
    }

    async findByUserAndAssignment(
        userId: string,
        assignmentId: string,
        options?: { populate?: string[], session?: ClientSession }
    ): Promise<ISubmission[]> {
        const { populate = [], session } = options || {};

        const found = await this.model
            .find({
                userId: new Types.ObjectId(userId),
                assignmentId: new Types.ObjectId(assignmentId)
            })
            .populate(populate)
            .session(session || null as any);

        return found.map(submission => this.toDomain(submission.toObject()));
    }

    async findByTaskType(
        taskType: TaskTypeEnum,
        options?: { populate?: string[], session?: ClientSession }
    ): Promise<ISubmission[]> {
        const { populate = [], session } = options || {};

        const found = await this.model
            .find({ taskType })
            .populate(populate)
            .session(session || null as any);

        return found.map(submission => this.toDomain(submission.toObject()));
    }

    async findLatestByUserAndTask(
        userId: string,
        taskId: string,
        options?: { populate?: string[], session?: ClientSession }
    ): Promise<ISubmission | null> {
        const { populate = [], session } = options || {};

        const found = await this.model
            .findOne({
                userId: new Types.ObjectId(userId),
                taskId: new Types.ObjectId(taskId)
            })
            .sort({ 'currentState.submittedAt': -1 })
            .populate(populate)
            .session(session || null as any);

        return found ? this.toDomain(found.toObject()) : null;
    }

    async bulkCreate(
        submissions: ISubmission[],
        options?: { session?: ClientSession }
    ): Promise<ISubmission[]> {
        const { session } = options || {};

        // Group submissions by task type
        const submissionsByType = submissions.reduce((acc, submission) => {
            const type = submission.taskType;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(this.toDatabase(submission));
            return acc;
        }, {} as Record<TaskTypeEnum, any[]>);

        // Create submissions for each type
        const createdSubmissions = await Promise.all(
            Object.entries(submissionsByType).map(async ([type, typeSubmissions]) => {
                const created = await this.model.create(typeSubmissions, { session });
                return created;
            })
        );

        // Flatten and convert to domain models
        return createdSubmissions
            .flat()
            .map(submission => this.toDomain(submission.toObject()));
    }

    async getSubmissionStats(
        assignmentId: string,
        options?: { session?: ClientSession }
    ): Promise<{
        totalSubmissions: number,
        submissionsByType: Record<TaskTypeEnum, number>,
        averageScore: number
    }> {
        const { session } = options || {};

        const [stats] = await BaseTaskSubmission.aggregate([
            { $match: { assignmentId: new Types.ObjectId(assignmentId) } },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    submissionsByType: {
                        $push: '$taskType'
                    },
                    averageScore: { $avg: '$grading.score' }
                }
            }
        ]).session(session || null as any);

        if (!stats) {
            return {
                totalSubmissions: 0,
                submissionsByType: {} as Record<TaskTypeEnum, number>,
                averageScore: 0
            };
        }

        // Convert submissionsByType array to record
        const submissionsByType = stats.submissionsByType.reduce((acc: Record<string, number>, type: string) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        return {
            totalSubmissions: stats.totalSubmissions,
            submissionsByType: submissionsByType as Record<TaskTypeEnum, number>,
            averageScore: stats.averageScore || 0
        };
    }
}