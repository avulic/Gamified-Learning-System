import { QuestionType } from "@/models/enums";
import { AutoMap } from "automapper-classes";
import { IsMongoId, IsEnum, IsNumber, IsOptional, IsDate, IsString, IsArray, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateBaseAnswerDto {
    @AutoMap()
    @IsMongoId()
    taskId!: string;

    @AutoMap()
    @IsMongoId()
    questionId!: string;

    @AutoMap()
    @IsEnum(QuestionType)
    questionType!: QuestionType;

    @AutoMap()
    @IsDate()
    @Type(() => Date)
    submittedAt!: Date;

    @AutoMap()
    @IsBoolean()
    @IsOptional()
    isCorrect?: boolean;

    @AutoMap()
    @IsNumber()
    @IsOptional()
    score?: number;
}

export class CreateMultiChoiceAnswerDto extends CreateBaseAnswerDto {
    @AutoMap()
    @IsEnum(QuestionType)
    questionType!: QuestionType.MULTI_CHOICE;

    @AutoMap()
    @IsArray()
    @IsString({ each: true })
    selectedOptionIds!: string[];
}

export class CreateTrueFalseAnswerDto extends CreateBaseAnswerDto {
    @AutoMap()
    @IsEnum(QuestionType)
    questionType!: QuestionType.TRUE_FALSE;

    @AutoMap()
    @IsBoolean()
    answer!: boolean;
}

export class CreateTextAnswerDto extends CreateBaseAnswerDto {
    @AutoMap()
    @IsEnum(QuestionType)
    questionType!: QuestionType.TEXT;

    @AutoMap()
    @IsString()
    answer!: string;

    @AutoMap()
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    matchedKeywords?: string[];
}

export type CreateAnswerDto = 
    | CreateMultiChoiceAnswerDto
    | CreateTrueFalseAnswerDto
    | CreateTextAnswerDto;