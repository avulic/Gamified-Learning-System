import { TaskResponseDto } from "./TaskResponseDto";


export interface AssignmentResponseDto {
    id: string;
    courseId: string;
    moduleId: string;
    title: string;
    description: string;
    dueDate: Date;
    totalPoints: number;
    assignmentType: string;
    tasks: TaskResponseDto[];
    rubric: {
        criteria: Array<{
            criterion: string;
            points: number;
        }>;
    };
    peerReviewSettings: {
        enabled: boolean;
        reviewsPerStudent: number;
        dueDate: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}