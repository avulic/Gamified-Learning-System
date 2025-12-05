// GamificationService.ts
import { injectable, inject } from "inversify";
import { TYPES } from "@/types";
import { IUserProgress } from "@/models/app/Progress/UserProgress.entity";
import UserProgressRepository from "@/repository/Progress/UserProgressRepository";
import AssignmentProgressRepository from "@/repository/Progress/AssignmentProgressRepository";
import { Task } from "@/models/app/Task.entity";
import { ClientSession } from "mongoose";
import { NotFoundError } from "@/models/app/Errors/NotFoundError";
import { Logger } from "winston";
import { Assignment } from "@/models/app/Assignment.entity";
import { ProgressTypeEnum, SubmissionStatus, SubmissionTypeEnum, TaskTypeEnum } from "@/models/enums";



@injectable()
export default class GamificationService {

    constructor(
        @inject(TYPES.UserProgressRepository) private userProgressRepo: UserProgressRepository,
        @inject(TYPES.AssignmentProgressRepository) private assignmentProgressRepo: AssignmentProgressRepository,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    // -------------------------------------------------------
    // SECTION 1 — User Progress Helpers
    // -------------------------------------------------------

    async getOrCreateUserProgress(userId: string, session?: ClientSession): Promise<IUserProgress> {
        let progress = await this.userProgressRepo.findByUserId(userId, session);

        const UserProgress = {
            id: "",
            userId,
            totalXP: 0,
            level: 1,
            overallProgress: 0,
            completedTasks: [],
            xpHistory: [],
            achievements: [],
            dailyStreak: 0,
            lastActiveDate: null
        } as IUserProgress;

        if (!progress) {
            progress = await this.userProgressRepo.create(UserProgress, {}, session);
        }

        return progress;
    }

    // -------------------------------------------------------
    // SECTION 2 — XP Awarding
    // -------------------------------------------------------

    async awardXP(
        userId: string,
        xp: number,
        meta?: { taskId?: string; assignmentId?: string; reason?: string },
        session?: ClientSession
    ): Promise<IUserProgress> {
        if (xp <= 0) return this.getOrCreateUserProgress(userId);

        const progress = await this.getOrCreateUserProgress(userId, session);
        progress.totalXP += xp;

        // Log event
        progress.xpHistory.push({
            xp,
            taskId: meta?.taskId,
            assignmentId: meta?.assignmentId,
            reason: meta?.reason || "xp_awarded",
            awardedAt: new Date(),
        });

        // Level Up
        const newLevel = this.calculateLevel(progress.totalXP);
        progress.level = newLevel;

        await this.updateDailyStreakInternal(progress);
        await this.userProgressRepo.update(progress.id!, progress, session);

        return progress;
    }

    private calculateLevel(xp: number): number {
        // Smooth growth: feels good across many ranges
        return Math.floor(Math.sqrt(xp / 150)) + 1;
    }

    // -------------------------------------------------------
    // SECTION 3 — Task Completion Handling
    // -------------------------------------------------------

    async onTaskCompleted(
        userId: string,
        task: Task,
        assignmentId: string,
        session?: ClientSession
    ): Promise<void> {
        const progress = await this.getOrCreateUserProgress(userId, session);

        // Prevent duplicate XP for same task
        const alreadyCompleted = progress.completedTasks.includes(task.id!);
        if (!alreadyCompleted) {
            progress.completedTasks.push(task.id!);

            // Award XP
            await this.awardXP(
                userId,
                task.xpReward || 50, // fallback default XP
                {
                    taskId: task.id!,
                    assignmentId,
                    reason: "task_first_completion"
                },
                session
            );
        }

        // Update overall progress
        await this.calculateOverallProgress(userId);
    }

    // -------------------------------------------------------
    // SECTION 4 — Assignment Completion Handling
    // -------------------------------------------------------

    async onAssignmentCompleted(
        userId: string,
        assignment: Assignment,
        assignmentProgress: any,
        session?: ClientSession
    ): Promise<void> {
        const bonusXP = assignment.points || 100;

        await this.awardXP(
            userId,
            bonusXP,
            {
                assignmentId: assignment.id!,
                reason: "assignment_completed"
            },
            session
        );

        // Recalculate global progress
        await this.calculateOverallProgress(userId);
    }

    // -------------------------------------------------------
    // SECTION 5 — Overall Progress
    // -------------------------------------------------------

    async calculateOverallProgress(userId: string): Promise<number> {
        const all = await this.assignmentProgressRepo.findByUser(userId);
        if (all.length === 0) return 0;

        let totalPct = 0;

        for (const ap of all) {
            const tasks = ap.tasksProgress;
            if (!tasks.length) continue;

            const completed = tasks.filter(t => t.status === SubmissionStatus.COMPLETED).length;
            const pct = (completed / tasks.length) * 100;

            totalPct += pct;
        }

        const avg = Math.round(totalPct / all.length);

        const progress = await this.getOrCreateUserProgress(userId);
        progress.overallProgress = avg;
        await this.userProgressRepo.update(progress.id!, progress);

        return avg;
    }

    // -------------------------------------------------------
    // SECTION 6 — Daily Streak
    // -------------------------------------------------------

    private async updateDailyStreakInternal(progress: IUserProgress): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!progress.lastActiveDate) {
            progress.dailyStreak = 1;
        } else {
            const last = new Date(progress.lastActiveDate);
            last.setHours(0, 0, 0, 0);

            const diff = today.getTime() - last.getTime();

            if (diff === 0) {
                return; // Already active today
            }

            if (diff === 86400000) {
                progress.dailyStreak += 1; // consecutive day
            } else {
                progress.dailyStreak = 1; // reset
            }
        }

        progress.lastActiveDate = new Date();
    }

    // -------------------------------------------------------
    // SECTION 7 — Achievements (optional hook)
    // -------------------------------------------------------

    async checkAndUnlockAchievements(userId: string): Promise<void> {
        // Implement your achievement criteria here
        // Example:
        // - First task completed
        // - 10 tasks completed
        // - 7-day streak
        // - Level milestones
        // etc.
    }
}
