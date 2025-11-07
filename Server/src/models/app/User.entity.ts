import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsOptional, IsDate } from 'class-validator';
import { BaseEntity } from './Base.entity';
import { AutoMap } from 'automapper-classes';

export class Preferences {
    @AutoMap()
    notifications?: boolean;
    @AutoMap()
    theme?: string;
    @AutoMap()
    language?: string;
}

export class EnrolledCourse {
    @AutoMap()
    courseId!: string;
    @AutoMap()
    courseName!: string;
}

export class User extends BaseEntity {
    @AutoMap()
    name!: string;

    @AutoMap()
    lastName!: string;
    @AutoMap()
    email!: string;
    @AutoMap()
    username!: string;
    @AutoMap()
    password!: string;
    @AutoMap(()=> [String])
    roles!: {id?: string, name: string}[];
    @AutoMap()
    profilePicture?: string;
    @AutoMap(()=> [Preferences])
    preferences?: Preferences;
    @AutoMap(()=> [EnrolledCourse])
    enrolledCourses?: EnrolledCourse[];
}