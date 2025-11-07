import mongoose, { Schema, Document, Types } from 'mongoose';
import { SubmissionStatus, TaskTypeEnum, ProgressTypeEnum, GradingStatus, SubmissionTypeEnum } from '@/models/enums';
import { baseAnswerSchema, IAnswerDb, IBaseAnswerDb, multiChoiceAnswerSchema, textAnswerSchema, trueFalseAnswerSchema } from './Answer.db';
import { ICodeTestCaseDb } from './Task.db';
import { gradeSchema, IGradeDb } from './Grade.db';


export class IBaseTaskSubmissionDb {
    _id?: Types.ObjectId;
    userId!: Types.ObjectId;
    assignmentId!: Types.ObjectId;
    taskId!: Types.ObjectId;
    taskType!: SubmissionTypeEnum;
    timeSpent?: number;             //TODO remove
    currentState!: {
        status: SubmissionStatus;
        attemptNumber: number;
        submittedAt: Date;
        content: any;
    };
    grade?: IGradeDb;
    version!: number;
    history!: Array<{
        submittedAt: Date;
        content: any;
        attemptNumber: number;
    }>;
}


export class IQuizSubmissionDb extends IBaseTaskSubmissionDb {
    taskType!: SubmissionTypeEnum.QUIZ_SUBMISSION;
    answers!: IAnswerDb[];
}


export class IQuestionSubmissionDb extends IBaseTaskSubmissionDb {
    taskType!: SubmissionTypeEnum.QUESTION_SUBMISSION;
    answer!: IAnswerDb;
}


export class IFileUploadSubmissionDb extends IBaseTaskSubmissionDb {
    taskType!: SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION;
    fileUrls!: string[];                    //TODO finish file submission, this not good
}


export class ICodeSubmissionDb extends IBaseTaskSubmissionDb {
    taskType!: SubmissionTypeEnum.CODE_SUBMISSION;
    code!: string;                          //TODO not string, code submission should be as files
}


export type ITaskSubmissionDb = 
    | IQuizSubmissionDb 
    | IQuestionSubmissionDb 
    | IFileUploadSubmissionDb 
    | ICodeSubmissionDb;




const baseTaskSubmissionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    taskType: {
        type: String,
        enum: Object.values(SubmissionTypeEnum),
        required: true
    },
    timeSpent: Number,
    currentState: {
        status: {
            type: String,
            enum: Object.values(SubmissionStatus),
            required: true
        },
        attemptNumber: Number,
        submittedAt: Date,
        content: Schema.Types.Mixed
    },
    grade: gradeSchema,
    history: [{
        submittedAt: Date,
        content: Schema.Types.Mixed,
        attemptNumber: Number,
        status: {
            type: String,
            enum: Object.values(SubmissionStatus)
        }
    }]
}, { 
    discriminatorKey: 'taskType',
    toObject: { virtuals: true, getters: true },
    timestamps: true 
});




// Create a schema for embedding multiple choice answers
const embeddedMultiChoiceAnswerSchema = new Schema({
    ...baseAnswerSchema.obj,
    selectedOptionIds: multiChoiceAnswerSchema.obj.selectedOptionIds
});

// Create a schema for embedding true/false answers
const embeddedTrueFalseAnswerSchema = new Schema({
    ...baseAnswerSchema.obj,
    answer: trueFalseAnswerSchema.obj.answer
});

// Create a schema for embedding text answers
const embeddedTextAnswerSchema = new Schema({
    ...baseAnswerSchema.obj,
    answer: textAnswerSchema.obj.answer
});

// Create a schema for embedding any type of answer using discriminators
const embeddedAnswerSchema = new Schema({
    ...baseAnswerSchema.obj
}, { discriminatorKey: 'questionType' });

// Add discriminators for the different answer types
embeddedAnswerSchema.discriminator(
    'MULTI_CHOICE',
    new Schema({ selectedOptionIds: multiChoiceAnswerSchema.obj.selectedOptionIds })
);

embeddedAnswerSchema.discriminator(
    'TRUE_FALSE',
    new Schema({ answer: trueFalseAnswerSchema.obj.answer })
);

embeddedAnswerSchema.discriminator(
    'TEXT',
    new Schema({ answer: textAnswerSchema.obj.answer })
);


const quizSubmissionSchema = new Schema({
    answers: [embeddedAnswerSchema]  // Embed answers directly in the quiz submission
});

const questionSubmissionSchema = new Schema({
    answer: embeddedAnswerSchema  // Embed a single answer directly in the question submission
});

const fileUploadSubmissionSchema = new Schema({
    fileUrls: {
        type: [String],
        required: true,
        validate: {
            validator: function(urls: string[]) {
                return urls.length > 0;
            },
            message: 'At least one file must be uploaded'
        }
    }
});

const codeSubmissionSchema = new Schema({
    code: { type: String, required: true },
});




baseTaskSubmissionSchema.set('toObject', {
    transform: function (doc, ret) {
        ret.id = ret._id === "" ? undefined : ret._id.toString();
        delete ret._id;
    },
});



embeddedAnswerSchema.set('toObject', {
    transform: function (doc, ret) {
        ret.id = ret._id === "" ? undefined : ret._id.toString();
        delete ret._id;
    },
});



export type BaseTaskSubmissionDocument = Document & IBaseTaskSubmissionDb;
const BaseTaskSubmission = mongoose.model<BaseTaskSubmissionDocument>('BaseTaskSubmission', baseTaskSubmissionSchema);
export default BaseTaskSubmission;



const QuizSubmission = mongoose.models[TaskTypeEnum.QUIZ] || 
BaseTaskSubmission.discriminator(
    SubmissionTypeEnum.QUIZ_SUBMISSION,
    quizSubmissionSchema
);

const QuestionSubmission = mongoose.models[TaskTypeEnum.QUESTION] ||  
BaseTaskSubmission.discriminator(
    SubmissionTypeEnum.QUESTION_SUBMISSION,
    questionSubmissionSchema
);

const FileUploadSubmission = mongoose.models[TaskTypeEnum.FILE_UPLOAD] ||  
BaseTaskSubmission.discriminator(
    SubmissionTypeEnum.FILE_UPLOAD_SUBMISSION,
    fileUploadSubmissionSchema
);

const CodeSubmission = mongoose.models[TaskTypeEnum.CODE] || 
BaseTaskSubmission.discriminator(
    SubmissionTypeEnum.CODE_SUBMISSION,
    codeSubmissionSchema
);

export {
    BaseTaskSubmission,
    QuizSubmission,
    QuestionSubmission,
    FileUploadSubmission,
    CodeSubmission
};