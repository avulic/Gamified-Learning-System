import mongoose, { Schema, Document, Types } from 'mongoose';
import { QuestionType } from '@/models/enums';

// Base Answer Interface
export class IBaseAnswerDb {
    _id?: Types.ObjectId;
    questionId!: Types.ObjectId;
    questionType!: QuestionType;
    submittedAt!: Date;
    isCorrect?: boolean;
    score?: number;
}

// Multiple Choice Answer
export class IMultiChoiceAnswerDb extends IBaseAnswerDb {
    questionType!: QuestionType.MULTI_CHOICE;
    selectedOptionIds!: string[];
}

// True/False Answer
export class ITrueFalseAnswerDb extends IBaseAnswerDb {
    questionType!: QuestionType.TRUE_FALSE;
    answer!: boolean;
}

// Text Answer
export class ITextAnswerDb extends IBaseAnswerDb {
    questionType!: QuestionType.TEXT;
    answer!: string;
}

// Combined Answer Type
export type IAnswerDb = IMultiChoiceAnswerDb | ITrueFalseAnswerDb | ITextAnswerDb;


export const baseAnswerSchema = new Schema({
    questionId: { 
        type: Schema.Types.ObjectId, 
        required: true 
    },
    questionType: { 
        type: String, 
        enum: Object.values(QuestionType), 
        required: true 
    },
    submittedAt: { 
        type: Date, 
        default: Date.now 
    },
    isCorrect: Boolean,
    score: Number
}, { 
    discriminatorKey: 'questionType',
    timestamps: true 
});


export const multiChoiceAnswerSchema = new Schema({
    selectedOptionIds: {
        type: [String],
        required: true,
        validate: {
            validator: function(options: string[]) {
                return options.length > 0;
            },
            message: 'At least one option must be selected'
        }
    }
});


export const trueFalseAnswerSchema = new Schema({
    answer: {
        type: Boolean,
        required: true
    }
});


export const textAnswerSchema = new Schema({
    answer: {
        type: String,
        required: true
    }
});
