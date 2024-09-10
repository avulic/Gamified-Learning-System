import { IsOptional, IsString, MinLength, IsArray, IsDate, IsBoolean, IsNumber } from "class-validator";

export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    title!: string;

    @IsOptional()
    @IsString()
    description!: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    instructorsId!: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    modulesId!: string[];

    @IsOptional()
    @IsDate()
    startDate!: Date;

    @IsOptional()
    @IsDate()
    endDate!: Date;

    @IsOptional()
    @IsBoolean()
    isPublished: boolean = false;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categories: string[] = [];

    @IsOptional()
    @IsNumber()
    xpReward!: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    materials: string[] = [];
}