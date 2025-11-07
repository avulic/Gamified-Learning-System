import { Type } from 'class-transformer';
import { IsString, IsNumber, IsArray, IsDate, ValidateNested, IsMongoId, IsOptional, Min, Max } from 'class-validator';
import { CreateFileDto } from './CreateFile.dto';
import { CreateAssignmentDto } from './CreateAssignment.dto';
import { AutoMap } from 'automapper-classes';

export class CreateLessonDto {
    @AutoMap()
    @IsMongoId()
    id!: string;
    @AutoMap()
    @IsString()
    title!: string;
    @AutoMap()
    @IsString()
    content!: string;
    @AutoMap()
    @IsNumber()
    order!: number;
    @AutoMap(() => [CreateAssignmentDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAssignmentDto)
    assignments?: CreateAssignmentDto[];
    @AutoMap(() => [CreateFileDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFileDto)
    files?: CreateFileDto[];
}


export class CreateModuleDto {
    @AutoMap()
    @IsMongoId()
    id!: string;
    @AutoMap()
    @IsMongoId()
    courseId!: string;
    @AutoMap()
    @IsString()
    title!: string;
    @AutoMap()
    @IsString()
    description!: string;
    @AutoMap()
    @IsNumber()
    order!: number;
    @AutoMap()
    @IsNumber()
    xpReward!: number;
    @AutoMap()
    @IsString()
    badgeReward!: number;
    @AutoMap(() => [String])
    @IsArray()
    @IsString({ each: true })
    learningObjectives!: string[];
    @AutoMap()
    @IsNumber()
    estimatedDuration!: number;
    @AutoMap()
    @IsNumber()
    @Min(1)
    @Max(10)
    difficulty!: number;
    @AutoMap()
    @IsArray()
    @IsString({ each: true })
    tags!: string[];
    @AutoMap()
    @IsDate()
    @Type(() => Date)
    publishedAt!: Date;
    @AutoMap()
    @IsArray()
    @IsMongoId({ each: true })
    prerequisitesModulesId!: string[];
    @AutoMap(() => [CreateLessonDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateLessonDto)
    lessons!: CreateLessonDto[];
    @AutoMap(() => [CreateAssignmentDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAssignmentDto)
    assignments?: CreateAssignmentDto[];
    @AutoMap(() => [CreateFileDto])
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFileDto)
    files?: CreateFileDto[];
}