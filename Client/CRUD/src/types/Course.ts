import { Resource } from "./Resource";
import { Assignment } from "./Assignment";
import { Module } from "./Module";
export class Course {
    id!: string;
    title!: string;
    description!: string;
    modules!: Module[] | [];
    instructors!: Array<{ id: string, name: string }>;
    prerequisites!: Course[] | [];   
    categories!: string[];
    enrollmentCode!: string;
    isPublished!: boolean;
    version!: number;
    lastUpdated!: Date;
    enrolledStudentCount!: number;
    xpReward!: number;
    materials!: Resource[] | [];
    assignments!: Assignment[] | [];
}