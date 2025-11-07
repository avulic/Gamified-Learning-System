import { TaskTypeEnum } from "@/models/enums";
import { AutoMap } from "automapper-classes";
import { Type } from "class-transformer";
import { IsString, MinLength, IsEnum, IsNumber, IsBoolean, IsDate, IsMongoId, IsArray, IsOptional, ValidateNested } from "class-validator";
import { CreateQuestionDto } from "./CreateQuestion.dto";

export class CreateBaseTaskDto {
    @AutoMap()
    @IsString()
    @MinLength(3)
    title!: string;

    @AutoMap()
    @IsString()
    description!: string;

    @AutoMap()
    @IsEnum(TaskTypeEnum)
    taskType!: TaskTypeEnum;

    @AutoMap()
    @IsNumber()
    points!: number;

    @AutoMap()
    @IsNumber()
    order!: number;

    @AutoMap()
    @IsNumber()
    xpReward!: number;

    @AutoMap()
    @IsBoolean()
    requiredForCompletion!: boolean;

    @AutoMap()
    @IsDate()
    dueDate!: Date;

    @AutoMap()
    @IsMongoId()
    assignmentId!: string;

    @AutoMap()
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    prerequisites?: string[];

    @AutoMap()
    @IsNumber()
    @IsOptional()
    maxAttempts?: number;
}

export class CreateFileUploadTaskDto extends CreateBaseTaskDto {
    @AutoMap()
    @ValidateNested()
    content!: {
        allowedFileTypes: string[];
        maxFileSize: number;
    };
}

export class CreateCodeTaskContent {
    @IsString()
    @IsOptional()
    question?: string;
    
    @IsString()
    language!: string;
    
    @IsString()
    @IsOptional()
    initialCode?: string;
    
    @IsArray()
    @ValidateNested({ each: true })
    testCases!: Array<{
        input: string;
        expectedOutput: string;
        isHidden?: boolean;
    }>;
}



export class CreateCodeTaskDto extends CreateBaseTaskDto {
    @AutoMap()
    @ValidateNested()
    content!: CreateCodeTaskContent;
}


export class CreateQuizTaskContent {
    @IsArray()
    @ValidateNested({ each: true })
    questions!: CreateQuestionDto[];

    @IsNumber()
    @IsOptional()
    timeLimit?: number;

    @IsNumber()
    @IsOptional()
    passingScore?: number;

    @IsNumber()
    @IsOptional()
    maxAttempts?: number;
}

export class CreateQuizTaskDto extends CreateBaseTaskDto {
    @AutoMap(()=>CreateQuizTaskContent)
    @ValidateNested()
    content!: CreateQuizTaskContent;
}


export class CreateQuestionTaskDto extends CreateBaseTaskDto {
    @AutoMap(()=>CreateQuizTaskContent)
    @ValidateNested()
    content!: CreateQuestionDto;
}

export type CreateTaskDto = 
    | CreateFileUploadTaskDto 
    | CreateQuestionTaskDto 
    | CreateCodeTaskDto 
    | CreateQuizTaskDto;