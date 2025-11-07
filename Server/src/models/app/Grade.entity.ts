import { Types } from "mongoose";
import { GradingStatus } from "../enums";
import { TaskSubmission } from "./Submission.entity";
import { BaseTask } from "./Task.entity";
import { User } from "./User.entity";


export class IGrade {
    id!: string;
    status!: GradingStatus;
    gradedBy?: Types.ObjectId;
    gradedAt?: Date;
    score?: number;
    feedback?: string;
    rubricScores?: Array<{
        criteriaId: Types.ObjectId;
        score: number;
        comment: string;
    }>;
    history?: Array<{
        gradedAt: Date;
        gradedBy: Types.ObjectId;
        score: number;
        feedback: string;
    }>;

    version!: number;
}

