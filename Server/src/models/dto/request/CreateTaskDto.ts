import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsDate, IsNumber, MinLength, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '../../enums';
import { IFileRequestDto } from './IFileRequestDto';

// Base Task DTO
export class CreateBaseTaskDto {
    @IsString()
    assignmentId!: string;

    @IsString()
    @MinLength(3)
    title!: string;

    @IsString()
    description!: string;

    @IsEnum(TaskTypeEnum)
    taskType!: TaskTypeEnum;

    @IsOptional()
    @IsDate()
    dueDate?: Date;

    @IsNumber()
    xpReward!: number;

    @IsBoolean()
    requiredForCompletion!: boolean;

    @IsNumber()
    points!: number;    
    
    @IsNumber()
    order!: number;
}

// Multi Choice Task DTO
export class CreateMultiChoiceTaskDto extends CreateBaseTaskDto {
    @IsString()
    question!: string;

    @IsArray()
    @IsString({ each: true })
    options!: Array<{
        text: string;
        isCorrect: boolean;
    }>
}

// File Upload Task DTO
export class CreateFileUploadTaskDto extends CreateBaseTaskDto {
    @IsArray()
    @IsString({ each: true })
    allowedFileTypes!: string[];

    @IsNumber()
    maxFileSize!: number;
    
    @IsArray()
    content!: IFileRequestDto[];
}

// Question Task DTO
export class CreateQuestionTaskDto extends CreateBaseTaskDto {
    @IsString()
    question!: string;

    @IsEnum(QuestionType)
    questionType!: string;

    @IsString()
    correctAnswer!: string;
}

// Union type for all task types
export type CreateTaskDto = CreateMultiChoiceTaskDto | CreateFileUploadTaskDto | CreateQuestionTaskDto;
