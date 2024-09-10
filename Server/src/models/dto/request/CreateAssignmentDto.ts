import { Type } from "class-transformer";
import { IsString, MinLength, IsDate, IsArray, ValidateNested, IsNumber, IsOptional } from "class-validator";
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from "@/models/enums";
import { CreateBaseTaskDto, CreateMultiChoiceTaskDto, CreateFileUploadTaskDto, CreateQuestionTaskDto, CreateTaskDto } from "./CreateTaskDto";

// Assignment DTO
export class CreateAssignmentDtoOld {
    @IsString()
    @MinLength(3)
    title!: string;

    @IsString()
    description!: string;

    @IsDate()
    dueDate!: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateBaseTaskDto, {
        discriminator: {
            property: 'taskType',
            subTypes: [
                { value: CreateMultiChoiceTaskDto, name: TaskTypeEnum.MULTI_CHOICE },
                { value: CreateFileUploadTaskDto, name: TaskTypeEnum.FILE_UPLOAD },
                { value: CreateQuestionTaskDto, name: TaskTypeEnum.QUESTION },
            ],
        },
    })
    tasks!: CreateTaskDto[];

    @IsNumber()
    maxScore!: number;

    @IsNumber()
    maxAttempts!: number;

    @IsString()
    submissionType!: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedFileTypes?: string[];

    @IsOptional()
    @IsNumber()
    maxFileSize?: number;

    @IsNumber()
    xpReward!: number;

    @IsNumber()
    order!: number;
}





// models/dto/Assignment.ts


// interface BaseTaskDto {
//     assignmentId: string;
//     title: string;
//     description: string;
//     taskType: TaskTypeEnum;
//     dueDate?: Date;
//     xpReward: number;
//     points: number;
//     order: number;
//     requiredForCompletion: boolean;
// }

// interface MultiChoiceTaskDto extends BaseTaskDto {
//     content: {
//         question: string;
//         options: Array<{
//             text: string;
//             isCorrect: boolean;
//         }>;
//     };
// }

// interface FileUploadTaskDto extends BaseTaskDto {
//     content: {
//         allowedFileTypes: string[];
//         maxFileSize: number;
//     };
// }

// interface QuestionTaskDto extends BaseTaskDto {
//     content: {
//         questionType: QuestionType;
//         question: string;
//         correctAnswer: string;
//     };
// }

// export type CreateTaskDto = MultiChoiceTaskDto | FileUploadTaskDto | QuestionTaskDto;

export interface CreateAssignmentDto {
    courseId: string;
    moduleId: string;
    title: string;
    description: string;
    dueDate: Date;
    totalPoints: number;
    assignmentType: string;
    tasks: CreateTaskDto[];
    rubric?: Array<{
        criterion: string;
        points: number;
    }>;
    peerReviewSettings?: {
        enabled: boolean;
        reviewsPerStudent: number;
        dueDate: Date;
    };
}

export interface UpdateAssignmentDto {
    title?: string;
    description?: string;
    dueDate?: Date;
    totalPoints?: number;
    assignmentType?: string;
    tasks?: CreateTaskDto[];
    rubric?: Array<{
        criterion: string;
        points: number;
    }>;
    peerReviewSettings?: {
        enabled: boolean;
        reviewsPerStudent: number;
        dueDate: Date;
    };
}

export interface AssignmentResponseDto {
    id: string;
    courseId: string;
    moduleId: string;
    title: string;
    description: string;
    dueDate: Date;
    totalPoints: number;
    assignmentType: string;
    tasks: (CreateTaskDto & { id: string; status: ProgressTypeEnum })[];
    rubric?: Array<{
        criterion: string;
        points: number;
    }>;
    peerReviewSettings?: {
        enabled: boolean;
        reviewsPerStudent: number;
        dueDate: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    taskId: string[];
}