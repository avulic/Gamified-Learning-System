import { TaskTypeEnum, SubmissionStatus } from "../enums";
import { IAnswer, IBaseAnswer } from "./Answer";
import { IAssignment } from "./Assignment";
import { IBaseEntity } from "./BaseEntity";
import { IUser } from "./User";

export interface ISubmitFullSubmissionData {
    userId: string;
    assignmentId: string;
    answers: ISubmitAnswerData[];
    timeSpent?: number;
}

export interface ISubmitAnswerData {
    taskId: string;
    taskType: TaskTypeEnum;
    content: any; // This will vary based on the task type
}


export interface ISubmission extends IBaseEntity {
    userId: string;
    assignmentId: string;
    status: SubmissionStatus;
    submittedAt: Date;
    lastUpdatedAt: Date;
    attemptNumber: number;
    timeSpent?: number;
    isLate: boolean;
    isPartial: boolean;

    grade?: number;
	gradedBy?: string;
	gradedAt?: Date;

	peerReviews?: Array<{
		reviewerId: string;
		score: number;
		comments: string;
	}>;
	plagiarismScore?: number;

    user?: IUser;
    assignment?: IAssignment;

    answers: IAnswer[];
}

