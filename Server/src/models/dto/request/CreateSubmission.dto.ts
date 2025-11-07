import { SubmissionStatus, GradingStatus, SubmissionTypeEnum } from "@/models/enums";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsDate, IsString, IsMongoId, IsOptional, IsArray, ValidateNested, IsBoolean } from "class-validator";
import { CreateBaseAnswerDto, CreateAnswerDto } from "./CreateAnswer.dto";



export class QuizContentDto {
    answers!: CreateAnswerDto[];
}

export class QuestionContentDto {
    answer!: CreateAnswerDto;
}

export class FileUploadContentDto {
    @IsArray()
    @IsString({ each: true })
    fileUrls!: string[];
}

export class CodeContentDto {
    @IsString()
    code!: string;
}


export class TaskSubmissionDto {
    @IsMongoId()
    taskId!: string;
    
    @IsEnum(SubmissionTypeEnum)
    taskType!: SubmissionTypeEnum;
    
    @IsNumber()
    @IsOptional()
    timeSpent?: number;
    
    @ValidateNested()
    @IsOptional()
    content?: QuizContentDto | QuestionContentDto | FileUploadContentDto | CodeContentDto;
}


export class AssignmentSubmissionDto {
    @IsMongoId()
    assignmentId!: string;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TaskSubmissionDto)
    tasks!: TaskSubmissionDto[];
}





export class TaskSubmissionStatusDto {
    @IsMongoId()
    taskId!: string;
    
    @IsEnum(SubmissionStatus)
    status!: string;
    
    @IsNumber()
    attemptNumber!: number;
    
    @IsNumber()
    @IsOptional()
    score?: number;
    
    @IsString()
    @IsOptional()
    feedback?: string;
}
export class AssignmentSubmissionResponseDto {
    @IsBoolean()
    success!: boolean;
    
    @IsString()
    message!: string;
    
    @IsNumber()
    percentComplete!: number;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TaskSubmissionStatusDto)
    tasks!: TaskSubmissionStatusDto[];
}
