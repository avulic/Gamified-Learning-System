import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsDate } from 'class-validator';
import { Assignment } from "./Assignment.entity";
import { ID, BaseEntity } from "./Base.entity";
import { Lesson } from "./Lesson.entity";
import {AutoMap} from 'automapper-classes';
import { File } from "./File.entity";

export class Module {
        @AutoMap()
        id?: string;

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
        courseId!: string;

        @AutoMap(() => [Lesson])
        lessons: Lesson[] = [];
    
        @AutoMap(() => [String])
        @IsArray()
        learningObjectives!: string[];
    
        @AutoMap()
        @IsNumber()
        estimatedDuration!: number;
    
        @AutoMap()
        @IsNumber()
        difficulty!: number;
    
        @AutoMap()
        @IsDate()
        publishedAt!: Date;

        @AutoMap()
        @IsNumber()
        xpReward: number = 0;

        @AutoMap()
        @IsNumber()
        badgeReward!: string;
    
        @AutoMap(() => [Module])
        prerequisites: Module[] = [];
    
        @AutoMap(() => [Assignment])
        assignments: Assignment[] = [];
    
        @AutoMap(() => [File])
        files: File[] = [];
}