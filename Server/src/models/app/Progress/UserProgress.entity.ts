import { BaseEntity } from "../Base.entity";


export interface XPEvent {
    xp: number;
    taskId?: string;
    assignmentId?: string;
    reason: string;
    awardedAt: Date;
}

export class IUserProgress extends BaseEntity {
    userId!: string;
    totalXP!: number;
    level!: number;
    overallProgress!: number;

    completedTasks!: string[];
    xpHistory!: XPEvent[];
    dailyStreak!: number;
    lastActiveDate!: Date | null;
    achievements!: string[];
}

