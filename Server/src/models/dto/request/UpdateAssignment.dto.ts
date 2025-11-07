import { Type } from "class-transformer";
import { IsOptional, IsString, MinLength, IsDate, IsArray, ValidateNested, IsNumber } from "class-validator";
import { CreateBaseTaskDto, CreateFileUploadTaskDto, CreateQuestionTaskDto, CreateTaskDto } from "./CreateTask.dto";
import { TaskTypeEnum } from "../../enums";

export class UpdateAssignmentOld {
    @IsOptional()
    @IsString()
    @MinLength(3)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDate()
    dueDate?: Date;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    tasks!: CreateTaskDto[];

    @IsOptional()
    @IsNumber()
    maxScore?: number;

    @IsOptional()
    @IsNumber()
    maxAttempts?: number;

    @IsOptional()
    @IsString()
    submissionType?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedFileTypes?: string[];

    @IsOptional()
    @IsNumber()
    maxFileSize?: number;

    @IsOptional()
    @IsNumber()
    xpReward?: number;

    @IsOptional()
    @IsNumber()
    order?: number;
}