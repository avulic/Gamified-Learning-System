import { ProgressTypeEnum, SubmissionStatus } from "@/models/enums";
import { AutoMap } from "automapper-classes";

export class TaskSubmissionStatus {
    status!: ProgressTypeEnum;
    attempts!: number;
    bestScore?: number;
    lastSubmissionId?: string;
    taskId!: string;
    firstAttemptAt?: Date;
    lastAttemptAt?: Date;
    timeSpent!: number;
}




export class AssignmentProgress {
    id?: string;
    userId!: string;
    assignmentId!: string;
    status!: ProgressTypeEnum;
    startedAt!: Date;
    lastActivityAt!: Date;
    completedAt?: Date;
    tasksProgress!: TaskSubmissionStatus[];
    metrics!: {
        totalTasksAttempted: number;
        totalTasksCompleted: number;
        averageAttemptsPerTask: number;
        averageTimePerTask: number;
        totalTimeSpent: number;
        timeSpentByTaskType: Record<string, number>;
        taskCompletionByType: Record<string, { attempted: number; completed: number }>;
    };
}
