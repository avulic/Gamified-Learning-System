import { ProgressTypeEnum } from "../../enums";

export class AssignmentProgressResponseDto {
    id!: string;
    userId!: string;
    assignmentId!: string;
    moduleId!: string;
    taskProgresses!: string[];
    status!: ProgressTypeEnum;
    completed!: boolean;
    xpEarned!: number;
    score?: number;
    submittedAt?: Date;
    gradedAt?: Date;
}