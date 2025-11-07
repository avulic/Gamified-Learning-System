import { AutoMap } from "automapper-classes";
import { Roles } from "../../enums";

export class UserResponseDto {
    @AutoMap()
    id!: string;
    @AutoMap()
    name!: string;
    @AutoMap()
    lastName!: string;
    @AutoMap()
    email!: string;
    @AutoMap()
    username!: string;
    @AutoMap(() => [String])
    roles!: string[];
    @AutoMap()
    profilePicture!: string; // URL to storage
    @AutoMap()
    preferences!: {
        notifications: boolean;
        theme: string;
        language: string;
    };
    @AutoMap()
    enrolledCourses!: Array<{
        courseId: string;
        enrollmentDate: Date;
        lastAccessed: Date;
    }> | [];
}