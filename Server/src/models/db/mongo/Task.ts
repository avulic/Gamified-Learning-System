// models/db/mongo/Assignment.ts
import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '@/models/enums';
import { IFileDb } from './File';


export interface IBaseTaskDb{
    _id?: ObjectId;
    taskIndex: number;
    title: string;
    description: string;
    taskType: TaskTypeEnum;
    status: ProgressTypeEnum;
    points: number;
    order: number;
}

export interface IMultiChoiceTaskDb extends IBaseTaskDb {
    content: {
        question: string;
        options: Array<{
            text: string;
            isCorrect: boolean;
        }>;
    };
}

export interface IFileUploadTaskDb extends IBaseTaskDb {
    content: {
        allowedFileTypes: string[];
        maxFileSize: number;
        //files: IFileDb[];
    };
}

export interface IQuestionTaskDb extends IBaseTaskDb {
    content: {
        questionType: QuestionType;
        question: string;
        correctAnswer: string;
    };
}

export type ITaskDb = IMultiChoiceTaskDb | IFileUploadTaskDb | IQuestionTaskDb;






export const BaseTaskSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    taskType: { type: String, enum: Object.values(TaskTypeEnum), required: true },
    status: { type: String, enum: Object.values(ProgressTypeEnum), required: true },
    points: { type: Number, required: true },
    order: { type: Number, required: true },
    taskIndex: { type: Number, required: true }
}, { discriminatorKey: 'taskType' });

export const MultiChoiceTaskSchema = new Schema({
    content: {
        question: { type: String, required: true },
        options: [{
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true }
        }]
    }
});

export const FileUploadTaskSchema = new Schema({
    content: {
        allowedFileTypes: [String],
        maxFileSize: Number
    }
});

export const QuestionTaskSchema = new Schema({
    content: {
        questionType: { type: String, enum: Object.values(QuestionType), required: true },
        question: { type: String, required: true },
        correctAnswer: { type: String, required: true }
    }
});



