export class UserProgressResponseDto {
    id!: string;
    userId!: string;
    courseProgresses!: string[];
    totalXpEarned!: number;
    level!: number;
    lastUpdated!: Date;
}