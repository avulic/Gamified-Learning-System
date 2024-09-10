import { IsOptional, IsString, MinLength, IsNumber, IsArray, IsDate } from "class-validator";

export class UpdateModuleDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    order?: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    lessonsId?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    prerequisites?: string[];

    @IsOptional()
    @IsArray()
    prerequisitesModulesId?: any[];

    @IsOptional()
    @IsNumber()
    xpReward?: number;

    @IsOptional()
    @IsString()
    badgeReward?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    learningObjectives?: string[];

    @IsOptional()
    @IsNumber()
    estimatedDuration?: number;

    @IsOptional()
    @IsString()
    difficulty?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    filesId?: string[];

    @IsArray()
    @IsString({ each: true })
    assignmentsId!: string[];

    @IsOptional()
    @IsString()
    courseId?: string;
    
    @IsOptional()
    @IsDate()
    publishedAt?: Date;
}