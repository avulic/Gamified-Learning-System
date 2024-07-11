// src/utils/ModelMapper.ts
import { IUser } from '../models/User';
import { IUserDb } from '../models/User';
import { IRole, Roles } from '../models/Role';
import { IRoleDb } from '../models/Role';

export const mapUserToAppModel = (userDB: IUserDb): IUser => ({
    id: userDB._id,
    name: userDB.name,
    lastName: userDB.lastName,
    email: userDB.email,
    username: userDB.username,
    password: userDB.password,
    roles: userDB.roles ? userDB.roles.map((role: IRoleDb) => role.name) : []
});

export const mapRoleToAppModel = (roleDB: IRoleDb): IRole => ({
    name: roleDB.name,
    description: roleDB.description,
});
