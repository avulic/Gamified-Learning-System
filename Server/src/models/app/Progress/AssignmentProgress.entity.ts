import { ProgressTypeEnum, SubmissionStatus } from "@/models/enums";
import { AutoMap } from "automapper-classes";

export class TaskSubmissionStatus {
    @AutoMap()
    status!: SubmissionStatus;
    @AutoMap()
    attempts!: number;
    @AutoMap()
    bestScore?: number;
    @AutoMap()
    lastSubmissionId?: string;
    @AutoMap()
    taskId!: string;
    @AutoMap()
    firstAttemptAt?: Date;
    @AutoMap()
    lastAttemptAt?: Date;
    @AutoMap()
    timeSpent!: number;
}




export class AssignmentProgress {
    @AutoMap()
    id?: string;
    @AutoMap()
    userId!: string;
    @AutoMap()
    assignmentId!: string;
    @AutoMap()
    status!: ProgressTypeEnum;
    @AutoMap()
    startedAt!: Date;
    @AutoMap()
    lastActivityAt!: Date;
    @AutoMap()
    completedAt?: Date;
    @AutoMap(()=>[TaskSubmissionStatus])
    tasksProgress!: TaskSubmissionStatus[];
    @AutoMap()
    metrics!: {
        totalTasksAttempted: number;
        totalTasksCompleted: number;
        averageAttemptsPerTask: number;
        averageTimePerTask: number;
        totalTimeSpent: number;
        timeSpentByTaskType: number;
        taskCompletionByType: number;
    };
}
