
import { IBaseEntity } from "../BaseEntity";

export interface IUserProgress extends IBaseEntity {
    userId: string;
    totalXP: number;
    level: number;
    overallProgress: number; // Percentage
    courseProgress: ICourseProgress[];
}


// Task Progress Interface
export interface ITaskProgress {
    taskId: string;
    completed: boolean;
    earnedXP: number;
}

// Assignment Progress Interface
export interface IAssignmentProgress {
    assignmentId: string;
    submitted: boolean;
    submissionId?: string;
    earnedXP: number;
    progressPercentage: number;
    taskProgress: ITaskProgress[]; // Array of Task Progress
}

// Lesson Progress Interface
export interface ILessonProgress {
    lessonId: string;
    completed: boolean;
    earnedXP: number;
    progressPercentage: number;
    assignmentProgress: IAssignmentProgress[]; // Array of Assignment Progress
}

// Module Progress Interface
export interface IModuleProgress {
    moduleId: string;
    completed: boolean;
    earnedXP: number;
    progressPercentage: number;
    lessonProgress: ILessonProgress[]; // Array of Lesson Progress
}

// Course Progress Interface
export interface ICourseProgress {
    courseId: string;
    totalXP: number;
    level: number;
    overallProgress: number; // Percentage
    moduleProgress: IModuleProgress[]; // Array of Module Progress
}
