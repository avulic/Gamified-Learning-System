import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsDate, IsNumber, MinLength, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '../../enums';
import { IFileRequestDto } from './IFileRequestDto';

// Base Task DTO
export class UpdateBaseTaskDto {
    @IsString()
    @MinLength(3)
    title!: string;

    @IsString()
    description!: string;

    @IsEnum(TaskTypeEnum)
    taskType!: TaskTypeEnum;

    @IsEnum(ProgressTypeEnum)
    status!: ProgressTypeEnum;

    @IsOptional()
    @IsDate()
    dueDate?: Date;

    @IsNumber()
    xpReward!: number;

    @IsBoolean()
    requiredForCompletion!: boolean;
}

// Multi Choice Task DTO
export class UpdateMultiChoiceTaskDto extends UpdateBaseTaskDto {
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
export class UpdateFileUploadTaskDto extends UpdateBaseTaskDto {
    @IsArray()
    @IsString({ each: true })
    allowedFileTypes!: string[];

    @IsNumber()
    maxFileSize!: number;
    
    @IsArray()
    content!: IFileRequestDto[];
}

// Question Task DTO
export class UpdateQuestionTaskDto extends UpdateBaseTaskDto {
    @IsString()
    question!: string;

    @IsEnum(QuestionType)
    questionType!: string;

    @IsString()
    correctAnswer!: string;
}

// Union type for all task types
export type UpdateTaskDto = UpdateMultiChoiceTaskDto | UpdateFileUploadTaskDto | UpdateQuestionTaskDto;
