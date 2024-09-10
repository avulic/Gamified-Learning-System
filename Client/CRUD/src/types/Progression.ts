import { TaskTypeEnum } from "./task/Task";

export enum ProgressTypeEnum {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    OVERDUE = "overdue"
}

// Progress tracking for module content
export interface Progress {
    userId: string;
    contentId: string;
    moduleId: string;
    courseId: string;
    status: ProgressTypeEnum;
    score?: number;
    completedAt?: Date;
    lastAccessedAt: Date;
}


export interface UserProgress {
    userId: string;
    courseProgresses: CourseProgress[];
    totalXpEarned: number;
    level: number;
}

export interface CourseProgress {
    courseId: string;
    moduleProgresses: ModuleProgress[];
    overallProgress: number; // 0-100
    completed: boolean;
}

export interface ModuleProgress {
    moduleId: string;
    lessonProgress: LessonProgress[];
    assignmentProgress: AssignmentProgress[];
    completed: boolean;
    xpEarned: number;
}

export interface LessonProgress {
    lessonId: string;
    completed: boolean;
    xpEarned: number;
}

export interface AssignmentProgress {
    assignmentId: string;
    taskProgress: TaskProgress[];
    completed: boolean;
    xpEarned: number;
}


export enum TaskStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    OVERDUE = 'overdue'
}

export interface TaskProgress {
    taskId: string;
    status: TaskStatus;
    //submissionId?: string;
    xpEarned: number;

    userId: string;
    attempts: number;
    bestScore?: number;
    lastSubmissionDate?: Date;
    timeSpent: number; // in seconds
}



// Additional game-related interfaces
export interface GameStats {
    questsCompleted: number;
    itemsCollected: number;
    playtime: number; // in minutes
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    dateUnlocked: Date;
}

export interface Notification {
    id: string;
    type: 'course' | 'achievement' | 'friend' | 'system';
    message: string;
    read: boolean;
    createdAt: Date;
}