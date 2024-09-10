import { IsEnum, IsNumber, IsDate, IsBoolean, IsOptional, IsObject } from "class-validator";
import { ProgressTypeEnum } from "../../enums";

export class UpdateTaskProgressDto {
    @IsEnum(ProgressTypeEnum)
    status!: ProgressTypeEnum;

    @IsNumber()
    attempts!: number;

    @IsNumber()
    bestScore!: number;

    @IsNumber()
    totalTimeSpent!: number;

    @IsDate()
    lastAttemptDate!: Date;

    @IsNumber()
    xpEarned!: number;

    @IsBoolean()
    isCompleted!: boolean;

    @IsBoolean()
    isMandatory!: boolean;

    @IsOptional()
    @IsObject()
    completionData?: any;
}