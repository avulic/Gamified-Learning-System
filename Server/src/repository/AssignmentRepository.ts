// repository/AssignmentRepository.ts
import { injectable } from 'inversify';
import { AssignmentDocument, IAssignmentDb } from '@/models/db/mongo/Assignment.db';
import Assignment from '@/models/db/mongo/Assignment.db';

import { MongoRepository } from './MongoRepository';
import { Assignment as IAssignment } from '@/models/app';
import { assignmentMapper } from '@/utils/mapper/autoMapper';
import { ClientSession } from 'mongoose';

@injectable()
export class AssignmentRepository extends MongoRepository<IAssignment, IAssignmentDb, AssignmentDocument> {
    constructor(
    ) {
        super(Assignment);
    }

    toDomain(dbModel: IAssignmentDb): IAssignment {
        return assignmentMapper.toEntity(dbModel);
    }

    toDatabase(domainModel: IAssignment): IAssignmentDb {
        return assignmentMapper.toDb(domainModel);
    }

    async findAll(options?: { populate?: string[] }): Promise<IAssignment[] | null> {
        const { populate = [] } = options || {};
        const assignments = await this.model.find().populate(populate);
        const assignmentsModel = assignments ? assignments.map(a => this.toDomain(a.toObject())) : null;
        return assignmentsModel;
    }

    async findById(id: string): Promise<IAssignment | null> {
        const dbAssignment = await Assignment.findById(id);
        return dbAssignment ? this.toDomain(dbAssignment.toObject()) : null;
    }

    async update(id: string, assignmentData: IAssignment): Promise<IAssignment | null> {
        const updatedDbAssignment = await Assignment.findByIdAndUpdate(
            id,
            this.toDatabase(assignmentData),
            { new: true }
        );
        return updatedDbAssignment ? this.toDomain(updatedDbAssignment.toObject()) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await Assignment.findByIdAndDelete(id);
        return !!result;
    }

    async findByParentId(parentId: string, options?: { populate?: string[] }, session?: ClientSession): Promise<IAssignment[]> {
        const { populate = [] } = options || {};
        const query = this.model.find({ parentId: parentId }).populate(populate);

        // Only apply session if it's provided
        if (session) {
            query.session(session);
        }
        const dbAssignments = await query.exec();
        return dbAssignments.map(a => this.toDomain(a.toObject()));
    }

    async findByCourseId(courseId: string): Promise<IAssignment[]> {
        const dbAssignments = await Assignment.find({ courseId });
        return dbAssignments.map(a => this.toDomain(a.toObject()));
    }
}

export default AssignmentRepository;