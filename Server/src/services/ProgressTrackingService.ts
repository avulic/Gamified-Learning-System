import { injectable, inject } from 'inversify';
import { ClientSession } from 'mongoose';
import { TYPES } from '@/types';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import AssignmentProgressRepository from '@/repository/Progress/AssignmentProgressRepository';
import { AssignmentProgress, TaskSubmissionStatus } from '@/models/app/Progress/AssignmentProgress.entity';
import { BaseTaskSubmission } from '@/models/app/Submission.entity';
import { SubmissionStatus, ProgressTypeEnum, SubmissionPolicy, TaskTypeEnum } from '@/models/enums';
import GamificationService from './GamificationService';
import { Logger } from 'winston';
import { Assignment, Task, User } from '@/models/app';
import { AccessService } from '@/access/AccessService';
import UserService from './UserService';
import { UserToken } from '@/models/app/User.entity';
import { SubmissionRepository } from '@/repository/SubmissionRepository';

/**
 * Result returned by updateProgressFromSubmissions
 */
export type ProgressUpdateResult = {
    updatedProgress: AssignmentProgress;
    newlyCompletedTaskIds: string[];   // tasks that became COMPLETED in this operation
    assignmentJustCompleted: boolean;  // whether assignment moved from NOT_COMPLETE -> COMPLETE
};

