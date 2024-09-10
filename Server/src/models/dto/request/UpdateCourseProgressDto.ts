import { IsNumber, IsBoolean } from "class-validator";

export class UpdateCourseProgressDto {
    @IsNumber()
    overallProgress!: number;

    @IsNumber()
    totalXpEarned!: number;

    @IsBoolean()
    completed!: boolean;
}