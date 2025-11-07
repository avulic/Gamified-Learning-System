// services/AssignmentService.ts
import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import { AssignmentRepository } from '@/repository/AssignmentRepository';


import Logger from '@/utils/logger';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { Assignment } from '@/models/app';
import { ClientSession, Types } from 'mongoose';
import { ParentType } from '@/models/app/Assignment.entity';
import { TaskService } from './TaskService';

@injectable()
export class AssignmentService {
    constructor(
        @inject(TYPES.AssignmentRepository) private assignmentRepository: AssignmentRepository,
        @inject(TYPES.TaskService) private taskService: TaskService,
        @inject(TYPES.Logger) private logger: ILogger
    ) { }

    async createAssignment(assignmentData: Assignment): Promise<Assignment> {
        try {
            const createdAssignment = await this.assignmentRepository.create(assignmentData, {});

            this.logger.info('Assignment created successfully', { assignmentId: createdAssignment.id });
            return createdAssignment;
        } catch (error) {

            throw error;
        }
    }

    async getAssignmentById(id: string): Promise<Assignment> {
        const assignment = await this.assignmentRepository.findById(id);
        if (!assignment) {
            throw new NotFoundError('Assignment not found');
        }

        return assignment;
    }

    async getAllAssignments() {
        const assignment = await this.assignmentRepository.findAll();
        if (!assignment) {
            throw new NotFoundError('Assignment not found');
        }

        return assignment;
    }

    async updateAssignmentTasks(assignmentId: string, taskUpdates: { taskId: string; prerequisites: string[] }[]): Promise<Assignment> {
        try {
            const assignment = await this.getAssignmentById(assignmentId);
            if (!assignment) {
                throw new NotFoundError('Assignment not found');
            }

            // Update prerequisites for each task
            assignment.tasks = assignment.tasks.map(task => {
                const update = taskUpdates.find(u => u.taskId === task.id);
                if (update) {
                    return {
                        ...task,
                        prerequisites: update.prerequisites
                    };
                }
                return task;
            });

            // Save the updated assignment
            const updatedAssignment = await this.assignmentRepository.update(
                assignmentId,
                { ...assignment, tasks: assignment.tasks }
            );

            if (!updatedAssignment) {
                throw new Error('Failed to update assignment tasks');
            }

            this.logger.info('Assignment tasks updated successfully', { assignmentId });
            return updatedAssignment;

        } catch (error) {
            this.logger.error('Error updating assignment tasks', {
                assignmentId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }


    async getAssignmentsByModule(moduleId: string, session?: ClientSession): Promise<Assignment[]> {
        const assignments = await this.assignmentRepository.findByParentId(moduleId, {}, session);

        const assignmentsWithTasks = await Promise.all(
            assignments.map(async (assignment) => {
                // Get assignments for this module
                const tasks = await this.taskService.getTasksByAssignmentId(assignment.id as string, session);

                // Assign the assignments to the module
                assignment.tasks = tasks;

                return assignment;
            })
        );

        return assignmentsWithTasks;
    }


    async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
        const assignments = await this.assignmentRepository.findByCourseId(courseId);
        return assignments;
    }

    async getAssignmentsByLesson(lessonId: string, session?: ClientSession): Promise<Assignment[]> {
        const assignments = await this.assignmentRepository.findByParentId(lessonId, {}, session);

        const assignmentsWithTasks = await Promise.all(
            assignments.map(async (assignment) => {
                // Get assignments for this module
                const tasks = await this.taskService.getTasksByAssignmentId(assignment.id as string, session);

                // Assign the assignments to the module
                assignment.tasks = tasks;

                return assignment;
            })
        );

        return assignmentsWithTasks;
    }
}

export default AssignmentService;