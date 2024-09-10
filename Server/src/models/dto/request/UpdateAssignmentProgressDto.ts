import { IsEnum, IsBoolean, IsNumber, IsOptional, IsDate } from "class-validator";
import { ProgressTypeEnum } from "../../enums";

export class UpdateAssignmentProgressDto {
    @IsEnum(ProgressTypeEnum)
    status!: ProgressTypeEnum;

    @IsBoolean()
    completed!: boolean;

    @IsNumber()
    xpEarned!: number;

    @IsOptional()
    @IsNumber()
    score?: number;

    @IsOptional()
    @IsDate()
    submittedAt?: Date;

    @IsOptional()
    @IsDate()
    gradedAt?: Date;
}