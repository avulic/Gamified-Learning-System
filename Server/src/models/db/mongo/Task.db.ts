// models/db/mongo/Assignment.ts
import mongoose, { Schema, Document, Types, model } from 'mongoose';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType, ProgressType } from '@/models/enums';
import { AutoMap } from 'automapper-classes';
import { baseQuestionSchema, IBaseQuestionDb, IQuestionDb, multiChoiceSchema, textSchema, trueFalseSchema } from './Question.db';



// Base Task Interface
export class IBaseTaskDb {
    @AutoMap()
    _id?: Types.ObjectId;
    @AutoMap()
    title!: string;
    @AutoMap()
    description!: string;
    @AutoMap(() => String)
    taskType!: TaskTypeEnum;
    @AutoMap()
    points!: number;
    @AutoMap()
    order!: number;
    @AutoMap()
    xpReward!: number;
    @AutoMap()
    requiredForCompletion!: boolean;
    @AutoMap()
    assignmentId!: Types.ObjectId;
    @AutoMap(() => [Types.ObjectId])
    prerequisites?: Types.ObjectId[];
    @AutoMap()
    maxAttempts?: number;
    submissionWindow!: {
        start: Date,
        end: Date,
        allowLateSubmissions: boolean,
        lateSubmissionPenalty: number  // percentage
    }
}

// File Upload Task Interface
export class IFileUploadTaskContentDb {
    @AutoMap(() => [String])
    allowedFileTypes!: string[];

    @AutoMap()
    maxFileSize!: number;
}

export class IFileUploadTaskDb extends IBaseTaskDb {
    @AutoMap(() => String)
    taskType!: TaskTypeEnum.FILE_UPLOAD;

    @AutoMap(() => IFileUploadTaskContentDb)
    content!: IFileUploadTaskContentDb;
}

// Question Task Interface
export class IQuestionTaskDb extends IBaseTaskDb {
    @AutoMap(() => String)
    taskType!: TaskTypeEnum.QUESTION;

    @AutoMap(() => IBaseQuestionDb)
    content!: IQuestionDb;
}

// Code Task Interface
export class ICodeTestCaseDb {
    @AutoMap()
    input!: string;

    @AutoMap()
    expectedOutput!: string;

    @AutoMap()
    isHidden?: boolean;
}

export class ICodeTaskContentDb {
    @AutoMap()
    question?: string;

    @AutoMap()
    language!: string;

    @AutoMap()
    initialCode?: string;

    @AutoMap(() => [ICodeTestCaseDb])
    testCases!: ICodeTestCaseDb[];
}

export class ICodeTaskDb extends IBaseTaskDb {
    @AutoMap(() => String)
    taskType!: TaskTypeEnum.CODE;

    @AutoMap(() => ICodeTaskContentDb)
    content!: ICodeTaskContentDb;
}

// Quiz Task Interface
export class IQuizTaskContentDb {
    @AutoMap(() => [IBaseQuestionDb])
    questions!: IQuestionDb[]

    @AutoMap()
    timeLimit?: number;

    @AutoMap()
    passingScore?: number;

    @AutoMap()
    maxAttempts?: number;
}

export class IQuizTaskDb extends IBaseTaskDb {
    @AutoMap(() => String)
    taskType!: TaskTypeEnum.QUIZ;

    @AutoMap(() => IQuizTaskContentDb)
    content!: IQuizTaskContentDb;
}

// Combined Task Type
export type ITaskDb = IFileUploadTaskDb | IQuestionTaskDb | ICodeTaskDb | IQuizTaskDb;



// Create the base task schema
const baseTaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    taskType: {
        type: String,
        enum: Object.values(TaskTypeEnum),
        required: true
    },
    points: { type: Number, required: true },
    order: { type: Number, required: true },
    xpReward: { type: Number, required: true },
    requiredForCompletion: { type: Boolean, default: false },
    assignmentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Assignment'
    },
    prerequisites: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    maxAttempts: { 
        type: Number, 
        default: -1  // -1 for unlimited
    },
    submissionWindow: {
        start: Date,
        end: Date,
        allowLateSubmissions: Boolean,
        lateSubmissionPenalty: Number  // number/points
    }
}, { discriminatorKey: 'taskType'});







// Create a question content schema that supports different question types
const questionContentSchema = baseQuestionSchema;

// Add discriminators for different question types
questionContentSchema.discriminator(QuestionType.MULTI_CHOICE, multiChoiceSchema);
questionContentSchema.discriminator(QuestionType.TRUE_FALSE, trueFalseSchema);
questionContentSchema.discriminator(QuestionType.TEXT, textSchema);


export type BaseTaskDocument = Document & IBaseTaskDb;
const BaseTask = model<BaseTaskDocument>('Task', baseTaskSchema);



// Task type discriminators
const QuestionTask = BaseTask.discriminator(
    TaskTypeEnum.QUESTION,
    new Schema({
        content: questionContentSchema
    })
);

const FileUploadTask = BaseTask.discriminator(
    TaskTypeEnum.FILE_UPLOAD,
    new Schema({
        content: {
            allowedFileTypes: { type: [String], required: true },
            maxFileSize: { type: Number, required: true }
        }
    })
);

const CodeTask = BaseTask.discriminator(
    TaskTypeEnum.CODE,
    new Schema({
        content: {
            question: { type: String },
            language: { type: String, required: true },
            initialCode: { type: String },
            testCases: {
                type: [{
                    input: { type: String, required: true },
                    expectedOutput: { type: String, required: true },
                    isHidden: { type: Boolean, default: false }
                }],
                required: true,
                validate: {
                    validator: function(testCases: any[]) {
                        return testCases.length > 0;
                    },
                    message: 'At least one test case is required'
                }
            }
        }
    })
);

const QuizTask = BaseTask.discriminator(
    TaskTypeEnum.QUIZ,
    new Schema({
        content: {
            questions: [questionContentSchema],
            timeLimit: Number,
            passingScore: Number,
            maxAttempts: Number
        }
    })
);


export default BaseTask;
