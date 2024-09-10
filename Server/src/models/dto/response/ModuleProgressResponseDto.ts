export class ModuleProgressResponseDto {
    id!: string;
    userId!: string;
    moduleId!: string;
    courseId!: string;
    lessonProgresses!: string[];
    assignmentProgresses!: string[];
    completed!: boolean;
    xpEarned!: number;
}