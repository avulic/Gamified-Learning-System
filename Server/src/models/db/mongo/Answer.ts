import { TaskTypeEnum, ProgressTypeEnum } from "@/models/enums";
import mongoose, { Schema, Types } from "mongoose";


export interface IBaseAnswerDb {
	taskIndex: number;
	answerType: TaskTypeEnum;
	status: ProgressTypeEnum;
	score?: number;
	feedback?: string;
	answerIndex: number;
}


export const answerSchema: Schema = new Schema({
	taskIndex: { type: Number, required: true },
	answerIndex: { type: Number, required: true },
	answerType: { type: String, enum: Object.values(TaskTypeEnum), required: true },
	status: { type: String, enum: Object.values(ProgressTypeEnum), required: true },
	score: { type: Number },
	feedback: { type: String }
}, { discriminatorKey: 'answerType', timestamps: true });

export const BaseAnswer = mongoose.model<IBaseAnswerDb>('BaseAnswer', answerSchema);



export interface IMultiChoiceAnswerDb extends IBaseAnswerDb {
    selectedOptions: string[];
}

export const MultiChoiceAnswer = BaseAnswer.discriminator<IMultiChoiceAnswerDb>('MultiChoiceAnswer', new Schema({
    selectedOptions: [{ type: String, required: true }]
}));



export interface IQuestionAnswerDb extends IBaseAnswerDb {
    response: string;
}

export const QuestionAnswer = BaseAnswer.discriminator<IQuestionAnswerDb>('QuestionAnswer', new Schema({
    response: { type: String, required: true }
}));



export interface IFileUploadAnswerDb extends IBaseAnswerDb {
    filesId: Types.ObjectId[];
}

export const FileUploadAnswer = BaseAnswer.discriminator<IFileUploadAnswerDb>('FileUploadAnswer', new Schema({
    filesId: [{ type: Schema.Types.ObjectId, required: true }]
}));

export type IAnswerDb = IMultiChoiceAnswerDb | IQuestionAnswerDb | IFileUploadAnswerDb;