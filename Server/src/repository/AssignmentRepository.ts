// repository/AssignmentRepository.ts
import { injectable } from 'inversify';
import { IAssignmentDb } from '@/models/db/mongo/Assignment';
import Assignment from '@/models/db/mongo/Assignment';
import { IAssignment } from '@/models/app/Assignment';
import { AssignmentMapper } from '@/utils/ModelMapper';

@injectable()
export class AssignmentRepository {
    async create(assignmentData: IAssignment): Promise<IAssignment> {
        const dbAssignment = new Assignment(AssignmentMapper.domainToDb(assignmentData));
        const savedAssignment = await dbAssignment.save();
        return AssignmentMapper.dbToDomain(savedAssignment);
    }

    async findById(id: string): Promise<IAssignment | null> {
        const dbAssignment = await Assignment.findById(id);
        return dbAssignment ? AssignmentMapper.dbToDomain(dbAssignment) : null;
    }

    async update(id: string, assignmentData: Partial<IAssignment>): Promise<IAssignment | null> {
        const updatedDbAssignment = await Assignment.findByIdAndUpdate(
            id,
            AssignmentMapper.domainToDb(assignmentData),
            { new: true }
        );
        return updatedDbAssignment ? AssignmentMapper.dbToDomain(updatedDbAssignment) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await Assignment.findByIdAndDelete(id);
        return !!result;
    }

    async findByModuleId(moduleId: string): Promise<IAssignment[]> {
        const dbAssignments = await Assignment.find({ moduleId });
        return dbAssignments.map(AssignmentMapper.dbToDomain);
    }

    async findByCourseId(courseId: string): Promise<IAssignment[]> {
        const dbAssignments = await Assignment.find({ courseId });
        return dbAssignments.map(AssignmentMapper.dbToDomain);
    }
}

export default AssignmentRepository;