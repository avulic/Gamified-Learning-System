import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsEmail, IsEnum, MinLength } from 'class-validator';
import { Roles } from '../../enums';
import { Role } from '@/models/app';
import { AutoMap } from 'automapper-classes';

export class PreferencesDto {
    @AutoMap()
    notifications!: boolean;
    @AutoMap()
    theme!: string;
    @AutoMap()
    language!: string;
}

export class EnrolledCourseDto {
    @AutoMap()
    courseId!: string;
    @AutoMap()
    courseName!: string;
}

export class CreateUserDto {
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
    @AutoMap(() => [String])
    roles!: string[];
    @AutoMap()
    profilePicture?: string;
    @AutoMap(() => PreferencesDto)
    preferences?: PreferencesDto;
    @AutoMap(() => [EnrolledCourseDto])
    enrolledCourses?: EnrolledCourseDto[];
}