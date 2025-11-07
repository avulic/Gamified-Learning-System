import { QuestionType } from "@/models/enums";
import { AutoMap } from "automapper-classes";
import { Type } from "class-transformer";
import { IsString, IsEnum, IsBoolean, ValidateNested } from "class-validator";

export class CreateBaseQuestionDto {
    @AutoMap()
    @IsString()
    question!: string;

    @AutoMap()
    @IsEnum(QuestionType)
    questionType!: QuestionType;
}

export class CreateMultiChoiceOptionDto {
    @AutoMap()
    @IsString()
    text!: string;

    @AutoMap()
    @IsBoolean()
    isCorrect!: boolean;
}

export class CreateMultiChoiceQuestionDto extends CreateBaseQuestionDto {
    @AutoMap(() => [CreateMultiChoiceOptionDto])
    @ValidateNested({ each: true })
    @Type(() => CreateMultiChoiceOptionDto)
    options!: CreateMultiChoiceOptionDto[];
}

export class CreateTrueFalseQuestionDto extends CreateBaseQuestionDto {
    @AutoMap()
    @IsBoolean()
    correctAnswer!: boolean;
}

export class CreateTextQuestionDto extends CreateBaseQuestionDto {
    @AutoMap()
    @IsString()
    correctAnswer!: string;
}

export type CreateQuestionDto = CreateMultiChoiceQuestionDto | CreateTrueFalseQuestionDto | CreateTextQuestionDto;
