import { IsString, IsNumber, IsDate, IsEnum, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { BaseEntity } from "./Base.entity";
import {AutoMap} from 'automapper-classes';

export enum FileStatus {
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export class File {
    @AutoMap()
    id?: string;

    @AutoMap()
    @IsString()
    filename!: string;

    @AutoMap()
    @IsString()
    originalName!: string;

    @AutoMap()
    @IsString()
    mimetype!: string;

    @AutoMap()
    @IsNumber()
    size!: number;

    @AutoMap()
    @IsDate()
    uploadedAt!: Date;

    @AutoMap()
    @IsString()
    uploadedBy!: string;

    @AutoMap(()=> String)
    @IsEnum(FileStatus)
    status!: FileStatus;

    @AutoMap()
    @IsBoolean()
    isPublic: boolean = false;

    @AutoMap(() => [String])
    @IsArray()
    tags?: string[] = [];

    @AutoMap()
    @IsString()
    url?: string;
    
    @AutoMap()
    parentId?: string;   

    parentType!: string;

    lastModified: Date = new Date();
    version: number = 1;
}