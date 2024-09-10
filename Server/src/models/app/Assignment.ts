import { IBaseEntity } from "./BaseEntity";
import { IModule } from "./Module";
import { ITask } from "./Task/BaseTask";


export interface IAssignment extends IBaseEntity {
    moduleId: string;
    courseId:string;
    title: string;
    description: string;
    dueDate: Date;
    allowedFileTypes?: string[];
    maxFileSize?: number;
    totalPoints:number;
    assignmentType: string;
    rubric: any;
    peerReviewSettings: any;
    createdAt: Date;
    updatedAt: Date;

    tasks?: (ITask | Partial<ITask>)[];
}
