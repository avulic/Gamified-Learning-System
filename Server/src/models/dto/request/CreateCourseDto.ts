import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsDate, IsNumber, MinLength } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @MinLength(3)
    title!: string;

    @IsString()
    description!: string;

    @IsArray()
    instructors!: {id:string, name:string}[];

    @IsArray()
    modules!: {id:string, name:string}[];

    @IsDate()
    startDate!: Date;

    @IsDate()
    endDate!: Date;

    @IsBoolean()
    isPublished: boolean = false;

    @IsArray()
    @IsString({ each: true })
    categories: string[] = [];

    @IsNumber()
    xpReward!: number;

    @IsArray()
    @IsString({ each: true })
    materials: string[] = [];
}