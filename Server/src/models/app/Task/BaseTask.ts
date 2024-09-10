import { TaskTypeEnum, ProgressTypeEnum } from "../../enums";
import { IBaseEntity } from "../BaseEntity";
import { IFileUploadTask } from "./FileUploadTask";
import { IMultiChoiceTask } from "./MultiChoiceTask";
import { IQuestionTask } from "./QuestionTask";

export interface IBaseTask extends IBaseEntity {
    assignmentId: string;
    title: string;
    description: string;
    taskType: TaskTypeEnum;
    status: ProgressTypeEnum;
    dueDate?: Date;
    xpReward: number;
    points: number;
    order: number;
    requiredForCompletion: boolean;
}

export type ITask = IMultiChoiceTask | IFileUploadTask | IQuestionTask;