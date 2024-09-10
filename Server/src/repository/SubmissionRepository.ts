import { injectable } from 'inversify';
import { Model, Types } from 'mongoose';
import { MongoRepository } from "./MongoRepository";
import Submission, { ISubmissionDb } from "@/models/db/mongo/Submission";
import { ISubmission } from "@/models/app";
import { SubmissionMapper } from "@/utils/ModelMapper";

@injectable()
export class SubmissionRepository extends MongoRepository<ISubmission, ISubmissionDb> {
    constructor() {
        super(Submission);
    }

    toDomain(dbModel: ISubmissionDb): ISubmission {
        return SubmissionMapper.dbToDomain(dbModel);
    }

    toDatabase(domainModel: Partial<ISubmission>): Partial<ISubmissionDb> {
        return SubmissionMapper.domainToDb(domainModel);
    }

    async create(submission: ISubmission): Promise<ISubmission> {
        const dbModel = this.toDatabase(submission as ISubmission);
        const created = await this.model.create(dbModel);
        return this.toDomain(created);
    }

    async findById(id: string): Promise<ISubmission | null> {
        const found = await this.model.findById(id);
        return found ? this.toDomain(found) : null;
    }

    async findByUserAndAssignment(userId: string, assignmentId: string): Promise<ISubmission | null> {
        const found = await this.model.findOne({ 
            userId: new Types.ObjectId(userId), 
            assignmentId: new Types.ObjectId(assignmentId) 
        });
        return found ? this.toDomain(found) : null;
    }

    async update(id: string, submission: Partial<ISubmission>): Promise<ISubmission | null> {
        const dbModel = this.toDatabase(submission);
        const updated = await this.model.findByIdAndUpdate(id, dbModel, { new: true });
        return updated ? this.toDomain(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.deleteOne({ _id: new Types.ObjectId(id) });
        return result.deletedCount === 1;
    }

    async findByAssignment(assignmentId: string): Promise<ISubmission[]> {
        const found = await this.model.find({ assignmentId: new Types.ObjectId(assignmentId) });
        return found.map(this.toDomain);
    }

    async findByUser(userId: string): Promise<ISubmission[]> {
        const found = await this.model.find({ userId: new Types.ObjectId(userId) });
        return found.map(this.toDomain);
    }
}