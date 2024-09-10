import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    oldPassword!: string;

    @IsString()
    @MinLength(8)
    newPassword!: string;
}