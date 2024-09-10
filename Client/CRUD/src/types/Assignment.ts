import { BaseContent } from "./BaseContent";
import Task from "./task/Task";

export enum SubmissionTypeEnum {
    FILE = "file",
    TEXT = 'text',
    LINK = 'link'
}

export interface Assignment extends BaseContent  {
    moduleId: string;    
    dueDate: Date;
    tasks: Task[];
    maxScore: number;
    submissionType: SubmissionTypeEnum;
    allowedFileTypes?: string[];
    maxFileSize?: number;
}

export default Assignment;