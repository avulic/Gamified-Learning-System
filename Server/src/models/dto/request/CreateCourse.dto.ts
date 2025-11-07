import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsDate, IsNumber, MinLength, ArrayMinSize, ValidateNested, IsMongoId } from 'class-validator';
import { CreateModuleDto } from './CreateModule.dto';
import { CreateFileDto } from './CreateFile.dto';
import { CreateAssignmentDto } from './CreateAssignment.dto';
import { AutoMap } from 'automapper-classes';

export class InstructorDto {
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    id!: string;

    @AutoMap()
    @IsString()
    @IsNotEmpty()
    name!: string;
}


export class CreateCourseDetailsDto {
    @AutoMap()
    @IsString()
    @MinLength(3)
    title!: string;

    @AutoMap()
    @IsString()
    @MinLength(10)
    description!: string;

    @AutoMap(() => [InstructorDto])
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InstructorDto)
    instructors!: InstructorDto[];

    @AutoMap(() => [CreateModuleDto])
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateModuleDto)
    modules!: CreateModuleDto[];

    @AutoMap()
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @AutoMap(() => [String])
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categories!: string[];

    @AutoMap()
    @IsOptional()
    @IsNumber()
    xpReward!: number;

    @AutoMap(() => [CreateFileDto])
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFileDto)
    materials!: CreateFileDto[];

    @AutoMap()
    @IsOptional()
    @IsString()
    enrollmentCode!: string;

    @AutoMap(() => [String])
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsMongoId()
    prerequisitesCourseIds?: string[] | [];

    @AutoMap(() => [CreateAssignmentDto])
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateAssignmentDto)
    assignments!: CreateAssignmentDto[];
}


export class CreateCourseDto {
    title!: string;
    description!: string;
    modules!: [{
        id: string;
        title: string;
        order: number;
    }]

    instructors!: [{
        id: string;
        name: string;
    }]   
    isPublished?: boolean;
    categories!: string[];
    xpReward!: number;
    materials!: [string];
    enrollmentCode!: string;
    prerequisitesCourseIds?: string[] | [];
    assignments!: [string];
}
