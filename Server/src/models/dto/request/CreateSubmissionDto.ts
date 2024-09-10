import { IFile } from '@/models/app';
import { SubmissionStatus, TaskTypeEnum, ProgressTypeEnum } from '@/models/enums';
import { IFileRequestDto } from './IFileRequestDto';

// DTOs for creating and updating answers

export interface BaseCreateAnswerDto {
    taskIndex: number;
	answerType: TaskTypeEnum;
}

export interface CreateMultiChoiceAnswerDto extends BaseCreateAnswerDto {
    selectedOptions: string[];
}

export interface CreateQuestionAnswerDto extends BaseCreateAnswerDto {
    response: string;
}

export interface CreateFileUploadAnswerDto extends BaseCreateAnswerDto {
    files: IFileRequestDto[];
}

export type CreateAnswerDto = CreateMultiChoiceAnswerDto | CreateQuestionAnswerDto | CreateFileUploadAnswerDto;

export interface UpdateAnswerDto {
    score?: number;
    feedback?: string;
    status?: ProgressTypeEnum;
}

// DTOs for creating and updating submissions

export interface CreateSubmissionDto {
    userId: string;
    assignmentId: string;
    answers: CreateAnswerDto[];
    timeSpent?: number;

	status: SubmissionStatus;
	submittedAt: Date;
	lastUpdatedAt: Date;
	attemptNumber: number;
	isLate: boolean;
	isPartial: boolean;

    peerReviews?: Array<{
		reviewerId: string;
		score: number;
		comments: string;
	}>;
}


export interface UpdateSubmissionDto {
    status?: SubmissionStatus;
    timeSpent?: number;
    answers?: CreateAnswerDto[];
}

// DTO for submitting a single answer

export interface SubmitSingleAnswerDto {
    submissionId: string;
    answer: CreateAnswerDto;
}




