import { ProgressTypeEnum, SubmissionStatus, TaskTypeEnum } from "@/models/enums";
import { IFileResponseDto } from "./IFileResponseDto";


export interface BaseAnswerResponseDto {
    taskIndex: number;
    answerType: TaskTypeEnum;
    answerIndex: number;
    status: ProgressTypeEnum;
    score?: number;
    feedback?: string;
}

export interface ResponseMultiChoiceAnswerDto extends BaseAnswerResponseDto {
    selectedOptions: string[];
}

export interface ResponseQuestionAnswerDto extends BaseAnswerResponseDto {
    response: string;
}

export interface ResponseFileUploadAnswerDto extends BaseAnswerResponseDto {
    files: IFileResponseDto[];
}

export type AnswerResponseDto = ResponseMultiChoiceAnswerDto | ResponseQuestionAnswerDto | ResponseFileUploadAnswerDto;





export interface SubmissionResponseDto {
    id: string;
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
    answers: AnswerResponseDto[];
    peerReviews?: Array<{
        reviewerId: string;
        score: number;
        comments: string;
    }>;
    plagiarismScore?: number;
}

// DTO for grading a submission

export interface GradeSubmissionDto {
    grades: Array<{
        taskIndex: number;
        score: number;
        feedback?: string;
    }>;
    graderId: string;
}