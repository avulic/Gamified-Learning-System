import { Type } from "class-transformer";
import { IsOptional, IsString, MinLength, IsDate, IsArray, ValidateNested, IsNumber } from "class-validator";
import { CreateBaseTaskDto, CreateFileUploadTaskDto, CreateMultiChoiceTaskDto, CreateQuestionTaskDto, CreateTaskDto } from "./CreateTaskDto";
import { TaskTypeEnum } from "../../enums";

export class UpdateAssignmentDtoOld {
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