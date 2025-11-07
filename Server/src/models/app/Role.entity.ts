import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Roles } from '../enums';
import { BaseEntity } from './Base.entity';

export class Role {
    id?: string;
    @IsEnum(Roles)
    name!: Roles;

    @IsOptional()
    @IsString()
    description?: string;
}