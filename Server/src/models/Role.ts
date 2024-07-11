import { model, Schema, Document } from 'mongoose';

export enum Roles {
    User = 'user',
    Student = 'student',
    Guest = 'guest',
    Admin = 'admin',
    Profesor = 'profesor'
}

export interface IRole {
    name: Roles;
    description?: string;
}

export interface IRoleDb extends IRole, Document {}

const roleSchema: Schema = new Schema({
    name: {
        type: String,
        enum: Object.values(Roles),
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
});


const Role = model<IRoleDb>('Role', roleSchema, 'Role');

export default Role;