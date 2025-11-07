import { Module } from "./Module.entity";
import { User } from "./User.entity";
import { Assignment } from "./Assignment.entity";
import { File } from "./File.entity";


export class Course {
    id?: string;
    title!: string;
    description!: string;
    modules!: Module[] | [];
    instructors!: User[] | [];
    prerequisites!: string[] | [];
    categories!: string[];
    enrollmentCode!: string;
    isPublished!: boolean;
    version!: number;
    lastUpdated!: Date;
    enrolledStudentCount!: number;
    xpReward!: number;
    materials!: File[] | [];
    assignments!: Assignment[] | [];

}