export class CourseProgressResponseDto {
    id!: string;
    userId!: string;
    courseId!: string;
    moduleProgresses!: string[];
    overallProgress!: number;
    totalXpEarned!: number;
    completed!: boolean;
    lastAccessedAt!: Date;
}