@injectable()
export default class ProgressTrackingService {
    constructor(
        @inject(TYPES.AssignmentProgressRepository) private progressRepo: AssignmentProgressRepository,
        @inject(TYPES.GamificationService) private gamificationService: GamificationService,
        @inject(TYPES.AccessService) private accessService: AccessService,
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.SubmissionRepository) private submissionRepo: SubmissionRepository,
        @inject(TYPES.Logger) private logger: Logger,
    ) { }

    // ------------------------
    // Find / Get / Create
    // ------------------------

    /**
     * Plain lookup that returns null when missing.
     * Repositories are responsible for the DB lookup; service translates to domain object behavior.
     */
    async findProgress(userId: string, assignmentId: string, session?: ClientSession): Promise<AssignmentProgress | null> {
        return this.progressRepo.findByUserAndAssignment(userId, assignmentId, session);
    }

    /**
     * Strict getter that throws when progress missing.
     */
    async getProgress(userId: string, assignmentId: string, session?: ClientSession): Promise<AssignmentProgress> {
        const progress = await this.findProgress(userId, assignmentId, session);
        if (!progress) throw new NotFoundError('Assignment progress not found (call createProgress/getOrCreateProgress first)');
        return progress;
    }

    /**
     * Explicit creation: throws if progress already exists. Use when user intentionally starts assignment.
     */
    async createProgress(userId: string, assignment: Assignment, session?: ClientSession): Promise<AssignmentProgress> {
        const now = new Date();

        const existingProgress = await this.progressRepo.findByUserAndAssignment(userId, assignment.id!, session);
        if (existingProgress) throw new Error('Progress already exists');

        const user = await this.userService.getUserById(userId, session);
        if (!user) throw new NotFoundError(`User with ID ${userId} not found`);

        const ctx = {
            now: now,
            existingProgress: existingProgress
        };

        // ABAC: progress.start
        await AccessService.authorize(
            user,
            'progress',
            'start',
            assignment,
            ctx,
            { throwOnDeny: true }
        );




        const tasksProgress = this.buildInitialTasksProgressFromAssignment(assignment);
        const metrics = this.buildInitialMetrics();

        const newProgress: AssignmentProgress = {
            userId,
            assignmentId: assignment.id!,
            status: ProgressTypeEnum.IN_PROGRESS,
            startedAt: new Date(),
            lastActivityAt: new Date(),
            completedAt: undefined,
            tasksProgress,
            metrics
        } as AssignmentProgress;

        return this.progressRepo.create(newProgress, {}, session);
    }

    /**
     * Convenience atomic helper used by SubmissionService: returns existing progress or creates one.
     * - Does NOT fetch assignment from DB; caller MUST pass a fully loaded Assignment (with tasks array).
     * - This avoids races (see implementation uses repository find/create; caller may pass session for transactional safety).
     */
    async getOrCreateProgress(userId: string, assignment: Assignment, session?: ClientSession): Promise<AssignmentProgress> {
        // try find first
        let progress = await this.progressRepo.findByUserAndAssignment(userId, assignment.id!, session);
        if (progress) return progress;

        // Not found: create using canonical logic
        return this.createProgress(userId, assignment, session);
    }

    // ------------------------
    // Primary update path
    // ------------------------

    /**
     * Update canonical AssignmentProgress using one or more submissions.
     * Caller MUST pass:
     *  - a persisted `progress` document (loaded in the same transaction/session as updates will be saved),
     *  - the assignment object (with tasks array), and
     *  - a map of tasks by id to avoid per-task DB hits.
     *
     * This method is intentionally pure with regard to business rules outside progress (no attempt-limit checks, no ABAC, no auto-grading).
     */
    async updateProgressFromSubmissions(
        progress: AssignmentProgress,
        submissions: BaseTaskSubmission[],
        assignment: Assignment,
        tasksById: Map<string, Task>,
        user: UserToken,
        session?: ClientSession
    ): Promise<ProgressUpdateResult> {

        if (!progress || !progress.id) {
            throw new Error('Progress must be a persisted AssignmentProgress (call getProgress/createProgress first).');
        }

        const now = new Date();

        // load submission history properly (array of submission documents)
        const submissionHistory = await this.submissionRepo.findByUserAndAssignment(progress.userId, assignment.id!, {}, session);

        const ctx = {
            now,
            submissionHistory,
            progress,
            submissions
        };

        // ABAC: high-level guard (throw on deny)
        await AccessService.authorize(user, 'progress', 'update', assignment, ctx, { throwOnDeny: true });

        const newlyCompletedTaskIds: string[] = [];

        for (const submission of submissions) {
            const taskId = submission.taskId.toString();
            const prevRow = progress.tasksProgress.find(r => r.taskId.toString() === taskId);
            const task = tasksById.get(taskId);

            if (!task)
                throw new NotFoundError(`Task with ID ${taskId} not found`);

            const abacCtx = {
                now,
                progress,
                assignment,
                prevRow,
                submission,
                submissionHistory
            };

            // authorize per-task (guard-only). Will throw on deny.
            await AccessService.authorize(user, 'progress', 'task.update', { submission, task }, abacCtx, { throwOnDeny: true });

            // Service now computes updatedRow (domain logic)
            const updatedRow: TaskSubmissionStatus = this.computeUpdatedTaskProgress(prevRow, submission, task, now);

            if (prevRow) {
                Object.assign(prevRow, updatedRow);
            } else {
                progress.tasksProgress.push(updatedRow);
            }
            // Track newly completed tasks
            if (updatedRow.status === ProgressTypeEnum.COMPLETED && prevRow?.status !== ProgressTypeEnum.COMPLETED) {
                newlyCompletedTaskIds.push(taskId);
            }
        }

        progress.lastActivityAt = now;

        // compute metrics in service (non-ABAC)
        progress.metrics = await this.calculateProgressMetrics(progress, tasksById);

        // completion check: ABAC decides whether assignment qualifies for completion
        const completionCtx = { progress, assignment };
        const completionResult = await AccessService.authorize(user, 'progress', 'assignment.complete', assignment, completionCtx, { throwOnDeny: false });

        const wasPreviouslyCompleted = progress.status === ProgressTypeEnum.COMPLETED;

        if (completionResult.allowed) {
            progress.status = ProgressTypeEnum.COMPLETED;
            progress.completedAt = progress.completedAt ?? now;
        } else {
            progress.status = ProgressTypeEnum.IN_PROGRESS;
            progress.completedAt = undefined;
        }

        const savedProgress = await this.progressRepo.update(progress.id!, progress, session);
        if (!savedProgress) throw new Error('Failed to persist progress');

        // Trigger side effects for newly completed tasks
        await this.handleCompletionSideEffects(
            newlyCompletedTaskIds,
            progress.userId,
            tasksById,
            assignment,
            savedProgress,
            completionResult.allowed && !wasPreviouslyCompleted,
            session
        );

        return {
            updatedProgress: savedProgress,
            newlyCompletedTaskIds,
            assignmentJustCompleted: completionResult.allowed && !wasPreviouslyCompleted
        };
    }



    /**
       * Computes updated task progress based on a new submission
       */
    private computeUpdatedTaskProgress(
        prev: TaskSubmissionStatus | undefined,
        submission: BaseTaskSubmission,
        task: Task,
        now: Date
    ): TaskSubmissionStatus {
        const baseline: TaskSubmissionStatus = prev ? { ...prev } : {
            taskId: submission.taskId,
            status: ProgressTypeEnum.NOT_STARTED,
            attempts: 0,
            timeSpent: 0,
            firstAttemptAt: undefined,
            lastAttemptAt: undefined,
            lastSubmissionId: undefined,
            bestScore: undefined
        };

        const updated: TaskSubmissionStatus = {
            ...baseline,
            taskId: submission.taskId,
            status: submission.currentState?.status ?? baseline.status,
            attempts: baseline.attempts + 1, // Increment attempts
            lastSubmissionId: submission.id,
            lastAttemptAt: now,
            timeSpent: (baseline.timeSpent || 0) + (submission.timeSpent || 0),
            bestScore: baseline.bestScore
        };

        // Set first attempt time if this is the first attempt
        if (!baseline.firstAttemptAt) {
            updated.firstAttemptAt = now;
        }

        // Handle scoring based on submission policy
        const incomingScore = submission.grade?.score;
        const policy: SubmissionPolicy = (task as any).submissionPolicy || SubmissionPolicy.BEST_SCORE;
        const passThreshold = this.calculatePassThreshold(task);

        this.applySubmissionPolicy(updated, incomingScore, policy, passThreshold);

        return updated;
    }

    private calculatePassThreshold(task: Task): number {
        const taskContent = task.content as any;
        return taskContent?.passingScore ?? (task.points ? task.points * 0.6 : 0);
    }

    private applySubmissionPolicy(
        updated: TaskSubmissionStatus,
        incomingScore: number | undefined,
        policy: SubmissionPolicy,
        passThreshold: number
    ): void {
        switch (policy) {
            case SubmissionPolicy.BEST_SCORE:
                if (typeof incomingScore === 'number') {
                    updated.bestScore = updated.bestScore === undefined
                        ? incomingScore
                        : Math.max(updated.bestScore, incomingScore);
                }
                if (typeof updated.bestScore === 'number' && updated.bestScore >= passThreshold) {
                    updated.status = ProgressTypeEnum.COMPLETED;
                }
                break;

            case SubmissionPolicy.FIRST_PASS:
                if (updated.status === ProgressTypeEnum.COMPLETED) {
                    // Already completed, maintain status
                } else if (typeof incomingScore === 'number') {
                    updated.bestScore = incomingScore;
                    if (incomingScore >= passThreshold) {
                        updated.status = ProgressTypeEnum.COMPLETED;
                    }
                }
                break;

            case SubmissionPolicy.LATEST:
                if (typeof incomingScore === 'number') {
                    updated.bestScore = incomingScore;
                }
                // Status comes from submission
                break;

            case SubmissionPolicy.BEST_PASS_THEN_LOCK:
                if (typeof incomingScore === 'number') {
                    updated.bestScore = updated.bestScore === undefined
                        ? incomingScore
                        : Math.max(updated.bestScore, incomingScore);
                }

                // Only update status if not already completed
                if (updated.status !== ProgressTypeEnum.COMPLETED &&
                    typeof updated.bestScore === 'number' &&
                    updated.bestScore >= passThreshold) {
                    updated.status = ProgressTypeEnum.COMPLETED;
                }
                break;
        }
    }


    // ------------------------
    // Helpers
    // ------------------------

    private buildInitialTasksProgressFromAssignment(assignment: Assignment): TaskSubmissionStatus[] {
        const tasks = assignment.tasks || [];
        return tasks.map(t => ({
            taskId: t.id!,
            status: ProgressTypeEnum.NOT_STARTED,
            attempts: 0,
            timeSpent: 0,
            firstAttemptAt: undefined,
            lastAttemptAt: undefined,
            lastSubmissionId: undefined,
            bestScore: undefined
        } as TaskSubmissionStatus));
    }

    private buildInitialMetrics() {
        return {
            totalTasksAttempted: 0,
            totalTasksCompleted: 0,
            averageAttemptsPerTask: 0,
            averageTimePerTask: 0,
            totalTimeSpent: 0,
            timeSpentByTaskType: {},
            taskCompletionByType: {}
        };
    }


    /**
      * Correctly calculates progress metrics using the provided tasks map for consistency
      * This method is synchronous and doesn't require database access
      */
    private calculateProgressMetrics(
        progress: AssignmentProgress,
        tasksById: Map<string, Task>
    ): AssignmentProgress['metrics'] {
        // Initialize metrics
        const metrics = {
            totalTasksAttempted: 0,
            totalTasksCompleted: 0,
            averageAttemptsPerTask: 0,
            averageTimePerTask: 0,
            totalTimeSpent: 0,
            timeSpentByTaskType: {} as Record<TaskTypeEnum, number>,
            taskCompletionByType: {} as Record<TaskTypeEnum, { attempted: number; completed: number }>
        };

        // Initialize counters for all possible task types
        Object.values(TaskTypeEnum).forEach(type => {
            metrics.timeSpentByTaskType[type] = 0;
            metrics.taskCompletionByType[type] = { attempted: 0, completed: 0 };
        });

        // Aggregate data from all task progress entries
        let totalAttempts = 0;
        const attemptedTasks: TaskSubmissionStatus[] = [];

        for (const taskProgress of progress.tasksProgress) {
            const task = tasksById.get(taskProgress.taskId.toString());
            if (!task)
                throw new Error(`Failed to find tasks with id: ${taskProgress.taskId}`)
            const taskType = task.taskType
            if (!taskType)
                throw new Error(`Wrong task type for task id: ${taskProgress.taskId}`)

            // Count time spent by task type
            const timeSpent = taskProgress.timeSpent || 0;
            metrics.timeSpentByTaskType[taskType] = (metrics.timeSpentByTaskType[taskType] || 0) + timeSpent;
            metrics.totalTimeSpent += timeSpent;

            // Count attempts and completions
            const attempts = taskProgress.attempts || 0;
            if (attempts > 0) {
                metrics.taskCompletionByType[taskType].attempted++;
                metrics.totalTasksAttempted++;
                attemptedTasks.push(taskProgress);
                totalAttempts += attempts;
            }

            if (taskProgress.status === ProgressTypeEnum.COMPLETED) {
                metrics.taskCompletionByType[taskType].completed++;
                metrics.totalTasksCompleted++;
            }
        }

        // Calculate averages
        metrics.averageAttemptsPerTask = metrics.totalTasksAttempted > 0
            ? totalAttempts / metrics.totalTasksAttempted
            : 0;

        metrics.averageTimePerTask = metrics.totalTasksAttempted > 0
            ? metrics.totalTimeSpent / metrics.totalTasksAttempted
            : 0;

        return metrics;
    }


    private async handleCompletionSideEffects(
        newlyCompletedTaskIds: string[],
        userId: string,
        tasksById: Map<string, Task>,
        assignment: Assignment,
        progress: AssignmentProgress,
        assignmentJustCompleted: boolean,
        session?: ClientSession
    ): Promise<void> {
        // Handle task completion events
        for (const taskId of newlyCompletedTaskIds) {
            const task = tasksById.get(taskId);
            if (task) {
                try {
                    await this.gamificationService.onTaskCompleted(userId, task, assignment.id!, session);
                } catch (error) {
                    this.logger.error('Gamification task hook failed', {
                        userId,
                        taskId,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        }

        // Handle assignment completion event
        if (assignmentJustCompleted) {
            try {
                await this.gamificationService.onAssignmentCompleted(userId, assignment, progress, session);
            } catch (error) {
                this.logger.error('Gamification assignment hook failed', {
                    userId,
                    assignmentId: assignment.id,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
    }

}
