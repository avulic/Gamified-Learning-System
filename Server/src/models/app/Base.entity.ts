import { AutoMap } from 'automapper-classes';
import { IsString } from 'class-validator';

export type ID = string;

export abstract class BaseEntity {
    @AutoMap()
    @IsString()
    id!: ID;
}