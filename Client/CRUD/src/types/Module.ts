import { Assignment } from "./Assignment";
import { Lesson } from "./Lesson";
import { Resource } from "./Resource";

export class Module {
    id?: string;
    title!: string;
    description!: string;
    order!: number;
    courseId!: string;
    lessons: Lesson[] = [];
    learningObjectives!: string[];
    estimatedDuration!: number;
    difficulty!: number;
    publishedAt!: Date;
    xpReward: number = 0;
    badgeReward!: string;
    prerequisites: Module[] = [];
    assignments: Assignment[] = [];
    fileIds: Resource[] = [];
}