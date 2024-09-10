// TaskProgressDTO.ts
export interface TaskProgressDTO {
    taskId: string;
    completed: boolean;
    earnedXP: number;
}

// AssignmentProgressDTO.ts
export interface AssignmentProgressDTO {
    assignmentId: string;
    submitted: boolean;
    submissionId?: string;
    earnedXP: number;
    progressPercentage: number;
    taskProgress: TaskProgressDTO[];
}

// LessonProgressDTO.ts
export interface LessonProgressDTO {
    lessonId: string;
    completed: boolean;
    earnedXP: number;
    progressPercentage: number;
    assignmentProgress: AssignmentProgressDTO[];
}

// ModuleProgressDTO.ts
export interface ModuleProgressDTO {
    moduleId: string;
    completed: boolean;
    earnedXP: number;
    progressPercentage: number;
    lessonProgress: LessonProgressDTO[];
}

export interface CourseProgressDTO {
    courseId: string;
    level: number;
    totalXP: number;
    overallProgress: number;
    moduleProgress: ModuleProgressDTO[]; // Array of Module Progress
}


// UserProgressDTO.ts
export interface UserProgressDTO {
    id: string;
    userId: string;
    totalXP: number;
    level: number;
    overallProgress: number;
    courseProgress: CourseProgressDTO[];
}