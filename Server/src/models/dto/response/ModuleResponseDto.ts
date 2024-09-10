import { AssignmentResponseDto } from "./AssignmentResponseDto";
import { IFileResponseDto } from "./IFileResponseDto";
import { LessonResponseDto } from "./LessonResponseDto";

export interface ModuleResponseDto {
    id: string;
    title: string;
    description: string;
    order: number;
    courseId: string;
    lessonsId: number[];
    prerequisitesModulesId: string[];
    xpReward: number;
    badgeReward?: string;
    learningObjectives?: string[];
    estimatedDuration?: number;
    difficulty?: number;
    tags?: string[];
    publishedAt?: Date;
    filesId: string[];
}

export interface  ModuleDetailsResponseDto extends ModuleResponseDto{
    files?: Partial<IFileResponseDto>[];
    assignments?: Partial<AssignmentResponseDto>[];
    lessons?: Partial<LessonResponseDto>[];
}