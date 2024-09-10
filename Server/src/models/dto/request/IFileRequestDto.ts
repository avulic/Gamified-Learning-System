import { IsString, IsOptional, IsDate } from "class-validator";

export class IFileRequestDto  {
    @IsString()
    @IsOptional()
    id!: string;
    @IsString()
    @IsOptional()
    filename!: string;
    @IsString()
    @IsOptional()
    originalname!: string;
    @IsString()
    @IsOptional()
    mimetype!: string;
    @IsString()
    @IsOptional()
    size!: number;
    @IsString()
    @IsOptional()
    uploadedBy!: string;
    @IsDate()
    @IsOptional()
    uploadedAt!: Date;
}
