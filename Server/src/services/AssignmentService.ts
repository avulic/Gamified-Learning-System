// services/AssignmentService.ts
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import { AssignmentRepository } from '@/repository/AssignmentRepository';
import { AssignmentMapper } from '@/utils/ModelMapper';

import Logger from '@/utils/logger';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { IAssignment } from '@/models/app';

@injectable()
export class AssignmentService {
    constructor(
        @inject(TYPES.AssignmentRepository) private assignmentRepository: AssignmentRepository,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    async createAssignment(assignmentData: IAssignment): Promise<IAssignment> {
        const createdAssignment = await this.assignmentRepository.create(assignmentData);
        
        this.logger.info('Assignment created successfully', { assignmentId: createdAssignment.id });

        return createdAssignment;
    }

    async getAssignmentById(id: string): Promise<IAssignment> {
        const assignment = await this.assignmentRepository.findById(id);
        if (!assignment) {
            throw new NotFoundError('Assignment not found');
        }

        return assignment;
    }

    async updateAssignment(id: string, updateAssignmentDto: Partial<IAssignment>): Promise<IAssignment> {
        const existingAssignment = await this.assignmentRepository.findById(id);
        if (!existingAssignment) {
            throw new NotFoundError('Assignment not found');
        }

        const updatedAssignment = await this.assignmentRepository.update(id, updateAssignmentDto);
        if(!updatedAssignment)
            throw new NotFoundError("assignemn not updated");
        
        this.logger.info('Assignment updated successfully', { assignmentId: id });

        return updatedAssignment;
    }

    async deleteAssignment(id: string): Promise<boolean> {
        const assignment = await this.assignmentRepository.findById(id);
        if (!assignment) {
            throw new NotFoundError('Assignment not found');
        }

        const isDeleted = await this.assignmentRepository.delete(id);
        
        this.logger.info('Assignment deleted successfully', { assignmentId: id });

        return isDeleted;
    }

    async getAssignmentsByModule(moduleId: string): Promise<IAssignment[]> {
        const assignments = await this.assignmentRepository.findByModuleId(moduleId);
        return assignments;
    }

    async getAssignmentsByCourse(courseId: string): Promise<IAssignment[]> {
        const assignments = await this.assignmentRepository.findByCourseId(courseId);
        return assignments;
    }
}

export default AssignmentService;