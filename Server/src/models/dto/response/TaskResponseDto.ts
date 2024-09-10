// models/dto/Task.ts

import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '@/models/enums';


export interface BaseTaskResponseDto {
    id: string;
    title: string;
    description: string;
    taskType: TaskTypeEnum;
    status: ProgressTypeEnum;
    points: number;
    order: number;
    xpReward: number;
    requiredForCompletion: boolean;
}

export interface MultiChoiceTaskResponseDto extends BaseTaskResponseDto {
    content: {
        question: string;
        options: Array<{
            text: string;
            isCorrect: boolean;
        }>;
    };
}

export interface FileUploadTaskResponseDto extends BaseTaskResponseDto {
    content: {
        allowedFileTypes: string[];
        maxFileSize: number;
    };
}

export interface QuestionTaskResponseDto extends BaseTaskResponseDto {
    content: {
        questionType: QuestionType;
        question: string;
        correctAnswer: string;
    };
}

export type TaskResponseDto = MultiChoiceTaskResponseDto | FileUploadTaskResponseDto | QuestionTaskResponseDto;

// models/dto/Assignment.ts

