import { TaskTypeEnum, SubmissionStatus } from "@/types/enums";
import { GradingStatus } from "./enums";
import { Answer } from "./task/Answer";
import { CodeTestCase } from "./task/Task";



export class FileUploadSubmissionFile {
    fileId!: string;
    fileName!: string;
    fileSize!: number;
    mimeType!: string;
}

// Peer review entity
export class PeerReview {
    reviewerId!: string;
    score!: number;
    comments!: string;
}



// Base Task Submission
export class BaseTaskSubmission {
    id?: string;
    userId!: string;
    assignmentId!: string;
    taskId!: string;
    taskType!: TaskTypeEnum;
    timeSpent?: number;
    currentState!: {
        status: SubmissionStatus;
        attemptNumber: number;
        submittedAt: Date;
        content: any;
    };
    grading!: {
        status: GradingStatus;
        gradedBy?: string;
        gradedAt?: Date;
        score?: number;
        feedback?: string;
        rubricScores?: Array<{
            criteriaId: string;
            score: number;
            comment: string;
        }>;
        history?: Array<{
            gradedAt: Date;
            gradedBy: string;
            score: number;
            feedback: string;
        }>;
    };

    version!: number;
    history!: Array<{
        submittedAt: Date;
        content: any;
        attemptNumber: number;
    }>;
}

// Quiz Submission
export class QuizSubmission extends BaseTaskSubmission {
    taskType!: TaskTypeEnum.QUIZ;
    answers!: Answer[];
}

// Question Submission
export class QuestionSubmission extends BaseTaskSubmission {
    taskType!: TaskTypeEnum.QUESTION;
    answer!: Answer;
}

// File Upload Submission
export class FileUploadSubmission extends BaseTaskSubmission {
    taskType!: TaskTypeEnum.FILE_UPLOAD;
    fileUrls!: string[];
    totalSize?: number;
}


export class CodeSubmission extends BaseTaskSubmission {
    taskType!: TaskTypeEnum.CODE;
    code!: string;
    testResults!: CodeTestCase[];
}



export type TaskSubmission = 
    | QuizSubmission
    | QuestionSubmission 
    | FileUploadSubmission 
    | CodeSubmission;