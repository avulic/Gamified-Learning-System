import { IsOptional, IsString, MinLength, IsEmail, IsArray, IsEnum } from "class-validator";
import { Roles } from "../../enums";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    id!: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(4)
    username?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(Roles, { each: true })
    roles?: Roles[];

    
    profilePicture!: any;

    preferences!:any;
}