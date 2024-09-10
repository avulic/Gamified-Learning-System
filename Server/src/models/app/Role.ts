import { model, Schema, Document } from 'mongoose';
import { Roles } from '../enums';
import { IBaseEntity } from './BaseEntity';


export interface IRole extends IBaseEntity{
    name: Roles;
    description?: string;
}

