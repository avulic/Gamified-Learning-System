import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsOptional, IsDate } from 'class-validator';
import { BaseEntity } from './Base.entity';
import { AutoMap } from 'automapper-classes';

export class Preferences {
    notifications: boolean = true;
    theme: string = 'light';
    language: string = 'en';
}

export class EnrolledCourse {
    courseId: string = '';
    courseName: string = '';
}

export class User extends BaseEntity {
    id: string = '';
    name: string = '';
    lastName: string = '';
    email: string = '';
    username: string = '';
    password: string = '';
    roles: string[] = [];
    profilePicture?: string = undefined;
    preferences?: Preferences = undefined;
    enrolledCourses?: EnrolledCourse[] = undefined;
}


export class UserToken extends BaseEntity {
    id!: string;
    username!: string;
    roles!: string[];
    attrs?: Record<string, any>;
}