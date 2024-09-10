import { IBaseEntity } from "./BaseEntity";
import { Roles } from '../enums';
import { ICourse } from './Course';

export interface IUser {
    id?: string;
    name: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    roles: string[];
    profilePicture?: string;
    enrolledCoursesIds?: string[];
    preferences: Preferences;

    enrolledCourses?: EnrolledCourse[];
}

export interface Preferences {
    notifications: boolean;
    theme: string;
    language: string;
}

export interface EnrolledCourse {
    courseId: string;
    courseName: string;
    enrollmentDate: Date;
    lastAccessed: Date;
}