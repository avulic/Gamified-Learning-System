import { FileStatus } from "@/models/app/File.entity";
import { AutoMap } from "automapper-classes";
import { IsString, IsOptional, IsDate, IsArray, IsBoolean, IsNumber, IsMongoId, IsEnum } from "class-validator";

export class CreateFileDto {
    @AutoMap()
    @IsMongoId()
    id?: string;
    @AutoMap()
    @IsString()
    originalName!: string;
    @AutoMap()
    @IsNumber()
    size!: number;
    @AutoMap()
    @IsString()
    mimetype!: string;
    @AutoMap()
    @IsString()
    encoding!: string;
    @AutoMap()
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
    @AutoMap()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
    @AutoMap()
    @IsString()
    @IsOptional()
    uploadedBy!: string;
    @AutoMap()
    @IsDate()
    @IsOptional()
    uploadedAt!: Date;
    @AutoMap()
    parentType!: string;
}




export class UpdateFileDto {
    isPublic?: boolean;
    tags?: string[];
    metadata?: Record<string, unknown>;
}