import { ParentType } from "./enums";
import { Task } from "./task/Task";

export class RubricCriterion {
    criterion!: string;
    points!: number;
}

export class Rubric {
    criteria!: RubricCriterion[];
}

export class PeerReviewSettings {
    enabled: boolean = false;
    reviewsPerStudent: number = 0;
    dueDate?: Date;
}

export class Assignment {
    id?: string;
    title!: string;
    description!: string;
    tasks!: Task[];
    rubric?: Rubric;
    peerReviewSettings?: PeerReviewSettings;
    parentType!: ParentType; 
    parentId?: string;
    createdBy?: string;
    submissionWindow!: {
        start: Date,
        end: Date,
        allowLateSubmissions: boolean,
        lateSubmissionPenalty: number  // percentage
    }

    maxAttempts!: number;
    passingScore!: number;
    points!: number;
    timeLimit?: number; // In minutes, optional,
}