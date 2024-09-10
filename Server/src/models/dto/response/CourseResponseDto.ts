export class CourseResponseDto {
    id!: string;
    title!: string;
    description!: string;
    instructors!: Array<{
        id: string;
        name: string;
    }>;
    modules!: Array<{
        id: string;
        title: string;
        order: number;
    }>;
    isPublished!: boolean;
    categories!: string[];
    xpReward!: number;
    materials!: string[];
}