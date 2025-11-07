import { BaseEntity } from "../Base.entity";


export class IUserProgress extends BaseEntity {
    userId!: string;
    totalXP!: number;
    level!: number;
    overallProgress!: number; // Percentage

}

