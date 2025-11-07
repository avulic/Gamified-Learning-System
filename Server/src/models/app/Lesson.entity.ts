import { Type } from 'class-transformer';
import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Assignment } from './Assignment.entity';
import { BaseEntity } from './Base.entity';
import { File } from './File.entity';
import {AutoMap} from 'automapper-classes';

export class Lesson {
    @AutoMap()
    id?: string;
    
    @AutoMap()
    @IsString()
    title!: string;

    @AutoMap()
    @IsString()
    content!: string;

    @AutoMap()
    @IsNumber()
    order!: number;

    @AutoMap(() => [Assignment])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Assignment)
    assignments: Assignment[] = [];

    @AutoMap(() => [File])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => File)
    files: File[] = [];

}