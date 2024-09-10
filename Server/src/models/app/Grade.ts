import { ISubmission } from "./Submission";
import { IBaseTask } from "./Task/BaseTask";
import { IUser } from "./User";

export interface IGrade {
    id: string;
    submissionId: ISubmission;
    taskId: IBaseTask;
    graderId: IUser;
    totalScore: number;
    feedback?: string;
    gradedAt?: Date;
    gradedBy?: string;
    maxScore: number;
}

