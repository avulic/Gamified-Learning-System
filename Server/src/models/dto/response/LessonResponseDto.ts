
export class LessonResponseDto {
    id!: string;
    title!: string;
    description!: string;
    dueDate!: Date;
    tasks!: string[];
    maxScore!: number;
    submissionType!: string;
    allowedFileTypes?: string[];
    maxFileSize?: number;
    xpReward!: number;
    order!: number;
}