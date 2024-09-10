import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsEmail, IsEnum, MinLength } from 'class-validator';
import { Roles } from '../../enums';
import { IRole } from '@/models/app';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    name!: string;

    @IsString()
    @MinLength(2)
    lastName!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(4)
    username!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsArray()
    roles!: string[];

    profilePicture!: any;

    preferences!:any;
}