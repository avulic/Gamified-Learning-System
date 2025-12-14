import { Module } from "./Module.entity";
import { User } from "./User.entity";
import { Assignment } from "./Assignment.entity";
import { File } from "./File.entity";


export class Course {
    id: string | undefined = undefined;
    title: string = "";
    description: string = "";
    modules: Module[] = [];
    instructors: User[] = [];
    prerequisites: string[] = [];
    categories: string[] = [];
    enrollmentCode: string = "";
    isPublished: boolean = false;
    version: number = 0;
    lastUpdated: Date = new Date();
    enrolledStudentCount: number = 0;
    xpReward: number = 0;
    materials: File[] = [];
    assignments: Assignment[] = [];
}