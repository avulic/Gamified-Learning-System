import { ProgressTypeEnum, TaskTypeEnum } from "../enums";
import { IBaseEntity } from "./BaseEntity";
import { IFile } from "./File";
import { ISubmission } from "./Submission";
import { IBaseTask } from "./Task/BaseTask";


export interface IBaseAnswer extends IBaseEntity {
    taskIndex: number;
	answerType: TaskTypeEnum;
	status: ProgressTypeEnum;
	score?: number;
	feedback?: string;
    answerIndex: number;
}


export interface IMultiChoiceAnswer extends IBaseAnswer {
    selectedOptions: string[];
}

export interface IQuestionAnswer extends IBaseAnswer {
    response: string;
}

export interface IFileUploadAnswer extends IBaseAnswer {
    files?: IFile[];
    filesId: string[];
}

export type IAnswer = IMultiChoiceAnswer | IQuestionAnswer | IFileUploadAnswer;

