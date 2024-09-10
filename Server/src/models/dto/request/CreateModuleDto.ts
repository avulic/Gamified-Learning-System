import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsNumber, MinLength, IsDate } from 'class-validator';

export class CreateModuleDto {
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
    lessonsId?: number[];

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
    difficulty?: number;

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