import { IAssignment } from "./Assignment";
import { IBaseEntity } from "./BaseEntity";
import { IFile } from "./File";
import { ILesson } from "./Lesson";

export interface IModule extends IBaseEntity {
    title: string;
    description: string;
    order: number;
    courseId: string;
    prerequisitesModulesId: string[];
    xpReward: number;
    badgeReward?: string;
    learningObjectives?: string[];
    estimatedDuration?: number;
    difficulty?: number;
    tags?: string[];
    publishedAt?: Date;
    
    filesId?: string[];
    lessonsId: number[];
    assignmentsId?: string[];


    lessons?: ILesson[];
    files?: IFile[];
    assignments?: IAssignment[];
}