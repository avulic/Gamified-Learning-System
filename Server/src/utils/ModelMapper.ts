// src/utils/ModelMapper.ts
import { IUser } from '../models/User';
import { IUserDb } from '../models/User';
import { IRole, Roles } from '../models/Role';
import { IRoleDb } from '../models/Role';
import { ICourse, ICourseDb } from '../models/Course';
import { IModule, IModuleDb } from '../models/Module';
import { ICategory } from '../models/Category';
import { Types } from 'mongoose';

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


export const mappedCourseToAppModel = (courseDB: ICourseDb): ICourse => ({
    id:courseDB._id.toString(),
    title: courseDB.title,
    description: courseDB.description,
    instructors: courseDB.instructors.map(user => user.id.toString()),
    enrolledStudents: courseDB.enrolledStudents.map((student: Types.ObjectId) => student._id.toString()),
    modules: courseDB.modules?.map((module: Types.ObjectId) => module._id.toString()),
    startDate: courseDB.startDate,
    endDate: courseDB.endDate,
    isPublished: courseDB.isPublished,
    categories: courseDB.categories?.map((category: Types.ObjectId) => category._id.toString())
});

export const mappedModuleToAppModel = (moduleDB: IModuleDb): IModule => ({
    id: moduleDB._id.toString(),
    title: moduleDB.title,
    description: moduleDB.description,
    order: moduleDB.order,
    contentItems: moduleDB.contentItems.map(contentItem => contentItem.toString()),
});