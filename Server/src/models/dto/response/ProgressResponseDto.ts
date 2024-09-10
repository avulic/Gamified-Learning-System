import { ProgressType, TaskStatus } from "@/models/enums";

export interface ProgressResponseDto {
    id: string;
    userId: string;
    type: ProgressType;
    courseId?: string;
    taskId?: string;
    overallProgress?: number;
    totalXpEarned?: number;
    level?: number;
    achievements?: string[];
    status?: TaskStatus;
    score?: number;
    timeSpent?: number;
    attempts?: number;
    completedAt?: Date;
}