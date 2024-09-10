import { IsBoolean, IsNumber } from "class-validator";

export class UpdateModuleProgressDto {
    @IsBoolean()
    completed!: boolean;

    @IsNumber()
    xpEarned!: number;
}