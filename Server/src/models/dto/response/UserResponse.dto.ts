import { AutoMap } from "automapper-classes";
import { Roles } from "../../enums";

export class UserResponseDto {
    id!: string;
    name!: string;
    lastName!: string;
    email!: string;
    username!: string;
    roles!: { id?: string, name: string }[];
    profilePicture!: string; // URL to storage
    preferences!: {
        notifications: boolean;
        theme: string;
        language: string;
    };
    enrolledCourses!: Array<{
        courseId: string;
        courseName: string;
    }> | [];
}